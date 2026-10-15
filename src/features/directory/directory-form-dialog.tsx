import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import type { DirectoryEntry } from '@/api/directory/directory.types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { strings } from '@/constants/strings';
import { getErrorMessage, getFieldErrors } from '@/lib/get-error-message';

import type { DirectoryConfig } from './directory-config';
import { directoryFormSchema, emptyContact, type DirectoryFormValues } from './directory.schema';
import { useCreateDirectory, useUpdateDirectory } from './use-directory';

interface DirectoryFormDialogProps {
  config: DirectoryConfig;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Present = edit; absent = create. */
  entry?: DirectoryEntry | null;
  /** Called with the new row after a successful create (picker flows). */
  onCreated?: (entry: DirectoryEntry) => void;
}

export function DirectoryFormDialog({
  config,
  open,
  onOpenChange,
  entry,
  onCreated,
}: DirectoryFormDialogProps) {
  const mode = entry ? 'edit' : 'create';
  const createMutation = useCreateDirectory(config);
  const updateMutation = useUpdateDirectory(config);

  const {
    register,
    handleSubmit,
    reset,
    control,
    setError,
    formState: { errors },
  } = useForm<DirectoryFormValues>({
    resolver: zodResolver(directoryFormSchema),
    defaultValues: { company: '', country: '', contacts: [], notes: '' },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'contacts' });

  useEffect(() => {
    if (!open) return;
    reset({
      company: entry?.company ?? '',
      country: entry?.country ?? '',
      contacts:
        entry?.contacts.map((c) => ({ name: c.name, phone: c.phone, email: c.email })) ?? [],
      notes: entry?.notes ?? '',
    });
  }, [open, entry, reset]);

  const submitting = createMutation.isPending || updateMutation.isPending;

  const applyServerErrors = (error: unknown) => {
    const fieldErrors = getFieldErrors(error);
    let mapped = false;
    for (const [field, message] of Object.entries(fieldErrors)) {
      if (field === 'company' || field === 'country' || field === 'notes') {
        setError(field, { message });
        mapped = true;
      }
    }
    if (!mapped) toast.error(getErrorMessage(error));
  };

  const onSubmit = (values: DirectoryFormValues) => {
    const payload = {
      company: values.company.trim(),
      country: values.country.trim() || undefined,
      notes: values.notes.trim() || undefined,
      contacts: values.contacts.map((c) => ({
        name: c.name.trim(),
        phone: c.phone.trim(),
        email: c.email.trim(),
      })),
    };

    if (mode === 'create') {
      createMutation.mutate(payload, {
        onSuccess: (created) => {
          toast.success(strings.directory.created(config.noun));
          onCreated?.(created);
          onOpenChange(false);
        },
        onError: applyServerErrors,
      });
    } else if (entry) {
      updateMutation.mutate(
        { id: entry.id, body: payload },
        {
          onSuccess: () => {
            toast.success(strings.directory.updated(config.noun));
            onOpenChange(false);
          },
          onError: applyServerErrors,
        },
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create'
              ? strings.directory.create(config.noun)
              : strings.directory.edit(config.noun)}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? strings.directory.createSubtitle(config.noun)
              : strings.directory.editSubtitle(config.noun)}
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-2">
            <Label htmlFor="dir-company">{strings.directory.company}</Label>
            <Input id="dir-company" aria-invalid={Boolean(errors.company)} {...register('company')} />
            {errors.company && <p className="text-sm text-destructive">{errors.company.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dir-country">{strings.directory.country}</Label>
            <Input id="dir-country" aria-invalid={Boolean(errors.country)} {...register('country')} />
            {errors.country && <p className="text-sm text-destructive">{errors.country.message}</p>}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>{strings.directory.contacts}</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ ...emptyContact })}
                disabled={fields.length >= 10}
              >
                <Plus className="size-4" />
                {strings.directory.addContact}
              </Button>
            </div>

            {fields.length === 0 && (
              <p className="rounded-md border border-dashed border-border px-3 py-4 text-center text-sm text-muted-foreground">
                {strings.directory.noContacts}
              </p>
            )}

            {fields.map((field, index) => (
              <div key={field.id} className="space-y-2 rounded-md border border-border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">#{index + 1}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-7 text-muted-foreground hover:text-destructive"
                    onClick={() => remove(index)}
                    aria-label={strings.directory.removeContact}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
                <div className="grid gap-2 sm:grid-cols-3">
                  <div className="space-y-1">
                    <Input
                      placeholder={strings.directory.contactName}
                      aria-invalid={Boolean(errors.contacts?.[index]?.name)}
                      {...register(`contacts.${index}.name` as const)}
                    />
                    {errors.contacts?.[index]?.name && (
                      <p className="text-xs text-destructive">
                        {errors.contacts[index]?.name?.message}
                      </p>
                    )}
                  </div>
                  <Input
                    placeholder={strings.directory.contactPhone}
                    dir="ltr"
                    {...register(`contacts.${index}.phone` as const)}
                  />
                  <div className="space-y-1">
                    <Input
                      placeholder={strings.directory.contactEmail}
                      dir="ltr"
                      aria-invalid={Boolean(errors.contacts?.[index]?.email)}
                      {...register(`contacts.${index}.email` as const)}
                    />
                    {errors.contacts?.[index]?.email && (
                      <p className="text-xs text-destructive">
                        {errors.contacts[index]?.email?.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dir-notes">{strings.directory.notes}</Label>
            <textarea
              id="dir-notes"
              rows={3}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
              {...register('notes')}
            />
            {errors.notes && <p className="text-sm text-destructive">{errors.notes.message}</p>}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={submitting}>
              {submitting ? strings.common.saving : strings.common.save}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              {strings.common.cancel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

import { Plus, Trash2 } from 'lucide-react';
import type { Control, FieldErrors, UseFieldArrayReturn } from 'react-hook-form';
import { Controller } from 'react-hook-form';

import {
  PROJECT_ITEM_CONDUCTORS,
  PROJECT_ITEM_PLATINGS,
  PROJECT_ITEM_POLES,
  PROJECT_ITEM_RATINGS,
  PROJECT_ITEM_TYPES,
} from '@/api/projects/project-enums';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { strings } from '@/constants/strings';

import type { ProjectFormValues } from './project.schema';

interface ProjectQuantitiesTableProps {
  control: Control<ProjectFormValues>;
  fields: UseFieldArrayReturn<ProjectFormValues, 'items'>['fields'];
  append: UseFieldArrayReturn<ProjectFormValues, 'items'>['append'];
  remove: UseFieldArrayReturn<ProjectFormValues, 'items'>['remove'];
  errors: FieldErrors<ProjectFormValues>;
  disabled?: boolean;
}

export function ProjectQuantitiesTable({
  control,
  fields,
  append,
  remove,
  errors,
  disabled = false,
}: ProjectQuantitiesTableProps) {
  const itemErrors = errors.items;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={disabled}
          onClick={() =>
            append({
              itemType: 'Sandwich Busbar',
              rating: '800A',
              conductor: 'Copper',
              plating: 'Tin',
              poles: '4',
              meters: '',
              meterPrice: '',
            })
          }
        >
          <Plus />
          {strings.projects.addQuantityLine}
        </Button>
      </div>

      {fields.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-10 text-center text-sm text-muted-foreground">
          {strings.projects.quantitiesEmpty}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border/60 bg-background/50">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead>{strings.projects.itemType}</TableHead>
                <TableHead>{strings.projects.rating}</TableHead>
                <TableHead>{strings.projects.conductor}</TableHead>
                <TableHead>{strings.projects.plating}</TableHead>
                <TableHead>{strings.projects.poles}</TableHead>
                <TableHead>{strings.projects.meters}</TableHead>
                <TableHead>{strings.projects.meterPrice}</TableHead>
                <TableHead className="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {fields.map((field, index) => (
                <Controller
                  key={field.id}
                  control={control}
                  name={`items.${index}.allocatedClearedQuantityScaled`}
                  render={({ field: { value: clearedScaled } }) => {
                    const locked = (clearedScaled ?? 0) > 0;
                    const rowDisabled = disabled || locked;
                    return (
                      <TableRow className="hover:bg-muted/30">
                        <TableCell className="min-w-[140px]">
                          <Controller
                            control={control}
                            name={`items.${index}.itemType`}
                            render={({ field: f }) => (
                              <Select
                                value={f.value}
                                onValueChange={f.onChange}
                                disabled={rowDisabled}
                              >
                                <SelectTrigger className="h-9 w-full bg-background">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {PROJECT_ITEM_TYPES.map((t) => (
                                    <SelectItem key={t} value={t}>
                                      {t}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </TableCell>
                        <TableCell className="min-w-[100px]">
                          <Controller
                            control={control}
                            name={`items.${index}.rating`}
                            render={({ field: f }) => (
                              <Select
                                value={f.value}
                                onValueChange={f.onChange}
                                disabled={rowDisabled}
                              >
                                <SelectTrigger className="h-9 w-full bg-background">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {PROJECT_ITEM_RATINGS.map((r) => (
                                    <SelectItem key={r} value={r}>
                                      {r}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <Controller
                            control={control}
                            name={`items.${index}.conductor`}
                            render={({ field: f }) => (
                              <Select
                                value={f.value}
                                onValueChange={f.onChange}
                                disabled={rowDisabled}
                              >
                                <SelectTrigger className="h-9 w-full bg-background">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {PROJECT_ITEM_CONDUCTORS.map((c) => (
                                    <SelectItem key={c} value={c}>
                                      {c}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <Controller
                            control={control}
                            name={`items.${index}.plating`}
                            render={({ field: f }) => (
                              <Select
                                value={f.value}
                                onValueChange={f.onChange}
                                disabled={rowDisabled}
                              >
                                <SelectTrigger className="h-9 w-full bg-background">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {PROJECT_ITEM_PLATINGS.map((p) => (
                                    <SelectItem key={p} value={p}>
                                      {p}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <Controller
                            control={control}
                            name={`items.${index}.poles`}
                            render={({ field: f }) => (
                              <Select
                                value={f.value}
                                onValueChange={f.onChange}
                                disabled={rowDisabled}
                              >
                                <SelectTrigger className="h-9 w-[72px] bg-background">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {PROJECT_ITEM_POLES.map((p) => (
                                    <SelectItem key={p} value={p}>
                                      {p}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <Controller
                            control={control}
                            name={`items.${index}.meters`}
                            render={({ field: f }) => (
                              <Input
                                {...f}
                                className="h-9 bg-background"
                                disabled={disabled}
                                aria-invalid={Boolean(itemErrors?.[index]?.meters)}
                              />
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <Controller
                            control={control}
                            name={`items.${index}.meterPrice`}
                            render={({ field: f }) => (
                              <Input
                                {...f}
                                className="h-9 bg-background"
                                disabled={rowDisabled}
                                aria-invalid={Boolean(itemErrors?.[index]?.meterPrice)}
                              />
                            )}
                          />
                        </TableCell>
                        <TableCell className="align-top">
                          <div className="flex flex-col items-start gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-8"
                              aria-label={strings.common.delete}
                              disabled={disabled || locked}
                              onClick={() => remove(index)}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                            {locked && (
                              <Badge variant="outline" className="text-[10px] font-normal">
                                {strings.projects.quantityLineLocked}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  }}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

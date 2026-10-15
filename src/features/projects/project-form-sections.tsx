import type { Control, FieldErrors, UseFieldArrayReturn, UseFormRegister } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import {
  Building2,
  CalendarClock,
  FileCheck,
  Layers,
  ListTodo,
  Users,
} from 'lucide-react';

import { PROJECT_DEPARTMENTS, PROJECT_OPERATIONAL_STATUSES } from '@/api/projects/project-enums';
import { Combobox } from '@/components/common/combobox';
import { ContractorCombobox } from '@/features/contractors/contractor-combobox';
import { DateField } from '@/components/common/date-field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { strings } from '@/constants/strings';
import type { ComboboxOption } from '@/components/common/combobox';
import { SalespersonMultiSelect } from '@/features/crm/salesperson-multi-select';

import { ProjectFormField } from './ui/project-form-field';
import { ProjectFormSection } from './ui/project-form-section';
import { ProjectQuantitiesTable } from './project-quantities-table';
import type { ProjectFormValues } from './project.schema';

interface ProjectFormSectionsProps {
  control: Control<ProjectFormValues>;
  register: UseFormRegister<ProjectFormValues>;
  errors: FieldErrors<ProjectFormValues>;
  isEdit: boolean;
  formLocked: boolean;
  quantitiesLocked: boolean;
  consultantOptions: ComboboxOption[];
  userOptions: ComboboxOption[];
  fields: UseFieldArrayReturn<ProjectFormValues, 'items'>['fields'];
  append: UseFieldArrayReturn<ProjectFormValues, 'items'>['append'];
  remove: UseFieldArrayReturn<ProjectFormValues, 'items'>['remove'];
}

export function ProjectFormSections({
  control,
  register,
  errors,
  isEdit,
  formLocked,
  quantitiesLocked,
  consultantOptions,
  userOptions,
  fields,
  append,
  remove,
}: ProjectFormSectionsProps) {
  return (
    <div className="space-y-6">
      <ProjectFormSection
        id="identity"
        icon={Building2}
        title={strings.projects.sectionIdentity}
        description={strings.projects.sectionIdentityHint}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <ProjectFormField
            label={strings.projects.name}
            htmlFor="project-name"
            error={errors.name?.message}
            className="sm:col-span-2"
          >
            <Input
              id="project-name"
              disabled={formLocked}
              aria-invalid={Boolean(errors.name)}
              {...register('name')}
            />
          </ProjectFormField>
          {!isEdit && (
            <ProjectFormField label={strings.projects.type} htmlFor="project-type">
              <Controller
                control={control}
                name="type"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="project-type" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Tender">Tender</SelectItem>
                      <SelectItem value="In Hand">In Hand</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </ProjectFormField>
          )}
          <ProjectFormField label={strings.projects.customer} htmlFor="project-customer">
            <Input id="project-customer" disabled={formLocked} {...register('customer')} />
          </ProjectFormField>
          <ProjectFormField label={strings.projects.site} htmlFor="project-site">
            <Input id="project-site" disabled={formLocked} {...register('site')} />
          </ProjectFormField>
          <ProjectFormField label={strings.projects.country} htmlFor="project-country">
            <Input id="project-country" disabled={formLocked} {...register('country')} />
          </ProjectFormField>
          <ProjectFormField label={strings.projects.city} htmlFor="project-city">
            <Input id="project-city" disabled={formLocked} {...register('city')} />
          </ProjectFormField>
        </div>
      </ProjectFormSection>

      <ProjectFormSection
        id="parties"
        icon={Users}
        title={strings.projects.sectionParties}
        description={strings.projects.sectionPartiesHint}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <ProjectFormField
            label={strings.projects.consultant}
            error={errors.consultantId?.message}
          >
            <Controller
              control={control}
              name="consultantId"
              render={({ field }) => (
                <Combobox
                  options={consultantOptions}
                  value={field.value || null}
                  onChange={(value) => field.onChange(value ?? '')}
                  disabled={formLocked}
                  placeholder={strings.projects.selectConsultant}
                  aria-invalid={Boolean(errors.consultantId)}
                />
              )}
            />
          </ProjectFormField>
          <ProjectFormField label={strings.projects.contractor}>
            <Controller
              control={control}
              name="contractorId"
              render={({ field }) => (
                <ContractorCombobox
                  value={field.value || null}
                  onChange={(value) => field.onChange(value ?? '')}
                  disabled={formLocked}
                  placeholder={strings.projects.selectContractor}
                />
              )}
            />
          </ProjectFormField>
          <ProjectFormField label={strings.projects.executionOwner}>
            <Controller
              control={control}
              name="executionOwnerId"
              render={({ field }) => (
                <Combobox
                  options={userOptions}
                  value={field.value || null}
                  onChange={(value) => field.onChange(value ?? '')}
                  disabled={formLocked}
                  placeholder={strings.projects.selectOwner}
                />
              )}
            />
          </ProjectFormField>
          <ProjectFormField label={strings.projects.department}>
            <Controller
              control={control}
              name="department"
              render={({ field }) => (
                <Select
                  value={field.value || 'none'}
                  onValueChange={(v) => field.onChange(v === 'none' ? '' : v)}
                  disabled={formLocked}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={strings.common.none} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{strings.common.none}</SelectItem>
                    {PROJECT_DEPARTMENTS.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </ProjectFormField>
          <ProjectFormField
            label={strings.projects.salesOwners}
            error={errors.salesPersonIds?.message}
            className="sm:col-span-2"
          >
            <Controller
              control={control}
              name="salesPersonIds"
              render={({ field }) => (
                <SalespersonMultiSelect
                  aria-invalid={Boolean(errors.salesPersonIds)}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </ProjectFormField>
        </div>
      </ProjectFormSection>

      <ProjectFormSection
        id="poStatus"
        icon={FileCheck}
        title={strings.projects.sectionPoStatus}
        description={strings.projects.sectionPoStatusHint}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <ProjectFormField label={strings.projects.poContractRef} htmlFor="po-ref">
            <Input id="po-ref" disabled={formLocked} {...register('poContractRef')} />
          </ProjectFormField>
          <ProjectFormField label={strings.projects.operationalStatus}>
            <Controller
              control={control}
              name="operationalStatus"
              render={({ field }) => (
                <Select
                  value={field.value || 'none'}
                  onValueChange={(v) => field.onChange(v === 'none' ? '' : v)}
                  disabled={formLocked}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={strings.common.none} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{strings.common.none}</SelectItem>
                    {PROJECT_OPERATIONAL_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </ProjectFormField>
          <ProjectFormField label={strings.projects.poDate} htmlFor="po-date">
            <DateField id="po-date" disabled={quantitiesLocked} {...register('poDate')} />
          </ProjectFormField>
          <ProjectFormField label={strings.projects.manufacturingClearance} htmlFor="mfg-clear">
            <DateField
              id="mfg-clear"
              disabled={quantitiesLocked}
              {...register('manufacturingClearanceOn')}
            />
          </ProjectFormField>
          <ProjectFormField label={strings.projects.paymentDue} htmlFor="payment-due">
            <DateField id="payment-due" disabled={quantitiesLocked} {...register('paymentDueOn')} />
          </ProjectFormField>
        </div>
      </ProjectFormSection>

      <ProjectFormSection
        id="nextAction"
        icon={ListTodo}
        title={strings.projects.sectionNextAction}
        description={strings.projects.sectionNextActionHint}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <ProjectFormField label={strings.projects.nextAction} htmlFor="next-action" className="sm:col-span-2">
            <Input id="next-action" disabled={formLocked} {...register('nextAction')} />
          </ProjectFormField>
          <ProjectFormField label={strings.projects.actionOwner}>
            <Controller
              control={control}
              name="actionOwnerId"
              render={({ field }) => (
                <Combobox
                  options={userOptions}
                  value={field.value || null}
                  onChange={(value) => field.onChange(value ?? '')}
                  disabled={formLocked}
                  placeholder={strings.projects.selectOwner}
                />
              )}
            />
          </ProjectFormField>
          <ProjectFormField label={strings.projects.actionDue} htmlFor="action-due">
            <DateField id="action-due" disabled={formLocked} {...register('actionDueOn')} />
          </ProjectFormField>
        </div>
      </ProjectFormSection>

      <ProjectFormSection
        id="milestones"
        icon={CalendarClock}
        title={strings.projects.sectionMilestones}
        description={strings.projects.sectionMilestonesHint}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <ProjectFormField label={strings.projects.drawingSubmitted} htmlFor="draw-sub">
            <DateField id="draw-sub" disabled={quantitiesLocked} {...register('drawingSubmittedOn')} />
          </ProjectFormField>
          <ProjectFormField
            label={strings.projects.drawingApproved}
            htmlFor="draw-appr"
            error={errors.drawingApprovedOn?.message}
          >
            <DateField
              id="draw-appr"
              disabled={quantitiesLocked}
              aria-invalid={Boolean(errors.drawingApprovedOn)}
              {...register('drawingApprovedOn')}
            />
          </ProjectFormField>
          <ProjectFormField label={strings.projects.productionRequired} htmlFor="prod-req">
            <DateField id="prod-req" disabled={quantitiesLocked} {...register('productionRequiredOn')} />
          </ProjectFormField>
          <ProjectFormField label={strings.projects.deliveryTarget} htmlFor="del-target">
            <DateField id="del-target" disabled={quantitiesLocked} {...register('deliveryTargetOn')} />
          </ProjectFormField>
          <ProjectFormField label={strings.projects.expectedClose} htmlFor="expected-close">
            <DateField id="expected-close" disabled={formLocked} {...register('expectedClosingDate')} />
          </ProjectFormField>
          <ProjectFormField label={strings.projects.notes} htmlFor="project-notes" className="sm:col-span-2">
            <Textarea id="project-notes" rows={3} disabled={formLocked} {...register('notes')} />
          </ProjectFormField>
        </div>
      </ProjectFormSection>

      <ProjectFormSection
        id="quantities"
        icon={Layers}
        title={strings.projects.sectionQuantities}
        description={strings.projects.sectionQuantitiesHint}
      >
        <ProjectQuantitiesTable
          control={control}
          fields={fields}
          append={append}
          remove={remove}
          errors={errors}
          disabled={quantitiesLocked}
        />
      </ProjectFormSection>
    </div>
  );
}

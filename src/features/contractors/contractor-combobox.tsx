import { Plus } from 'lucide-react';
import { useState } from 'react';

import { Combobox, type ComboboxOption } from '@/components/common/combobox';
import { PermissionGate } from '@/components/common/permission-gate';
import { Button } from '@/components/ui/button';
import { PERMISSIONS } from '@/constants/permissions';
import { strings } from '@/constants/strings';
import { useContractorOptions } from '@/features/crm/lookups';
import { contractorsConfig } from '@/features/directory/directory-config';
import { DirectoryFormDialog } from '@/features/directory/directory-form-dialog';

type ContractorComboboxProps = {
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  'aria-invalid'?: boolean;
  clearable?: boolean;
  /** Override options (default: active contractors from API). */
  options?: ComboboxOption[];
};

/**
 * Contractor picker with inline “Add contractor” in the dropdown (persists via POST /contractors).
 */
export function ContractorCombobox({
  value,
  onChange,
  placeholder = strings.opportunities.selectContractor,
  options: optionsOverride,
  ...rest
}: ContractorComboboxProps) {
  const defaultOptions = useContractorOptions();
  const options = optionsOverride ?? defaultOptions;
  const [createOpen, setCreateOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const listFooter = (
    <PermissionGate permission={PERMISSIONS.contractors.create}>
      <Button
        type="button"
        variant="ghost"
        className="h-9 w-full justify-start gap-2 font-normal"
        onClick={() => {
          setPopoverOpen(false);
          setCreateOpen(true);
        }}
      >
        <Plus className="size-4" />
        {strings.contractors.addFromList}
      </Button>
    </PermissionGate>
  );

  return (
    <>
      <Combobox
        {...rest}
        options={options}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        listFooter={listFooter}
        open={popoverOpen}
        onOpenChange={setPopoverOpen}
      />
      <DirectoryFormDialog
        config={contractorsConfig}
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(entry) => onChange(entry.id)}
      />
    </>
  );
}

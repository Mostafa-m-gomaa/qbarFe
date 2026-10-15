import { MultiCombobox } from '@/components/common/combobox';

import { useActiveUserOptions } from './lookups';

interface SalespersonMultiSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  id?: string;
  'aria-invalid'?: boolean;
}

/** Multi-select of active users, used for a project's sales owners (salesPersonIds). */
export function SalespersonMultiSelect({
  value,
  onChange,
  id,
  'aria-invalid': ariaInvalid,
}: SalespersonMultiSelectProps) {
  const options = useActiveUserOptions();
  return (
    <MultiCombobox
      id={id}
      aria-invalid={ariaInvalid}
      options={options}
      value={value}
      onChange={onChange}
      placeholder="Select salespeople"
    />
  );
}

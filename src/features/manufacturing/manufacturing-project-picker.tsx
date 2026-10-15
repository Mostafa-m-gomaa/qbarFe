import { Combobox } from '@/components/common/combobox';
import type { ComboboxOption } from '@/components/common/combobox';
import { strings } from '@/constants/strings';

interface ManufacturingProjectPickerProps {
  projectId: string | null;
  onProjectIdChange: (id: string | null) => void;
  options: ComboboxOption[];
}

export function ManufacturingProjectPicker({
  projectId,
  onProjectIdChange,
  options,
}: ManufacturingProjectPickerProps) {
  return (
    <div className="max-w-md space-y-1">
      <p className="text-sm font-medium">{strings.manufacturing.selectProject}</p>
      <Combobox
        options={options}
        value={projectId}
        onChange={onProjectIdChange}
        placeholder={strings.manufacturing.selectProject}
        emptyText={strings.common.noResults}
      />
      <p className="text-xs text-muted-foreground">{strings.manufacturing.selectProjectHint}</p>
    </div>
  );
}

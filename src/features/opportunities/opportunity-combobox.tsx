import { useMemo } from 'react';

import type { Opportunity } from '@/api/opportunities/opportunities.types';
import { Combobox } from '@/components/common/combobox';
import { strings } from '@/constants/strings';

import { opportunityComboboxOption } from './opportunity-label';
import { useOpportunities, useOpportunity } from './use-opportunities';

type OpportunityComboboxProps = {
  value: string | null;
  onChange: (value: string | null) => void;
  /** Called when the selected opportunity record is known (from the loaded list). */
  onOpportunityChange?: (opportunity: Opportunity | null) => void;
  /** Filter list to opportunities with a non-archived quotation for this contractor. */
  contractorId?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  'aria-invalid'?: boolean;
  clearable?: boolean;
};

export function OpportunityCombobox({
  value,
  onChange,
  onOpportunityChange,
  contractorId,
  placeholder = strings.quotations.selectOpportunity,
  ...rest
}: OpportunityComboboxProps) {
  const { data } = useOpportunities(
    {
      lifecycle: 'active',
      limit: 100,
      page: 1,
      ...(contractorId ? { contractorId } : {}),
    },
    true,
  );

  const opportunities = data?.items ?? [];
  const missingSelected = Boolean(value && !opportunities.some((o) => o.id === value));
  const { data: fetchedSelected } = useOpportunity(missingSelected ? value! : undefined);

  const oppById = useMemo(() => {
    const map = new Map(opportunities.map((o) => [o.id, o]));
    if (fetchedSelected) map.set(fetchedSelected.id, fetchedSelected);
    return map;
  }, [opportunities, fetchedSelected]);

  const options = useMemo(() => {
    const fromList = opportunities.map(opportunityComboboxOption);
    if (fetchedSelected && !fromList.some((o) => o.value === fetchedSelected.id)) {
      return [opportunityComboboxOption(fetchedSelected), ...fromList];
    }
    return fromList;
  }, [opportunities, fetchedSelected]);

  return (
    <Combobox
      {...rest}
      options={options}
      value={value}
      onChange={(next) => {
        onChange(next);
        onOpportunityChange?.(next ? (oppById.get(next) ?? null) : null);
      }}
      placeholder={placeholder}
    />
  );
}

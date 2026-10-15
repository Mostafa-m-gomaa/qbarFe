import { useEffect, useId, useState } from 'react';

import type { AdditionalCost } from '@/api/quotations/quotations.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { strings } from '@/constants/strings';
import { asciiNumericFieldProps, sanitizeAsciiNumericInput } from '@/lib/quotation-decimals';

import {
  additionalCostToForm,
  mergeAdditionalCostAtIndex,
  parseAdditionalCostRow,
  type AdditionalCostFormRow,
} from './additional-costs-editor.utils';

interface LocalDraft {
  id: string;
  description: string;
  amountText: string;
  error?: string;
}

interface AdditionalCostsEditorProps {
  costs: AdditionalCost[];
  readOnly: boolean;
  onChange: (costs: AdditionalCost[]) => void;
}

export function AdditionalCostsEditor({ costs, readOnly, onChange }: AdditionalCostsEditorProps) {
  const baseId = useId();
  const [savedForms, setSavedForms] = useState<AdditionalCostFormRow[]>(() =>
    costs.map(additionalCostToForm),
  );
  const [savedErrors, setSavedErrors] = useState<Record<number, string>>({});
  const [drafts, setDrafts] = useState<LocalDraft[]>([]);

  useEffect(() => {
    setSavedForms(costs.map(additionalCostToForm));
    setSavedErrors({});
  }, [costs]);

  const updateSavedForm = (index: number, patch: Partial<AdditionalCostFormRow>) => {
    setSavedForms((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
    setSavedErrors((prev) => {
      if (!(index in prev)) return prev;
      const next = { ...prev };
      delete next[index];
      return next;
    });
  };

  const saveSavedRow = (index: number) => {
    const form = savedForms[index];
    if (!form) return;
    const parsed = parseAdditionalCostRow(form.description, form.amountText);
    if (!parsed.ok) {
      setSavedErrors((prev) => ({ ...prev, [index]: parsed.message }));
      return;
    }
    onChange(mergeAdditionalCostAtIndex(costs, savedForms, index, parsed.row));
  };

  const deleteSavedRow = (index: number) => {
    onChange(costs.filter((_, i) => i !== index));
  };

  const addDraft = () => {
    setDrafts((prev) => [
      ...prev,
      { id: `${baseId}-draft-${prev.length}`, description: '', amountText: '' },
    ]);
  };

  const saveDraft = (draftId: string) => {
    const draft = drafts.find((d) => d.id === draftId);
    if (!draft) return;
    const parsed = parseAdditionalCostRow(draft.description, draft.amountText);
    if (!parsed.ok) {
      setDrafts((prev) =>
        prev.map((d) => (d.id === draftId ? { ...d, error: parsed.message } : d)),
      );
      return;
    }
    onChange([...costs, parsed.row]);
    setDrafts((prev) => prev.filter((d) => d.id !== draftId));
  };

  const removeDraft = (draftId: string) => {
    setDrafts((prev) => prev.filter((d) => d.id !== draftId));
  };

  return (
    <div className="space-y-2">
      <Label>{strings.quotations.additionalCosts}</Label>
      {savedForms.map((form, index) => (
        <div key={`saved-${index}`} className="space-y-1">
          <div className="flex flex-wrap items-start gap-2">
            <Input
              className="min-w-[140px] flex-1"
              placeholder={strings.quotations.costDescription}
              value={form.description}
              disabled={readOnly}
              onChange={(e) => updateSavedForm(index, { description: e.target.value })}
            />
            <Input
              className="w-28"
              placeholder={strings.quotations.costAmount}
              value={form.amountText}
              disabled={readOnly}
              {...asciiNumericFieldProps(2)}
              onChange={(e) =>
                updateSavedForm(index, {
                  amountText: sanitizeAsciiNumericInput(e.target.value, 2),
                })
              }
            />
            {!readOnly && (
              <>
                <Button type="button" size="sm" variant="secondary" onClick={() => saveSavedRow(index)}>
                  {strings.common.save}
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => deleteSavedRow(index)}>
                  {strings.common.delete}
                </Button>
              </>
            )}
          </div>
          {savedErrors[index] && (
            <p className="text-sm text-destructive">{savedErrors[index]}</p>
          )}
        </div>
      ))}

      {drafts.map((draft) => (
        <div key={draft.id} className="space-y-1 rounded-md border border-dashed border-border p-2">
          <div className="flex flex-wrap items-start gap-2">
            <Input
              className="min-w-[140px] flex-1"
              placeholder={strings.quotations.costDescription}
              value={draft.description}
              onChange={(e) =>
                setDrafts((prev) =>
                  prev.map((d) =>
                    d.id === draft.id ? { ...d, description: e.target.value, error: undefined } : d,
                  ),
                )
              }
            />
            <Input
              className="w-28"
              placeholder={strings.quotations.costAmount}
              value={draft.amountText}
              {...asciiNumericFieldProps(2)}
              onChange={(e) =>
                setDrafts((prev) =>
                  prev.map((d) =>
                    d.id === draft.id
                      ? {
                          ...d,
                          amountText: sanitizeAsciiNumericInput(e.target.value, 2),
                          error: undefined,
                        }
                      : d,
                  ),
                )
              }
            />
            <Button type="button" size="sm" variant="secondary" onClick={() => saveDraft(draft.id)}>
              {strings.common.save}
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => removeDraft(draft.id)}>
              {strings.common.cancel}
            </Button>
          </div>
          {draft.error && <p className="text-sm text-destructive">{draft.error}</p>}
        </div>
      ))}

      {!readOnly && (
        <Button type="button" size="sm" variant="outline" onClick={addDraft}>
          {strings.quotations.addAdditionalCost}
        </Button>
      )}
    </div>
  );
}

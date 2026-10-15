import type { QuotationRevision, UpdateQuotationRequest } from '@/api/quotations/quotations.types';
import { MoneyText } from '@/components/common/money-text';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { strings } from '@/constants/strings';
import { ProjectDetailSection } from '@/features/projects/ui/project-detail-section';
import { usePermission } from '@/hooks/use-permission';
import { PERMISSIONS } from '@/constants/permissions';
import { totalsHasCostFields } from '@/features/quotations/quotation-revision.utils';
import { asciiNumericFieldProps, parsePercentInput, PERCENT_SCALE } from '@/lib/quotation-decimals';
import { Calculator } from 'lucide-react';

import { AdditionalCostsEditor } from './additional-costs-editor';

interface QuotationSummarySectionProps {
  revision: QuotationRevision;
  readOnly: boolean;
  onPatch: (body: Omit<UpdateQuotationRequest, 'expectedRevisionVersion'>) => void;
}

export function QuotationSummarySection({
  revision,
  readOnly,
  onPatch,
}: QuotationSummarySectionProps) {
  const canViewCost = usePermission(PERMISSIONS.quotations.viewCost);
  const totals = revision.totals;
  const withCost = canViewCost && totalsHasCostFields(totals) && 'marginPercent' in totals;

  const discountDisplay =
    revision.discountType === 'percent'
      ? (revision.discountValueScaled / 10_000).toFixed(4)
      : revision.discountType === 'lump'
        ? String(revision.discountValueScaled / 100)
        : '';

  return (
    <ProjectDetailSection icon={Calculator} title={strings.quotations.commercialSummary}>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{strings.quotations.discountType}</Label>
            <Select
              value={revision.discountType}
              disabled={readOnly}
              onValueChange={(discountType) =>
                onPatch({ discountType: discountType as QuotationRevision['discountType'] })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{strings.quotations.discountNone}</SelectItem>
                <SelectItem value="percent">{strings.quotations.discountPercent}</SelectItem>
                <SelectItem value="lump">{strings.quotations.discountLump}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {revision.discountType !== 'none' && (
            <div className="space-y-2">
              <Label>{strings.quotations.discountValue}</Label>
              <Input
                key={`${revision.version}-${revision.discountType}`}
                defaultValue={discountDisplay}
                disabled={readOnly}
                {...asciiNumericFieldProps(
                  revision.discountType === 'percent' ? PERCENT_SCALE : 2,
                )}
                onBlur={(e) => {
                  if (revision.discountType === 'percent') {
                    onPatch({ discountPercent: parsePercentInput(e.target.value) });
                  } else {
                    const n = Number(e.target.value);
                    if (Number.isFinite(n)) onPatch({ discountAmountMinor: Math.round(n * 100) });
                  }
                }}
              />
            </div>
          )}
          {!revision.installationIncluded && (
            <div className="space-y-2">
              <Label>{strings.quotations.installationPercent}</Label>
              <Input
                defaultValue={revision.installationPercent}
                disabled={readOnly}
                {...asciiNumericFieldProps(PERCENT_SCALE)}
                onBlur={(e) =>
                  onPatch({ installationPercent: parsePercentInput(e.target.value) })
                }
              />
            </div>
          )}
          {canViewCost && (
            <div className="space-y-3 rounded-lg border border-dashed p-3">
              <Label>{strings.quotations.installationCostMode}</Label>
              <Select
                value={revision.installationCostMode ?? 'percent'}
                disabled={readOnly}
                onValueChange={(installationCostMode) =>
                  onPatch({
                    installationCostMode: installationCostMode as NonNullable<
                      QuotationRevision['installationCostMode']
                    >,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percent">{strings.quotations.installationCostPercentMode}</SelectItem>
                  <SelectItem value="manual">{strings.quotations.installationCostManualMode}</SelectItem>
                </SelectContent>
              </Select>
              {(revision.installationCostMode ?? 'percent') === 'percent' ? (
                <div className="space-y-2">
                  <Label>{strings.quotations.installationCostPercent}</Label>
                  <Input
                    defaultValue={
                      revision.installationCostPercentScaled !== undefined
                        ? (revision.installationCostPercentScaled / 10_000).toFixed(4)
                        : ''
                    }
                    disabled={readOnly}
                    {...asciiNumericFieldProps(PERCENT_SCALE)}
                    onBlur={(e) =>
                      onPatch({ installationCostPercent: parsePercentInput(e.target.value) })
                    }
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>{strings.quotations.installationCostAmount}</Label>
                  <Input
                    defaultValue={
                      revision.installationCostAmountMinor !== undefined
                        ? String((revision.installationCostAmountMinor ?? 0) / 100)
                        : ''
                    }
                    disabled={readOnly}
                    {...asciiNumericFieldProps(2)}
                    onBlur={(e) => {
                      const n = Number(e.target.value);
                      if (Number.isFinite(n)) {
                        onPatch({ installationCostAmountMinor: Math.round(n * 100) });
                      }
                    }}
                  />
                </div>
              )}
              <AdditionalCostsEditor
                costs={revision.additionalCosts ?? []}
                readOnly={readOnly}
                onChange={(additionalCosts) => onPatch({ additionalCosts })}
              />
            </div>
          )}
          <div className="space-y-2">
            <Label>{strings.quotations.notes}</Label>
            <Textarea
              defaultValue={revision.notes.join('\n')}
              disabled={readOnly}
              rows={4}
              onBlur={(e) =>
                onPatch({
                  notes: e.target.value
                    .split('\n')
                    .map((l) => l.trim())
                    .filter(Boolean),
                })
              }
            />
          </div>
        </div>
        <div className="space-y-2 rounded-lg border bg-muted/20 p-4 text-sm">
          <TotalRow label={strings.quotations.supply} amount={totals.supplyAmountMinor} code={revision.currencyCode} />
          <TotalRow
            label={strings.quotations.installation}
            amount={totals.installationAmountMinor}
            code={revision.currencyCode}
          />
          <TotalRow
            label={strings.quotations.discount}
            amount={totals.discountAmountMinor}
            code={revision.currencyCode}
          />
          <TotalRow
            label={strings.quotations.sellExVat}
            amount={totals.sellExVatAmountMinor}
            code={revision.currencyCode}
          />
          <TotalRow label={strings.quotations.vat} amount={totals.vatAmountMinor} code={revision.currencyCode} />
          <TotalRow
            label={strings.quotations.grandTotal}
            amount={totals.grandAmountMinor}
            code={revision.currencyCode}
            strong
          />
          {withCost && (
            <>
              <TotalRow
                label={strings.quotations.cost}
                amount={totals.totalProjectCostExVatAmountMinor}
                code={revision.currencyCode}
              />
              <TotalRow
                label={strings.quotations.profit}
                amount={totals.profitAmountMinor}
                code={revision.currencyCode}
              />
              <p className="text-muted-foreground">
                {strings.quotations.margin}: {totals.marginPercent}%
              </p>
            </>
          )}
        </div>
      </div>
    </ProjectDetailSection>
  );
}

function TotalRow({
  label,
  amount,
  code,
  strong,
}: {
  label: string;
  amount: number;
  code: string;
  strong?: boolean;
}) {
  return (
    <div className="flex justify-between gap-4">
      <span className={strong ? 'font-semibold' : 'text-muted-foreground'}>{label}</span>
      <MoneyText amountMinor={amount} currencyCode={code} className={strong ? 'font-semibold' : ''} />
    </div>
  );
}

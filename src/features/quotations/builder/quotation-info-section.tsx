import type {
  Quotation,
  QuotationRevision,
  UpdateQuotationRequest,
} from '@/api/quotations/quotations.types';
import { ActorLabel } from '@/components/common/actor-label';
import { StatusChip } from '@/components/common/status-chip';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { PERMISSIONS } from '@/constants/permissions';
import { strings } from '@/constants/strings';
import { opportunityDisplayName } from '@/features/opportunities/opportunity-label';
import { ProjectDetailSection } from '@/features/projects/ui/project-detail-section';
import { usePermission } from '@/hooks/use-permission';
import {
  asciiNumericFieldProps,
  FX_SCALE,
  parseFxInput,
  parsePercentInput,
  PERCENT_SCALE,
} from '@/lib/quotation-decimals';
import { FileText } from 'lucide-react';

import { CommercialDetailsDisplay } from '@/features/quotations/commercial-details-display';

interface QuotationInfoSectionProps {
  quotation: Quotation;
  revision: QuotationRevision;
  readOnly: boolean;
  isBaseCurrency: boolean;
  onPatch: (body: Omit<UpdateQuotationRequest, 'expectedRevisionVersion'>) => void;
}

export function QuotationInfoSection({
  quotation,
  revision,
  readOnly,
  isBaseCurrency,
  onPatch,
}: QuotationInfoSectionProps) {
  const canViewCost = usePermission(PERMISSIONS.quotations.viewCost);
  const contractor =
    quotation.contractor?.company ?? quotation.contractorId;
  const opp = opportunityDisplayName(quotation.opportunity ?? undefined);

  const blurText = (field: string, value: string) => {
    if (readOnly) return;
    onPatch({ [field]: value });
  };

  return (
    <ProjectDetailSection
      icon={FileText}
      title={strings.quotations.quotationInfo}
      description={strings.quotations.quotationInfo}
    >
      <div className="mb-4 flex flex-wrap gap-2">
        <StatusChip kind="quotationStatus" value={quotation.status} />
        <StatusChip kind="quotationCommercialStatus" value={quotation.commercialStatus} />
        <StatusChip kind="lifecycle" value={quotation.lifecycle} />
      </div>
      <div className="mb-4">
        <CommercialDetailsDisplay quotation={quotation} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field label={strings.quotations.contractor}>
          <span className="text-sm">{contractor}</span>
        </Field>
        <Field label={strings.quotations.opportunity}>
          <span className="text-sm">{opp}</span>
        </Field>
        <Field label={strings.quotations.quotationDate}>
          <Input type="date" value={revision.date.slice(0, 10)} disabled />
        </Field>
        <Field label={strings.quotations.reference}>
          <Input value={quotation.ref} disabled />
        </Field>
        <Field label={strings.quotations.createdBy}>
          <ActorLabel user={quotation.createdByUser} fallbackUserId={quotation.createdBy} />
        </Field>
        <Field label={strings.quotations.salesOwner}>
          <ActorLabel user={quotation.salesOwnerUser} fallbackUserId={quotation.salesOwnerId} />
        </Field>
        <Field label={strings.quotations.currency}>
          {readOnly ? (
            <span>{revision.currencyCode}</span>
          ) : (
            <Input
              defaultValue={revision.currencyCode}
              onBlur={(e) => blurText('currencyCode', e.target.value.trim().toUpperCase())}
            />
          )}
        </Field>
        <Field label={strings.quotations.fxRate}>
          {isBaseCurrency ? (
            <span>1.00000000</span>
          ) : (
            <Input
              defaultValue={revision.fxRateToBase}
              disabled={readOnly}
              {...asciiNumericFieldProps(FX_SCALE)}
              onBlur={(e) => {
                const fx = parseFxInput(e.target.value);
                if (fx) onPatch({ fxRateToBase: fx });
              }}
            />
          )}
        </Field>
        <Field label={strings.quotations.validity}>
          <Input
            defaultValue={revision.validity}
            disabled={readOnly}
            onBlur={(e) => blurText('validity', e.target.value)}
          />
        </Field>
        <Field label={strings.quotations.paymentTerms}>
          <Input
            defaultValue={revision.paymentTerms}
            disabled={readOnly}
            onBlur={(e) => blurText('paymentTerms', e.target.value)}
          />
        </Field>
        <Field label={strings.quotations.deliveryPeriod}>
          <Input
            defaultValue={revision.deliveryPeriod}
            disabled={readOnly}
            onBlur={(e) => blurText('deliveryPeriod', e.target.value)}
          />
        </Field>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={revision.vatOn}
            disabled={readOnly}
            onCheckedChange={(vatOn) => onPatch({ vatOn: Boolean(vatOn) })}
          />
          <Label>VAT</Label>
          <Input
            className="w-20"
            defaultValue={revision.vatRate}
            disabled={readOnly}
            {...asciiNumericFieldProps(PERCENT_SCALE)}
            onBlur={(e) => onPatch({ vatRate: parsePercentInput(e.target.value) })}
          />
          <span className="text-sm text-muted-foreground">%</span>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            checked={revision.installationIncluded}
            disabled={readOnly}
            onCheckedChange={(installationIncluded) =>
              onPatch({ installationIncluded: Boolean(installationIncluded) })
            }
          />
          <Label>{strings.quotations.installationIncluded}</Label>
        </div>
      </div>
      {canViewCost && (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label={strings.quotations.sellingPricePerAmp}>
            <Input
              defaultValue={revision.sellingPricePerAmpBase ?? ''}
              disabled={readOnly}
              {...asciiNumericFieldProps(2)}
              onBlur={(e) => {
                const n = Number(e.target.value);
                if (Number.isFinite(n)) onPatch({ sellingPricePerAmpBase: n });
              }}
            />
          </Field>
          <Field label={strings.quotations.costPerAmp}>
            <Input
              defaultValue={revision.costPerAmpBase ?? ''}
              disabled={readOnly}
              {...asciiNumericFieldProps(2)}
              onBlur={(e) => {
                const n = Number(e.target.value);
                if (Number.isFinite(n)) onPatch({ costPerAmpBase: n });
              }}
            />
          </Field>
        </div>
      )}
    </ProjectDetailSection>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="text-sm">{children}</div>
    </div>
  );
}

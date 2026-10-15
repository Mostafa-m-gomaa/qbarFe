import type {
  CommercialDetailsCancelled,
  CommercialDetailsContractorChanged,
  CommercialDetailsConvertedToCables,
  CommercialDetailsLost,
  CommercialDetailsOnHold,
  Quotation,
} from '@/api/quotations/quotations.types';
import { ActorLabel } from '@/components/common/actor-label';
import { strings } from '@/constants/strings';
import { useContractorMap } from '@/features/crm/lookups';
import { formatDateTime } from '@/lib/format';

interface CommercialDetailsDisplayProps {
  quotation: Quotation;
}

export function CommercialDetailsDisplay({ quotation }: CommercialDetailsDisplayProps) {
  const contractorMap = useContractorMap();
  const details = quotation.commercialDetails;
  if (!details) return null;

  const status = quotation.commercialStatus;

  return (
    <div className="rounded-lg border bg-muted/30 p-4 text-sm">
      <p className="mb-3 font-medium">{strings.quotations.commercialDetailsTitle}</p>
      <dl className="grid gap-2 sm:grid-cols-2">
        {status === 'Lost' && (
          <LostDetails details={details as CommercialDetailsLost} />
        )}
        {status === 'Cancelled' && (
          <CancelledDetails details={details as CommercialDetailsCancelled} />
        )}
        {status === 'ConvertedToCables' && (
          <ConvertedDetails details={details as CommercialDetailsConvertedToCables} />
        )}
        {status === 'OnHold' && <OnHoldDetails details={details as CommercialDetailsOnHold} />}
        {status === 'ContractorChanged' && (
          <ContractorChangedDetails
            details={details as CommercialDetailsContractorChanged}
            contractorMap={contractorMap}
          />
        )}
      </dl>
      {quotation.commercialStatusAt && (
        <p className="mt-3 text-xs text-muted-foreground">
          {strings.quotations.commercialStatusChangedAt}: {formatDateTime(quotation.commercialStatusAt)}
          {quotation.commercialStatusBy && (
            <>
              {' · '}
              <ActorLabel fallbackUserId={quotation.commercialStatusBy} />
            </>
          )}
        </p>
      )}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="whitespace-pre-wrap">{value}</dd>
    </>
  );
}

function LostDetails({ details }: { details: CommercialDetailsLost }) {
  return (
    <>
      <DetailRow label={strings.quotations.commercialLostCompetitor} value={details.competitorName} />
      <DetailRow label={strings.quotations.commercialLostReason} value={details.reasonLost} />
      {details.details?.trim() && (
        <DetailRow label={strings.quotations.commercialLostDetails} value={details.details} />
      )}
    </>
  );
}

function CancelledDetails({ details }: { details: CommercialDetailsCancelled }) {
  return (
    <DetailRow
      label={strings.quotations.commercialCancelledReason}
      value={details.cancellationReason}
    />
  );
}

function ConvertedDetails({ details }: { details: CommercialDetailsConvertedToCables }) {
  if (!details.note?.trim()) return null;
  return (
    <DetailRow label={strings.quotations.commercialConvertedNote} value={details.note} />
  );
}

function OnHoldDetails({ details }: { details: CommercialDetailsOnHold }) {
  if (!details.holdReason?.trim()) return null;
  return <DetailRow label={strings.quotations.commercialOnHoldReason} value={details.holdReason} />;
}

function ContractorChangedDetails({
  details,
  contractorMap,
}: {
  details: CommercialDetailsContractorChanged;
  contractorMap: Map<string, string>;
}) {
  const prev = contractorMap.get(details.previousContractorId) ?? details.previousContractorId;
  const next = contractorMap.get(details.newContractorId) ?? details.newContractorId;
  return (
    <>
      <DetailRow label={strings.quotations.contractor} value={`${prev} → ${next}`} />
      <DetailRow label={strings.quotations.commercialContractorReason} value={details.reasonNote} />
    </>
  );
}

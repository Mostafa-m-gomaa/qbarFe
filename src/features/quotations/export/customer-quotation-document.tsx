import { BrandMark } from '@/components/navigation/brand-mark';
import { strings } from '@/constants/strings';

import { formatDocumentMoney } from './format-document-money';
import type { CustomerQuotationDocument } from './quotation-document.types';

export const CUSTOMER_QUOTATION_PRINT_ROOT_ID = 'customer-quotation-document-root';

interface CustomerQuotationDocumentViewProps {
  document: CustomerQuotationDocument;
  className?: string;
}

export function CustomerQuotationDocumentView({
  document: doc,
  className,
}: CustomerQuotationDocumentViewProps) {
  const money = (minor: number) =>
    formatDocumentMoney(minor, doc.currencyCode, doc.currencyMinorUnits);

  return (
    <article
      id={CUSTOMER_QUOTATION_PRINT_ROOT_ID}
      className={`customer-quotation-doc relative mx-auto w-full max-w-[210mm] bg-white p-8 text-sm text-slate-900 shadow-sm print:max-w-none print:shadow-none print:p-0 ${className ?? ''}`}
    >
      {doc.isDraftWatermark && (
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden print:fixed"
          aria-hidden
        >
          <span className="rotate-[-25deg] text-7xl font-black uppercase tracking-widest text-slate-200/80">
            {strings.quotations.exportDraftWatermark}
          </span>
        </div>
      )}

      <header className="mb-6 flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <BrandMark className="h-10 text-slate-900" />
          <p className="mt-2 text-xs text-slate-500">{doc.companyName}</p>
        </div>
        <div className="text-end">
          <h1 className="text-2xl font-bold tracking-tight">
            {strings.quotations.exportDocumentTitle}
          </h1>
          <p className="mt-1 font-semibold">{doc.ref}</p>
          <p className="text-slate-600">
            Rev {doc.revisionNumber} · {doc.revisionStatus} · {doc.quotationDate}
          </p>
        </div>
      </header>

      <section className="mb-6 grid gap-4 sm:grid-cols-2">
        <FieldBlock label={strings.quotations.contractor} value={doc.contractorName} />
        <FieldBlock label={strings.quotations.opportunity} value={doc.opportunityLabel} />
        <FieldBlock label={strings.quotations.salesOwner} value={doc.salesOwnerName} />
        <FieldBlock label={strings.quotations.currency} value={doc.currencyCode} />
        <FieldBlock label={strings.quotations.validity} value={doc.validity} />
        <FieldBlock label={strings.quotations.paymentTerms} value={doc.paymentTerms} />
        <FieldBlock label={strings.quotations.deliveryPeriod} value={doc.deliveryPeriod} />
        <FieldBlock label={strings.common.status} value={doc.quotationStatus} />
      </section>

      {doc.runs.map((run) => (
        <section key={run.name + run.amp} className="customer-quotation-run mb-6 break-inside-avoid">
          <h2 className="mb-2 border-b border-slate-300 pb-1 text-base font-semibold">
            {strings.quotations.busbarRun}: {run.name}
          </h2>
          <p className="mb-3 text-xs text-slate-600">
            {run.amp}A · {run.conductor} · {run.poles} · {run.ip} · {run.treatment} · {run.basis} ·{' '}
            {run.pricingProfile}
          </p>
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-300 bg-slate-50">
                <th className="px-2 py-1.5 text-start">#</th>
                <th className="px-2 py-1.5 text-start">{strings.quotations.description}</th>
                <th className="px-2 py-1.5 text-start">{strings.quotations.unit}</th>
                <th className="px-2 py-1.5 text-end">{strings.quotations.qty}</th>
                <th className="px-2 py-1.5 text-end">{strings.quotations.unitPrice}</th>
                <th className="px-2 py-1.5 text-end">{strings.quotations.totalPrice}</th>
              </tr>
            </thead>
            <tbody>
              {run.lines.map((line) => (
                <tr key={line.index} className="border-b border-slate-100">
                  <td className="px-2 py-1.5">{line.index}</td>
                  <td className="px-2 py-1.5">
                    {line.description}
                    {line.tapRating && (
                      <span className="mt-0.5 block text-slate-500">
                        {strings.quotations.tapRating}: {line.tapRating}
                        {line.mccb ? ` · ${line.mccb}` : ''}
                        {line.poles ? ` · ${line.poles}` : ''}
                      </span>
                    )}
                  </td>
                  <td className="px-2 py-1.5">{line.unitCode}</td>
                  <td className="px-2 py-1.5 text-end tabular-nums">{line.quantity}</td>
                  <td className="px-2 py-1.5 text-end tabular-nums">{money(line.unitSellAmountMinor)}</td>
                  <td className="px-2 py-1.5 text-end tabular-nums font-medium">
                    {money(line.sellAmountMinor)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}

      <section className="mb-6 break-inside-avoid rounded border border-slate-200 p-4">
        <h2 className="mb-3 text-base font-semibold">{strings.quotations.commercialSummary}</h2>
        <dl className="space-y-1.5 text-sm">
          <SummaryRow label={strings.quotations.supply} value={money(doc.summary.supplyAmountMinor)} />
          <SummaryRow
            label={strings.quotations.installation}
            value={money(doc.summary.installationAmountMinor)}
          />
          <SummaryRow
            label={strings.quotations.discount}
            value={money(doc.summary.discountAmountMinor)}
          />
          <SummaryRow
            label={strings.quotations.sellExVat}
            value={money(doc.summary.sellExVatAmountMinor)}
          />
          {doc.summary.vatOn && (
            <SummaryRow
              label={`${strings.quotations.vat} (${doc.summary.vatRateLabel}%)`}
              value={money(doc.summary.vatAmountMinor)}
            />
          )}
          <SummaryRow
            label={strings.quotations.grandTotal}
            value={money(doc.summary.grandAmountMinor)}
            strong
          />
        </dl>
      </section>

      {doc.notes.length > 0 && (
        <section className="break-inside-avoid">
          <h2 className="mb-2 text-base font-semibold">{strings.quotations.notes}</h2>
          <ul className="list-disc space-y-1 ps-5 text-sm text-slate-700">
            {doc.notes.map((note, i) => (
              <li key={i}>{note}</li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}

function FieldBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-sm text-slate-900">{value}</dd>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className={`flex justify-between gap-4 ${strong ? 'border-t border-slate-200 pt-2 font-semibold' : ''}`}>
      <dt className={strong ? '' : 'text-slate-600'}>{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  );
}

import {
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from 'docx';

import { strings } from '@/constants/strings';

import type { CustomerQuotationDocument } from './quotation-document.types';
import { customerQuotationExportFilename } from './quotation-document-data';
import { formatDocumentMoney } from './format-document-money';

function cell(text: string, bold = false) {
  return new TableCell({
    children: [new Paragraph({ children: [new TextRun({ text, bold })] })],
  });
}

export async function downloadCustomerQuotationDocx(docData: CustomerQuotationDocument): Promise<void> {
  const money = (minor: number) =>
    formatDocumentMoney(minor, docData.currencyCode, docData.currencyMinorUnits);

  const children: (Paragraph | Table)[] = [
    new Paragraph({
      text: `${strings.app.name} — ${strings.quotations.exportDocumentTitle}`,
      heading: HeadingLevel.TITLE,
    }),
    new Paragraph({
      children: [
        new TextRun({ text: docData.ref, bold: true, size: 28 }),
        new TextRun({
          text: ` · Rev ${docData.revisionNumber} · ${docData.revisionStatus} · ${docData.quotationDate}`,
        }),
      ],
    }),
  ];

  if (docData.isDraftWatermark) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: strings.quotations.exportDraftWatermark,
            bold: true,
            color: '999999',
            size: 48,
          }),
        ],
      }),
    );
  }

  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [cell(strings.quotations.contractor, true), cell(docData.contractorName)],
        }),
        new TableRow({
          children: [cell(strings.quotations.opportunity, true), cell(docData.opportunityLabel)],
        }),
        new TableRow({
          children: [cell(strings.quotations.salesOwner, true), cell(docData.salesOwnerName)],
        }),
        new TableRow({
          children: [cell(strings.quotations.validity, true), cell(docData.validity)],
        }),
        new TableRow({
          children: [cell(strings.quotations.paymentTerms, true), cell(docData.paymentTerms)],
        }),
        new TableRow({
          children: [cell(strings.quotations.deliveryPeriod, true), cell(docData.deliveryPeriod)],
        }),
      ],
    }),
  );

  for (const run of docData.runs) {
    children.push(
      new Paragraph({
        text: `${strings.quotations.busbarRun}: ${run.name}`,
        heading: HeadingLevel.HEADING_2,
      }),
      new Paragraph({
        text: `${run.amp}A · ${run.conductor} · ${run.poles} · ${run.ip} · ${run.treatment}`,
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              cell('#', true),
              cell(strings.quotations.description, true),
              cell(strings.quotations.unit, true),
              cell(strings.quotations.qty, true),
              cell(strings.quotations.unitPrice, true),
              cell(strings.quotations.totalPrice, true),
            ],
          }),
          ...run.lines.map(
            (line) =>
              new TableRow({
                children: [
                  cell(String(line.index)),
                  cell(line.description),
                  cell(line.unitCode),
                  cell(line.quantity),
                  cell(money(line.unitSellAmountMinor)),
                  cell(money(line.sellAmountMinor)),
                ],
              }),
          ),
        ],
      }),
    );
  }

  children.push(
    new Paragraph({ text: strings.quotations.commercialSummary, heading: HeadingLevel.HEADING_2 }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            cell(strings.quotations.supply, true),
            cell(money(docData.summary.supplyAmountMinor)),
          ],
        }),
        new TableRow({
          children: [
            cell(strings.quotations.installation, true),
            cell(money(docData.summary.installationAmountMinor)),
          ],
        }),
        new TableRow({
          children: [
            cell(strings.quotations.discount, true),
            cell(money(docData.summary.discountAmountMinor)),
          ],
        }),
        new TableRow({
          children: [
            cell(strings.quotations.sellExVat, true),
            cell(money(docData.summary.sellExVatAmountMinor)),
          ],
        }),
        ...(docData.summary.vatOn
          ? [
              new TableRow({
                children: [
                  cell(`${strings.quotations.vat} (${docData.summary.vatRateLabel}%)`, true),
                  cell(money(docData.summary.vatAmountMinor)),
                ],
              }),
            ]
          : []),
        new TableRow({
          children: [
            cell(strings.quotations.grandTotal, true),
            cell(money(docData.summary.grandAmountMinor)),
          ],
        }),
      ],
    }),
  );

  if (docData.notes.length > 0) {
    children.push(
      new Paragraph({ text: strings.quotations.notes, heading: HeadingLevel.HEADING_2 }),
      ...docData.notes.map((note) => new Paragraph({ text: `• ${note}` })),
    );
  }

  const docFile = new Document({ sections: [{ children }] });
  const blob = await Packer.toBlob(docFile);
  const url = URL.createObjectURL(blob);
  const anchor = window.document.createElement('a');
  anchor.href = url;
  anchor.download = customerQuotationExportFilename(docData.ref, docData.revisionNumber, 'docx');
  anchor.click();
  URL.revokeObjectURL(url);
}

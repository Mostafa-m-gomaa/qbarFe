import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

import { strings } from '@/constants/strings';

import type { CustomerQuotationDocument } from './quotation-document.types';
import { formatDocumentMoney } from './format-document-money';
import { customerQuotationExportFilename } from './quotation-document-data';

function addDraftWatermark(doc: jsPDF) {
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();
  doc.setTextColor(220);
  doc.setFontSize(48);
  doc.text(strings.quotations.exportDraftWatermark, w / 2, h / 2, {
    align: 'center',
    angle: 45,
  });
  doc.setTextColor(0);
}

function addPageNumbers(doc: jsPDF) {
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i += 1) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.getWidth() - 40,
      doc.internal.pageSize.getHeight() - 8,
    );
    doc.setTextColor(0);
  }
}

export function downloadCustomerQuotationPdf(docData: CustomerQuotationDocument): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const money = (minor: number) =>
    formatDocumentMoney(minor, docData.currencyCode, docData.currencyMinorUnits);

  if (docData.isDraftWatermark) {
    addDraftWatermark(doc);
  }

  doc.setFontSize(16);
  doc.text(`${strings.app.name} — ${strings.quotations.exportDocumentTitle}`, 14, 18);
  doc.setFontSize(11);
  doc.text(docData.ref, 14, 26);
  doc.setFontSize(10);
  doc.text(
    `Rev ${docData.revisionNumber} · ${docData.revisionStatus} · ${docData.quotationDate}`,
    14,
    32,
  );

  autoTable(doc, {
    startY: 38,
    body: [
      [strings.quotations.contractor, docData.contractorName],
      [strings.quotations.opportunity, docData.opportunityLabel],
      [strings.quotations.salesOwner, docData.salesOwnerName],
      [strings.quotations.currency, docData.currencyCode],
      [strings.quotations.validity, docData.validity],
      [strings.quotations.paymentTerms, docData.paymentTerms],
      [strings.quotations.deliveryPeriod, docData.deliveryPeriod],
    ],
    theme: 'plain',
    styles: { fontSize: 9 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 45 } },
  });

  let y =
    (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 38;

  for (const run of docData.runs) {
    if (y > 250) {
      doc.addPage();
      if (docData.isDraftWatermark) addDraftWatermark(doc);
      y = 18;
    }
    doc.setFontSize(11);
    doc.text(`${strings.quotations.busbarRun}: ${run.name}`, 14, y + 6);
    doc.setFontSize(9);
    doc.text(
      `${run.amp}A · ${run.conductor} · ${run.poles} · ${run.ip} · ${run.treatment}`,
      14,
      y + 12,
    );
    y += 16;

    autoTable(doc, {
      startY: y,
      head: [
        [
          '#',
          strings.quotations.description,
          strings.quotations.unit,
          strings.quotations.qty,
          strings.quotations.unitPrice,
          strings.quotations.totalPrice,
        ],
      ],
      body: run.lines.map((line) => [
        String(line.index),
        line.description,
        line.unitCode,
        line.quantity,
        money(line.unitSellAmountMinor),
        money(line.sellAmountMinor),
      ]),
      styles: { fontSize: 8, cellPadding: 1.5 },
      headStyles: { fillColor: [51, 65, 85] },
      theme: 'striped',
    });
    y = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? y;
    y += 8;
  }

  if (y > 240) {
    doc.addPage();
    if (docData.isDraftWatermark) addDraftWatermark(doc);
    y = 18;
  }

  doc.setFontSize(11);
  doc.text(strings.quotations.commercialSummary, 14, y + 4);
  y += 10;

  const summaryRows: [string, string][] = [
    [strings.quotations.supply, money(docData.summary.supplyAmountMinor)],
    [strings.quotations.installation, money(docData.summary.installationAmountMinor)],
    [strings.quotations.discount, money(docData.summary.discountAmountMinor)],
    [strings.quotations.sellExVat, money(docData.summary.sellExVatAmountMinor)],
  ];
  if (docData.summary.vatOn) {
    summaryRows.push([
      `${strings.quotations.vat} (${docData.summary.vatRateLabel}%)`,
      money(docData.summary.vatAmountMinor),
    ]);
  }
  summaryRows.push([strings.quotations.grandTotal, money(docData.summary.grandAmountMinor)]);

  autoTable(doc, {
    startY: y,
    body: summaryRows,
    theme: 'plain',
    styles: { fontSize: 9 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 60 }, 1: { halign: 'right' } },
  });

  y = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? y;

  if (docData.notes.length > 0) {
    if (y > 260) {
      doc.addPage();
      if (docData.isDraftWatermark) addDraftWatermark(doc);
      y = 18;
    }
    doc.setFontSize(11);
    doc.text(strings.quotations.notes, 14, y + 8);
    doc.setFontSize(9);
    docData.notes.forEach((note, i) => {
      doc.text(`• ${note}`, 16, y + 14 + i * 5);
    });
  }

  addPageNumbers(doc);
  doc.save(customerQuotationExportFilename(docData.ref, docData.revisionNumber, 'pdf'));
}

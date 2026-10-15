import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

import type { ProjectDetail } from '@/api/projects/projects.types';
import { formatDate } from '@/lib/format';

import type { ExportProjectRow, ProjectsExportLookups } from './projects-export.types';
import { detailToExportRows } from './projects-export-rows';

interface PdfExportOptions {
  projects: ProjectDetail[];
  filterSummary: string;
  lookups: ProjectsExportLookups;
}

function addPageNumbers(doc: jsPDF) {
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i += 1) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.getWidth() - 40, 287);
    doc.setTextColor(0);
  }
}

export function downloadProjectsPdf({ projects, filterSummary, lookups }: PdfExportOptions): void {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const exportedOn = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  doc.setFontSize(18);
  doc.text('Q-Bar — Projects export', 14, 18);
  doc.setFontSize(10);
  doc.text(`Exported on ${exportedOn}`, 14, 26);
  doc.text(`Filters: ${filterSummary}`, 14, 32);
  doc.text(`Projects: ${projects.length}`, 14, 38);

  const summaryHead = [
    'Number',
    'Name',
    'Stage',
    'Customer',
    'Department',
    'Execution',
    'Operational',
  ];
  const summaryBody = projects.map((p) => [
    p.number ?? '—',
    p.name,
    p.stage,
    p.customer ?? '—',
    p.department ?? '—',
    p.executionState,
    p.operationalStatus ?? '—',
  ]);

  autoTable(doc, {
    startY: 44,
    head: [summaryHead],
    body: summaryBody,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [30, 41, 59] },
    theme: 'striped',
  });

  for (const project of projects) {
    doc.addPage();
    doc.setFontSize(14);
    doc.text(project.name, 14, 16);
    doc.setFontSize(9);
    doc.text(
      [
        project.number ? `#${project.number}` : 'No number',
        project.stage,
        project.type,
        `${project.city}, ${project.country}`.replace(/^, |, $/g, ''),
      ]
        .filter(Boolean)
        .join(' · '),
      14,
      22,
    );

    const meta = [
      ['Customer', project.customer ?? '—'],
      ['Consultant', lookups.consultantName(project.consultantId)],
      ['Contractor', lookups.contractorName(project.contractorId)],
      ['Sales', lookups.usersNames(project.salesPersonIds) || '—'],
      ['PO ref', project.poContractRef ?? '—'],
      ['PO date', formatDate(project.poDate)],
      ['Expected close', formatDate(project.expectedClosingDate)],
    ];

    autoTable(doc, {
      startY: 26,
      body: meta,
      theme: 'plain',
      styles: { fontSize: 8 },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 36 } },
    });

    const rows: ExportProjectRow[] = detailToExportRows(project, lookups);
    const itemHead = ['Line', 'Type', 'Rating', 'Conductor', 'Plating', 'Poles', 'Meters', 'Price', 'Value'];
    const itemBody =
      rows[0]?.lineNo === ''
        ? [['—', 'No quantity lines', '', '', '', '', '', '', '']]
        : rows.map((r) => [
            r.lineNo,
            r.itemType,
            r.rating,
            r.conductor,
            r.plating,
            r.poles,
            r.meters,
            r.meterPrice,
            r.value,
          ]);

    const finalY = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 26;

    autoTable(doc, {
      startY: finalY + 6,
      head: [itemHead],
      body: itemBody,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [51, 65, 85] },
      theme: 'striped',
    });
  }

  addPageNumbers(doc);
  doc.save(`projects-${new Date().toISOString().slice(0, 10)}.pdf`);
}

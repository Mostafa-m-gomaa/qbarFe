import { FileDown, Printer } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import type { Quotation, QuotationRevision } from '@/api/quotations/quotations.types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { strings } from '@/constants/strings';
import { useContractorMap } from '@/features/crm/lookups';

import { CustomerQuotationDocumentView } from './customer-quotation-document';
import { buildCustomerQuotationDocument } from './quotation-document-data';
import './customer-quotation-print.css';
import { downloadCustomerQuotationPdf } from './quotation-export-pdf';
import { downloadCustomerQuotationDocx } from './quotation-export-docx';

interface CustomerQuotationPreviewDialogProps {
  quotation: Quotation;
  revision: QuotationRevision;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CustomerQuotationPreviewDialog({
  quotation,
  revision,
  open,
  onOpenChange,
}: CustomerQuotationPreviewDialogProps) {
  const contractorMap = useContractorMap();
  const [exporting, setExporting] = useState<'pdf' | 'docx' | null>(null);

  const customerDocument = useMemo(
    () =>
      buildCustomerQuotationDocument(quotation, revision, {
        contractorName:
          quotation.contractor?.company ?? contractorMap.get(quotation.contractorId),
        salesOwnerName: quotation.salesOwnerUser?.name ?? quotation.salesOwnerId,
      }),
    [quotation, revision, contractorMap],
  );

  const handlePrint = () => {
    window.document.body.classList.add('customer-quotation-print-active');
    const cleanup = () => {
      window.document.body.classList.remove('customer-quotation-print-active');
      window.removeEventListener('afterprint', cleanup);
    };
    window.addEventListener('afterprint', cleanup);
    window.print();
  };

  const handlePdf = () => {
    try {
      setExporting('pdf');
      downloadCustomerQuotationPdf(customerDocument);
    } catch {
      toast.error(strings.quotations.exportPdfError);
    } finally {
      setExporting(null);
    }
  };

  const handleDocx = async () => {
    try {
      setExporting('docx');
      await downloadCustomerQuotationDocx(customerDocument);
    } catch {
      toast.error(strings.quotations.exportWordError);
    } finally {
      setExporting(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(92vh,900px)] max-w-4xl flex-col gap-0 overflow-hidden p-0 print:hidden sm:max-w-4xl">
        <DialogHeader className="shrink-0 space-y-3 border-b px-6 py-4 pe-12">
          <div>
            <DialogTitle>{strings.quotations.exportPreviewTitle}</DialogTitle>
            <DialogDescription>{strings.quotations.exportPreviewHint}</DialogDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={handlePrint}>
              <Printer />
              {strings.quotations.exportPrintPdf}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePdf}
              disabled={exporting !== null}
            >
              <FileDown />
              {strings.quotations.exportDownloadPdf}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void handleDocx()}
              disabled={exporting !== null}
            >
              <FileDown />
              {strings.quotations.exportDownloadWord}
            </Button>
          </div>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto bg-muted/30 p-4">
          <CustomerQuotationDocumentView document={customerDocument} />
        </div>
        <DialogFooter className="shrink-0 border-t px-6 py-3 sm:justify-end">
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            {strings.common.close}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import { Box, Typography, Button } from '@mui/material';
import { Print, ArrowBack, Download, PictureAsPdf, Close } from '@mui/icons-material';
import { useTranslate, useStore } from 'react-admin';
import { useRef, useEffect, useState, useCallback } from 'react';
import { useReactToPrint } from 'react-to-print';

import { toArabicNumerals } from 'utils';
import { Tables } from 'types';
import { ReservationRecord } from 'store/slices/reserviationSlice';
import { PickerValue } from '@mui/x-date-pickers/internals';

interface GroupedItems {
  groupId: string;
  items: ReservationRecord[];
  groupTotal: number;
}

interface ReceiptPreviewProps {
  clientName: string;
  clientPhone?: string;
  groupedItems: GroupedItems[];
  totalPrice: number;
  paidAmount: number;
  deadLine: PickerValue;
  reservationId?: string;
  onBack: () => void;
  autoDownloadPdf?: boolean;
  autoDownloadImage?: boolean;
  autoPrint?: boolean;
  onClose?: () => void; // Called after auto-download to close the modal
}

// Shared text styles for receipt
const textStyle = {
  fontFamily: 'Cairo, Tahoma, sans-serif',
  lineHeight: 1.4,
};

export const ReceiptPreview = ({
  clientName,
  clientPhone,
  groupedItems,
  totalPrice,
  paidAmount,
  deadLine,
  reservationId,
  onBack,
  autoDownloadPdf,
  autoDownloadImage,
  autoPrint,
  onClose,
}: ReceiptPreviewProps) => {
  const translate = useTranslate();
  const [setting] = useStore<Tables<'settings'>>('settings');
  const receiptRef = useRef<HTMLDivElement>(null);
  const [pdfDownloaded, setPdfDownloaded] = useState(false);

  const remainAmount = totalPrice - paidAmount;

  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
    documentTitle: `receipt-${reservationId || 'new'}`,
  });

  // Download receipt as image
  const handleDownloadImage = useCallback(async () => {
    if (!receiptRef.current) return;

    try {
      // Dynamically import html2canvas
      const html2canvas = (await import('html2canvas')).default;

      // Get only the first receipt (not the duplicate)
      const firstReceipt = receiptRef.current.querySelector('[dir="rtl"]') as HTMLElement;
      if (!firstReceipt) return;

      const canvas = await html2canvas(firstReceipt, {
        scale: 2, // Higher quality
        backgroundColor: '#ffffff',
        useCORS: true,
      });

      // Create download link
      const link = document.createElement('a');
      const phoneForFilename = clientPhone ? `-${clientPhone.replace(/\s/g, '')}` : '';
      link.download = `receipt-${clientName}${phoneForFilename}-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error generating image:', error);
    }
  }, [clientName, clientPhone]);

  // Download receipt as PDF
  const handleDownloadPdf = useCallback(async (): Promise<boolean> => {
    if (!receiptRef.current) return false;

    try {
      // Dynamically import html2canvas and jspdf
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      // Get all receipts (both copies)
      const receipts = receiptRef.current.querySelectorAll(
        '[dir="rtl"]'
      ) as NodeListOf<HTMLElement>;
      if (receipts.length === 0) return false;

      // Capture first receipt to determine dimensions
      const firstCanvas = await html2canvas(receipts[0], {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
      });

      // Calculate PDF dimensions (72mm width for thermal receipt)
      const imgWidth = 72; // mm
      const imgHeight = (firstCanvas.height * imgWidth) / firstCanvas.width;

      // Create PDF with custom size
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [imgWidth, imgHeight],
      });

      // Add first page (customer copy)
      const firstImgData = firstCanvas.toDataURL('image/png');
      pdf.addImage(firstImgData, 'PNG', 0, 0, imgWidth, imgHeight);

      // Add second page (store copy) if exists
      if (receipts.length > 1) {
        // Make the second receipt visible temporarily
        const secondReceiptContainer = receipts[1].parentElement;
        const originalDisplay = secondReceiptContainer?.style.display;
        if (secondReceiptContainer) secondReceiptContainer.style.display = 'block';

        const secondCanvas = await html2canvas(receipts[1], {
          scale: 2,
          backgroundColor: '#ffffff',
          useCORS: true,
        });

        // Restore original display
        if (secondReceiptContainer) secondReceiptContainer.style.display = originalDisplay || '';

        pdf.addPage([imgWidth, imgHeight]);
        const secondImgData = secondCanvas.toDataURL('image/png');
        pdf.addImage(secondImgData, 'PNG', 0, 0, imgWidth, imgHeight);
      }

      // Save PDF with phone in filename
      const phoneForFilename = clientPhone ? `-${clientPhone.replace(/\s/g, '')}` : '';
      pdf.save(
        `receipt-${clientName}${phoneForFilename}-${new Date().toISOString().split('T')[0]}.pdf`
      );
      return true; // Indicate success
    } catch (error) {
      console.error('Error generating PDF:', error);
      return false;
    }
  }, [clientName, clientPhone]);

  // Auto-download and/or auto-print when respective props are true
  useEffect(() => {
    if (!pdfDownloaded && receiptRef.current && (autoDownloadPdf || autoDownloadImage || autoPrint)) {
      // Small delay to ensure the receipt is rendered
      const timer = setTimeout(async () => {
        let success = true;
        
        // Download PDF if requested
        if (autoDownloadPdf) {
          success = await handleDownloadPdf();
        }
        
        // Download image if requested
        if (autoDownloadImage) {
          await handleDownloadImage();
        }
        
        // Auto-print if requested
        if (autoPrint) {
          handlePrint();
        }
        
        if (success || autoDownloadImage || autoPrint) {
          setPdfDownloaded(true);
          // Auto-close after actions if onClose is provided
          if (onClose) {
            // Small delay to ensure print dialog opens before closing
            setTimeout(() => onClose(), autoPrint ? 100 : 0);
          }
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [autoDownloadPdf, autoDownloadImage, autoPrint, pdfDownloaded, handleDownloadPdf, handleDownloadImage, handlePrint, onClose]);

  // Format current date for display
  const formatCurrentDate = () => {
    const d = new Date();
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${toArabicNumerals(year)}/${toArabicNumerals(month)}/${toArabicNumerals(day)}`;
  };

  // Format current time for display
  const formatCurrentTime = () => {
    const d = new Date();
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    return `${toArabicNumerals(hours)}:${toArabicNumerals(minutes)}`;
  };

  const formatDeliveryDate = (date: PickerValue) => {
    if (!date) return '';
    const d = date.toDate();
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    return `${toArabicNumerals(month)}/${toArabicNumerals(day)} - ${toArabicNumerals(hours)}:${toArabicNumerals(minutes)}`;
  };

  // Get collection title from master item
  const getCollectionTitle = (group: GroupedItems): string => {
    const masterItem = group.items.find((item) => item.is_collection_master === true);
    if (masterItem) {
      return masterItem.title.split(' ').slice(0, -2).join(' ') || masterItem.title;
    }
    return group.items[0]?.title || '';
  };

  // Render items for receipt
  const renderReceiptItems = () => {
    return groupedItems.map((group, groupIndex) => {
      const isCollection = group.items.length > 1;
      const masterItem = group.items.find((item) => item.is_collection_master === true);
      const nonMasterItems = group.items.filter((item) => item.is_collection_master !== true);
      const sortedItems = masterItem ? [masterItem, ...nonMasterItems] : group.items;

      if (isCollection) {
        const collectionTitle = getCollectionTitle(group);
        return (
          <Box
            key={group.groupId}
            sx={{
              mb: 1.5,
              pb: 1,
              borderBottom: groupIndex < groupedItems.length - 1 ? '1px dotted #999' : 'none',
            }}
          >
            {/* Collection header */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                mb: 0.5,
              }}
            >
              <Typography
                sx={{
                  ...textStyle,
                  fontSize: '13px',
                  fontWeight: 'bold',
                  flex: 1,
                  pl: 1,
                }}
              >
                {collectionTitle}
              </Typography>
              <Typography
                sx={{
                  ...textStyle,
                  fontSize: '13px',
                  fontWeight: 'bold',
                  minWidth: 55,
                  textAlign: 'center',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '4px',
                  px: 0.5,
                }}
              >
                {toArabicNumerals(group.groupTotal)}
              </Typography>
            </Box>

            {/* Children items */}
            <Box sx={{ borderRight: '2px solid #ccc', pr: 1, mr: 0.5 }}>
              {sortedItems.map((item, idx) => {
                const displayName = item.additional_data || item.title.split(' ')[0];
                const isLast = idx === sortedItems.length - 1;
                return (
                  <Box key={item.id} sx={{ mb: isLast ? 0 : 0.25 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Typography
                        sx={{
                          ...textStyle,
                          fontSize: '11px',
                          color: '#555',
                          flex: 1,
                        }}
                      >
                        • {displayName}
                      </Typography>
                      <Typography
                        sx={{
                          ...textStyle,
                          fontSize: '10px',
                          color: '#777',
                          direction: 'rtl',
                        }}
                      >
                        {toArabicNumerals(item.quantity)}×{toArabicNumerals(item.price)}
                      </Typography>
                    </Box>
                    {item.note && (
                      <Typography
                        sx={{
                          ...textStyle,
                          fontSize: '10px',
                          color: '#888',
                          pr: 2,
                          fontStyle: 'italic',
                        }}
                      >
                        ({item.note})
                      </Typography>
                    )}
                  </Box>
                );
              })}
            </Box>
          </Box>
        );
      } else {
        // Single item
        const item = group.items[0];
        return (
          <Box
            key={group.groupId}
            sx={{
              mb: 1.5,
              pb: 1,
              borderBottom: groupIndex < groupedItems.length - 1 ? '1px dotted #999' : 'none',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
              }}
            >
              <Box sx={{ flex: 1, pl: 1 }}>
                <Typography
                  sx={{
                    ...textStyle,
                    fontSize: '12px',
                  }}
                >
                  {item.title}
                </Typography>
                <Typography
                  sx={{
                    ...textStyle,
                    fontSize: '10px',
                    color: '#777',
                  }}
                >
                  {toArabicNumerals(item.quantity)} × {toArabicNumerals(item.price)}
                </Typography>
              </Box>
              <Typography
                sx={{
                  ...textStyle,
                  fontSize: '13px',
                  fontWeight: 'bold',
                  minWidth: 55,
                  textAlign: 'center',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '4px',
                  px: 0.5,
                }}
              >
                {toArabicNumerals(item.totalPrice)}
              </Typography>
            </Box>
            {item.note && (
              <Typography
                sx={{
                  ...textStyle,
                  fontSize: '10px',
                  color: '#888',
                  pr: 1,
                  fontStyle: 'italic',
                }}
              >
                ({item.note})
              </Typography>
            )}
          </Box>
        );
      }
    });
  };

  // Receipt content component to avoid duplication
  const ReceiptContent = ({ copyLabel }: { copyLabel?: string }) => (
    <Box
      dir="rtl"
      sx={{
        backgroundColor: '#fff',
        p: 2,
        border: '1px solid #ddd',
        borderRadius: 1,
        width: '100%',
        maxWidth: 300,
        mx: 'auto',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        // Print styles
        '@media print': {
          width: '72mm',
          maxWidth: '72mm',
          border: 'none',
          boxShadow: 'none',
          borderRadius: 0,
          p: '2mm',
          m: 0,
          mx: 0,
        },
      }}
    >
      {/* Copy label for print */}
      {copyLabel && (
        <Typography
          sx={{
            ...textStyle,
            fontSize: '10px',
            textAlign: 'center',
            color: '#999',
            mb: 0.5,
            display: 'none',
            '@media print': {
              display: 'block',
            },
          }}
        >
          ({copyLabel})
        </Typography>
      )}

      {/* ═══════════ Store Header ═══════════ */}
      <Box sx={{ textAlign: 'center', mb: 1 }}>
        <Typography
          sx={{
            ...textStyle,
            fontSize: '16px',
            fontWeight: 'bold',
          }}
        >
          {translate('custom.messages.store_name')}
        </Typography>
      </Box>

      {/* ═══════════ Separator ═══════════ */}
      <Box sx={{ textAlign: 'center', my: 1, color: '#999', fontSize: '10px' }}>
        ════════════════════════
      </Box>

      {/* ═══════════ Client Info ═══════════ */}
      <Box sx={{ mb: 1.5, display: 'flex', justifyContent: 'space-between' }}>
        {/* Client name and phone */}
        <Box>
          <Typography sx={{ ...textStyle, fontSize: '12px', fontWeight: 'bold' }}>
            {clientName}
          </Typography>
          {clientPhone && (
            <Typography
              sx={{
                ...textStyle,
                fontSize: '11px',
                color: '#666',
                direction: 'ltr',
                textAlign: 'right',
              }}
            >
              📞 {clientPhone}
            </Typography>
          )}
        </Box>
        {/* Date and time */}
        <Box sx={{ textAlign: 'left' }}>
          <Typography sx={{ ...textStyle, fontSize: '11px', color: '#666' }}>
            {formatCurrentDate()}
          </Typography>
          <Typography sx={{ ...textStyle, fontSize: '11px', color: '#666' }}>
            {formatCurrentTime()}
          </Typography>
        </Box>
      </Box>

      {/* ═══════════ Items Header ═══════════ */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          borderTop: '2px solid #333',
          borderBottom: '1px solid #333',
          py: 0.5,
          mb: 1,
        }}
      >
        <Typography
          sx={{
            ...textStyle,
            fontSize: '12px',
            fontWeight: 'bold',
            flex: 1,
          }}
        >
          {translate('custom.messages.item_name')}
        </Typography>
        <Typography
          sx={{
            ...textStyle,
            fontSize: '12px',
            fontWeight: 'bold',
            minWidth: 55,
            textAlign: 'center',
          }}
        >
          {translate('custom.messages.total')}
        </Typography>
      </Box>

      {/* ═══════════ Items List ═══════════ */}
      <Box sx={{ minHeight: 50 }}>{renderReceiptItems()}</Box>

      {/* ═══════════ Summary ═══════════ */}
      <Box
        sx={{
          borderTop: '2px solid #333',
          pt: 1,
          mt: 1,
        }}
      >
        {/* Total */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            mb: 0.5,
          }}
        >
          <Typography sx={{ ...textStyle, fontSize: '12px' }}>
            {translate('custom.labels.total_price')}
          </Typography>
          <Typography sx={{ ...textStyle, fontSize: '13px', fontWeight: 'bold' }}>
            {toArabicNumerals(totalPrice)} {translate('custom.currency.short')}
          </Typography>
        </Box>

        {/* Paid */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            mb: 0.5,
          }}
        >
          <Typography sx={{ ...textStyle, fontSize: '12px' }}>
            {translate('custom.labels.paid_amount')}
          </Typography>
          <Typography sx={{ ...textStyle, fontSize: '12px' }}>
            {toArabicNumerals(paidAmount)} {translate('custom.currency.short')}
          </Typography>
        </Box>

        {/* Remaining */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            backgroundColor: remainAmount > 0 ? '#fff3cd' : '#d4edda',
            border: remainAmount > 0 ? '1px solid #ffc107' : '1px solid #28a745',
            borderRadius: '4px',
            px: 1,
            py: 0.5,
            mt: 0.5,
          }}
        >
          <Typography sx={{ ...textStyle, fontSize: '12px', fontWeight: 'bold' }}>
            {translate('custom.labels.remain_amount')}
          </Typography>
          <Typography sx={{ ...textStyle, fontSize: '13px', fontWeight: 'bold' }}>
            {remainAmount === 0
              ? translate('custom.labels.no_remain_amount')
              : `${toArabicNumerals(remainAmount)} ${translate('custom.currency.short')}`}
          </Typography>
        </Box>
      </Box>

      {/* ═══════════ Separator ═══════════ */}
      <Box sx={{ textAlign: 'center', my: 1.5, color: '#999', fontSize: '10px' }}>
        ────────────────────────
      </Box>

      {/* ═══════════ Delivery Date ═══════════ */}
      <Box
        sx={{
          textAlign: 'center',
          backgroundColor: '#f8f9fa',
          borderRadius: '4px',
          py: 0.75,
          mb: 1.5,
        }}
      >
        <Typography sx={{ ...textStyle, fontSize: '11px', color: '#666' }}>
          {translate('custom.messages.delivery_date')}
        </Typography>
        <Typography sx={{ ...textStyle, fontSize: '13px', fontWeight: 'bold' }}>
          {formatDeliveryDate(deadLine)}
        </Typography>
      </Box>

      {/* ═══════════ Footer ═══════════ */}
      <Box sx={{ textAlign: 'center' }}>
        <Typography sx={{ ...textStyle, fontSize: '12px', mb: 0.5 }}>
          {translate('custom.messages.thank_you')}
        </Typography>

        {reservationId && (
          <Typography sx={{ ...textStyle, fontSize: '10px', color: '#888' }}>
            {translate('custom.messages.reservation_id')}: {reservationId}
          </Typography>
        )}

        {/* Branch Phone Numbers */}
        {setting?.branch_phone_numbers && setting.branch_phone_numbers.length > 0 && (
          <Box
            sx={{
              mt: 1,
              pt: 1,
              borderTop: '1px dotted #ccc',
              display: 'flex',
              justifyContent: 'center',
              gap: 1.5,
              flexWrap: 'wrap',
            }}
          >
            {setting.branch_phone_numbers.map((phone, idx) => (
              <Typography
                key={idx}
                sx={{
                  ...textStyle,
                  fontSize: '11px',
                  color: '#555',
                  direction: 'ltr',
                }}
              >
                📱 {phone.phone_number}
              </Typography>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
      {/* Action buttons - hidden when printing */}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          justifyContent: 'center',
          flexWrap: 'wrap',
          '@media print': {
            display: 'none',
          },
        }}
      >
        {onClose ? (
          // After reservation created - show close button
          <Button variant="contained" color="error" startIcon={<Close />} onClick={onClose}>
            إغلاق
          </Button>
        ) : (
          // Preview mode - show back button
          <Button variant="outlined" startIcon={<ArrowBack />} onClick={onBack}>
            {translate('ra.action.back')}
          </Button>
        )}
        <Button variant="contained" startIcon={<Print />} onClick={() => handlePrint()}>
          {translate('ra.action.print')}
        </Button>
        <Button variant="outlined" startIcon={<Download />} onClick={handleDownloadImage}>
          تحميل صورة
        </Button>
        <Button variant="outlined" startIcon={<PictureAsPdf />} onClick={() => handleDownloadPdf()}>
          تحميل PDF
        </Button>
      </Box>

      {/* Receipt Preview - renders twice for printing */}
      <Box
        ref={receiptRef}
        sx={{
          '@media print': {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            margin: 0,
            padding: 0,
          },
        }}
      >
        {/* First copy - Customer */}
        <ReceiptContent copyLabel="نسخة العميل" />

        {/* Page break for print */}
        <Box
          sx={{
            display: 'none',
            '@media print': {
              display: 'block',
              pageBreakAfter: 'always',
              height: 0,
            },
          }}
        />

        {/* Second copy - Store */}
        <Box
          sx={{
            display: 'none',
            '@media print': {
              display: 'block',
            },
          }}
        >
          <ReceiptContent copyLabel="نسخة المحل" />
        </Box>
      </Box>
    </Box>
  );
};

import { Box, Typography, Button } from '@mui/material';
import { Print, ArrowBack, Download, PictureAsPdf, Close } from '@mui/icons-material';
import { useTranslate, useStore } from 'react-admin';
import { useRef, useEffect, useState, useCallback } from 'react';
import { useReactToPrint } from 'react-to-print';
import dayjs from 'dayjs';
import 'dayjs/locale/ar';

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
  reservationCode?: string;
  onBack: () => void;
  autoDownloadPdf?: boolean;
  autoDownloadImage?: boolean;
  autoPrint?: boolean;
  onClose?: () => void; // Called after auto-download to close the modal
}

// Shared text styles for receipt - optimized for thermal printers
const textStyle = {
  fontFamily: 'Cairo, Tahoma, sans-serif',
  lineHeight: 1.5,
  color: '#000', // Always black for thermal printer compatibility
  fontWeight: 500, // Slightly bolder for better visibility
};

export const ReceiptPreview = ({
  clientName,
  clientPhone,
  groupedItems,
  totalPrice,
  paidAmount,
  deadLine,
  reservationCode,
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
    documentTitle: `receipt-${reservationCode || 'new'}`,
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
    if (
      !pdfDownloaded &&
      receiptRef.current &&
      (autoDownloadPdf || autoDownloadImage || autoPrint)
    ) {
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
  }, [
    autoDownloadPdf,
    autoDownloadImage,
    autoPrint,
    pdfDownloaded,
    handleDownloadPdf,
    handleDownloadImage,
    handlePrint,
    onClose,
  ]);

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
    const dayName = dayjs(d).locale('ar').format('dddd');
    return `${dayName} - ${toArabicNumerals(month)}/${toArabicNumerals(day)} - ${toArabicNumerals(hours)}:${toArabicNumerals(minutes)}`;
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
              borderBottom: groupIndex < groupedItems.length - 1 ? '2px dotted #000' : 'none',
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
                  fontSize: '14px',
                  fontWeight: 'bold',
                  flex: 1,
                  pl: 1,
                  color: '#000 !important',
                }}
              >
                {collectionTitle}
              </Typography>
              <Typography
                sx={{
                  ...textStyle,
                  fontSize: '14px',
                  fontWeight: 'bold',
                  minWidth: 55,
                  textAlign: 'center',
                  backgroundColor: '#e0e0e0',
                  borderRadius: '4px',
                  px: 0.5,
                  color: '#000 !important',
                }}
              >
                {toArabicNumerals(group.groupTotal)}
              </Typography>
            </Box>

            {/* Children items */}
            <Box sx={{ borderRight: '3px solid #000', pr: 1, mr: 0.5 }}>
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
                          fontSize: '13px',
                          color: '#000 !important',
                          flex: 1,
                          fontWeight: 600,
                        }}
                      >
                        • {displayName}
                      </Typography>
                      <Typography
                        sx={{
                          ...textStyle,
                          fontSize: '12px',
                          color: '#000 !important',
                          direction: 'rtl',
                          fontWeight: 600,
                        }}
                      >
                        {toArabicNumerals(item.quantity)}×{toArabicNumerals(item.price)}
                      </Typography>
                    </Box>
                    {item.note && (
                      <Typography
                        sx={{
                          ...textStyle,
                          fontSize: '12px',
                          color: '#000 !important',
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
              borderBottom: groupIndex < groupedItems.length - 1 ? '2px dotted #000' : 'none',
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
                    fontSize: '14px',
                    color: '#000 !important',
                    fontWeight: 600,
                  }}
                >
                  {item.title}
                </Typography>
                <Typography
                  sx={{
                    ...textStyle,
                    fontSize: '12px',
                    color: '#000 !important',
                    fontWeight: 600,
                  }}
                >
                  {toArabicNumerals(item.quantity)} × {toArabicNumerals(item.price)}
                </Typography>
              </Box>
              <Typography
                sx={{
                  ...textStyle,
                  fontSize: '14px',
                  fontWeight: 'bold',
                  minWidth: 55,
                  textAlign: 'center',
                  backgroundColor: '#e0e0e0',
                  borderRadius: '4px',
                  px: 0.5,
                  color: '#000 !important',
                }}
              >
                {toArabicNumerals(item.totalPrice)}
              </Typography>
            </Box>
            {item.note && (
              <Typography
                sx={{
                  ...textStyle,
                  fontSize: '12px',
                  color: '#000 !important',
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
  const ReceiptContent = ({
    showItems = true,
    showHeaderFooter = true,
  }: {
    copyLabel?: string;
    showItems?: boolean;
    showHeaderFooter?: boolean;
  }) => (
    <Box
      dir="rtl"
      sx={{
        backgroundColor: '#fff',
        color: '#000', // Explicit black text for dark theme compatibility
        p: 2,
        border: '1px solid #ddd',
        borderRadius: 1,
        width: '100%',
        maxWidth: 300,
        mx: 'auto',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        // Ensure all child text inherits black color
        '& *': {
          color: 'inherit',
        },
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
      {/* ═══════════ Store Header ═══════════ */}
      {showHeaderFooter && (
        <>
          <Box sx={{ textAlign: 'center', mb: 1 }}>
            <Typography
              sx={{
                ...textStyle,
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#000 !important',
              }}
            >
              {translate('custom.messages.store_name')}
            </Typography>
            <Typography
              sx={{
                ...textStyle,
                fontSize: '14px',
                fontWeight: 600,
                color: '#000 !important',
                mt: 0.5,
              }}
            >
              {translate('custom.messages.receipt_header')}
            </Typography>
          </Box>

          {/* ═══════════ Separator ═══════════ */}
          <Box
            sx={{
              textAlign: 'center',
              my: 1,
              color: '#000 !important',
              fontSize: '12px',
              fontWeight: 'bold',
            }}
          >
            ════════════════════════
          </Box>
        </>
      )}

      {/* ═══════════ Client Info ═══════════ */}
      <Box sx={{ mb: 1.5, display: 'flex', justifyContent: 'space-between' }}>
        {/* Client name and phone */}
        <Box>
          <Typography
            sx={{ ...textStyle, fontSize: '14px', fontWeight: 'bold', color: '#000 !important' }}
          >
            {clientName}
          </Typography>
          {clientPhone && (
            <Typography
              sx={{
                ...textStyle,
                fontSize: '13px',
                color: '#000 !important',
                direction: 'ltr',
                textAlign: 'right',
                fontWeight: 600,
              }}
            >
              📞 {clientPhone}
            </Typography>
          )}
        </Box>
        {/* Date and time */}
        <Box sx={{ textAlign: 'left' }}>
          <Typography
            sx={{ ...textStyle, fontSize: '13px', color: '#000 !important', fontWeight: 600 }}
          >
            {formatCurrentDate()}
          </Typography>
          <Typography
            sx={{ ...textStyle, fontSize: '13px', color: '#000 !important', fontWeight: 600 }}
          >
            {formatCurrentTime()}
          </Typography>
        </Box>
      </Box>

      {showItems && (
        <>
          {/* ═══════════ Items Header ═══════════ */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              borderTop: '3px solid #000',
              borderBottom: '2px solid #000',
              py: 0.5,
              mb: 1,
            }}
          >
            <Typography
              sx={{
                ...textStyle,
                fontSize: '14px',
                fontWeight: 'bold',
                flex: 1,
                color: '#000 !important',
              }}
            >
              {translate('custom.messages.item_name')}
            </Typography>
            <Typography
              sx={{
                ...textStyle,
                fontSize: '14px',
                fontWeight: 'bold',
                minWidth: 55,
                textAlign: 'center',
                color: '#000 !important',
              }}
            >
              {translate('custom.messages.total')}
            </Typography>
          </Box>

          {/* ═══════════ Items List ═══════════ */}
          <Box sx={{ minHeight: 50 }}>{renderReceiptItems()}</Box>
        </>
      )}

      {/* ═══════════ Summary ═══════════ */}
      <Box
        sx={{
          borderTop: '3px solid #000',
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
          <Typography
            sx={{ ...textStyle, fontSize: '14px', color: '#000 !important', fontWeight: 600 }}
          >
            {translate('custom.labels.total_price')}
          </Typography>
          <Typography
            sx={{ ...textStyle, fontSize: '15px', fontWeight: 'bold', color: '#000 !important' }}
          >
            {toArabicNumerals(totalPrice)} {translate('custom.currency.short')}
          </Typography>
        </Box>

        {/* Payment Status */}
        {remainAmount === 0 ? (
          // Fully paid - show centered text
          <Box
            sx={{
              textAlign: 'center',
              backgroundColor: '#d4edda',
              border: '2px solid #000',
              borderRadius: '4px',
              px: 1,
              py: 1,
              mt: 0.5,
            }}
          >
            <Typography
              sx={{ ...textStyle, fontSize: '16px', fontWeight: 'bold', color: '#000 !important' }}
            >
              {translate('custom.labels.no_remain_amount')}
            </Typography>
          </Box>
        ) : (
          // Partial payment - show paid and remaining
          <>
            {/* Paid */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                mb: 0.5,
              }}
            >
              <Typography
                sx={{ ...textStyle, fontSize: '14px', color: '#000 !important', fontWeight: 600 }}
              >
                {translate('custom.labels.paid_amount')}
              </Typography>
              <Typography
                sx={{ ...textStyle, fontSize: '14px', color: '#000 !important', fontWeight: 600 }}
              >
                {toArabicNumerals(paidAmount)} {translate('custom.currency.short')}
              </Typography>
            </Box>

            {/* Remaining */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                backgroundColor: '#fff3cd',
                border: '2px solid #000',
                borderRadius: '4px',
                px: 1,
                py: 0.5,
                mt: 0.5,
              }}
            >
              <Typography
                sx={{
                  ...textStyle,
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: '#000 !important',
                }}
              >
                {translate('custom.labels.remain_amount')}
              </Typography>
              <Typography
                sx={{
                  ...textStyle,
                  fontSize: '15px',
                  fontWeight: 'bold',
                  color: '#000 !important',
                }}
              >
                {toArabicNumerals(remainAmount)} {translate('custom.currency.short')}
              </Typography>
            </Box>
          </>
        )}
      </Box>

      {/* ═══════════ Separator ═══════════ */}
      <Box
        sx={{
          textAlign: 'center',
          my: 0.5,
          color: '#000 !important',
          fontSize: '12px',
          fontWeight: 'bold',
        }}
      >
        ────────────────────────
      </Box>

      {/* ═══════════ Delivery Date ═══════════ */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#e0e0e0',
          borderRadius: '4px',
          py: 0.75,
          px: 1,
          mb: 1.5,
          border: '2px solid #000',
        }}
      >
        <Typography
          sx={{ ...textStyle, fontSize: '13px', color: '#000 !important', fontWeight: 600 }}
        >
          {translate('custom.messages.delivery_date')}
        </Typography>
        <Typography
          sx={{ ...textStyle, fontSize: '13px', color: '#000 !important', fontWeight: 600 }}
        >
          {formatDeliveryDate(deadLine)}
        </Typography>
      </Box>

      {/* ═══════════ Footer ═══════════ */}
      <Box sx={{ textAlign: 'center' }}>
        {showHeaderFooter && (
          <Typography
            sx={{
              ...textStyle,
              fontSize: '14px',
              mb: 0.5,
              color: '#000 !important',
              fontWeight: 600,
            }}
          >
            {translate('custom.messages.thank_you')}
          </Typography>
        )}

        {reservationCode && (
          <Typography
            sx={{ ...textStyle, fontSize: '12px', color: '#000 !important', fontWeight: 600 }}
          >
            {translate('custom.messages.reservation_id')}: {reservationCode}
          </Typography>
        )}

        {/* Branch Phone Numbers */}
        {showHeaderFooter &&
          setting?.branch_phone_numbers &&
          setting.branch_phone_numbers.length > 0 && (
            <Box
              sx={{
                mt: 1,
                pt: 1,
                borderTop: '2px dotted #000',
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
                    fontSize: '13px',
                    color: '#000 !important',
                    direction: 'ltr',
                    fontWeight: 600,
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
            {translate('ra.action.close')}
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
          {translate('custom.messages.download_image')}
        </Button>
        <Button variant="outlined" startIcon={<PictureAsPdf />} onClick={() => handleDownloadPdf()}>
          {translate('custom.messages.download_pdf')}
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
        <ReceiptContent
          copyLabel={translate('custom.messages.receipt_copy_customer')}
          showItems={false}
        />

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
          <ReceiptContent
            copyLabel={translate('custom.messages.receipt_copy_store')}
            showItems
            showHeaderFooter={false}
          />
        </Box>
      </Box>
    </Box>
  );
};

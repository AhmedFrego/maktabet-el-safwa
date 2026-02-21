import { jsPDF } from 'jspdf';
import { ReservationRecord } from 'store/slices/reserviationSlice';
import { toArabicNumerals } from 'utils/helpers';

interface GroupedItems {
  groupId: string;
  items: ReservationRecord[];
  groupTotal: number;
}

interface ReceiptData {
  clientName: string;
  clientPhone?: string;
  groupedItems: GroupedItems[];
  totalPrice: number;
  paidAmount: number;
  deadLine: Date;
  reservationId: string;
  storeName: string;
  branchPhoneNumbers?: string[];
}

// Format date for receipt
const formatDate = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${toArabicNumerals(year)}/${toArabicNumerals(month)}/${toArabicNumerals(day)}`;
};

const formatTime = (date: Date): string => {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${toArabicNumerals(hours)}:${toArabicNumerals(minutes)}`;
};

const formatDeliveryDate = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
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

export const generateReceiptPdf = async (data: ReceiptData): Promise<void> => {
  const {
    clientName,
    clientPhone,
    groupedItems,
    totalPrice,
    paidAmount,
    deadLine,
    reservationId,
    storeName,
    branchPhoneNumbers,
  } = data;

  const remainAmount = totalPrice - paidAmount;
  const now = new Date();

  // PDF dimensions (72mm width)
  const pageWidth = 72;
  const pageHeight = 150;

  // Create PDF
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [pageWidth, pageHeight],
  });

  // Add Arabic font support - using built-in helvetica for now
  // For proper Arabic support, you'd need to add an Arabic font
  pdf.setFont('helvetica');

  let y = 5; // Starting Y position
  const margin = 3;

  // Helper to add centered text
  const addCenteredText = (text: string, fontSize: number) => {
    pdf.setFontSize(fontSize);
    const textWidth = pdf.getTextWidth(text);
    const x = (pageWidth - textWidth) / 2;
    pdf.text(text, x, y);
    y += fontSize * 0.4 + 1;
  };

  // Helper to add left-right text pair
  const addTextPair = (leftText: string, rightText: string, fontSize: number) => {
    pdf.setFontSize(fontSize);
    pdf.text(rightText, pageWidth - margin, y, { align: 'right' });
    pdf.text(leftText, margin, y, { align: 'left' });
    y += fontSize * 0.4 + 1;
  };

  // Helper to add separator line
  const addSeparator = (char = '─') => {
    pdf.setFontSize(6);
    const sep = char.repeat(40);
    addCenteredText(sep, 6);
  };

  // Function to render one receipt page
  const renderReceipt = (copyLabel: string) => {
    y = 5;

    // Copy label
    pdf.setFontSize(8);
    addCenteredText(`(${copyLabel})`, 8);
    y += 1;

    // Store name
    addCenteredText(storeName, 14);
    y += 2;

    addSeparator('═');

    // Client info and date
    addTextPair(formatDate(now), clientName, 10);
    addTextPair(formatTime(now), clientPhone || '', 9);
    y += 2;

    // Items header
    pdf.setDrawColor(0);
    pdf.setLineWidth(0.3);
    pdf.line(margin, y, pageWidth - margin, y);
    y += 2;

    addTextPair('المجموع', 'الصنف', 9);

    pdf.setLineWidth(0.1);
    pdf.line(margin, y, pageWidth - margin, y);
    y += 2;

    // Items
    groupedItems.forEach((group) => {
      const isCollection = group.items.length > 1;

      if (isCollection) {
        const title = getCollectionTitle(group);
        addTextPair(toArabicNumerals(group.groupTotal), title, 9);

        const masterItem = group.items.find((item) => item.is_collection_master === true);
        const nonMasterItems = group.items.filter((item) => item.is_collection_master !== true);
        const sortedItems = masterItem ? [masterItem, ...nonMasterItems] : group.items;

        sortedItems.forEach((item) => {
          const displayName = item.additional_data || item.title.split(' ')[0];
          const priceInfo = `${toArabicNumerals(item.quantity)}×${toArabicNumerals(item.price)}`;
          pdf.setFontSize(7);
          pdf.text(`• ${displayName}`, pageWidth - margin - 5, y, { align: 'right' });
          pdf.text(priceInfo, margin, y, { align: 'left' });
          y += 3;
        });
      } else {
        const item = group.items[0];
        addTextPair(toArabicNumerals(item.totalPrice), item.title, 9);
        pdf.setFontSize(7);
        pdf.text(
          `${toArabicNumerals(item.quantity)} × ${toArabicNumerals(item.price)}`,
          pageWidth - margin - 3,
          y,
          { align: 'right' }
        );
        y += 3;
      }
      y += 1;
    });

    // Summary
    pdf.setLineWidth(0.3);
    pdf.line(margin, y, pageWidth - margin, y);
    y += 3;

    addTextPair(`${toArabicNumerals(totalPrice)} ج.م`, 'الإجمالي', 10);
    addTextPair(`${toArabicNumerals(paidAmount)} ج.م`, 'المدفوع', 9);

    // Remaining - highlighted
    const remainText = remainAmount === 0 ? 'تم السداد' : `${toArabicNumerals(remainAmount)} ج.م`;
    addTextPair(remainText, 'المتبقي', 10);
    y += 2;

    addSeparator();

    // Delivery date
    addCenteredText('موعد الاستلام', 8);
    addCenteredText(formatDeliveryDate(deadLine), 10);
    y += 2;

    addSeparator();

    // Footer
    addCenteredText('شكراً لتعاملكم معنا', 9);

    if (reservationId) {
      addCenteredText(`رقم الحجز: ${reservationId}`, 7);
    }

    // Phone numbers
    if (branchPhoneNumbers && branchPhoneNumbers.length > 0) {
      y += 1;
      const phonesText = branchPhoneNumbers.map((p) => `📱 ${p}`).join('  ');
      addCenteredText(phonesText, 8);
    }
  };

  // Render first page (customer copy)
  renderReceipt('نسخة العميل');

  // Add second page (store copy)
  pdf.addPage([pageWidth, pageHeight]);
  renderReceipt('نسخة المحل');

  // Save PDF
  const phoneForFilename = clientPhone ? `-${clientPhone.replace(/\s/g, '')}` : '';
  const filename = `receipt-${clientName}${phoneForFilename}-${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(filename);
};

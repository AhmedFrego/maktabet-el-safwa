import { useEffect, useState, useRef } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  Chip,
  Button,
} from '@mui/material';
import { Title, useTranslate } from 'react-admin';
import { Print, PrintOutlined } from '@mui/icons-material';
import { useReactToPrint } from 'react-to-print';
import dayjs, { Dayjs } from 'dayjs';

import { supabase } from 'lib';
import { ReservationRecord, IsDefaultValue } from 'store';
import { toArabicNumerals } from 'utils';
import { DateRangeFilter } from 'components/UI';

interface GroupedPublication {
  publicationId: string;
  title: string;
  paperType: string;
  coverType: string;
  isDublix: boolean;
  pages: number;
  quantity: number;
  reservations: string[]; // Reservation codes
  additional_data?: string;
  notes: string[]; // Array of unique notes for this group
  isDefault: IsDefaultValue; // true = default, or object with customizations
  customizations: Array<Record<string, unknown>>; // All unique customization objects
}

export const ProductionSummary = () => {
  const [publications, setPublications] = useState<GroupedPublication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Dayjs>(dayjs().subtract(30, 'day'));
  const [endDate, setEndDate] = useState<Dayjs>(dayjs());
  const translate = useTranslate();
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `production-summary-${dayjs().format('YYYY-MM-DD')}`,
  });

  useEffect(() => {
    fetchProductionData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate]);

  const fetchProductionData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all in-progress reservations filtered by deadline
      const { data: reservations, error: reservationError } = await supabase
        .from('reservations')
        .select('reservation_code, reserved_items')
        .eq('reservation_status', 'in-progress')
        .gte('dead_line', startDate.toISOString())
        .lte('dead_line', endDate.toISOString())
        .order('created_at', { ascending: true });

      if (reservationError) throw reservationError;

      if (!reservations || reservations.length === 0) {
        setPublications([]);
        setLoading(false);
        return;
      }

      // Group publications by identical specs + default status
      const publicationMap = new Map<string, GroupedPublication>();

      reservations.forEach((reservation) => {
        const items = reservation.reserved_items as unknown as ReservationRecord[];

        items.forEach((item) => {
          // Only include in-progress items
          if (item.status !== 'in-progress') return;

          // Create unique key for grouping - specs + customizations (including notes)
          // Items with different notes will be in separate groups since note is tracked in isDefault
          const isDefaultKey = item.isDefault === true ? 'default' : JSON.stringify(item.isDefault);
          const key = `${item.id}_${item.paper_type_id}_${item.cover_type_id || 'none'}_${item.isDublix}_${item.additional_data || 'none'}_${isDefaultKey}`;

          if (publicationMap.has(key)) {
            const existing = publicationMap.get(key)!;
            existing.quantity += item.quantity;
            if (!existing.reservations.includes(reservation.reservation_code)) {
              existing.reservations.push(reservation.reservation_code);
            }
            // Add note to array if it exists and not already in array
            if (item.note && !existing.notes.includes(item.note)) {
              existing.notes.push(item.note);
            }
            // Track unique customizations
            if (item.isDefault !== true) {
              const customStr = JSON.stringify(item.isDefault);
              const alreadyTracked = existing.customizations.some(
                (c) => JSON.stringify(c) === customStr
              );
              if (!alreadyTracked) {
                existing.customizations.push(item.isDefault);
              }
            }
          } else {
            publicationMap.set(key, {
              publicationId: item.id,
              title: item.title,
              paperType: item.paper_type?.name || 'غير محدد',
              coverType: item.cover_type?.name || 'بدون غلاف',
              isDublix: item.isDublix,
              pages: item.pages,
              quantity: item.quantity,
              reservations: [reservation.reservation_code],
              additional_data: item.additional_data || undefined,
              notes: item.note ? [item.note] : [],
              isDefault: item.isDefault ?? true,
              customizations: item.isDefault === true ? [] : [item.isDefault],
            });
          }
        });
      });

      // Convert map to array and sort by quantity desc
      const grouped = Array.from(publicationMap.values()).sort((a, b) => b.quantity - a.quantity);

      setPublications(grouped);
    } catch (err) {
      console.error('Error fetching production data:', err);
      setError(translate('custom.production_summary.error'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <CircularProgress />
        <Typography sx={{ fontFamily: 'inherit' }}>
          {translate('custom.production_summary.loading')}
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Title title={translate('custom.production_summary.title')} />
        <Typography color="error" sx={{ fontFamily: 'inherit' }}>
          {error}
        </Typography>
      </Box>
    );
  }

  const totalQuantity = publications.reduce((sum, pub) => sum + pub.quantity, 0);
  const totalPages = publications.reduce((sum, pub) => {
    const pagesPerItem = pub.isDublix ? pub.pages / 2 : pub.pages;
    return sum + pagesPerItem * pub.quantity;
  }, 0);

  return (
    <Box
      sx={{
        p: 3,
        '@media print': {
          p: 0,
          '& .no-print': {
            display: 'none !important',
          },
          '& .print-only': {
            display: 'block !important',
          },
        },
      }}
    >
      <Title title={translate('custom.production_summary.title')} />

      {/* Date Filter - Hidden on print */}
      <Box className="no-print" sx={{ mb: 3 }}>
        <DateRangeFilter
          dateRange={{ from: startDate, to: endDate }}
          onChange={(range) => {
            if (range.from) setStartDate(range.from);
            if (range.to) setEndDate(range.to);
          }}
        />
      </Box>

      {/* Header - Hidden on print */}
      <Box className="no-print" sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Print fontSize="large" color="primary" />
        <Typography variant="h4" sx={{ fontFamily: 'inherit', fontWeight: 'bold' }}>
          {translate('custom.production_summary.subtitle')}
        </Typography>
      </Box>

      {/* Summary Chips and Print Button - Hidden on print */}
      <Box className="no-print" sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
        <Chip
          label={`${translate('custom.production_summary.total_unique')}: ${toArabicNumerals(publications.length)}`}
          color="primary"
          sx={{ fontFamily: 'inherit', fontSize: '1rem', p: 2 }}
        />
        <Chip
          label={`${translate('custom.production_summary.total_quantity')}: ${toArabicNumerals(totalQuantity)} (${toArabicNumerals(Math.ceil(totalPages))} ${translate('custom.production_summary.paper')})`}
          color="secondary"
          sx={{ fontFamily: 'inherit', fontSize: '1rem', p: 2 }}
        />
        <Button
          variant="contained"
          startIcon={<PrintOutlined />}
          onClick={handlePrint}
          sx={{ fontFamily: 'inherit', mr: 'auto' }}
        >
          {translate('custom.production_summary.print.button')}
        </Button>
      </Box>

      {/* Print area */}
      <Box ref={printRef} dir="ltr">
        <Box
          sx={{
            direction: 'ltr',
            '@media print': {
              '@page': {
                size: 'A4 portrait',
                margin: '5mm',
              },
              '& *': {
                color: '#000 !important',
              },
              '& .no-print': {
                display: 'none !important',
              },
            },
          }}
        >
          {publications.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" sx={{ fontFamily: 'inherit', color: 'text.secondary' }}>
                {translate('custom.production_summary.no_publications')}
              </Typography>
            </Paper>
          ) : (
            <TableContainer
              component={Box}
              sx={{
                border: '1px solid rgba(224, 224, 224, 1)',
                borderRadius: 1,
                '@media print': {
                  border: 'none',
                },
              }}
            >
              <Table
                sx={{
                  direction: 'ltr',
                  '@media print': {
                    fontSize: '9pt',
                    width: '100%',
                    direction: 'ltr',
                    '& .MuiTableCell-root': {
                      padding: '4px 8px',
                    },
                  },
                }}
              >
                <TableHead
                  sx={{
                    '@media print': {
                      display: 'none',
                    },
                  }}
                >
                  <TableRow sx={{ backgroundColor: 'primary.light' }}>
                    <TableCell sx={{ fontFamily: 'inherit', fontWeight: 'bold' }}>
                      {translate('custom.production_summary.table.publication_name')}
                    </TableCell>
                    <TableCell
                      sx={{ fontFamily: 'inherit', fontWeight: 'bold', fontSize: '1.1rem' }}
                      align="center"
                      className="no-print"
                    >
                      {translate('custom.production_summary.table.quantity_required')}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {publications.map((pub) => (
                    <TableRow
                      key={`${pub.publicationId}_${pub.paperType}_${pub.coverType}_${pub.isDublix}_${pub.additional_data}_${pub.isDefault === true ? 'default' : JSON.stringify(pub.isDefault)}`}
                      sx={{
                        '&:nth-of-type(odd)': { backgroundColor: 'action.hover' },
                        '&:hover': { backgroundColor: 'action.selected' },
                        '@media print': {
                          pageBreakInside: 'avoid',
                          '&:hover': { backgroundColor: 'transparent' },
                          '&:nth-of-type(odd)': { backgroundColor: 'transparent' },
                        },
                      }}
                    >
                      <TableCell sx={{ fontFamily: 'inherit', maxWidth: 400 }}>
                        <Box>
                          {/* Title with inline customizations and quantity (print) */}
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.3,
                              flexWrap: 'wrap',
                              direction: 'ltr',
                            }}
                          >
                            <Typography
                              sx={{
                                fontFamily: 'inherit',
                                fontWeight: 'bold',
                              }}
                            >
                              {pub.title}
                            </Typography>

                            {/* Quantity - visible only in print, inline with title */}
                            <Typography
                              className="print-only"
                              sx={{
                                display: 'none',
                                '@media print': {
                                  display: 'inline-block !important',
                                  fontFamily: 'inherit',
                                  fontWeight: 'bold',
                                  fontSize: '0.95rem',
                                  color: '#000',
                                  px: 0.75,
                                  py: 0.25,
                                  border: '1.5px solid #000',
                                  borderRadius: '3px',
                                  mx: 0.5,
                                },
                              }}
                            >
                              ({toArabicNumerals(pub.quantity)})
                            </Typography>

                            {pub.isDefault !== true && (
                              <Box
                                sx={{
                                  display: 'inline-flex',
                                  flexWrap: 'wrap',
                                  gap: 0.5,
                                  '@media print': {
                                    gap: 0.3,
                                  },
                                }}
                              >
                                {Object.entries(pub.isDefault as Record<string, unknown>).map(
                                  ([key, value]) => {
                                    const fieldLabel = translate(
                                      `custom.production_summary.fields.${key}`,
                                      { _: key }
                                    );
                                    return (
                                      <Chip
                                        key={key}
                                        label={`${fieldLabel}: ${String(value)}`}
                                        size="small"
                                        color="warning"
                                        sx={{ fontFamily: 'inherit' }}
                                      />
                                    );
                                  }
                                )}
                              </Box>
                            )}
                          </Box>

                          {/* Print-only: Checkboxes and Cover Box */}
                          <Box
                            className="print-only"
                            sx={{
                              display: 'none',
                              mt: 2,
                              '@media print': {
                                display: 'flex !important',
                                alignItems: 'center',
                                gap: 1,
                                flexWrap: 'wrap',
                                mt: 0.5,
                              },
                            }}
                          >
                            {/* Tracking Checkboxes - No label */}
                            <Box sx={{ flex: '1 1 auto' }}>
                              <Typography
                                component="span"
                                sx={{
                                  fontFamily: 'inherit',
                                  fontSize: '14pt',
                                  letterSpacing: '1px',
                                  direction: 'ltr',
                                  '@media print': {
                                    fontSize: '11pt',
                                  },
                                }}
                              >
                                {Array.from(
                                  { length: Math.min(pub.quantity, 50) },
                                  () => '☐ '
                                ).join('')}
                                {pub.quantity > 50 && ` + ${toArabicNumerals(pub.quantity - 50)}`}
                              </Typography>
                            </Box>

                            {/* Printed Covers Box - No label */}
                            <Box
                              sx={{
                                border: '2px solid #000',
                                minHeight: '35px',
                                width: '120px',
                                backgroundColor: '#fff',
                                flexShrink: 0,
                                '@media print': {
                                  minHeight: '25px',
                                  width: '100px',
                                  border: '1.5px solid #000',
                                },
                              }}
                            />
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell
                        align="center"
                        className="no-print"
                        sx={{
                          fontFamily: 'inherit',
                          fontWeight: 'bold',
                          fontSize: '1.2rem',
                          color: 'primary.main',
                        }}
                      >
                        {toArabicNumerals(pub.quantity)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Box>
    </Box>
  );
};

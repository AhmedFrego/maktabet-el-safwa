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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from '@mui/material';
import { Title, useTranslate, useNotify } from 'react-admin';
import { Print, PrintOutlined } from '@mui/icons-material';
import { useReactToPrint } from 'react-to-print';
import dayjs, { Dayjs } from 'dayjs';

import { supabase } from 'lib';
import { ReservationRecord, IsDefaultValue } from 'store';
import { toArabicNumerals } from 'utils';
import { Enums } from 'types';
import { DateRangeFilter } from 'components/UI';

interface GroupedPublication {
  publicationId: string;
  title: string;
  paperTypeId: string;
  coverTypeId: string | null;
  isDublix: boolean;
  pages: number;
  quantity: number;
  reservationIds: string[]; // Reservation IDs for updates
  additional_data?: string;
  isDefault: IsDefaultValue; // true = default, or object with customizations
}

export const ProductionSummary = () => {
  const [publications, setPublications] = useState<GroupedPublication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize date filter from localStorage or use defaults
  const getInitialDateRange = () => {
    const stored = localStorage.getItem('productionSummaryDateRange');
    if (stored) {
      try {
        const { start, end } = JSON.parse(stored);
        return {
          start: dayjs(start),
          end: dayjs(end),
        };
      } catch {
        return {
          start: dayjs().subtract(30, 'day'),
          end: dayjs(),
        };
      }
    }
    return {
      start: dayjs().subtract(30, 'day'),
      end: dayjs(),
    };
  };

  const initialRange = getInitialDateRange();
  const [startDate, setStartDate] = useState<Dayjs>(initialRange.start);
  const [endDate, setEndDate] = useState<Dayjs>(initialRange.end);
  const [updating, setUpdating] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    publicationId: string;
    paperTypeId: string;
    coverTypeId: string | null;
    isDublix: boolean;
    additionalData: string | undefined;
    isDefaultKey: string;
    reservationIds: string[];
    title: string;
  } | null>(null);
  const translate = useTranslate();
  const notify = useNotify();
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `production-summary-${dayjs().format('YYYY-MM-DD')}`,
  });

  useEffect(() => {
    fetchProductionData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate]);

  // Persist date range to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(
      'productionSummaryDateRange',
      JSON.stringify({
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      })
    );
  }, [startDate, endDate]);

  const fetchProductionData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all in-progress reservations filtered by deadline
      const { data: reservations, error: reservationError } = await supabase
        .from('reservations')
        .select('id, reserved_items')
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

          // Create unique key for grouping
          const isDefaultKey = item.isDefault === true ? 'default' : JSON.stringify(item.isDefault);
          const key = `${item.id}_${item.paper_type_id}_${item.cover_type_id || 'none'}_${item.isDublix}_${item.additional_data || 'none'}_${isDefaultKey}`;

          if (publicationMap.has(key)) {
            const existing = publicationMap.get(key)!;
            existing.quantity += item.quantity;
            if (!existing.reservationIds.includes(reservation.id)) {
              existing.reservationIds.push(reservation.id);
            }
          } else {
            publicationMap.set(key, {
              publicationId: item.id,
              title: item.title,
              paperTypeId: item.paper_type_id,
              coverTypeId: item.cover_type_id || null,
              isDublix: item.isDublix,
              pages: item.pages,
              quantity: item.quantity,
              reservationIds: [reservation.id],
              additional_data: item.additional_data || undefined,
              isDefault: item.isDefault ?? true,
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

  const handleOpenConfirmation = (
    publicationId: string,
    paperTypeId: string,
    coverTypeId: string | null,
    isDublix: boolean,
    additionalData: string | undefined,
    isDefaultKey: string,
    reservationIds: string[],
    title: string
  ) => {
    setPendingAction({
      publicationId,
      paperTypeId,
      coverTypeId,
      isDublix,
      additionalData,
      isDefaultKey,
      reservationIds,
      title,
    });
    setConfirmOpen(true);
  };

  const handleConfirm = () => {
    if (pendingAction) {
      handleSetPublicationReady(
        pendingAction.publicationId,
        pendingAction.paperTypeId,
        pendingAction.coverTypeId,
        pendingAction.isDublix,
        pendingAction.additionalData,
        pendingAction.isDefaultKey,
        pendingAction.reservationIds
      );
    }
    setConfirmOpen(false);
    setPendingAction(null);
  };

  const handleCancel = () => {
    setConfirmOpen(false);
    setPendingAction(null);
  };

  const handleSetPublicationReady = async (
    publicationId: string,
    paperTypeId: string,
    coverTypeId: string | null,
    isDublix: boolean,
    additionalData: string | undefined,
    isDefaultKey: string,
    reservationIds: string[]
  ) => {
    try {
      // Create unique key for this publication variant
      const updateKey = `${publicationId}_${paperTypeId}_${coverTypeId || 'none'}_${isDublix}_${additionalData || 'none'}_${isDefaultKey}`;
      setUpdating(updateKey);

      // Fetch only the specific reservations that contain this publication
      const { data: reservations, error: fetchError } = await supabase
        .from('reservations')
        .select('id, reserved_items, reservation_status')
        .in('id', reservationIds)
        .eq('reservation_status', 'in-progress');

      if (fetchError) throw fetchError;
      if (!reservations || reservations.length === 0) {
        notify('لا توجد حجوزات للتحديث', { type: 'info' });
        return;
      }

      // Filter reservations containing this specific publication variant with in-progress status
      const reservationsToUpdate = reservations.filter((reservation) => {
        const items = reservation.reserved_items as unknown as ReservationRecord[];
        return items.some((item) => {
          if (item.status !== 'in-progress') return false;
          if (item.id !== publicationId) return false;
          if (item.paper_type_id !== paperTypeId) return false;
          if ((item.cover_type_id || null) !== coverTypeId) return false;
          if (item.isDublix !== isDublix) return false;
          if ((item.additional_data || undefined) !== additionalData) return false;

          const itemIsDefaultKey =
            item.isDefault === true ? 'default' : JSON.stringify(item.isDefault);
          return itemIsDefaultKey === isDefaultKey;
        });
      });

      if (reservationsToUpdate.length === 0) {
        notify('لا توجد عناصر مطابقة للتحديث', { type: 'info' });
        return;
      }

      // Update each reservation
      const updates = reservationsToUpdate.map(async (reservation) => {
        const items = reservation.reserved_items as unknown as ReservationRecord[];

        // Update matching items to 'ready' status
        const updatedItems = items.map((item) => {
          const itemIsDefaultKey =
            item.isDefault === true ? 'default' : JSON.stringify(item.isDefault);
          const matches =
            item.id === publicationId &&
            item.paper_type_id === paperTypeId &&
            (item.cover_type_id || null) === coverTypeId &&
            item.isDublix === isDublix &&
            (item.additional_data || undefined) === additionalData &&
            itemIsDefaultKey === isDefaultKey &&
            item.status === 'in-progress';

          if (matches) {
            return {
              ...item,
              status: 'ready' as Enums<'reservation_state'>,
            };
          }
          return item;
        });

        // Recalculate reservation status
        const allDelivered = updatedItems.every((item) => item.status === 'delivered');
        const allReady = updatedItems.every(
          (item) => item.status === 'ready' || item.status === 'delivered'
        );
        const hasInProgress = updatedItems.some((item) => item.status === 'in-progress');

        let newReservationStatus: Enums<'reservation_state'> = 'in-progress';
        if (allDelivered) {
          newReservationStatus = 'delivered';
        } else if (allReady && !hasInProgress) {
          newReservationStatus = 'ready';
        }

        // Update reservation in database
        return supabase
          .from('reservations')
          .update({
            reserved_items: updatedItems as unknown as ReservationRecord[],
            reservation_status: newReservationStatus,
          })
          .eq('id', reservation.id);
      });

      // Execute all updates in parallel
      const results = await Promise.all(updates);

      // Check for errors
      const failed = results.filter((r) => r.error);
      if (failed.length > 0) {
        console.error('Some updates failed:', failed);
        notify('حدث خطأ أثناء التحديث', { type: 'error' });
      } else {
        notify(`تم تحديث ${toArabicNumerals(reservationsToUpdate.length)} حجز بنجاح`, {
          type: 'success',
        });
      }

      // Refresh production data
      await fetchProductionData();
    } catch (err) {
      console.error('Error updating reservations:', err);
      notify('حدث خطأ أثناء التحديث', { type: 'error' });
    } finally {
      setUpdating(null);
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
                  {publications.map((pub) => {
                    const isDefaultKey =
                      pub.isDefault === true ? 'default' : JSON.stringify(pub.isDefault);
                    const rowKey = `${pub.publicationId}_${pub.paperTypeId}_${pub.coverTypeId || 'none'}_${pub.isDublix}_${pub.additional_data || 'none'}_${isDefaultKey}`;
                    const isUpdating = updating === rowKey;

                    return (
                      <TableRow
                        key={rowKey}
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
                              onClick={() => {
                                if (!isUpdating) {
                                  handleOpenConfirmation(
                                    pub.publicationId,
                                    pub.paperTypeId,
                                    pub.coverTypeId,
                                    pub.isDublix,
                                    pub.additional_data,
                                    isDefaultKey,
                                    pub.reservationIds,
                                    pub.title
                                  );
                                }
                              }}
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.3,
                                flexWrap: 'wrap',
                                direction: 'ltr',
                                cursor: 'pointer',
                                p: 0.5,
                                borderRadius: 1,
                                transition: 'background-color 0.2s',
                                '&:hover': {
                                  backgroundColor: 'primary.light',
                                },
                                '@media print': {
                                  cursor: 'default',
                                  p: 0,
                                  '&:hover': {
                                    backgroundColor: 'transparent',
                                  },
                                },
                              }}
                              title="انقر لتعيين هذا المنشور كجاهز في جميع الحجوزات"
                            >
                              <Typography
                                sx={{
                                  fontFamily: 'inherit',
                                  fontWeight: 'bold',
                                  opacity: isUpdating ? 0.5 : 1,
                                }}
                              >
                                {isUpdating ? '⏳ ' : ''}
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
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Box>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmOpen}
        onClose={handleCancel}
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
      >
        <DialogTitle id="confirm-dialog-title" sx={{ fontFamily: 'inherit' }}>
          تأكيد تعيين المنشور كجاهز
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="confirm-dialog-description" sx={{ fontFamily: 'inherit' }}>
            هل أنت متأكد من تعيين المنشور <strong>&quot;{pendingAction?.title}&quot;</strong> كجاهز{' '}
            <strong>{toArabicNumerals(pendingAction?.reservationIds.length || 0)}</strong> في حجز؟
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} sx={{ fontFamily: 'inherit' }}>
            إلغاء
          </Button>
          <Button
            onClick={handleConfirm}
            variant="contained"
            autoFocus
            sx={{ fontFamily: 'inherit' }}
          >
            تأكيد
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

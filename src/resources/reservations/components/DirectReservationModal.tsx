import { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Modal,
  Typography,
  IconButton,
  Divider,
  Checkbox,
  FormControlLabel,
  TextField,
  Fab,
  CircularProgress,
  Autocomplete,
} from '@mui/material';
import { Add, Delete, Restore, PointOfSale, Close } from '@mui/icons-material';
import {
  Button,
  useTranslate,
  useGetList,
  useStore,
  useDataProvider,
  useNotify,
} from 'react-admin';
import { ModalContent, ModalWrapper } from 'components/UI';
import { Tables } from 'types';
import { useDirectReservationPricing, ReservationItemData } from 'hooks';
import { supabase } from 'lib';
import { formatDateOnly, toArabicNumerals } from 'utils/helpers';

type CoverType = Tables<'cover_types'>;

// Re-export for compatibility
export interface DirectReservationItem extends ReservationItemData {
  id: string;
}

interface DirectReservationModalProps {
  open: boolean;
  onClose: () => void;
}

export const DirectReservationModal = ({ open, onClose }: DirectReservationModalProps) => {
  const translate = useTranslate();
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const [setting] = useStore<Tables<'settings'>>('settings');
  const [directPrintClientId] = useStore<string>('directPrintClientId');
  const { calculateItemPrice, getAvailableCovers, getDefaultCoverId } = useDirectReservationPricing(
    { setting }
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [totalOverride, setTotalOverride] = useState<number | null>(null);

  const { data: paperTypes } = useGetList<Tables<'paper_types'>>('paper_types', {
    pagination: { page: 1, perPage: 100 },
  });

  // Create default item
  const createDefaultItem = useCallback((): DirectReservationItem => {
    const defaultPaperTypeId = setting?.default_paper_size || '';
    const defaultCoverId = getDefaultCoverId(defaultPaperTypeId);

    return {
      id: `direct-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      pages: 0,
      paperTypeId: defaultPaperTypeId,
      coverless: true,
      coverId: defaultCoverId,
      isDublix: true,
      doRound: false,
      paperPriceOverride: null,
      itemPriceOverride: null,
    };
  }, [setting?.default_paper_size, getDefaultCoverId]);

  const [items, setItems] = useState<DirectReservationItem[]>(() => [createDefaultItem()]);

  // Calculate totals using shared pricing logic
  const { itemPrices, calculatedTotal, finalTotal } = useMemo(() => {
    const prices = items.map((item) => ({
      id: item.id,
      price: calculateItemPrice(item),
      isOverridden: item.itemPriceOverride !== null,
    }));

    const calculated = prices.reduce((sum, p) => sum + p.price, 0);

    // Apply group rounding if any item has doRound and no total override
    const shouldRound = items.some((item) => item.doRound) && totalOverride === null;
    const roundTo = shouldRound ? setting?.price_ceil_to || 1 : 1;
    const rounded = Math.ceil(calculated / roundTo) * roundTo;

    const final = totalOverride !== null ? totalOverride : rounded;

    return { itemPrices: prices, calculatedTotal: rounded, finalTotal: final };
  }, [items, calculateItemPrice, totalOverride, setting?.price_ceil_to]);

  // Handlers
  const handleAddItem = () => {
    setItems([...items, createDefaultItem()]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  const handleUpdateItem = (id: string, updates: Partial<DirectReservationItem>) => {
    setItems(
      items.map((item) => {
        if (item.id !== id) return item;

        const updated = { ...item, ...updates };

        // If paper type changed, update cover to first available
        if (updates.paperTypeId && updates.paperTypeId !== item.paperTypeId) {
          updated.coverId = getDefaultCoverId(updates.paperTypeId);
        }

        // Clear price override when other fields change (except itemPriceOverride itself)
        if (!('itemPriceOverride' in updates)) {
          updated.itemPriceOverride = null;
        }

        return updated;
      })
    );
  };

  const handleResetItemPrice = (id: string) => {
    handleUpdateItem(id, { itemPriceOverride: null });
  };

  const handleResetTotalPrice = () => {
    setTotalOverride(null);
  };

  const handleSubmit = async () => {
    // Validation
    const invalidItems = items.filter((item) => item.pages <= 0);
    if (invalidItems.length > 0) {
      notify('يجب أن يكون عدد الصفحات أكبر من صفر', { type: 'error' });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        notify('يجب تسجيل الدخول', { type: 'error' });
        return;
      }

      // Build reserved_items array for analytics
      const reservedItems = items.map((item, index) => {
        const itemPrice = itemPrices.find((p) => p.id === item.id);
        const paperType = paperTypes?.find((pt) => pt.id === item.paperTypeId);
        const covers = item.coverless ? null : getAvailableCovers(item.paperTypeId);
        const cover = covers?.find((c) => c.id === item.coverId);

        return {
          id: item.id,
          title: `طباعة مباشرة #${index + 1}`,
          pages: item.pages,
          paper_type_id: item.paperTypeId,
          paper_type: { name: paperType?.name || '' },
          coverless: item.coverless,
          cover_type_id: item.coverless ? null : item.coverId,
          cover_type: item.coverless ? null : { name: cover?.name || '' },
          isDublix: item.isDublix,
          do_round: item.doRound,
          quantity: 1,
          totalPrice: itemPrice?.price || 0,
          wasOverridden: itemPrice?.isOverridden || false,
          status: 'delivered' as const,
          deliveredAt: new Date().toISOString(),
          deliveredBy: session.session.user.id,
          price: itemPrice?.price || 0,
          change_price: { oneFacePrice: 0, twoFacesPrice: 0 },
          two_faces_cover: true,
        };
      });

      const now = formatDateOnly(new Date());

      const reservationData: Parameters<typeof dataProvider.create>[1]['data'] = {
        created_by: session.session.user.id,
        reserved_items: reservedItems,
        paid_amount: finalTotal,
        client_id: directPrintClientId,
        dead_line: now,
        branch: setting?.branch,
        reservation_status: 'delivered',
        delivered_by: session.session.user.id,
        delivered_at: now,
      };

      await dataProvider.create('reservations', { data: reservationData });

      notify('تم إنشاء الطباعة المباشرة بنجاح', { type: 'success' });

      // Reset and close
      setItems([createDefaultItem()]);
      setTotalOverride(null);
      onClose();
    } catch (error) {
      console.error('Error creating direct reservation:', error);
      notify('حدث خطأ أثناء إنشاء الطباعة المباشرة', { type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setItems([createDefaultItem()]);
      setTotalOverride(null);
      onClose();
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <ModalWrapper>
        <ModalContent
          sx={(theme) => ({
            p: 3,
            backgroundColor: theme.palette.grey[50],
            border: `2px solid ${theme.palette.success.main}`,
            maxWidth: 600,
            maxHeight: '90vh',
            overflow: 'auto',
            gap: 2,
          })}
        >
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PointOfSale color="success" />
            <Typography variant="h6" sx={{ fontFamily: 'inherit', flex: 1 }}>
              {translate('resources.reservations.actions.direct')}
            </Typography>
            <IconButton onClick={handleClose} disabled={isSubmitting} size="small">
              <Close />
            </IconButton>
          </Box>

          <Divider />

          {/* Items List */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {items.map((item, index) => (
              <DirectReservationItemRow
                key={item.id}
                item={item}
                index={index}
                paperTypes={paperTypes || []}
                itemPrice={itemPrices.find((p) => p.id === item.id)?.price || 0}
                isOverridden={itemPrices.find((p) => p.id === item.id)?.isOverridden || false}
                onUpdate={(updates) => handleUpdateItem(item.id, updates)}
                onRemove={() => handleRemoveItem(item.id)}
                onResetPrice={() => handleResetItemPrice(item.id)}
                canRemove={items.length > 1}
                getCovers={(paperTypeId) => getAvailableCovers(paperTypeId) || []}
                setting={setting}
              />
            ))}
          </Box>

          {/* Add Item Button */}
          <Button
            variant="outlined"
            color="primary"
            onClick={handleAddItem}
            sx={{ fontFamily: 'inherit' }}
            startIcon={<Add />}
          >
            {translate('custom.labels.add_item')}
          </Button>

          <Divider />

          {/* Total Section */}
          <Box
            sx={(theme) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              p: 2,
              backgroundColor: theme.palette.grey[200],
              borderRadius: 1,
            })}
          >
            <Typography variant="h6" sx={{ fontFamily: 'inherit', flex: 1 }}>
              {translate('custom.labels.total_price')}:
            </Typography>
            <TextField
              type="number"
              size="small"
              value={totalOverride !== null ? totalOverride : calculatedTotal}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setTotalOverride(isNaN(val) ? null : val);
              }}
              sx={{
                width: 120,
                '& .MuiOutlinedInput-input': {
                  fontWeight: 600,
                  color: 'text.primary',
                },
              }}
              InputProps={{
                endAdornment: totalOverride !== null && (
                  <IconButton size="small" onClick={handleResetTotalPrice}>
                    <Restore fontSize="small" />
                  </IconButton>
                ),
              }}
            />
            <Typography sx={{ fontFamily: 'inherit' }}>
              {translate('custom.currency.short')}
            </Typography>
          </Box>

          {/* Submit Button */}
          <Fab
            variant="extended"
            color="success"
            onClick={handleSubmit}
            disabled={isSubmitting || items.every((i) => i.pages <= 0)}
            sx={{ fontFamily: 'inherit', alignSelf: 'center', mt: 1 }}
          >
            {isSubmitting ? (
              <CircularProgress size={24} sx={{ mr: 1 }} color="inherit" />
            ) : (
              <PointOfSale sx={{ mr: 1 }} />
            )}
            {translate('resources.reservations.actions.confirm_direct')}
          </Fab>
        </ModalContent>
      </ModalWrapper>
    </Modal>
  );
};

// Individual Item Row Component
interface DirectReservationItemRowProps {
  item: DirectReservationItem;
  index: number;
  paperTypes: Tables<'paper_types'>[];
  itemPrice: number;
  isOverridden: boolean;
  onUpdate: (updates: Partial<DirectReservationItem>) => void;
  onRemove: () => void;
  onResetPrice: () => void;
  canRemove: boolean;
  getCovers: (paperTypeId: string) => CoverType[] | null;
  setting: Tables<'settings'> | undefined;
}

const DirectReservationItemRow = ({
  item,
  index,
  paperTypes,
  itemPrice,
  isOverridden,
  onUpdate,
  onRemove,
  onResetPrice,
  canRemove,
  getCovers,
  setting,
}: DirectReservationItemRowProps) => {
  const translate = useTranslate();
  const availableCovers = getCovers(item.paperTypeId);

  return (
    <Box
      sx={(theme) => ({
        p: 2,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 1,
        backgroundColor: theme.palette.background.paper,
      })}
    >
      {/* Item Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
        <Typography variant="subtitle2" sx={{ fontFamily: 'inherit', flex: 1 }}>
          {translate('custom.labels.item')} #{toArabicNumerals(index + 1)}
        </Typography>
        {canRemove && (
          <IconButton size="small" color="error" onClick={onRemove}>
            <Delete fontSize="small" />
          </IconButton>
        )}
      </Box>

      {/* Row 1: Pages, Paper Price, Paper Type, Item Price */}
      <Box sx={{ display: 'flex', gap: 1.5, mb: 1.5, flexWrap: 'wrap' }}>
        <TextField
          type="number"
          size="small"
          label={translate('custom.labels.pages_count')}
          value={item.pages || ''}
          onChange={(e) => onUpdate({ pages: parseInt(e.target.value) || 0 })}
          sx={{ width: 100 }}
          inputProps={{ min: 1 }}
        />

        <TextField
          type="text"
          size="small"
          label="سعر الورق/١٠٠"
          value={(() => {
            if (item.paperPriceOverride !== null) {
              return item.paperPriceOverride;
            }
            // Calculate paper price from item price if override exists
            if (item.itemPriceOverride !== null && item.pages > 0) {
              let paperPrice = item.itemPriceOverride;
              // Subtract cover price if not coverless
              if (!item.coverless && setting?.paper_prices) {
                const paperPrice_ = setting.paper_prices.find(
                  (p: { id: string }) => p.id === item.paperTypeId
                );
                const coverPrice = item.isDublix
                  ? Number(paperPrice_?.twoFacesPrice || 0)
                  : Number(paperPrice_?.oneFacePrice || 0);
                paperPrice -= coverPrice;
              }
              return Math.round((paperPrice * 100) / item.pages);
            }
            // Calculate from settings
            const paperPrice = setting?.paper_prices?.find(
              (p: { id: string }) => p.id === item.paperTypeId
            );
            if (!paperPrice) return '';
            const priceFromSettings = item.isDublix
              ? paperPrice.twoFacesPrice
              : paperPrice.oneFacePrice;
            return priceFromSettings || '';
          })()}
          onChange={(e) => {
            const input = e.target.value;
            if (input === '' || /^\d*\.?\d*$/.test(input)) {
              const val = parseFloat(input);
              onUpdate({
                paperPriceOverride: input === '' || isNaN(val) ? null : val,
                itemPriceOverride: null, // Clear item override when paper price changes
              });
            }
          }}
          sx={{ width: 110 }}
          InputProps={{
            endAdornment: item.paperPriceOverride !== null && (
              <IconButton
                size="small"
                onClick={() => onUpdate({ paperPriceOverride: null, itemPriceOverride: null })}
              >
                <Restore fontSize="small" />
              </IconButton>
            ),
          }}
        />

        <Autocomplete
          size="small"
          options={paperTypes}
          getOptionLabel={(option) => option.name || ''}
          value={paperTypes.find((pt) => pt.id === item.paperTypeId) || null}
          onChange={(_, newValue) => onUpdate({ paperTypeId: newValue?.id || '' })}
          renderInput={(params) => (
            <TextField {...params} label={translate('resources.publications.fields.paper_type')} />
          )}
          sx={{ minWidth: 130, flex: 1 }}
          isOptionEqualToValue={(option, value) => option.id === value.id}
        />

        <TextField
          type="text"
          size="small"
          label={translate('custom.labels.item_price')}
          value={isOverridden ? item.itemPriceOverride || '' : itemPrice || ''}
          onChange={(e) => {
            const input = e.target.value;
            // Allow only numbers and decimal point
            if (input === '' || /^\d*\.?\d*$/.test(input)) {
              const val = parseFloat(input);
              onUpdate({
                itemPriceOverride: input === '' || isNaN(val) ? null : val,
                paperPriceOverride: null, // Clear paper override when item price changes
              });
            }
          }}
          sx={{ width: 110 }}
          InputProps={{
            endAdornment: isOverridden && (
              <IconButton size="small" onClick={onResetPrice}>
                <Restore fontSize="small" />
              </IconButton>
            ),
          }}
        />
      </Box>

      {/* Row 2: Cover options */}
      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={item.coverless}
              onChange={(e) => onUpdate({ coverless: e.target.checked })}
              size="small"
            />
          }
          label={translate('resources.publications.fields.coverless')}
          sx={{ '& .MuiTypography-root': { fontFamily: 'inherit', fontSize: '0.875rem' } }}
        />

        {!item.coverless && availableCovers && (
          <Autocomplete
            size="small"
            options={availableCovers}
            getOptionLabel={(option) => option.name || ''}
            value={availableCovers.find((ct) => ct.id === item.coverId) || null}
            onChange={(_, newValue) => onUpdate({ coverId: newValue?.id || '' })}
            renderInput={(params) => (
              <TextField
                {...params}
                label={translate('resources.publications.fields.cover_type')}
              />
            )}
            sx={{ minWidth: 130, flex: 1 }}
            isOptionEqualToValue={(option, value) => option.id === value.id}
          />
        )}

        <FormControlLabel
          control={
            <Checkbox
              checked={item.isDublix}
              onChange={(e) => onUpdate({ isDublix: e.target.checked })}
              size="small"
            />
          }
          label={translate('resources.publications.fields.dublix')}
          sx={{ '& .MuiTypography-root': { fontFamily: 'inherit', fontSize: '0.875rem' } }}
        />
      </Box>
    </Box>
  );
};

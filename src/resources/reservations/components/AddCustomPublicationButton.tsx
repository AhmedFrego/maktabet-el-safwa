import { useState } from 'react';
import {
  Box,
  Modal,
  Typography,
  TextField,
  Checkbox,
  FormControlLabel,
  Divider,
  IconButton,
  Autocomplete,
} from '@mui/material';
import { Button, useTranslate, TextInput, useGetList, NumberInput, useStore } from 'react-admin';
import { Close, Restore } from '@mui/icons-material';
import { ModalContent, ModalWrapper } from 'components/UI';
import { addOrIncreaseItem, useAppDispatch } from 'store';
import { Tables } from 'types';
import { ReservationMustKeys } from 'store/slices/reserviationSlice';
import { useDirectReservationPricing, ReservationItemData } from 'hooks';
import { createDefaultItemData, updateItemData, generateItemId } from 'utils';

interface CustomPublicationFormData extends ReservationItemData {
  title: string;
  quantity: number;
}

export const AddCustomPublicationButton = () => {
  const translate = useTranslate();
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const [, setKey] = useState(0);
  const [setting] = useStore<Tables<'settings'>>('settings');

  const { data: paperTypes } = useGetList('paper_types', {
    pagination: { page: 1, perPage: 100 },
  });

  const { calculateItemPrice, getAvailableCovers, getDefaultCoverId } = useDirectReservationPricing(
    { setting }
  );

  const getDefaultFormData = (): CustomPublicationFormData => ({
    ...createDefaultItemData(setting, getDefaultCoverId, false),
    title: '',
    quantity: 1,
  });

  const [formData, setFormData] = useState(getDefaultFormData());
  const availableCovers = getAvailableCovers(formData.paperTypeId);
  const calculatedPrice = calculateItemPrice(formData);

  // Helper to calculate paper price from settings or override
  const getPaperPrice = (): number => {
    if (formData.paperPriceOverride !== null) {
      return formData.paperPriceOverride;
    }

    // Calculate from item price override if set
    if (formData.itemPriceOverride !== null && formData.pages > 0) {
      let paperPrice = formData.itemPriceOverride;
      if (!formData.coverless) {
        const cover = availableCovers?.find((c) => c.id === formData.coverId);
        const coverPrice = Number(cover?.twoFacesPrice || cover?.oneFacePrice || 0);
        paperPrice -= coverPrice;
      }
      return Math.round((paperPrice * 100) / formData.pages);
    }

    // Return 0 if no pages
    if (formData.pages <= 0) return 0;

    // Calculate from settings
    const paperPriceSettings = (
      setting?.paper_prices as Array<{ id: string; twoFacesPrice: number; oneFacePrice: number }>
    )?.find((p) => p.id === formData.paperTypeId);
    if (!paperPriceSettings) return 0;

    return formData.isDublix ? paperPriceSettings.twoFacesPrice : paperPriceSettings.oneFacePrice;
  };

  const paperPrice = getPaperPrice();

  const handleSubmit = () => {
    if (
      formData.title &&
      formData.pages > 0 &&
      formData.paperTypeId &&
      (formData.coverless || formData.coverId) &&
      calculatedPrice > 0
    ) {
      const selectedPaperType = paperTypes?.find((pt) => pt.id === formData.paperTypeId);
      const selectedCoverType = availableCovers?.find((ct) => ct.id === formData.coverId);

      const customPublication = {
        id: generateItemId('custom'),
        title: formData.title,
        pages: formData.pages,
        price: calculatedPrice,
        cover_type_id: formData.coverless ? null : formData.coverId,
        cover_type: formData.coverless ? null : { name: selectedCoverType?.name },
        paper_type: { name: selectedPaperType?.name },
        paper_type_id: formData.paperTypeId,
        coverless: formData.coverless,
        two_faces_cover: formData.isDublix,
        do_round: formData.doRound,
        change_price: { oneFacePrice: 0, twoFacesPrice: 0 },
      } as ReservationMustKeys;

      for (let i = 0; i < formData.quantity; i++) {
        dispatch(addOrIncreaseItem(customPublication));
      }

      setOpen(false);
    }
  };

  const handleOpen = () => {
    setFormData(getDefaultFormData());
    setKey(Date.now());
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => {
      setFormData(getDefaultFormData());
    }, 200);
  };

  return (
    <Box>
      <Button
        variant="outlined"
        color="primary"
        sx={{ fontFamily: 'inherit', width: '100%' }}
        onClick={handleOpen}
      >
        {translate('resources.reservations.actions.add_custom')}
      </Button>
      <Modal open={open} onClose={handleClose}>
        <ModalWrapper>
          <ModalContent
            sx={(theme) => ({
              p: 3,
              backgroundColor: theme.palette.grey[100],
              border: `2px solid ${theme.palette.primary.main}`,
              maxWidth: 550,
              maxHeight: '90vh',
              overflow: 'auto',
              gap: 1.5,
            })}
          >
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h6" sx={{ fontFamily: 'inherit', flex: 1 }}>
                {translate('resources.reservations.actions.add_custom')}
              </Typography>
              <IconButton onClick={handleClose} size="small">
                <Close />
              </IconButton>
            </Box>

            <Divider />

            {open && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {/* Title Field */}
                <TextInput
                  source="custom_title"
                  label={translate('custom.labels.title')}
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  size="small"
                  helperText={false}
                  fullWidth
                />

                {/* Paper Type and Pages Row */}
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  <Autocomplete
                    size="small"
                    options={paperTypes || []}
                    getOptionLabel={(option) => option.name || ''}
                    value={paperTypes?.find((pt) => pt.id === formData.paperTypeId) || null}
                    onChange={(_, newValue) => {
                      const newPaperTypeId = newValue?.id || '';
                      const updatedItemData = updateItemData(
                        { ...formData, paperTypeId: newPaperTypeId },
                        { paperTypeId: newPaperTypeId },
                        getDefaultCoverId
                      );
                      setFormData({ ...formData, ...updatedItemData });
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={translate('resources.publications.fields.paper_type')}
                      />
                    )}
                    sx={{ flex: 1 }}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                  />

                  <TextField
                    type="number"
                    size="small"
                    label={translate('custom.labels.pages_count')}
                    value={formData.pages || ''}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        pages: parseInt(e.target.value) || 0,
                        itemPriceOverride: null,
                        paperPriceOverride: null,
                      });
                    }}
                    sx={{ width: 120 }}
                    inputProps={{ min: 1 }}
                  />
                </Box>

                {/* Paper Price and Item Price Row */}
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  <TextField
                    type="text"
                    size="small"
                    label="سعر الورق/١٠٠"
                    value={paperPrice || ''}
                    onChange={(e) => {
                      const input = e.target.value;
                      if (input === '' || /^\d*\.?\d*$/.test(input)) {
                        const val = parseFloat(input);
                        if (input === '' || isNaN(val)) {
                          // Clear override, revert to calculated
                          setFormData({
                            ...formData,
                            paperPriceOverride: null,
                            itemPriceOverride: null,
                          });
                        } else {
                          // Set override and clear item price override to recalculate
                          setFormData({
                            ...formData,
                            paperPriceOverride: val,
                            itemPriceOverride: null,
                          });
                        }
                      }
                    }}
                    sx={{ flex: 1 }}
                    InputProps={{
                      endAdornment: formData.paperPriceOverride !== null && (
                        <IconButton
                          size="small"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              paperPriceOverride: null,
                              itemPriceOverride: null,
                            })
                          }
                        >
                          <Restore fontSize="small" />
                        </IconButton>
                      ),
                    }}
                  />

                  <TextField
                    type="text"
                    size="small"
                    label={translate('custom.labels.item_price')}
                    value={
                      formData.itemPriceOverride !== null
                        ? formData.itemPriceOverride
                        : calculatedPrice || ''
                    }
                    onChange={(e) => {
                      const input = e.target.value;
                      if (input === '' || /^\d*\.?\d*$/.test(input)) {
                        const val = parseFloat(input);
                        if (input === '' || isNaN(val)) {
                          // Clear override, revert to calculated
                          setFormData({
                            ...formData,
                            itemPriceOverride: null,
                            paperPriceOverride: null,
                          });
                        } else {
                          // Set override and clear paper price override to recalculate
                          setFormData({
                            ...formData,
                            itemPriceOverride: val,
                            paperPriceOverride: null,
                          });
                        }
                      }
                    }}
                    sx={{ width: 130 }}
                    InputProps={{
                      endAdornment: formData.itemPriceOverride !== null && (
                        <IconButton
                          size="small"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              itemPriceOverride: null,
                              paperPriceOverride: null,
                            })
                          }
                        >
                          <Restore fontSize="small" />
                        </IconButton>
                      ),
                    }}
                  />
                </Box>

                {/* Cover Options */}
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.coverless}
                        onChange={(e) => setFormData({ ...formData, coverless: e.target.checked })}
                        size="small"
                      />
                    }
                    label={translate('resources.publications.fields.coverless')}
                    sx={{
                      '& .MuiTypography-root': {
                        fontFamily: 'inherit',
                        fontSize: '0.875rem',
                      },
                    }}
                  />

                  {!formData.coverless && (
                    <Autocomplete
                      size="small"
                      options={availableCovers || []}
                      getOptionLabel={(option) => option.name || ''}
                      value={availableCovers?.find((ct) => ct.id === formData.coverId) || null}
                      onChange={(_, newValue) =>
                        setFormData({ ...formData, coverId: newValue?.id || '' })
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label={translate('resources.publications.fields.cover_type')}
                        />
                      )}
                      sx={{ flex: 1, minWidth: 150 }}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                    />
                  )}
                </Box>

                {/* Additional Options */}
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.isDublix}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            isDublix: e.target.checked,
                            itemPriceOverride: null,
                            paperPriceOverride: null,
                          });
                        }}
                        size="small"
                      />
                    }
                    label={translate('resources.publications.fields.dublix')}
                    sx={{
                      '& .MuiTypography-root': {
                        fontFamily: 'inherit',
                        fontSize: '0.875rem',
                      },
                    }}
                  />
                </Box>

                {/* Quantity Field */}
                <NumberInput
                  source="custom_quantity"
                  label={translate('custom.labels.quantity')}
                  value={formData.quantity || 1}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setFormData({ ...formData, quantity: val || 1 });
                  }}
                  size="small"
                  helperText={false}
                  fullWidth
                  inputProps={{ min: 1, step: 1 }}
                />
              </Box>
            )}

            <Divider />

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                color="primary"
                sx={{ fontFamily: 'inherit' }}
                onClick={handleClose}
              >
                {translate('ra.action.cancel')}
              </Button>
              <Button
                variant="contained"
                color="success"
                sx={{ fontFamily: 'inherit' }}
                onClick={handleSubmit}
                disabled={
                  !formData.title ||
                  formData.pages <= 0 ||
                  !formData.paperTypeId ||
                  (!formData.coverless && !formData.coverId) ||
                  calculatedPrice <= 0
                }
              >
                {translate('ra.action.add')}
              </Button>
            </Box>
          </ModalContent>
        </ModalWrapper>
      </Modal>
    </Box>
  );
};

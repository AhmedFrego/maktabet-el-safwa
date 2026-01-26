import { useState } from 'react';
import { Box, Modal, Typography } from '@mui/material';
import {
  Button,
  useTranslate,
  TextInput,
  AutocompleteInput,
  useGetList,
  NumberInput,
  useStore,
} from 'react-admin';
import { ModalContent, ModalWrapper } from 'components/UI';
import { addOrIncreaseItem, useAppDispatch } from 'store';
import { Tables } from 'types';
import { ReservationMustKeys } from 'store/slices/reserviationSlice';
import { useGetCovers } from 'hooks';

export const AddCustomPublicationButton = () => {
  const translate = useTranslate();
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const [setting] = useStore<Tables<'settings'>>('settings');
  const [key, setKey] = useState(0);

  const { data: paperTypes } = useGetList('paper_types', {
    pagination: { page: 1, perPage: 100 },
  });

  const { getCovers } = useGetCovers();

  const getDefaultFormData = () => {
    const defaultPaperTypeId = setting?.default_paper_size || '';
    const defaultCovers = defaultPaperTypeId ? getCovers(defaultPaperTypeId).covers : [];
    const defaultCoverId = defaultCovers?.[0]?.id || '';

    return {
      title: '',
      price: 0,
      quantity: 1,
      paper_type_id: defaultPaperTypeId,
      cover_type_id: defaultCoverId,
      coverless: false,
    };
  };

  const [formData, setFormData] = useState(getDefaultFormData());
  const availableCovers = formData.paper_type_id ? getCovers(formData.paper_type_id).covers : [];

  const handleSubmit = () => {
    if (
      formData.title &&
      formData.price > 0 &&
      formData.paper_type_id &&
      (formData.coverless || formData.cover_type_id)
    ) {
      const selectedPaperType = paperTypes?.find((pt) => pt.id === formData.paper_type_id);
      const selectedCoverType = availableCovers?.find((ct) => ct.id === formData.cover_type_id);

      const customPublication = {
        id: `custom-${Date.now()}`,
        title: formData.title,
        price: formData.price,
        cover_type_id: formData.coverless ? null : formData.cover_type_id,
        cover_type: formData.coverless ? null : { name: selectedCoverType?.name },
        paper_type: { name: selectedPaperType?.name },
        paper_type_id: formData.paper_type_id,
        coverless: formData.coverless,
        pages: 0,
        two_faces_cover: false,
        do_round: false,
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
              maxWidth: 400,
              gap: 1,
            })}
          >
            <Typography variant="h6" gutterBottom sx={{ fontFamily: 'inherit' }}>
              {translate('resources.reservations.actions.add_custom')}
            </Typography>
            {open && (
              <Box key={key} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <TextInput
                  source="custom_title"
                  label={translate('custom.labels.title')}
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  size="small"
                  helperText={false}
                  fullWidth
                />
                <AutocompleteInput
                  source="custom_paper_type"
                  label={translate('resources.publications.fields.paper_type')}
                  defaultValue={formData.paper_type_id}
                  onChange={(value) => {
                    const newPaperTypeId = value as string;
                    const newAvailableCovers = getCovers(newPaperTypeId).covers;
                    const firstCoverId = newAvailableCovers?.[0]?.id || '';
                    setFormData({
                      ...formData,
                      paper_type_id: newPaperTypeId,
                      cover_type_id: firstCoverId,
                    });
                  }}
                  choices={paperTypes?.map((pt) => ({ id: pt.id, name: pt.name })) || []}
                  size="small"
                  helperText={false}
                  fullWidth
                />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <input
                    type="checkbox"
                    id="custom_coverless"
                    checked={formData.coverless}
                    onChange={(e) => setFormData({ ...formData, coverless: e.target.checked })}
                  />
                  <Typography
                    component="label"
                    htmlFor="custom_coverless"
                    sx={{ cursor: 'pointer', fontFamily: 'inherit' }}
                  >
                    {translate('resources.publications.fields.coverless')}
                  </Typography>
                </Box>
                {!formData.coverless && (
                  <AutocompleteInput
                    source="custom_cover_type"
                    label={translate('resources.publications.fields.cover_type')}
                    defaultValue={formData.cover_type_id}
                    onChange={(value) =>
                      setFormData({ ...formData, cover_type_id: value as string })
                    }
                    choices={availableCovers?.map((ct) => ({ id: ct.id, name: ct.name })) || []}
                    size="small"
                    helperText={false}
                    fullWidth
                  />
                )}
                <NumberInput
                  source="custom_price"
                  label={translate('custom.labels.price')}
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  size="small"
                  helperText={false}
                  fullWidth
                />
                <NumberInput
                  source="custom_quantity"
                  label={translate('custom.labels.quantity')}
                  value={formData.quantity}
                  defaultValue={1}
                  onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                  size="small"
                  helperText={false}
                  fullWidth
                />
              </Box>
            )}
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
                  !formData.price ||
                  !formData.paper_type_id ||
                  !formData.cover_type_id
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

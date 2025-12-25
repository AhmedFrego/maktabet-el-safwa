import { Box, Modal, Typography } from '@mui/material';
import {
  Button,
  Create,
  FormDataConsumer,
  maxValue,
  NumberInput,
  required,
  SimpleForm,
  useStore,
  useTranslate,
  TextInput,
  AutocompleteInput,
  useGetList,
} from 'react-admin';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { MobileDateTimePicker } from '@mui/x-date-pickers/MobileDateTimePicker';
import 'dayjs/locale/ar';

import dayjs from 'dayjs';

import { ModalContent, ModalWrapper, NestedModal } from 'components/UI';
import { supabase } from 'lib';
import {
  clearItems,
  setIsReserving,
  useAppDispatch,
  useAppSelector,
  addOrIncreaseItem,
} from 'store';
import { Tables, TablesInsert } from 'types';
import { toArabicNumerals } from 'utils';

import { ReservedItem } from './components';
import { ClientInput } from 'components/form';
import { useState, useEffect } from 'react';
import { PickerValue } from '@mui/x-date-pickers/internals';
import { ReservationMustKeys } from 'store/slices/reserviationSlice';
import { useGetCovers } from 'hooks';

export const ReservationCreate = () => {
  const translate = useTranslate();
  const dispatch = useAppDispatch();
  const [setting] = useStore<Tables<'settings'>>('settings');

  const { isReserving, reservedItems: reserved_items } = useAppSelector(
    (state) => state.reservation
  );
  const total_price = reserved_items.reduce((acc, curr) => acc + curr.totalPrice, 0);
  const dead_line = new Date(new Date().getTime() + (setting?.deliver_after || 2) * 60 * 60 * 1000);
  const [deadLine, setDeadLine] = useState<PickerValue>(dayjs(dead_line));

  const confirmReserve = async ({
    paid_amount,
    client_id,
  }: {
    paid_amount: number;
    client_id: string;
  }) => {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) return;
    const data: TablesInsert<'reservations'> = {
      created_by: session.session.user.id,
      reserved_items,
      total_price,
      paid_amount,
      client_id,
      remain_amount: total_price - paid_amount,
      dead_line: `${deadLine?.toISOString()}`,
      branch: setting?.branch,
    };

    return data;
  };

  return (
    <Modal
      open={isReserving === 'confirming'}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <ModalWrapper>
        <Create
          transform={confirmReserve}
          resource="reservations"
          mutationOptions={{ onSuccess: () => dispatch(clearItems()) }}
        >
          <SimpleForm
            toolbar={false}
            sx={(theme) => ({
              backgroundColor: theme.palette.grey[50],
              border: `2px solid ${theme.palette.info.dark}`,
              borderRadius: 1,
              width: '100%',
            })}
          >
            <ModalContent sx={{ gap: 1.5 }}>
              <ClientInput />
              {reserved_items.map((x) => (
                <ReservedItem item={x} key={x.id} />
              ))}
              <AddCustomPublicationButton />
              <Typography>
                {`${translate('custom.labels.total_price')} : ${toArabicNumerals(total_price)} ${translate('custom.currency.long')}`}
              </Typography>
              <FormDataConsumer>
                {({ formData }) => {
                  const remain_amount = total_price - (Number(formData.paid_amount) || 0);
                  return `${translate('custom.labels.remain_amount')} : ${remain_amount === 0 ? `${translate('custom.labels.no_remain_amount')}` : `${toArabicNumerals(remain_amount)} ${translate('custom.currency.long')}`}`;
                }}
              </FormDataConsumer>
              <NumberInput
                source="paid_amount"
                label={translate('custom.labels.paid_amount')}
                validate={[required(), maxValue(total_price)]}
                helperText={false}
              />
              <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ar">
                <MobileDateTimePicker
                  label={translate('resources.reservations.fields.dead_line')}
                  defaultValue={dayjs(deadLine)}
                  viewRenderers={{
                    minutes: null,
                    seconds: null,
                  }}
                  orientation="landscape"
                  onChange={(v) => setDeadLine(v)}
                  disablePast
                />
              </LocalizationProvider>
              <CTA />
            </ModalContent>
          </SimpleForm>
        </Create>
      </ModalWrapper>
    </Modal>
  );
};

const AddCustomPublicationButton = () => {
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
    };
  };

  const [formData, setFormData] = useState(getDefaultFormData());
  const availableCovers = formData.paper_type_id ? getCovers(formData.paper_type_id).covers : [];

  const handleSubmit = () => {
    if (formData.title && formData.price > 0 && formData.paper_type_id && formData.cover_type_id) {
      const selectedPaperType = paperTypes?.find((pt) => pt.id === formData.paper_type_id);
      const selectedCoverType = availableCovers?.find((ct) => ct.id === formData.cover_type_id);

      const customPublication = {
        id: `custom-${Date.now()}`,
        title: formData.title,
        price: formData.price,
        cover_type_id: formData.cover_type_id,
        cover_type: { name: selectedCoverType?.name },
        publisher: { name: '' },
        subject: { name: '' },
        paper_type: { name: selectedPaperType?.name },
        paper_type_id: formData.paper_type_id,
      } as ReservationMustKeys;

      for (let i = 0; i < formData.quantity; i++) {
        dispatch(addOrIncreaseItem(customPublication));
      }

      // Close modal
      setOpen(false);
    }
  };

  const handleOpen = () => {
    // Reset form and increment key to force complete remount
    setFormData(getDefaultFormData());
    setKey(Date.now());
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    // Reset after closing to ensure clean state next time
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
            <Typography variant="h6">
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
                  value={formData.paper_type_id}
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
                <AutocompleteInput
                  source="custom_cover_type"
                  label={translate('resources.publications.fields.cover_type')}
                  value={formData.cover_type_id}
                  onChange={(value) => setFormData({ ...formData, cover_type_id: value as string })}
                  choices={availableCovers?.map((ct) => ({ id: ct.id, name: ct.name })) || []}
                  size="small"
                  helperText={false}
                  fullWidth
                />
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

const CTA = () => {
  const dispatch = useAppDispatch();
  const translate = useTranslate();

  return (
    <Box sx={{ display: 'flex', gap: '1rem' }}>
      <NestedModal
        confirmFn={() => dispatch(clearItems())}
        title={translate('resources.reservations.actions.cancel')}
        maxWidth={400}
      />
      <Button
        variant="outlined"
        sx={{ fontFamily: 'inherit' }}
        onClick={() => dispatch(setIsReserving(true))}
        color="info"
      >
        {translate('ra.action.edit')}
      </Button>
      <Button variant="outlined" sx={{ fontFamily: 'inherit' }} type="submit" color="success">
        {translate('ra.action.confirm')}
      </Button>
    </Box>
  );
};

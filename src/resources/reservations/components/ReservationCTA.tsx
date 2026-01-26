import { useState, RefObject } from 'react';
import { Box, Modal, Typography, List, ListItem, ListItemText, Divider } from '@mui/material';
import { Button, useTranslate, useGetOne } from 'react-admin';
import { NestedModal, ModalContent, ModalWrapper } from 'components/UI';
import { clearItems, setIsReserving, useAppDispatch } from 'store';
import { ReservationRecord } from 'store/slices/reserviationSlice';
import { toArabicNumerals } from 'utils';

interface ReservationCTAProps {
  hasItems: boolean;
  onInstantDelivery: () => void;
  total_price: number;
  reserved_items: ReservationRecord[];
  client_id?: string;
  submitButtonRef: RefObject<HTMLButtonElement>;
  onCancel?: () => void;
  onEdit?: () => void;
}

export const ReservationCTA = ({
  hasItems,
  onInstantDelivery,
  total_price,
  reserved_items,
  client_id,
  submitButtonRef,
  onCancel,
  onEdit,
}: ReservationCTAProps) => {
  const dispatch = useAppDispatch();
  const translate = useTranslate();
  const [openInstantDeliveryModal, setOpenInstantDeliveryModal] = useState(false);

  const { data: clientData } = useGetOne('users', { id: client_id }, { enabled: !!client_id });

  const handleInstantDeliveryConfirm = () => {
    onInstantDelivery();
    setOpenInstantDeliveryModal(false);
    // Submit the form after setting instant delivery state
    setTimeout(() => {
      submitButtonRef.current?.click();
    }, 0);
  };

  return (
    <>
      <Box sx={{ display: 'flex', gap: '1rem' }}>
        <NestedModal
          confirmFn={onCancel || (() => dispatch(clearItems()))}
          title={translate('resources.reservations.actions.cancel')}
          maxWidth={400}
        />
        <Button
          variant="outlined"
          sx={{ fontFamily: 'inherit' }}
          onClick={onEdit || (() => dispatch(setIsReserving(true)))}
          color="info"
        >
          {translate('ra.action.edit')}
        </Button>
        <Button
          variant="outlined"
          sx={{ fontFamily: 'inherit' }}
          onClick={() => setOpenInstantDeliveryModal(true)}
          color="primary"
          disabled={!client_id || !hasItems}
        >
          {translate('custom.labels.instant_delivery')}
        </Button>
        <Button
          variant="outlined"
          sx={{ fontFamily: 'inherit' }}
          type="submit"
          color="success"
          disabled={!hasItems}
        >
          {translate('ra.action.confirm')}
        </Button>
      </Box>
      <Modal
        open={openInstantDeliveryModal}
        onClose={() => setOpenInstantDeliveryModal(false)}
        aria-labelledby="instant-delivery-modal"
      >
        <ModalWrapper>
          <ModalContent
            sx={(theme) => ({
              p: 2,
              backgroundColor: theme.palette.grey[50],
              border: `2px solid ${theme.palette.info.main}`,
              borderRadius: 1,
              maxWidth: 500,
              gap: 1.5,
            })}
          >
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 'bold',
                color: 'info.main',
                textAlign: 'center',
                pb: 0.5,
                fontFamily: 'inherit',
              }}
            >
              {translate('custom.labels.instant_delivery_confirmation')}
            </Typography>

            {clientData && (
              <Box
                sx={{
                  backgroundColor: 'background.paper',
                  p: 1,
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 'bold', mb: 0.5, fontFamily: 'inherit' }}
                >
                  {translate('custom.labels.client')}: {clientData.full_name}
                </Typography>
                {clientData.phone_number && (
                  <Typography
                    variant="caption"
                    sx={{ color: 'text.secondary', fontFamily: 'inherit' }}
                  >
                    {translate('custom.labels.phone_number')}: {clientData.phone_number}
                  </Typography>
                )}
              </Box>
            )}

            <Typography
              variant="body2"
              sx={{
                backgroundColor: 'info.light',
                p: 1,
                borderRadius: 1,
                color: 'text.primary',
                fontWeight: 500,
              }}
            >
              {translate('custom.messages.instant_delivery_warning')}
            </Typography>

            <Box
              sx={{
                backgroundColor: 'background.paper',
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider',
                p: 1.5,
                maxHeight: 250,
                overflow: 'auto',
              }}
            >
              <List dense>
                {reserved_items.map((item, index) => (
                  <Box key={item.id}>
                    <ListItem sx={{ px: 0, py: 0.5 }}>
                      <ListItemText
                        primary={
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}
                          >
                            {item.title}
                          </Typography>
                        }
                        secondary={
                          <>
                            <Typography
                              variant="caption"
                              component="span"
                              sx={{ color: 'text.secondary', display: 'inline' }}
                            >
                              {translate('custom.labels.quantity')}:{' '}
                              {toArabicNumerals(item.quantity)}
                            </Typography>
                            <Typography
                              variant="caption"
                              component="span"
                              sx={{ mx: 1, color: 'text.disabled', display: 'inline' }}
                            >
                              •
                            </Typography>
                            <Typography
                              variant="caption"
                              component="span"
                              sx={{ color: 'text.secondary', display: 'inline' }}
                            >
                              {translate('custom.labels.price')}:{' '}
                              {toArabicNumerals(item.totalPrice)}{' '}
                              {translate('custom.currency.long')}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                    {index < reserved_items.length - 1 && <Divider />}
                  </Box>
                ))}
              </List>
            </Box>

            <Divider sx={{ borderColor: 'info.main', borderWidth: 1.5 }} />

            <Box
              sx={{
                backgroundColor: 'info.light',
                p: 1,
                borderRadius: 1,
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 'bold',
                  textAlign: 'center',
                  color: 'text.primary',
                  fontFamily: 'inherit',
                }}
              >
                {translate('custom.labels.total_price')}: {toArabicNumerals(total_price)}{' '}
                {translate('custom.currency.long')}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', pt: 0.5 }}>
              <Button
                variant="outlined"
                sx={{ fontFamily: 'inherit', minWidth: 100 }}
                onClick={() => setOpenInstantDeliveryModal(false)}
                color="primary"
              >
                {translate('ra.action.cancel')}
              </Button>
              <Button
                variant="contained"
                color="info"
                sx={{ fontFamily: 'inherit', minWidth: 100 }}
                onClick={handleInstantDeliveryConfirm}
              >
                {translate('ra.action.confirm')}
              </Button>
            </Box>
          </ModalContent>
        </ModalWrapper>
      </Modal>
    </>
  );
};

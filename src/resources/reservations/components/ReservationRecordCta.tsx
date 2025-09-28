import { useState } from 'react';
import { Edit, DeleteForever, DoneAll } from '@mui/icons-material';
import { Box, ButtonGroup, Modal, styled, Typography } from '@mui/material';
import { Button, useDelete, useRedirect, useRefresh, useTranslate } from 'react-admin';

import { ModalContent, ModalWrapper } from 'components/UI';
import { myProvider, supabase } from 'lib';
import { ReservationRecord } from 'store';

import { Reservation } from '..';
import { TablesUpdate } from 'types/supabase-generated.types';

export const ReservationItemCta = ({ reservation }: ReservationItemCtaProps) => {
  const { id, total_price, reserved_items } = reservation;
  const redirect = useRedirect();
  const translate = useTranslate();
  const refresh = useRefresh();

  const handleEdit = () => redirect(id);

  const handleDeliver = async () => {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) return;

    const payload: TablesUpdate<'reservations'> = {
      reservation_status: 'delivered',
      delivered_at: new Date().toISOString(),
      dead_line: new Date().toISOString(),
      delivered_by: session.session.user.id,
      paid_amount: total_price,
      remain_amount: 0,
      reserved_items: markItemsAsDelivered(reserved_items),
    };

    console.log('Update id:', id);
    console.log('Update payload:', payload);

    await myProvider.update('reservations', { id, data: payload, previousData: reservation });
    refresh();
  };
  if (reservation.reservation_status === 'delivered') return;
  return (
    <ButtonGroup variant="outlined" size="medium" sx={{ mt: 2 }}>
      <DeletelModal id={id} />
      <StyledButton color="info" onClick={handleEdit}>
        <Edit />
        <Typography>{translate('resources.reservations.actions.update')}</Typography>
      </StyledButton>
      <StyledButton color="success" onClick={handleDeliver}>
        <DoneAll />
        <Typography>{translate('resources.reservations.actions.deliver')}</Typography>
      </StyledButton>
    </ButtonGroup>
  );
};

export const DeletelModal = ({ id }: { id: string }) => {
  const translate = useTranslate();
  const [deleteOne] = useDelete();
  const refresh = useRefresh();

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleDelete = () => deleteOne('reservations', { id }, { onSuccess: refresh });
  return (
    <Box>
      <StyledButton color="error" size="small" onClick={handleOpen}>
        <DeleteForever fontSize="inherit" />
        <Typography>{translate('resources.reservations.actions.cancel')}</Typography>
      </StyledButton>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="parent-modal-title"
        aria-describedby="parent-modal-description"
      >
        <ModalWrapper>
          <ModalContent
            sx={(theme) => ({
              p: 2,
              backgroundColor: theme.palette.grey[100],
              border: `2px solid ${theme.palette.error.main}`,
            })}
          >
            <Typography>{translate('resources.reservations.actions.cancel')}</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                sx={{ fontFamily: 'inherit' }}
                onClick={handleClose}
                color="primary"
              >
                {translate('ra.action.undo')}
              </Button>
              <Button
                variant="contained"
                color="error"
                sx={{ fontFamily: 'inherit' }}
                onClick={handleDelete}
              >
                {translate('ra.action.cancel')}
              </Button>
            </Box>
          </ModalContent>
        </ModalWrapper>
      </Modal>
    </Box>
  );
};

interface ReservationItemCtaProps {
  reservation: Reservation;
}

const markItemsAsDelivered = (items: ReservationRecord[]): ReservationRecord[] =>
  items.map((item) => ({ ...item, status: 'delivered' }));

const StyledButton = styled(Button)(({ theme }) => ({
  '& > *': {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    paddingBlock: theme.spacing(0.5),
    paddingInline: theme.spacing(1),
  },
}));

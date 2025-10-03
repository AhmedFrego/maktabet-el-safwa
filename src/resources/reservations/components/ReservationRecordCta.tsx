import { Edit, DoneAll } from '@mui/icons-material';
import { ButtonGroup, styled, Typography } from '@mui/material';
import { Button, useDelete, useRedirect, useRefresh, useTranslate } from 'react-admin';

import { NestedModal } from 'components/UI';
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

  const handleDelete = () => deleteOne('reservations', { id }, { onSuccess: refresh });
  return (
    <NestedModal
      confirmFn={handleDelete}
      title={translate('resources.reservations.actions.cancel')}
      buttonText={translate('resources.reservations.actions.cancel')}
      buttonSize="large"
    />
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

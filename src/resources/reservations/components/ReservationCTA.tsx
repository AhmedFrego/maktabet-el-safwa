import { Box } from '@mui/material';
import { Button, useTranslate } from 'react-admin';
import { NestedModal } from 'components/UI';
import { clearItems, setIsReserving, useAppDispatch } from 'store';

interface ReservationCTAProps {
  hasItems: boolean;
}

export const ReservationCTA = ({ hasItems }: ReservationCTAProps) => {
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
  );
};

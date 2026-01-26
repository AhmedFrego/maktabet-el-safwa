import { useEffect, useRef, useState } from 'react';
import {
  AppBar,
  TitlePortal,
  ToggleThemeButton,
  LoadingIndicator,
  useTranslate,
  useRedirect,
} from 'react-admin';
import { styled } from '@mui/material/styles';
import { EditNote, Settings, PointOfSale } from '@mui/icons-material';
import { clearItems, useAppDispatch, useAppSelector, setIsReserving } from 'store';

import { Box, Badge, Button, IconButton } from '@mui/material';
import { DirectReservationModal } from 'resources/reservations/components';

import { Logo } from '.';
import { toArabicNumerals } from 'utils';

export const Header = () => {
  const reDirect = useRedirect();
  return (
    <StyledAppBar
      toolbar={
        <>
          <DirectReservationButton />
          <ReservationButton />
          <ToggleThemeButton />
          <LoadingIndicator />
          <IconButton onClick={() => reDirect(`/settings`)}>
            <Settings />
          </IconButton>
        </>
      }
    >
      <StyledTitlePortal />
      <Box sx={{ flex: '1' }} />
      <Logo />
      <Box sx={{ flex: '1' }} />
    </StyledAppBar>
  );
};

const ReservationButton = () => {
  const translate = useTranslate();
  const dispatch = useAppDispatch();
  const redirect = useRedirect();
  const { isReserving, reservedItems } = useAppSelector((state) => state.reservation);
  const totalQuantity = reservedItems.reduce((cur, acc) => cur + acc.quantity, 0);

  const clickTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) {
        window.clearTimeout(clickTimeoutRef.current);
        clickTimeoutRef.current = null;
      }
    };
  }, []);

  const handleSingleClick = () => {
    if (clickTimeoutRef.current) {
      window.clearTimeout(clickTimeoutRef.current);
    }

    // Delay single click slightly to allow double click to cancel it.
    clickTimeoutRef.current = window.setTimeout(() => {
      clickTimeoutRef.current = null;

      if (!isReserving) {
        dispatch(setIsReserving(true));
        redirect('/publications');
      } else {
        dispatch(setIsReserving('confirming'));
      }
    }, 250);
  };

  const handleDoubleClick = () => {
    if (clickTimeoutRef.current) {
      window.clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
    }

    // Reset reservation slice to initial state.
    dispatch(clearItems());
  };

  return (
    <StyledReservationButton
      variant="outlined"
      onClick={handleSingleClick}
      onDoubleClick={handleDoubleClick}
    >
      <Badge
        invisible={!totalQuantity}
        badgeContent={toArabicNumerals(totalQuantity)}
        color="secondary"
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <EditNote />
      </Badge>
      {translate(
        !isReserving
          ? 'resources.reservations.actions.create'
          : 'resources.reservations.actions.confirm'
      )}
    </StyledReservationButton>
  );
};

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.grey[50],
  borderBottom: `1px solid ${theme.palette.grey[800]}`,
  height: theme.spacing(7),
  display: 'flex',
  justifyContent: 'center',
  boxShadow: `${theme.shadows[0]} `,
  '& > *': { width: '100%' },
  '& svg': {
    color: theme.palette.grey[600],
  },
}));

const StyledTitlePortal = styled(TitlePortal)(({ theme }) => ({
  color: theme.palette.success.main,
  fontFamily: theme.typography.fontFamily,
}));

const StyledReservationButton = styled(Button)(({ theme }) => ({
  color: theme.palette.success.main,
  fontFamily: theme.typography.fontFamily,
  display: 'flex',
  gap: '.5rem',
}));

const DirectReservationButton = () => {
  const translate = useTranslate();
  const [open, setOpen] = useState(false);

  return (
    <>
      <StyledReservationButton variant="outlined" onClick={() => setOpen(true)}>
        <PointOfSale />
        {translate('resources.reservations.actions.direct')}
      </StyledReservationButton>
      <DirectReservationModal open={open} onClose={() => setOpen(false)} />
    </>
  );
};

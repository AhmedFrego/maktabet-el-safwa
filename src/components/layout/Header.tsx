import {
  AppBar,
  TitlePortal,
  ToggleThemeButton,
  LoadingIndicator,
  useTranslate,
  useRedirect,
} from 'react-admin';
import { styled } from '@mui/material/styles';
import { EditNote, Settings } from '@mui/icons-material';
import { useAppDispatch, useAppSelector, setIsReserving } from 'store';

import { Box, Badge, Button, IconButton } from '@mui/material';

import { Logo } from '.';
import { toArabicNumerals } from 'utils';

export const Header = () => {
  const reDirect = useRedirect();
  return (
    <StyledAppBar
      toolbar={
        <>
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
  const { isReserving, reservedItems } = useAppSelector((state) => state.reservation);
  const totalQuantity = reservedItems.reduce((cur, acc) => cur + acc.quantity, 0);
  return (
    <StyledReservationButton
      variant="outlined"
      onClick={() => {
        if (!isReserving) dispatch(setIsReserving(true));
        else if (!reservedItems.length) dispatch(setIsReserving(false));
        else dispatch(setIsReserving('confirming'));
      }}
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
          ? 'resources.notes.actions.reserve'
          : reservedItems.length === 0
            ? 'resources.notes.actions.cancel_reserve'
            : 'resources.notes.actions.confirm_reserve'
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

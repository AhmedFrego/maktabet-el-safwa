import { AppBar, TitlePortal } from 'react-admin';
import { styled } from '@mui/material/styles';

import { Box } from '@mui/material';

import { Logo } from '.';

export const Header = () => (
  <StyledAppBar>
    <StyledTitlePortal />
    <Box sx={{ flex: '1' }} />
    <Logo />
    <Box sx={{ flex: '1' }} />
  </StyledAppBar>
);

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

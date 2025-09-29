import { Menu as RAMenu } from 'react-admin';

import { DonutLarge } from '@mui/icons-material';
import { styled } from '@mui/material';

export const Menu = () => (
  <StyledRAMenu>
    <RAMenu.DashboardItem leftIcon={<DonutLarge />} />
    <RAMenu.ResourceItems />
  </StyledRAMenu>
);

const StyledRAMenu = styled(RAMenu)(({ theme }) => ({
  maxWidth: theme.spacing(25),
  fontSize: theme.typography.caption.fontSize,

  '& > *': {
    fontSize: 'inherit',
    borderBottom: `2px solid ${theme.palette.divider}`,
    '&:hover': { borderLeft: `3px solid ${theme.palette.primary.main}` },
  },
  '& .RaMenuItemLink-active': {
    backgroundColor: theme.palette.action.selected,
    borderLeft: `3px solid ${theme.palette.primary.main}`,
    fontWeight: theme.typography.fontWeightBold,
    '& .RaMenuItemLink-icon': { color: theme.palette.primary.main },
  },
}));

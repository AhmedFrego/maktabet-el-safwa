import { Menu as RAMenu } from 'react-admin';

import { DonutLarge } from '@mui/icons-material';
import { styled } from '@mui/material';

export const Menu = () => (
  <StyledRAMenu>
    <RAMenu.Item to="/" primaryText="البيانات" leftIcon={<DonutLarge />} />

    <RAMenu.ResourceItem name="notes" />
    <RAMenu.ResourceItem name="reservations" />
    <RAMenu.ResourceItem name="settings" />
  </StyledRAMenu>
);

const StyledRAMenu = styled(RAMenu)(({ theme }) => ({
  maxWidth: theme.spacing(20),
  fontSize: theme.typography.caption.fontSize,
  '& > *': {
    fontSize: 'inherit',
    borderBottom: `2px solid ${theme.palette.divider}`,
  },
  '& .RaMenuItemLink-active': {
    backgroundColor: theme.palette.action.selected,
    color: theme.palette.primary.main,
    fontWeight: theme.typography.fontWeightBold,
    '& svg': {
      color: theme.palette.primary.main,
    },
  },
}));

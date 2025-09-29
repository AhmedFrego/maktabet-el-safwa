import { Menu as RAMenu, useStore } from 'react-admin';

import { styled, Avatar } from '@mui/material';
import { Tables } from 'types/supabase-generated.types';

export const Menu = () => {
  const [setting] = useStore<Tables<'settings'>>('settings');
  return (
    <StyledRAMenu>
      <RAMenu.DashboardItem
        leftIcon={
          <Avatar
            src={setting?.branch_avatar_url}
            alt={setting?.branch_name}
            sx={{ width: 25, height: 25 }}
          />
        }
        primaryText={setting?.branch_name}
      />
      <RAMenu.ResourceItems />
    </StyledRAMenu>
  );
};

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

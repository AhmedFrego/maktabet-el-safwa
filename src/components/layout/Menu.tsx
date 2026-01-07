import { Menu as RAMenu, useStore } from 'react-admin';

import { styled, Avatar } from '@mui/material';
import { Assessment, BarChart } from '@mui/icons-material';
import { Tables } from 'types/supabase-generated.types';
import { useAppSelector } from 'store';

export const Menu = () => {
  const [setting] = useStore<Tables<'settings'>>('settings');
  const isReserving = useAppSelector((state) => state.reservation.isReserving);

  return (
    <StyledRAMenu sx={isReserving ? { maxWidth: 0 } : {}}>
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
      <RAMenu.Item to="/reports" primaryText="التقارير المالية" leftIcon={<Assessment />} />
      <RAMenu.Item to="/analytics" primaryText="التحليلات" leftIcon={<BarChart />} />
    </StyledRAMenu>
  );
};

const StyledRAMenu = styled(RAMenu)(({ theme }) => ({
  maxWidth: 200,

  '& > *': {
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

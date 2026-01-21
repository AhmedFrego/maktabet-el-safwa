import { useEffect } from 'react';
import { useStore, useGetList, useNotify, useTranslate, useGetOne } from 'react-admin';
import { Dialog, DialogTitle, Box, Typography, Avatar } from '@mui/material';

import { Tables } from 'types';
import { Loading } from 'components/UI';

const DIRECT_PRINT_CUSTOMER_NAME = 'DIRECT_PRINT_CUSTOMER';

export const BranchSelector = () => {
  const [setting, setSetting] = useStore<Tables<'settings'>>('settings');
  const [directPrintClientId, setDirectPrintClientId] = useStore<string>('directPrintClientId');
  const translate = useTranslate();
  const notify = useNotify();

  const { data: settings, isLoading, error } = useGetList<Tables<'settings'>>('settings');

  // Fetch the direct print customer ID once (and cache it in the store)
  const { data: directPrintCustomer } = useGetList<Tables<'users'>>(
    'users',
    {
      filter: { full_name: DIRECT_PRINT_CUSTOMER_NAME },
      pagination: { page: 1, perPage: 1 },
    },
    {
      // Disable the query once we have a cached directPrintClientId
      enabled: !directPrintClientId,
    },
  );

  useEffect(() => {
    if (directPrintCustomer?.length) {
      setDirectPrintClientId(directPrintCustomer[0].id);
    }
  }, [directPrintCustomer, setDirectPrintClientId]);

  useEffect(() => {
    if (settings?.length === 1) setSetting(settings[0]);
  }, [setSetting, settings]);

  if (isLoading) {
    return (
      <Dialog open fullWidth>
        <Box display="flex" justifyContent="center" p={2}>
          <Loading />
        </Box>
      </Dialog>
    );
  }

  if (error) {
    notify(`Error fetching branches: ${error.message}`, { type: 'error' });
    return null;
  }

  return (
    <Dialog open={!setting} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontFamily: 'inherit' }} color="info">
        {translate('resources.branches.actions.choose')}
      </DialogTitle>
      {settings && (
        <Box sx={{ paddingBottom: 3, display: 'flex', justifyContent: 'center', gap: 3 }}>
          {settings.map((setting) => {
            const { branch_avatar_url, branch_name, id } = setting;

            return (
              <Box
                key={id}
                onClick={() => setSetting(setting)}
                sx={(theme) => ({
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1,
                  p: 2,
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: theme.palette.grey[200],
                  },
                })}
              >
                <Avatar src={branch_avatar_url} />
                <Typography>{branch_name}</Typography>
              </Box>
            );
          })}
        </Box>
      )}
    </Dialog>
  );
};

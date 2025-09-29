import { useEffect } from 'react';
import { useStore, useGetList, useNotify, useTranslate } from 'react-admin';
import { Dialog, DialogTitle, Box, Typography, Avatar } from '@mui/material';

import { Tables } from 'types';
import { Loading } from 'components/UI';

export const BranchSelector = () => {
  const [branch, setBranch] = useStore<Tables<'branch'>>('currentBranch');
  const translate = useTranslate();
  const notify = useNotify();

  const { data: branches, isLoading, error } = useGetList<Tables<'branch'>>('branch');

  useEffect(() => {
    if (branches?.length === 1) setBranch(branches[0]);
  }, [branches, setBranch]);

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
    <Dialog open={!branch} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontFamily: 'inherit' }} color="info">
        {translate('resources.branches.actions.choose')}
      </DialogTitle>
      {branches && (
        <Box sx={{ paddingBottom: 3, display: 'flex', justifyContent: 'center', gap: 3 }}>
          {branches.map((branch) => {
            const { avatar_url, name } = branch;

            return (
              <Box
                key={branch.id}
                onClick={() => setBranch(branch)}
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
                <Avatar src={avatar_url} />
                <Typography>{name}</Typography>
              </Box>
            );
          })}
        </Box>
      )}
    </Dialog>
  );
};

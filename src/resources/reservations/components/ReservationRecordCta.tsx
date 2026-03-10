import { Delete } from '@mui/icons-material';
import { Box } from '@mui/material';
import { useDelete, useRefresh, useTranslate } from 'react-admin';

import { NestedModal } from 'components/UI';

export const DeletelModal = ({ id }: { id: string }) => {
  const translate = useTranslate();
  const [deleteOne] = useDelete();
  const refresh = useRefresh();

  const handleDelete = () => deleteOne('reservations', { id }, { onSuccess: refresh });
  return (
    <NestedModal
      confirmFn={handleDelete}
      title={translate('resources.reservations.actions.cancel')}
      buttonText={
        <Box sx={{ gap: 1, display: 'flex', alignItems: 'center' }}>
          <Delete />
          {translate('resources.reservations.actions.cancel')}
        </Box>
      }
      buttonSize="medium"
    />
  );
};

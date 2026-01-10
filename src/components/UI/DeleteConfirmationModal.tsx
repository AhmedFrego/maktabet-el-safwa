import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  Box,
  Typography,
  ButtonGroup,
} from '@mui/material';
import { useTranslate, useDeleteMany, useNotify, useRefresh, useListContext } from 'react-admin';
import { useAppDispatch, useAppSelector, resetDeletion } from 'store';
import { removeFromAllRelated, toArabicNumerals } from 'utils';

interface Publication {
  id: string;
  subject?: { name: string };
  additional_data?: string;
  publisher?: { name: string };
  academic_year: string;
  term: string;
}

interface DeleteConfirmationModalProps {
  open: boolean;
  onClose: () => void;
}

export const DeleteConfirmationModal = ({ open, onClose }: DeleteConfirmationModalProps) => {
  const translate = useTranslate();
  const notify = useNotify();
  const refresh = useRefresh();
  const dispatch = useAppDispatch();
  const { itemsToDelete } = useAppSelector((state) => state.deletion);
  const { data: publications } = useListContext();
  const [deleteMany, { isLoading }] = useDeleteMany();

  const selectedPublications = publications?.filter((pub: { id: string }) =>
    itemsToDelete.includes(pub.id)
  );

  const handleConfirm = async () => {
    // First, remove from all related publications (cascade delete)
    try {
      await Promise.all(itemsToDelete.map((id) => removeFromAllRelated(id)));
    } catch (error) {
      console.error('Error removing related publications:', error);
      // Continue with deletion even if cascade fails
    }

    deleteMany(
      'publications',
      { ids: itemsToDelete },
      {
        onSuccess: () => {
          notify(
            `${translate('ra.notification.deleted', { smart_count: itemsToDelete.length })} (${toArabicNumerals(itemsToDelete.length)})`,
            { type: 'success' }
          );
          dispatch(resetDeletion());
          refresh();
          onClose();
        },
        onError: () => {
          notify('ra.notification.http_error', { type: 'error' });
        },
      }
    );
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          border: 2,
          borderColor: 'error.main',
        },
      }}
    >
      <DialogContent>
        <Typography variant="body1" gutterBottom>
          {translate('ra.message.delete_content', { smart_count: itemsToDelete.length })}
          {` (${toArabicNumerals(itemsToDelete.length)})`}
        </Typography>
        {selectedPublications && selectedPublications.length > 0 && (
          <Box sx={{ mt: 2, maxHeight: 300, overflow: 'auto' }}>
            <List dense>
              {selectedPublications.map((pub: Publication) => {
                const academicYearName = translate(
                  `custom.labels.academic_years.${pub.academic_year}.name`
                );
                const termName = translate(`custom.labels.terms.${pub.term}.name`);
                return (
                  <ListItem
                    key={pub.id}
                    sx={(theme) => ({
                      backgroundColor: theme.palette.background.paper,
                      mb: 0.5,
                      borderRadius: 1,
                    })}
                  >
                    <ListItemText
                      primary={`${pub.subject?.name || ''} ${pub.additional_data || ''} ${pub.publisher?.name || ''} - ${academicYearName} ${termName}`}
                    />
                  </ListItem>
                );
              })}
            </List>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <ButtonGroup>
          <Button
            onClick={handleConfirm}
            color="error"
            variant="contained"
            disabled={isLoading}
            sx={{ fontFamily: 'inherit' }}
          >
            {translate('ra.action.delete')}
          </Button>{' '}
          <Button
            variant="contained"
            color="success"
            onClick={handleCancel}
            disabled={isLoading}
            sx={{ fontFamily: 'inherit' }}
          >
            {translate('ra.action.cancel')}
          </Button>
        </ButtonGroup>
      </DialogActions>
    </Dialog>
  );
};

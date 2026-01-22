import { Add, Close, Save, Visibility } from '@mui/icons-material';
import { Box, Button, CircularProgress } from '@mui/material';
import { useTranslate } from 'react-admin';
import { useFormContext, useFormState } from 'react-hook-form';

interface RelatedPublicationFormActionsProps {
  isLoading: boolean;
  onBack: () => void;
  onViewPublication: () => void;
  onSaveAndAddAnother: (data: Record<string, unknown>) => void;
  onSave: (data: Record<string, unknown>) => void;
}

export const RelatedPublicationFormActions = ({
  isLoading,
  onBack,
  onViewPublication,
  onSaveAndAddAnother,
  onSave,
}: RelatedPublicationFormActionsProps) => {
  const translate = useTranslate();
  const { getValues } = useFormContext();
  const { isValid } = useFormState();

  const handleSaveAndAddAnother = () => {
    if (isValid) {
      onSaveAndAddAnother(getValues());
    }
  };

  const handleSave = () => {
    if (isValid) {
      onSave(getValues());
    }
  };

  return (
    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
      <Button
        variant="outlined"
        color="primary"
        startIcon={<Close />}
        onClick={onBack}
        sx={{ fontFamily: 'inherit' }}
      >
        {translate('ra.action.cancel')}
      </Button>
      <Button
        variant="outlined"
        color="info"
        startIcon={<Visibility />}
        onClick={onViewPublication}
        sx={{ fontFamily: 'inherit' }}
      >
        {translate('resources.publications.messages.view_publication')}
      </Button>
      <Button
        variant="outlined"
        color="secondary"
        startIcon={isLoading ? <CircularProgress size={16} /> : <Add />}
        onClick={handleSaveAndAddAnother}
        disabled={isLoading || !isValid}
        sx={{ fontFamily: 'inherit' }}
      >
        {translate('resources.publications.messages.save_and_add_another')}
      </Button>
      <Button
        variant="contained"
        color="success"
        startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : <Save />}
        onClick={handleSave}
        disabled={isLoading || !isValid}
        sx={{ fontFamily: 'inherit' }}
      >
        {translate('resources.publications.messages.save_related_publication')}
      </Button>
    </Box>
  );
};

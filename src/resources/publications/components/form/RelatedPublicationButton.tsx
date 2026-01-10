import { Link as LinkIcon } from '@mui/icons-material';
import { Button } from '@mui/material';
import { useSaveContext, useTranslate, FormDataConsumer } from 'react-admin';
import { useFormState } from 'react-hook-form';

interface RelatedPublicationButtonProps {
  onSuccess?: (data: unknown) => void;
}

export const RelatedPublicationButton = ({ onSuccess }: RelatedPublicationButtonProps) => {
  const { save } = useSaveContext();
  const translate = useTranslate();

  const handleRelatedPublicationClick = async () => {
    if (save) {
      await save(
        {},
        {
          onSuccess: (data) => {
            if (onSuccess) {
              onSuccess(data);
            }
          },
        }
      );
    }
  };

  return (
    <FormDataConsumer>
      {({ formData }) => {
        const ButtonContent = () => {
          const { isValid } = useFormState();
          const isDisabled = !isValid || !formData.additional_data;

          return (
            <Button
              type="button"
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              startIcon={<LinkIcon />}
              onClick={handleRelatedPublicationClick}
              disabled={isDisabled}
              sx={{ fontFamily: 'inherit', py: 1.5 }}
            >
              {translate('resources.publications.messages.save_and_manage_related')}
            </Button>
          );
        };

        return <ButtonContent />;
      }}
    </FormDataConsumer>
  );
};

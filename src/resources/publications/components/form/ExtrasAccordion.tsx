import { PropsWithChildren, useEffect, useState } from 'react';
import { KeyboardDoubleArrowDown, Star, StarBorder } from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  CircularProgress,
  Typography,
} from '@mui/material';
import {
  AutocompleteInput,
  BooleanInput,
  number,
  ReferenceInput,
  required,
  TextInput,
  FormDataConsumer,
  useRecordContext,
  useNotify,
  useRefresh,
  useTranslate,
} from 'react-admin';
import { useFormContext } from 'react-hook-form';

import { toArabicNumerals } from 'utils';
import { setCollectionMaster } from 'utils/helpers/syncRelatedPublications';
import { Tables } from 'types';

import { TermInput, YearInput, RelatedPublicationButton } from '.';

interface ExtrasAccordionProps extends PropsWithChildren {
  onRelatedPublicationSuccess?: (data: unknown) => void;
}

/**
 * Button to toggle collection master status for publications with related items.
 * Only visible when the publication has related_publications.
 */
const SetMasterButton = () => {
  const record = useRecordContext<Tables<'publications'>>();
  const notify = useNotify();
  const refresh = useRefresh();
  const translate = useTranslate();
  const [isLoading, setIsLoading] = useState(false);

  // Only show button if publication has related items
  const hasRelatedPublications =
    record?.related_publications && (record.related_publications as string[]).length > 0;

  if (!hasRelatedPublications || !record) return null;

  const isMaster = record.is_collection_master === true;

  const handleSetMaster = async () => {
    if (isMaster) return; // Already master, do nothing

    setIsLoading(true);
    try {
      const result = await setCollectionMaster(record.id);
      if (result.success) {
        notify(translate('resources.publications.messages.set_master_success'), {
          type: 'success',
        });
        refresh();
      } else {
        notify(result.error || translate('resources.publications.messages.set_master_error'), {
          type: 'error',
        });
      }
    } catch (error) {
      notify(translate('resources.publications.messages.set_master_error'), { type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={isMaster ? 'contained' : 'outlined'}
      color={isMaster ? 'warning' : 'inherit'}
      startIcon={
        isLoading ? (
          <CircularProgress size={16} color="inherit" />
        ) : isMaster ? (
          <Star />
        ) : (
          <StarBorder />
        )
      }
      onClick={handleSetMaster}
      disabled={isLoading || isMaster}
      sx={{
        fontFamily: 'inherit',
        alignSelf: 'flex-start',
      }}
    >
      {isMaster
        ? translate('resources.publications.messages.is_collection_master')
        : translate('resources.publications.messages.set_as_master')}
    </Button>
  );
};

export const ExtrasAccordion = ({
  children,
  onRelatedPublicationSuccess,
}: ExtrasAccordionProps) => {
  return (
    <Accordion sx={{ '&.Mui-expanded': { m: 0 } }}>
      <AccordionSummary
        expandIcon={<KeyboardDoubleArrowDown />}
        sx={(theme) => ({
          width: '100%',
          fontFamily: 'inherit',
          backgroundColor: theme.palette.action.hover,
          '& .MuiAccordionSummary-content.Mui-expanded': {
            m: 0,
          },
          '&.MuiAccordionSummary-root.Mui-expanded': {
            mb: 2,
            minHeight: 45,
          },
        })}
      >
        المزيد من التفاصيل
      </AccordionSummary>
      <AccordionDetails sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <ReferenceInput source="paper_type_id" reference="paper_types">
          <AutocompleteInput
            fullWidth
            helperText={false}
            filterToQuery={(searchText) => ({ 'name@ilike': `%${searchText}%` })}
            validate={[required()]}
          />
        </ReferenceInput>

        <TermInput />
        <YearInput source="year" />

        <TextInput fullWidth source="additional_data" helperText={false} />

        <RelatedPublicationButton onSuccess={onRelatedPublicationSuccess} />

        <SetMasterButton />

        <BooleanInput source="do_round" defaultValue={true} helperText={false} />

        <BooleanInput source="coverless" defaultValue={false} helperText={false} />

        <FormDataConsumer>
          {({ formData }) => {
            // Component to handle side effect of resetting two_faces_cover
            const TwoFacesCoverController = () => {
              const { setValue, watch } = useFormContext();
              const coverless = watch('coverless');

              useEffect(() => {
                if (coverless) {
                  setValue('two_faces_cover', false);
                }
              }, [coverless, setValue]);

              return (
                <BooleanInput
                  source="two_faces_cover"
                  defaultValue={false}
                  helperText={false}
                  disabled={formData.coverless}
                />
              );
            };

            return <TwoFacesCoverController />;
          }}
        </FormDataConsumer>

        <Box sx={{ width: '100%', gap: 1, display: 'flex', flexDirection: 'column' }}>
          <Typography>
            {toArabicNumerals('تعديل السعر بقيمة (5, - 10 , إلخ ...) بالجنيه')}
          </Typography>

          <Box sx={{ width: '100%', gap: 1, display: 'flex' }}>
            <TextInput
              source="change_price.oneFacePrice"
              helperText={false}
              validate={[number()]}
            />
            <TextInput
              source="change_price.twoFacesPrice"
              helperText={false}
              validate={[number()]}
            />
          </Box>
        </Box>
        {children}
      </AccordionDetails>
    </Accordion>
  );
};

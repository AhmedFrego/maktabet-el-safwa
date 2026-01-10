import { useEffect } from 'react';
import {
  AutocompleteInput,
  BooleanInput,
  number,
  ReferenceInput,
  required,
  TextInput,
  FormDataConsumer,
} from 'react-admin';
import { useFormContext } from 'react-hook-form';
import { Box } from '@mui/material';

import { CoverInput } from './CoverInput';

interface RelatedPublicationFieldsProps {
  showCover?: boolean;
}

/**
 * Reusable form fields for creating/editing related publications.
 * These are the fields that can differ between related publications:
 * - pages
 * - paper_type_id
 * - additional_data
 * - do_round
 * - coverless
 * - two_faces_cover
 * - cover (optional)
 *
 * Must be used within a react-admin Form context.
 */
export const RelatedPublicationFields = ({ showCover = true }: RelatedPublicationFieldsProps) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <TextInput fullWidth source="pages" helperText={false} validate={[required(), number()]} />

      <ReferenceInput source="paper_type_id" reference="paper_types">
        <AutocompleteInput
          fullWidth
          helperText={false}
          filterToQuery={(searchText) => ({ 'name@ilike': `%${searchText}%` })}
          validate={[required()]}
        />
      </ReferenceInput>

      <TextInput fullWidth source="additional_data" helperText={false} validate={[required()]} />

      <BooleanInput source="do_round" defaultValue={false} helperText={false} />

      <BooleanInput source="coverless" defaultValue={false} helperText={false} />

      <FormDataConsumer>
        {({ formData }) => <TwoFacesCoverController coverless={formData.coverless} />}
      </FormDataConsumer>

      {showCover && (
        <FormDataConsumer>
          {({ formData }) => (!formData.coverless ? <CoverInput /> : null)}
        </FormDataConsumer>
      )}
    </Box>
  );
};

// Controller for two_faces_cover that auto-disables when coverless is true
const TwoFacesCoverController = ({ coverless }: { coverless: boolean }) => {
  const { setValue, watch } = useFormContext();
  const isCoverless = watch('coverless');

  useEffect(() => {
    if (isCoverless) {
      setValue('two_faces_cover', false);
    }
  }, [isCoverless, setValue]);

  return (
    <BooleanInput
      source="two_faces_cover"
      defaultValue={false}
      helperText={false}
      disabled={coverless}
    />
  );
};

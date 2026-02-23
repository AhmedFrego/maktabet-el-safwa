import { Box, Paper, Typography, Chip } from '@mui/material';
import {
  AutocompleteInput,
  number,
  ReferenceInput,
  required,
  TextInput,
  useTranslate,
} from 'react-admin';
import { Tables } from 'types';
import { toArabicNumerals } from 'utils';

import { PublicationTypesInput } from './PublicationTypesInput';
import { SubjectsInput } from './SubjectsInput';
import { PublishersInput } from './PublishersInput';
import { AcademicYearsInput } from './AcademicYearsInput';
import { CoverInput } from './CoverInput';
import { ExtrasAccordion } from './ExtrasAccordion';
import { PriceDisplay } from './PriceDisplay';

interface PublicationFormProps {
  mode?: 'create' | 'related';
  parentPublication?: Tables<'publications'>;
  parentSubjectName?: string;
  parentPublisherName?: string;
  onRelatedPublicationSuccess?: (data: unknown) => void;
}

export const PublicationForm = ({
  mode = 'create',
  parentPublication,
  parentSubjectName,
  parentPublisherName,
  onRelatedPublicationSuccess,
}: PublicationFormProps) => {
  const translate = useTranslate();
  const isRelatedMode = mode === 'related';

  return (
    <>
      {/* Show parent info banner when in related mode */}
      {isRelatedMode && parentPublication && (
        <Paper
          sx={{
            p: 2,
            mb: 2,
            backgroundColor: 'info.light',
            border: '2px solid',
            borderColor: 'info.main',
          }}
        >
          <Typography variant="subtitle2" sx={{ fontFamily: 'inherit', mb: 1, fontWeight: 'bold' }}>
            {translate('resources.publications.messages.inherited_from_parent')}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {parentSubjectName && (
              <Chip
                label={`${translate('resources.publications.fields.subject_id')}: ${parentSubjectName}`}
                size="small"
                sx={{ fontFamily: 'inherit' }}
              />
            )}
            {parentPublisherName && (
              <Chip
                label={`${translate('resources.publications.fields.publisher')}: ${parentPublisherName}`}
                size="small"
                sx={{ fontFamily: 'inherit' }}
              />
            )}
            {parentPublication.academic_year && (
              <Chip
                label={`${translate('resources.publications.fields.academic_year')}: ${translate(
                  `custom.labels.academic_years.${parentPublication.academic_year}.name`
                )}`}
                size="small"
                sx={{ fontFamily: 'inherit' }}
              />
            )}
            {parentPublication.term && (
              <Chip
                label={`${translate('resources.publications.fields.term')}: ${translate(
                  `custom.labels.terms.${parentPublication.term}.name`
                )}`}
                size="small"
                sx={{ fontFamily: 'inherit' }}
              />
            )}
            {parentPublication.year && (
              <Chip
                label={`${translate('resources.publications.fields.year')}: ${toArabicNumerals(
                  parentPublication.year
                )}`}
                size="small"
                sx={{ fontFamily: 'inherit' }}
              />
            )}
          </Box>
        </Paper>
      )}

      {/* Fields only shown in regular create mode */}
      {!isRelatedMode && (
        <>
          <PublicationTypesInput source="publication_type" validate={[required()]} />
          <SubjectsInput validate={[required()]} />
          <PublishersInput validate={[required()]} />
          <AcademicYearsInput validate={[required()]} />
        </>
      )}

      {/* Common fields */}
      <TextInput fullWidth source="pages" helperText={false} validate={[required(), number()]} />

      {/* Paper type - shown directly in related mode */}
      {isRelatedMode && (
        <ReferenceInput source="paper_type_id" reference="paper_types">
          <AutocompleteInput
            fullWidth
            helperText={false}
            filterToQuery={(searchText) => ({ 'name@ilike': `%${searchText}%` })}
            validate={[required()]}
          />
        </ReferenceInput>
      )}

      {/* Additional data - only in related mode */}
      {isRelatedMode && (
        <TextInput fullWidth source="additional_data" helperText={false} validate={[required()]} />
      )}

      <CoverInput />
      <ExtrasAccordion onRelatedPublicationSuccess={onRelatedPublicationSuccess} />
      <PriceDisplay />
    </>
  );
};

import {
  AutocompleteInput,
  BooleanInput,
  DateInput,
  Edit,
  NumberInput,
  ReferenceInput,
  TextInput,
  useTranslate,
} from 'react-admin';
import { StyledForm } from 'components/form';

import { ImageInput, FileField } from 'react-admin';
import { AccordionSummary, Accordion, AccordionDetails } from '@mui/material';
import { KeyboardDoubleArrowDown } from '@mui/icons-material';
import { Enums } from 'types/supabase-generated.types';

export const PublicationEdit = () => {
  const translate = useTranslate();

  const termsOptions = [
    { id: '1st', name: translate('resources.publications.labels.term.1st') },
    { id: '2nd', name: translate('resources.publications.labels.term.2nd') },
    { id: 'full_year', name: translate('resources.publications.labels.term.full_year') },
  ] as {
    id: Enums<'term'>;
    name: string;
  }[];
  return (
    <Edit>
      <StyledForm>
        <ReferenceInput source="subject_id" reference="subjects">
          <AutocompleteInput
            fullWidth
            filterToQuery={(searchText) => ({ 'name@ilike': `%${searchText}%` })}
          />
        </ReferenceInput>

        <ReferenceInput source="publisher" reference="publishers">
          <AutocompleteInput
            sx={{ width: '100%', fontSize: '1rem' }}
            filterToQuery={(searchText) => ({ 'name@ilike': `%${searchText}%` })}
          />
        </ReferenceInput>

        <ReferenceInput source="academic_year" reference="academic_years">
          <AutocompleteInput
            fullWidth
            filterToQuery={(searchText) => ({ 'name@ilike': `%${searchText}%` })}
          />
        </ReferenceInput>

        <NumberInput fullWidth source="pages" />

        <ImageInput source="cover_url" accept={{ 'image/*': ['.png', '.jpg'] }}>
          <FileField source="src" title="title" />
        </ImageInput>

        <Accordion sx={{ '&.Mui-expanded': { m: 0 } }}>
          <AccordionSummary
            expandIcon={<KeyboardDoubleArrowDown />}
            sx={(theme) => ({
              width: '100%',
              fontFamily: 'inherit',
              backgroundColor: theme.palette.action.hover,
              '& .MuiAccordionSummary-content': {
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

          <AccordionDetails>
            <TextInput fullWidth source="year" />

            <ReferenceInput source="default_paper_size" reference="paper_types">
              <AutocompleteInput
                fullWidth
                filterToQuery={(searchText) => ({ 'name@ilike': `%${searchText}%` })}
              />
            </ReferenceInput>

            <AutocompleteInput
              fullWidth
              filterToQuery={(searchText) => ({ 'name@ilike': `%${searchText}%` })}
              source="term"
              choices={termsOptions}
            />

            <TextInput fullWidth source="additional_data" />

            <TextInput fullWidth source="related_notes" />

            <BooleanInput source="do_round" />

            <NumberInput fullWidth source="price" />

            <DateInput source="created_at" fullWidth disabled />

            <TextInput source="created_by" fullWidth disabled />

            <DateInput source="updated_at" fullWidth disabled />

            <TextInput source="updated_by" fullWidth disabled />
          </AccordionDetails>
        </Accordion>
      </StyledForm>
    </Edit>
  );
};

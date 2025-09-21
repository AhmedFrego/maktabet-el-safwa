import {
  AutocompleteInput,
  BooleanInput,
  DateInput,
  Edit,
  NumberInput,
  ReferenceInput,
  TextInput,
} from 'react-admin';
import { StyledForm } from 'components/form';

import { ImageInput, FileField } from 'react-admin';
import { AccordionSummary, Accordion, AccordionDetails } from '@mui/material';
import { KeyboardDoubleArrowDown } from '@mui/icons-material';

export const NoteEdit = () => (
  <Edit>
    <StyledForm>
      <ReferenceInput source="subject_id" reference="subjects">
        <AutocompleteInput
          sx={{ width: '100%' }}
          filterToQuery={(searchText) => ({ 'name@ilike': `%${searchText}%` })}
        />
        <TextInput sx={{ width: '100%' }} source="nickname" />
      </ReferenceInput>
      <ReferenceInput source="teacher_id" reference="teachers">
        <AutocompleteInput
          sx={{ width: '100%', fontSize: '1rem' }}
          filterToQuery={(searchText) => ({ 'name@ilike': `%${searchText}%` })}
        />
      </ReferenceInput>
      <ReferenceInput source="academic_year" reference="academic_years">
        <AutocompleteInput
          sx={{ width: '100%' }}
          filterToQuery={(searchText) => ({ 'name@ilike': `%${searchText}%` })}
        />
      </ReferenceInput>

      <NumberInput sx={{ width: '100%' }} source="pages" />
      <ImageInput source="cover_url" accept={{ 'image/*': ['.png', '.jpg'] }}>
        <FileField source="src" title="title" />
      </ImageInput>

      <Accordion>
        <AccordionSummary expandIcon={<KeyboardDoubleArrowDown />} sx={{ width: '100%' }}>
          المزيد من التفاصيل
        </AccordionSummary>
        <AccordionDetails>
          <TextInput sx={{ width: '100%' }} source="year" />
          <ReferenceInput source="default_paper_size" reference="paper_sizes">
            <AutocompleteInput
              sx={{ width: '100%' }}
              filterToQuery={(searchText) => ({ 'name@ilike': `%${searchText}%` })}
            />
          </ReferenceInput>
          <ReferenceInput source="term_id" reference="terms">
            <AutocompleteInput
              sx={{ width: '100%' }}
              filterToQuery={(searchText) => ({ 'name@ilike': `%${searchText}%` })}
            />
          </ReferenceInput>
          <TextInput sx={{ width: '100%' }} source="additional_data" />
          <TextInput sx={{ width: '100%' }} source="related_notes" />
          <BooleanInput source="do_round" defaultValue={true} />
          <NumberInput sx={{ width: '100%' }} source="price" />
          <DateInput source="created_at" sx={{ width: '100%' }} disabled />
          <TextInput source="created_by" sx={{ width: '100%' }} disabled />
          <DateInput source="updated_at" sx={{ width: '100%' }} disabled />
          <TextInput source="updated_by" sx={{ width: '100%' }} disabled />
        </AccordionDetails>
      </Accordion>
    </StyledForm>
  </Edit>
);

import {
  AutocompleteInput,
  BooleanInput,
  DateInput,
  Edit,
  NumberInput,
  ReferenceInput,
  SimpleForm,
  TextInput,
} from 'react-admin';

export const NoteEdit = () => (
  <Edit>
    <SimpleForm>
      <DateInput source="created_at" />
      <TextInput source="created_by" />
      <DateInput source="updated_at" />
      <TextInput source="updated_by" />
      <ReferenceInput source="teacher_id" reference="teachers">
        <AutocompleteInput filterToQuery={(searchText) => ({ 'name@ilike': `%${searchText}%` })} />
      </ReferenceInput>
      <NumberInput source="pages" />
      <TextInput source="cover_url" />
      <TextInput source="year" />
      <ReferenceInput source="subject_id" reference="subjects">
        <AutocompleteInput filterToQuery={(searchText) => ({ 'name@ilike': `%${searchText}%` })} />
      </ReferenceInput>
      <ReferenceInput source="academic_year" reference="academic_years">
        <AutocompleteInput filterToQuery={(searchText) => ({ 'name@ilike': `%${searchText}%` })} />
      </ReferenceInput>
      <ReferenceInput source="default_paper_size" reference="paper_sizes">
        <AutocompleteInput filterToQuery={(searchText) => ({ 'name@ilike': `%${searchText}%` })} />
      </ReferenceInput>
      <ReferenceInput source="term_id" reference="terms">
        <AutocompleteInput filterToQuery={(searchText) => ({ 'name@ilike': `%${searchText}%` })} />
      </ReferenceInput>
      <TextInput source="additional_data" />
      <TextInput source="related_notes" />
      <TextInput source="nickname" />
      <BooleanInput source="do_round" />
      <NumberInput source="price" />
    </SimpleForm>
  </Edit>
);

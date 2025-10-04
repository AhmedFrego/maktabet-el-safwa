import { AutocompleteInput, ReferenceInput, useDataProvider } from 'react-admin';

export const SubjectsInput = ({ source = 'subject_id' }: SubjectsInputProps) => {
  const dataProvider = useDataProvider();

  return (
    <ReferenceInput source={source} reference="subjects">
      <AutocompleteInput
        fullWidth
        filterToQuery={(searchText) => ({ 'name@ilike': `%${searchText}%` })}
        onCreate={async (value) => {
          const { data } = await dataProvider.create('subjects', { data: { name: value } });
          return data;
        }}
        helperText={false}
      />
    </ReferenceInput>
  );
};

interface SubjectsInputProps {
  source?: string;
}

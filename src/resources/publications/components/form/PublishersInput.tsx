import { AutocompleteInput, ReferenceInput, useDataProvider } from 'react-admin';

export const PublishersInput = ({ source = 'publisher' }: PublishersInputProps) => {
  const dataProvider = useDataProvider();
  return (
    <ReferenceInput source={source} reference="publishers">
      <AutocompleteInput
        sx={{ width: '100%', fontSize: '1rem' }}
        helperText={false}
        filterToQuery={(searchText) => ({ 'name@ilike': `%${searchText}%` })}
        onCreate={async (name) => {
          const { data } = await dataProvider.create('publishers', { data: { name } });
          return data;
        }}
      />
    </ReferenceInput>
  );
};

interface PublishersInputProps {
  source?: string;
}

import { AutocompleteInput } from 'react-admin';
import { usePublicationTypesChoices } from 'resources/publications/hooks';

export const PublicationTypesInput = ({
  source = 'publication_type',
}: PublicationTypesInputProps) => {
  const publicationTypesChoises = usePublicationTypesChoices();
  return (
    <AutocompleteInput
      source={source}
      choices={publicationTypesChoises}
      fullWidth
      helperText={false}
    />
  );
};

interface PublicationTypesInputProps {
  source?: string;
}

import { AutocompleteInput, AutocompleteInputProps } from 'react-admin';
import { usePublicationTypesChoices } from 'resources/publications/hooks';

export const PublicationTypesInput = ({
  source = 'publication_type',
  ...props
}: PublicationTypesInputProps) => {
  const publicationTypesChoises = usePublicationTypesChoices();
  return (
    <AutocompleteInput
      source={source}
      choices={publicationTypesChoises}
      fullWidth
      helperText={false}
      {...props}
    />
  );
};

interface PublicationTypesInputProps extends AutocompleteInputProps {
  source?: string;
}

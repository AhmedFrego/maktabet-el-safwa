import { AutocompleteInput, AutocompleteInputProps, useStore } from 'react-admin';
import { useTermsChoises } from 'resources/publications/hooks';
import { Tables } from 'types/supabase-generated.types';

export const TermInput = ({ source = 'term', ...props }: TermInputProps) => {
  const termsOptions = useTermsChoises();
  const [setting] = useStore<Tables<'settings'>>('settings');

  return (
    <AutocompleteInput
      {...props}
      fullWidth
      source={source}
      filterToQuery={(searchText) => ({ 'name@ilike': `%${searchText}%` })}
      choices={termsOptions}
      defaultValue={setting?.current_term}
      helperText={false}
    />
  );
};
interface TermInputProps extends AutocompleteInputProps {
  source?: string;
}

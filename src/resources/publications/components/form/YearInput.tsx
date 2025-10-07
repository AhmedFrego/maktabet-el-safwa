import { choices, required, TextInput, TextInputProps, useStore } from 'react-admin';
import { Tables } from 'types/supabase-generated.types';

export const YearInput = ({ ...props }: TextInputProps) => {
  const [setting] = useStore<Tables<'settings'>>('settings');

  return (
    <TextInput
      fullWidth
      helperText={false}
      defaultValue={setting?.current_year}
      validate={[
        required(),
        choices([
          `${new Date().getFullYear() + 1}`,
          `${new Date().getFullYear()}`,
          `${new Date().getFullYear() - 1}`,
        ]),
      ]}
      {...props}
    />
  );
};

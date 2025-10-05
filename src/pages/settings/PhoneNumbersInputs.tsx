import { PhoneDisabled, PhoneEnabled, WhatsApp } from '@mui/icons-material';
import { Box, Divider } from '@mui/material';
import { CustomCheckBox } from 'components/form';
import {
  ArrayInput,
  regex,
  required,
  SimpleFormIterator,
  TextInput,
  useStore,
  useTranslate,
} from 'react-admin';
import { Tables } from 'types/supabase-generated.types';

export const PhoneNumbersInputs = () => {
  const [setting] = useStore<Tables<'settings'>>('settings');
  const translate = useTranslate();

  return (
    <ArrayInput
      source="branch_phone_numbers"
      defaultValue={setting?.branch_phone_numbers}
      helperText={false}
      label={translate('custom.labels.branch_phone_numbers')}
    >
      <SimpleFormIterator
        inline
        sx={{
          '& > .RaSimpleFormIterator-list': {
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            '& > .RaSimpleFormIterator-line': { border: 'none' },
          },
        }}
      >
        <Divider orientation="vertical" />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <TextInput
            source="phone_number"
            label={translate('custom.labels.phone_number')}
            helperText={false}
            validate={[required(), regex(/^01[0125]\d{8}$/, 'لا يبدو كرقم هاتف صحيح')]}
            size="small"
          />
          <CustomCheckBox
            source="have_whats_app"
            label={'whats_app'}
            checkedIcon={<WhatsApp color="success" />}
            icon={<WhatsApp />}
          />
          <CustomCheckBox
            source="is_for_calling"
            label={'for_calling'}
            checkedIcon={<PhoneEnabled color="primary" />}
            icon={<PhoneDisabled color="secondary" />}
          />
        </Box>
      </SimpleFormIterator>
    </ArrayInput>
  );
};

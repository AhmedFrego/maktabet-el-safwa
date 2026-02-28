import { FormControlLabel, Switch } from '@mui/material';
import { useTranslate, useStore } from 'react-admin';

export const ShowSeparatelyToggle = () => {
  const translate = useTranslate();
  const [showGrouped, setShowGrouped] = useStore<boolean>('publications.showGrouped', true);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setShowGrouped(event.target.checked);
  };

  return (
    <FormControlLabel
      control={<Switch checked={showGrouped} onChange={handleChange} color="primary" />}
      label={translate('resources.publications.filters.show_separately')}
      sx={{
        mb: 1,
        '& .MuiFormControlLabel-label': {
          fontFamily: 'inherit',
          fontSize: '0.875rem',
        },
      }}
    />
  );
};

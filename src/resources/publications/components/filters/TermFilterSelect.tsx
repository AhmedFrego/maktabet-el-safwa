import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { DateRange } from '@mui/icons-material';
import { useTranslate, useListContext } from 'react-admin';
import { Enums } from 'types/supabase-generated.types';

export const TermFilterSelect = () => {
  const translate = useTranslate();
  const { filterValues, setFilters } = useListContext();

  const termsMap = [
    { id: '1st', name: translate('resources.publications.labels.term.1st') },
    { id: '2nd', name: translate('resources.publications.labels.term.2nd') },
    { id: 'full_year', name: translate('resources.publications.labels.term.full_year') },
  ] as {
    id: Enums<'term'>;
    name: string;
  }[];

  const handleChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    if (value === '') {
      const { ...rest } = filterValues;
      setFilters(rest, []);
    } else {
      setFilters({ ...filterValues, term: value }, []);
    }
  };

  return (
    <FormControl fullWidth size="small" sx={{ mb: 1 }}>
      <InputLabel id="term-filter-label">
        <DateRange fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
        {translate('custom.filters.term_id')}
      </InputLabel>
      <Select
        labelId="term-filter-label"
        value={filterValues.term || ''}
        label={translate('custom.filters.term_id')}
        onChange={handleChange}
      >
        <MenuItem value="">
          <em>{translate('ra.action.clear_input_value')}</em>
        </MenuItem>
        {termsMap.map((term) => (
          <MenuItem key={term.id} value={term.id}>
            {term.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

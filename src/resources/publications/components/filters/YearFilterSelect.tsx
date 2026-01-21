import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { useTranslate, useListContext, useStore } from 'react-admin';
import { toArabicNumerals } from 'utils';
import { Tables } from 'types/supabase-generated.types';

export const YearFilterSelect = ({ uniqueYears }: { uniqueYears: string[] }) => {
  const translate = useTranslate();
  const { filterValues, setFilters } = useListContext();
  const [setting] = useStore<Tables<'settings'>>('settings');

  const handleChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    if (value === '') {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { year: _, ...rest } = filterValues;
      setFilters(rest, []);
    } else {
      setFilters({ ...filterValues, year: value }, []);
    }
  };

  return (
    <FormControl fullWidth size="small" sx={{ mb: 1 }}>
      <InputLabel id="year-filter-label">{translate('custom.filters.year')}</InputLabel>
      <Select
        labelId="year-filter-label"
        value={filterValues.year ?? setting?.current_year ?? ''}
        label={translate('custom.filters.year')}
        onChange={handleChange}
      >
        <MenuItem value="">
          <em>{translate('ra.action.clear_input_value')}</em>
        </MenuItem>
        {uniqueYears.map((year) => (
          <MenuItem key={year} value={year}>
            {toArabicNumerals(year)}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

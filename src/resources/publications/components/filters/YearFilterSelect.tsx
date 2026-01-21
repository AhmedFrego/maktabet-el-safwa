import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { CalendarToday } from '@mui/icons-material';
import { useTranslate, useListContext } from 'react-admin';
import { toArabicNumerals } from 'utils';

export const YearFilterSelect = ({ uniqueYears }: { uniqueYears: string[] }) => {
  const translate = useTranslate();
  const { filterValues, setFilters } = useListContext();

  const handleChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    if (value === '') {
      const { year: _, ...rest } = filterValues;
      setFilters(rest, []);
    } else {
      setFilters({ ...filterValues, year: value }, []);
    }
  };

  return (
    <FormControl fullWidth size="small" sx={{ mb: 1 }}>
      <InputLabel id="year-filter-label">
        <CalendarToday fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
        {translate('custom.filters.year')}
      </InputLabel>
      <Select
        labelId="year-filter-label"
        value={filterValues.year || ''}
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

import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { School } from '@mui/icons-material';
import { useTranslate, useListContext } from 'react-admin';
import { Enums } from 'types';

export const AcademicYearFilterSelect = ({
  uniqueAcademicYears,
}: {
  uniqueAcademicYears: Enums<'academic_years'>[];
}) => {
  const translate = useTranslate();
  const { filterValues, setFilters } = useListContext();

  const handleChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    if (value === '') {
      setFilters(filterValues, []);
    } else {
      setFilters({ ...filterValues, academic_year: value }, []);
    }
  };

  return (
    <FormControl fullWidth size="small" sx={{ mb: 1 }}>
      <InputLabel id="academic-year-filter-label" sx={{ display: 'flex', alignItems: 'center' }}>
        <School fontSize="small" sx={{ mr: 0.5 }} />
        {translate('custom.filters.academic_year')}
      </InputLabel>
      <Select
        labelId="academic-year-filter-label"
        value={filterValues.academic_year || ''}
        label={translate('custom.filters.academic_year')}
        onChange={handleChange}
      >
        <MenuItem value="">
          <em>{translate('ra.action.clear_input_value')}</em>
        </MenuItem>
        {uniqueAcademicYears.map((year) => (
          <MenuItem key={year} value={year}>
            {translate(`custom.labels.academic_years.${year}.name`)}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

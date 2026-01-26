import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { useTranslate, useListContext } from 'react-admin';
import { Enums } from 'types';

const ACADEMIC_YEARS_ORDER: Enums<'academic_years'>[] = [
  'KG0',
  'KG1',
  'KG2',
  '1st_primary',
  '2nd_primary',
  '3rd_primary',
  '4th_primary',
  '5th_primary',
  '6th_primary',
  '1st_preparatory',
  '2nd_preparatory',
  '3rd_preparatory',
  '1st_secondary',
  '2nd_secondary',
  '3rd_secondary',
];

export const AcademicYearFilterSelect = ({
  uniqueAcademicYears,
}: {
  uniqueAcademicYears: Enums<'academic_years'>[];
}) => {
  const translate = useTranslate();
  const { filterValues, setFilters } = useListContext();

  const handleChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { academic_year: _, ...rest } = filterValues;

    if (value === '') {
      setFilters(rest, []);
    } else {
      setFilters({ ...filterValues, academic_year: value }, []);
    }
  };

  // Sort academic years according to the defined order
  const sortedAcademicYears = [...uniqueAcademicYears].sort((a, b) => {
    const indexA = ACADEMIC_YEARS_ORDER.indexOf(a);
    const indexB = ACADEMIC_YEARS_ORDER.indexOf(b);
    return indexA - indexB;
  });

  return (
    <FormControl fullWidth size="small" sx={{ mb: 1 }}>
      <InputLabel id="academic-year-filter-label" sx={{ display: 'flex', alignItems: 'center' }}>
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
        {sortedAcademicYears.map((year) => (
          <MenuItem key={year} value={year}>
            {translate(`custom.labels.academic_years.${year}.name`)}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { useTranslate, useListContext } from 'react-admin';
import { idName } from 'types/types';

export const SubjectFilterSelect = ({ uniqueSubjects }: { uniqueSubjects: idName[] }) => {
  const translate = useTranslate();
  const { filterValues, setFilters } = useListContext();

  const handleChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    if (value === '') {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { subject_id, ...rest } = filterValues;
      setFilters(rest, []);
    } else {
      setFilters({ ...filterValues, subject_id: value }, []);
    }
  };

  return (
    <FormControl fullWidth size="small" sx={{ mb: 1 }}>
      <InputLabel id="subject-filter-label">{translate('custom.filters.subject')}</InputLabel>
      <Select
        labelId="subject-filter-label"
        value={filterValues.subject_id || ''}
        label={translate('custom.filters.subject')}
        onChange={handleChange}
      >
        <MenuItem value="">
          <em>{translate('ra.action.clear_input_value')}</em>
        </MenuItem>
        {uniqueSubjects.map((subject) => (
          <MenuItem key={subject.id} value={subject.id}>
            {subject.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

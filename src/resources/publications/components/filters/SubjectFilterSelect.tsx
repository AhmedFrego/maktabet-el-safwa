import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { Book } from '@mui/icons-material';
import { useTranslate, useListContext } from 'react-admin';
import { idName } from 'types/types';

export const SubjectFilterSelect = ({ uniqueSubjects }: { uniqueSubjects: idName[] }) => {
  const translate = useTranslate();
  const { filterValues, setFilters } = useListContext();

  const handleChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    if (value === '') {
      const { subject_id: _, ...rest } = filterValues;
      setFilters(rest, []);
    } else {
      setFilters({ ...filterValues, subject_id: value }, []);
    }
  };

  return (
    <FormControl fullWidth size="small" sx={{ mb: 1 }}>
      <InputLabel id="subject-filter-label">
        <Book fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
        {translate('custom.filters.subject')}
      </InputLabel>
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

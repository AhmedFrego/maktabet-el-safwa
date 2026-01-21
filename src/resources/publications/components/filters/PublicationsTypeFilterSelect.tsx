import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { ViewAgenda } from '@mui/icons-material';
import { useTranslate, useListContext } from 'react-admin';
import { Enums } from 'types';

export const PublicationsTypeFilterSelect = () => {
  const translate = useTranslate();
  const { filterValues, setFilters } = useListContext();

  const types = [
    { id: 'book', name: translate('resources.publications.labels.publications_types.book') },
    { id: 'note', name: translate('resources.publications.labels.publications_types.note') },
    { id: 'other', name: translate('resources.publications.labels.publications_types.other') },
  ] as {
    id: Enums<'publications_types'>;
    name: string;
  }[];

  const handleChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    if (value === '') {
      const { publication_type: _, ...rest } = filterValues;
      setFilters(filterValues, []);
    } else {
      setFilters({ ...filterValues, publication_type: value }, []);
    }
  };

  return (
    <FormControl fullWidth size="small" sx={{ mb: 1 }}>
      <InputLabel id="publication-type-filter-label">
        <ViewAgenda fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
        {translate('resources.publications.fields.publication_type')}
      </InputLabel>
      <Select
        labelId="publication-type-filter-label"
        value={filterValues.publication_type || ''}
        label={translate('resources.publications.fields.publication_type')}
        onChange={handleChange}
      >
        <MenuItem value="">
          <em>{translate('ra.action.clear_input_value')}</em>
        </MenuItem>
        {types.map((type) => (
          <MenuItem key={type.id} value={type.id}>
            {type.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

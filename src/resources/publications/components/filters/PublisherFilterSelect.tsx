import { Autocomplete, TextField } from '@mui/material';
import { useTranslate, useListContext } from 'react-admin';
import { idName } from 'types/types';

export const PublisherFilterSelect = ({ uniquePublishers }: { uniquePublishers: idName[] }) => {
  const translate = useTranslate();
  const { filterValues, setFilters } = useListContext();

  const selectedPublisher = uniquePublishers.find(
    (publisher) => publisher.id === filterValues.publisher_id
  );

  const handleChange = (_: unknown, newValue: idName | null) => {
    if (!newValue) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { publisher_id, ...rest } = filterValues;
      setFilters(rest, []);
    } else {
      setFilters({ ...filterValues, publisher_id: newValue.id }, []);
    }
  };

  return (
    <Autocomplete
      size="small"
      options={uniquePublishers}
      value={selectedPublisher || null}
      onChange={handleChange}
      getOptionLabel={(option) => option.name}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      renderInput={(params) => (
        <TextField {...params} label={translate('custom.filters.publisher')} />
      )}
      sx={{ mb: 1 }}
    />
  );
};

import { useEffect } from 'react';
import { FormControlLabel, Switch } from '@mui/material';
import { useTranslate, useStore, useListContext } from 'react-admin';

/** OR clause that fetches only collection masters + standalone publications. */
const GROUPED_OR = 'is_collection_master.is.true,related_publications.is.null';

export const ShowSeparatelyToggle = () => {
  const translate = useTranslate();
  const { filterValues, setFilters } = useListContext();
  const [showGrouped, setShowGrouped] = useStore<boolean>('publications.showGrouped', true);

  // Sync the OR filter on mount when showGrouped is already true
  useEffect(() => {
    if (showGrouped && filterValues.or !== GROUPED_OR) {
      setFilters({ ...filterValues, or: GROUPED_OR }, []);
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    setShowGrouped(checked);

    if (checked) {
      // Add server-side OR filter to show only masters + standalone
      setFilters({ ...filterValues, or: GROUPED_OR }, []);
    } else {
      // Remove the OR filter — show all publications flat
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { or: _, ...rest } = filterValues;
      setFilters(rest, []);
    }
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

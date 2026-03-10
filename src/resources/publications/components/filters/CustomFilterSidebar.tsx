import { useEffect, useRef } from 'react';
import { Box, Button, Card, CardContent } from '@mui/material';
import { FilterListOff } from '@mui/icons-material';
import { useListContext, useTranslate, useStore } from 'react-admin';

import {
  YearFilterSelect,
  AcademicYearFilterSelect,
  TermFilterSelect,
  SubjectFilterSelect,
  PublicationsTypeFilterSelect,
  PublisherFilterSelect,
  ShowSeparatelyToggle,
} from '.';
import { usePublicationFilterOptions } from '../../hooks';

const GROUPED_OR = 'is_collection_master.is.true,related_publications.is.null';

export const CustomFilterSidebar = () => {
  const { data: publications, isLoading, filterValues, setFilters } = useListContext();
  const translate = useTranslate();
  const [showGrouped] = useStore<boolean>('publications.showGrouped', true);

  // Exclude the 'or' key (managed by the group toggle) from active filter count
  const { or: _or, ...userFilters } = filterValues || {};
  const hasActiveFilters = Object.keys(userFilters).length > 0;

  const handleClearFilters = () => {
    // Preserve the group toggle's OR filter
    setFilters(showGrouped ? { or: GROUPED_OR } : {}, []);
  };

  const { availableAcademicYears, availableSubjects, availablePublishers, availableYears } =
    usePublicationFilterOptions(filterValues);

  // ── Auto-clear stale cascading selections ─────────────────────────
  // When cascading narrows the options and the currently selected value
  // is no longer available, remove it so the user doesn't see empty results.
  const prevFilterValues = useRef(filterValues);
  useEffect(() => {
    const staleKeys: Record<string, unknown> = {};

    if (
      filterValues.academic_year &&
      availableAcademicYears.length > 0 &&
      !availableAcademicYears.includes(filterValues.academic_year)
    ) {
      staleKeys.academic_year = undefined;
    }
    if (
      filterValues.subject_id &&
      availableSubjects.length > 0 &&
      !availableSubjects.some((s) => s.id === filterValues.subject_id)
    ) {
      staleKeys.subject_id = undefined;
    }
    if (
      filterValues.publisher_id &&
      availablePublishers.length > 0 &&
      !availablePublishers.some((p) => p.id === filterValues.publisher_id)
    ) {
      staleKeys.publisher_id = undefined;
    }

    if (Object.keys(staleKeys).length > 0) {
      const cleaned = { ...filterValues };
      Object.keys(staleKeys).forEach((k) => delete cleaned[k]);
      setFilters(cleaned, []);
    }

    prevFilterValues.current = filterValues;
  }, [availableAcademicYears, availableSubjects, availablePublishers, filterValues, setFilters]);

  if (isLoading || !publications) return null;

  return (
    <Card sx={{ order: -1, minWidth: 200, maxWidth: 230, flexShrink: 0 }}>
      <CardContent sx={{ p: 0 }}>
        {hasActiveFilters && (
          <Box sx={{ p: 1 }}>
            <Button
              variant="contained"
              color="primary"
              size="small"
              fullWidth
              sx={{ fontSize: 18, fontFamily: 'inherit' }}
              startIcon={<FilterListOff />}
              onClick={handleClearFilters}
            >
              {translate('ra.action.remove_all_filters')}
            </Button>
          </Box>
        )}
        <Box sx={{ p: 1.5 }}>
          <PublicationsTypeFilterSelect />
          <AcademicYearFilterSelect uniqueAcademicYears={availableAcademicYears} />
          <SubjectFilterSelect uniqueSubjects={availableSubjects} />
          <PublisherFilterSelect uniquePublishers={availablePublishers} />
          <TermFilterSelect />
          <YearFilterSelect uniqueYears={availableYears} />
          <ShowSeparatelyToggle />
        </Box>
      </CardContent>
    </Card>
  );
};

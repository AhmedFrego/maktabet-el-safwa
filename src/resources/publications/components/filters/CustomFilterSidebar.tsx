import { Box, Button, Card, CardContent } from '@mui/material';
import { FilterListOff } from '@mui/icons-material';
import { Identifier, useGetList, useListContext, useTranslate } from 'react-admin';

import {
  YearFilterSelect,
  AcademicYearFilterSelect,
  TermFilterSelect,
  SubjectFilterSelect,
  PublicationsTypeFilterSelect,
} from '.';
import { Enums, idName } from 'types';

interface FilterColumns {
  id: Identifier;
  academic_year: Enums<'academic_years'>;
  subjects: idName;
  year: string;
}

export const CustomFilterSidebar = () => {
  const { data: publications, isLoading, filterValues, setFilters } = useListContext();
  const translate = useTranslate();

  const hasActiveFilters = Object.keys(filterValues || {}).length > 0;

  const handleClearFilters = () => {
    setFilters({}, []);
  };

  const { data } = useGetList<FilterColumns>('publications', {
    meta: {
      columns: ['id,year,academic_year', 'subjects:subjects(id,name)'],
    },
  });

  let uniqueAcademicYears: Enums<'academic_years'>[] = [];
  let uniqueSubjects: idName[] = [];
  let uniqueYears: string[] = [];

  if (data) {
    uniqueAcademicYears = [
      ...new Map(data.map((x) => [x.academic_year, x.academic_year])).values(),
    ];
    uniqueSubjects = [...new Map(data.map((x) => [x.subjects.id, x.subjects])).values()];
    uniqueYears = [...new Map(data.map((x) => [x.year, x.year])).values()];
  }

  if (isLoading || !publications) return null;

  return (
    <Card sx={{ order: -1, width: 220 }}>
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
          <AcademicYearFilterSelect uniqueAcademicYears={uniqueAcademicYears} />
          <SubjectFilterSelect uniqueSubjects={uniqueSubjects} />
          <YearFilterSelect uniqueYears={uniqueYears} />
          <TermFilterSelect />
        </Box>
      </CardContent>
    </Card>
  );
};

import { Card, CardContent } from '@mui/material';
import { Identifier, useGetList, useListContext } from 'react-admin';

import {
  YearFilterAccordion,
  AcademicYearFilterAccordion,
  TermFilterAccordion,
  SubjectFilterAccordion,
  PublicationsTypeFilter,
} from '.';
import { idName } from 'types';

interface FilterColumns {
  id: Identifier;
  academic_years: idName;
  subjects: idName;
  year: string;
}

export const CustomFilterSidebar = () => {
  const { data: publications, isLoading } = useListContext();

  const { data } = useGetList<FilterColumns>('publications', {
    meta: {
      columns: ['id,year', 'academic_years:academic_years(name,id)', 'subjects:subjects(id,name)'],
    },
  });

  let uniqueAcademicYears: idName[] = [];
  let uniqueSubjects: idName[] = [];
  let uniqueYears: string[] = [];

  if (data) {
    uniqueAcademicYears = [
      ...new Map(data.map((x) => [x.academic_years.id, x.academic_years])).values(),
    ];
    uniqueSubjects = [...new Map(data.map((x) => [x.subjects.id, x.subjects])).values()];
    uniqueYears = [...new Map(data.map((x) => [x.year, x.year])).values()];
  }

  if (isLoading || !publications) return null;

  return (
    <Card sx={{ order: -1, width: 220 }}>
      <CardContent sx={{ p: 0 }}>
        <PublicationsTypeFilter />
        <AcademicYearFilterAccordion uniqueAcademicYears={uniqueAcademicYears} />
        <SubjectFilterAccordion uniqueSubjects={uniqueSubjects} />
        <YearFilterAccordion uniqueYears={uniqueYears} />
        <TermFilterAccordion />
      </CardContent>
    </Card>
  );
};

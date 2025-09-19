import { Card, CardContent } from '@mui/material';
import { useListContext } from 'react-admin';

import {
  YearFilterAccordion,
  AcademicYearFilterAccordion,
  TermFilterAccordion,
  SubjectFilterAccordion,
} from '.';

export const CustomFilterSidebar = () => {
  const { data: notes, isLoading } = useListContext();

  if (isLoading || !notes) return null;

  return (
    <Card sx={{ order: -1, width: 220 }}>
      <CardContent sx={{ p: 0 }}>
        <AcademicYearFilterAccordion notes={notes} />
        <SubjectFilterAccordion notes={notes} />
        <YearFilterAccordion notes={notes} />
        <TermFilterAccordion notes={notes} />
      </CardContent>
    </Card>
  );
};

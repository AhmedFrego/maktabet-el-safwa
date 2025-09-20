import { AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { School } from '@mui/icons-material';
import { useTranslate } from 'react-admin';
import { Note } from '../types';
import {
  StyledAccordionSummary,
  StyledFilterListItem,
  StyledTypography,
  StyledAccordion,
} from './styles';

export const AcademicYearFilterAccordion = ({ notes }: { notes: Note[] }) => {
  const translate = useTranslate();

  const academicYearsMap = new Map();

  notes.forEach((n) => {
    if (n.academicYear?.name && n.academic_year) {
      academicYearsMap.set(n.academicYear.name, {
        name: n.academicYear.name,
        id: n.academic_year,
      });
    }
  });

  const uniqueAcademicYears = Array.from(academicYearsMap.values());

  return (
    <StyledAccordion disableGutters defaultExpanded>
      <StyledAccordionSummary expandIcon={<ExpandMoreIcon />}>
        <StyledTypography>
          <School fontSize="small" /> {translate('custom.filters.academic_year')}
        </StyledTypography>
      </StyledAccordionSummary>
      <AccordionDetails>
        {uniqueAcademicYears.map((year) => (
          <StyledFilterListItem
            key={year.id}
            label={year.name}
            value={{ academic_year: year.id }}
          />
        ))}
      </AccordionDetails>
    </StyledAccordion>
  );
};

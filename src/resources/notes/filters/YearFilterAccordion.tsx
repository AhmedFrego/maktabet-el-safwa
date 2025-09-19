import { AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { CalendarToday } from '@mui/icons-material';
import { Note } from '../types';
import {
  StyledAccordionSummary,
  StyledFilterListItem,
  StyledTypography,
  StyledAccordion,
} from './styles';
export const YearFilterAccordion = ({ notes }: { notes: Note[] }) => {
  const years = Array.from(new Set(notes.map((n) => n.year))).sort((a, b) => +a - +b);

  return (
    <StyledAccordion disableGutters>
      <StyledAccordionSummary expandIcon={<ExpandMoreIcon />}>
        <StyledTypography>
          <CalendarToday fontSize="small" /> السنة
        </StyledTypography>
      </StyledAccordionSummary>
      <AccordionDetails>
        {years.map((year) => (
          <StyledFilterListItem key={year} label={String(year)} value={{ year }} />
        ))}
      </AccordionDetails>
    </StyledAccordion>
  );
};

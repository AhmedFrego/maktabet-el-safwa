import { AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { DateRange } from '@mui/icons-material';
import { Note } from '../types';
import {
  StyledAccordionSummary,
  StyledFilterListItem,
  StyledTypography,
  StyledAccordion,
} from './styles';
export const TermFilterAccordion = ({ notes }: { notes: Note[] }) => {
  const termsMap = new Map();

  notes.forEach((n) => {
    if (n.term?.name && n.term_id) {
      termsMap.set(n.term.name, { name: n.term.name, id: n.term_id });
    }
  });

  const uniqueTerms = Array.from(termsMap.values());

  return (
    <StyledAccordion disableGutters>
      <StyledAccordionSummary expandIcon={<ExpandMoreIcon />}>
        <StyledTypography>
          <DateRange /> الترم
        </StyledTypography>
      </StyledAccordionSummary>
      <AccordionDetails>
        {uniqueTerms.map((term) => (
          <StyledFilterListItem key={term.id} label={term.name} value={{ term: term.id }} />
        ))}
      </AccordionDetails>
    </StyledAccordion>
  );
};

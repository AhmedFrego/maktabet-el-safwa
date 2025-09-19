import { AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { Book } from '@mui/icons-material';
import { Note } from '../types';
import {
  StyledAccordionSummary,
  StyledFilterListItem,
  StyledTypography,
  StyledAccordion,
} from './styles';

export const SubjectFilterAccordion = ({ notes }: { notes: Note[] }) => {
  const subjectsMap = new Map();

  notes.forEach((n) => {
    if (n.subject?.name && n.subject_id) {
      subjectsMap.set(n.subject.name, { name: n.subject.name, id: n.subject_id });
    }
  });

  const uniqueSubjects = Array.from(subjectsMap.values());

  return (
    <StyledAccordion disableGutters>
      <StyledAccordionSummary expandIcon={<ExpandMoreIcon />}>
        <StyledTypography>
          <Book fontSize="small" /> المادة
        </StyledTypography>
      </StyledAccordionSummary>
      <AccordionDetails>
        {uniqueSubjects.map((subject) => (
          <StyledFilterListItem
            key={subject.id}
            label={subject.name}
            value={{ subject_id: subject.id }}
          />
        ))}
      </AccordionDetails>
    </StyledAccordion>
  );
};

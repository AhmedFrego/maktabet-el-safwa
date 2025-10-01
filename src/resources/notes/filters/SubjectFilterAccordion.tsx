import { AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { Book } from '@mui/icons-material';
import {
  StyledAccordionSummary,
  StyledFilterListItem,
  StyledTypography,
  StyledAccordion,
} from './styles';
import { useTranslate } from 'react-admin';
import { idName } from 'types/types';

export const SubjectFilterAccordion = ({ uniqueSubjects }: { uniqueSubjects: idName[] }) => {
  const translate = useTranslate();

  return (
    <StyledAccordion disableGutters>
      <StyledAccordionSummary expandIcon={<ExpandMoreIcon />}>
        <StyledTypography>
          <Book fontSize="small" /> {translate('custom.filters.subject')}
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

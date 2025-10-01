import { useTranslate } from 'react-admin';
import { AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { DateRange } from '@mui/icons-material';
import {
  StyledAccordionSummary,
  StyledFilterListItem,
  StyledTypography,
  StyledAccordion,
} from './styles';
import { Enums } from 'types/supabase-generated.types';

export const TermFilterAccordion = () => {
  const translate = useTranslate();
  const termsMap = [
    { id: '1st', name: translate('resources.publications.labels.term.1st') },
    { id: '2nd', name: translate('resources.publications.labels.term.2nd') },
    { id: 'full_year', name: translate('resources.publications.labels.term.full_year') },
  ] as {
    id: Enums<'term'>;
    name: string;
  }[];

  return (
    <StyledAccordion disableGutters>
      <StyledAccordionSummary expandIcon={<ExpandMoreIcon />}>
        <StyledTypography>
          <DateRange /> {translate('custom.filters.term_id')}
        </StyledTypography>
      </StyledAccordionSummary>
      <AccordionDetails>
        {termsMap.map((term) => (
          <StyledFilterListItem key={term.id} label={term.name} value={{ term: term.id }} />
        ))}
      </AccordionDetails>
    </StyledAccordion>
  );
};

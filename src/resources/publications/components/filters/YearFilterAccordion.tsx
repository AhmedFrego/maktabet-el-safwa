import { useTranslate } from 'react-admin';
import { AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { CalendarToday } from '@mui/icons-material';

import {
  StyledAccordionSummary,
  StyledFilterListItem,
  StyledTypography,
  StyledAccordion,
} from './styles';

import { toArabicNumerals } from 'utils';

export const YearFilterAccordion = ({ uniqueYears }: { uniqueYears: string[] }) => {
  const translate = useTranslate();

  return (
    <StyledAccordion disableGutters>
      <StyledAccordionSummary expandIcon={<ExpandMoreIcon />}>
        <StyledTypography>
          <CalendarToday fontSize="small" /> {translate('custom.filters.year')}
        </StyledTypography>
      </StyledAccordionSummary>
      <AccordionDetails>
        {uniqueYears.map((year) => (
          <StyledFilterListItem key={year} label={toArabicNumerals(year)} value={{ year }} />
        ))}
      </AccordionDetails>
    </StyledAccordion>
  );
};

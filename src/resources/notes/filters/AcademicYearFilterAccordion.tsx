import { AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { School } from '@mui/icons-material';
import { useTranslate } from 'react-admin';
import {
  StyledAccordionSummary,
  StyledFilterListItem,
  StyledTypography,
  StyledAccordion,
} from './styles';
import { idName } from 'types';

export const AcademicYearFilterAccordion = ({
  uniqueAcademicYears,
}: {
  uniqueAcademicYears: idName[];
}) => {
  const translate = useTranslate();

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

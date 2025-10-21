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
import { Enums } from 'types';

export const AcademicYearFilterAccordion = ({
  uniqueAcademicYears,
}: {
  uniqueAcademicYears: Enums<'academic_years'>[];
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
            key={year}
            label={translate(`custom.labels.academic_years.${year}.name`)}
            value={{ academic_year: year }}
          />
        ))}
      </AccordionDetails>
    </StyledAccordion>
  );
};

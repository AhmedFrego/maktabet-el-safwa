import { useTranslate } from 'react-admin';
import { AccordionDetails } from '@mui/material';
import { ViewAgenda, ExpandMore } from '@mui/icons-material';

import { Enums } from 'types';
import { StyledAccordionSummary, StyledFilterListItem, StyledTypography, StyledAccordion } from '.';

export const PublicationsTypeFilter = () => {
  const translate = useTranslate();
  const types = [
    { id: 'book', name: translate('resources.publications.labels.publications_types.book') },
    { id: 'note', name: translate('resources.publications.labels.publications_types.note') },
    { id: 'other', name: translate('resources.publications.labels.publications_types.other') },
  ] as {
    id: Enums<'publications_types'>;
    name: string;
  }[];

  return (
    <StyledAccordion disableGutters>
      <StyledAccordionSummary expandIcon={<ExpandMore />}>
        <StyledTypography>
          <ViewAgenda /> {translate('resources.publications.fields.publication_type')}
        </StyledTypography>
      </StyledAccordionSummary>
      <AccordionDetails>
        {types.map((type) => (
          <StyledFilterListItem
            key={type.id}
            label={type.name}
            value={{ publication_type: type.id }}
          />
        ))}
      </AccordionDetails>
    </StyledAccordion>
  );
};

import { Accordion, AccordionSummary, Typography, styled } from '@mui/material';
import { FilterListItem } from 'react-admin';

export const StyledAccordion = styled(Accordion)({
  marginRight: 1,
});

export const StyledAccordionSummary = styled(AccordionSummary)(({ theme }) => ({
  backgroundColor: theme.palette.grey[100],
}));

export const StyledTypography = styled(Typography)(({ theme }) => ({
  fontWeight: '900',
  fontSize: theme.typography.caption.fontSize,
  color: theme.palette.mode === 'dark' ? theme.palette.info.light : theme.palette.info.dark,
  display: 'flex',
  gap: 2,
}));

export const StyledFilterListItem = styled(FilterListItem)(({ theme }) => ({
  fontSize: theme.typography.caption.fontSize,

  '& > .MuiListItemButton-root': {
    paddingInlineStart: 0,
  },

  '& .muirtl-u87xkc-MuiTypography-root': { fontSize: theme.typography.caption.fontSize },
}));

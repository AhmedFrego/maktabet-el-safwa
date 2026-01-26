import { Container, styled } from '@mui/material';

export const StyledContainer = styled(Container)(({ theme }) => ({
  backgroundColor: theme.palette.grey[50],
  display: 'flex',
  gap: theme.spacing(2),
  padding: theme.spacing(2),
  flexWrap: 'wrap',
  justifyContent: 'flex-start',
  borderRadius: theme.shape.borderRadius,
  maxWidth: 'none',
  '& > *': {
    flex: '0 0 auto',
  },
}));

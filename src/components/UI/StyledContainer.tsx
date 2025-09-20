import { Container, styled } from '@mui/material';

export const StyledContainer = styled(Container)(({ theme }) => ({
  backgroundColor: theme.palette.grey[50],
  display: 'flex',
  gap: theme.spacing(1),
  padding: theme.spacing(1),
  flexWrap: 'wrap',
  justifyContent: 'center',
  borderRadius: theme.shape.borderRadius,
}));

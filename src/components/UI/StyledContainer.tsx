import { Container, styled } from '@mui/material';

export const StyledContainer = styled(Container)(({ theme }) => ({
  backgroundColor: theme.palette.grey[50],
  display: 'flex',
  gap: theme.spacing(2),
  padding: theme.spacing(2),
  flexWrap: 'wrap',
  justifyContent: 'center',
  borderRadius: theme.shape.borderRadius,
  maxWidth: 'none !important',
  width: '100%',
  '& > *': {
    flex: '0 0 auto',
  },
}));

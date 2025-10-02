import { styled } from '@mui/material';
import { SimpleForm } from 'react-admin';

export const StyledForm = styled(SimpleForm)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  margin: 'auto',
  width: 'fit-content',
  backgroundColor: theme.palette.background.default,
  minWidth: theme.spacing(40),
  '& > *': {
    gap: 10,
  },
}));

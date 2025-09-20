import { styled } from '@mui/material';
import { SimpleForm } from 'react-admin';

export const StyledForm = styled(SimpleForm)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  margin: 'auto',
  width: 'fit-content',
  borderInline: `2px solid ${theme.palette.info.light}`,
  minWidth: theme.spacing(40),
}));

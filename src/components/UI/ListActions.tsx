import { styled, ButtonGroup } from '@mui/material';
import { CreateButton, TopToolbar } from 'react-admin';

export const ListActions = () => {
  return (
    <StyledTopToolbar>
      <ButtonGroup variant="contained" aria-label="Basic button group">
        <StyledCreateButton />
      </ButtonGroup>
    </StyledTopToolbar>
  );
};

const StyledCreateButton = styled(CreateButton)(({ theme }) => ({
  fontFamily: theme.typography.fontFamily,
  fontWeight: 900,
}));

const StyledTopToolbar = styled(TopToolbar)(({ theme }) => ({
  fontFamily: theme.typography.fontFamily,
  backgroundColor: theme.palette.grey[100],
  width: '100%',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '0',
}));

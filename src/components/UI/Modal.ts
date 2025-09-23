import { Box, styled } from '@mui/material';

export const ModalWrapper = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100vh',
  overflow: 'auto',
});

export const ModalContent = styled(Box)(({ theme }) => ({
  width: '30rem',
  borderRadius: theme.shape.borderRadius,
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
}));

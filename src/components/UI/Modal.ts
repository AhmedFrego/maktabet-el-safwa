import { Box, styled } from '@mui/material';

export const ModalWrapper = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100vh',
  overflow: 'auto',
});

export const ModalContent = styled(Box)({
  width: '-webkit-fill-available',
  borderRadius: 3,
  display: 'flex',
  flexDirection: 'column',
  gap: 1,
  maxHeight: '90vh',
  overflow: 'auto',
});

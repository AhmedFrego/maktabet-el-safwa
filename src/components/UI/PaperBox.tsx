import { Box, BoxProps } from '@mui/material';
import { PropsWithChildren } from 'react';

export const PaperBox = ({ children }: PropsWithChildren<BoxProps>) => {
  return (
    <Box sx={(theme) => ({ backgroundColor: theme.palette.background.paper, p: 1 })}>
      {children}
    </Box>
  );
};

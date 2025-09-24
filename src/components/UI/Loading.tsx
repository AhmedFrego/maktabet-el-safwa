import { Box } from '@mui/material';
import { FourSquare } from 'react-loading-indicators';

export const Loading = () => {
  return (
    <Box
      sx={(theme) => ({
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: `calc(100vh - ${theme.spacing(19.5)})`,
      })}
    >
      <FourSquare color="#32cd32" size="medium" text="" textColor="" />
    </Box>
  );
};

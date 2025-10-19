import { Container, Divider } from '@mui/material';
import { PropsWithChildren } from 'react';

export const DividedContainer = ({ children }: PropsWithChildren) => (
  <Container>
    {children}
    <Divider />
  </Container>
);

import type { ReactNode } from 'react';
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';

import { Layout as RALayout, CheckForApplicationUpdate } from 'react-admin';

import { Menu, Header } from '.';
import { ReservationCreate } from 'resources/reservations/reaservation-create';

export const Layout = ({ children }: { children: ReactNode }) => (
  <StyledRALayout sidebar={Menu} appBar={Header}>
    <ReservationCreate />
    <StyledContent>{children}</StyledContent>
    <CheckForApplicationUpdate />
  </StyledRALayout>
);

const StyledRALayout = styled(RALayout)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
}));

const StyledContent = styled(Paper)(({ theme }) => ({
  marginTop: theme.spacing(2),
  padding: theme.spacing(1),
}));

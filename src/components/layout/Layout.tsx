import type { ReactNode } from 'react';
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';

import { Layout as RALayout, CheckForApplicationUpdate } from 'react-admin';

import { Menu, Header } from '.';

export const Layout = ({ children }: { children: ReactNode }) => (
  <StyledRALayout sidebar={Menu} appBar={Header}>
    <StyledContent>{children}</StyledContent>
    <CheckForApplicationUpdate />
  </StyledRALayout>
);

const StyledRALayout = styled(RALayout)(({ theme }) => ({
  marginTop: theme.spacing(1),
  backgroundColor: theme.palette.background.paper,
}));

const StyledContent = styled(Paper)(({ theme }) => ({
  marginTop: theme.spacing(1),
  padding: theme.spacing(1),
}));

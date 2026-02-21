import { Box } from '@mui/material';
import React from 'react';

export interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
  /** Optional prefix for the id attribute (defaults to "tab") */
  idPrefix?: string;
}

/**
 * A reusable TabPanel component for MUI Tabs.
 * Only renders children when the tab is active to improve performance.
 */
export const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, idPrefix = 'tab', ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`${idPrefix}-tabpanel-${index}`}
      aria-labelledby={`${idPrefix}-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

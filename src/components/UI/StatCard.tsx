import { Box, Card, CardContent, Typography } from '@mui/material';
import React from 'react';
import { toArabicNumerals } from 'utils';

export interface StatCardProps {
  /** Card title */
  title: string;
  /** Value to display (numbers will be converted to Arabic numerals) */
  value: number | string;
  /** Icon to display on the right side */
  icon: React.ReactNode;
  /** MUI color name (e.g., 'success', 'warning', 'info', 'primary') */
  color: string;
  /** Optional suffix for the value (e.g., 'ج.م') */
  suffix?: string;
}

/**
 * A reusable stat card component for displaying metrics.
 * Shows a title, value with optional suffix, and an icon with colored background.
 */
export const StatCard = ({ title, value, icon, color, suffix = '' }: StatCardProps) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography color="text.secondary" variant="body2" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" component="div">
            {typeof value === 'number' ? toArabicNumerals(value) : value}
            {suffix && (
              <Typography component="span" variant="body1" sx={{ mr: 1 }}>
                {suffix}
              </Typography>
            )}
          </Typography>
        </Box>
        <Box
          sx={{
            bgcolor: `${color}.light`,
            color: `${color}.main`,
            p: 1.5,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

import { Card, CardContent, Typography } from '@mui/material';
import { toArabicNumerals } from 'utils';

export interface ColoredSummaryCardProps {
  /** Card title */
  title: string;
  /** Main value to display */
  value: string;
  /** Subtitle or description */
  subtitle: string;
  /** Background color (MUI color name, e.g., 'success.light') */
  bgcolor: string;
  /** Text color (MUI color name, e.g., 'success.contrastText') */
  textColor: string;
  /** Optional numeric count to display in subtitle */
  count?: number;
  /** Optional label to display after count */
  countLabel?: string;
}

/**
 * A colored summary card for displaying financial or metric summaries.
 * Features a colored background with contrasting text.
 */
export const ColoredSummaryCard = ({
  title,
  value,
  subtitle,
  bgcolor,
  textColor,
  count,
  countLabel,
}: ColoredSummaryCardProps) => (
  <Card sx={{ bgcolor, color: textColor }}>
    <CardContent>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Typography variant="h4">{value}</Typography>
      <Typography variant="body2" sx={{ mt: 1 }}>
        {count !== undefined && countLabel ? (
          <>
            {subtitle} {toArabicNumerals(count)} {countLabel}
          </>
        ) : (
          subtitle
        )}
      </Typography>
    </CardContent>
  </Card>
);

import { Box, Paper, Typography } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Dayjs } from 'dayjs';
import 'dayjs/locale/ar';
import { toArabicNumerals } from 'utils';

export interface DateRange {
  from: Dayjs | null;
  to: Dayjs | null;
}

export interface DateRangeFilterProps {
  /** The current date range */
  dateRange: DateRange;
  /** Called when the date range changes */
  onChange: (range: DateRange) => void;
  /** Optional extra info to display (e.g., total orders count) */
  extraInfo?: string;
  /** Optional total count to display */
  totalCount?: number;
  /** Optional label for total count */
  countLabel?: string;
}

/**
 * A reusable date range filter component with two date pickers.
 * Includes LocalizationProvider for Arabic locale support.
 */
export const DateRangeFilter = ({
  dateRange,
  onChange,
  extraInfo,
  totalCount,
  countLabel = 'طلب إجمالي',
}: DateRangeFilterProps) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ar">
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <DatePicker
            label="من تاريخ"
            value={dateRange.from}
            onChange={(newValue) => onChange({ ...dateRange, from: newValue })}
            slotProps={{
              textField: { size: 'small' },
            }}
          />
          <DatePicker
            label="إلى تاريخ"
            value={dateRange.to}
            onChange={(newValue) => onChange({ ...dateRange, to: newValue })}
            slotProps={{
              textField: { size: 'small' },
            }}
          />
          {totalCount !== undefined && (
            <Typography variant="body2" color="text.secondary">
              {toArabicNumerals(totalCount)} {countLabel}
            </Typography>
          )}
          {extraInfo && (
            <Typography variant="body2" color="text.secondary">
              {extraInfo}
            </Typography>
          )}
        </Box>
      </Paper>
    </LocalizationProvider>
  );
};

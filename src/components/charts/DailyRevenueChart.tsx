import { Box, Paper, Typography } from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from 'utils/helpers/formatCurrency';
import { formatDate } from 'utils/helpers/formatDate';

export interface DailyRevenueData {
  date: string;
  revenue: number;
}

export interface DailyRevenueChartProps {
  /** Array of daily revenue data */
  data: DailyRevenueData[];
  /** Chart title */
  title?: string;
  /** Chart height in pixels */
  height?: number;
}

/**
 * A line chart component for displaying daily revenue trends.
 */
export const DailyRevenueChart = ({
  data,
  title = 'الإيرادات اليومية',
  height = 300,
}: DailyRevenueChartProps) => {
  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Box sx={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tickFormatter={formatDate} reversed={true} />
            <YAxis />
            <Tooltip
              formatter={(value) => (typeof value === 'number' ? formatCurrency(value) : value)}
              labelFormatter={formatDate}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#4caf50"
              strokeWidth={2}
              name="الإيرادات"
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

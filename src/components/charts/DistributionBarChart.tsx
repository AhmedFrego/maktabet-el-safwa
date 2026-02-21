import { Box, Paper, Typography } from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export interface DistributionBarChartProps<T> {
  /** Array of distribution data */
  data: T[];
  /** Key to use for X-axis labels */
  xAxisKey: keyof T & string;
  /** Key to use for bar values */
  dataKey: keyof T & string;
  /** Chart title */
  title: string;
  /** X-axis label rotation angle */
  xAxisAngle?: number;
  /** X-axis height */
  xAxisHeight?: number;
  /** Chart height */
  height?: number;
  /** Bar color */
  barColor?: string;
  /** Bar name for legend */
  barName?: string;
}

/**
 * A generic bar chart component for displaying distribution data.
 */
export const DistributionBarChart = <T extends Record<string, unknown>>({
  data,
  xAxisKey,
  dataKey,
  title,
  xAxisAngle = -45,
  xAxisHeight = 100,
  height = 400,
  barColor = '#2196f3',
  barName = 'الكمية',
}: DistributionBarChartProps<T>) => {
  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Box sx={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xAxisKey} angle={xAxisAngle} textAnchor="end" height={xAxisHeight} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey={dataKey} fill={barColor} name={barName} />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

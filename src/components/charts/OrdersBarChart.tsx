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
import { formatDate } from 'utils/helpers/formatDate';

export interface OrdersBarData {
  date: string;
  orders: number;
}

export interface OrdersBarChartProps {
  /** Array of daily orders data */
  data: OrdersBarData[];
  /** Chart title */
  title?: string;
  /** Chart height in pixels */
  height?: number;
  /** Bar color */
  barColor?: string;
}

/**
 * A bar chart component for displaying daily orders count.
 */
export const OrdersBarChart = ({
  data,
  title = 'عدد الطلبات اليومية',
  height = 300,
  barColor = '#2196f3',
}: OrdersBarChartProps) => {
  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Box sx={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tickFormatter={formatDate} reversed={true} />
            <YAxis />
            <Tooltip labelFormatter={formatDate} />
            <Legend />
            <Bar dataKey="orders" fill={barColor} name="الطلبات" />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

import { Box } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { toArabicNumerals } from 'utils';

export interface DistributionPieChartProps<T> {
  /** Array of distribution data */
  data: T[];
  /** Key to use for labels */
  labelKey: keyof T & string;
  /** Key to use for values */
  dataKey: keyof T & string;
  /** Array of colors to use for pie slices */
  colors: string[];
  /** Chart height */
  height?: number;
}

/**
 * A generic pie chart component for displaying distribution data.
 */
export const DistributionPieChart = <T extends Record<string, unknown>>({
  data,
  labelKey,
  dataKey,
  colors,
  height = 300,
}: DistributionPieChartProps<T>) => {
  return (
    <Box sx={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ payload }) =>
              `${payload[labelKey]}: ${toArabicNumerals(payload[dataKey] as number)}`
            }
            outerRadius={100}
            fill="#8884d8"
            dataKey={dataKey}
          >
            {data.map((_entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </Box>
  );
};

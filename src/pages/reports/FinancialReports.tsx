import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Grid,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/ar';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Title } from 'react-admin';
import { useFinancialStats } from 'hooks';
import { toArabicNumerals } from 'utils/helpers';

const COLORS = ['#4caf50', '#ff9800', '#f44336'];

export const FinancialReports = () => {
  const [startDate, setStartDate] = useState<Dayjs>(dayjs().subtract(30, 'day'));
  const [endDate, setEndDate] = useState<Dayjs>(dayjs());

  const stats = useFinancialStats({ startDate, endDate });

  const paymentStatusData = [
    { name: 'مدفوع بالكامل', value: stats.paymentStatus.paid, color: COLORS[0] },
    { name: 'مدفوع جزئياً', value: stats.paymentStatus.partiallyPaid, color: COLORS[1] },
    { name: 'غير مدفوع', value: stats.paymentStatus.unpaid, color: COLORS[2] },
  ];

  const formatCurrency = (value: number) => {
    return `${toArabicNumerals(value.toFixed(2))} ج.م`;
  };

  const formatDate = (dateStr: string) => {
    return dayjs(dateStr).format('DD/MM');
  };

  if (stats.error) {
    return (
      <Box sx={{ p: 3 }}>
        <Title title="التقارير المالية" />
        <Alert severity="error">{stats.error}</Alert>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ar">
      <Box sx={{ p: 3 }}>
        <Title title="التقارير المالية" />

        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          التقارير المالية
        </Typography>

        {/* Date Range Filter */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <DatePicker
              label="من تاريخ"
              value={startDate}
              onChange={(newValue) => newValue && setStartDate(newValue)}
              slotProps={{
                textField: { size: 'small' },
              }}
            />
            <DatePicker
              label="إلى تاريخ"
              value={endDate}
              onChange={(newValue) => newValue && setEndDate(newValue)}
              slotProps={{
                textField: { size: 'small' },
              }}
            />
            <Typography variant="body2" color="text.secondary">
              {toArabicNumerals(stats.totalOrders)} طلب إجمالي
            </Typography>
          </Box>
        </Paper>

        {stats.loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Summary Cards */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      إجمالي الإيرادات
                    </Typography>
                    <Typography variant="h4">{formatCurrency(stats.totalRevenue)}</Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      من {toArabicNumerals(stats.totalOrders)} طلب
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: 'warning.light', color: 'warning.contrastText' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      المبالغ المتبقية
                    </Typography>
                    <Typography variant="h4">{formatCurrency(stats.totalPending)}</Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      مستحقات غير مدفوعة
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: 'info.light', color: 'info.contrastText' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      متوسط قيمة الطلب
                    </Typography>
                    <Typography variant="h4">{formatCurrency(stats.averageOrderValue)}</Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      القيمة المتوسطة
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      الطلبات المكتملة
                    </Typography>
                    <Typography variant="h4">{toArabicNumerals(stats.completedOrders)}</Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      من {toArabicNumerals(stats.totalOrders)} طلب
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Daily Revenue Chart */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                الإيرادات اليومية
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.dailyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={formatDate} reversed={true} />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number | undefined) =>
                      value !== undefined ? formatCurrency(value) : ''
                    }
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
            </Paper>

            {/* Orders per Day Chart */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                عدد الطلبات اليومية
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.dailyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={formatDate} reversed={true} />
                  <YAxis />
                  <Tooltip labelFormatter={formatDate} />
                  <Legend />
                  <Bar dataKey="orders" fill="#2196f3" name="الطلبات" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>

            {/* Payment Status Distribution */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                توزيع حالات الدفع
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={paymentStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${toArabicNumerals(value)}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {paymentStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 2 }}>
                {paymentStatusData.map((item, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 16,
                        height: 16,
                        bgcolor: item.color,
                        borderRadius: 1,
                      }}
                    />
                    <Typography variant="body2">
                      {item.name}: {toArabicNumerals(item.value)}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          </>
        )}
      </Box>
    </LocalizationProvider>
  );
};

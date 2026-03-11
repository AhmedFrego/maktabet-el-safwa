import { useState } from 'react';
import { Box, Typography, CircularProgress, Alert, Paper, Grid } from '@mui/material';
import { Title, useTranslate } from 'react-admin';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/ar';
import { useFinancialStats } from 'hooks';
import { toArabicNumerals, formatCurrency } from 'utils';
import { DateRangeFilter, ColoredSummaryCard } from 'components/UI';
import { DailyRevenueChart, OrdersBarChart, PaymentStatusPie } from 'components/charts';

export const FinancialReports = () => {
  const translate = useTranslate();
  const [startDate, setStartDate] = useState<Dayjs>(dayjs().subtract(30, 'day'));
  const [endDate, setEndDate] = useState<Dayjs>(dayjs());

  const stats = useFinancialStats({ startDate, endDate });

  if (stats.error) {
    return (
      <Box sx={{ p: 3 }}>
        <Title title={translate('custom.financial.title')} />
        <Alert severity="error">{stats.error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Title title={translate('custom.financial.title')} />

      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        {translate('custom.financial.title')}
      </Typography>

      {/* Date Range Filter */}
      <DateRangeFilter
        dateRange={{ from: startDate, to: endDate }}
        onChange={(range) => {
          if (range.from) setStartDate(range.from);
          if (range.to) setEndDate(range.to);
        }}
      />
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, mt: -2 }}>
        {toArabicNumerals(stats.totalOrders)} {translate('custom.labels.order_total')}
      </Typography>

      {stats.loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Summary Cards */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <ColoredSummaryCard
                title={translate('custom.stats.total_revenue')}
                value={formatCurrency(stats.totalRevenue)}
                subtitle={translate('custom.stats.from_orders', {
                  count: toArabicNumerals(stats.totalOrders),
                })}
                bgcolor="success.light"
                textColor="success.contrastText"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <ColoredSummaryCard
                title={translate('custom.stats.remaining_amounts')}
                value={formatCurrency(stats.totalPending)}
                subtitle={translate('custom.stats.unpaid_dues')}
                bgcolor="warning.light"
                textColor="warning.contrastText"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <ColoredSummaryCard
                title={translate('custom.stats.avg_order_value')}
                value={formatCurrency(stats.averageOrderValue)}
                subtitle={translate('custom.stats.avg_value')}
                bgcolor="info.light"
                textColor="info.contrastText"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <ColoredSummaryCard
                title={translate('custom.stats.completed_orders')}
                value={toArabicNumerals(stats.completedOrders)}
                subtitle={translate('custom.stats.from_orders', {
                  count: toArabicNumerals(stats.totalOrders),
                })}
                bgcolor="primary.light"
                textColor="primary.contrastText"
              />
            </Grid>
          </Grid>

          {/* Daily Revenue Chart */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              {translate('custom.charts.daily_revenue')}
            </Typography>
            <DailyRevenueChart data={stats.dailyRevenue} />
          </Paper>

          {/* Orders per Day Chart */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              {translate('custom.charts.daily_orders')}
            </Typography>
            <OrdersBarChart data={stats.dailyRevenue} />
          </Paper>

          {/* Payment Status Distribution */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {translate('custom.charts.payment_status_dist')}
            </Typography>
            <PaymentStatusPie paymentStatus={stats.paymentStatus} />
          </Paper>
        </>
      )}
    </Box>
  );
};

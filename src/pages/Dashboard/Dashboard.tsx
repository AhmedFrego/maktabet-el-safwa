import { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography, Alert, Paper, Tabs, Tab } from '@mui/material';
import { Title } from 'react-admin';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/ar';
import { supabase } from 'lib/supabase';
import { useFinancialStats, useAnalytics } from 'hooks';
import { useAppDispatch, useAppSelector } from 'store';
import { setDashboardTab } from 'store/slices';
import { DateRangeFilter, TabPanel } from 'components/UI';
import {
  QuickStatsSection,
  ChartsSection,
  AnalyticsCardsSection,
  DataTabsSection,
} from './sections';
import type { DashboardStats } from './types';

export const Dashboard = () => {
  const dispatch = useAppDispatch();
  const currentTab = useAppSelector((state) => state.ui.dashboardActiveTab);

  const [startDate, setStartDate] = useState<Dayjs>(dayjs().subtract(30, 'day'));
  const [endDate, setEndDate] = useState<Dayjs>(dayjs());

  const financialStats = useFinancialStats({ startDate, endDate });
  const analytics = useAnalytics({ startDate, endDate });

  const [stats, setStats] = useState<DashboardStats>({
    todayRevenue: 0,
    pendingOrders: 0,
    totalReservations: 0,
    activeClients: 0,
    weeklyData: [],
    loading: true,
  });

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const today = dayjs().startOf('day').toISOString();
        const weekAgo = dayjs().subtract(7, 'day').startOf('day').toISOString();

        // Fetch today's revenue
        const { data: todayReservations } = await supabase
          .from('reservations')
          .select('paid_amount')
          .gte('created_at', today)
          .neq('reservation_status', 'canceled');

        const todayRevenue =
          todayReservations?.reduce((sum, r) => sum + (r.paid_amount || 0), 0) || 0;

        // Fetch pending orders
        const { data: pending } = await supabase
          .from('reservations')
          .select('id')
          .in('reservation_status', ['in-progress', 'ready']);

        const pendingOrders = pending?.length || 0;

        // Fetch total reservations (last 30 days)
        const thirtyDaysAgo = dayjs().subtract(30, 'day').startOf('day').toISOString();
        const { data: recentReservations } = await supabase
          .from('reservations')
          .select('id')
          .gte('created_at', thirtyDaysAgo);

        const totalReservations = recentReservations?.length || 0;

        // Fetch active clients (last 30 days)
        const { data: activeClientsData } = await supabase
          .from('reservations')
          .select('client_id')
          .gte('created_at', thirtyDaysAgo);

        const uniqueClients = new Set(activeClientsData?.map((r) => r.client_id) || []);
        const activeClients = uniqueClients.size;

        // Fetch weekly data
        const { data: weeklyReservations } = await supabase
          .from('reservations')
          .select('created_at, paid_amount')
          .gte('created_at', weekAgo)
          .neq('reservation_status', 'canceled');

        const dailyRevenueMap = new Map<string, number>();
        weeklyReservations?.forEach((r) => {
          const day = dayjs(r.created_at).format('DD/MM');
          const existing = dailyRevenueMap.get(day) || 0;
          dailyRevenueMap.set(day, existing + (r.paid_amount || 0));
        });

        const weeklyData = Array.from(dailyRevenueMap.entries()).map(([day, revenue]) => ({
          day,
          revenue,
        }));

        setStats({
          todayRevenue,
          pendingOrders,
          totalReservations,
          activeClients,
          weeklyData,
          loading: false,
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        setStats((prev) => ({ ...prev, loading: false }));
      }
    };

    fetchDashboardStats();
  }, []);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    dispatch(setDashboardTab(newValue));
  };

  if (stats.loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Title title="مرحباً بالصفوة" />

      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        لوحة التحكم
      </Typography>

      {/* Date Range Filter */}
      <DateRangeFilter
        dateRange={{ from: startDate, to: endDate }}
        onChange={(range) => {
          if (range.from) setStartDate(range.from);
          if (range.to) setEndDate(range.to);
        }}
        totalCount={financialStats.totalOrders}
      />

      {/* Main Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="الإحصائيات السريعة" />
          <Tab label="الرسوم البيانية" />
          <Tab label="مؤشرات التسليم" />
          <Tab label="تحليلات البيانات" />
        </Tabs>

        {/* Tab 0: Quick Stats */}
        <TabPanel value={currentTab} index={0} idPrefix="dashboard">
          {financialStats.loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
              <CircularProgress />
            </Box>
          ) : financialStats.error ? (
            <Alert severity="error" sx={{ mb: 3 }}>
              {financialStats.error}
            </Alert>
          ) : (
            <QuickStatsSection stats={stats} financialStats={financialStats} />
          )}
        </TabPanel>

        {/* Tab 1: Charts */}
        <TabPanel value={currentTab} index={1} idPrefix="dashboard">
          {financialStats.loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
              <CircularProgress />
            </Box>
          ) : financialStats.error ? (
            <Alert severity="error" sx={{ mb: 3 }}>
              {financialStats.error}
            </Alert>
          ) : (
            <ChartsSection financialStats={financialStats} />
          )}
        </TabPanel>

        {/* Tab 2: Analytics Cards */}
        <TabPanel value={currentTab} index={2} idPrefix="dashboard">
          {analytics.loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
              <CircularProgress />
            </Box>
          ) : analytics.error ? (
            <Alert severity="error" sx={{ mb: 3 }}>
              {analytics.error}
            </Alert>
          ) : (
            <AnalyticsCardsSection analytics={analytics} />
          )}
        </TabPanel>

        {/* Tab 3: Data Tabs */}
        <TabPanel value={currentTab} index={3} idPrefix="dashboard">
          {analytics.loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
              <CircularProgress />
            </Box>
          ) : analytics.error ? (
            <Alert severity="error" sx={{ mb: 3 }}>
              {analytics.error}
            </Alert>
          ) : (
            <DataTabsSection analytics={analytics} />
          )}
        </TabPanel>
      </Paper>
    </Box>
  );
};

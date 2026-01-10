import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  CircularProgress,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
} from '@mui/material';
import { TrendingUp, Assignment, People, Payments } from '@mui/icons-material';
import { Title } from 'react-admin';
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
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/ar';
import { supabase } from 'lib/supabase';
import { toArabicNumerals } from 'utils';
import { useFinancialStats, useAnalytics } from 'hooks';

const COLORS = ['#4caf50', '#ff9800', '#f44336'];
const ANALYTICS_COLORS = [
  '#2196f3',
  '#4caf50',
  '#ff9800',
  '#f44336',
  '#9c27b0',
  '#00bcd4',
  '#ff5722',
  '#3f51b5',
];

interface DashboardStats {
  todayRevenue: number;
  pendingOrders: number;
  totalReservations: number;
  activeClients: number;
  weeklyData: { day: string; revenue: number }[];
  loading: boolean;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

export const Dashboard = () => {
  const [startDate, setStartDate] = useState<Dayjs>(dayjs().subtract(30, 'day'));
  const [endDate, setEndDate] = useState<Dayjs>(dayjs());
  const [currentTab, setCurrentTab] = useState(0);

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
    setCurrentTab(newValue);
  };

  const paymentStatusData = [
    { name: 'مدفوع بالكامل', value: financialStats.paymentStatus.paid, color: COLORS[0] },
    {
      name: 'مدفوع جزئياً',
      value: financialStats.paymentStatus.partiallyPaid,
      color: COLORS[1],
    },
    { name: 'غير مدفوع', value: financialStats.paymentStatus.unpaid, color: COLORS[2] },
  ];

  const formatCurrency = (value: number) => {
    return `${toArabicNumerals(value.toFixed(2))} ج.م`;
  };

  const formatDate = (dateStr: string) => {
    return dayjs(dateStr).format('DD/MM');
  };

  const StatCard = ({
    title,
    value,
    icon,
    color,
    suffix = '',
  }: {
    title: string;
    value: number | string;
    icon: React.ReactNode;
    color: string;
    suffix?: string;
  }) => (
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

  if (stats.loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ar">
      <Box sx={{ p: 3 }}>
        <Title title="مرحباً بالصفوة" />

        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          لوحة التحكم
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
              {toArabicNumerals(financialStats.totalOrders)} طلب إجمالي
            </Typography>
          </Box>
        </Paper>

        {/* Quick Stats */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="إيرادات اليوم"
              value={stats.todayRevenue.toFixed(2)}
              icon={<TrendingUp />}
              color="success"
              suffix="ج.م"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="طلبات قيد التنفيذ"
              value={stats.pendingOrders}
              icon={<Assignment />}
              color="warning"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="إجمالي الطلبات (٣٠ يوم)"
              value={stats.totalReservations}
              icon={<Payments />}
              color="info"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="العملاء النشطين"
              value={stats.activeClients}
              icon={<People />}
              color="primary"
            />
          </Grid>
        </Grid>

        {/* Financial Summary Cards */}
        {financialStats.loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
            <CircularProgress />
          </Box>
        ) : financialStats.error ? (
          <Alert severity="error" sx={{ mb: 3 }}>
            {financialStats.error}
          </Alert>
        ) : (
          <>
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      إجمالي الإيرادات
                    </Typography>
                    <Typography variant="h4">
                      {formatCurrency(financialStats.totalRevenue)}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      من {toArabicNumerals(financialStats.totalOrders)} طلب
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
                    <Typography variant="h4">
                      {formatCurrency(financialStats.totalPending)}
                    </Typography>
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
                    <Typography variant="h4">
                      {formatCurrency(financialStats.averageOrderValue)}
                    </Typography>
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
                    <Typography variant="h4">
                      {toArabicNumerals(financialStats.completedOrders)}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      من {toArabicNumerals(financialStats.totalOrders)} طلب
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
                <LineChart data={financialStats.dailyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={formatDate} reversed={true} />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
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
                <BarChart data={financialStats.dailyRevenue}>
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
            <Paper sx={{ p: 3, mb: 3 }}>
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

        {/* Analytics Section */}
        {analytics.loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
            <CircularProgress />
          </Box>
        ) : analytics.error ? (
          <Alert severity="error" sx={{ mb: 3 }}>
            {analytics.error}
          </Alert>
        ) : (
          <>
            {/* Delivery Metrics */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      إجمالي العملاء
                    </Typography>
                    <Typography variant="h4">
                      {toArabicNumerals(analytics.clientAnalytics.totalClients)}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      VIP: {toArabicNumerals(analytics.clientAnalytics.vipClients)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      التسليم في الموعد
                    </Typography>
                    <Typography variant="h4">
                      {toArabicNumerals(analytics.deliveryMetrics.onTime)}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      من إجمالي{' '}
                      {toArabicNumerals(
                        analytics.deliveryMetrics.onTime + analytics.deliveryMetrics.late
                      )}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: 'error.light', color: 'error.contrastText' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      التسليم المتأخر
                    </Typography>
                    <Typography variant="h4">
                      {toArabicNumerals(analytics.deliveryMetrics.late)}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      طلبات متأخرة
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: 'info.light', color: 'info.contrastText' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      متوسط وقت التسليم
                    </Typography>
                    <Typography variant="h4">
                      {toArabicNumerals(Math.round(analytics.deliveryMetrics.averageDeliveryTime))}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      ساعة
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Tabs for Analytics */}
            <Paper sx={{ mb: 3 }}>
              <Tabs
                value={currentTab}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                sx={{ borderBottom: 1, borderColor: 'divider' }}
              >
                <Tab label="الأكثر مبيعاً" />
                <Tab label="توزيع السنوات الدراسية" />
                <Tab label="توزيع الفصول الدراسية" />
                <Tab label="أنواع المطبوعات" />
                <Tab label="أفضل العملاء" />
              </Tabs>

              {/* Tab 0: Bestsellers */}
              <TabPanel value={currentTab} index={0}>
                <Typography variant="h6" gutterBottom>
                  أفضل {toArabicNumerals(10)} مطبوعات مبيعاً
                </Typography>
                {analytics.bestsellers.length === 0 ? (
                  <Alert severity="info">لا توجد بيانات لعرضها</Alert>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>#</TableCell>
                          <TableCell>العنوان</TableCell>
                          <TableCell align="center">الكمية</TableCell>
                          <TableCell align="center">عدد الطلبات</TableCell>
                          <TableCell align="center">الإيرادات</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {analytics.bestsellers.map((item, index) => (
                          <TableRow key={item.publicationId}>
                            <TableCell>{toArabicNumerals(index + 1)}</TableCell>
                            <TableCell>{item.title}</TableCell>
                            <TableCell align="center">
                              <Chip
                                label={toArabicNumerals(item.totalQuantity)}
                                color="primary"
                                size="small"
                              />
                            </TableCell>
                            <TableCell align="center">
                              {toArabicNumerals(item.orderCount)}
                            </TableCell>
                            <TableCell align="center">
                              {formatCurrency(item.totalRevenue)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </TabPanel>

              {/* Tab 1: Academic Year Distribution */}
              <TabPanel value={currentTab} index={1}>
                <Typography variant="h6" gutterBottom>
                  توزيع المبيعات حسب السنة الدراسية
                </Typography>
                {analytics.academicYearDistribution.length === 0 ? (
                  <Alert severity="info">لا توجد بيانات لعرضها</Alert>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={analytics.academicYearDistribution}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" angle={-45} textAnchor="end" height={100} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" fill="#2196f3" name="الكمية" />
                      </BarChart>
                    </ResponsiveContainer>
                    <TableContainer sx={{ mt: 3 }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>السنة الدراسية</TableCell>
                            <TableCell align="center">الكمية</TableCell>
                            <TableCell align="center">الإيرادات</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {analytics.academicYearDistribution.map((item) => (
                            <TableRow key={item.year}>
                              <TableCell>{item.year}</TableCell>
                              <TableCell align="center">{toArabicNumerals(item.count)}</TableCell>
                              <TableCell align="center">{formatCurrency(item.revenue)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </>
                )}
              </TabPanel>

              {/* Tab 2: Term Distribution */}
              <TabPanel value={currentTab} index={2}>
                <Typography variant="h6" gutterBottom>
                  توزيع المبيعات حسب الفصل الدراسي
                </Typography>
                {analytics.termDistribution.length === 0 ? (
                  <Alert severity="info">لا توجد بيانات لعرضها</Alert>
                ) : (
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={analytics.termDistribution}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ term, count }) => `${term}: ${toArabicNumerals(count)}`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="count"
                          >
                            {analytics.termDistribution.map((_entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={ANALYTICS_COLORS[index % ANALYTICS_COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>الفصل الدراسي</TableCell>
                              <TableCell align="center">الكمية</TableCell>
                              <TableCell align="center">الإيرادات</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {analytics.termDistribution.map((item) => (
                              <TableRow key={item.term}>
                                <TableCell>{item.term}</TableCell>
                                <TableCell align="center">{toArabicNumerals(item.count)}</TableCell>
                                <TableCell align="center">{formatCurrency(item.revenue)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Grid>
                  </Grid>
                )}
              </TabPanel>

              {/* Tab 3: Publication Type Distribution */}
              <TabPanel value={currentTab} index={3}>
                <Typography variant="h6" gutterBottom>
                  توزيع المبيعات حسب نوع المطبوعة
                </Typography>
                {analytics.publicationTypeDistribution.length === 0 ? (
                  <Alert severity="info">لا توجد بيانات لعرضها</Alert>
                ) : (
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={analytics.publicationTypeDistribution}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ type, count }) => `${type}: ${toArabicNumerals(count)}`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="count"
                          >
                            {analytics.publicationTypeDistribution.map((_entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={ANALYTICS_COLORS[index % ANALYTICS_COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>نوع المطبوعة</TableCell>
                              <TableCell align="center">الكمية</TableCell>
                              <TableCell align="center">الإيرادات</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {analytics.publicationTypeDistribution.map((item) => (
                              <TableRow key={item.type}>
                                <TableCell>{item.type}</TableCell>
                                <TableCell align="center">{toArabicNumerals(item.count)}</TableCell>
                                <TableCell align="center">{formatCurrency(item.revenue)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Grid>
                  </Grid>
                )}
              </TabPanel>

              {/* Tab 4: Top Clients */}
              <TabPanel value={currentTab} index={4}>
                <Typography variant="h6" gutterBottom>
                  أفضل {toArabicNumerals(10)} عملاء
                </Typography>
                {analytics.clientAnalytics.topClients.length === 0 ? (
                  <Alert severity="info">لا توجد بيانات لعرضها</Alert>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>#</TableCell>
                          <TableCell>اسم العميل</TableCell>
                          <TableCell align="center">عدد الطلبات</TableCell>
                          <TableCell align="center">إجمالي المشتريات</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {analytics.clientAnalytics.topClients.map((client, index) => (
                          <TableRow key={index}>
                            <TableCell>{toArabicNumerals(index + 1)}</TableCell>
                            <TableCell>{client.clientName}</TableCell>
                            <TableCell align="center">
                              <Chip
                                label={toArabicNumerals(client.orderCount)}
                                color="primary"
                                size="small"
                              />
                            </TableCell>
                            <TableCell align="center">
                              {formatCurrency(client.totalSpent)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </TabPanel>
            </Paper>
          </>
        )}
      </Box>
    </LocalizationProvider>
  );
};

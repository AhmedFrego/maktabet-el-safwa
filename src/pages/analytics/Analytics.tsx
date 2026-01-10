import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Alert,
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
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/ar';
import {
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
import { useAnalytics } from 'hooks';
import { toArabicNumerals } from 'utils';

const COLORS = [
  '#2196f3',
  '#4caf50',
  '#ff9800',
  '#f44336',
  '#9c27b0',
  '#00bcd4',
  '#ff5722',
  '#3f51b5',
];

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
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

export const Analytics = () => {
  const [startDate, setStartDate] = useState<Dayjs>(dayjs().subtract(30, 'day'));
  const [endDate, setEndDate] = useState<Dayjs>(dayjs());
  const [currentTab, setCurrentTab] = useState(0);

  const analytics = useAnalytics({ startDate, endDate });

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const formatCurrency = (value: number) => {
    return `${toArabicNumerals(value.toFixed(2))} ج.م`;
  };

  if (analytics.error) {
    return (
      <Box sx={{ p: 3 }}>
        <Title title="التحليلات والإحصائيات" />
        <Alert severity="error">{analytics.error}</Alert>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ar">
      <Box sx={{ p: 3 }}>
        <Title title="التحليلات والإحصائيات" />

        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          التحليلات والإحصائيات
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
          </Box>
        </Paper>

        {analytics.loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Summary Cards */}
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

            {/* Tabs */}
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
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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

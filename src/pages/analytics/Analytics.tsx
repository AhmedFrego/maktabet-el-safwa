import { useState } from 'react';
import {
  Box,
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
  Typography,
} from '@mui/material';
import { Title } from 'react-admin';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/ar';
import { useAnalytics } from 'hooks';
import { toArabicNumerals, formatCurrency } from 'utils';
import { DateRangeFilter, TabPanel, ColoredSummaryCard } from 'components/UI';
import { DistributionBarChart, DistributionPieChart, ANALYTICS_COLORS } from 'components/charts';
import { useAppDispatch, useAppSelector } from 'store';
import { setAnalyticsTab } from 'store/slices';

export const Analytics = () => {
  const dispatch = useAppDispatch();
  const currentTab = useAppSelector((state) => state.ui.analyticsActiveTab);

  const [startDate, setStartDate] = useState<Dayjs>(dayjs().subtract(30, 'day'));
  const [endDate, setEndDate] = useState<Dayjs>(dayjs());

  const analytics = useAnalytics({ startDate, endDate });

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    dispatch(setAnalyticsTab(newValue));
  };

  if (analytics.error) {
    return (
      <Box sx={{ p: 3 }}>
        <Title title="التحليلات والإحصائيات" />
        <Alert severity="error">{analytics.error}</Alert>
      </Box>
    );
  }

  const totalDeliveries = analytics.deliveryMetrics.onTime + analytics.deliveryMetrics.late;

  return (
    <Box sx={{ p: 3 }}>
      <Title title="التحليلات والإحصائيات" />

      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        التحليلات والإحصائيات
      </Typography>

      {/* Date Range Filter */}
      <DateRangeFilter
        dateRange={{ from: startDate, to: endDate }}
        onChange={(range) => {
          if (range.from) setStartDate(range.from);
          if (range.to) setEndDate(range.to);
        }}
      />

      {analytics.loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Summary Cards */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <ColoredSummaryCard
                title="إجمالي العملاء"
                value={toArabicNumerals(analytics.clientAnalytics.totalClients)}
                subtitle={`VIP: ${toArabicNumerals(analytics.clientAnalytics.vipClients)}`}
                bgcolor="primary.light"
                textColor="primary.contrastText"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <ColoredSummaryCard
                title="التسليم في الموعد"
                value={toArabicNumerals(analytics.deliveryMetrics.onTime)}
                subtitle={`من إجمالي ${toArabicNumerals(totalDeliveries)}`}
                bgcolor="success.light"
                textColor="success.contrastText"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <ColoredSummaryCard
                title="التسليم المتأخر"
                value={toArabicNumerals(analytics.deliveryMetrics.late)}
                subtitle="طلبات متأخرة"
                bgcolor="error.light"
                textColor="error.contrastText"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <ColoredSummaryCard
                title="متوسط وقت التسليم"
                value={toArabicNumerals(Math.round(analytics.deliveryMetrics.averageDeliveryTime))}
                subtitle="ساعة"
                bgcolor="info.light"
                textColor="info.contrastText"
              />
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
            <TabPanel value={currentTab} index={0} idPrefix="analytics">
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
                          <TableCell align="center">{toArabicNumerals(item.orderCount)}</TableCell>
                          <TableCell align="center">{formatCurrency(item.totalRevenue)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </TabPanel>

            {/* Tab 1: Academic Year Distribution */}
            <TabPanel value={currentTab} index={1} idPrefix="analytics">
              <Typography variant="h6" gutterBottom>
                توزيع المبيعات حسب السنة الدراسية
              </Typography>
              {analytics.academicYearDistribution.length === 0 ? (
                <Alert severity="info">لا توجد بيانات لعرضها</Alert>
              ) : (
                <>
                  <DistributionBarChart
                    data={analytics.academicYearDistribution}
                    xAxisKey="year"
                    dataKey="count"
                    title=""
                    barName="الكمية"
                  />
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
            <TabPanel value={currentTab} index={2} idPrefix="analytics">
              <Typography variant="h6" gutterBottom>
                توزيع المبيعات حسب الفصل الدراسي
              </Typography>
              {analytics.termDistribution.length === 0 ? (
                <Alert severity="info">لا توجد بيانات لعرضها</Alert>
              ) : (
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <DistributionPieChart
                      data={analytics.termDistribution}
                      labelKey="term"
                      dataKey="count"
                      colors={ANALYTICS_COLORS}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
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
            <TabPanel value={currentTab} index={3} idPrefix="analytics">
              <Typography variant="h6" gutterBottom>
                توزيع المبيعات حسب نوع المطبوعة
              </Typography>
              {analytics.publicationTypeDistribution.length === 0 ? (
                <Alert severity="info">لا توجد بيانات لعرضها</Alert>
              ) : (
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <DistributionPieChart
                      data={analytics.publicationTypeDistribution}
                      labelKey="type"
                      dataKey="count"
                      colors={ANALYTICS_COLORS}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
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
            <TabPanel value={currentTab} index={4} idPrefix="analytics">
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
                          <TableCell align="center">{formatCurrency(client.totalSpent)}</TableCell>
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
  );
};

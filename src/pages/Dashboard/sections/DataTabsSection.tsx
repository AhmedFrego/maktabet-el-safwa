import { useState } from 'react';
import {
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
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { useTranslate } from 'react-admin';
import { TabPanel } from 'components/UI';
import { DistributionBarChart, DistributionPieChart, ANALYTICS_COLORS } from 'components/charts';
import { formatCurrency } from 'utils/helpers/formatCurrency';
import { toArabicNumerals } from 'utils';

interface DataTabsSectionProps {
  analytics: {
    bestsellers: Array<{
      publicationId: string;
      title: string;
      totalQuantity: number;
      orderCount: number;
      totalRevenue: number;
    }>;
    academicYearDistribution: Array<{
      year: string;
      count: number;
      revenue: number;
    }>;
    termDistribution: Array<{
      term: string;
      count: number;
      revenue: number;
    }>;
    publicationTypeDistribution: Array<{
      type: string;
      count: number;
      revenue: number;
    }>;
    clientAnalytics: {
      topClients: Array<{
        clientName: string;
        orderCount: number;
        totalSpent: number;
      }>;
    };
  };
}

/**
 * Dashboard section containing data tabs for bestsellers, distributions, and top clients.
 */
export const DataTabsSection = ({ analytics }: DataTabsSectionProps) => {
  const [currentTab, setCurrentTab] = useState(0);
  const translate = useTranslate();

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  return (
    <Paper sx={{ mb: 3 }}>
      <Tabs
        value={currentTab}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label={translate('custom.tabs.best_selling')} />
        <Tab label={translate('custom.tabs.academic_year_dist')} />
        <Tab label={translate('custom.tabs.term_dist')} />
        <Tab label={translate('custom.tabs.publication_types')} />
        <Tab label={translate('custom.tabs.top_clients')} />
      </Tabs>

      {/* Tab 0: Bestsellers */}
      <TabPanel value={currentTab} index={0} idPrefix="data">
        <Typography variant="h6" gutterBottom>
          {translate('custom.tabs.top_publications', { count: toArabicNumerals(10) })}
        </Typography>
        {analytics.bestsellers.length === 0 ? (
          <Alert severity="info">{translate('custom.labels.no_data')}</Alert>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>{translate('custom.labels.title')}</TableCell>
                  <TableCell align="center">{translate('custom.labels.quantity')}</TableCell>
                  <TableCell align="center">{translate('custom.labels.num_orders')}</TableCell>
                  <TableCell align="center">{translate('custom.labels.revenue')}</TableCell>
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
      <TabPanel value={currentTab} index={1} idPrefix="data">
        <Typography variant="h6" gutterBottom>
          {translate('custom.tabs.sales_by_year')}
        </Typography>
        {analytics.academicYearDistribution.length === 0 ? (
          <Alert severity="info">{translate('custom.labels.no_data')}</Alert>
        ) : (
          <>
            <DistributionBarChart
              data={analytics.academicYearDistribution}
              xAxisKey="year"
              dataKey="count"
              title=""
              barName={translate('custom.labels.quantity')}
            />
            <TableContainer sx={{ mt: 3 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>{translate('custom.labels.academic_year')}</TableCell>
                    <TableCell align="center">{translate('custom.labels.quantity')}</TableCell>
                    <TableCell align="center">{translate('custom.labels.revenue')}</TableCell>
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
      <TabPanel value={currentTab} index={2} idPrefix="data">
        <Typography variant="h6" gutterBottom>
          {translate('custom.tabs.sales_by_term')}
        </Typography>
        {analytics.termDistribution.length === 0 ? (
          <Alert severity="info">{translate('custom.labels.no_data')}</Alert>
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
                      <TableCell>{translate('custom.labels.term')}</TableCell>
                      <TableCell align="center">{translate('custom.labels.quantity')}</TableCell>
                      <TableCell align="center">{translate('custom.labels.revenue')}</TableCell>
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
      <TabPanel value={currentTab} index={3} idPrefix="data">
        <Typography variant="h6" gutterBottom>
          {translate('custom.tabs.sales_by_type')}
        </Typography>
        {analytics.publicationTypeDistribution.length === 0 ? (
          <Alert severity="info">{translate('custom.labels.no_data')}</Alert>
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
                      <TableCell>{translate('custom.labels.publication_type')}</TableCell>
                      <TableCell align="center">{translate('custom.labels.quantity')}</TableCell>
                      <TableCell align="center">{translate('custom.labels.revenue')}</TableCell>
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
      <TabPanel value={currentTab} index={4} idPrefix="data">
        <Typography variant="h6" gutterBottom>
          {translate('custom.tabs.top_clients_title', { count: toArabicNumerals(10) })}
        </Typography>
        {analytics.clientAnalytics.topClients.length === 0 ? (
          <Alert severity="info">{translate('custom.labels.no_data')}</Alert>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>{translate('custom.labels.client_name')}</TableCell>
                  <TableCell align="center">{translate('custom.labels.num_orders')}</TableCell>
                  <TableCell align="center">{translate('custom.labels.total_purchases')}</TableCell>
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
  );
};

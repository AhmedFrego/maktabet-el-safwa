import Grid from '@mui/material/Grid';
import { TrendingUp, Assignment, People, Payments } from '@mui/icons-material';
import { StatCard, ColoredSummaryCard } from 'components/UI';
import { formatCurrency } from 'utils/helpers/formatCurrency';
import { toArabicNumerals } from 'utils';
import { useTranslate } from 'react-admin';
import type { DashboardStats } from '../types';

interface QuickStatsSectionProps {
  stats: DashboardStats;
  financialStats: {
    totalRevenue: number;
    totalPending: number;
    averageOrderValue: number;
    completedOrders: number;
    totalOrders: number;
  };
}

/**
 * Dashboard section displaying quick stats cards and financial summary cards.
 */
export const QuickStatsSection = ({ stats, financialStats }: QuickStatsSectionProps) => {
  const translate = useTranslate();
  return (
    <>
      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title={translate('custom.stats.today_revenue')}
            value={stats.todayRevenue.toFixed(2)}
            icon={<TrendingUp />}
            color="success"
            suffix={translate('custom.currency.short')}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title={translate('custom.stats.in_progress_orders')}
            value={stats.pendingOrders}
            icon={<Assignment />}
            color="warning"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title={translate('custom.stats.total_orders_30d')}
            value={stats.totalReservations}
            icon={<Payments />}
            color="info"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title={translate('custom.stats.active_clients')}
            value={stats.activeClients}
            icon={<People />}
            color="primary"
          />
        </Grid>
      </Grid>

      {/* Financial Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <ColoredSummaryCard
            title={translate('custom.stats.total_revenue')}
            value={formatCurrency(financialStats.totalRevenue)}
            subtitle={translate('custom.stats.from')}
            count={financialStats.totalOrders}
            countLabel={translate('custom.stats.order')}
            bgcolor="success.light"
            textColor="success.contrastText"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <ColoredSummaryCard
            title={translate('custom.stats.remaining_amounts')}
            value={formatCurrency(financialStats.totalPending)}
            subtitle={translate('custom.stats.unpaid_dues')}
            bgcolor="warning.light"
            textColor="warning.contrastText"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <ColoredSummaryCard
            title={translate('custom.stats.avg_order_value')}
            value={formatCurrency(financialStats.averageOrderValue)}
            subtitle={translate('custom.stats.avg_value')}
            bgcolor="info.light"
            textColor="info.contrastText"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <ColoredSummaryCard
            title={translate('custom.stats.completed_orders')}
            value={toArabicNumerals(financialStats.completedOrders)}
            subtitle={translate('custom.stats.from')}
            count={financialStats.totalOrders}
            countLabel={translate('custom.stats.order')}
            bgcolor="primary.light"
            textColor="primary.contrastText"
          />
        </Grid>
      </Grid>
    </>
  );
};

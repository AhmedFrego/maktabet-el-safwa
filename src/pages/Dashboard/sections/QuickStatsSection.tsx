import Grid from '@mui/material/Grid';
import { TrendingUp, Assignment, People, Payments } from '@mui/icons-material';
import { StatCard, ColoredSummaryCard } from 'components/UI';
import { formatCurrency } from 'utils/helpers/formatCurrency';
import { toArabicNumerals } from 'utils';
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
  return (
    <>
      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="إيرادات اليوم"
            value={stats.todayRevenue.toFixed(2)}
            icon={<TrendingUp />}
            color="success"
            suffix="ج.م"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="طلبات قيد التنفيذ"
            value={stats.pendingOrders}
            icon={<Assignment />}
            color="warning"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="إجمالي الطلبات (٣٠ يوم)"
            value={stats.totalReservations}
            icon={<Payments />}
            color="info"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="العملاء النشطين"
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
            title="إجمالي الإيرادات"
            value={formatCurrency(financialStats.totalRevenue)}
            subtitle="من"
            count={financialStats.totalOrders}
            countLabel="طلب"
            bgcolor="success.light"
            textColor="success.contrastText"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <ColoredSummaryCard
            title="المبالغ المتبقية"
            value={formatCurrency(financialStats.totalPending)}
            subtitle="مستحقات غير مدفوعة"
            bgcolor="warning.light"
            textColor="warning.contrastText"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <ColoredSummaryCard
            title="متوسط قيمة الطلب"
            value={formatCurrency(financialStats.averageOrderValue)}
            subtitle="القيمة المتوسطة"
            bgcolor="info.light"
            textColor="info.contrastText"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <ColoredSummaryCard
            title="الطلبات المكتملة"
            value={toArabicNumerals(financialStats.completedOrders)}
            subtitle="من"
            count={financialStats.totalOrders}
            countLabel="طلب"
            bgcolor="primary.light"
            textColor="primary.contrastText"
          />
        </Grid>
      </Grid>
    </>
  );
};

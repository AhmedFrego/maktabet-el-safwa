import Grid from '@mui/material/Grid';
import { ColoredSummaryCard } from 'components/UI';
import { toArabicNumerals } from 'utils';

interface AnalyticsCardsSectionProps {
  analytics: {
    clientAnalytics: {
      totalClients: number;
      vipClients: number;
    };
    deliveryMetrics: {
      onTime: number;
      late: number;
      averageDeliveryTime: number;
    };
  };
}

/**
 * Dashboard section displaying analytics cards for clients and delivery metrics.
 */
export const AnalyticsCardsSection = ({ analytics }: AnalyticsCardsSectionProps) => {
  const totalDeliveries = analytics.deliveryMetrics.onTime + analytics.deliveryMetrics.late;

  return (
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
  );
};

import Grid from '@mui/material/Grid';
import { ColoredSummaryCard } from 'components/UI';
import { toArabicNumerals } from 'utils';
import { useTranslate } from 'react-admin';

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
  const translate = useTranslate();
  const totalDeliveries = analytics.deliveryMetrics.onTime + analytics.deliveryMetrics.late;

  return (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <ColoredSummaryCard
          title={translate('custom.stats.total_clients')}
          value={toArabicNumerals(analytics.clientAnalytics.totalClients)}
          subtitle={`VIP: ${toArabicNumerals(analytics.clientAnalytics.vipClients)}`}
          bgcolor="primary.light"
          textColor="primary.contrastText"
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <ColoredSummaryCard
          title={translate('custom.stats.on_time_delivery')}
          value={toArabicNumerals(analytics.deliveryMetrics.onTime)}
          subtitle={`${translate('custom.stats.from_total')} ${toArabicNumerals(totalDeliveries)}`}
          bgcolor="success.light"
          textColor="success.contrastText"
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <ColoredSummaryCard
          title={translate('custom.stats.late_delivery')}
          value={toArabicNumerals(analytics.deliveryMetrics.late)}
          subtitle={translate('custom.stats.late_orders')}
          bgcolor="error.light"
          textColor="error.contrastText"
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <ColoredSummaryCard
          title={translate('custom.stats.avg_delivery_time')}
          value={toArabicNumerals(Math.round(analytics.deliveryMetrics.averageDeliveryTime))}
          subtitle={translate('custom.stats.hour')}
          bgcolor="info.light"
          textColor="info.contrastText"
        />
      </Grid>
    </Grid>
  );
};

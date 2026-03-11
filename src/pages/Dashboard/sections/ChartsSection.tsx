import {
  DailyRevenueChart,
  OrdersBarChart,
  PaymentStatusPie,
  CHART_COLORS,
} from 'components/charts';
import { useTranslate } from 'react-admin';

interface ChartsSectionProps {
  financialStats: {
    dailyRevenue: Array<{ date: string; revenue: number; orders: number }>;
    paymentStatus: {
      paid: number;
      partiallyPaid: number;
      unpaid: number;
    };
  };
}

/**
 * Dashboard section displaying revenue and order charts.
 */
export const ChartsSection = ({ financialStats }: ChartsSectionProps) => {
  const translate = useTranslate();
  const paymentStatusData = [
    {
      name: translate('custom.charts.paid_full'),
      value: financialStats.paymentStatus.paid,
      color: CHART_COLORS[0],
    },
    {
      name: translate('custom.charts.paid_partial'),
      value: financialStats.paymentStatus.partiallyPaid,
      color: CHART_COLORS[1],
    },
    {
      name: translate('custom.charts.unpaid'),
      value: financialStats.paymentStatus.unpaid,
      color: CHART_COLORS[2],
    },
  ];

  return (
    <>
      <DailyRevenueChart data={financialStats.dailyRevenue} />
      <OrdersBarChart data={financialStats.dailyRevenue} />
      <PaymentStatusPie data={paymentStatusData} />
    </>
  );
};

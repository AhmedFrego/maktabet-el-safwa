import { DailyRevenueChart, OrdersBarChart, PaymentStatusPie, CHART_COLORS } from 'components/charts';

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
  const paymentStatusData = [
    { name: 'مدفوع بالكامل', value: financialStats.paymentStatus.paid, color: CHART_COLORS[0] },
    {
      name: 'مدفوع جزئياً',
      value: financialStats.paymentStatus.partiallyPaid,
      color: CHART_COLORS[1],
    },
    { name: 'غير مدفوع', value: financialStats.paymentStatus.unpaid, color: CHART_COLORS[2] },
  ];

  return (
    <>
      <DailyRevenueChart data={financialStats.dailyRevenue} />
      <OrdersBarChart data={financialStats.dailyRevenue} />
      <PaymentStatusPie data={paymentStatusData} />
    </>
  );
};

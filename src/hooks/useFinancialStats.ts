import { useEffect, useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { supabase } from 'lib/supabase';

export interface FinancialStats {
  totalRevenue: number;
  totalPending: number;
  totalOrders: number;
  completedOrders: number;
  averageOrderValue: number;
  dailyRevenue: { date: string; revenue: number; orders: number }[];
  paymentStatus: {
    paid: number;
    partiallyPaid: number;
    unpaid: number;
  };
  loading: boolean;
  error: string | null;
}

interface UseFinancialStatsProps {
  startDate: Dayjs;
  endDate: Dayjs;
}

export const useFinancialStats = ({
  startDate,
  endDate,
}: UseFinancialStatsProps): FinancialStats => {
  const [stats, setStats] = useState<FinancialStats>({
    totalRevenue: 0,
    totalPending: 0,
    totalOrders: 0,
    completedOrders: 0,
    averageOrderValue: 0,
    dailyRevenue: [],
    paymentStatus: {
      paid: 0,
      partiallyPaid: 0,
      unpaid: 0,
    },
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchFinancialStats = async () => {
      try {
        setStats((prev) => ({ ...prev, loading: true, error: null }));

        // Fetch reservations within date range
        const { data: reservations, error } = await supabase
          .from('reservations')
          .select('*')
          .gte('created_at', startDate.startOf('day').toISOString())
          .lte('created_at', endDate.endOf('day').toISOString())
          .neq('reservation_status', 'canceled');

        if (error) throw error;

        if (!reservations || reservations.length === 0) {
          setStats({
            totalRevenue: 0,
            totalPending: 0,
            totalOrders: 0,
            completedOrders: 0,
            averageOrderValue: 0,
            dailyRevenue: [],
            paymentStatus: { paid: 0, partiallyPaid: 0, unpaid: 0 },
            loading: false,
            error: null,
          });
          return;
        }

        // Calculate totals
        const totalRevenue = reservations.reduce((sum, r) => sum + (r.paid_amount || 0), 0);
        const totalPending = reservations.reduce((sum, r) => sum + (r.remain_amount || 0), 0);
        const totalOrders = reservations.length;
        const completedOrders = reservations.filter(
          (r) => r.reservation_status === 'delivered'
        ).length;
        const averageOrderValue =
          totalOrders > 0
            ? reservations.reduce((sum, r) => sum + (r.total_price || 0), 0) / totalOrders
            : 0;

        // Calculate payment status
        const paid = reservations.filter((r) => r.remain_amount === 0).length;
        const unpaid = reservations.filter((r) => r.paid_amount === 0).length;
        const partiallyPaid = totalOrders - paid - unpaid;

        // Calculate daily revenue
        const dailyRevenueMap = new Map<string, { revenue: number; orders: number }>();

        reservations.forEach((reservation) => {
          const date = dayjs(reservation.created_at).format('YYYY-MM-DD');
          const existing = dailyRevenueMap.get(date) || { revenue: 0, orders: 0 };
          dailyRevenueMap.set(date, {
            revenue: existing.revenue + (reservation.paid_amount || 0),
            orders: existing.orders + 1,
          });
        });

        // Fill in missing dates with zero values
        const dailyRevenue: { date: string; revenue: number; orders: number }[] = [];
        let currentDate = startDate.clone();

        while (currentDate.isBefore(endDate) || currentDate.isSame(endDate, 'day')) {
          const dateStr = currentDate.format('YYYY-MM-DD');
          const data = dailyRevenueMap.get(dateStr) || { revenue: 0, orders: 0 };
          dailyRevenue.push({
            date: dateStr,
            revenue: data.revenue,
            orders: data.orders,
          });
          currentDate = currentDate.add(1, 'day');
        }

        setStats({
          totalRevenue,
          totalPending,
          totalOrders,
          completedOrders,
          averageOrderValue,
          dailyRevenue,
          paymentStatus: {
            paid,
            partiallyPaid,
            unpaid,
          },
          loading: false,
          error: null,
        });
      } catch (err) {
        console.error('Error fetching financial stats:', err);
        setStats((prev) => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err.message : 'فشل تحميل البيانات المالية',
        }));
      }
    };

    fetchFinancialStats();
  }, [startDate, endDate]);

  return stats;
};

import { useEffect, useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { supabase } from 'lib/supabase';
import { calculateReservationTotal, calculateRemaining, isFullyPaid } from 'utils';

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

        // Fetch reservations within date range with reserved_items
        const { data: reservations, error } = await supabase
          .from('reservations')
          .select('id, created_at, reservation_status, paid_amount, reserved_items')
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

        // Calculate totals dynamically from reserved_items
        const totalRevenue = reservations.reduce((sum, r) => sum + (r.paid_amount || 0), 0);

        // Calculate total order values and pending amounts from reserved_items
        let totalOrderValue = 0;
        let totalPending = 0;
        let paidCount = 0;
        let unpaidCount = 0;

        reservations.forEach((r) => {
          const reservationTotal = calculateReservationTotal(r.reserved_items);
          totalOrderValue += reservationTotal;

          const isPaid = isFullyPaid(r.reserved_items, r.paid_amount || 0);
          const remaining = calculateRemaining(r.reserved_items, r.paid_amount || 0);

          totalPending += remaining;

          if (isPaid) {
            paidCount++;
          } else if (r.paid_amount === 0) {
            unpaidCount++;
          }
        });

        const totalOrders = reservations.length;
        const completedOrders = reservations.filter(
          (r) => r.reservation_status === 'delivered'
        ).length;
        const averageOrderValue = totalOrders > 0 ? totalOrderValue / totalOrders : 0;

        // Calculate payment status
        const partiallyPaid = totalOrders - paidCount - unpaidCount;

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
            paid: paidCount,
            partiallyPaid,
            unpaid: unpaidCount,
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

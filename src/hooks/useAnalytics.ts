import { useEffect, useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { supabase } from 'lib/supabase';

export interface AnalyticsData {
  bestsellers: {
    publicationId: string;
    title: string;
    totalQuantity: number;
    totalRevenue: number;
    orderCount: number;
  }[];
  academicYearDistribution: {
    year: string;
    count: number;
    revenue: number;
  }[];
  termDistribution: {
    term: string;
    count: number;
    revenue: number;
  }[];
  publicationTypeDistribution: {
    type: string;
    count: number;
    revenue: number;
  }[];
  clientAnalytics: {
    totalClients: number;
    vipClients: number;
    regularClients: number;
    topClients: {
      clientName: string;
      orderCount: number;
      totalSpent: number;
    }[];
  };
  deliveryMetrics: {
    onTime: number;
    late: number;
    averageDeliveryTime: number; // in hours
  };
  loading: boolean;
  error: string | null;
}

interface UseAnalyticsProps {
  startDate: Dayjs;
  endDate: Dayjs;
}

export const useAnalytics = ({ startDate, endDate }: UseAnalyticsProps): AnalyticsData => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    bestsellers: [],
    academicYearDistribution: [],
    termDistribution: [],
    publicationTypeDistribution: [],
    clientAnalytics: {
      totalClients: 0,
      vipClients: 0,
      regularClients: 0,
      topClients: [],
    },
    deliveryMetrics: {
      onTime: 0,
      late: 0,
      averageDeliveryTime: 0,
    },
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setAnalytics((prev) => ({ ...prev, loading: true, error: null }));

        // Fetch reservations with client data
        const { data: reservations, error: reservationsError } = await supabase
          .from('reservations')
          .select('*, client:users(full_name, role)')
          .gte('created_at', startDate.startOf('day').toISOString())
          .lte('created_at', endDate.endOf('day').toISOString())
          .neq('reservation_status', 'canceled');

        if (reservationsError) throw reservationsError;

        if (!reservations || reservations.length === 0) {
          setAnalytics({
            bestsellers: [],
            academicYearDistribution: [],
            termDistribution: [],
            publicationTypeDistribution: [],
            clientAnalytics: {
              totalClients: 0,
              vipClients: 0,
              regularClients: 0,
              topClients: [],
            },
            deliveryMetrics: {
              onTime: 0,
              late: 0,
              averageDeliveryTime: 0,
            },
            loading: false,
            error: null,
          });
          return;
        }

        // Process reserved items for bestsellers and distributions
        const publicationStats = new Map<
          string,
          {
            title: string;
            quantity: number;
            revenue: number;
            orders: number;
            academicYear?: string;
            term?: string;
            type?: string;
          }
        >();

        const academicYearMap = new Map<string, { count: number; revenue: number }>();
        const termMap = new Map<string, { count: number; revenue: number }>();
        const typeMap = new Map<string, { count: number; revenue: number }>();

        reservations.forEach((reservation) => {
          const items = (reservation.reserved_items as any[]) || [];

          items.forEach((item: any) => {
            const pubId = item.id || '';
            const existing = publicationStats.get(pubId) || {
              title: item.title || 'غير معروف',
              quantity: 0,
              revenue: 0,
              orders: 0,
              academicYear: item.academic_year,
              term: item.term,
              type: item.publication_type,
            };

            publicationStats.set(pubId, {
              ...existing,
              quantity: existing.quantity + (item.quantity || 0),
              revenue: existing.revenue + (item.totalPrice || 0),
              orders: existing.orders + 1,
            });

            // Academic year distribution
            if (item.academic_year) {
              const yearData = academicYearMap.get(item.academic_year) || { count: 0, revenue: 0 };
              academicYearMap.set(item.academic_year, {
                count: yearData.count + (item.quantity || 0),
                revenue: yearData.revenue + (item.totalPrice || 0),
              });
            }

            // Term distribution
            if (item.term) {
              const termData = termMap.get(item.term) || { count: 0, revenue: 0 };
              termMap.set(item.term, {
                count: termData.count + (item.quantity || 0),
                revenue: termData.revenue + (item.totalPrice || 0),
              });
            }

            // Publication type distribution
            if (item.publication_type) {
              const typeData = typeMap.get(item.publication_type) || { count: 0, revenue: 0 };
              typeMap.set(item.publication_type, {
                count: typeData.count + (item.quantity || 0),
                revenue: typeData.revenue + (item.totalPrice || 0),
              });
            }
          });
        });

        // Top 10 bestsellers
        const bestsellers = Array.from(publicationStats.entries())
          .map(([id, data]) => ({
            publicationId: id,
            title: data.title,
            totalQuantity: data.quantity,
            totalRevenue: data.revenue,
            orderCount: data.orders,
          }))
          .sort((a, b) => b.totalQuantity - a.totalQuantity)
          .slice(0, 10);

        // Academic year distribution
        const academicYearDistribution = Array.from(academicYearMap.entries())
          .map(([year, data]) => ({
            year: translateAcademicYear(year),
            count: data.count,
            revenue: data.revenue,
          }))
          .sort((a, b) => b.count - a.count);

        // Term distribution
        const termDistribution = Array.from(termMap.entries()).map(([term, data]) => ({
          term: translateTerm(term),
          count: data.count,
          revenue: data.revenue,
        }));

        // Publication type distribution
        const publicationTypeDistribution = Array.from(typeMap.entries()).map(([type, data]) => ({
          type: translatePublicationType(type),
          count: data.count,
          revenue: data.revenue,
        }));

        // Client analytics
        const clientMap = new Map<
          string,
          { name: string; orders: number; spent: number; role: string }
        >();

        reservations.forEach((reservation) => {
          const clientId = reservation.client_id;
          const clientName = (reservation.client as any)?.full_name || 'غير معروف';
          const clientRole = (reservation.client as any)?.role || 'client';
          const existing = clientMap.get(clientId) || {
            name: clientName,
            orders: 0,
            spent: 0,
            role: clientRole,
          };

          clientMap.set(clientId, {
            ...existing,
            orders: existing.orders + 1,
            spent: existing.spent + (reservation.total_price || 0),
          });
        });

        const totalClients = clientMap.size;
        const vipClients = Array.from(clientMap.values()).filter(
          (c) => c.role === 'vip-client'
        ).length;
        const regularClients = totalClients - vipClients;

        const topClients = Array.from(clientMap.values())
          .map((data) => ({
            clientName: data.name,
            orderCount: data.orders,
            totalSpent: data.spent,
          }))
          .sort((a, b) => b.totalSpent - a.totalSpent)
          .slice(0, 10);

        // Delivery metrics
        const deliveredReservations = reservations.filter((r) => r.delivered_at);
        let onTime = 0;
        let late = 0;
        let totalDeliveryTime = 0;

        deliveredReservations.forEach((reservation) => {
          if (reservation.delivered_at && reservation.dead_line) {
            const deliveredAt = dayjs(reservation.delivered_at);
            const deadline = dayjs(reservation.dead_line);

            if (deliveredAt.isAfter(deadline)) {
              late++;
            } else {
              onTime++;
            }

            // Calculate delivery time from creation
            const createdAt = dayjs(reservation.created_at);
            totalDeliveryTime += deliveredAt.diff(createdAt, 'hour');
          }
        });

        const averageDeliveryTime =
          deliveredReservations.length > 0 ? totalDeliveryTime / deliveredReservations.length : 0;

        setAnalytics({
          bestsellers,
          academicYearDistribution,
          termDistribution,
          publicationTypeDistribution,
          clientAnalytics: {
            totalClients,
            vipClients,
            regularClients,
            topClients,
          },
          deliveryMetrics: {
            onTime,
            late,
            averageDeliveryTime,
          },
          loading: false,
          error: null,
        });
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setAnalytics((prev) => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err.message : 'فشل تحميل بيانات التحليلات',
        }));
      }
    };

    fetchAnalytics();
  }, [startDate, endDate]);

  return analytics;
};

// Helper functions for translation
const translateAcademicYear = (year: string): string => {
  const translations: Record<string, string> = {
    KG0: 'KG صفر',
    KG1: 'KG أولى',
    KG2: 'KG ثانية',
    '1st_primary': 'الأول الابتدائي',
    '2nd_primary': 'الثاني الابتدائي',
    '3rd_primary': 'الثالث الابتدائي',
    '4th_primary': 'الرابع الابتدائي',
    '5th_primary': 'الخامس الابتدائي',
    '6th_primary': 'السادس الابتدائي',
    '1st_preparatory': 'الأول الإعدادي',
    '2nd_preparatory': 'الثاني الإعدادي',
    '3rd_preparatory': 'الثالث الإعدادي',
    '1st_secondary': 'الأول الثانوي',
    '2nd_secondary': 'الثاني الثانوي',
    '3rd_secondary': 'الثالث الثانوي',
  };
  return translations[year] || year;
};

const translateTerm = (term: string): string => {
  const translations: Record<string, string> = {
    '1st': 'الفصل الأول',
    '2nd': 'الفصل الثاني',
    full_year: 'السنة الكاملة',
  };
  return translations[term] || term;
};

const translatePublicationType = (type: string): string => {
  const translations: Record<string, string> = {
    note: 'مذكرة',
    book: 'كتاب',
    other: 'أخرى',
  };
  return translations[type] || type;
};

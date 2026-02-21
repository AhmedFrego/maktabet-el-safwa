export interface DashboardStats {
  todayRevenue: number;
  pendingOrders: number;
  totalReservations: number;
  activeClients: number;
  weeklyData: { day: string; revenue: number }[];
  loading: boolean;
}

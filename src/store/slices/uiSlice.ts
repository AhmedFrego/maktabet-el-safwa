import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

// Keys for localStorage persistence
const STORAGE_KEY = 'maktabet-ui-state';

export type ReceiptFormat = 'pdf' | 'jpg' | 'none';

// Helper to load from localStorage
const loadPersistedState = (): UIState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Ensure new fields have defaults if missing from old storage
      return {
        dashboardActiveTab: parsed.dashboardActiveTab ?? 0,
        analyticsActiveTab: parsed.analyticsActiveTab ?? 0,
        reservationReceiptFormat: parsed.reservationReceiptFormat ?? 'pdf',
        reservationAutoPrint: parsed.reservationAutoPrint ?? false,
        listPageSizes: parsed.listPageSizes ?? {},
      };
    }
  } catch (e) {
    console.warn('Failed to load persisted UI state:', e);
  }
  return {
    dashboardActiveTab: 0,
    analyticsActiveTab: 0,
    reservationReceiptFormat: 'pdf',
    reservationAutoPrint: false,
    listPageSizes: {},
  };
};

// Helper to save to localStorage
const saveState = (state: UIState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Failed to persist UI state:', e);
  }
};

export interface UIState {
  /** Active tab index for Dashboard page */
  dashboardActiveTab: number;
  /** Active tab index for Analytics page */
  analyticsActiveTab: number;
  /** Receipt download format on reservation submit: 'pdf', 'jpg', or 'none' */
  reservationReceiptFormat: ReceiptFormat;
  /** Whether to automatically print receipt on reservation submit */
  reservationAutoPrint: boolean;
  /** Per-resource list page size preferences: { resourceName: pageSize } */
  listPageSizes: Record<string, number>;
}

const initialState: UIState = loadPersistedState();

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setDashboardTab: (state, action: PayloadAction<number>) => {
      state.dashboardActiveTab = action.payload;
      saveState(state);
    },
    setAnalyticsTab: (state, action: PayloadAction<number>) => {
      state.analyticsActiveTab = action.payload;
      saveState(state);
    },
    setReservationReceiptFormat: (state, action: PayloadAction<ReceiptFormat>) => {
      state.reservationReceiptFormat = action.payload;
      saveState(state);
    },
    setReservationAutoPrint: (state, action: PayloadAction<boolean>) => {
      state.reservationAutoPrint = action.payload;
      saveState(state);
    },
    setListPageSize: (state, action: PayloadAction<{ resource: string; pageSize: number }>) => {
      state.listPageSizes[action.payload.resource] = action.payload.pageSize;
      saveState(state);
    },
  },
});

export const {
  setDashboardTab,
  setAnalyticsTab,
  setReservationReceiptFormat,
  setReservationAutoPrint,
  setListPageSize,
} = uiSlice.actions;

export default uiSlice.reducer;

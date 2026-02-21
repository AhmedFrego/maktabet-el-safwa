import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

// Keys for localStorage persistence
const STORAGE_KEY = 'maktabet-ui-state';

// Helper to load from localStorage
const loadPersistedState = (): UIState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn('Failed to load persisted UI state:', e);
  }
  return {
    dashboardActiveTab: 0,
    analyticsActiveTab: 0,
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
  },
});

export const { setDashboardTab, setAnalyticsTab } = uiSlice.actions;

export default uiSlice.reducer;

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { Publication } from 'resources/publications';
import { Enums } from 'types';

export type ReservationStatus = Enums<'reservation_state'>;
export interface ReservationBase {
  quantity: number;
  totalPrice: number;
  status: ReservationStatus;
  deliveredAt?: string | null;
  deliveredBy?: string | null;
  isDublix: boolean;
}

export interface ReservationMustKeys extends Publication {
  title: string;
  price: number;
  cover_type_id: string | undefined;
  cover_type: { name: string | undefined } | undefined;
}

export type ReservationRecord = ReservationBase & ReservationMustKeys;
export interface ReservationState {
  reservedItems: ReservationRecord[];
  isReserving: boolean | 'confirming';
}

const initialState: ReservationState = {
  reservedItems: [],
  isReserving: false,
};

export const reservationSlice = createSlice({
  name: 'reservation',
  initialState,
  reducers: {
    addOrIncreaseItem: (state, action: PayloadAction<ReservationMustKeys>) => {
      const existingItem = state.reservedItems.find((i) => i.id === action.payload.id);

      if (existingItem) {
        existingItem.quantity += 1;
        existingItem.totalPrice = existingItem.quantity * (existingItem.price || 10000);
      } else {
        state.reservedItems.push({
          ...action.payload,
          quantity: 1,
          status: 'in-progress',
          totalPrice: action.payload.price || 10000,
          isDublix: true,
          deliveredAt: null,
          deliveredBy: null,
        });
      }
    },
    modifyItem: (state, action: PayloadAction<Partial<ReservationRecord> & { id: string }>) => {
      const index = state.reservedItems.findIndex((item) => item.id === action.payload.id);

      if (index !== -1) {
        state.reservedItems[index] = {
          ...state.reservedItems[index],
          ...action.payload,
        };
      }
    },
    clearItems: () => initialState,
    decreaseItemQuantity(state, action: PayloadAction<string>) {
      const item = state.reservedItems.find((i) => i.id === action.payload);
      if (item) {
        if (item.quantity === 1) {
          state.reservedItems = state.reservedItems.filter((i) => i.id !== item.id);
        } else {
          item.quantity -= 1;
          item.totalPrice = item.quantity * (item.price || 0);
        }
      }
    },
    setIsReserving(state, action: PayloadAction<boolean | 'confirming'>) {
      state.isReserving = action.payload;
    },
    markAllAsDelivered(state) {
      const now = new Date().toISOString();
      state.reservedItems = state.reservedItems.map((item) => ({
        ...item,
        status: 'delivered' as ReservationStatus,
        deliveredAt: now,
      }));
    },
  },
});

export const {
  addOrIncreaseItem,
  clearItems,
  decreaseItemQuantity,
  setIsReserving,
  modifyItem,
  markAllAsDelivered,
} = reservationSlice.actions;

export default reservationSlice.reducer;

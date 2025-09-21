// reservationSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { Tables } from 'types';

export type ReservationStatus = 'in-progress' | 'ready' | 'canceled' | 'collected';

export interface ReservationBase {
  paperSize: Tables<'paper_sizes'>['name'];
  itemPrice: number | null;
  quantity: number;
  totalPrice: number;
  status: ReservationStatus;
}
interface ReservationRecord extends ReservationBase {
  [key: string]: unknown;
}

export interface ReservationState {
  reservedItems: ReservationRecord[];
  isReserving: boolean;
}

const initialState: ReservationState = {
  reservedItems: [],
  isReserving: false,
};

export const reservationSlice = createSlice({
  name: 'reservation',
  initialState,
  reducers: {
    addOrIncreaseItem(
      state,
      action: PayloadAction<{
        id: string;
        [key: string]: unknown;
        price: number;
        default_paper_size: Tables<'paper_sizes'>['name'];
      }>
    ) {
      // Check if the item already exists
      const existingItem = state.reservedItems.find((i) => i.id === action.payload.id);

      if (existingItem) {
        // If it exists → increase quantity & update totalPrice
        existingItem.quantity += 1;
        existingItem.totalPrice = existingItem.quantity * (existingItem.itemPrice || 0);
      } else {
        // If not → add as new item
        state.reservedItems.push({
          ...action.payload,
          quantity: 1,
          status: 'in-progress',
          itemPrice: action.payload.price,
          totalPrice: action.payload.price,
          paperSize: action.payload.default_paper_size,
        });
      }
    },

    clearItems() {
      return initialState;
    },

    decreaseItemQuantity(state, action: PayloadAction<string>) {
      const item = state.reservedItems.find((i) => i.id === action.payload);
      if (item) {
        if (item.quantity === 1) {
          state.reservedItems = state.reservedItems.filter((i) => i.id !== item.id);
        } else {
          item.quantity -= 1;
          item.totalPrice = item.quantity * (item.itemPrice || 0);
        }
      }
    },
    setIsReserving(state, action: PayloadAction<boolean>) {
      state.isReserving = action.payload;
    },
  },
});

export const { addOrIncreaseItem, clearItems, decreaseItemQuantity, setIsReserving } =
  reservationSlice.actions;

export default reservationSlice.reducer;

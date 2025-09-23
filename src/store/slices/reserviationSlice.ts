import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { Enums, Tables } from 'types';

export type ReservationStatus = Enums<'reservation_state'>;
//Put this SQL in a migration file for reproducibility.
export interface ReservationBase {
  title: string;
  paperSizeId: Tables<'paper_sizes'>['name'];
  quantity: number;
  totalPrice: number;
  status: ReservationStatus;
}

export interface ReservationMustKeys {
  id: string;
  price: number | null;
  default_paper_size: Tables<'paper_sizes'>['id'];
  paper_size: { name: Tables<'paper_sizes'>['name'] };
  title: string;
}

export type ReservationRecord<T = unknown> = ReservationBase & ReservationMustKeys & T;
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
    addOrIncreaseItem<T extends ReservationMustKeys>(
      state: ReservationState,
      action: PayloadAction<T>
    ) {
      const existingItem = state.reservedItems.find((i) => i.id === action.payload.id);

      if (existingItem) {
        existingItem.quantity += 1;
        existingItem.totalPrice = existingItem.quantity * (existingItem.price || 10000);
      } else {
        // If not → add as new item
        state.reservedItems.push({
          ...action.payload,
          quantity: 1,
          status: 'in-progress',
          price: action.payload.price,
          totalPrice: action.payload.price || 10000,
          paperSizeId: action.payload.default_paper_size,
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
          item.totalPrice = item.quantity * (item.price || 0);
        }
      }
    },
    setIsReserving(state, action: PayloadAction<boolean | 'confirming'>) {
      state.isReserving = action.payload;
    },
  },
});

export const { addOrIncreaseItem, clearItems, decreaseItemQuantity, setIsReserving } =
  reservationSlice.actions;

export default reservationSlice.reducer;

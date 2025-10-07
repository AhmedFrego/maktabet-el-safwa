import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { Publication } from 'resources/publications';
import { Enums } from 'types';

export type ReservationStatus = Enums<'reservation_state'>;
export interface ReservationBase {
  quantity: number;
  totalPrice: number;
  status: ReservationStatus;
  isDuplix: boolean;
}

export interface ReservationMustKeys extends Publication {
  title: string;
  price: number;
  coverId: string | undefined;
  cover: string | undefined;
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
    addOrIncreaseItem: <T extends ReservationMustKeys>(
      state: ReservationState,
      action: PayloadAction<T>
    ) => {
      console.log(action.payload);
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
          isDuplix: true,
        });
      }
    },
    modifyItem<T extends Partial<ReservationRecord> & { id: string }>(
      state: ReservationState,
      action: PayloadAction<T>
    ) {
      const index = state.reservedItems.findIndex((item) => item.id === action.payload.id);

      if (index !== -1) {
        state.reservedItems[index] = {
          ...state.reservedItems[index],
          ...action.payload,
        };
      }

      console.log(state.reservedItems[index]);
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
  },
});

export const { addOrIncreaseItem, clearItems, decreaseItemQuantity, setIsReserving, modifyItem } =
  reservationSlice.actions;

export default reservationSlice.reducer;

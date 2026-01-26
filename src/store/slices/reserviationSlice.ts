import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { Enums } from 'types';

export type ReservationStatus = Enums<'reservation_state'>;
export interface ReservationBase {
  quantity: number;
  totalPrice: number;
  status: ReservationStatus;
  deliveredAt?: string | null;
  deliveredBy?: string | null;
  isDublix: boolean;
  groupId?: string; // ID to track related publication groups
  note?: string | null;
  manualPrice?: number | null; // Unit price override (when set, don't auto-calc)
}

// Keep this local to avoid recursive Json types from Supabase-generated definitions
// (e.g., publications.change_price) that can trigger TS "type instantiation is excessively deep"
export interface PriceCalcFields {
  pages: number;
  paper_type_id: string;
  coverless: boolean | null;
  two_faces_cover: boolean | null;
  do_round: boolean | null;
  change_price: {
    oneFacePrice: number;
    twoFacesPrice: number;
  };
}

export interface ReservationMustKeys extends PriceCalcFields {
  id: string;
  title: string;
  price: number;
  paper_type?: { name: string | undefined } | undefined;
  cover_type_id: string | null | undefined;
  cover_type: { name: string | undefined } | null | undefined;
}

export interface ReservationRecord extends ReservationBase, ReservationMustKeys {}

export interface RelatedGroupPayload {
  items: ReservationMustKeys[];
  groupId: string;
}

export interface PendingSuggestion {
  triggerPublication: ReservationMustKeys | null;
  relatedIds: string[];
}

export interface ReservationState {
  reservedItems: ReservationRecord[];
  isReserving: boolean | 'confirming';
  pendingSuggestion: PendingSuggestion | null;
}

const initialState: ReservationState = {
  reservedItems: [],
  isReserving: false,
  pendingSuggestion: null,
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
        const newItem: ReservationRecord = {
          ...action.payload,
          quantity: 1,
          status: 'in-progress' as ReservationStatus,
          totalPrice: action.payload.price || 10000,
          isDublix: true,
          deliveredAt: null,
          deliveredBy: null,
          note: null,
          manualPrice: null,
        };
        state.reservedItems = [...state.reservedItems, newItem];
      }
    },
    modifyItem: (state, action: PayloadAction<Partial<ReservationRecord> & { id: string }>) => {
      const index = state.reservedItems.findIndex((item) => item.id === action.payload.id);

      if (index !== -1) {
        Object.assign(state.reservedItems[index], action.payload);
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
      state.reservedItems.forEach((item) => {
        item.status = 'delivered';
        item.deliveredAt = now;
      });
    },
    // Set pending suggestion for showing related publications modal
    setPendingSuggestion(state, action: PayloadAction<PendingSuggestion | null>) {
      state.pendingSuggestion = action.payload;
    },
    // Add multiple related items as a group
    addRelatedGroup(state, action: PayloadAction<RelatedGroupPayload>) {
      const { items, groupId } = action.payload;

      items.forEach((item) => {
        const existingItem = state.reservedItems.find((i) => i.id === item.id);

        if (existingItem) {
          existingItem.quantity += 1;
          existingItem.totalPrice = existingItem.quantity * (existingItem.price || 10000);
          existingItem.groupId = groupId;
        } else {
          const newItem: ReservationRecord = {
            ...item,
            quantity: 1,
            status: 'in-progress' as ReservationStatus,
            totalPrice: item.price || 10000,
            isDublix: true,
            deliveredAt: null,
            deliveredBy: null,
            groupId,
            note: null,
            manualPrice: null,
          };
          state.reservedItems = [...state.reservedItems, newItem];
        }
      });
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
  setPendingSuggestion,
  addRelatedGroup,
} = reservationSlice.actions;

export default reservationSlice.reducer;

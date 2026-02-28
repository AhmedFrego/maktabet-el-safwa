import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { Enums } from 'types';

export type ReservationStatus = Enums<'reservation_state'>;

// Tracks customized fields: true = all defaults, or object with changed field names and values
// Tracked fields: paper_type_id, cover_type_id, isDublix, manualPrice, note
export type IsDefaultValue = true | Record<string, unknown>;

// Store original values of tracked fields for comparison
export interface OriginalValues {
  paper_type_id: string;
  cover_type_id: string | null | undefined;
  isDublix: boolean;
  manualPrice: number | null;
  note: string | null;
}

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
  isDefault: IsDefaultValue; // true = default specs, or object with changed field names/values (including note)
  _originalValues: OriginalValues; // Store original values for comparison
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
  related_publications?: string[] | null;
  is_collection_master?: boolean | null;
  additional_data?: string | null;
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
  editingReservation: {
    client_id: string;
    paid_amount: number;
    reservation_id: string;
  } | null;
  formData: {
    client_id: string;
    paid_amount: number;
  } | null;
}

const initialState: ReservationState = {
  reservedItems: [],
  isReserving: false,
  pendingSuggestion: null,
  editingReservation: null,
  formData: null,
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
          isDefault: true,
          _originalValues: {
            paper_type_id: action.payload.paper_type_id,
            cover_type_id: action.payload.cover_type_id,
            isDublix: true,
            manualPrice: null,
            note: null,
          },
        };
        state.reservedItems = [...state.reservedItems, newItem];
      }
    },
    modifyItem: (state, action: PayloadAction<Partial<ReservationRecord> & { id: string }>) => {
      const index = state.reservedItems.findIndex((item) => item.id === action.payload.id);

      if (index !== -1) {
        const item = state.reservedItems[index];
        const trackedFields = [
          'paper_type_id',
          'cover_type_id',
          'isDublix',
          'manualPrice',
          'note',
        ] as const;
        const changes: Record<string, unknown> =
          item.isDefault === true ? {} : { ...item.isDefault };

        // Track changes compared to original values
        for (const field of trackedFields) {
          if (field in action.payload) {
            const newVal = action.payload[field as keyof typeof action.payload];
            const originalVal = item._originalValues[field];

            // Normalize values for comparison (treat null, undefined, empty string as equivalent)
            const normalizedNew =
              newVal === null || newVal === undefined || newVal === '' ? null : newVal;
            const normalizedOriginal =
              originalVal === null || originalVal === undefined || originalVal === ''
                ? null
                : originalVal;

            // If value differs from original, track it; if same as original, remove it
            if (normalizedNew !== normalizedOriginal) {
              changes[field] = newVal;
            } else {
              delete changes[field];
            }
          }
        }

        Object.assign(item, action.payload);

        // Update isDefault: true if no changes, otherwise object with changes
        item.isDefault = Object.keys(changes).length === 0 ? true : changes;
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
    // Set reserved items (used for editing existing reservations)
    setReservedItems(state, action: PayloadAction<ReservationRecord[]>) {
      // Ensure all items have isDefault property and originalValues
      state.reservedItems = action.payload.map((item) => ({
        ...item,
        isDefault: item.isDefault ?? {},
        _originalValues: item._originalValues ?? {
          paper_type_id: item.paper_type_id,
          cover_type_id: item.cover_type_id,
          isDublix: item.isDublix,
          manualPrice: item.manualPrice ?? null,
          note: item.note ?? null,
        },
      }));
    },
    // Set editing reservation context (client_id, paid_amount, reservation_id)
    setEditingReservation(
      state,
      action: PayloadAction<{
        client_id: string;
        paid_amount: number;
        reservation_id: string;
      } | null>
    ) {
      state.editingReservation = action.payload;
    },
    // Save form data (client_id, paid_amount) to preserve across edit flow
    setFormData(
      state,
      action: PayloadAction<{
        client_id: string;
        paid_amount: number;
      } | null>
    ) {
      state.formData = action.payload;
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
            isDefault: true,
            _originalValues: {
              paper_type_id: item.paper_type_id,
              cover_type_id: item.cover_type_id,
              isDublix: true,
              manualPrice: null,
              note: null,
            },
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
  setReservedItems,
  setEditingReservation,
  setFormData,
  setPendingSuggestion,
  addRelatedGroup,
} = reservationSlice.actions;

export default reservationSlice.reducer;

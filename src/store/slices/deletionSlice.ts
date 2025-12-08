import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface DeletionState {
  isDeletingMode: boolean;
  itemsToDelete: string[];
}

const initialState: DeletionState = {
  isDeletingMode: false,
  itemsToDelete: [],
};

export const deletionSlice = createSlice({
  name: 'deletion',
  initialState,
  reducers: {
    toggleDeletingMode(state) {
      state.isDeletingMode = !state.isDeletingMode;
      if (!state.isDeletingMode) {
        state.itemsToDelete = [];
      }
    },
    addItemToDelete(state, action: PayloadAction<string>) {
      if (!state.itemsToDelete.includes(action.payload)) {
        state.itemsToDelete.push(action.payload);
      }
    },
    removeItemFromDelete(state, action: PayloadAction<string>) {
      state.itemsToDelete = state.itemsToDelete.filter((id) => id !== action.payload);
    },
    toggleAllItems(state, action: PayloadAction<string[]>) {
      const allSelected = action.payload.every((id) => state.itemsToDelete.includes(id));
      if (allSelected) {
        state.itemsToDelete = [];
      } else {
        state.itemsToDelete = action.payload;
      }
    },
    resetDeletion() {
      return initialState;
    },
  },
});

export const {
  toggleDeletingMode,
  addItemToDelete,
  removeItemFromDelete,
  toggleAllItems,
  resetDeletion,
} = deletionSlice.actions;

export default deletionSlice.reducer;

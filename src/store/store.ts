import { configureStore } from '@reduxjs/toolkit';
import { reservationSlice, deletionSlice } from './slices';
import { useDispatch, useSelector } from 'react-redux';

export const store = configureStore({
  reducer: { reservation: reservationSlice, deletion: deletionSlice },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();

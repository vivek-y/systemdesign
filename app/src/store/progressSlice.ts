import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AttemptProgress } from '../types/design';

interface ProgressState {
  records: Record<string, AttemptProgress>;
  hydrated: boolean;
}

const initialState: ProgressState = {
  records: {},
  hydrated: false,
};

const progressSlice = createSlice({
  name: 'progress',
  initialState,
  reducers: {
    hydrateProgress(state, action: PayloadAction<Record<string, AttemptProgress>>) {
      state.records = action.payload;
      state.hydrated = true;
    },
    upsertProgress(state, action: PayloadAction<AttemptProgress>) {
      state.records[action.payload.designId] = action.payload;
    },
    clearProgress(state, action: PayloadAction<string>) {
      delete state.records[action.payload];
    },
  },
});

export const { hydrateProgress, upsertProgress, clearProgress } = progressSlice.actions;
export default progressSlice.reducer;

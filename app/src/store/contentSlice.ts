import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { DesignContent, DesignSummary } from '../types/design';

interface ContentState {
  index: DesignSummary[] | null;
  designs: Record<string, DesignContent>;
  loading: Record<string, boolean>;
  errors: Record<string, string | null>;
}

const initialState: ContentState = {
  index: null,
  designs: {},
  loading: {},
  errors: {},
};

export const fetchIndex = createAsyncThunk(
  'content/fetchIndex',
  async () => {
    const response = await fetch('/data/index.json');
    if (!response.ok) {
      throw new Error(`Failed to fetch index: ${response.status}`);
    }
    const data = await response.json();
    return data.designs as DesignSummary[];
  },
  {
    condition: (_arg, { getState }) => {
      const state = getState() as { content: ContentState };
      return state.content.index === null;
    },
  }
);

export const fetchDesignContent = createAsyncThunk(
  'content/fetchDesignContent',
  async (designId: string) => {
    const response = await fetch(`/data/${designId}.json`);
    if (!response.ok) {
      throw new Error(`Failed to fetch design "${designId}": ${response.status}`);
    }
    const data: DesignContent = await response.json();
    return data;
  },
  {
    condition: (designId: string, { getState }) => {
      const state = getState() as { content: ContentState };
      return !(designId in state.content.designs);
    },
  }
);

const INDEX_KEY = '__index__';

const contentSlice = createSlice({
  name: 'content',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // fetchIndex
    builder.addCase(fetchIndex.pending, (state) => {
      state.loading[INDEX_KEY] = true;
      state.errors[INDEX_KEY] = null;
    });
    builder.addCase(fetchIndex.fulfilled, (state, action) => {
      state.index = action.payload;
      state.loading[INDEX_KEY] = false;
      state.errors[INDEX_KEY] = null;
    });
    builder.addCase(fetchIndex.rejected, (state, action) => {
      state.loading[INDEX_KEY] = false;
      state.errors[INDEX_KEY] = action.error.message ?? 'Unknown error';
    });

    // fetchDesignContent
    builder.addCase(fetchDesignContent.pending, (state, action) => {
      const designId = action.meta.arg;
      state.loading[designId] = true;
      state.errors[designId] = null;
    });
    builder.addCase(fetchDesignContent.fulfilled, (state, action) => {
      const designId = action.meta.arg;
      state.designs[designId] = action.payload;
      state.loading[designId] = false;
      state.errors[designId] = null;
    });
    builder.addCase(fetchDesignContent.rejected, (state, action) => {
      const designId = action.meta.arg;
      state.loading[designId] = false;
      state.errors[designId] = action.error.message ?? 'Unknown error';
    });
  },
});

export default contentSlice.reducer;

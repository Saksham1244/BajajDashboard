import { configureStore, createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunks to fetch data from Express backend
export const fetchProductionData = createAsyncThunk(
  'dashboard/fetchProduction',
  async () => {
    const response = await fetch('/api/dashboard/production');
    return response.json();
  }
);

export const fetchPerformanceData = createAsyncThunk(
  'dashboard/fetchPerformance',
  async () => {
    const response = await fetch('/api/dashboard/performance');
    return response.json();
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: {
    production: null,
    performance: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductionData.pending, (state) => { state.loading = true; })
      .addCase(fetchProductionData.fulfilled, (state, action) => {
        state.loading = false;
        state.production = action.payload;
      })
      .addCase(fetchPerformanceData.fulfilled, (state, action) => {
        state.performance = action.payload;
      });
  },
});

export const store = configureStore({
  reducer: {
    dashboard: dashboardSlice.reducer,
  },
});

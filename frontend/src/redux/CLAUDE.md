# Redux State Management

## Overview

The frontend uses Redux Toolkit for predictable state management with TypeScript support. State is organized into feature slices following Redux best practices.

## Store Structure

```
redux/
├── store.ts         # Store configuration
└── slices/          # Feature slices
    ├── appSlice.ts  # Global app state
    ├── workItemSlice.ts  # Work items state
    └── agentSlice.ts     # Agents state
```

## Store Configuration

```typescript
// store.ts
export const store = configureStore({
  reducer: {
    app: appReducer,
    workItems: workItemReducer,
    agents: agentReducer,
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

## Slice Pattern

Standard slice structure:
```typescript
interface SliceState {
  items: Entity[];
  loading: boolean;
  error: string | null;
  selectedId: string | null;
}

const slice = createSlice({
  name: 'feature',
  initialState,
  reducers: {
    setItems: (state, action: PayloadAction<Entity[]>) => {
      state.items = action.payload;
      state.loading = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    }
  }
});
```

## Current Slices

### App Slice (appSlice.ts)
Global application state:
- `loading: boolean` - Global loading indicator
- `error: string | null` - Global error messages
- `sidebarOpen: boolean` - UI sidebar state

Actions:
- `setLoading(boolean)` - Set loading state
- `setError(string | null)` - Set/clear error
- `toggleSidebar()` - Toggle sidebar visibility

## Usage Patterns

### In Components

```typescript
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../redux/store';
import { setLoading } from '../redux/slices/appSlice';

function Component() {
  const dispatch = useDispatch();
  const loading = useSelector((state: RootState) => state.app.loading);
  
  const handleAction = () => {
    dispatch(setLoading(true));
    // ... async operation
    dispatch(setLoading(false));
  };
}
```

### Async Operations

Using Redux Toolkit's createAsyncThunk:
```typescript
export const fetchWorkItems = createAsyncThunk(
  'workItems/fetch',
  async () => {
    const response = await api.getWorkItems();
    return response.data;
  }
);

// In slice
extraReducers: (builder) => {
  builder
    .addCase(fetchWorkItems.pending, (state) => {
      state.loading = true;
    })
    .addCase(fetchWorkItems.fulfilled, (state, action) => {
      state.items = action.payload;
      state.loading = false;
    })
    .addCase(fetchWorkItems.rejected, (state, action) => {
      state.error = action.error.message || 'Failed to fetch';
      state.loading = false;
    });
}
```

## State Shape

Complete Redux state structure:
```typescript
{
  app: {
    loading: boolean;
    error: string | null;
    sidebarOpen: boolean;
  },
  workItems: {
    items: WorkItem[];
    loading: boolean;
    error: string | null;
    selectedId: string | null;
  },
  agents: {
    activeAgents: Agent[];
    logs: { [agentId: string]: LogEntry[] };
    loading: boolean;
    error: string | null;
  }
}
```

## Best Practices

1. **Immutability**
   - Redux Toolkit uses Immer internally
   - Write "mutating" logic that's actually immutable

2. **Normalization**
   - Store entities by ID when possible
   - Use entity adapters for complex data

3. **Selectors**
   - Create reusable selectors for derived state
   - Memoize expensive computations

4. **Actions**
   - Keep actions focused and specific
   - Use payload types for type safety

5. **Side Effects**
   - Use createAsyncThunk for async logic
   - Keep components pure

## Future Enhancements

- RTK Query for API integration
- Persist middleware for local storage
- Undo/redo functionality
- Optimistic updates
- WebSocket integration for real-time updates
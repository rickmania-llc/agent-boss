# Frontend Structure Guide

## Directory Structure

```
frontend/
├── src/
│   ├── main.tsx              # React entry point
│   ├── App.tsx               # Root component with routes
│   ├── App.css
│   ├── index.css             # Global styles
│   │
│   ├── store/                # Redux configuration
│   │   ├── index.ts          # Store creation
│   │   ├── rootReducer.ts    # Combined reducers
│   │   │
│   │   ├── actions/          # Action creators
│   │   │   ├── types.ts      # Action type constants
│   │   │   ├── workItems.actions.ts
│   │   │   ├── agents.actions.ts
│   │   │   └── ui.actions.ts
│   │   │
│   │   ├── reducers/         # Redux reducers
│   │   │   ├── workItems.reducer.ts
│   │   │   ├── agents.reducer.ts
│   │   │   └── ui.reducer.ts
│   │   │
│   │   └── middleware/       # Custom middleware
│   │       └── socket.middleware.ts
│   │
│   ├── pages/                # Route components
│   │   ├── Dashboard/
│   │   │   ├── Dashboard.tsx
│   │   │   └── Dashboard.css
│   │   ├── WorkItemDetail/
│   │   │   ├── WorkItemDetail.tsx
│   │   │   └── WorkItemDetail.css
│   │   └── AgentMonitor/
│   │       ├── AgentMonitor.tsx
│   │       └── AgentMonitor.css
│   │
│   ├── components/           # Reusable components
│   │   ├── common/
│   │   │   ├── Layout/
│   │   │   ├── Header/
│   │   │   └── ErrorBoundary/
│   │   ├── workItems/
│   │   │   ├── WorkItemList/
│   │   │   ├── WorkItemCard/
│   │   │   └── CreateWorkItem/
│   │   └── agents/
│   │       ├── AgentList/
│   │       ├── AgentCard/
│   │       └── AgentProgress/
│   │
│   ├── services/             # External communication
│   │   ├── api.service.ts    # Axios setup
│   │   ├── workItem.api.ts
│   │   ├── agent.api.ts
│   │   └── socket.service.ts
│   │
│   └── utils/                # Helpers
│       ├── types.ts          # TypeScript interfaces
│       ├── constants.ts
│       └── helpers.ts
│
├── public/                   # Static assets
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── .env.example
```

## Component Hierarchy

```
App
└── Layout
    ├── Header
    └── Routes
        ├── Dashboard
        │   ├── CreateWorkItem
        │   └── WorkItemList
        │       └── WorkItemCard
        ├── WorkItemDetail
        └── AgentMonitor
            └── AgentList
                └── AgentCard
```

## Redux Data Flow

1. **Component** dispatches action
2. **Action Creator** (with thunk) calls API
3. **API Service** makes HTTP request
4. **Action Creator** dispatches success/error
5. **Reducer** updates state
6. **Component** re-renders with new props

## Key Files

### Entry Points

- `main.tsx` - Sets up React, Redux, Router
- `App.tsx` - Defines routes

### Store Setup

- `store/index.ts` - Creates store with middleware
- `store/rootReducer.ts` - Combines all reducers

### API Communication

- `services/api.service.ts` - Axios instance
- `services/socket.service.ts` - Socket.io client

## Common Patterns

### API Calls with Redux Thunk

```typescript
export const loadWorkItems = () => async (dispatch: Dispatch) => {
  dispatch({ type: FETCH_START });
  try {
    const data = await fetchWorkItems();
    dispatch({ type: FETCH_SUCCESS, payload: data });
  } catch (error) {
    dispatch({ type: FETCH_ERROR, payload: error.message });
  }
};
```

### Component with Redux

```typescript
const dispatch = useDispatch<AppDispatch>();
const items = useSelector((state: RootState) => state.workItems.items);

useEffect(() => {
  dispatch(loadWorkItems());
}, [dispatch]);
```

### Socket Event Handling

Events are handled in `socket.middleware.ts` and dispatch Redux actions.

## Styling

- Component-specific CSS files
- CSS variables in `index.css`
- BEM-like naming convention
- Responsive grid layouts

## Adding Features

### New Redux Slice

1. Add action types to `actions/types.ts`
2. Create action creators
3. Create reducer
4. Add to `rootReducer.ts`

### New API Endpoint

1. Add method to API service
2. Use in action creator
3. Handle response in reducer

### New Page

1. Create folder in `pages/`
2. Add component and styles
3. Add route in `App.tsx`
4. Add navigation in Header

### New Reusable Component

1. Create folder in appropriate category
2. Component file + CSS file
3. Import and use in pages

## Development Commands

```bash
# Start dev server (port 3000)
yarn dev

# Build for production
yarn build

# Run linter
yarn lint

# Fix lint issues
yarn lint:fix
```

## Type Safety

- All components use TypeScript
- Redux state fully typed
- API responses have interfaces
- Strict mode enabled

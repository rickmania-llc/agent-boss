# Agent Boss Frontend

React application with Redux state management and Vite build tool.

## Architecture

The frontend follows a standard React/Redux architecture:

- **Pages**: Route-level components (Dashboard, WorkItemDetail, AgentMonitor)
- **Components**: Reusable UI components organized by domain
- **Store**: Redux store with actions, reducers, and middleware
- **Services**: API and WebSocket communication
- **Utils**: Helper functions and constants

## Redux Store Structure

```
{
  workItems: {
    items: WorkItem[],
    loading: boolean,
    error: string | null
  },
  agents: {
    items: Agent[],
    loading: boolean,
    error: string | null
  },
  ui: {
    loading: boolean,
    error: string | null,
    socketConnected: boolean
  }
}
```

## Key Components

### Layout Components

- **Layout**: Main app layout wrapper
- **Header**: Navigation and connection status
- **ErrorBoundary**: Error handling wrapper

### Work Item Components

- **WorkItemList**: Displays all work items
- **WorkItemCard**: Individual work item display
- **CreateWorkItem**: Modal for creating new items

### Agent Components

- **AgentList**: Displays all agents
- **AgentCard**: Individual agent status
- **AgentProgress**: Real-time progress updates

## API Integration

### Axios Configuration

- Base URL configured via environment variable
- Request/response interceptors for auth (future)
- Error handling in interceptors

### API Services

- `workItem.api.ts` - Work item CRUD operations
- `agent.api.ts` - Agent management operations

## WebSocket Integration

### Socket.io Client

- Auto-connects to backend
- Redux middleware listens for events
- Updates store in real-time

### Events Handled

- `connect` / `disconnect` - Connection status
- `agent:created` - New agent added
- `agent:started` - Agent assigned to work
- `agent:stopped` - Agent freed up

## Routing

React Router v6 routes:

- `/` - Dashboard (home)
- `/work-items/:id` - Work item details
- `/agents` - Agent monitor

## Development

```bash
# Install dependencies
yarn install

# Run development server
yarn dev

# Build for production
yarn build

# Preview production build
yarn preview

# Lint code
yarn lint
```

## Environment Variables

Create a `.env` file based on `.env.example`:

```env
VITE_API_URL=http://localhost:3001/api
VITE_WS_URL=http://localhost:3001
```

## Styling

- CSS modules for component styles
- CSS variables for theming
- Dark/light mode support via CSS
- Responsive grid layouts

## State Management Flow

1. User action triggers dispatch
2. Action creator calls API
3. Thunk middleware handles async
4. Reducer updates state
5. Components re-render via React-Redux

## Adding Features

### New Page

1. Create page component in `pages/`
2. Add route in `App.tsx`
3. Add navigation link if needed

### New API Endpoint

1. Add method to appropriate API service
2. Create Redux action
3. Handle in reducer
4. Dispatch from component

### New Component

1. Create component folder
2. Add `.tsx` and `.css` files
3. Export from index if needed

# Frontend Architecture

## Overview

The Agent Boss frontend is a React 19 application built with TypeScript, using Vite for development and build tooling. It provides a web interface for managing work items and monitoring Claude Code agents.

## Project Structure

```
frontend/
├── src/
│   ├── main.tsx              # Application entry point
│   ├── App.tsx               # Root component with routing
│   ├── index.css             # Global styles & Tailwind imports
│   │
│   ├── components/           # Presentational components
│   ├── containers/           # Smart/connected components
│   │
│   ├── redux/               # State management
│   │   ├── store.ts        # Store configuration
│   │   └── slices/         # Feature slices
│   │       └── appSlice.ts # App-wide state
│   │
│   ├── types/               # TypeScript definitions
│   │   └── models/         # Entity type definitions
│   │
│   └── utils/               # Utility functions
│       └── api/            # API integration
│
├── public/                  # Static assets
├── index.html              # HTML entry point
├── vite.config.ts          # Vite configuration
├── tailwind.config.js      # Tailwind CSS config
├── postcss.config.js       # PostCSS config
├── tsconfig.json           # TypeScript config
└── package.json            # Dependencies and scripts
```

## Key Technologies

### React 19
- Functional components with hooks
- Strict mode enabled
- TypeScript for type safety

### Redux Toolkit
- Centralized state management
- Type-safe actions and reducers
- Redux DevTools integration

### Tailwind CSS v4
- Utility-first CSS framework
- Responsive design utilities
- Custom theme configuration

### Vite
- Fast HMR (Hot Module Replacement)
- Optimized production builds
- Proxy configuration for API calls

## State Management

### Redux Store (src/redux/store.ts)
- Configured with Redux Toolkit
- Type-safe RootState and AppDispatch exports
- Modular slice architecture

### App Slice (src/redux/slices/appSlice.ts)
Global application state:
- `loading` - Global loading state
- `error` - Global error messages
- `sidebarOpen` - UI toggle state

## Component Architecture

### App Component (src/App.tsx)
- React Router setup
- Main layout structure
- Navigation header
- Route definitions

### Component Patterns
```typescript
// Functional component with TypeScript
interface ComponentProps {
  title: string;
  onAction?: () => void;
}

function Component({ title, onAction }: ComponentProps) {
  return <div>{title}</div>;
}
```

## Development Workflow

### Running the Development Server

```bash
# Start development server on port 3000
yarn workspace frontend dev

# Build for production
yarn workspace frontend build

# Preview production build
yarn workspace frontend preview
```

### API Integration

Vite proxy configuration handles API calls:
- `/api/*` → `http://localhost:3001`
- `/socket.io/*` → WebSocket proxy

### Styling with Tailwind

Common utility classes:
- Layout: `flex`, `grid`, `max-w-7xl`, `mx-auto`
- Spacing: `p-4`, `mt-8`, `space-x-4`
- Colors: `bg-gray-50`, `text-gray-900`
- Typography: `text-2xl`, `font-bold`
- Responsive: `sm:px-6`, `lg:px-8`

## Routing Structure

React Router DOM v6:
- `/` - Dashboard
- `/agents` - Agent management
- `/work-items/:id` - Work item details

## TypeScript Configuration

Strict TypeScript settings:
- No implicit any
- Unused variable checks
- Strict null checks
- JSX support with react-jsx

## Build Configuration

Vite optimizations:
- Code splitting
- Tree shaking
- Asset optimization
- Source maps in development

## Testing Strategy

Jest and React Testing Library (to be configured):
```bash
yarn workspace frontend test
```

## Future Enhancements

- WebSocket integration for real-time updates
- Advanced Redux patterns (RTK Query)
- Component library with Storybook
- E2E testing with Cypress
- PWA capabilities
- Dark mode support
# React Application Conventions Template

## Technology Stack

### Core Technologies
- **React 19** - UI library with TypeScript
- **TypeScript** - Type safety and developer experience
- **Vite** - Build tool and development server
- **Redux Toolkit** - State management
- **React Router DOM** - Client-side routing
- **Tailwind CSS v4** - Utility-first CSS framework
- **Lucide React** - Icon library

### Development Tools
- **ESLint** - Code quality and consistency
- **PostCSS** - CSS processing for Tailwind
- **Yarn** - Package management (NEVER use npm)

## Project Structure

```
react-app/
├── src/
│   ├── main.tsx                 # Application entry point
│   ├── App.tsx                  # Root component
│   ├── index.css                # Global styles & Tailwind imports
│   │
│   ├── components/              # Presentational components
│   │   ├── CLAUDE.md           # Components documentation
│   │   ├── NavigationPanel.tsx  # Main navigation component
│   │   ├── MainPanel.tsx        # Content area router
│   │   │
│   │   ├── cards/              # Reusable card components
│   │   │   └── EntityCard.tsx  # Card display pattern
│   │   │
│   │   ├── main-panel/         # Main content panels
│   │   │   ├── DashboardMainPanel.tsx
│   │   │   └── EntityMainPanel.tsx
│   │   │
│   │   └── side-panels/        # Side panels for CRUD
│   │       └── EntitySidePanel.tsx
│   │
│   ├── containers/              # Smart/connected components
│   │   └── AppContainer.tsx     # Main app shell with data
│   │
│   ├── redux/                   # State management
│   │   ├── CLAUDE.md           # Redux documentation
│   │   ├── store.ts            # Store configuration
│   │   └── slices/             # Feature slices
│   │       ├── appSlice.ts     # UI state
│   │       └── entitySlice.ts  # Entity state pattern
│   │
│   ├── types/                   # TypeScript definitions
│   │   └── models/             # Entity type definitions
│   │       └── Entity.ts       # Domain model interfaces
│   │
│   ├── utils/                   # Utility functions
│   │   ├── CLAUDE.md           # Utils documentation
│   │   └── api/                # API integration
│   │       └── apiHandler.ts   # API client
│   │
│   └── assets/                  # Static assets
│       └── images/
│
├── public/                      # Public static files
│   └── favicon.svg
│
├── dist/                        # Build output (gitignored)
│
├── CLAUDE.md                    # Module documentation
├── package.json                 # Dependencies & scripts
├── tsconfig.json               # TypeScript config
├── vite.config.ts              # Vite configuration
├── tailwind.config.js          # Tailwind customization
├── postcss.config.js           # PostCSS configuration
└── eslint.config.js            # ESLint rules
```

## Naming Conventions

### Files
- **Components**: PascalCase (e.g., `StudentCard.tsx`, `NavigationPanel.tsx`)
- **Utilities**: camelCase (e.g., `authHandler.ts`, `databaseHandler.ts`)
- **Redux Slices**: camelCase with "Slice" suffix (e.g., `studentSlice.ts`)
- **Types/Models**: PascalCase matching entity name (e.g., `Student.ts`)
- **Config Files**: lowercase with dots (e.g., `vite.config.ts`)

### Code
- **Components**: PascalCase function names matching filename
- **Props Interfaces**: ComponentName + "Props" (e.g., `NavigationPanelProps`)
- **State Interfaces**: EntityName + "State" (e.g., `StudentState`)
- **Redux Actions**: camelCase verbs (e.g., `setStudents`, `updateStudent`)
- **Functions**: camelCase with descriptive verbs (e.g., `handleSubmit`, `calculateAge`)
- **Constants**: UPPER_SNAKE_CASE for true constants
- **CSS Classes**: Tailwind utilities only, no custom CSS

## Component Patterns

### Functional Components
```typescript
import type { FC } from "react"

interface ComponentNameProps {
  prop1: string
  prop2?: number
  onAction?: (value: string) => void
}

export default function ComponentName({
  prop1,
  prop2 = 0,
  onAction,
}: ComponentNameProps) {
  // Component logic
  return <div>Content</div>
}
```

### Container Components
```typescript
import { useSelector, useDispatch } from 'react-redux'
import type { RootState } from '../redux/store'

export default function ContainerName() {
  const dispatch = useDispatch()
  const data = useSelector((state: RootState) => state.entity.items)
  
  // Connect presentation components
  return <PresentationComponent data={data} />
}
```

## Redux Patterns

### Slice Structure
```typescript
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface EntityState {
  items: Entity[]
  loading: boolean
  error: string | null
}

const initialState: EntityState = {
  items: [],
  loading: false,
  error: null
}

const entitySlice = createSlice({
  name: 'entity',
  initialState,
  reducers: {
    setItems: (state, action: PayloadAction<Entity[]>) => {
      state.items = action.payload
      state.loading = false
    },
    addItem: (state, action: PayloadAction<Entity>) => {
      state.items.push(action.payload)
    },
    updateItem: (state, action: PayloadAction<Entity>) => {
      const index = state.items.findIndex(i => i.id === action.payload.id)
      if (index !== -1) {
        state.items[index] = action.payload
      }
    },
    deleteItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(i => i.id !== action.payload)
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    }
  }
})

export const { setItems, addItem, updateItem, deleteItem, setLoading, setError } = entitySlice.actions
export default entitySlice.reducer
```

### Store Configuration
```typescript
import { configureStore } from '@reduxjs/toolkit'
import entityReducer from './slices/entitySlice'

export const store = configureStore({
  reducer: {
    entity: entityReducer,
    // Add more reducers
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
```

## Type Definitions

### Entity Model Pattern
```typescript
/**
 * Entity description
 */
export interface Entity {
  /** Unique identifier */
  id: string
  
  /** Display name */
  name: string
  
  /** Creation timestamp (Unix ms) */
  createdAt: number
  
  /** Last update timestamp (Unix ms) */
  updatedAt?: number
}
```

## UI Patterns

### Panel Architecture
- **Navigation Panel**: Left sidebar with icon navigation
- **Main Panel**: Primary content area with router
- **Side Panel**: Right panel for CRUD operations
- **Card Components**: Grid-based entity display

### Styling Conventions
```typescript
// Navigation items
className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors"

// Primary buttons
className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"

// Cards
className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4"

// Form inputs
className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"

// Panels
className="bg-white rounded-lg shadow-lg p-6"
```

### Common Tailwind Classes
- **Colors**: gray-50 to gray-900, blue-50 to blue-900
- **Spacing**: p-2, p-4, p-6, gap-2, gap-4
- **Borders**: rounded-lg, border, border-gray-300
- **Shadows**: shadow-sm, shadow-md, shadow-lg
- **Transitions**: transition-colors, transition-shadow
- **Flex**: flex, items-center, justify-between
- **Grid**: grid, grid-cols-3, gap-4

## Development Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit"
  }
}
```

## Configuration Files

### Vite Config
```typescript
export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === 'production' ? './' : '/',
  server: {
    port: 5173,
    strictPort: true,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
  }
})
```

### TypeScript Config
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true
  }
}
```

## Best Practices

### Component Organization
1. Keep components focused and single-purpose
2. Separate presentation from logic (components vs containers)
3. Use TypeScript interfaces for all props
4. Export default for components
5. Group related components in subdirectories

### State Management
1. Use Redux for global app state
2. Use local state for UI-only concerns
3. Keep Redux state normalized and flat
4. Handle loading and error states consistently
5. Dispatch actions from containers, not components

### Code Quality
1. Always use TypeScript with strict mode
2. Run lint and typecheck before commits
3. Follow consistent naming conventions
4. Document complex business logic
5. Keep functions small and focused

### Performance
1. Use React.memo for expensive components
2. Implement proper key props for lists
3. Lazy load routes when appropriate
4. Optimize bundle size with code splitting
5. Use production builds for deployment

### Security
1. Never store sensitive data in Redux
2. Validate all user inputs
3. Use environment variables for API keys
4. Implement proper authentication checks
5. Sanitize data before rendering

## Common Workflows

### Adding a New Feature
1. Create type definitions in `/types/models/`
2. Create Redux slice in `/redux/slices/`
3. Add reducer to store configuration
4. Create presentation components in `/components/`
5. Create container to connect Redux
6. Add panel to MainPanel router
7. Update CLAUDE.md documentation

### CRUD Operations
1. Display: MainPanel with card grid
2. Create: Side panel with form in create mode
3. Read: Card components with entity data
4. Update: Side panel with form in edit mode
5. Delete: Confirmation modal in side panel

### Form Handling
1. Use controlled components with local state
2. Validate on change and on submit
3. Show loading states during async operations
4. Display error messages clearly
5. Reset form after successful submission

## Documentation Requirements

### CLAUDE.md Files
Each major directory must have a CLAUDE.md file documenting:
- Directory purpose and architecture
- File descriptions and key functions
- Dependencies and integration points
- Common workflows and patterns
- Performance and security notes

### Code Comments
- Use JSDoc for TypeScript interfaces
- Document complex business logic inline
- Explain non-obvious code decisions
- Keep comments concise and relevant
- Update comments when code changes
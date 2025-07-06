# Components Library

## Overview

This directory contains all presentational components for the Agent Boss frontend. Components are pure, reusable, and focused on UI rendering without direct Redux connections.

## Component Structure

```
components/
├── cards/              # Card display components
│   ├── WorkItemCard.tsx
│   └── AgentCard.tsx
├── navigation/         # Navigation components
│   ├── Navbar.tsx
│   └── Sidebar.tsx
├── common/             # Shared components
│   ├── Button.tsx
│   ├── Loading.tsx
│   └── ErrorMessage.tsx
└── layout/             # Layout components
    ├── PageLayout.tsx
    └── ContentGrid.tsx
```

## Component Patterns

### Functional Components with TypeScript

```typescript
interface ComponentProps {
  title: string;
  subtitle?: string;
  onClick?: () => void;
  className?: string;
}

export default function Component({
  title,
  subtitle,
  onClick,
  className = ''
}: ComponentProps) {
  return (
    <div className={`component-base ${className}`}>
      <h3>{title}</h3>
      {subtitle && <p>{subtitle}</p>}
      {onClick && <button onClick={onClick}>Action</button>}
    </div>
  );
}
```

### Common Props Patterns

Base props for consistency:
```typescript
interface BaseProps {
  className?: string;
  children?: React.ReactNode;
}

interface ClickableProps {
  onClick?: () => void;
  disabled?: boolean;
}

interface DataProps<T> {
  data: T;
  loading?: boolean;
  error?: string | null;
}
```

## Styling Conventions

### Tailwind Classes

Common patterns:
```typescript
// Cards
const cardClasses = "bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4";

// Buttons
const buttonClasses = {
  primary: "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700",
  secondary: "px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300",
  danger: "px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
};

// Layout
const containerClasses = "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8";
```

### Responsive Design

Mobile-first approach:
```typescript
// Base (mobile) → sm (640px) → md (768px) → lg (1024px) → xl (1280px)
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
```

## Component Examples

### Loading Component
```typescript
export default function Loading({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      <span className="ml-3 text-gray-600">{text}</span>
    </div>
  );
}
```

### Error Message Component
```typescript
interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <p className="text-red-800">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="mt-2 text-red-600 hover:text-red-800">
          Try again
        </button>
      )}
    </div>
  );
}
```

## Component Guidelines

1. **Single Responsibility**
   - Each component should do one thing well
   - Extract complex logic to custom hooks

2. **Props Interface**
   - Always define TypeScript interfaces
   - Use optional chaining for optional props

3. **Composition**
   - Build complex UIs from simple components
   - Use children prop for flexibility

4. **Performance**
   - Use React.memo for expensive renders
   - Implement proper key props in lists

5. **Accessibility**
   - Include ARIA labels where needed
   - Ensure keyboard navigation works

## Icons

Using Lucide React:
```typescript
import { Home, Settings, Users } from 'lucide-react';

<Home className="w-5 h-5" />
<Settings className="w-5 h-5 text-gray-600" />
<Users className="w-5 h-5 text-blue-600" />
```

## Future Components

- Modal/Dialog system
- Form components with validation
- Data tables with sorting/filtering
- Charts and visualizations
- Notification system
- Tooltip component
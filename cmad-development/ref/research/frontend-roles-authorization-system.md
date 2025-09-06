# Frontend Roles and Authorization System Documentation

## Table of Contents
1. [Overview](#overview)
2. [Token Storage and Management](#token-storage-and-management)
3. [Authentication Flow](#authentication-flow)
4. [API Request Authorization](#api-request-authorization)
5. [Role-Based Routing](#role-based-routing)
6. [Navigation Menu Filtering](#navigation-menu-filtering)
7. [Component-Level Role Checks](#component-level-role-checks)
8. [Role-Based UI Patterns](#role-based-ui-patterns)
9. [Implementation Details](#implementation-details)

## Overview

The VEMASS frontend implements role-based access control through JWT tokens stored in Redux state and persisted to sessionStorage. The system controls route visibility, navigation menu items, and UI component rendering based on the user's roles extracted from the JWT token.

### Key Technologies
- **Redux Toolkit**: State management with auth slice
- **Redux Persist**: Token persistence to sessionStorage
- **RTK Query**: API layer with automatic token injection
- **React Router v6**: Protected routes with role-based rendering

## Token Storage and Management

### Redux Auth State

**Location**: `front-end/src/Redux/Slices/AuthSlice.tsx`

```typescript
export interface LoginState {
  id: string | null,
  username: string | null,
  ve6025Username: string | null,
  ve6025Password: string | null,
  token: string | null,         // JWT token stored here
  licenseType: string | null,
  expiration: number | null,
  organization: string | null,
  roles: string[],              // Array of role names
}
```

### Token Persistence

**Location**: `front-end/src/Redux/store.ts:10-15`

```typescript
const persistConfig = {
  key: 'root', 
  storage: storageSession,  // Uses sessionStorage
  whitelist: ['auth', 'dashboardMap', 'userPreferences'], 
  // ONLY these slices are persisted
};
```

**Storage Mechanism**:
- Token is stored in Redux state (`state.auth.token`)
- Redux Persist automatically saves to **sessionStorage**
- Survives page refreshes but not browser close
- Cleared on logout or session end

## Authentication Flow

### 1. Login Process

**Location**: `front-end/src/Containers/Login/Login.tsx:30-45`

```typescript
const handleLogin = async () => {
  const payload = { email, password, legacy: true };
  try {
    await login(payload).unwrap();  // RTK Query mutation
    sessionStorage.setItem('isUserLegacy', 'true');
    navigate('/dashboard', { replace: true });
  } catch (err) {
    // Handle error
  }
};
```

### 2. Token Extraction from Response

**Location**: `front-end/src/Redux/Slices/AuthSlice.tsx:50-60`

```typescript
extraReducers: (builder) => {
  builder.addMatcher(api.endpoints.login.matchFulfilled, (state, action) => {
    state.id = action.payload.id;
    state.username = action.payload.username;
    state.roles = action.payload.roles.map((role) => role.name);  // Extract role names
    state.token = action.payload.token;  // Store JWT token
    // ... other fields
  });
}
```

### 3. Roles Array Structure

After login, `state.auth.roles` contains an array of role names:
```javascript
["admin", "security"]  // Example for user with multiple roles
["observer"]          // Example for read-only user
```

## API Request Authorization

### Automatic Token Injection

**Location**: `front-end/src/Redux/api.tsx:66-76`

```typescript
export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: "/api",
    prepareHeaders: (headers, { getState }) => {
      // Automatically add token to all API requests
      const { token, id } = (getState() as RootState).auth;
      if (token && id) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
```

**Behavior**:
- Every API request automatically includes the JWT token
- No manual token handling needed in components
- Token sent as `Authorization: Bearer <token>` header

## Role-Based Routing

### 1. Authentication Guard

**Location**: `front-end/src/App.tsx:101-110`

```typescript
const RequireAuth = () => {
  const { token, id } = useAppSelector((state) => state.auth);
  
  if (token === null || id === null) {
    return <Navigate to="/login" />;
  }
  
  return <Outlet />;  // Render protected routes
};
```

### 2. Role-Based Route Rendering

**Location**: `front-end/src/App.tsx:187-215`

```typescript
<Route element={<RequireAuth />}>  {/* All routes below require authentication */}
  <Route element={<Layout />}>
    {/* Routes available to all authenticated users */}
    <Route path="dashboard" element={<Dashboard />} />
    <Route path="campuses" element={<Campuses />} />
    
    {/* Admin-only routes - conditionally rendered */}
    {roles.includes('admin') && 
      <Route path="settings" element={<Settings />} />}
    {roles.includes('admin') && 
      <Route path="permissions" element={<Permissions />} />}
    {roles.includes('admin') && 
      <Route path="smupgrade" element={<SMUpgrade />} />}
    {roles.includes('admin') && 
      <Route path="heupgrade" element={<HEUpgrade />} />}
    
    {/* SAML admin route */}
    {isSAML === true && roles.includes('admin') && 
      <Route path="mappings" element={<SAMLContainer />} />}
  </Route>
</Route>
```

**Pattern**: Routes are conditionally rendered based on roles - if user lacks the role, the route doesn't exist and they get redirected to dashboard.

## Navigation Menu Filtering

### Menu Item Sets by Role

**Location**: `front-end/src/Components/Navigation/NavigationSide.tsx:12-76`

```typescript
// Admin users see all menu items
export const adminSidebarItems: NavItem[] = [
  { title: 'Dashboard', to: '/dashboard' },
  { title: 'System Health', to: '/systemHealth' },
  { title: 'Permissions', to: '/permissions' },
  // ... all items
];

// Non-admin users see limited items
export const baseSidebarItems: NavItem[] = [
  { title: 'Dashboard', to: '/dashboard' },
  { title: 'Campuses', to: '/campuses' },
  // ... no Permissions or admin-only items
];

// Maintenance-only users see minimal items
export const maintenanceNavSidebarItems: NavItem[] = [
  { title: 'System Health', to: '/systemHealth' },
];
```

### Dynamic Menu Rendering

**Location**: `front-end/src/Components/Navigation/NavigationSide.tsx:133-148`

```typescript
const renderSidebarItems = () => {
  // Maintenance-only users
  if ((roles.length === 1 && roles.includes('maintenance'))
    || (roles.length === 2 && roles.includes('maintenance') && roles.includes('notify'))) {
    return mapSidebarItems(maintenanceNavSidebarItems);
  }
  
  // Admin with SAML
  if (isSAML && roles.includes('admin')) {
    return mapSidebarItems(adminSidebarItemsWithSaml);
  }
  
  // Admin users
  if (roles.includes('admin')) {
    return mapSidebarItems(adminSidebarItems);
  } 
  
  // Users with maintenance or observer roles
  else if (roles.includes('maintenance') || roles.includes('observer')) {
    return mapSidebarItems(baseSidebarItemsWithMaintenance);
  } 
  
  // All other users
  else {
    return mapSidebarItems(baseSidebarItems);
  }
};
```

### Settings Menu (Admin Only)

**Location**: `front-end/src/Components/Navigation/NavigationSide.tsx:167`

```typescript
{roles.includes('admin') && renderSettings()}
```

## Component-Level Role Checks

### Common Patterns

#### 1. Observer/Security Check Pattern

**Used in multiple components to hide sensitive actions**:

```typescript
const nonAdminSecurity = (roles.includes('security') || roles.includes('observer')) 
                        && !roles.includes('admin');
```

**Found in**:
- `Users.tsx:22`
- `Campuses.tsx:40`
- `Permissions.tsx:20`
- `Playlists.tsx:21`
- `CapMessages.tsx:32`
- `Tags.tsx:22`
- `CampusStatuses.tsx:24`
- `DashboardTable.tsx:60`
- `CampusAlerts.tsx:23`
- `Events.tsx:33`

#### 2. Admin-Only Features

**Location**: `front-end/src/Containers/Notifications/Notifications.tsx:38`

```typescript
const adminRole = roles.includes('admin');
// Used to show/hide admin-only actions
```

#### 3. Maintenance User Redirect

**Location**: `front-end/src/Containers/Login/Login.tsx:174-177`

```typescript
// After login, maintenance-only users go directly to System Health
if (roles.length === 1 && roles.includes('maintenance')) {
  return <Navigate to='/systemHealth' />;
} else if (roles.length === 2 && roles.includes('maintenance') && roles.includes('notify')) {
  return <Navigate to='/systemHealth' />;
}
```

## Role-Based UI Patterns

### 1. Conditional Button/Action Rendering

**Example**: Hide delete button for non-admins

```typescript
{!nonAdminSecurity && (
  <Button onClick={handleDelete}>Delete</Button>
)}
```

### 2. Read-Only Mode for Observers

**Pattern**: Observers can view but not edit

```typescript
<TextField 
  disabled={roles.includes('observer')}
  // ... other props
/>
```

### 3. Column Visibility in Tables

**Example**: Hide action columns for restricted users

```typescript
const columns = [
  { field: 'name', headerName: 'Name' },
  // Conditionally add actions column
  ...(!nonAdminSecurity ? [{
    field: 'actions',
    headerName: 'Actions',
    // ... action buttons
  }] : [])
];
```

### 4. Dialog Type Filtering

**Location**: `front-end/src/App.tsx:88`

```typescript
{dialogType === 'Status' && roles.includes('notify') ?
  <StatusFormDialog /> : null}
```

## Implementation Details

### Role Hierarchy (Implicit)

While not enforced in code, the practical hierarchy is:

1. **admin**
   - Full access to all features
   - Can manage users, permissions, settings
   - All menu items visible
   - All routes accessible

2. **security**
   - Can manage alerts and security features
   - Cannot modify system settings
   - Cannot manage users (except viewing)
   - Most menu items visible

3. **maintenance**
   - Access to System Health
   - Can manage device maintenance
   - Limited menu items
   - May be redirected to System Health on login

4. **observer**
   - Read-only access
   - Cannot perform any modifications
   - Action buttons hidden
   - Forms disabled

5. **notify** (special role)
   - Used in combination with other roles
   - Enables notification features

### Role Combinations

Some features check for specific role combinations:

```typescript
// Maintenance + Notify combo
if (roles.length === 2 && roles.includes('maintenance') && roles.includes('notify'))

// Security or Observer but NOT Admin
if ((roles.includes('security') || roles.includes('observer')) && !roles.includes('admin'))
```

### Session Management

#### Token Lifecycle
1. **Login**: Token received and stored in Redux + sessionStorage
2. **Active Session**: Token included in all API requests
3. **Page Refresh**: Token restored from sessionStorage
4. **Logout**: Token cleared from Redux and sessionStorage
5. **Browser Close**: Token cleared (sessionStorage)

#### Logout Action

**Location**: `front-end/src/Redux/Slices/AuthSlice.tsx:32-39`

```typescript
logout: (state) => {
  state.id = null;
  state.username = null;
  state.token = null;
  state.roles = [];
  // ... clear all auth data
}
```

### Socket.io Authentication

**Location**: `front-end/src/Socket/SocketMiddleware.ts`

The WebSocket connection also uses the JWT token for authentication:

```typescript
// Token is sent when establishing Socket.io connection
const socket = io({
  auth: {
    token: store.getState().auth.token
  }
});
```

## Security Considerations

### Strengths
1. **Token never in localStorage**: Uses sessionStorage for better security
2. **Automatic token injection**: Reduces chance of forgetting auth
3. **Route-level protection**: Unauthorized routes don't exist in DOM
4. **Component-level checks**: Additional layer of UI protection

### Limitations
1. **Client-side only**: All security must be enforced on backend
2. **Role data in JWT**: Roles visible if token is decoded
3. **No token refresh**: Token doesn't auto-refresh (must re-login)
4. **Session only**: Users must re-login after closing browser

### Best Practices Followed
1. Routes conditionally rendered (not just hidden)
2. Consistent role checking patterns
3. Clear role hierarchy
4. Centralized auth state
5. Automatic token management

## Common Use Cases

### Adding a New Admin-Only Route

```typescript
// In App.tsx
{roles.includes('admin') && 
  <Route path="new-feature" element={<NewFeature />} />}

// In NavigationSide.tsx - add to adminSidebarItems
{ title: 'New Feature', to: '/new-feature' }
```

### Making a Component Read-Only for Observers

```typescript
const isObserver = roles.includes('observer');

return (
  <div>
    <TextField disabled={isObserver} />
    {!isObserver && <Button>Save</Button>}
  </div>
);
```

### Checking Multiple Roles

```typescript
// User must have BOTH roles
if (roles.includes('admin') && roles.includes('security'))

// User must have ANY of these roles  
if (roles.includes('admin') || roles.includes('security'))

// User has specific role but NOT another
if (roles.includes('security') && !roles.includes('admin'))
```

## Summary

The frontend authorization system provides comprehensive role-based access control through:

1. **Centralized token storage** in Redux with sessionStorage persistence
2. **Automatic token injection** for all API requests
3. **Route-level protection** with conditional rendering
4. **Dynamic navigation** based on user roles
5. **Component-level UI adaptation** for different permission levels

The system ensures users only see and can access features appropriate to their role, while maintaining a clean separation between authentication (who you are) and authorization (what you can do).
# The "notify" Role: Research and Analysis

## Executive Summary

The "notify" role in VEMASS is a **supplementary role** that enables users to receive in-app notifications about system events. Unlike the notification API endpoints (which control notification management), the notify role determines **who receives notifications** when system events occur. It's automatically added to users with admin, security, or observer roles and serves as a subscription mechanism for real-time alerts.

## Key Distinction: Notify Role vs Notification Endpoints

### The Notify Role
- **Purpose**: Determines which users receive automatic notifications
- **Type**: Supplementary role (always paired with other roles)
- **Function**: Acts as a notification subscription flag
- **Usage**: Checked when creating notifications to determine recipients

### Notification API Endpoints
- **Purpose**: Manage notification records in the database
- **Access**: Controlled by primary roles (admin, security, observer)
- **Functions**: CRUD operations on notification entities
- **Usage**: Administrative control over the notification system

## How the Notify Role Works

### 1. Automatic Assignment

When users authenticate via SSO, the notify role is automatically added to certain primary roles:

```typescript
// node-server/src/sso/ssoHandler.ts:38-40
if (roleNames.includes('admin') || roleNames.includes('security') || roleNames.includes('observer')) {
  roleNames.push('notify');
}
```

This ensures that users with management or monitoring responsibilities automatically receive notifications.

### 2. Notification Distribution Flow

When a new notification is created in the system:

```typescript
// node-server/src/database/controllers/notificationController.ts:80-92
// 1. Create the notification in the database
const newNotification = await NotificationService.save(notification);

// 2. Find all users with the 'notify' role
const roleRes = await roleController.getOneRole('name', 'notify');

// 3. Filter users by campus permissions
const usersWithNotifyRoleAndPermissionForCampus = role.users.filter((user) => {
  if (user.permission && user.permission !== null) {
    return user.permission.campuses.map((campus) => campus.id).includes(returnNotification.campus.id);
  }
  return true;
});

// 4. Add notification to each user's unread list
await Promise.all(usersWithNotifyRoleAndPermissionForCampus.map(async (user) => {
  await userController.addUnreadNotification(user.id, newNotification);
}));

// 5. Broadcast via WebSocket for real-time delivery
SocketBroadcaster.newNotification(returnNotification);
```

### 3. Campus-Level Filtering

The notify role respects campus permissions:
- Users only receive notifications for campuses they have permission to access
- If a user has no campus restrictions, they receive all notifications
- This ensures users don't receive alerts for locations they can't manage

## Database Structure

### Role Definition

```sql
-- From initial data setup (node-server/src/utils/insertData.ts:84)
INSERT INTO role (name, description) VALUES
  ('notify', 'Users in the notify group will get notifications in the UI.');
```

### User-Role Relationship

The notify role is stored in the standard many-to-many `user_roles` junction table:
- Users can have multiple roles including notify
- The notify role is typically paired with primary roles
- Never exists as a standalone role

## Frontend Integration

### 1. UI Conditional Rendering

The frontend checks for the notify role to enable certain UI features:

```typescript
// front-end/src/App.tsx:88-90
{dialogType === 'Status' && roles.includes('notify') ?
  <StatusChangeDialog
    open={dialogType === 'Status'}
    // ... other props
  /> : null}
```

### 2. Navigation Adjustments

Special handling for maintenance users with notify role:

```typescript
// front-end/src/Components/Navigation/NavigationSide.tsx:134-136
if ((roles.length === 1 && roles.includes('maintenance'))
  || (roles.length === 2 && roles.includes('maintenance') && roles.includes('notify'))) {
  return mapSidebarItems(maintenanceNavSidebarItems);
}
```

### 3. Routing Logic

The login component handles special combinations:

```typescript
// front-end/src/Containers/Login/Login.tsx:174-177
if (roles.length === 1 && roles.includes('maintenance')) {
  return <Navigate to='/systemHealth' />;
} else if (roles.length === 2 && roles.includes('maintenance') && roles.includes('notify')) {
  return <Navigate to='/systemHealth' />;
}
```

## API Worker Integration

The API worker also respects the notify role when processing notifications:

```typescript
// api-worker/src/controllers/notificationController.ts:109
console.log(`Users with notify role: ${userIds} for notification ${notificationId} for campus ${campusId}`);
```

## Common Role Combinations

| Primary Role | Notify Role | Result |
|-------------|-------------|---------|
| admin | notify | Full access + receives all notifications |
| security | notify | Security access + receives security notifications |
| observer | notify | Read-only access + receives notifications for viewing |
| maintenance | notify | Device management + receives maintenance alerts |
| maintenance | (no notify) | Device management only, no automatic notifications |

## Notification Types That Trigger Notify Role

Based on the codebase analysis, notifications are created for:

1. **Campus Status Changes**: When campus devices go online/offline
2. **Alert Broadcasts**: When emergency alerts are sent
3. **System Events**: Maintenance warnings, errors, updates
4. **Device Health**: Temperature/voltage anomalies
5. **User Actions**: Important administrative changes

## Why Separate Notify Role from API Permissions?

### Design Rationale

1. **Granular Control**: Allows fine-tuning who receives notifications independent of their ability to manage them
2. **Opt-in/Opt-out**: Users could theoretically have their notify role removed while keeping other permissions
3. **Notification Fatigue Prevention**: Not all users with system access need real-time alerts
4. **Performance**: Only users with notify role have unread notifications tracked in the database

### Practical Benefits

- **Maintenance Users**: Can manage devices without being flooded with notifications
- **Temporary Roles**: Contractors might have admin access without notify role
- **Notification Management**: Admins can control notification distribution separately from access control

## Implementation Details

### Backend Processing

1. **Creation**: When system events occur, notifications are created in the database
2. **Distribution**: The notify role is queried to find recipients
3. **Filtering**: Campus permissions further filter the recipient list
4. **Delivery**: Notifications are added to user's unread list and broadcast via WebSocket

### Frontend Handling

1. **Storage**: Redux store maintains user's roles including notify
2. **Real-time**: Socket.io listener receives new notifications if user has notify role
3. **Display**: UI components render notification badges and dialogs
4. **Persistence**: Unread notifications persist across sessions

## Historical Context

From the release notes (`scripts/release/RELEASE_NOTES.md`):

- **v2.7.2**: Fixed bug where initial data was incorrectly setting users to observer role instead of notify role
- **v1.0.0**: Removed notify role from OKTA & ssoHandler as directly assignable - it's now automatically added to admin/security roles

This shows the evolution from manual assignment to automatic supplementation.

## Security Considerations

1. **No Direct Access**: The notify role grants no API access or permissions
2. **Information Disclosure**: Users with notify role can see notification content for their permitted campuses
3. **Campus Isolation**: Campus permissions prevent cross-campus information leakage
4. **Audit Trail**: All notification creation and delivery is logged

## Best Practices

### For Administrators

1. **Role Assignment**: Don't manually assign notify role - let the system add it automatically
2. **Campus Permissions**: Ensure users have appropriate campus access before they receive notifications
3. **Monitoring**: Check that critical users have the notify role for important alerts

### For Developers

1. **Always Check Campus**: When creating notifications, respect campus permissions
2. **Use Controller Methods**: Use `notificationController.createNotification()` which handles notify role distribution
3. **WebSocket Broadcasting**: Always broadcast after creating notifications for real-time delivery
4. **Test Role Combinations**: Verify notification delivery for different role combinations

## Summary

The notify role is a clever architectural decision that separates:
- **Access Control** (what you can do) - managed by primary roles
- **Information Distribution** (what you're told about) - managed by notify role

This dual-layer approach provides flexibility in managing who receives system notifications without affecting their operational permissions. The automatic assignment to admin, security, and observer roles ensures that users who need to know about system events receive them, while the campus permission filtering ensures they only receive relevant notifications for their areas of responsibility.

The notification API endpoints, requiring admin/security/observer roles, control the management and viewing of notification records, while the notify role simply determines who gets automatically notified when events occur. This distinction enables fine-grained control over both notification management and distribution in the VEMASS system.
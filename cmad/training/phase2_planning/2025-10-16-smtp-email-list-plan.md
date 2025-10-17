# SMTP Settings and Email List Feature - Planning Document

## Feature Overview

This feature adds comprehensive SMTP email configuration and email list management capabilities to the VEMASS District Server. Currently, the system uses AWS SES as the default email server for sending automated action notifications to user accounts. This feature enables administrators to configure custom SMTP servers for email delivery and create reusable email lists that can be associated with automated actions (events).

**Key Value Propositions:**
1. **SMTP Flexibility**: Administrators can configure custom SMTP servers (Gmail, Office365, corporate mail servers) instead of relying solely on AWS SES
2. **Email List Management**: Create and maintain reusable distribution lists for emergency notifications and automated actions
3. **Enhanced Automation**: Automated actions/events can now notify external stakeholders via email lists in addition to system users
4. **Backward Compatibility**: Maintains existing AWS SES functionality as fallback when SMTP is not configured

**Business Context:**
Emergency notification systems often need to reach external stakeholders (parents, first responders, media contacts) who don't have system accounts. Email lists enable this critical communication path through automated actions triggered by campus status changes.

## Target Branch
`ai-smtp`

## Implementation Workflow

This planning document is designed to support the following workflow:

1. **Research Phase**: Research has been completed (see `ai-docs/research/vmass-email-smtp-analysis.md` for SMTP field reference)
2. **Story Creation**: Generate GitLab issues from this plan (requires manager review)
3. **Implementation**: Execute and fully test each story systematically

---

## High-Level Requirements

### 1. SMTP Settings Storage
Add SMTP configuration fields to the settings table for new and existing installations.

### 2. SMTP Settings UI
Create dedicated UI page in Settings accordion for SMTP configuration with field validation.

### 3. EmailList Model & API
Create new EmailList entity with full CRUD operations and many-to-many relationship with Events.

### 4. EmailList UI Management
Create UI page for managing email lists with add/edit/delete functionality in Settings accordion.

### 5. Event-EmailList Integration
Add email list selection to Automated Actions UI and update event processing logic.

### 6. Email Delivery Processing
Implement backend logic to send emails to both user accounts and email lists using SMTP when configured, falling back to AWS SES.

---

## Detailed Requirements

## Requirement 1: SMTP Settings Storage

### Description
Add SMTP configuration fields to the settings table to store email server connection details. This requires updates to both new installation scripts and upgrade scripts to ensure all installations (new and existing) have these settings available.

### Acceptance Criteria

#### 1.1 Settings Schema Definition
1. **Field Structure**
   - Seven new settings keys added to settings table
   - All fields stored as text in key-value format
   - Settings keys follow existing naming convention (PascalCase)
   - Default values appropriate for common scenarios

2. **Required SMTP Settings Fields**
   - `SmtpFromAddress`: Email address for "From" field (default: empty)
   - `SmtpUsername`: SMTP authentication username (default: empty)
   - `SmtpPassword`: SMTP authentication password, encrypted (default: empty)
   - `SmtpHost`: SMTP server hostname or IP (default: empty)
   - `SmtpPort`: SMTP server port number (default: "587")
   - `SmtpConnectionType`: Encryption method - "None", "SSL", or "TLS" (default: "None")
   - `SmtpAuthenticationType`: Auth method - "None", "Plain", "Login", or "Cram_MD5" (default: "None")

3. **Data Validation Requirements**
   - SmtpFromAddress must be valid email format when provided
   - SmtpPort must be integer 1-65535
   - SmtpConnectionType must be one of: "None", "SSL", "TLS"
   - SmtpAuthenticationType must be one of: "None", "Plain", "Login", "Cram_MD5"

#### 1.2 New Installation Support
1. **initData.sh Updates**
   - Add INSERT statements for all 7 SMTP settings
   - Insert statements placed after existing settings inserts (after line 50)
   - Include descriptive text in description field
   - Follow existing settings INSERT pattern

2. **initCiData.sh Updates**
   - Duplicate same INSERT statements for CI environment
   - Maintain consistency with initData.sh

3. **initTestData.sh Updates**
   - Duplicate same INSERT statements for test environment
   - May include test-specific SMTP configuration values

#### 1.3 Existing Installation Upgrade Support
1. **upgradeUbuntu22.sh Updates**
   - Add conditional INSERT statements using WHERE NOT EXISTS pattern
   - Insert statements placed after existing conditional settings inserts (after line 123)
   - Prevents duplicate key errors on re-run
   - Each setting inserted only if key doesn't exist

2. **Conditional Insert Pattern**
   ```sql
   INSERT INTO settings (key, value, "group", description)
   SELECT 'SmtpFromAddress', '', null, 'Email address for SMTP From field'
   WHERE NOT EXISTS (
     SELECT 1 FROM settings WHERE key = 'SmtpFromAddress'
   );
   ```

### File References

#### Scripts
- **Modify**: `scripts/database/initData.sh` - Add 7 SMTP setting INSERT statements after line 50
- **Modify**: `scripts/database/initCiData.sh` - Duplicate SMTP INSERTs
- **Modify**: `scripts/database/initTestData.sh` - Duplicate SMTP INSERTs
- **Modify**: `scripts/release/ubuntu22/upgradeUbuntu22.sh` - Add conditional SMTP INSERTs after line 123
- **Reference**: `scripts/release/ubuntu22/upgradeUbuntu22.sh:107-123` - Pattern for conditional settings INSERT

### Function/Component References

#### Script Functions
- Pattern: Conditional INSERT with WHERE NOT EXISTS subquery
- Reference: Existing settings initialization pattern from initData.sh lines 36-50

### Data Structures

#### Settings Table Schema
```typescript
// Existing settings table structure (no schema changes needed)
interface Setting {
  id: number;
  key: string;        // New keys: SmtpFromAddress, SmtpUsername, etc.
  value: string;      // All SMTP values stored as strings
  group: string | null;
  description: string;
}
```

#### SMTP Settings Keys
```typescript
const SMTP_SETTINGS = {
  fromAddress: 'SmtpFromAddress',     // Email address
  username: 'SmtpUsername',           // Username for auth
  password: 'SmtpPassword',           // Password (encrypted)
  host: 'SmtpHost',                   // Server hostname/IP
  port: 'SmtpPort',                   // Port number as string
  connectionType: 'SmtpConnectionType', // None/SSL/TLS
  authenticationType: 'SmtpAuthenticationType' // None/Plain/Login/Cram_MD5
};
```

### Validation Rules
- SmtpFromAddress: Email regex validation (when not empty)
- SmtpHost: Hostname or IP validation (when not empty)
- SmtpPort: Integer 1-65535 validation
- SmtpConnectionType: Enum ["None", "SSL", "TLS"]
- SmtpAuthenticationType: Enum ["None", "Plain", "Login", "Cram_MD5"]
- All fields optional (empty string allowed)

### Technical Notes
- No database migration needed - uses existing settings table
- Settings are key-value pairs, no complex schema changes
- Encryption for SmtpPassword will be handled in UI/API layer
- Follow existing settings pattern for consistency
- Upgrade script must be idempotent (safe to run multiple times)

### Dependencies
- PostgreSQL 12+ with existing settings table
- Existing settings initialization infrastructure

### Testing Requirements
- **Unit Tests**: None required (bash scripts)
- **Integration Tests**:
  - Run initData.sh on clean database, verify 7 SMTP settings exist
  - Run upgradeUbuntu22.sh on existing database, verify settings added
  - Run upgradeUbuntu22.sh twice, verify no duplicate key errors
- **Manual Testing**:
  - Fresh install creates all SMTP settings
  - Upgrade adds settings to existing installation
  - Settings have correct default values
- **Edge Cases**:
  - Upgrade script runs multiple times safely
  - Settings with existing keys are not overwritten

---

## Requirement 2: SMTP Settings UI

### Description
Create a dedicated SMTP Settings page within the Settings accordion navigation. This page will provide a user-friendly interface for configuring email server settings, following the same permission requirements and UI patterns as the existing General Settings page. The page will integrate with the existing Settings API endpoints without requiring backend changes.

### Acceptance Criteria

#### 2.1 Settings Navigation Integration
1. **Accordion Menu Addition**
   - "SMTP Settings" menu item appears in Settings accordion
   - Menu item positioned after "General" settings item
   - Visible only to users with system write permission (permission level 2)
   - Route path: `/settings/smtp`
   - Menu item label: "SMTP Settings"

2. **Routing Configuration**
   - New route added to React Router configuration
   - Route protected by authentication
   - Route protected by system permission check
   - Component lazy-loaded for performance

#### 2.2 SMTP Settings Page UI
1. **Page Layout**
   - Header with "SMTP Settings" title and info icon tooltip
   - Info tooltip text: "Configure email server settings for system notifications"
   - Follows Settings page layout pattern from Settings.tsx
   - Responsive design matching existing settings pages
   - Single form with labeled input fields

2. **Form Fields**
   - **Email Address** (SmtpFromAddress)
     - TextField component with email validation
     - Label: "From Email Address"
     - Helper text: "Email address displayed in the From field"
     - Validation: Email format regex
     - Required: No (empty allowed)

   - **SMTP Host** (SmtpHost)
     - TextField component with hostname validation
     - Label: "SMTP Server Host"
     - Helper text: "Hostname or IP address of SMTP server"
     - Validation: Hostname or IP format
     - Required: No (empty allowed)

   - **SMTP Port** (SmtpPort)
     - NumberField component
     - Label: "SMTP Port"
     - Helper text: "Common: 587 (TLS), 465 (SSL), 25 (Plain)"
     - Validation: Integer 1-65535
     - Default: "587"
     - Required: No

   - **Connection Type** (SmtpConnectionType)
     - Select dropdown component
     - Label: "Connection Security"
     - Options: "None (STARTTLS)", "SSL", "TLS"
     - Default: "None"
     - Helper text: "Encryption method for SMTP connection"

   - **Authentication Type** (SmtpAuthenticationType)
     - Select dropdown component
     - Label: "Authentication Method"
     - Options: "None", "Plain", "Login", "Cram_MD5"
     - Default: "None"
     - Helper text: "Authentication mechanism for SMTP server"

   - **Username** (SmtpUsername)
     - TextField component
     - Label: "SMTP Username"
     - Helper text: "Username for SMTP authentication (if required)"
     - Required: No (empty allowed)

   - **Password** (SmtpPassword)
     - PasswordField component with visibility toggle
     - Label: "SMTP Password"
     - Helper text: "Password for SMTP authentication (if required)"
     - Required: No (empty allowed)
     - Max length: 245 characters

3. **Form Actions**
   - "Save Changes" button (primary)
     - Disabled when no changes made
     - Disabled during save operation
     - Shows loading indicator during save
   - "Test Email" section
     - TextField for recipient email address
     - "Send Test Email" button
     - Requires saved SMTP settings before testing
     - Validates recipient email format

4. **User Feedback**
   - Success toast on save: "SMTP settings saved successfully"
   - Error toast on save failure with error message
   - Success toast on test email: "Test email sent to {email}"
   - Error toast on test failure with error message
   - Real-time field validation errors below each field

#### 2.3 Data Integration
1. **State Management**
   - Uses RTK Query to fetch settings on page load
   - Local state for form values
   - Error state for validation feedback
   - Loading state for async operations

2. **API Integration**
   - GET `/api/settings` to load current values on mount
   - PUT `/api/settings` to update individual settings (use existing endpoint)
   - POST `/api/smtp/test` to send test email (requires new endpoint)
   - Settings filtered to SMTP-specific keys only

3. **Data Flow**
   - Page load fetches all settings, displays only SMTP-related
   - Field changes update local state
   - Save button calls PUT for each changed setting
   - Test email validates and calls test endpoint

#### 2.4 Validation & Error Handling
1. **Client-Side Validation**
   - Email address: Email regex pattern
   - SMTP Host: Hostname or IP regex pattern
   - SMTP Port: Number validation (1-65535)
   - Connection Type: Must be in enum list
   - Authentication Type: Must be in enum list
   - Real-time validation on blur
   - Submit disabled if validation errors exist

2. **Server-Side Validation**
   - Backend validates via existing settings validation
   - Error messages displayed in toast notifications
   - Field-specific errors highlighted

### File References

#### Frontend Components
- **Create**: `front-end/src/Containers/Settings/SmtpSettings.tsx` - Main SMTP settings page component
- **Create**: `front-end/src/Containers/Settings/SmtpSettings.module.css` - Component-specific styles
- **Modify**: `front-end/src/App.tsx` - Add route for SMTP settings page
- **Modify**: `front-end/src/Components/Navigation/NavigationSide.tsx` - Add menu item to settings accordion
- **Reference**: `front-end/src/Containers/Settings/Settings.tsx` - Pattern for settings page layout and API integration
- **Reference**: `front-end/src/Utils/constants.tsx` - Add SMTP setting key constants

#### API Integration
- **Modify**: `front-end/src/Redux/api.tsx` - Add `sendTestEmail` mutation endpoint
- **Reference**: `front-end/src/Redux/api.tsx` - useGetSettingsQuery, useEditSettingMutation patterns

#### Backend (New Endpoint Only)
- **Create**: `node-server/src/api/smtp/index.ts` - Test email endpoint
- **Modify**: `node-server/src/api/index.ts` - Mount SMTP router

### Function/Component References

#### Frontend Components
- **Create**: `<SmtpSettings>` in `SmtpSettings.tsx` - Main component with form and validation
- **Reference**: `<Settings>` in `Settings.tsx` - Follow layout and structure pattern
- **Use**: `<TextField>`, `<NumberField>`, `<Select>`, `<PasswordField>` - Existing form components
- **Use**: `useToastContext` - For success/error notifications
- **Use**: `hasWriteAccess('system')` - Permission checking

#### API Endpoints
- **Create**: `POST /api/smtp/test` - Send test email to validate configuration
- **Reference**: `GET /api/settings` - Existing endpoint for loading settings
- **Reference**: `PUT /api/settings` - Existing endpoint for updating settings

### Data Structures

#### SMTP Settings Form State
```typescript
interface SmtpFormState {
  SmtpFromAddress: string;
  SmtpUsername: string;
  SmtpPassword: string;
  SmtpHost: string;
  SmtpPort: string;
  SmtpConnectionType: 'None' | 'SSL' | 'TLS';
  SmtpAuthenticationType: 'None' | 'Plain' | 'Login' | 'Cram_MD5';
}
```

#### Validation Error State
```typescript
interface SmtpValidationErrors {
  SmtpFromAddress?: string;
  SmtpHost?: string;
  SmtpPort?: string;
  SmtpConnectionType?: string;
  SmtpAuthenticationType?: string;
}
```

#### Test Email Request
```typescript
interface TestEmailRequest {
  recipientEmail: string;
}
```

### Validation Rules
- SmtpFromAddress: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` (email regex)
- SmtpHost: Hostname or IP validation, allow empty
- SmtpPort: Must be integer 1-65535
- SmtpConnectionType: Must be "None", "SSL", or "TLS"
- SmtpAuthenticationType: Must be "None", "Plain", "Login", or "Cram_MD5"
- Test email recipient: Email format required

### User Experience Requirements
- Settings load automatically on page mount
- Save button disabled when no changes made
- Loading indicators during save and test operations
- Clear error messages for validation failures
- Test email section only enabled when SMTP host configured
- Confirmation message shows recipient email on test success
- Password field has show/hide toggle
- Helper text provides guidance for each field
- Consistent styling with existing settings pages

### Technical Notes
- Reuse existing Settings API endpoints where possible
- Only add new endpoint for test email functionality
- Password encryption handled by backend (if needed)
- Settings page follows MUI design system
- Component lazy-loaded to improve initial page load
- Uses CSS Modules for scoped styling
- Permission check prevents unauthorized access
- Settings are global, not user-specific

### Dependencies
- Material-UI form components (TextField, Select, etc.)
- RTK Query for API integration
- React Router for navigation
- Toast context for notifications
- Existing Settings API endpoints
- Permission system for access control

### Testing Requirements
- **Unit Tests**:
  - Component renders with all fields
  - Validation triggers on invalid input
  - Save button disabled when no changes
  - Permission check restricts access
- **Integration Tests**:
  - Settings load from API on mount
  - Save operation calls API with correct data
  - Test email sends to specified recipient
  - Error messages display on API failure
- **Manual Testing**:
  - Navigate to SMTP Settings from menu
  - Fill out form and save successfully
  - Test email delivers to recipient
  - Validation prevents invalid data submission
  - Permission check hides page for non-admin users
- **Edge Cases**:
  - Empty settings (fresh install)
  - Partial settings configuration
  - Invalid SMTP credentials
  - Network errors during save/test
  - Very long passwords (max 245 chars)

---

## Requirement 3: EmailList Model & API

### Description
Create a new EmailList entity that stores reusable email distribution lists. Each email list has a label/name and an array of email addresses stored using PostgreSQL's native array type. The EmailList entity will have a many-to-many relationship with the Event entity, allowing automated actions to notify email lists. The implementation includes full CRUD operations with permission-based access control matching the automated actions (events) permission requirements.

### Acceptance Criteria

#### 3.1 Database Schema & Model
1. **EmailList Entity Structure**
   - Primary key: Auto-increment integer `id`
   - Label field: `label` (varchar 255, unique, not null)
   - Description field: `description` (varchar 1024, nullable)
   - Emails field: `emails` (PostgreSQL text array, not null)
   - Created timestamp: `created_at` (timestamp, default CURRENT_TIMESTAMP)
   - Updated timestamp: `updated_at` (timestamp, nullable)
   - Creator reference: `created_by_user_id` (foreign key to user table, nullable)

2. **Model Validation**
   - Label must be unique across all email lists
   - Label length 1-255 characters
   - Description max 1024 characters
   - Emails array must contain at least 1 email
   - Each email must match valid email format
   - Max 100 emails per list

3. **Relationship Definitions**
   - **EmailList → User** (Many-to-One): Creator relationship via created_by_user_id
   - **EmailList ↔ Event** (Many-to-Many): Join table `event_email_list`

#### 3.2 Database Migration
1. **Migration File Creation**
   - New migration file in `node-server/src/migrations/`
   - Naming pattern: `{timestamp}-CreateEmailListTable.ts`
   - TypeORM migration class with up() and down() methods

2. **Migration Up Operations**
   - Create `email_list` table with all fields
   - Create `event_email_list` join table
     - `event_id` (bigint, foreign key to events.id)
     - `email_list_id` (integer, foreign key to email_list.id)
     - Composite primary key on (event_id, email_list_id)
     - ON DELETE CASCADE for both foreign keys
   - Create unique index on `email_list.label`
   - Create foreign key constraint to user table

3. **Migration Down Operations**
   - Drop `event_email_list` join table
   - Drop `email_list` table

#### 3.3 TypeORM Model Implementation
1. **EmailList Entity Class**
   - File location: `node-server/src/database/models/emailList.ts`
   - Export default class EmailList
   - All fields with appropriate decorators
   - Validation decorators (IsNotEmpty, IsEmail, MaxLength)
   - Relationship decorators for User and Event

2. **Event Entity Updates**
   - Add Many-to-Many relationship to EmailList
   - Use @ManyToMany decorator with cascade: true
   - Use @JoinTable for join table configuration
   - Property name: `emailLists: EmailList[]`

#### 3.4 Service Layer Implementation
1. **EmailListService Methods**
   - `create(data: EmailListInfo): Promise<EmailList>` - Create new email list
   - `getAll(): Promise<EmailList[]>` - Get all email lists
   - `getOneByField(field: string, value: any): Promise<EmailList | undefined>` - Find by field
   - `update(emailList: EmailList, updates: Partial<EmailListInfo>): Promise<EmailList>` - Update email list
   - `delete(emailList: EmailList): Promise<void>` - Delete email list
   - `validateEmails(emails: string[]): boolean` - Email format validation
   - `isLabelDuplicate(label: string): Promise<boolean>` - Check label uniqueness

2. **Query Optimization**
   - Load creator user relationship when needed
   - Load event relationships for usage tracking
   - Selective field loading for list operations

#### 3.5 Controller Layer Implementation
1. **EmailListController Methods**
   - `create(data: EmailListInfo, userId: string): Promise<ControllerResponse>` - Create with validation
   - `getAll(): Promise<ControllerResponse>` - Retrieve all lists
   - `getOne(id: string): Promise<ControllerResponse>` - Retrieve single list
   - `update(id: string, data: Partial<EmailListInfo>, userId: string): Promise<ControllerResponse>` - Update with validation
   - `delete(id: string): Promise<ControllerResponse>` - Delete with event check

2. **Validation Logic**
   - Validate label uniqueness (create/update)
   - Validate email array length (1-100)
   - Validate each email format
   - Validate label length (1-255)
   - Validate description length (max 1024)
   - Check permission level for all operations

3. **Business Rules**
   - Prevent deletion if email list assigned to active events
   - Track creator for audit purposes
   - Timestamps automatically managed

#### 3.6 API Routes Implementation
1. **REST Endpoints**
   - `GET /api/email-list` - Get all email lists
     - Permission: automated level 1 (read)
     - Returns: Array of email lists with creator info

   - `GET /api/email-list/:id` - Get single email list
     - Permission: automated level 1 (read)
     - Returns: Email list with full details

   - `POST /api/email-list` - Create new email list
     - Permission: automated level 2 (write)
     - Body: { label, description, emails }
     - Returns: Created email list

   - `PUT /api/email-list/:id` - Update email list
     - Permission: automated level 2 (write)
     - Body: Partial email list data
     - Returns: Updated email list

   - `DELETE /api/email-list/:id` - Delete email list
     - Permission: automated level 2 (write)
     - Validation: Check no active event associations
     - Returns: Success message

2. **Error Responses**
   - 400: Validation errors (invalid emails, duplicate label)
   - 403: Insufficient permissions
   - 404: Email list not found
   - 409: Email list in use by events (delete operation)

#### 3.7 Permission Integration
1. **Permission Requirements**
   - GET operations require `automated: 1` (read access to automated actions)
   - POST/PUT/DELETE operations require `automated: 2` (write access to automated actions)
   - Permission checks integrated in API middleware
   - Use existing permission system patterns from event routes

### File References

#### Backend Model
- **Create**: `node-server/src/database/models/emailList.ts` - EmailList entity with fields: id, label, description, emails[], created_at, updated_at, created_by_user_id
- **Modify**: `node-server/src/database/models/event.ts` - Add emailLists Many-to-Many relationship
- **Reference**: `node-server/src/database/models/event.ts` - Pattern for Many-to-Many with JoinTable
- **Reference**: `node-server/src/database/models/capMsg.ts` - Pattern for text array fields

#### Backend Service
- **Create**: `node-server/src/database/services/emailListService.ts` - CRUD methods and email validation
- **Reference**: `node-server/src/database/services/eventService.ts` - Service pattern with query builder
- **Reference**: `node-server/src/database/services/capMsgService.ts` - Pattern for duplicate label checking

#### Backend Controller
- **Create**: `node-server/src/database/controllers/emailListController.ts` - Business logic, validation, permission checks
- **Reference**: `node-server/src/database/controllers/eventController.ts` - Controller pattern with permission integration
- **Modify**: `node-server/src/database/databaseTypes.ts` - Add EmailListInfo interface

#### API Routes
- **Create**: `node-server/src/api/emailList/index.ts` - REST endpoints for email list CRUD
- **Modify**: `node-server/src/api/index.ts` - Mount email list router at `/api/email-list`
- **Reference**: `node-server/src/api/event/index.ts` - Permission middleware pattern

#### Database Migration
- **Create**: `node-server/src/migrations/{timestamp}-CreateEmailListTable.ts` - Creates email_list and event_email_list tables
- **Reference**: `node-server/src/migrations/` - Existing migration patterns

### Function/Component References

#### Model Methods
- **Implement**: EmailList entity class in `emailList.ts`
  - Standard TypeORM decorators (@Entity, @Column, @ManyToOne, @ManyToMany)
  - PostgreSQL array type for emails field
  - Relationship configuration with Event and User

#### Service Methods
- **Implement**: `EmailListService.create(data)` - Create with email validation
- **Implement**: `EmailListService.getAll()` - Query all with creator info
- **Implement**: `EmailListService.getOneByField(field, value)` - Find by field
- **Implement**: `EmailListService.update(emailList, updates)` - Update with validation
- **Implement**: `EmailListService.delete(emailList)` - Delete operation
- **Implement**: `EmailListService.validateEmails(emails)` - Email format validation
- **Reference**: `EventService.updateProperties()` - Pattern for relationship management

#### Controller Methods
- **Implement**: `EmailListController.create(data, userId)` - Create with permission check
- **Implement**: `EmailListController.getAll()` - Retrieve all lists
- **Implement**: `EmailListController.getOne(id)` - Retrieve single list
- **Implement**: `EmailListController.update(id, data, userId)` - Update with validation
- **Implement**: `EmailListController.delete(id)` - Delete with event association check
- **Reference**: `EventController.create()` - Permission and validation pattern

#### API Endpoints
- **Create**: `GET /api/email-list` - List all email lists
- **Create**: `GET /api/email-list/:id` - Get single email list
- **Create**: `POST /api/email-list` - Create new email list
- **Create**: `PUT /api/email-list/:id` - Update email list
- **Create**: `DELETE /api/email-list/:id` - Delete email list

### Data Structures

#### EmailList Model
```typescript
@Entity({ name: 'email_list' })
class EmailList {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  label: string;

  @Column({ type: 'varchar', length: 1024, nullable: true })
  description: string;

  @Column({ type: 'text', array: true })
  emails: string[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  updated_at: Date;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by_user_id' })
  creator: User;

  @ManyToMany(() => Event, (event) => event.emailLists)
  events: Event[];
}
```

#### Event Model Update
```typescript
// Add to Event entity
@ManyToMany(() => EmailList, (emailList) => emailList.events, { cascade: true })
@JoinTable({
  name: 'event_email_list',
  joinColumn: { name: 'event_id', referencedColumnName: 'id' },
  inverseJoinColumn: { name: 'email_list_id', referencedColumnName: 'id' }
})
emailLists: EmailList[];
```

#### EmailListInfo Interface
```typescript
interface EmailListInfo {
  label: string;
  description?: string;
  emails: string[];
  created_by_user_id?: string;
}
```

#### API Response Types
```typescript
interface ControllerResponse {
  success: boolean;
  code: number;
  message?: string;
  data?: EmailList | EmailList[];
}
```

### Validation Rules
- **Label**: Required, 1-255 characters, unique across all email lists
- **Description**: Optional, max 1024 characters
- **Emails**: Required array, 1-100 emails, each valid email format
- **Email Format**: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` regex pattern
- **Permissions**: automated:1 for read, automated:2 for write/delete

### User Experience Requirements
- Email list creation validates all emails before saving
- Duplicate label detection prevents conflicts
- Delete operation blocked if list used by active events with helpful error message
- Creator tracked for audit purposes
- Timestamps automatically managed by database

### Technical Notes
- Use PostgreSQL text array type for emails field
- Many-to-many join table uses composite primary key
- ON DELETE CASCADE ensures orphaned join records removed
- Migration creates indexes for performance
- Service layer abstracts all database operations
- Controller layer enforces business rules and permissions
- Follow existing patterns from Event entity for consistency
- Email validation regex should match frontend validation

### Dependencies
- TypeORM for ORM operations
- PostgreSQL 12+ for array type support
- Existing permission middleware
- Existing User and Event models
- Migration infrastructure

### Testing Requirements
- **Unit Tests**:
  - Service: Email validation logic
  - Service: Label duplicate detection
  - Controller: Permission enforcement
  - Controller: Validation error handling
- **Integration Tests**:
  - Create email list via API
  - Update email list via API
  - Delete email list via API
  - Prevent delete when assigned to events
  - Many-to-many relationship creation
- **Manual Testing**:
  - Create email list with valid data
  - Attempt create with duplicate label
  - Attempt create with invalid emails
  - Update existing email list
  - Delete unused email list
  - Attempt delete of list assigned to event
  - Verify permission restrictions
- **Edge Cases**:
  - Empty email array (should fail validation)
  - 100+ emails (should fail validation)
  - Invalid email formats
  - Very long labels (255+ chars)
  - Special characters in label
  - Concurrent create operations with same label

---

## Requirement 4: EmailList UI Management

### Description
Create a dedicated Email Lists management page within the Settings accordion. This page provides CRUD interface for managing email distribution lists, following the CrudTable pattern used by the Roles page. The page is visible to users with automated:1 permission (read access to automated actions) and editable by users with automated:2 permission (write access).

### Acceptance Criteria

#### 4.1 Settings Navigation Integration
1. **Accordion Menu Addition**
   - "Email Lists" menu item appears in Settings accordion
   - Menu item positioned after "SMTP Settings" item
   - Visible only to users with automated:1 permission
   - Route path: `/settings/email-lists`
   - Menu item label: "Email Lists"
   - Menu item uses Email icon from MUI icons

2. **Routing Configuration**
   - New route added to React Router configuration
   - Route protected by authentication
   - Route protected by automated permission check (level 1+)
   - Component lazy-loaded for performance

#### 4.2 Email Lists Page Layout
1. **Page Structure**
   - Header with "Email Lists" title and info icon tooltip
   - Info tooltip text: "Manage email distribution lists for automated actions"
   - Search bar for filtering by label or description
   - "Create New Email List" button (visible only with automated:2)
   - CrudTable component with email list data
   - Pagination controls (25/50/100 rows per page)

2. **CrudTable Column Configuration**
   - **Actions Column** (leftmost, 80px width)
     - Edit button (GridActionsCellItem) - enabled with automated:2
     - Delete button (GridActionsCellItem) - enabled with automated:2

   - **Label Column** (flex: 2)
     - Displays email list label
     - Sortable
     - Primary identifier

   - **Description Column** (flex: 3)
     - Displays description text
     - Uses renderCellExpand for long text
     - Not sortable

   - **Email Count Column** (flex: 1)
     - Displays number of emails in list
     - Value from emails.length
     - Sortable

   - **Events Column** (flex: 1)
     - Displays count of events using this list
     - Value from events.length
     - Sortable

3. **Bulk Operations**
   - Row selection checkboxes
   - "Delete Selected" button appears when rows selected
   - Disabled for lists assigned to events
   - Requires automated:2 permission

#### 4.3 Create/Edit Dialog
1. **Dialog Structure**
   - Modal dialog with title: "Create Email List" or "Edit Email List"
   - Form layout with labeled fields
   - Save and Cancel buttons
   - Close on ESC key or backdrop click

2. **Form Fields**
   - **Label** (required)
     - TextField component
     - Max length: 255 characters
     - Validation: Required, unique
     - Helper text: "Unique name for this email list"

   - **Description** (optional)
     - TextField component, multiline (3 rows)
     - Max length: 1024 characters
     - Helper text: "Optional description of this list's purpose"

   - **Email Addresses** (required)
     - Dynamic array of TextField components
     - Add button to add new email field
     - Remove button for each email (except last if only one)
     - Min: 1 email, Max: 100 emails
     - Email format validation on each field
     - Helper text: "Enter email addresses (1-100 emails)"

3. **Validation & Error Handling**
   - Real-time validation on blur
   - Label uniqueness check via API
   - Email format validation per field
   - Min/max email count validation
   - Disabled save button when validation errors exist
   - Error messages below each field

4. **User Feedback**
   - Success toast on save: "Email list created/updated successfully"
   - Error toast on save failure with error message
   - Loading indicator during save operation

#### 4.4 Delete Dialog
1. **Dialog Configuration**
   - Standard DeleteDialog component
   - Dynamic title based on selection
     - Single: "Delete Email List?"
     - Multiple: "Delete {count} Email Lists?"
   - Warning message about permanence
   - Cancel and Delete buttons

2. **Delete Validation**
   - Check if email list(s) assigned to events
   - If assigned, show error: "Cannot delete {label} - assigned to {count} event(s)"
   - Remove invalid selections from delete queue
   - Show validation errors in toast

3. **Delete Execution**
   - DELETE request per email list
   - Success toast: "Email list deleted" or "{count} email lists deleted"
   - Error toast if any deletion fails
   - Refresh list after successful deletion

#### 4.5 State Management
1. **Component State**
   - `selectedEmailList`: Currently selected for editing (null for create)
   - `emailListRowSelectionModel`: Array of selected IDs for bulk operations
   - `emailListsToDelete`: Array of IDs queued for deletion
   - `searchTerm`: Filter string for search

2. **RTK Query Integration**
   - `useGetEmailListsQuery()` - Fetch all email lists
   - `useCreateEmailListMutation()` - Create new email list
   - `useUpdateEmailListMutation()` - Update existing email list
   - `useDeleteEmailListMutation()` - Delete email list
   - Auto-refetch on mutations

3. **Dialog State**
   - `useDialogContext()` for dialog management
   - Create dialog: `dialogType === 'Create'` and `selectedEmailList === null`
   - Edit dialog: `dialogType === 'Update'` and `selectedEmailList !== null`
   - Delete dialog: `dialogType === 'Delete'`

#### 4.6 Search/Filter Functionality
1. **Search Implementation**
   - TextField with SearchIcon adornment
   - Placeholder: "Search email lists..."
   - Filters by label and description (case-insensitive)
   - Updates filteredData via useMemo
   - Clears on clear button click

#### 4.7 Permission Integration
1. **Read Permission (automated:1)**
   - View email lists page
   - See all email lists
   - View email list details
   - Cannot create/edit/delete

2. **Write Permission (automated:2)**
   - All read permissions
   - Create new email lists
   - Edit existing email lists
   - Delete email lists (if not assigned to events)
   - Bulk delete operations

### File References

#### Frontend Components
- **Create**: `front-end/src/Containers/Settings/EmailLists.tsx` - Main email lists page with CrudTable
- **Create**: `front-end/src/Containers/Settings/EmailLists.module.css` - Component-specific styles
- **Create**: `front-end/src/Components/Dialogs/EmailListCreateDialog.tsx` - Create dialog with form
- **Create**: `front-end/src/Components/Dialogs/EmailListEditDialog.tsx` - Edit dialog with form
- **Modify**: `front-end/src/App.tsx` - Add route for email lists page
- **Modify**: `front-end/src/Components/Navigation/NavigationSide.tsx` - Add menu item to settings accordion
- **Reference**: `front-end/src/Containers/Roles/Roles.tsx` - CrudTable pattern, bulk delete, dialog integration
- **Reference**: `front-end/src/Components/Dialogs/RoleCreateDialog.tsx` - Dialog form pattern
- **Reference**: `front-end/src/Components/Table/CrudTable.tsx` - CrudTable component usage

#### API Integration
- **Modify**: `front-end/src/Redux/api.tsx` - Add email list API endpoints
  - `useGetEmailListsQuery()`
  - `useGetEmailListQuery(id)`
  - `useCreateEmailListMutation()`
  - `useUpdateEmailListMutation()`
  - `useDeleteEmailListMutation()`
- **Reference**: `front-end/src/Redux/api.tsx` - Roles API endpoints pattern

#### TypeScript Types
- **Modify**: `front-end/src/TypeScript/AppTypes.ts` - Add EmailList interface
- **Reference**: `front-end/src/TypeScript/AppTypes.ts` - Role interface pattern

### Function/Component References

#### Main Page Component
- **Create**: `<EmailLists>` in `EmailLists.tsx`
  - Main component with state management
  - Renders CrudTable with column configuration
  - Handles search filtering
  - Manages dialog state
  - Implements permission checks

#### Key Functions
- **Implement**: `handleEmailListSelection(id?: string): void`
  - Loads selected email list for editing
  - Parameters: `id` - Email list ID or undefined to clear
  - Usage: Edit button click, dialog close handlers

- **Implement**: `handleBulkDelete(id?: string): void`
  - Validates and queues email lists for deletion
  - Parameters: `id` - Single ID or undefined for bulk
  - Validation: Check event assignments
  - Shows error toast if assigned to events

- **Implement**: `executeDelete(): Promise<void>`
  - Executes deletion of queued email lists
  - Calls deleteEmailList mutation for each
  - Shows success/error toasts
  - Clears selection on completion

- **Implement**: `filteredData(): EmailList[]`
  - Filters email lists by search term
  - useMemo for performance
  - Searches label and description fields

- **Reference**: Roles.tsx functions for implementation patterns

#### Dialog Components
- **Create**: `<EmailListCreateDialog>`
  - Form with label, description, emails array
  - Dynamic email field management
  - Add/remove email fields
  - Validation and submission

- **Create**: `<EmailListEditDialog>`
  - Pre-populated form with existing data
  - Same fields as create dialog
  - Update submission

- **Reference**: `<RoleCreateDialog>` for dialog form pattern

### Data Structures

#### EmailList Interface
```typescript
interface EmailList {
  id: number;
  label: string;
  description?: string;
  emails: string[];
  created_at: Date;
  updated_at?: Date;
  creator?: {
    id: string;
    username: string;
  };
  events?: Event[]; // For event count
}
```

#### EmailList Form State
```typescript
interface EmailListFormState {
  label: string;
  description: string;
  emails: string[];
}
```

#### Validation Errors
```typescript
interface EmailListValidationErrors {
  label?: string;
  description?: string;
  emails?: { [index: number]: string };
}
```

### Validation Rules
- **Label**: Required, 1-255 characters, unique
- **Description**: Optional, max 1024 characters
- **Emails**: Required array, 1-100 emails
- **Email Format**: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` per email
- **Delete**: Cannot delete if assigned to any events

### User Experience Requirements
- Real-time search filtering
- Loading indicators during API operations
- Clear error messages for validation failures
- Confirmation required for delete operations
- Bulk operations for efficiency
- Responsive layout on all screen sizes
- Keyboard navigation support
- Accessibility compliance (ARIA labels, focus management)

### Technical Notes
- Follow CrudTable pattern from Roles page exactly
- Actions column on LEFT (80px width)
- Use GridActionsCellItem for action buttons
- Integrate with useDialogContext for state management
- Email fields dynamically add/remove
- useMemo for filtered data performance
- Permission checks with hasReadAccess/hasWriteAccess utilities
- CSS Modules for scoped styling
- Lazy loading for route component

### Dependencies
- Material-UI DataGrid and components
- RTK Query for API integration
- React Router for navigation
- Dialog context for modal management
- Toast context for notifications
- Permission utilities
- CrudTable component

### Testing Requirements
- **Unit Tests**:
  - Component renders with permissions
  - Search filtering works correctly
  - Validation triggers on invalid input
  - Permission checks restrict actions
- **Integration Tests**:
  - Email lists load from API
  - Create operation saves to API
  - Edit operation updates API
  - Delete operation calls API
  - Bulk delete handles multiple IDs
  - Search filters data correctly
- **Manual Testing**:
  - Navigate to Email Lists page
  - Create new email list
  - Edit existing email list
  - Delete unused email list
  - Attempt delete of list assigned to event
  - Bulk delete multiple lists
  - Search/filter functionality
  - Permission restrictions work
- **Edge Cases**:
  - Empty email lists table
  - Very long labels/descriptions
  - 100 emails in list
  - Delete list assigned to 0 vs many events
  - Rapid create/delete operations
  - Network errors during operations

---

## Requirement 5: Event-EmailList Integration

### Description
Integrate email lists into the Automated Actions (Events) UI by adding a multi-select field for email list assignment. Update the Event model to load email list relationships and display them in the events table. Follow the existing pattern for how users are currently associated with events.

### Acceptance Criteria

#### 5.1 Event Model Updates
1. **Backend Relationship Loading**
   - EventService.getAll() includes emailLists relationship
   - EventService.getOneByField() includes emailLists relationship
   - EventService.updateProperties() handles emailLists array updates
   - EmailList objects include id and label only (reduced payload)

2. **Relationship Update Logic**
   - Add `emailLists` case in updateProperties() method
   - Loop through emailList IDs from request
   - Fetch each EmailList entity via EmailListService
   - Build emailListArray with fetched entities
   - Assign to eventToUpdate.emailLists
   - Pattern identical to users relationship handling

#### 5.2 Event UI Component Updates
1. **Event Table Display**
   - Add "Email Lists" column to events table
   - Display count of assigned email lists
   - Use valueGetter to count emailLists.length
   - Column width: flex 1
   - Positioned after "Users" column

2. **Create Event Dialog**
   - Add "Email Lists" section after "Users" section
   - Multi-select Autocomplete component
   - Label: "Email Lists"
   - Helper text: "Select email lists to notify when this event triggers"
   - Options loaded from useGetEmailListsQuery()
   - Display label in dropdown
   - Value is array of email list IDs
   - Clearable with (X) button

3. **Edit Event Dialog**
   - Pre-populate email lists multi-select with current assignments
   - Show currently selected email lists
   - Allow add/remove email lists
   - Save updates emailLists array on event

4. **Validation & Constraints**
   - Email lists field is optional (can be empty array)
   - No limit on number of email lists per event
   - Requires automated:2 permission to edit (same as events)

#### 5.3 API Integration
1. **Event API Updates**
   - POST /api/event includes emailLists array in request body
   - PUT /api/event/:id includes emailLists array in request body
   - GET /api/event returns events with emailLists relationship
   - GET /api/event/:id returns event with full emailLists data

2. **Request/Response Format**
   ```typescript
   // Request body for create/update
   {
     label: string;
     // ... other event fields
     users: number[]; // User IDs
     emailLists: number[]; // Email list IDs
   }

   // Response includes
   {
     id: string;
     label: string;
     // ... other event fields
     users: [{ id: number, username: string, email: string }];
     emailLists: [{ id: number, label: string }];
   }
   ```

#### 5.4 State Management
1. **Event Form State**
   - Add `emailLists: number[]` to event form state interface
   - Initialize as empty array for new events
   - Populate from API response for existing events
   - Update when user changes selection

2. **RTK Query Updates**
   - Email lists query runs on dialog open
   - Event query includes emailLists in response
   - Create/update mutations include emailLists in request

### File References

#### Backend Service
- **Modify**: `node-server/src/database/services/eventService.ts`
  - Update getAll() to join emailLists relationship (line ~110)
  - Update getOneByField() to join emailLists (line ~190)
  - Update getAllFilteredByStatusAndCampus() to join emailLists (line ~130)
  - Add emailLists case in updateProperties() method (after line ~78)
- **Reference**: `node-server/src/database/services/eventService.ts:70-78` - users relationship pattern

#### Backend Model
- **Modify**: `node-server/src/database/models/event.ts` - emailLists relationship added in Requirement 3
- **Reference**: `node-server/src/database/models/event.ts:76-91` - users Many-to-Many pattern

#### Frontend Components
- **Modify**: `front-end/src/Containers/Events/Events.tsx` - Add Email Lists column to table
- **Modify**: `front-end/src/Components/Dialogs/EventCreateDialog.tsx` - Add email lists multi-select
- **Modify**: `front-end/src/Components/Dialogs/EventEditDialog.tsx` - Add email lists multi-select with pre-population
- **Reference**: User multi-select implementation in event dialogs for pattern

#### Frontend API
- **Modify**: `front-end/src/Redux/api.tsx` - Event endpoints already handle emailLists (auto-serialized)
- **Use**: `useGetEmailListsQuery()` - Fetch options for multi-select

#### TypeScript Types
- **Modify**: `front-end/src/TypeScript/AppTypes.ts` - Add emailLists to Event interface
- **Modify**: `node-server/src/database/databaseTypes.ts` - Add emailLists to EventInfo interface

### Function/Component References

#### Backend Service Methods
- **Modify**: `EventService.getAll()` - Add emailLists join
  ```typescript
  .leftJoin('event.emailLists', 'emailList')
  .addSelect(['emailList.id', 'emailList.label'])
  ```

- **Modify**: `EventService.getOneByField()` - Add emailLists join (same pattern)

- **Modify**: `EventService.updateProperties()` - Add emailLists handling
  ```typescript
  else if (key === 'emailLists' && eventInfo.emailLists !== undefined) {
    logger.info('Updating Email Lists');
    const emailListArray = [];
    for (const emailListObj of eventInfo.emailLists) {
      const emailList = await EmailListService.getOneByField('id', emailListObj);
      if (emailList === undefined) { throw new Error('404: Email List not found'); }
      emailListArray.push(emailList);
    }
    eventToUpdate.emailLists = emailListArray;
  }
  ```

#### Frontend Components
- **Modify**: Events table column configuration
  ```typescript
  {
    field: 'emailLists',
    headerName: 'Email Lists',
    flex: 1,
    valueGetter: (params) => params.row.emailLists?.length || 0
  }
  ```

- **Add**: Email Lists Autocomplete in event dialogs
  ```typescript
  <Autocomplete
    multiple
    options={emailLists || []}
    getOptionLabel={(option) => option.label}
    value={selectedEmailLists}
    onChange={(e, newValue) => setSelectedEmailLists(newValue)}
    renderInput={(params) => (
      <TextField
        {...params}
        label="Email Lists"
        helperText="Select email lists to notify"
      />
    )}
  />
  ```

### Data Structures

#### Event Interface Update
```typescript
interface Event {
  id: string;
  label: string;
  description: string;
  // ... other fields
  users: { id: number; username: string; email: string; }[];
  emailLists: { id: number; label: string; }[]; // Added
  // ... other fields
}
```

#### EventInfo Interface Update
```typescript
interface EventInfo {
  label?: string;
  description?: string;
  // ... other fields
  users?: number[];
  emailLists?: number[]; // Added
  // ... other fields
}
```

#### Event Form State Update
```typescript
interface EventFormState {
  label: string;
  description: string;
  // ... other fields
  users: number[];
  emailLists: number[]; // Added
  // ... other fields
}
```

### Validation Rules
- Email lists field is optional (empty array allowed)
- Email list IDs must reference existing email lists
- Email list validation happens server-side via foreign key
- No client-side validation beyond ensuring IDs are numbers

### User Experience Requirements
- Email lists multi-select appears in same section as users
- Clear label and helper text
- Easy to add/remove email lists
- Shows currently selected lists in edit mode
- Dropdown shows all available email lists
- Search/filter capability in dropdown (built into Autocomplete)
- Visual consistency with users multi-select field

### Technical Notes
- Follow exact pattern from users relationship implementation
- Backend loads reduced EmailList objects (id, label only)
- Frontend Autocomplete component handles multi-select UX
- No changes needed to API endpoints (TypeORM handles serialization)
- Many-to-many relationship managed by TypeORM
- Join table (event_email_list) automatically updated
- Permission requirements match existing event permissions

### Dependencies
- EmailList model and API (Requirement 3)
- EmailList UI for managing lists (Requirement 4)
- Existing Event model and API
- Material-UI Autocomplete component
- RTK Query for data fetching

### Testing Requirements
- **Unit Tests**:
  - EventService.updateProperties() handles emailLists array
  - Email lists join included in queries
- **Integration Tests**:
  - Create event with email lists via API
  - Update event email lists via API
  - Retrieve event includes email lists
  - Email list deletion prevents if assigned to event
- **Manual Testing**:
  - Create event with email lists selected
  - Edit event and change email lists
  - View event shows correct email list count
  - Create event without email lists (empty array)
  - Delete email list shows error if assigned
- **Edge Cases**:
  - Event with 0 email lists
  - Event with many email lists (10+)
  - Email list deleted while event edit dialog open
  - Rapid add/remove of email lists in dialog

---

## Requirement 6: Email Delivery Processing

### Description
Implement backend email delivery logic that sends emails to both user accounts and email lists when automated actions (events) are triggered. The system will check for SMTP settings and use them if configured; otherwise, it will fall back to the existing AWS SES delivery method. This maintains backward compatibility while adding SMTP functionality.

### Acceptance Criteria

#### 6.1 Email Processing Location
1. **Identify Email Processing Point**
   - Event trigger processing occurs in node-server event handler
   - User emails currently sent via existing notification system
   - Need to identify where event-triggered notifications call email sending
   - Location: Event status change triggers in node-server

2. **Integration Point**
   - Find where event users are notified
   - Add parallel processing for email lists
   - Maintain existing user notification flow
   - Add new email list notification flow

#### 6.2 SMTP Configuration Detection
1. **Settings Retrieval**
   - Query settings table for SMTP configuration
   - Required settings: SmtpHost, SmtpPort, SmtpFromAddress
   - Optional settings: SmtpUsername, SmtpPassword, SmtpConnectionType, SmtpAuthenticationType
   - Cache settings in memory to avoid repeated queries

2. **Configuration Validation**
   - Check if SmtpHost is non-empty
   - If SmtpHost empty or null, use AWS SES (existing behavior)
   - If SmtpHost configured, use SMTP for email delivery
   - Log which email method is being used

#### 6.3 SMTP Email Delivery Implementation
1. **Nodemailer Integration**
   - Install nodemailer package (industry-standard SMTP library)
   - Create SMTP transporter with settings
   - Configure connection options (host, port, auth, security)
   - Handle SSL/TLS based on SmtpConnectionType setting

2. **Email Sending Function**
   - Function signature: `sendEmailViaSMTP(to: string[], subject: string, body: string): Promise<void>`
   - Create transporter with SMTP settings
   - Build email message (from, to, subject, body)
   - Handle both plain text and HTML body
   - Send email via transporter
   - Log success/failure

3. **SMTP Configuration Mapping**
   ```typescript
   {
     host: SmtpHost,
     port: parseInt(SmtpPort),
     secure: SmtpConnectionType === 'SSL', // true for SSL, false for TLS/None
     auth: SmtpUsername && SmtpPassword ? {
       user: SmtpUsername,
       pass: SmtpPassword
     } : undefined,
     tls: {
       rejectUnauthorized: SmtpConnectionType === 'TLS' // Verify certificates for TLS
     }
   }
   ```

4. **Error Handling**
   - Catch SMTP connection errors
   - Catch send failures
   - Log errors with details
   - Fall back to AWS SES if SMTP fails (optional requirement)
   - Return error status for notification creation

#### 6.4 Email List Processing
1. **Event Trigger Email Flow**
   - When event triggers, load event with emailLists relationship
   - Extract all email addresses from all associated email lists
   - Combine into single recipient array
   - Remove duplicates (if same email in multiple lists)
   - Add user account emails from event.users
   - Remove duplicates between users and email lists

2. **Email Recipient Aggregation**
   ```typescript
   // Pseudocode
   const emailListAddresses = event.emailLists.flatMap(list => list.emails);
   const userEmails = event.users.map(user => user.email);
   const allRecipients = [...new Set([...emailListAddresses, ...userEmails])];
   ```

3. **Batch Sending**
   - Send to all recipients in single email (BCC)
   - Or send individual emails per recipient (depends on requirement)
   - Recommended: BCC for privacy and efficiency
   - Max recipients per email: 50 (common SMTP limit)
   - If more than 50, split into multiple sends

#### 6.5 AWS SES Fallback
1. **Existing Behavior Preservation**
   - If SmtpHost is empty, use AWS SES
   - Existing AWS SES code remains unchanged
   - No modification to SES email sending logic
   - Maintain existing email templates

2. **Decision Logic**
   ```typescript
   const smtpHost = await getSetting('SmtpHost');
   if (smtpHost && smtpHost.trim() !== '') {
     await sendEmailViaSMTP(recipients, subject, body);
   } else {
     await sendEmailViaSES(recipients, subject, body); // Existing function
   }
   ```

#### 6.6 Email Content Generation
1. **Email Subject**
   - Include event label
   - Include campus name if applicable
   - Example: "Alert: {eventLabel} - {campusName}"

2. **Email Body**
   - Include event details (label, description)
   - Include timestamp
   - Include campus information
   - Plain text and HTML versions
   - Consistent with existing email templates

3. **Template Structure**
   ```typescript
   Subject: Emergency Alert: {eventLabel}

   Body:
   An automated action has been triggered:

   Event: {eventLabel}
   Campus: {campusName}
   Status: {statusChange}
   Time: {timestamp}

   {eventDescription}

   This is an automated message from VEMASS District Server.
   ```

#### 6.7 Logging & Notifications
1. **Email Send Logging**
   - Log email send attempts
   - Log successful sends
   - Log failed sends with error details
   - Include recipient count, event ID, email method (SMTP/SES)

2. **System Notifications**
   - Create notification on email send failure
   - Notify users with notification permissions
   - Include error message in notification
   - Don't notify on successful sends (too noisy)

### File References

#### Backend Email Service
- **Create**: `node-server/src/utils/email/smtpEmailHandler.ts` - SMTP email sending logic
- **Modify**: `node-server/src/utils/email/sesEmailHandler.ts` - Add decision logic for SMTP vs SES
- **Reference**: `node-server/src/utils/email/sesEmailHandler.ts` - Existing SES implementation pattern

#### Backend Event Processing
- **Modify**: `node-server/src/network/eventHandler.ts` or equivalent - Add email list processing
- **Modify**: `node-server/src/database/services/eventService.ts` - Load emailLists in trigger queries
- **Reference**: Current event triggering code path

#### Backend Settings Service
- **Modify**: `node-server/src/database/services/settingsService.ts` - Add helper for getting multiple settings at once
- **Reference**: Existing setting retrieval methods

#### Package Dependencies
- **Modify**: `node-server/package.json` - Add nodemailer dependency

### Function/Component References

#### Email Sending Functions
- **Create**: `sendEmailViaSMTP(to: string[], subject: string, body: string): Promise<boolean>`
  - Parameters: Recipient emails, subject line, email body
  - Returns: Success/failure boolean
  - Error Handling: Catch and log SMTP errors

- **Create**: `getSMTPSettings(): Promise<SMTPConfig>`
  - Retrieves all SMTP settings from database
  - Returns: Configuration object for nodemailer
  - Caching: Cache config for 5 minutes

- **Create**: `decideSendMethod(): Promise<'SMTP' | 'SES'>`
  - Checks if SMTP configured
  - Returns: Method to use for sending
  - Logic: SmtpHost non-empty = SMTP, else SES

- **Modify**: Existing event trigger handler
  - Add email list processing
  - Call email sending functions
  - Handle both users and email lists

#### Email List Processing Functions
- **Create**: `getEventEmailRecipients(event: Event): Promise<string[]>`
  - Parameters: Event with users and emailLists loaded
  - Returns: Deduplicated array of email addresses
  - Logic: Combine user emails + email list emails, remove duplicates

- **Create**: `batchSendEmails(recipients: string[], subject: string, body: string): Promise<void>`
  - Parameters: Recipient array, subject, body
  - Logic: Split into batches of 50, send each batch
  - Error Handling: Log failures, continue with next batch

### Data Structures

#### SMTP Configuration Object
```typescript
interface SMTPConfig {
  host: string;
  port: number;
  secure: boolean;
  auth?: {
    user: string;
    pass: string;
  };
  tls: {
    rejectUnauthorized: boolean;
  };
}
```

#### Email Send Result
```typescript
interface EmailSendResult {
  success: boolean;
  method: 'SMTP' | 'SES';
  recipientCount: number;
  error?: string;
}
```

#### Email Message
```typescript
interface EmailMessage {
  from: string;
  to?: string[];
  bcc?: string[];
  subject: string;
  text: string;
  html?: string;
}
```

### Validation Rules
- SMTP Host must be non-empty to use SMTP
- Recipient email addresses validated before sending
- Max 50 recipients per SMTP send
- From address must be valid email format
- Email body max length: 10,000 characters (common limit)

### User Experience Requirements
- Email delivery transparent to end users
- System administrators see SMTP vs SES in logs
- Email send failures create notifications
- Email recipients cannot see other recipients (BCC)
- Emails arrive within 30 seconds of event trigger
- Email content is clear and actionable

### Technical Notes
- Use nodemailer for SMTP (most popular Node.js email library)
- Cache SMTP settings to reduce database queries
- BCC recipients for privacy (don't expose recipient list)
- Handle SMTP connection pooling for performance
- Test with Gmail, Office365, and generic SMTP servers
- SMTP password may need decryption if encrypted in database
- Fall back to SES on SMTP failure (optional but recommended)
- Log both successful and failed sends for audit
- Consider rate limiting for high-volume events

### Dependencies
- nodemailer npm package (~6.9.x)
- Existing AWS SES email handler
- Settings service for SMTP config
- Event service with emailLists relationship

### Testing Requirements
- **Unit Tests**:
  - getSMTPSettings() retrieves and maps settings correctly
  - decideSendMethod() returns SMTP when configured
  - decideSendMethod() returns SES when not configured
  - getEventEmailRecipients() deduplicates emails
  - batchSendEmails() splits into batches of 50
- **Integration Tests**:
  - Send email via SMTP with real SMTP server
  - Send email via SES when SMTP not configured
  - Event trigger sends to both users and email lists
  - Duplicate emails only send once
  - Multiple email lists combine correctly
- **Manual Testing**:
  - Configure SMTP settings
  - Trigger event with email list
  - Verify email received
  - Trigger event without SMTP configured
  - Verify SES email received
  - Test with Gmail SMTP
  - Test with Office365 SMTP
  - Test with invalid SMTP credentials (error handling)
- **Edge Cases**:
  - Event with 0 email lists (only users)
  - Event with 0 users (only email lists)
  - Event with 100+ total recipients (batching)
  - Same email in multiple lists
  - User email also in email list
  - SMTP server unreachable (error handling)
  - Invalid SMTP credentials (error handling)
  - Empty email list (0 emails)

---

## Non-Functional Requirements

### Performance
- Settings query for SMTP config: < 50ms (cache after first load)
- Email list recipient aggregation: < 100ms for 10 lists with 50 emails each
- SMTP email send (single): < 5 seconds including connection time
- Batch email send (50 recipients): < 10 seconds
- Event trigger with email notification: Total < 15 seconds including all processing
- Database queries use indexes on foreign keys
- Email list emails stored as PostgreSQL array for efficient retrieval

### Security
- SMTP password encrypted in database (if stored)
- Email addresses validated to prevent injection
- SMTP connections use TLS/SSL when configured
- No email addresses exposed in BCC sends
- API endpoints protected by permission middleware
- Email list CRUD requires automated:2 permission
- SMTP settings require system:2 permission
- Audit logging for all email list modifications
- Rate limiting on test email endpoint (max 10/hour per user)

### Scalability
- Support up to 100 email lists
- Support up to 100 emails per list
- Support up to 50 events with email lists
- Handle 1000+ email recipients per event trigger
- Database join tables indexed for performance
- Email sending asynchronous (doesn't block event processing)
- Consider message queue for high-volume email (future enhancement)

### Usability
- SMTP settings page has clear field labels and helper text
- Email list management UI follows existing CRUD patterns
- Event dialog email list selection integrates seamlessly
- Error messages are actionable (e.g., "SMTP authentication failed - check username and password")
- Test email functionality provides immediate feedback
- Email list deletion blocked with clear explanation when in use
- Search/filter functionality on email lists page
- Bulk operations for efficiency

### Reliability
- Email sending failures logged and create notifications
- SMTP connection errors handled gracefully
- Fall back to AWS SES if SMTP unavailable (optional)
- Database transactions ensure data consistency
- Migration is idempotent (can run multiple times safely)
- No orphaned data from cascade deletes
- System continues functioning if email delivery fails

### Maintainability
- Code follows existing patterns from Event and User models
- Clear separation between SMTP and SES logic
- Email list service abstracts all database operations
- Comprehensive logging for troubleshooting
- TypeScript types for all interfaces
- CLAUDE.md files updated with new components
- Comments explain SMTP configuration mapping
- Test coverage for critical paths

---

## Technical Stack Summary

### Backend
- **Language**: TypeScript with Node.js 16+
- **Framework**: Express.js
- **Database**: PostgreSQL 12 with TypeORM
- **Key Libraries**:
  - nodemailer (SMTP email sending)
  - typeorm (ORM)
  - amqplib (RabbitMQ - future email queue)

### Frontend
- **Language**: TypeScript with React 17
- **Framework**: React with Vite
- **UI Library**: Material-UI v5
- **State Management**: Redux Toolkit with RTK Query
- **Key Components**:
  - DataGrid (MUI X)
  - Autocomplete (multi-select)
  - TextField, Select, PasswordField

### Database Schema Additions
- **Table**: `email_list`
  - Fields: id, label, description, emails[], created_at, updated_at, created_by_user_id
  - Indexes: Unique on label, foreign key on created_by_user_id

- **Table**: `event_email_list` (join table)
  - Fields: event_id, email_list_id
  - Indexes: Composite primary key, foreign keys with cascade delete

- **Settings**: 7 new key-value pairs in settings table
  - SmtpFromAddress, SmtpUsername, SmtpPassword, SmtpHost, SmtpPort, SmtpConnectionType, SmtpAuthenticationType

---

## Migration Considerations

### Database Migrations
1. **CreateEmailListTable Migration**
   - Creates email_list table with all fields
   - Creates event_email_list join table
   - Adds indexes and foreign keys
   - Runs automatically on node-server startup

2. **Settings Initialization**
   - New installs: SMTP settings added via initData.sh
   - Existing installs: SMTP settings added via upgradeUbuntu22.sh
   - Upgrade script uses conditional INSERT (idempotent)

### Data Migration
- No existing data to migrate (new feature)
- Empty email lists allowed (0 rows initially)
- Existing events have empty emailLists array initially

### Backward Compatibility
- Existing event processing continues to work
- Events without email lists function normally
- AWS SES remains functional when SMTP not configured
- No breaking changes to Event API
- Frontend handles missing emailLists gracefully (empty array)
- Migration reversible via down() method

---

## Success Criteria

### Definition of Done
1. SMTP settings stored in database for all installation types
2. SMTP Settings UI page functional with all fields and validation
3. EmailList model created with CRUD operations
4. EmailList UI page created with CrudTable pattern
5. Events can be associated with email lists via UI
6. Email delivery sends to both users and email lists
7. SMTP used when configured, SES used as fallback
8. All tests passing (unit, integration, manual)
9. CLAUDE.md files updated with new components
10. Documentation includes SMTP configuration examples

### Testing Checklist
- [ ] Fresh install creates all 7 SMTP settings
- [ ] Upgrade script adds SMTP settings to existing installation
- [ ] SMTP Settings page loads and displays all fields
- [ ] SMTP Settings page saves changes successfully
- [ ] Test email sends via SMTP when configured
- [ ] Create email list via UI
- [ ] Edit email list via UI
- [ ] Delete unused email list via UI
- [ ] Delete blocked for email list assigned to event
- [ ] Email list appears in event create dialog
- [ ] Email list appears in event edit dialog
- [ ] Event saves with email lists selected
- [ ] Event trigger sends email to email list addresses
- [ ] Event trigger sends email to user account emails
- [ ] Duplicate emails only sent once
- [ ] Email sent via SMTP when configured
- [ ] Email sent via SES when SMTP not configured
- [ ] Email send failure creates notification
- [ ] Permission checks restrict unauthorized access
- [ ] Search/filter works on email lists page
- [ ] Bulk delete works on email lists page
- [ ] Migration up() creates tables successfully
- [ ] Migration down() removes tables successfully

---

## Open Questions / Considerations

### Questions for Manager Review
1. **Email Sending Method**: Should we send one email with BCC to all recipients, or individual emails per recipient?
   - **Recommendation**: BCC for privacy and efficiency, batch in groups of 50 for SMTP limits

2. **SMTP Failure Fallback**: Should we automatically fall back to AWS SES if SMTP fails?
   - **Recommendation**: Yes, log SMTP failure and attempt SES to ensure delivery

3. **Email List Limit**: Is 100 emails per list sufficient, or should we increase?
   - **Recommendation**: 100 is reasonable to start, can increase if needed

4. **SMTP Password Encryption**: Should SMTP password be encrypted in database?
   - **Recommendation**: Yes if possible, similar to how VMASS encrypts passwords (RSA/AES pattern from research doc)

5. **Email Rate Limiting**: Should we limit email sending rate to prevent abuse?
   - **Recommendation**: Start without limits, add if abuse detected

### Recommendations
1. **SMTP Configuration Wizard**: Consider adding a setup wizard that tests SMTP connection as part of configuration
   - Benefit: Reduces misconfiguration issues
   - Implementation: Simple dialog flow after save

2. **Email Templates**: Consider adding email template customization in future
   - Benefit: Organizations can brand emergency emails
   - Implementation: Settings page with template editor

3. **Email Delivery Status**: Consider tracking email delivery status (sent, delivered, failed)
   - Benefit: Audit trail for emergency notifications
   - Implementation: New table with email send history

4. **Message Queue Integration**: Consider using RabbitMQ for email sending to handle high volume
   - Benefit: Better performance for large recipient lists
   - Implementation: New worker similar to api-worker pattern

5. **Email List Groups**: Consider allowing email lists to contain other email lists (nested)
   - Benefit: More flexible organization structure
   - Implementation: Self-referential many-to-many relationship

---

## Implementation Order Recommendation

### Phase 1: Foundation (Stories 1-3)
1. **Story 1**: SMTP Settings Storage
   - Update initData.sh, upgradeUbuntu22.sh scripts
   - Test database initialization
   - Estimated: 1 story point

2. **Story 2**: SMTP Settings UI
   - Create SmtpSettings.tsx component
   - Add navigation and routing
   - Implement form and validation
   - Estimated: 3 story points

3. **Story 3**: EmailList Model & API
   - Create migration
   - Create model, service, controller
   - Create API routes
   - Write unit tests
   - Estimated: 5 story points

### Phase 2: UI & Integration (Stories 4-5)
4. **Story 4**: EmailList UI Management
   - Create EmailLists.tsx with CrudTable
   - Create create/edit dialogs
   - Implement bulk delete
   - Write component tests
   - Estimated: 5 story points

5. **Story 5**: Event-EmailList Integration
   - Update Event model queries
   - Add email list field to event dialogs
   - Update event table display
   - Write integration tests
   - Estimated: 3 story points

### Phase 3: Email Delivery (Story 6)
6. **Story 6**: Email Delivery Processing
   - Implement SMTP email handler
   - Add decision logic for SMTP vs SES
   - Implement email list processing
   - Add batch sending
   - Write integration tests
   - Estimated: 5 story points

**Total Estimated Stories**: 6 stories
**Total Estimated Effort**: 22 story points (approximately 2-3 sprint cycles)

---

## Appendix: Reference Materials

### Related Documentation
- `ai-docs/research/vmass-email-smtp-analysis.md` - Comprehensive SMTP field analysis and patterns from VMASS system
- `CLAUDE.md` - Project architecture and development strategy
- `node-server/CLAUDE.md` - Backend architecture overview
- `node-server/src/database/CLAUDE.md` - Database layer architecture
- `node-server/src/database/models/CLAUDE.md` - TypeORM model patterns
- `front-end/CLAUDE.md` - Frontend architecture and patterns
- `scripts/CLAUDE.md` - Script directory documentation

### Key Code References
- Event Model: `node-server/src/database/models/event.ts`
- Event Service: `node-server/src/database/services/eventService.ts`
- Event Controller: `node-server/src/database/controllers/eventController.ts`
- Event API: `node-server/src/api/event/index.ts`
- Settings Page: `front-end/src/Containers/Settings/Settings.tsx`
- Roles Page (CrudTable pattern): `front-end/src/Containers/Roles/Roles.tsx`
- Settings Init: `scripts/database/initData.sh`
- Upgrade Script: `scripts/release/ubuntu22/upgradeUbuntu22.sh`

### External Resources
- TypeORM Documentation: https://typeorm.io/
- Nodemailer Documentation: https://nodemailer.com/
- Material-UI DataGrid: https://mui.com/x/react-data-grid/
- PostgreSQL Array Types: https://www.postgresql.org/docs/12/arrays.html
- SMTP Protocol: RFC 5321
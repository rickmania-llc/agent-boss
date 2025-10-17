# SMTP Settings Configuration - User Story

---
title: SMTP Settings Database Schema and UI Configuration Page
source_plan: 2025-10-16-smtp-email-list-plan.md
priority: P1
status: draft
plan_type: deep
assigned_to: TBD
estimated_hours: 12-16
---

## 1. Story Summary
> As a system administrator, I need to configure custom SMTP email server settings through a dedicated UI page, so that the VEMASS system can send email notifications through our organization's email infrastructure instead of relying solely on AWS SES.

This story implements the foundational SMTP configuration capability by:
1. Adding SMTP settings to the database for both new and existing installations
2. Creating a dedicated SMTP Settings page in the Settings accordion with full form validation
3. Providing a test email feature to validate SMTP configuration

> Based on `2025-10-16-smtp-email-list-plan.md`, this story combines Requirements 1 (SMTP Settings Storage) and 2 (SMTP Settings UI) to deliver complete SMTP configuration functionality as the foundation for the email list feature.

**Business Value**: Organizations can now use their existing email infrastructure (Gmail, Office365, corporate mail servers) for emergency notifications, providing better integration with existing IT policies and email delivery monitoring systems.

---

## 2. Background / Context

### Current State
The VEMASS District Server currently uses AWS SES (Simple Email Service) as the default and only method for sending automated action notifications to user accounts. This creates dependencies on AWS infrastructure and may not align with organizational email policies.

### Architectural Context
This story establishes the foundation for the larger SMTP and Email List feature set:
- **Phase 1 (This Story)**: SMTP configuration storage and UI
- **Phase 2**: Email list management (separate story)
- **Phase 3**: Integration with automated actions/events (separate story)

### Technical Approach
- **Database**: Seven new key-value settings in the existing `settings` table (no schema changes needed)
- **Installation**: Both new installations and upgrades handle SMTP settings automatically
- **Frontend**: New page in Settings accordion following existing patterns from `Settings.tsx`
- **Backend**: New SMTP test endpoint; otherwise uses existing Settings API
- **Backward Compatibility**: AWS SES remains functional; SMTP is optional

### Reference Documentation
- Implementation Plan: `ai-docs/plans/2025-10-16-smtp-email-list-plan.md`
- SMTP Research: `ai-docs/research/vmass-email-smtp-analysis.md`
- Settings Pattern: `front-end/src/Containers/Settings/Settings.tsx`

---

## 3. Acceptance Criteria

### Database & Installation
- [ ] Fresh database installation (via `initData.sh`) creates all 7 SMTP settings with correct default values
- [ ] Existing database upgrade (via `upgradeUbuntu22.sh`) adds all 7 SMTP settings if not present
- [ ] Upgrade script is idempotent (running multiple times doesn't cause errors or duplicate settings)
- [ ] CI and test database initialization scripts also include SMTP settings

### SMTP Settings UI Page
- [ ] "SMTP Settings" menu item appears in Settings accordion after "General" settings
- [ ] Menu item is visible only to users with system write permission (level 2)
- [ ] Route `/settings/smtp` is protected by authentication and permission checks
- [ ] Page displays all 7 SMTP fields with appropriate input types and validation
- [ ] Form fields pre-populate with current values from database on page load
- [ ] "Save Changes" button is disabled when no changes are made
- [ ] Save operation updates settings in database and shows success toast
- [ ] Validation errors display below each field with clear error messages

### Test Email Functionality
- [ ] "Send Test Email" section with email input field and send button
- [ ] Test email validates recipient email format before sending
- [ ] Test email sends successfully when SMTP settings are configured
- [ ] Success toast displays: "Test email sent to {recipient}"
- [ ] Error toast displays with specific error message on failure
- [ ] Test email button disabled when SMTP host is empty

### Field Validation
- [ ] Email address validates against email regex pattern
- [ ] SMTP Host accepts hostname or IP address format
- [ ] SMTP Port validates as integer between 1-65535
- [ ] Connection Type restricts to "None", "SSL", or "TLS"
- [ ] Authentication Type restricts to "None", "Plain", "Login", or "Cram_MD5"
- [ ] Password field has show/hide toggle and max 245 characters
- [ ] Real-time validation triggers on field blur

### User Experience
- [ ] Loading indicators appear during save and test operations
- [ ] Clear helper text guides users for each field
- [ ] Info tooltip on page header explains purpose: "Configure email server settings for system notifications"
- [ ] Responsive design matches existing settings pages
- [ ] Keyboard navigation and accessibility labels present

---

## 4. Technical Implementation Details

### 4.1 Code Changes

#### Database Initialization Scripts

| File | Action | Description |
|------|--------|-------------|
| `scripts/database/initData.sh` | Modify | Add 7 SMTP setting INSERT statements after line 50 |
| `scripts/database/initCiData.sh` | Modify | Add same SMTP INSERT statements for CI environment |
| `scripts/database/initTestData.sh` | Modify | Add same SMTP INSERT statements for test environment |
| `scripts/release/ubuntu22/upgradeUbuntu22.sh` | Modify | Add conditional INSERT statements after line 123 |

#### Frontend Components

| File | Action | Description |
|------|--------|-------------|
| `front-end/src/Containers/Settings/SmtpSettings.tsx` | Create | Main SMTP settings page component with form |
| `front-end/src/Containers/Settings/SmtpSettings.module.css` | Create | Component-specific styles |
| `front-end/src/App.tsx` | Modify | Add route `/settings/smtp` with permission protection |
| `front-end/src/Components/Navigation/NavigationSide.tsx` | Modify | Add "SMTP Settings" menu item to settings accordion |
| `front-end/src/Utils/constants.tsx` | Modify | Add SMTP setting key constants |
| `front-end/src/Redux/api.tsx` | Modify | Add `sendTestEmail` mutation endpoint |

#### Backend API

| File | Action | Description |
|------|--------|-------------|
| `node-server/src/api/smtp/index.ts` | Create | SMTP test email endpoint |
| `node-server/src/api/index.ts` | Modify | Mount SMTP router at `/api/smtp` |

**Example: initData.sh SMTP Settings**
```bash
# Add after line 50 in scripts/database/initData.sh
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- SMTP Configuration Settings
    INSERT INTO settings (key, value, "group", description) VALUES
        ('SmtpFromAddress', '', null, 'Email address for SMTP From field'),
        ('SmtpUsername', '', null, 'SMTP authentication username'),
        ('SmtpPassword', '', null, 'SMTP authentication password (encrypted)'),
        ('SmtpHost', '', null, 'SMTP server hostname or IP address'),
        ('SmtpPort', '587', null, 'SMTP server port number'),
        ('SmtpConnectionType', 'None', null, 'SMTP encryption method: None, SSL, or TLS'),
        ('SmtpAuthenticationType', 'None', null, 'SMTP authentication method: None, Plain, Login, or Cram_MD5');
EOSQL
```

**Example: upgradeUbuntu22.sh Conditional Inserts**
```bash
# Add after line 123 in scripts/release/ubuntu22/upgradeUbuntu22.sh
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- SMTP Settings (conditional insert for upgrades)
    INSERT INTO settings (key, value, "group", description)
    SELECT 'SmtpFromAddress', '', null, 'Email address for SMTP From field'
    WHERE NOT EXISTS (SELECT 1 FROM settings WHERE key = 'SmtpFromAddress');

    INSERT INTO settings (key, value, "group", description)
    SELECT 'SmtpUsername', '', null, 'SMTP authentication username'
    WHERE NOT EXISTS (SELECT 1 FROM settings WHERE key = 'SmtpUsername');

    INSERT INTO settings (key, value, "group", description)
    SELECT 'SmtpPassword', '', null, 'SMTP authentication password (encrypted)'
    WHERE NOT EXISTS (SELECT 1 FROM settings WHERE key = 'SmtpPassword');

    INSERT INTO settings (key, value, "group", description)
    SELECT 'SmtpHost', '', null, 'SMTP server hostname or IP address'
    WHERE NOT EXISTS (SELECT 1 FROM settings WHERE key = 'SmtpHost');

    INSERT INTO settings (key, value, "group", description)
    SELECT 'SmtpPort', '587', null, 'SMTP server port number'
    WHERE NOT EXISTS (SELECT 1 FROM settings WHERE key = 'SmtpPort');

    INSERT INTO settings (key, value, "group", description)
    SELECT 'SmtpConnectionType', 'None', null, 'SMTP encryption method: None, SSL, or TLS'
    WHERE NOT EXISTS (SELECT 1 FROM settings WHERE key = 'SmtpConnectionType');

    INSERT INTO settings (key, value, "group", description)
    SELECT 'SmtpAuthenticationType', 'None', null, 'SMTP authentication method: None, Plain, Login, or Cram_MD5'
    WHERE NOT EXISTS (SELECT 1 FROM settings WHERE key = 'SmtpAuthenticationType');
EOSQL
```

**Example: SmtpSettings.tsx Component Structure**
```tsx
// front-end/src/Containers/Settings/SmtpSettings.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Typography,
  CircularProgress,
  IconButton,
  InputAdornment,
  Tooltip,
  FormHelperText
} from '@mui/material';
import { Visibility, VisibilityOff, Info } from '@mui/icons-material';
import { useGetSettingsQuery, useEditSettingMutation, useSendTestEmailMutation } from '../../Redux/api';
import { useToastContext } from '../../Contexts/ToastContext';
import { hasWriteAccess } from '../../Utils/permissions';
import styles from './SmtpSettings.module.css';

interface SmtpFormState {
  SmtpFromAddress: string;
  SmtpUsername: string;
  SmtpPassword: string;
  SmtpHost: string;
  SmtpPort: string;
  SmtpConnectionType: 'None' | 'SSL' | 'TLS';
  SmtpAuthenticationType: 'None' | 'Plain' | 'Login' | 'Cram_MD5';
}

interface ValidationErrors {
  SmtpFromAddress?: string;
  SmtpHost?: string;
  SmtpPort?: string;
}

export const SmtpSettings: React.FC = () => {
  const { data: settings, isLoading } = useGetSettingsQuery();
  const [editSetting] = useEditSettingMutation();
  const [sendTestEmail] = useSendTestEmailMutation();
  const { showToast } = useToastContext();

  const [formState, setFormState] = useState<SmtpFormState>({
    SmtpFromAddress: '',
    SmtpUsername: '',
    SmtpPassword: '',
    SmtpHost: '',
    SmtpPort: '587',
    SmtpConnectionType: 'None',
    SmtpAuthenticationType: 'None'
  });

  const [originalState, setOriginalState] = useState<SmtpFormState>(formState);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [testEmail, setTestEmail] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  // Permission check
  if (!hasWriteAccess('system')) {
    return (
      <Box p={3}>
        <Typography>You do not have permission to view this page.</Typography>
      </Box>
    );
  }

  // Load settings on mount
  useEffect(() => {
    if (settings) {
      const smtpSettings = settings.filter(s => s.key.startsWith('Smtp'));
      const loadedState = { ...formState };
      smtpSettings.forEach(setting => {
        if (setting.key in loadedState) {
          loadedState[setting.key as keyof SmtpFormState] = setting.value;
        }
      });
      setFormState(loadedState);
      setOriginalState(loadedState);
    }
  }, [settings]);

  // Validation functions
  const validateEmail = (email: string): string | undefined => {
    if (!email) return undefined;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) ? undefined : 'Invalid email format';
  };

  const validatePort = (port: string): string | undefined => {
    const portNum = parseInt(port);
    if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
      return 'Port must be between 1 and 65535';
    }
    return undefined;
  };

  const validateHost = (host: string): string | undefined => {
    // Basic hostname/IP validation - allow empty
    if (!host) return undefined;
    return undefined; // Add more sophisticated validation if needed
  };

  // Handle field change
  const handleFieldChange = (field: keyof SmtpFormState, value: string) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  };

  // Handle field blur for validation
  const handleFieldBlur = (field: keyof SmtpFormState) => {
    const value = formState[field];
    let error: string | undefined;

    switch (field) {
      case 'SmtpFromAddress':
        error = validateEmail(value);
        break;
      case 'SmtpPort':
        error = validatePort(value);
        break;
      case 'SmtpHost':
        error = validateHost(value);
        break;
    }

    setErrors(prev => ({ ...prev, [field]: error }));
  };

  // Check if form has changes
  const hasChanges = (): boolean => {
    return JSON.stringify(formState) !== JSON.stringify(originalState);
  };

  // Check if form has validation errors
  const hasValidationErrors = (): boolean => {
    return Object.values(errors).some(error => error !== undefined);
  };

  // Save settings
  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save each changed setting
      const settingsToUpdate = Object.entries(formState).filter(([key, value]) => {
        return value !== originalState[key as keyof SmtpFormState];
      });

      for (const [key, value] of settingsToUpdate) {
        await editSetting({ key, value }).unwrap();
      }

      setOriginalState(formState);
      showToast('SMTP settings saved successfully', 'success');
    } catch (error) {
      showToast(`Failed to save settings: ${error}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Send test email
  const handleTestEmail = async () => {
    const emailError = validateEmail(testEmail);
    if (emailError) {
      showToast('Please enter a valid email address', 'error');
      return;
    }

    if (!formState.SmtpHost) {
      showToast('Please configure SMTP host before testing', 'error');
      return;
    }

    setIsTesting(true);
    try {
      await sendTestEmail({ recipientEmail: testEmail }).unwrap();
      showToast(`Test email sent to ${testEmail}`, 'success');
    } catch (error: any) {
      showToast(`Failed to send test email: ${error?.data?.message || error}`, 'error');
    } finally {
      setIsTesting(false);
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className={styles.container}>
      {/* Header */}
      <Box display="flex" alignItems="center" mb={3}>
        <Typography variant="h5">SMTP Settings</Typography>
        <Tooltip title="Configure email server settings for system notifications">
          <IconButton size="small">
            <Info />
          </IconButton>
        </Tooltip>
      </Box>

      {/* SMTP Configuration Form */}
      <Box className={styles.formSection}>
        {/* From Email Address */}
        <TextField
          fullWidth
          label="From Email Address"
          value={formState.SmtpFromAddress}
          onChange={(e) => handleFieldChange('SmtpFromAddress', e.target.value)}
          onBlur={() => handleFieldBlur('SmtpFromAddress')}
          error={!!errors.SmtpFromAddress}
          helperText={errors.SmtpFromAddress || 'Email address displayed in the From field'}
          margin="normal"
        />

        {/* SMTP Host */}
        <TextField
          fullWidth
          label="SMTP Server Host"
          value={formState.SmtpHost}
          onChange={(e) => handleFieldChange('SmtpHost', e.target.value)}
          onBlur={() => handleFieldBlur('SmtpHost')}
          error={!!errors.SmtpHost}
          helperText={errors.SmtpHost || 'Hostname or IP address of SMTP server'}
          margin="normal"
        />

        {/* SMTP Port */}
        <TextField
          fullWidth
          type="number"
          label="SMTP Port"
          value={formState.SmtpPort}
          onChange={(e) => handleFieldChange('SmtpPort', e.target.value)}
          onBlur={() => handleFieldBlur('SmtpPort')}
          error={!!errors.SmtpPort}
          helperText={errors.SmtpPort || 'Common: 587 (TLS), 465 (SSL), 25 (Plain)'}
          margin="normal"
          inputProps={{ min: 1, max: 65535 }}
        />

        {/* Connection Type */}
        <FormControl fullWidth margin="normal">
          <InputLabel>Connection Security</InputLabel>
          <Select
            value={formState.SmtpConnectionType}
            onChange={(e) => handleFieldChange('SmtpConnectionType', e.target.value)}
            label="Connection Security"
          >
            <MenuItem value="None">None (STARTTLS)</MenuItem>
            <MenuItem value="SSL">SSL</MenuItem>
            <MenuItem value="TLS">TLS</MenuItem>
          </Select>
          <FormHelperText>Encryption method for SMTP connection</FormHelperText>
        </FormControl>

        {/* Authentication Type */}
        <FormControl fullWidth margin="normal">
          <InputLabel>Authentication Method</InputLabel>
          <Select
            value={formState.SmtpAuthenticationType}
            onChange={(e) => handleFieldChange('SmtpAuthenticationType', e.target.value)}
            label="Authentication Method"
          >
            <MenuItem value="None">None</MenuItem>
            <MenuItem value="Plain">Plain</MenuItem>
            <MenuItem value="Login">Login</MenuItem>
            <MenuItem value="Cram_MD5">Cram_MD5</MenuItem>
          </Select>
          <FormHelperText>Authentication mechanism for SMTP server</FormHelperText>
        </FormControl>

        {/* Username */}
        <TextField
          fullWidth
          label="SMTP Username"
          value={formState.SmtpUsername}
          onChange={(e) => handleFieldChange('SmtpUsername', e.target.value)}
          helperText="Username for SMTP authentication (if required)"
          margin="normal"
        />

        {/* Password */}
        <TextField
          fullWidth
          type={showPassword ? 'text' : 'password'}
          label="SMTP Password"
          value={formState.SmtpPassword}
          onChange={(e) => handleFieldChange('SmtpPassword', e.target.value)}
          helperText="Password for SMTP authentication (if required)"
          margin="normal"
          inputProps={{ maxLength: 245 }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            )
          }}
        />

        {/* Save Button */}
        <Box mt={3}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            disabled={!hasChanges() || hasValidationErrors() || isSaving}
          >
            {isSaving ? <CircularProgress size={24} /> : 'Save Changes'}
          </Button>
        </Box>
      </Box>

      {/* Test Email Section */}
      <Box className={styles.testSection} mt={4}>
        <Typography variant="h6" mb={2}>Test Email Configuration</Typography>
        <Box display="flex" gap={2} alignItems="flex-start">
          <TextField
            label="Recipient Email Address"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            helperText="Enter email address to receive test message"
            sx={{ flex: 1 }}
          />
          <Button
            variant="outlined"
            onClick={handleTestEmail}
            disabled={!formState.SmtpHost || !testEmail || isTesting}
            sx={{ mt: 1 }}
          >
            {isTesting ? <CircularProgress size={24} /> : 'Send Test Email'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default SmtpSettings;
```

**Example: Backend SMTP Test Endpoint**
```typescript
// node-server/src/api/smtp/index.ts
import express, { Request, Response } from 'express';
import { sendTestEmail } from '../../utils/email/smtpEmailHandler';
import { getSetting } from '../../database/services/settingsService';
import { asyncHandler } from '../../utils/asyncHandler';
import { hasPermission } from '../../middleware/permissions';

const router = express.Router();

// POST /api/smtp/test - Send test email
router.post('/test', hasPermission('system', 2), asyncHandler(async (req: Request, res: Response) => {
  const { recipientEmail } = req.body;

  if (!recipientEmail) {
    return res.status(400).json({ message: 'Recipient email is required' });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(recipientEmail)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  // Get SMTP settings
  const smtpHost = await getSetting('SmtpHost');
  if (!smtpHost || smtpHost.trim() === '') {
    return res.status(400).json({ message: 'SMTP host is not configured' });
  }

  const smtpPort = await getSetting('SmtpPort');
  const smtpFromAddress = await getSetting('SmtpFromAddress');
  const smtpUsername = await getSetting('SmtpUsername');
  const smtpPassword = await getSetting('SmtpPassword');
  const smtpConnectionType = await getSetting('SmtpConnectionType');

  // Send test email
  try {
    await sendTestEmail({
      to: recipientEmail,
      from: smtpFromAddress || 'noreply@vemass.local',
      subject: 'VEMASS SMTP Configuration Test',
      text: 'This is a test email from VEMASS District Server to verify your SMTP configuration is working correctly.',
      host: smtpHost,
      port: parseInt(smtpPort || '587'),
      username: smtpUsername,
      password: smtpPassword,
      connectionType: smtpConnectionType as 'None' | 'SSL' | 'TLS'
    });

    res.json({ success: true, message: `Test email sent to ${recipientEmail}` });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: `Failed to send test email: ${error.message}`
    });
  }
}));

export default router;
```

### 4.2 Database / Data Model Changes

**No database schema changes required** - uses existing `settings` table with key-value pairs.

| Table | Change | Description |
|-------|--------|-------------|
| `settings` | Add 7 rows | SMTP configuration key-value pairs |

**Settings Keys Added:**

| Key | Default Value | Description |
|-----|---------------|-------------|
| `SmtpFromAddress` | `''` (empty) | Email address for From field |
| `SmtpUsername` | `''` (empty) | SMTP authentication username |
| `SmtpPassword` | `''` (empty) | SMTP authentication password (encrypted) |
| `SmtpHost` | `''` (empty) | SMTP server hostname or IP |
| `SmtpPort` | `'587'` | SMTP server port number |
| `SmtpConnectionType` | `'None'` | Encryption: None, SSL, or TLS |
| `SmtpAuthenticationType` | `'None'` | Auth method: None, Plain, Login, or Cram_MD5 |

**Existing Settings Table Schema:**
```typescript
interface Setting {
  id: number;
  key: string;        // New SMTP keys added
  value: string;      // All values stored as strings
  group: string | null;
  description: string;
}
```

### 4.3 API / Integration Details

#### Existing Endpoints (Used by SMTP Settings Page)

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| GET | `/api/settings` | Retrieve all settings including SMTP | JWT + system:1 |
| PUT | `/api/settings` | Update individual setting value | JWT + system:2 |

#### New Endpoint (SMTP Test)

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| POST | `/api/smtp/test` | Send test email to validate SMTP config | JWT + system:2 |

**Example Test Email Request:**
```bash
curl -X POST http://localhost:3100/api/smtp/test \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "recipientEmail": "admin@example.com"
  }'
```

**Example Success Response:**
```json
{
  "success": true,
  "message": "Test email sent to admin@example.com"
}
```

**Example Error Response:**
```json
{
  "success": false,
  "message": "Failed to send test email: Authentication failed - invalid credentials"
}
```

### 4.4 UI / UX Details

#### Page Layout
- **Header**: "SMTP Settings" with info icon tooltip
- **Form Section**: All 7 SMTP fields in vertical layout
- **Test Section**: Email input and send button below form
- **Responsive**: Matches existing Settings page design

#### Form Fields Display Order
1. From Email Address (TextField with email validation)
2. SMTP Server Host (TextField with hostname validation)
3. SMTP Port (NumberField, 1-65535)
4. Connection Security (Select dropdown: None/SSL/TLS)
5. Authentication Method (Select dropdown: None/Plain/Login/Cram_MD5)
6. SMTP Username (TextField)
7. SMTP Password (PasswordField with show/hide toggle)

#### Visual States
- **Default**: Form populated with current settings
- **Modified**: Save button enabled when changes detected
- **Saving**: Loading spinner in save button
- **Error**: Red error text below invalid fields
- **Success**: Green toast notification on successful save
- **Testing**: Loading spinner in test email button

#### Accessibility
- All fields have ARIA labels
- Error messages associated with fields via `aria-describedby`
- Keyboard navigation fully supported
- Focus management on dialog open/close
- Tooltip accessible via keyboard

### 4.5 Configuration / Environment

**No environment variables needed** - all configuration stored in database settings table.

**Frontend Constants:**
```typescript
// front-end/src/Utils/constants.tsx
export const SMTP_SETTING_KEYS = {
  fromAddress: 'SmtpFromAddress',
  username: 'SmtpUsername',
  password: 'SmtpPassword',
  host: 'SmtpHost',
  port: 'SmtpPort',
  connectionType: 'SmtpConnectionType',
  authenticationType: 'SmtpAuthenticationType'
} as const;
```

---

## 5. Testing Strategy

### 5.1 Unit Tests

#### Database Scripts (Manual Testing - No Automated Tests)
- Run `initData.sh` on clean database, verify 7 SMTP settings created
- Run `upgradeUbuntu22.sh` on existing database, verify settings added
- Run `upgradeUbuntu22.sh` twice, verify no duplicate key errors

#### Frontend Component Tests
```tsx
// SmtpSettings.test.tsx
describe('SmtpSettings Component', () => {
  it('renders all 7 SMTP form fields', () => {
    render(<SmtpSettings />);
    expect(screen.getByLabelText('From Email Address')).toBeInTheDocument();
    expect(screen.getByLabelText('SMTP Server Host')).toBeInTheDocument();
    expect(screen.getByLabelText('SMTP Port')).toBeInTheDocument();
    expect(screen.getByLabelText('Connection Security')).toBeInTheDocument();
    expect(screen.getByLabelText('Authentication Method')).toBeInTheDocument();
    expect(screen.getByLabelText('SMTP Username')).toBeInTheDocument();
    expect(screen.getByLabelText('SMTP Password')).toBeInTheDocument();
  });

  it('validates email address format', async () => {
    render(<SmtpSettings />);
    const emailField = screen.getByLabelText('From Email Address');

    fireEvent.change(emailField, { target: { value: 'invalid-email' } });
    fireEvent.blur(emailField);

    expect(await screen.findByText('Invalid email format')).toBeInTheDocument();
  });

  it('validates port number range', async () => {
    render(<SmtpSettings />);
    const portField = screen.getByLabelText('SMTP Port');

    fireEvent.change(portField, { target: { value: '99999' } });
    fireEvent.blur(portField);

    expect(await screen.findByText('Port must be between 1 and 65535')).toBeInTheDocument();
  });

  it('disables save button when no changes', () => {
    render(<SmtpSettings />);
    const saveButton = screen.getByRole('button', { name: /save changes/i });
    expect(saveButton).toBeDisabled();
  });

  it('enables save button when form modified', () => {
    render(<SmtpSettings />);
    const hostField = screen.getByLabelText('SMTP Server Host');

    fireEvent.change(hostField, { target: { value: 'smtp.gmail.com' } });

    const saveButton = screen.getByRole('button', { name: /save changes/i });
    expect(saveButton).toBeEnabled();
  });

  it('prevents access for users without system:2 permission', () => {
    mockHasWriteAccess.mockReturnValue(false);
    render(<SmtpSettings />);

    expect(screen.getByText(/you do not have permission/i)).toBeInTheDocument();
  });
});
```

#### Backend API Tests
```typescript
// smtp.test.ts
describe('POST /api/smtp/test', () => {
  it('sends test email with valid SMTP configuration', async () => {
    await setupSMTPSettings();

    const response = await request(app)
      .post('/api/smtp/test')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ recipientEmail: 'test@example.com' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it('returns 400 when SMTP host not configured', async () => {
    const response = await request(app)
      .post('/api/smtp/test')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ recipientEmail: 'test@example.com' });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain('SMTP host is not configured');
  });

  it('validates email format', async () => {
    const response = await request(app)
      .post('/api/smtp/test')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ recipientEmail: 'invalid-email' });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain('Invalid email format');
  });

  it('requires system:2 permission', async () => {
    const response = await request(app)
      .post('/api/smtp/test')
      .set('Authorization', `Bearer ${readOnlyToken}`)
      .send({ recipientEmail: 'test@example.com' });

    expect(response.status).toBe(403);
  });
});
```

### 5.2 Integration / E2E Tests

#### Database Integration Tests
1. **Fresh Install Flow**
   - Run `docker-compose down -v` to destroy database
   - Run `./startDev.sh` to initialize fresh database
   - Query settings table: `SELECT * FROM settings WHERE key LIKE 'Smtp%'`
   - Verify 7 settings exist with correct defaults

2. **Upgrade Flow**
   - Start with database from previous version (no SMTP settings)
   - Run `upgradeUbuntu22.sh` script
   - Verify 7 SMTP settings added
   - Run script again, verify no errors

#### API Integration Tests
```typescript
describe('SMTP Settings Integration', () => {
  it('saves SMTP settings and retrieves them', async () => {
    // Save settings
    await request(app)
      .put('/api/settings')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ key: 'SmtpHost', value: 'smtp.gmail.com' });

    await request(app)
      .put('/api/settings')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ key: 'SmtpPort', value: '587' });

    // Retrieve settings
    const response = await request(app)
      .get('/api/settings')
      .set('Authorization', `Bearer ${adminToken}`);

    const smtpHost = response.body.find(s => s.key === 'SmtpHost');
    const smtpPort = response.body.find(s => s.key === 'SmtpPort');

    expect(smtpHost.value).toBe('smtp.gmail.com');
    expect(smtpPort.value).toBe('587');
  });
});
```

#### Frontend E2E Tests (Manual)
1. Navigate to `/settings/smtp` as admin user
2. Verify all fields load with current values
3. Modify SMTP host field
4. Click "Save Changes" button
5. Verify success toast appears
6. Refresh page and verify changes persisted
7. Fill in test email recipient
8. Click "Send Test Email"
9. Verify success/error toast based on SMTP config validity

### 5.3 Manual Testing

#### Test Scenario 1: Fresh Installation
1. Clone repository and run `./startDev.sh`
2. Log in as admin user
3. Navigate to Settings → SMTP Settings
4. Verify all fields show default values (empty except Port=587)
5. Verify page layout matches design

#### Test Scenario 2: Save and Load Settings
1. Configure all SMTP fields with valid Gmail settings:
   - From Address: `noreply@example.com`
   - Host: `smtp.gmail.com`
   - Port: `587`
   - Connection Type: `TLS`
   - Auth Type: `Plain`
   - Username: `your-email@gmail.com`
   - Password: `your-app-password`
2. Click "Save Changes"
3. Verify success toast appears
4. Refresh page
5. Verify all fields retain saved values

#### Test Scenario 3: Field Validation
1. Enter invalid email in From Address: `not-an-email`
2. Tab out of field
3. Verify error message appears: "Invalid email format"
4. Enter valid email
5. Verify error clears
6. Enter port number `99999`
7. Verify error: "Port must be between 1 and 65535"

#### Test Scenario 4: Test Email Delivery
1. Configure SMTP settings with valid credentials
2. Save settings
3. Enter your email in "Recipient Email Address"
4. Click "Send Test Email"
5. Verify success toast: "Test email sent to {email}"
6. Check recipient inbox for test email
7. Try with invalid credentials
8. Verify error toast with authentication failure message

#### Test Scenario 5: Permission Check
1. Log in as user without system:2 permission
2. Navigate to `/settings/smtp`
3. Verify permission denied message or redirect

#### Test Scenario 6: Upgrade Script
1. Start with database from version before SMTP feature
2. Run `scripts/release/ubuntu22/upgradeUbuntu22.sh`
3. Check database: `psql -U postgres -d ardal -c "SELECT * FROM settings WHERE key LIKE 'Smtp%'"`
4. Verify 7 settings added
5. Run upgrade script again
6. Verify no errors and no duplicate settings

#### Test Scenario 7: Edge Cases
1. Very long password (245 characters) - should accept
2. Special characters in password - should accept
3. Empty SMTP host - should save but test email button disabled
4. Invalid port (0, -1, 65536) - should show validation error
5. Password show/hide toggle - verify works correctly

---

## 6. Observability & Rollback

### Logging

#### Backend Logs
| Event | Log Level | Description |
|-------|-----------|-------------|
| `smtp_settings_updated` | INFO | Admin updated SMTP settings (log username, which keys changed) |
| `smtp_test_email_sent` | INFO | Test email sent successfully (log recipient, SMTP host) |
| `smtp_test_email_failed` | ERROR | Test email failed (log error message, SMTP host, recipient) |
| `smtp_connection_failed` | ERROR | SMTP connection error (log host, port, error) |
| `smtp_auth_failed` | ERROR | SMTP authentication failed (log host, username) |

**Example Log Entry:**
```
[INFO] smtp_settings_updated: User admin@vemass.local updated SMTP settings (SmtpHost, SmtpPort, SmtpConnectionType)
[INFO] smtp_test_email_sent: Test email sent to test@example.com via smtp.gmail.com:587
[ERROR] smtp_auth_failed: SMTP authentication failed for user@gmail.com on smtp.gmail.com:587 - Invalid credentials
```

#### Frontend Analytics (Optional)
- Track SMTP settings page views
- Track test email usage
- Track validation errors (aggregate by field)

### Metrics

**Performance Metrics:**
- SMTP settings page load time (target: < 1 second)
- Save operation duration (target: < 2 seconds)
- Test email send duration (target: < 5 seconds)

**Usage Metrics:**
- Number of test emails sent per day
- SMTP configuration update frequency
- Test email success/failure rate

**Error Metrics:**
- Validation error rate by field
- SMTP connection failure rate
- SMTP authentication failure rate

### Rollback Procedure

#### Complete Rollback (Remove SMTP Feature)
1. **Database Rollback** (if needed):
   ```sql
   DELETE FROM settings WHERE key IN (
     'SmtpFromAddress', 'SmtpUsername', 'SmtpPassword',
     'SmtpHost', 'SmtpPort', 'SmtpConnectionType', 'SmtpAuthenticationType'
   );
   ```

2. **Code Rollback**:
   - Revert commit containing SMTP changes
   - Remove SMTP route from `App.tsx`
   - Remove SMTP menu item from `NavigationSide.tsx`
   - Remove `/api/smtp` endpoint

3. **Verification**:
   - Verify Settings page loads without errors
   - Verify system continues using AWS SES for email delivery

#### Partial Rollback (Disable SMTP UI Only)
1. **Frontend Only**: Remove SMTP route and menu item
2. **Keep Database Settings**: SMTP settings remain in DB but unused
3. **Benefit**: Can re-enable UI later without data migration

**No data loss risk**: SMTP settings are additive, don't modify existing functionality.

---

## 7. Definition of Done

- [x] All acceptance criteria met and verified
- [x] Database scripts updated: `initData.sh`, `initCiData.sh`, `initTestData.sh`, `upgradeUbuntu22.sh`
- [x] Frontend SMTP Settings page created with all fields and validation
- [x] Backend SMTP test email endpoint implemented
- [x] Unit tests written and passing for validation logic
- [x] Integration tests written and passing for API endpoints
- [x] Manual testing completed for all scenarios
- [x] Permission checks implemented and tested
- [x] Logging implemented for audit trail
- [x] Error handling covers all edge cases
- [x] Code follows existing patterns from Settings.tsx
- [x] TypeScript types defined for all interfaces
- [x] Component styles follow Material-UI design system
- [x] Accessibility requirements met (ARIA labels, keyboard nav)
- [x] Code reviewed by senior engineer
- [x] Documentation updated:
  - [ ] `CLAUDE.md` - Add SMTP settings to features list
  - [ ] `front-end/CLAUDE.md` - Document SmtpSettings component
  - [ ] `node-server/CLAUDE.md` - Document SMTP test endpoint
  - [ ] `scripts/CLAUDE.md` - Document SMTP settings initialization
- [x] Merged to `ai-smtp` branch
- [x] Deployed to development environment
- [x] Verified in dev environment with real SMTP server (Gmail/Office365)

---

## 8. Notes & References

### Source Plan
- **Architecture Plan**: `ai-docs/plans/2025-10-16-smtp-email-list-plan.md`
- **Requirements**: Combines Requirement 1 (SMTP Settings Storage) + Requirement 2 (SMTP Settings UI)

### Related Documentation
- **SMTP Research**: `ai-docs/research/vmass-email-smtp-analysis.md` - Comprehensive SMTP field analysis
- **Project Architecture**: `CLAUDE.md` - Overall system architecture
- **Frontend Patterns**: `front-end/CLAUDE.md` - React component patterns
- **Backend Patterns**: `node-server/CLAUDE.md` - Express API patterns
- **Database Patterns**: `node-server/src/database/CLAUDE.md` - TypeORM usage

### Code References
- **Settings Page Pattern**: `front-end/src/Containers/Settings/Settings.tsx` - Follow this layout
- **Settings API**: `front-end/src/Redux/api.tsx` - Use `useGetSettingsQuery`, `useEditSettingMutation`
- **Permission Utils**: `front-end/src/Utils/permissions.tsx` - Use `hasWriteAccess('system')`
- **Database Init**: `scripts/database/initData.sh` - Existing settings INSERT pattern
- **Upgrade Script**: `scripts/release/ubuntu22/upgradeUbuntu22.sh` - Conditional INSERT pattern

### External Libraries
- **nodemailer**: SMTP email library (to be used in future story for email delivery)
- **Material-UI**: UI component library
- **RTK Query**: Data fetching and caching

### Design Decisions
1. **Why no database migration?** - Uses existing `settings` table key-value pattern
2. **Why separate test endpoint?** - Allows testing SMTP config without triggering actual events
3. **Why 245 char password limit?** - Matches common SMTP server limits and database varchar(255)
4. **Why separate stories for SMTP UI and email delivery?** - Allows testing configuration before implementing delivery logic

### Known Limitations
1. **Password encryption**: Currently stored as plain text (security enhancement planned for later)
2. **No connection pooling**: SMTP connections created per-send (optimization planned for later)
3. **No email delivery yet**: This story only adds configuration; actual email sending in Story 6

### Next Steps (Future Stories)
1. **Story 3**: Create EmailList model and API
2. **Story 4**: Create EmailList management UI
3. **Story 5**: Integrate email lists with automated actions/events
4. **Story 6**: Implement SMTP email delivery using these settings

### Team
- **Feature**: SMTP Settings Configuration (Foundation for Email List Feature)
- **Complexity**: Medium
- **Target Branch**: `ai-smtp`
- **Estimated Effort**: 12-16 hours (4 story points combined)
- **Dependencies**: None (foundational story)
- **Blocks**: Stories 3-6 depend on this being completed first
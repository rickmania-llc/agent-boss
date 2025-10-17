---
name: user-story-template
description: Template for creating detailed, implementation-ready user stories with full technical context, code examples, database schemas, API references, and testing guidance. Used by the user-story-creator agent to expand Story Seeds from architecture plans into comprehensive developer blueprints.
model: inherit
color: blue
---

# User Story Template (Detailed Developer Blueprint)

---
title: <short descriptive title>
source_plan: <architecture plan filename or none>
priority: <P1 | P2 | P3>
status: draft
plan_type: <lite | standard | deep>
assigned_to: <engineer or TBD>
estimated_hours: <optional>
---

## 1. Story Summary
> As a [user/system/admin], I need [feature or change], so that [benefit/outcome].

Briefly restate what's being built and why it matters.
If this story came from a plan, summarize the connection:

> Based on `<architecture-plan-filename>`, this story implements the [specific component or feature] defined in section [x].

---

## 2. Background / Context
Summarize relevant architectural or design rationale.
Reference ADRs, architecture plans, or diagrams that informed this story.

Example:
> Following ADR-002 (Scanner Library Decision), this implementation uses `react-native-camera-kit` for consistent performance across iOS and Android.
> This work aligns with the "Mobile Configuration Workflow" in the `2025-10-07-qr-scanner-architecture-plan.md` document.

---

## 3. Acceptance Criteria
All acceptance criteria must be clear, measurable, and testable.

- [ ] Feature behaves as described in the user scenario.
- [ ] Inputs, outputs, and edge cases conform to the specification.
- [ ] No regressions occur in existing modules.
- [ ] Observability, logs, and metrics are in place.
- [ ] QA and UX validations pass.

---

## 4. Technical Implementation Details
Provide detailed implementation steps, file modifications, and code examples required to deliver this feature.

### 4.1 Code Changes
List every file to create or modify, with a short explanation.

| File | Action | Description |
|------|--------|-------------|
| `src/components/QRScanner.tsx` | Create | React Native camera scanner component. |
| `src/hooks/useQRParser.ts` | Create | Hook for QR parsing and validation logic. |
| `src/screens/Onboarding.tsx` | Modify | Integrate QR scanner into onboarding flow. |

**Example Code Snippet**
```tsx
// src/hooks/useQRParser.ts
import { useState } from 'react';

export function useQRParser() {
  const [parsedUrl, setParsedUrl] = useState<string | null>(null);

  const onScan = (payload: string) => {
    try {
      const url = new URL(payload);
      if (!['http:', 'https:'].includes(url.protocol))
        throw new Error('Unsupported scheme');
      setParsedUrl(url.origin);
    } catch (err) {
      console.error('Invalid QR payload', err);
    }
  };

  return { parsedUrl, onScan };
}
```

### 4.2 Database / Data Model Changes
Describe schema, collection, or entity updates.

| Entity | Change | Description |
|--------|--------|-------------|
| `devices` | Add `qrConfigured: boolean` | Marks if setup was completed via QR scan. |
| `settings` | Add `scannerEnabled: boolean` | Toggles scanner availability. |

**Example Migration**
```sql
ALTER TABLE devices ADD COLUMN qr_configured BOOLEAN DEFAULT FALSE;
```

### 4.3 API / Integration Details
List any REST, GraphQL, or socket API endpoints affected or introduced.

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| POST | `/api/v3/device/configure` | Registers configuration from QR data. | Bearer Token |
| GET | `/api/v3/device/:id/config` | Retrieves device configuration. | Bearer Token |

**Example Request**
```bash
curl -X POST https://demo.valert.io/api/v3/device/configure \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"deviceId": "abc123", "configUrl": "https://valert.io"}'
```

### 4.4 UI / UX Details
Describe user interface requirements, states, and accessibility needs.

- Display camera frame overlay and instructional text.
- Show success checkmark animation on valid scan.
- Accessibility: label "Align QR code within frame."
- On failure: display toast "Invalid QR Code" and remain in scan state.

**Example**
```tsx
<View style={styles.overlay}>
  <Text style={styles.prompt}>Align QR code within frame</Text>
</View>
```

### 4.5 Configuration / Environment
List environment variables, flags, or settings related to the story.

| Variable | Purpose | Default |
|----------|---------|---------|
| `QR_SCANNER_ENABLED` | Feature flag to toggle scanner visibility | `false` |
| `SCAN_RETRY_DELAY` | Cooldown between scans (ms) | `2000` |

---

## 5. Testing Strategy
Describe how this story will be verified through automated and manual testing.

### 5.1 Unit Tests
- Test QR parsing and scheme validation logic.
- Validate that unsupported schemes throw expected errors.
- Ensure internal state updates correctly after successful scan.

**Example (Jest)**
```ts
it('rejects unsupported schemes', () => {
  expect(() => onScan('ftp://invalid.com')).toThrow();
});
```

### 5.2 Integration / E2E Tests
- Simulate valid and invalid QR scans.
- Verify backend API calls and state transitions.
- Confirm telemetry events (`qr_scan_success`, `qr_scan_invalid`) fire correctly.

**Example (Detox)**
```js
await element(by.id('qrScanner')).tap();
await expect(element(by.text('Align QR code within frame'))).toBeVisible();
```

### 5.3 Manual Testing
1. Open the app, enable the feature flag, and navigate to the scanner screen.
2. Test both valid and invalid codes.
3. Observe logs, telemetry, and UI transitions.
4. Ensure the device record updates appropriately in the backend.

---

## 6. Observability & Rollback

### Logging
| Event | Description |
|-------|-------------|
| `qr_scan_start` | User opened scanner screen |
| `qr_scan_success` | Valid code scanned |
| `qr_scan_invalid` | Invalid payload rejected |
| `qr_scan_cancel` | User exited scanner |

### Metrics
- Mean scan time
- Error rate by platform
- Permission denial frequency

### Rollback Procedure
1. Disable the `QR_SCANNER_ENABLED` flag to remove scanner access.
2. Verify app navigation and onboarding flows still work without QR scanning.
3. Clean up telemetry dashboards or temporary metrics as needed.

---

## 7. Definition of Done
- [ ] All acceptance criteria met.
- [ ] Unit, integration, and manual tests completed.
- [ ] Observability events verified in production-like environment.
- [ ] Linked to architecture plan and relevant ADRs.
- [ ] Code merged, reviewed, and deployed to staging.
- [ ] Rollback and feature flag toggling tested successfully.

---

## 8. Notes & References
- **Source Plan:** `<architecture-plan-filename>`
- **Related ADRs:** ADR-001 Camera Library, ADR-003 URL Validation
- **Design Mock:** `/ai-docs/designs/qr-scan-ui.png`
- **Dependencies:** `react-native-camera-kit`, `react-navigation@6+`
- **Feature Flag:** `QR_SCANNER_ENABLED`
- **Complexity:** Medium
- **Target Platforms:** iOS & Android
- **Team:** Mobile Engineering
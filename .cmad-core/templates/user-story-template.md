# User Story Development Specification

## Story Identifier
**Story ID:** [EPIC-XXX-YY]  
**Story Name:** [Exact name from implementation plan]  
**Epic:** [Parent epic name]  
**Priority:** [P0/P1/P2]  
**Weight:** <LEAVE BLANK>

---

## Story Objective
**User Story:**  
As a [user type]  
I need [functionality]  
So that [business value]

**Technical Objective:**  
*[1-2 sentences describing what code/functionality this story delivers]*

---

## Prerequisites

### Dependencies Completed
- [ ] [Story ID] - [What it provides that this story needs]
- [ ] Database migrations from Story XXX applied
- [ ] API endpoints from Story YYY available

### Environment Setup Required
```bash
# Environment variables needed
JWT_SECRET=your_secret_here
DATABASE_URL=postgresql://...
REDIS_URL=redis://...

# Services that must be running
- PostgreSQL 14+
- Redis 6+
- [Other services]
```

### Required Access
- [ ] Database write access to tables: [list tables]
- [ ] Read access to services: [list services]
- [ ] File system write access to: [list directories]

---

## Implementation Specifications

### Files to Create

#### `src/controllers/AuthController.js`
**Purpose:** Handle authentication HTTP requests  
**Exports:** `{ register, login, logout }`  
**Implementation:**
```javascript
// Skeleton structure
const bcrypt = require('bcrypt');
const { generateToken } = require('../services/TokenService');
const { User } = require('../models/User');
const { validateEmail, validatePassword } = require('../validators/auth');

async function register(req, res) {
  try {
    // 1. Extract email and password from req.body
    const { email, password } = req.body;
    
    // 2. Validate inputs
    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    if (!validatePassword(password)) {
      return res.status(400).json({ 
        error: 'Password must be 8+ chars with 1 uppercase and 1 number' 
      });
    }
    
    // 3. Check if user exists
    const existing = await User.findByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    
    // 4. Hash password (bcrypt, 10 rounds)
    const passwordHash = await bcrypt.hash(password, 10);
    
    // 5. Create user record
    const user = await User.create({
      email,
      password_hash: passwordHash,
      email_verified: false
    });
    
    // 6. Send verification email (async, don't await)
    EmailService.sendVerification(user.id, email);
    
    // 7. Return success response
    return res.status(201).json({
      userId: user.id,
      message: 'Verification email sent'
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function login(req, res) {
  // Implementation details...
}

module.exports = { register, login };
```

#### `src/models/User.js`
**Purpose:** User data model and database operations  
**Exports:** `User` class  
**Implementation:**
```javascript
// Database query methods needed
class User {
  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await db.query(query, [email]);
    return result.rows[0];
  }
  
  static async create({ email, password_hash, email_verified }) {
    const query = `
      INSERT INTO users (email, password_hash, email_verified)
      VALUES ($1, $2, $3)
      RETURNING id, email, created_at
    `;
    const result = await db.query(query, [email, password_hash, email_verified]);
    return result.rows[0];
  }
  
  static async updatePassword(userId, newPasswordHash) {
    // Implementation...
  }
}
```

### Files to Modify

#### `src/routes/auth.js`
**Current State:** File exists with basic Express router setup  
**Modifications Required:**
```javascript
// ADD these routes to existing router
router.post('/register', 
  rateLimiter({ max: 5, windowMs: 60000 }), // 5 attempts per minute
  AuthController.register
);

router.post('/login',
  rateLimiter({ max: 5, windowMs: 60000 }),
  AuthController.login  
);

// Existing code remains unchanged
```

#### `src/middleware/validators.js`
**Current State:** Basic validation middleware exists  
**Add These Functions:**
```javascript
function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

function validatePassword(password) {
  // Min 8 chars, 1 uppercase, 1 number
  const regex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
  return regex.test(password);
}
```

### Database Migrations

#### `migrations/002_add_auth_fields.sql`
```sql
-- Run if not already applied from previous story
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
```

---

## API Contracts

### Endpoint: `POST /auth/register`

**Request:**
```http
POST /auth/register HTTP/1.1
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Success Response (201):**
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Verification email sent"
}
```

**Error Responses:**
```javascript
// 400 - Validation Error
{
  "error": "Invalid email format"
}
// OR
{
  "error": "Password must be 8+ chars with 1 uppercase and 1 number"
}

// 409 - Conflict
{
  "error": "Email already registered"
}

// 429 - Rate Limited
{
  "error": "Too many attempts. Try again later."
}

// 500 - Server Error
{
  "error": "Internal server error"
}
```

### Endpoint: `POST /auth/login`

**Request:**
```http
POST /auth/login HTTP/1.1
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Success Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 86400,
  "userId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Error Responses:**
```javascript
// 401 - Authentication Failed (same for all auth failures)
{
  "error": "Invalid email or password"
}

// 403 - Email Not Verified
{
  "error": "Please verify your email before logging in"
}
```

---

## Business Logic Requirements

### Password Hashing
- Use bcrypt with 10 salt rounds
- Never store plain text passwords
- Never log password values

### Email Validation
- Must be valid email format
- Case-insensitive comparison
- Trim whitespace before validation

### Rate Limiting
- 5 attempts per minute per IP
- Return 429 status when exceeded
- Log repeated failures for security monitoring

### Session Management
- JWT tokens expire in 24 hours
- Include userId and email in token payload
- Use HS256 algorithm for signing

---

## Error Handling

### Expected Errors to Handle
| Scenario | Response Code | Response Body | Log Level |
|----------|--------------|---------------|-----------|
| Invalid email format | 400 | `{error: "Invalid email format"}` | INFO |
| Weak password | 400 | `{error: "Password requirements..."}` | INFO |
| Duplicate email | 409 | `{error: "Email already registered"}` | INFO |
| Login failed | 401 | `{error: "Invalid email or password"}` | WARN |
| Database down | 500 | `{error: "Internal server error"}` | ERROR |
| Email service down | 201 | Success (queue for retry) | WARN |

### Logging Requirements
```javascript
// Log format for all authentication events
{
  timestamp: new Date().toISOString(),
  event: 'auth.register|auth.login|auth.failed',
  userId: user?.id,
  email: email, // hash this in production logs
  ip: req.ip,
  userAgent: req.headers['user-agent'],
  success: boolean,
  errorReason: string // if failed
}
```

---

## Test Implementation

### Unit Tests Required

#### `test/controllers/AuthController.test.js`
```javascript
describe('AuthController', () => {
  describe('register', () => {
    it('should create user with valid inputs', async () => {
      // Test implementation
    });
    
    it('should return 400 for invalid email', async () => {
      // Test implementation  
    });
    
    it('should return 409 for duplicate email', async () => {
      // Test implementation
    });
    
    it('should hash password before storing', async () => {
      // Verify bcrypt.hash was called
    });
  });
});
```

### Integration Tests Required

#### `test/integration/auth.test.js`
```javascript
describe('Auth Endpoints', () => {
  it('POST /auth/register - full flow', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({
        email: 'test@example.com',
        password: 'TestPass123'
      });
      
    expect(res.status).toBe(201);
    expect(res.body.userId).toBeDefined();
    
    // Verify user in database
    const user = await User.findByEmail('test@example.com');
    expect(user).toBeDefined();
    expect(user.password_hash).not.toBe('TestPass123');
  });
});
```

### Test Data Required
```javascript
// Test fixtures
const testUsers = [
  {
    email: 'existing@example.com',
    password: 'ExistingPass123',
    password_hash: '$2b$10$...' // bcrypt hash
  },
  {
    email: 'verified@example.com',
    password: 'VerifiedPass123',
    email_verified: true
  }
];
```

---

## Acceptance Criteria Checklist

### Functional Requirements
- [ ] User can register with email and password
- [ ] Duplicate emails are rejected with 409
- [ ] Passwords are hashed with bcrypt (10 rounds)
- [ ] Registration sends verification email
- [ ] Login returns JWT token valid for 24 hours
- [ ] Login fails return generic error message
- [ ] Rate limiting prevents brute force (5/minute)

### Technical Requirements
- [ ] All endpoints return correct HTTP status codes
- [ ] Responses match specified JSON structure
- [ ] Database transactions are atomic
- [ ] Errors are logged appropriately
- [ ] No sensitive data in logs
- [ ] Code passes linting rules
- [ ] Test coverage > 80%

### Performance Requirements
- [ ] Registration completes in < 500ms
- [ ] Login completes in < 200ms
- [ ] Database queries use indexes
- [ ] No N+1 query problems

---

## Development Checklist

### Before Starting
- [ ] Pull latest code from main branch
- [ ] Install dependencies: `npm install`
- [ ] Run existing tests: `npm test`
- [ ] Setup local database with migrations
- [ ] Configure environment variables

### During Development
- [ ] Create feature branch: `feature/[story-id]-description`
- [ ] Implement code following specifications
- [ ] Write unit tests alongside code
- [ ] Run tests frequently
- [ ] Commit with meaningful messages

### Before Completion
- [ ] All acceptance criteria met
- [ ] All tests passing
- [ ] Code reviewed (self-review first)
- [ ] API documentation updated
- [ ] No console.log statements
- [ ] Error handling complete
- [ ] Performance requirements met

### Definition of Done
- [ ] Code merged to main branch
- [ ] Tests passing in CI/CD
- [ ] Deployed to staging environment
- [ ] Smoke tests pass on staging
- [ ] Documentation updated
- [ ] No critical security issues

---

## Notes & Clarifications

### Security Considerations
- Never return whether email exists in error messages
- Use constant-time comparison for password checks
- Implement CAPTCHA if registration abuse detected
- Monitor for credential stuffing patterns

### Future Enhancements (Not in This Story)
- OAuth integration
- Two-factor authentication
- Password strength meter
- Account lockout after failed attempts

### Dependencies on Other Teams
- Email Service team: Verification email template ready
- DevOps: Redis instance provisioned
- Security: JWT secret configured in vault

---

**Story Generated:** [Date]  
**Scrum Master:** [Agent ID]  
**Source:** [Implementation Plan v1.0]  
**Sprint:** [Sprint Number]
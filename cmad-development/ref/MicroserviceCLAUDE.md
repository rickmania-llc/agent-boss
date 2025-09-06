# Node Server - VEMASS District Server Core Backend

## Directory Purpose
The Node Server is the primary backend service for the VEMASS District Server, providing the REST API, real-time communication, database operations, and integration with campus emergency notification devices. It serves as the central hub coordinating between the React frontend, campus VE6025 devices, external notification systems, and other microservices.

## Architecture Notes

### Design Patterns
- **MVC Architecture**: Controllers handle business logic, models define data structure, API routes manage HTTP endpoints
- **Message-Driven Communication**: Integrates MQTT, RabbitMQ, and Socket.io for different communication needs
- **Repository Pattern**: Services layer abstracts database operations from controllers
- **Plugin Architecture**: Extensible SSO system supporting multiple authentication providers
- **Event-Driven Automation**: Status changes trigger configurable automated responses

### Technology Stack
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with TypeORM for object-relational mapping
- **Real-time**: Socket.io for WebSocket communication
- **Message Queues**: RabbitMQ for async processing, MQTT for device monitoring
- **Authentication**: JWT tokens with pluggable SSO (SAML, LDAP, Okta)
- **Testing**: Jest with TypeScript support

### Key Integration Points
- **Frontend**: REST API and Socket.io real-time updates
- **Campus Devices**: TCP connections and MQTT monitoring
- **API Worker**: RabbitMQ messages for async operations
- **Playlist Server**: Direct API calls for playlist management
- **VAlert System**: External emergency notification platform
- **License Server**: Feature validation and compliance

## Documentation Network

This directory contains comprehensive documentation organized by functional areas. Each subdirectory has its own CLAUDE.md file providing detailed information:

### Core Documentation
- **[src/api/CLAUDE.md](src/api/CLAUDE.md)**: REST API routes, authentication patterns, endpoint documentation
- **[src/database/CLAUDE.md](src/database/CLAUDE.md)**: Database architecture, three-tier design, transaction management
- **[src/network/CLAUDE.md](src/network/CLAUDE.md)**: Network protocols (MQTT, RabbitMQ, Socket.io, TCP), message flows
- **[src/sso/CLAUDE.md](src/sso/CLAUDE.md)**: SSO architecture, plugin system, authentication providers
- **[src/utils/CLAUDE.md](src/utils/CLAUDE.md)**: Utility functions, authentication, licensing, common helpers
- **[src/migrations/CLAUDE.md](src/migrations/CLAUDE.md)**: Migration strategy, schema evolution, best practices

### Database Layer Documentation
- **[src/database/models/CLAUDE.md](src/database/models/CLAUDE.md)**: Entity definitions, relationships, TypeORM patterns
- **[src/database/controllers/CLAUDE.md](src/database/controllers/CLAUDE.md)**: Business logic, response patterns, integration
- **[src/database/services/CLAUDE.md](src/database/services/CLAUDE.md)**: Data access layer, query optimization, repository pattern

### Quick Navigation Guide
1. **New to the codebase?** Start with this file, then explore [src/database/CLAUDE.md](src/database/CLAUDE.md)
2. **Working on API endpoints?** See [src/api/CLAUDE.md](src/api/CLAUDE.md)
3. **Database changes?** Check [src/database/models/CLAUDE.md](src/database/models/CLAUDE.md) and [src/migrations/CLAUDE.md](src/migrations/CLAUDE.md)
4. **Network communication?** Refer to [src/network/CLAUDE.md](src/network/CLAUDE.md)
5. **Authentication/SSO?** Read [src/sso/CLAUDE.md](src/sso/CLAUDE.md) and [src/utils/CLAUDE.md](src/utils/CLAUDE.md)

## Files Overview

### Entry Points

#### server.ts
**Purpose**: Main application entry point that initializes all services
**Key Functions**:
- Initializes Express app with middleware
- Establishes database connection
- Starts all network handlers (MQTT, RabbitMQ, Socket.io, TCP)
- Configures graceful shutdown
- Sets up 4GB heap allocation
**Usage**: Started via `yarn start` or systemd service

#### app.ts
**Purpose**: Express application configuration
**Key Functions**:
- `configureApp()`: Sets up middleware, CORS, body parsing
- Mounts all API routes under `/api`
- Configures error handling
- Sets up static file serving
**Usage**: Imported by server.ts and tests

### API Routes (`src/api/`)

#### users/index.ts
**Purpose**: User authentication and management endpoints
**Endpoints**:
- `POST /login`: User authentication with JWT generation
- `GET /users`: List all users (admin only)
- `POST /users`: Create new user
- `PUT /users/:id`: Update user details
- `DELETE /users/:id`: Remove user
- `POST /updatePwd`: Password change
**Security**: Role-based access control, password policies

#### campus/index.ts
**Purpose**: Campus device management and control
**Endpoints**:
- `GET /campus`: List campuses with filtering
- `POST /campus`: Add new campus
- `PUT /campus/:id`: Update campus details
- `DELETE /campus/:id`: Remove campus
- `POST /campus/alert`: Trigger campus alerts
- `POST /campus/qp`: Quick page functionality
**Features**: Batch operations, geospatial queries, real-time status

#### event/index.ts
**Purpose**: Event automation and triggered actions
**Endpoints**:
- `GET /event`: List configured events
- `POST /event`: Create automation rule
- `PUT /event/:id`: Update event configuration
- `POST /event/trigger`: Manual event triggering
**Features**: Campus status triggers, playlist activation, TCP commands

#### capMsg/index.ts & activeCapMsg/index.ts
**Purpose**: CAP (Common Alerting Protocol) message management
**Endpoints**:
- CAP message templates CRUD
- Active CAP broadcasting
- Multi-campus alert distribution
**Features**: Template variables, scheduled alerts, batch sending

### Database Layer

#### Models (`src/database/models/`)

**Core Entities**:
- `campus.ts`: Campus locations with device connection info
- `user.ts`: User accounts with roles and permissions
- `capMsg.ts`: CAP message templates
- `event.ts`: Automation rules and triggers
- `playlist.ts`: Audio playlist configurations
- `deviceInfo.ts`: Hardware health monitoring

**Supporting Entities**:
- `role.ts`: User role definitions
- `permission.ts`: Fine-grained access control
- `notification.ts`: System notifications
- `history.ts`: Audit log entries
- `settings.ts`: System configuration

**Relationships**:
- Many-to-many: Users ↔ Roles, Campuses ↔ Tags
- One-to-many: District → Campuses, User → Notifications
- Polymorphic: History entries reference multiple entity types

#### Controllers (`src/database/controllers/`)
Each controller provides CRUD operations and business logic:
- Input validation
- Database transactions
- Related entity management
- Audit logging
- Cache invalidation

#### Services (`src/database/services/`)
Services abstract TypeORM operations:
- Query building
- Relationship loading
- Pagination
- Filtering and sorting
- Performance optimization

### Network Communication (`src/network/`)

#### mqttHandler.ts
**Purpose**: MQTT broker integration for device monitoring
**Key Functions**:
- `startMqttClient()`: Connects to MQTT broker
- Subscribes to device status topics
- Updates campus connection status
- Handles device health metrics
**Topics**: `valcom/+/status`, `valcom/+/health`

#### rabbitHandler.ts
**Purpose**: RabbitMQ message queue processing
**Queues**:
- `send-playlist`: Playlist updates
- `send-notification`: User notifications
- `get-playlist-worker`: Playlist sync requests
- `event-triggered-*`: Event automation
**Features**: Batch processing, connection resilience

#### socketHandler.ts
**Purpose**: Socket.io server for real-time frontend updates
**Events**:
- `notification`: System notifications
- `campus-status`: Connection changes
- `active-cap`: Alert broadcasts
- `playlist-update`: Playlist changes
**Features**: JWT authentication, room-based broadcasting

#### tcpHandler.ts
**Purpose**: Direct TCP communication with campus panels
**Functions**:
- `sendTcpMessage()`: Send commands to devices
- `createTcpServer()`: Listen for device connections
- Protocol implementation for legacy devices
**Usage**: Quick page, direct panel control

#### valertSocketHandler.ts
**Purpose**: Integration with external VAlert system
**Features**:
- Persistent TCP connection
- Alert forwarding
- Status synchronization
- Automatic reconnection

### Authentication & SSO (`src/sso/`)

#### ssoHandler.ts
**Purpose**: Unified SSO interface
**Functions**:
- `authenticateUser()`: Delegates to configured provider
- Plugin loading and initialization
- Fallback to local authentication

#### Plugins:
- `saml.plugin.ts`: SAML 2.0 authentication
- `ldaps.plugin.ts`: LDAP/Active Directory
- `okta.plugin.ts`: Okta integration
Each plugin implements standard interface for extensibility

### Utilities (`src/utils/`)

#### auth/license.ts
**Purpose**: License validation and feature enforcement
**Functions**:
- `checkLicense()`: Validates license file
- `enforceFeatures()`: Runtime feature flags
- `calculateLimits()`: User/campus limits
**Features**: Encryption, expiration, feature toggles

#### auth/userAuth.ts
**Purpose**: JWT token management and validation
**Functions**:
- `generateToken()`: Create JWT with user data
- `validateToken()`: Verify and decode tokens
- `refreshToken()`: Token renewal
**Security**: RS256 signing, expiration, refresh tokens

#### email/sesEmailHandler.ts
**Purpose**: Email notification delivery via AWS SES
**Functions**:
- `sendEmail()`: Send notifications
- `sendBatchEmails()`: Bulk sending
- Template rendering support

### Migrations (`src/migrations/`)
**Purpose**: Database schema evolution tracking
**Key Migrations**:
- Initial schema (2021)
- CAP messaging system
- Event automation
- Playlist management
- Permission system
- API tokens
**Usage**: Automatically run on startup

## Key Dependencies

### Core Framework
- **express**: Web application framework
- **typeorm**: Object-relational mapping
- **pg**: PostgreSQL client
- **typescript**: Type safety

### Communication
- **socket.io**: WebSocket server
- **amqplib**: RabbitMQ client
- **mqtt**: MQTT protocol client
- **net**: TCP socket communication

### Security
- **jsonwebtoken**: JWT token handling
- **bcryptjs**: Password hashing
- **passport**: Authentication middleware
- **saml2-js**: SAML authentication

### Utilities
- **axios**: HTTP client
- **nodemailer**: Email sending
- **winston**: Logging framework
- **dotenv**: Environment configuration

## Common Workflows

### Authentication Flow
1. User submits credentials to `/api/user/login`
2. SSO handler checks configured provider
3. Successful auth generates JWT token
4. Token includes user roles and permissions
5. Frontend stores token for subsequent requests

### Campus Alert Flow
1. Frontend posts to `/api/campus/alert`
2. Controller validates permissions and campus access
3. Creates active CAP message record
4. Publishes to RabbitMQ for API worker
5. Sends Socket.io update to frontend
6. API worker delivers alert to campus devices

### Device Monitoring Flow
1. Campus devices publish MQTT status messages
2. MQTT handler updates connection status
3. Changes trigger Socket.io broadcasts
4. Frontend updates dashboard in real-time
5. Disconnections create notifications

### Event Automation Flow
1. Campus status change detected
2. Event handler queries matching rules
3. Matching events trigger configured actions
4. Actions sent to RabbitMQ queues
5. API worker executes device commands

## Testing Approach

### Test Structure
- Controllers: Business logic and integration tests
- Models: Entity validation tests
- API routes: HTTP endpoint tests
- Services: Database operation tests

### Test Utilities
- Mock database connections
- Fixture data for consistent tests
- JWT token generation helpers
- Socket.io client mocking

## Performance/Security Considerations

### Performance
- Connection pooling for database
- Batch processing for RabbitMQ
- Caching for frequently accessed data
- Asynchronous operations throughout
- 4GB heap allocation for Node.js

### Security
- JWT tokens with expiration
- Role-based access control
- Input validation on all endpoints
- SQL injection prevention via TypeORM
- HTTPS required for production
- Audit logging for sensitive operations
- License enforcement for features
- Rate limiting on authentication

### Scalability
- Stateless design enables horizontal scaling
- RabbitMQ for distributed processing
- Database connection pooling
- Efficient query optimization
- Support for high-availability deployments

## Configuration

### Environment Variables
- `DATABASE_*`: PostgreSQL connection
- `JWT_SECRET`: Token signing key
- `RABBITMQ_URL`: Message queue connection
- `MQTT_*`: MQTT broker settings
- `SSO_*`: Authentication provider config
- `LICENSE_*`: License server settings

### Feature Flags
Controlled via license file:
- Campus limits
- User limits
- VAlert integration
- Multi-district support
- API access
- Advanced automation

## Deployment Considerations

### Production Requirements
- PostgreSQL 12+
- RabbitMQ 3.8+
- MQTT broker (Mosquitto)
- Node.js 16+
- SSL certificates
- License file

### Monitoring
- Health check endpoint
- Prometheus metrics
- Winston logging
- Error tracking
- Performance monitoring

### Maintenance
- Database migrations on startup
- Automatic reconnection for all services
- Graceful shutdown handling
- Log rotation
- Backup considerations
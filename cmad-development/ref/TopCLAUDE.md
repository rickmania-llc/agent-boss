# VEMASS District Server - Project Overview

## AI Development Strategy

This project follows a comprehensive AI-driven software engineering strategy using Claude Code and AI tools. All development should adhere to the principles and processes outlined in this document.

## Development Rules & Standards

### Package Management
- **MANDATORY**: Always use `yarn` for package management, never `npm`
- Install packages: `yarn add [package-name]`
- Install dev dependencies: `yarn add -D [package-name]`
- Install dependencies: `yarn install`
- Run scripts: `yarn [script-name]`

### Code Standards
- Follow TypeScript best practices for all new code
- Use functional components with hooks in React
- Implement proper error handling with try-catch blocks
- Write meaningful commit messages referencing issue numbers
- Maintain consistent code formatting (use ESLint)

### Git & Version Control Integration
- Branch naming convention: `feature/[issue-number]-[brief-description]`
- Commit messages should be descriptive and reference issue numbers
- Always create pull requests for code review
- Main branch: `main`
- Development branch: `development`

## AI Development Workflow

### Issue Management Process
1. **Epic/Master Issue Planning**: Use Claude Chat or Claude Code to break down large features
2. **Issue Creation**: Use Claude Code in planning mode to create detailed issues
3. **Implementation**: Claude Code executes issues systematically
4. **Review**: Human engineer reviews and integrates changes

### Documentation Requirements
- **CRITICAL**: Every issue MUST update relevant `CLAUDE.md` files
- All new functions, files, and architectural changes must be documented
- Documentation updates are mandatory for issue completion
- Follow the `ai-issue-template.md` format for all issues

## Project Architecture

### System Overview
VEMASS (Valcom Emergency Mass Notification System) is a distributed emergency notification platform that enables administrators to send alerts to multiple campus locations through various communication channels.

### Service Architecture
```
┌─────────────────┐     ┌──────────────┐     ┌──────────────┐
│   Front-End     │────▶│ Node-Server  │────▶│ API-Worker   │
│   (React SPA)   │     │ (Core API)   │     │ (Async Tasks)│
└─────────────────┘     └──────────────┘     └──────────────┘
         │                      │                     │
         │                      ▼                     ▼
         │              ┌──────────────┐     ┌──────────────┐
         └─────────────▶│   RabbitMQ   │     │Campus Devices│
                        │              │     │  (VE6025)    │
                        └──────────────┘     └──────────────┘
                                │
                        ┌───────┴────────┐
                        ▼                ▼
                ┌──────────────┐ ┌──────────────┐
                │Playlist Server│ │VIP-102B Server│
                │              │ │              │
                └──────────────┘ └──────────────┘
```

### Directory Structure
```
ardal-ds/
├── CLAUDE.md (this file)
├── api-worker/          # Async message processing service
│   └── CLAUDE.md
├── front-end/           # React web application
│   └── CLAUDE.md
├── node-server/         # Main backend API server
│   └── CLAUDE.md
├── playlist-server/     # Playlist synchronization service
│   └── CLAUDE.md
├── vip-102b-server/     # Network discovery service
│   └── CLAUDE.md
├── scripts/             # System administration scripts
│   └── CLAUDE.md
├── docs/                # Technical documentation
│   └── CLAUDE.md
├── csv-files/           # Sample data files
├── deps/                # External dependencies
└── upgrade-server/      # System upgrade service
```

### Core Services

#### 1. Frontend (React SPA)
- **Technology**: React 17, TypeScript, Redux Toolkit, Material-UI
- **Purpose**: Web interface for system administration
- **Key Features**: Campus management, alert broadcasting, user management, real-time updates

#### 2. Node Server (Core Backend)
- **Technology**: Express.js, TypeScript, TypeORM, Socket.io
- **Purpose**: Main API server and business logic
- **Key Features**: REST API, WebSocket communication, database operations, authentication

#### 3. API Worker
- **Technology**: Node.js, RabbitMQ, PostgreSQL
- **Purpose**: Asynchronous task processing
- **Key Features**: Playlist sync, event processing, campus communication

#### 4. Playlist Server
- **Technology**: Node.js, PostgreSQL, RabbitMQ
- **Purpose**: Automated playlist synchronization
- **Key Features**: Timer-based sync, state management

#### 5. VIP-102B Server
- **Technology**: Node.js, UDP sockets
- **Purpose**: Network discovery for configuration tools
- **Key Features**: UDP multicast, device announcement

### Communication Patterns
- **REST API**: Frontend ↔ Node Server
- **WebSocket**: Real-time updates via Socket.io
- **Message Queue**: RabbitMQ for async processing
- **MQTT**: Device status monitoring
- **TCP/UDP**: Direct device communication

## Implementation Guidelines for Claude Code

### Pre-Implementation Checklist
1. Read relevant directory-level `CLAUDE.md` files for context
2. Review issue requirements and acceptance criteria
3. Identify which `CLAUDE.md` files will need updates
4. Create appropriate feature branch

### During Implementation
1. Follow established patterns from existing code
2. Implement all requirements systematically
3. **Update `CLAUDE.md` files** with new functions, files, and changes
4. Make logical, well-documented commits
5. Include documentation updates in commits

### Post-Implementation
1. Verify all acceptance criteria are met
2. Ensure `CLAUDE.md` files are accurately updated
3. Run lint and typecheck commands
4. Create pull request with clear description
5. Reference original issue in pull request

## Technology Stack

### Core Technologies
- **Runtime**: Node.js 16+ with TypeScript
- **Frontend**: React 17, Redux Toolkit, Material-UI
- **Database**: PostgreSQL 12 with TypeORM
- **Message Queue**: RabbitMQ
- **Real-time**: Socket.io, MQTT (Mosquitto)
- **Web Server**: Nginx (production)
- **Process Manager**: PM2 (production)

### Key Dependencies
- Express.js for REST API
- JWT for authentication
- Axios for HTTP requests
- Leaflet for mapping
- Bcrypt for password hashing

## Database Schema

### Core Entities
- **Campus**: Physical locations with devices
- **User**: System users with roles
- **Playlist**: Audio playlists for alerts
- **CapMsg**: CAP message templates
- **Event**: Automation rules
- **Notification**: System notifications
- **DeviceInfo**: Hardware health data

### Relationships
- Users → Roles (many-to-many)
- Campus → Tags (many-to-many)
- Campus → Playlists (one-to-many)
- Events → Campus/Playlists (triggers)

## Security Architecture

### Authentication
- JWT-based authentication
- Pluggable SSO (SAML, LDAP, Okta)
- Role-based access control
- Campus-level permissions

### Security Features
- HTTPS/SSL for all communications
- API token management
- License-based feature control
- Audit logging
- Input validation

### Known Security Concerns
- Database credentials in code (being addressed)
- HTTPS certificate validation disabled in some services
- JWT secret hardcoded for offline licenses

## Integration Points

### External Services
- **VAlert System**: External emergency notification
- **AWS SES**: Email delivery
- **License Server**: Feature validation
- **Campus Devices**: VE6025 hardware

### Internal APIs
- REST API on port 3100
- Socket.io on same port
- RabbitMQ on port 5672
- MQTT on port 1883
- PostgreSQL on port 5432

## Development Environment Setup

### Required Tools
- Node.js 16+ (use nvm)
- Yarn package manager
- PostgreSQL 12 with PostGIS
- RabbitMQ server
- Git
- VS Code (recommended)

### Environment Configuration
1. Clone repository
2. Copy `.env.example` to `.env`
3. Install dependencies: `yarn install` in each service
4. Initialize database: `scripts/database/initData.sh`
5. Start services: `./startDev.sh`

## Deployment

### Production Requirements
- Ubuntu 20.04 or 22.04 LTS
- 4GB+ RAM
- 20GB+ disk space
- Static IP address
- SSL certificates

### Deployment Process
1. Use scripts in `scripts/release/`
2. Follow upgrade procedures
3. Validate license
4. Configure network settings
5. Set up SSL certificates

## Quality Standards

### Code Quality
- TypeScript for type safety
- ESLint for code standards
- Comprehensive error handling
- Meaningful variable names
- DRY principles

### Documentation Quality
- Keep `CLAUDE.md` files current
- Document all public APIs
- Include usage examples
- Explain complex logic
- Update on changes

### Testing Requirements
- Unit tests for business logic
- Integration tests for APIs
- Component tests for React
- E2E tests for critical paths

## Performance Considerations

### Optimization Areas
- Database query efficiency
- RabbitMQ message batching
- Frontend bundle size
- Real-time update throttling
- Connection pooling

### Monitoring
- Service health checks
- Database performance
- Message queue metrics
- API response times
- Error rates

## Maintenance & Evolution

### Regular Updates
- Update `CLAUDE.md` files when architecture changes
- Review and update dependencies
- Apply security patches
- Database migrations
- Performance tuning

### Process Improvement
- Regular retrospectives
- Update templates based on experience
- Refine AI workflows
- Document lessons learned

## License System

### Feature Control
The system uses a license server to control feature access:
- **Base**: Core functionality only
- **Full**: All features enabled
- **Modular**: Individual feature flags (alerts, status, maintenance, events)

### License Validation
- Online validation with AWS-hosted server
- Offline fallback with local cache
- JWT-based offline licenses
- Feature enforcement throughout codebase

## Known Issues and Limitations

### Current Limitations
1. Single-instance playlist server (no HA)
2. Hardcoded credentials in some services
3. Limited horizontal scaling support
4. No built-in backup automation

### Technical Debt
1. Migrate all credentials to environment variables
2. Implement comprehensive test coverage
3. Add structured logging across services
4. Improve error messages and handling

## Getting Help

### Resources
- Review service-specific CLAUDE.md files
- Check docs/ directory for detailed documentation
- Use AI development process for new features
- Consult issue templates for standards

### Common Commands
```bash
# Development
./startDev.sh              # Start all services
./scripts/dev/sync-dev.sh  # Sync and restart

# Database
scripts/database/initData.sh       # Initialize
scripts/database/resetData.sh      # Reset

# Testing
yarn test                  # Run tests
yarn lint                  # Check code style
```

---

**Remember**: This documentation-driven approach ensures consistent, scalable development with AI assistance. Every change to the codebase should be reflected in the appropriate documentation to maintain the effectiveness of our AI development strategy.
# Backend Architecture

## Overview

The Agent Boss backend is a Node.js/Express application built with TypeScript that manages multiple Claude Code instances as local processes. It provides RESTful APIs and WebSocket support for real-time communication.

## Project Structure

```
backend/
├── src/
│   ├── server.ts              # Application entry point
│   ├── app.ts                 # Express app configuration
│   │
│   ├── api/                   # API route definitions
│   ├── database/              # Database layer
│   │   ├── models/           # TypeORM entity models
│   │   ├── controllers/      # Business logic layer
│   │   └── services/         # Data access layer
│   │
│   ├── network/               # Network handling
│   ├── utils/                 # Utility functions
│   │   ├── app/              # Application utilities
│   │   │   ├── dbConnection.ts   # Database connection
│   │   │   └── logHandler.ts     # Winston logger
│   │   └── middleware/       # Express middleware
│   │       ├── errorHandler.ts   # Error handling
│   │       └── logging.ts        # Request logging
│   │
│   └── types/                 # TypeScript type definitions
│
├── .env.example               # Environment template
├── nodemon.json              # Development server config
├── tsconfig.json             # TypeScript configuration
└── package.json              # Dependencies and scripts
```

## Key Components

### LogHandler (src/utils/app/logHandler.ts)

Centralized logging using Winston:
- Context-based logging
- Multiple transports (console + file)
- Configurable log levels
- Structured log format with timestamps

Usage:
```typescript
const logger = new LogHandler('ContextName');
logger.info('Message');
logger.error('Error message', error);
```

### Database Connection (src/utils/app/dbConnection.ts)

TypeORM database management:
- `initializeDatabase()` - Initializes TypeORM connection
- `getDataSource()` - Returns active DataSource instance
- Supports SQLite (development) and PostgreSQL (production)

### Error Handling (src/utils/middleware/errorHandler.ts)

Centralized error handling:
- `AppError` class for operational errors
- `notFoundMiddleware` for 404 routes
- `errorMiddleware` for global error handling
- Development vs production error responses

### Express App (src/app.ts)

Core Express configuration:
- Security headers (Helmet)
- CORS configuration
- Body parsing middleware
- Request logging
- Health check endpoint
- Error handling setup

## Development Workflow

### Running the Server

```bash
# Development mode with hot reload
yarn workspace backend dev

# Build TypeScript
yarn workspace backend build

# Production mode
yarn workspace backend start
```

### Environment Configuration

Copy `.env.example` to `.env` and configure:
- `PORT` - Server port (default: 3001)
- `DATABASE_URL` - Database connection string
- `JWT_SECRET` - Secret for JWT tokens
- `LOG_LEVEL` - Winston log level
- Git provider settings (GitHub/GitLab)

### API Structure

Routes follow RESTful conventions:
```
GET    /api/work-items        # List all work items
POST   /api/work-items        # Create new work item
GET    /api/work-items/:id    # Get specific work item
PUT    /api/work-items/:id    # Update work item
DELETE /api/work-items/:id    # Delete work item
```

### Database Layer Architecture

Three-layer architecture:
1. **Controllers** - Business logic and validation
2. **Services** - Data access and TypeORM queries
3. **Models** - TypeORM entity definitions

### Middleware Stack

Request flow through middleware:
1. Helmet (security headers)
2. CORS
3. Body parsing
4. Request logging
5. Routes
6. Not found handler
7. Error handler

## Security Considerations

- JWT authentication for protected routes
- Bcrypt for password hashing
- Helmet for security headers
- Input validation on all endpoints
- Rate limiting (to be implemented)
- Environment-based secrets

## Logging Strategy

- Structured logs with context
- Request/response logging
- Error stack traces in development
- File rotation in production
- Configurable log levels

## Testing

Jest is configured for unit and integration tests:
```bash
yarn workspace backend test
```

## Future Enhancements

- WebSocket support with Socket.io
- Message queue integration (RabbitMQ)
- Redis caching layer
- Database migrations
- API documentation (OpenAPI/Swagger)
- Performance monitoring
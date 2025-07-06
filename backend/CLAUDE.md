# Backend Structure Guide

## Directory Structure

```
backend/
├── src/
│   ├── index.ts             # Server entry point
│   ├── app.ts               # Express app configuration
│   ├── config.ts            # Configuration management
│   │
│   ├── routes/              # API route definitions
│   │   ├── index.ts         # Route aggregator
│   │   ├── workItems.routes.ts
│   │   ├── agents.routes.ts
│   │   └── config.routes.ts
│   │
│   ├── controllers/         # Request handlers
│   │   ├── workItems.controller.ts
│   │   ├── agents.controller.ts
│   │   └── config.controller.ts
│   │
│   ├── services/            # Business logic layer
│   │   ├── Database.ts      # SQLite/Knex wrapper
│   │   ├── AgentManager.ts  # Process management
│   │   ├── WorkItemService.ts
│   │   └── Logger.ts        # Winston logger
│   │
│   ├── middleware/          # Express middleware
│   │   ├── error.middleware.ts
│   │   └── logging.middleware.ts
│   │
│   └── types/               # TypeScript types
│       └── (future types)
│
├── package.json
├── tsconfig.json
├── nodemon.json
└── .env.example
```

## Key Entry Points

### Server Initialization

- `src/index.ts` - Main entry point that starts the server
- `src/app.ts` - Express app factory with all middleware and routes

### Service Layer

- `src/services/Database.ts` - Database connection and table creation
- `src/services/AgentManager.ts` - Claude Code process management
- `src/services/WorkItemService.ts` - Work item business logic

### API Layer

- `src/routes/index.ts` - Main route aggregator
- `src/controllers/*.controller.ts` - Request handlers

## Service Patterns

### Dependency Injection

Services are instantiated in `app.ts` and attached to `app.locals`:

```typescript
app.locals.services = {
  database,
  agentManager,
  workItemService,
  logger,
};
```

### Controller Access

Controllers access services via `req.app.locals.services`:

```typescript
const workItemService = req.app.locals.services.workItemService;
```

### Error Handling

All errors bubble up to the error middleware via `next(error)`

## Database Access

### Using Knex

The Database service exposes a Knex connection:

```typescript
const db = database.getConnection();
const items = await db('work_items').select();
```

### Tables

- work_items
- agents
- phases
- revisions

## WebSocket Integration

Socket.io server is created in `app.ts` and passed to services that need it (like AgentManager).

## Adding New Features

1. **New API Endpoint**:
   - Add route in appropriate routes file
   - Create controller method
   - Add service method if needed

2. **New Service**:
   - Create service class in `services/`
   - Initialize in `app.ts`
   - Add to `app.locals.services`

3. **New Database Table**:
   - Add creation in `Database.ts` `createTables()` method
   - Create corresponding TypeScript interface

## Common Tasks

### Run Development Server

```bash
yarn dev
```

### Add New Package

```bash
yarn add [package-name]
yarn add -D [dev-package-name]
```

### Database Location

Default: `./data/agent-boss.db`
Configure via `DATABASE_PATH` env variable

### Logging

Use the Logger service for consistent logging:

```typescript
const logger = new Logger('ContextName');
logger.info('Message');
logger.error('Error', error);
```

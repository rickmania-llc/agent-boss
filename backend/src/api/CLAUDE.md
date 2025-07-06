# API Routes Documentation

## Overview

This directory contains all API route definitions for the Agent Boss backend. Routes are organized by feature/entity and follow RESTful conventions.

## Structure

```
api/
├── index.ts           # Route aggregator
├── auth/             # Authentication routes
├── users/            # User management routes
├── work-items/       # Work item routes
└── agents/           # Agent management routes
```

## Route Patterns

### RESTful Conventions

```typescript
router.route('/')
  .get()    // List all resources
  .post()   // Create new resource

router.route('/:id')
  .get()    // Get specific resource
  .put()    // Update resource
  .delete() // Delete resource
```

### Authentication

All routes use JWT authentication middleware:
```typescript
router.use(authenticateJwt(['admin', 'user']));
```

## Response Format

Successful responses:
```json
{
  "data": { ... },
  "message": "Success message"
}
```

Error responses:
```json
{
  "error": {
    "message": "Error description",
    "status": 400
  }
}
```

## API Endpoints

### Health Check
- `GET /health` - Server health status

### Work Items
- `GET /api/work-items` - List all work items
- `POST /api/work-items` - Create from GitLab/GitHub issue
- `GET /api/work-items/:id` - Get work item details
- `POST /api/work-items/:id/start-phase/:phase` - Start agent phase
- `GET /api/work-items/:id/artifacts` - Get phase artifacts

### Agents
- `GET /api/agents` - List active agents
- `POST /api/agents/:id/stop` - Stop specific agent
- `GET /api/agents/:id/logs` - Get agent logs

## Error Handling

All routes use centralized error handling:
- Validation errors → 400
- Authentication errors → 401
- Authorization errors → 403
- Not found → 404
- Server errors → 500

## Future Routes

- User management endpoints
- GitLab/GitHub webhook handlers
- Metrics and monitoring endpoints
- WebSocket upgrade endpoints
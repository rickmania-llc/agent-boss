# Agent Boss Backend

Express.js backend service for the Agent Boss application.

## Architecture

The backend follows a layered architecture:

- **Routes**: Define API endpoints and map to controllers
- **Controllers**: Handle HTTP requests/responses
- **Services**: Business logic and process management
- **Models**: Data structures and database schemas
- **Middleware**: Cross-cutting concerns (logging, error handling)

## Main Services

### Database Service

- SQLite database using Knex query builder
- Handles work items, agents, phases, and revisions
- Auto-creates tables on startup

### Agent Manager

- Manages Claude Code process lifecycle
- Tracks agent status and assignments
- Communicates status via WebSocket

### Work Item Service

- CRUD operations for work items
- Assignment logic to agents
- Status management

## API Endpoints

### Work Items

- `GET /api/work-items` - List all work items
- `GET /api/work-items/:id` - Get specific work item
- `POST /api/work-items` - Create new work item
- `PUT /api/work-items/:id` - Update work item
- `POST /api/work-items/:id/assign` - Assign to agent
- `POST /api/work-items/:id/complete` - Mark as complete
- `POST /api/work-items/:id/fail` - Mark as failed

### Agents

- `GET /api/agents` - List all agents
- `GET /api/agents/:id` - Get specific agent
- `POST /api/agents` - Create new agent
- `POST /api/agents/:id/stop` - Stop agent

### Config

- `GET /api/config` - Get server configuration

### Health

- `GET /api/health` - Health check endpoint

## WebSocket Events

### Server Events (Emitted)

- `agent:created` - New agent created
- `agent:started` - Agent started working
- `agent:stopped` - Agent stopped

### Client Events (Listened)

- `connection` - Client connected
- `disconnect` - Client disconnected

## Database Schema

### work_items

- id (primary key)
- title (string)
- description (text)
- status (pending|in_progress|completed|failed)
- priority (low|medium|high)
- created_at, updated_at

### agents

- id (primary key)
- name (string)
- status (idle|busy|error)
- work_item_id (foreign key)
- pid (process ID)
- created_at, updated_at

### phases

- id (primary key)
- work_item_id (foreign key)
- name (string)
- description (text)
- status (pending|in_progress|completed)
- order_index (integer)
- created_at, updated_at

### revisions

- id (primary key)
- work_item_id (foreign key)
- phase_id (foreign key)
- content (text)
- type (string)
- created_at

## Development

```bash
# Install dependencies
yarn install

# Run development server with hot reload
yarn dev

# Build for production
yarn build

# Run production build
yarn start

# Lint code
yarn lint
```

## Environment Variables

Create a `.env` file based on `.env.example`:

```env
PORT=3001
NODE_ENV=development
DATABASE_PATH=./data/agent-boss.db
LOG_LEVEL=debug
CORS_ORIGIN=http://localhost:3000
```

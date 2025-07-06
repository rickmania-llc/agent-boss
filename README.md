# Agent Boss

A full-stack TypeScript application for orchestrating multiple Claude Code instances as local processes. Built with React/Redux/Vite frontend and Node.js/Express backend.

## Quick Start

1. **Install dependencies:**

   ```bash
   yarn install
   ```

2. **Set up environment variables:**

   ```bash
   # Backend
   cp backend/.env.example backend/.env

   # Frontend
   cp frontend/.env.example frontend/.env
   ```

3. **Run development servers:**

   ```bash
   yarn dev
   ```

   This starts both servers concurrently:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:3001

## Project Structure

```
agent-boss/
├── frontend/          # React application with Redux and Vite
├── backend/           # Express server with SQLite database
└── docs/              # Documentation
```

## Available Scripts

- `yarn dev` - Start both frontend and backend in development mode
- `yarn build` - Build both projects for production
- `yarn lint` - Run ESLint on both projects

### Frontend Scripts

- `yarn dev:frontend` - Start frontend development server
- `yarn build:frontend` - Build frontend for production
- `yarn lint:frontend` - Lint frontend code

### Backend Scripts

- `yarn dev:backend` - Start backend development server
- `yarn build:backend` - Build backend TypeScript
- `yarn lint:backend` - Lint backend code

## Technology Stack

### Frontend

- React 18 with TypeScript
- Redux for state management (with redux-thunk)
- Vite for fast development and building
- Socket.io client for real-time updates
- Axios for API calls
- React Router for navigation

### Backend

- Node.js with Express and TypeScript
- SQLite database with Knex query builder
- Socket.io for WebSocket communication
- Winston for logging
- CORS enabled for frontend communication

## Development

This project uses Yarn workspaces for monorepo management. Dependencies are hoisted to the root where possible.

### Code Style

- ESLint for code linting
- Prettier for code formatting
- TypeScript strict mode enabled

### Environment Variables

Backend (`.env`):

- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)
- `DATABASE_PATH` - SQLite database location
- `LOG_LEVEL` - Winston log level
- `CORS_ORIGIN` - Frontend URL for CORS

Frontend (`.env`):

- `VITE_API_URL` - Backend API URL
- `VITE_WS_URL` - WebSocket server URL

## Architecture

The application follows a client-server architecture:

1. **Frontend**: React SPA with Redux managing application state
2. **Backend**: RESTful API with Socket.io for real-time updates
3. **Database**: SQLite for persistent storage
4. **Communication**: REST API for CRUD operations, WebSockets for real-time events

## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Run `yarn lint` to ensure code quality
4. Submit a pull request

## License

[License information to be added]

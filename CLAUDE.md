## Development Rules & Standards

### Package Management

- **MANDATORY**: Always use `yarn` for package management, never `npm`
- Install packages: `yarn add [package-name]`
- Install dev dependencies: `yarn add -D [package-name]`
- Install dependencies: `yarn install`
- Run scripts: `yarn [script-name]`
- Workspace commands: `yarn workspace [frontend|backend] [command]`

### Code Standards

- Follow TypeScript best practices for all new code
- Use functional components with hooks in React
- Implement proper error handling with try-catch blocks
- Write meaningful commit messages referencing issue numbers
- Maintain consistent code formatting (use ESLint)

### Git & Version Control Integration

- Branch naming convention: `[issue-number]-[brief-description]`
- Commit messages should be descriptive and reference issue numbers
- Always create pull requests for code review
- Main branch: `main`
- Development branch: `development`

## Project Structure

Agent Boss is a monorepo using Yarn workspaces with separate frontend and backend projects:

```
agent-boss/
├── frontend/          # React 19 + TypeScript + Vite frontend
├── backend/           # Node.js 22 + TypeScript + Express backend
├── package.json       # Root workspace configuration
├── .prettierrc        # Shared code formatting rules
└── CLAUDE.md         # This file
```

### Development Commands

- `yarn dev` - Start both frontend and backend in development mode
- `yarn build` - Build both projects for production
- `yarn lint` - Run ESLint on both projects
- `yarn test` - Run tests for both projects

### Frontend Architecture

The frontend uses:
- React 19 with functional components
- Redux Toolkit for state management
- React Router for navigation
- Tailwind CSS v4 for styling
- Vite for build tooling
- Socket.io client for real-time updates

See `frontend/CLAUDE.md` for detailed frontend documentation.

### Backend Architecture

The backend uses:
- Express 4 for HTTP server
- TypeORM for database management
- Winston for structured logging
- Socket.io for WebSocket support
- JWT for authentication
- SQLite/PostgreSQL for data persistence

See `backend/CLAUDE.md` for detailed backend documentation.

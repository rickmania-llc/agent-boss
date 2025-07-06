# Node.js Application Conventions Template

## Technology Stack

### Core Technologies
- **Node.js 22** - JavaScript runtime
- **TypeScript 5** - Type safety and modern JavaScript features
- **Express 4** - Web application framework
- **TypeORM** - Database ORM with migration support
- **PostgreSQL** - Primary database
- **Winston** - Logging framework
- **Jest** - Testing framework

### Additional Technologies
- **Socket.io** - Real-time bidirectional communication
- **MQTT** - Lightweight messaging protocol
- **RabbitMQ** - Message broker for microservices
- **JSON Web Tokens** - Authentication
- **Bcrypt** - Password hashing
- **Multer** - File upload handling
- **Dotenv** - Environment configuration
- **ESLint** - Code quality and consistency
- **Nodemon** - Development hot reload

### Package Management
- **MANDATORY**: Always use `yarn` for package management, never `npm`
- Install packages: `yarn add [package-name]`
- Install dev dependencies: `yarn add -D [package-name]`
- Install dependencies: `yarn install`
- Run scripts: `yarn [script-name]`

## Project Structure

```
node-server/
├── src/
│   ├── server.ts                # Application entry point
│   ├── app.ts                   # Express app configuration
│   │
│   ├── api/                     # API route definitions
│   │   ├── CLAUDE.md           # API documentation
│   │   ├── index.ts            # Route aggregator
│   │   ├── auth/               # Authentication routes
│   │   │   └── index.ts
│   │   ├── users/              # User management routes
│   │   │   └── index.ts
│   │   └── [entity]/           # Entity-specific routes
│   │       └── index.ts
│   │
│   ├── database/                # Database layer
│   │   ├── CLAUDE.md           # Database documentation
│   │   ├── models/             # TypeORM entity models
│   │   │   ├── CLAUDE.md
│   │   │   ├── User.ts
│   │   │   └── [Entity].ts
│   │   ├── controllers/        # Business logic layer
│   │   │   ├── CLAUDE.md
│   │   │   ├── userController.ts
│   │   │   └── [entity]Controller.ts
│   │   ├── services/           # Data access layer
│   │   │   ├── CLAUDE.md
│   │   │   ├── userService.ts
│   │   │   └── [entity]Service.ts
│   │   └── databaseTypes.ts    # Shared database types
│   │
│   ├── migrations/              # Database migrations
│   │   ├── CLAUDE.md
│   │   └── [timestamp]-[description].ts
│   │
│   ├── network/                 # Network handling
│   │   ├── CLAUDE.md
│   │   ├── socketHandler.ts    # Socket.io connections
│   │   ├── mqttHandler.ts      # MQTT client
│   │   ├── rabbitHandler.ts    # RabbitMQ integration
│   │   └── socketBroadcaster.ts # Event broadcasting
│   │
│   ├── utils/                   # Utility functions
│   │   ├── CLAUDE.md
│   │   ├── app/                # Application utilities
│   │   │   ├── config/         # Config management
│   │   │   │   └── index.ts
│   │   │   ├── dbConnection.ts # Database connection
│   │   │   └── logHandler.ts   # Logger factory
│   │   ├── auth/               # Authentication utilities
│   │   │   ├── userAuth.ts     # JWT handling
│   │   │   ├── permissions.ts  # Role-based access
│   │   │   └── encryption.ts   # Crypto utilities
│   │   ├── middleware/         # Express middleware
│   │   │   ├── errorHandler.ts # Error handling
│   │   │   ├── logging.ts      # Request logging
│   │   │   ├── auth.ts         # Authentication
│   │   │   └── validation.ts   # Request validation
│   │   └── helpers/            # General helpers
│   │       ├── dateHelpers.ts
│   │       └── validators.ts
│   │
│   └── types/                   # TypeScript types
│       ├── express.d.ts        # Express augmentation
│       ├── environment.d.ts    # Environment types
│       └── common.ts           # Shared types
│
├── config/                      # Configuration files
│   └── index.ts                # Config aggregator
│
├── test/                        # Test files
│   ├── unit/                   # Unit tests
│   ├── integration/            # Integration tests
│   └── e2e/                    # End-to-end tests
│
├── logs/                        # Log files (gitignored)
│   └── app_[date].log
│
├── dist/                        # Build output (gitignored)
│
├── CLAUDE.md                    # Module documentation
├── package.json                 # Dependencies & scripts
├── tsconfig.json               # TypeScript configuration
├── jest.config.ts              # Jest configuration
├── .env.example                # Environment template
├── .eslintrc.js                # ESLint configuration
└── ormconfig.js                # TypeORM configuration
```

## Naming Conventions

### Files
- **Routes**: camelCase matching entity (e.g., `users/index.ts`)
- **Controllers**: camelCase + "Controller" (e.g., `userController.ts`)
- **Services**: camelCase + "Service" (e.g., `userService.ts`)
- **Models**: PascalCase matching entity (e.g., `User.ts`)
- **Middleware**: camelCase + descriptor (e.g., `errorHandler.ts`)
- **Utilities**: camelCase descriptive (e.g., `logHandler.ts`)
- **Migrations**: timestamp-description (e.g., `1234567890-AddUserTable.ts`)

### Code
- **Classes**: PascalCase (e.g., `UserService`, `LogHandler`)
- **Functions**: camelCase with verbs (e.g., `createUser`, `validateToken`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_RETRY_ATTEMPTS`)
- **Interfaces**: PascalCase with "I" prefix optional (e.g., `UserModel`, `IUserResponse`)
- **Types**: PascalCase (e.g., `UserRole`, `ApiResponse`)
- **Enums**: PascalCase with singular name (e.g., `UserStatus`)

## Architecture Patterns

### Layered Architecture
```
Routes (API Layer)
    ↓
Controllers (Business Logic)
    ↓
Services (Data Access)
    ↓
Models (Database Entities)
```

### API Route Pattern
```typescript
import { Router } from 'express';
import { authenticateJwt } from '../../utils/middleware/auth';
import * as entityController from '../../database/controllers/entityController';

const router = Router();

router.route('/')
  .get(authenticateJwt(['admin', 'user']), async (req, res) => {
    const result = await entityController.getEntities();
    if (!result.success) {
      return res.status(result.code).json({ message: result.message });
    }
    return res.status(200).json(result.data);
  })
  .post(authenticateJwt(['admin']), async (req, res) => {
    const result = await entityController.createEntity(req.body);
    if (!result.success) {
      return res.status(result.code).json({ message: result.message });
    }
    return res.status(201).json(result.data);
  });

router.route('/:id')
  .get(authenticateJwt(['admin', 'user']), async (req, res) => {
    const result = await entityController.getEntityById(req.params.id);
    if (!result.success) {
      return res.status(result.code).json({ message: result.message });
    }
    return res.status(200).json(result.data);
  })
  .put(authenticateJwt(['admin']), async (req, res) => {
    const result = await entityController.updateEntity(req.params.id, req.body);
    if (!result.success) {
      return res.status(result.code).json({ message: result.message });
    }
    return res.status(200).json(result.data);
  })
  .delete(authenticateJwt(['admin']), async (req, res) => {
    const result = await entityController.deleteEntity(req.params.id);
    if (!result.success) {
      return res.status(result.code).json({ message: result.message });
    }
    return res.status(204).send();
  });

export default router;
```

### Controller Pattern
```typescript
import * as entityService from '../services/entityService';
import type { EntityCreateDto, EntityUpdateDto } from '../databaseTypes';
import LogHandler from '../../utils/app/logHandler';

const logger = new LogHandler('entityController');

export interface ControllerResponse<T = any> {
  success: boolean;
  code: number;
  message: string;
  data?: T;
}

export async function getEntities(): Promise<ControllerResponse> {
  try {
    logger.info('Getting all entities');
    const entities = await entityService.findAll();
    return {
      success: true,
      code: 200,
      message: 'Entities retrieved successfully',
      data: entities
    };
  } catch (error) {
    logger.error('Error getting entities:', error);
    return {
      success: false,
      code: 500,
      message: 'Internal server error'
    };
  }
}

export async function createEntity(data: EntityCreateDto): Promise<ControllerResponse> {
  try {
    // Validation
    if (!data.name) {
      return {
        success: false,
        code: 400,
        message: 'Name is required'
      };
    }

    // Business logic
    const entity = await entityService.create(data);
    logger.info(`Entity created with ID: ${entity.id}`);
    
    return {
      success: true,
      code: 201,
      message: 'Entity created successfully',
      data: entity
    };
  } catch (error) {
    logger.error('Error creating entity:', error);
    return {
      success: false,
      code: 500,
      message: 'Internal server error'
    };
  }
}
```

### Service Pattern
```typescript
import { getRepository } from 'typeorm';
import { Entity } from '../models/Entity';
import type { EntityCreateDto, EntityUpdateDto } from '../databaseTypes';

export async function findAll(): Promise<Entity[]> {
  const repository = getRepository(Entity);
  return repository.find();
}

export async function findById(id: string): Promise<Entity | undefined> {
  const repository = getRepository(Entity);
  return repository.findOne(id);
}

export async function create(data: EntityCreateDto): Promise<Entity> {
  const repository = getRepository(Entity);
  const entity = repository.create(data);
  return repository.save(entity);
}

export async function update(id: string, data: EntityUpdateDto): Promise<Entity | undefined> {
  const repository = getRepository(Entity);
  await repository.update(id, data);
  return repository.findOne(id);
}

export async function remove(id: string): Promise<void> {
  const repository = getRepository(Entity);
  await repository.delete(id);
}
```

### Model Pattern
```typescript
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('entities')
export class EntityModel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

## Middleware Implementation

### Error Handler Middleware
```typescript
// src/utils/middleware/errorHandler.ts
import type { Request, Response, NextFunction } from 'express';
import LogHandler from '../app/logHandler';

const logger = new LogHandler('ErrorMiddleware');

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export function notFoundMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const error = new AppError(404, `Route ${req.originalUrl} not found`);
  next(error);
}

export function errorMiddleware(
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): Response {
  logger.error('Request error:', err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: {
        message: err.message,
        status: err.statusCode
      }
    });
  }

  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: {
        message: 'Validation error',
        details: err.message
      }
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: {
        message: 'Unauthorized access'
      }
    });
  }

  // Default error
  const status = res.statusCode !== 200 ? res.statusCode : 500;
  return res.status(status).json({
    error: {
      message: 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { 
        stack: err.stack,
        details: err.message 
      })
    }
  });
}
```

### Logging Middleware
```typescript
// src/utils/middleware/logging.ts
import type { Request, Response, NextFunction } from 'express';
import LogHandler from '../app/logHandler';

const logger = new LogHandler('HTTP');

export function loggingMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const start = Date.now();
  const { method, originalUrl } = req;
  const clientIp = req.header('X-Real-IP') || req.connection.remoteAddress;

  // Log request
  logger.info(`${method} ${originalUrl} - ${clientIp}`);

  // Log response
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    logger.info(`${method} ${originalUrl} ${statusCode} ${duration}ms - ${clientIp}`);
  });

  next();
}
```

### Authentication Middleware
```typescript
// src/utils/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    roles: string[];
  };
}

export function authenticateJwt(requiredRoles: string[] = []) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      
      if (!token) {
        throw new AppError(401, 'No token provided');
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      req.user = decoded;

      // Check roles if required
      if (requiredRoles.length > 0) {
        const hasRole = requiredRoles.some(role => 
          req.user!.roles.includes(role)
        );
        
        if (!hasRole) {
          throw new AppError(403, 'Insufficient permissions');
        }
      }

      next();
    } catch (error) {
      if (error instanceof AppError) {
        next(error);
      } else {
        next(new AppError(401, 'Invalid token'));
      }
    }
  };
}
```

### Validation Middleware
```typescript
// src/utils/middleware/validation.ts
import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

export function validateBody(schema: any) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body);
    
    if (error) {
      throw new AppError(400, error.details[0].message);
    }
    
    req.body = value;
    next();
  };
}

export function validateParams(schema: any) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.params);
    
    if (error) {
      throw new AppError(400, error.details[0].message);
    }
    
    req.params = value;
    next();
  };
}
```

## Application Setup

### Server Entry Point
```typescript
// server.ts
import 'dotenv/config';
import http from 'http';
import app from './src/app';
import { createConnection } from 'typeorm';
import LogHandler from './src/utils/app/logHandler';
import config from './config';

const logger = new LogHandler('server');
const { port } = config;

async function startServer() {
  try {
    // Database connection
    await createConnection();
    logger.info('Database connected successfully');

    // Create HTTP server
    const server = http.createServer(app);

    // Start server
    server.listen(port, () => {
      logger.info(`Server running on port ${port}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received, shutting down gracefully');
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
```

### Express App Configuration
```typescript
// src/app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { loggingMiddleware } from './utils/middleware/logging';
import { errorMiddleware, notFoundMiddleware } from './utils/middleware/errorHandler';
import api from './api';
import config from '../config';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: config.corsOrigins,
  credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Logging
app.use(loggingMiddleware);

// Trust proxy
app.set('trust proxy', true);

// API routes
app.use('/api', api);

// Error handling
app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
```

## Configuration Management

### Config Structure
```typescript
// config/index.ts
interface Config {
  env: string;
  port: number;
  databaseUrl: string;
  jwtSecret: string;
  jwtExpiration: string;
  corsOrigins: string[];
  logLevel: string;
  // Add more as needed
}

const config: Config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  databaseUrl: process.env.DATABASE_URL || 'postgres://localhost:5432/app',
  jwtSecret: process.env.JWT_SECRET || 'secret',
  jwtExpiration: process.env.JWT_EXPIRATION || '7d',
  corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
  logLevel: process.env.LOG_LEVEL || 'info'
};

// Validate required config
const requiredVars = ['DATABASE_URL', 'JWT_SECRET'];
for (const varName of requiredVars) {
  if (!process.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
}

export default config;
```

### Environment Variables
```bash
# .env.example
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgres://user:password@localhost:5432/dbname

# Authentication
JWT_SECRET=your-secret-key
JWT_EXPIRATION=7d

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# Logging
LOG_LEVEL=info

# External Services
REDIS_URL=redis://localhost:6379
MQTT_URL=mqtt://localhost:1883
RABBITMQ_URL=amqp://localhost:5672
```

## Logging System

### Logger Implementation
```typescript
// src/utils/app/logHandler.ts
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import config from '../../../config';

export default class LogHandler {
  private logger: winston.Logger;

  constructor(private context: string) {
    const logFormat = winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.errors({ stack: true }),
      winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
        let log = `${timestamp} [${level.toUpperCase()}] [${this.context}]: ${message}`;
        
        if (Object.keys(meta).length) {
          log += ` ${JSON.stringify(meta)}`;
        }
        
        if (stack) {
          log += `\n${stack}`;
        }
        
        return log;
      })
    );

    // Console transport
    const consoleTransport = new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        logFormat
      )
    });

    // File transport
    const fileTransport = new DailyRotateFile({
      filename: path.join('logs', 'app_%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      format: logFormat
    });

    this.logger = winston.createLogger({
      level: config.logLevel,
      transports: [consoleTransport, fileTransport]
    });
  }

  info(message: string, meta?: any): void {
    this.logger.info(message, meta);
  }

  error(message: string, error?: any): void {
    this.logger.error(message, error);
  }

  warn(message: string, meta?: any): void {
    this.logger.warn(message, meta);
  }

  debug(message: string, meta?: any): void {
    this.logger.debug(message, meta);
  }
}
```

## Database Configuration

### TypeORM Config
```javascript
// ormconfig.js
module.exports = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  entities: ['src/database/models/**/*.ts'],
  migrations: ['src/migrations/**/*.ts'],
  cli: {
    migrationsDir: 'src/migrations'
  }
};
```

### Database Connection
```typescript
// src/utils/app/dbConnection.ts
import { createConnection, Connection } from 'typeorm';
import LogHandler from './logHandler';

const logger = new LogHandler('Database');

let connection: Connection | null = null;

export async function initializeDatabase(): Promise<Connection> {
  try {
    connection = await createConnection();
    logger.info('Database connection established');
    return connection;
  } catch (error) {
    logger.error('Database connection failed:', error);
    throw error;
  }
}

export function getConnection(): Connection {
  if (!connection) {
    throw new Error('Database connection not initialized');
  }
  return connection;
}
```

## Testing Patterns

### Unit Test Example
```typescript
// test/unit/controllers/userController.test.ts
import * as userController from '../../../src/database/controllers/userController';
import * as userService from '../../../src/database/services/userService';

jest.mock('../../../src/database/services/userService');

describe('UserController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUsers', () => {
    it('should return users successfully', async () => {
      const mockUsers = [
        { id: '1', email: 'test@example.com' }
      ];
      
      (userService.findAll as jest.Mock).mockResolvedValue(mockUsers);
      
      const result = await userController.getUsers();
      
      expect(result.success).toBe(true);
      expect(result.code).toBe(200);
      expect(result.data).toEqual(mockUsers);
    });

    it('should handle errors', async () => {
      (userService.findAll as jest.Mock).mockRejectedValue(new Error('DB Error'));
      
      const result = await userController.getUsers();
      
      expect(result.success).toBe(false);
      expect(result.code).toBe(500);
    });
  });
});
```

### Integration Test Example
```typescript
// test/integration/api/users.test.ts
import request from 'supertest';
import app from '../../../src/app';
import { createConnection, getConnection } from 'typeorm';

describe('Users API', () => {
  beforeAll(async () => {
    await createConnection();
  });

  afterAll(async () => {
    await getConnection().close();
  });

  describe('GET /api/users', () => {
    it('should return 401 without auth', async () => {
      const response = await request(app)
        .get('/api/users')
        .expect(401);
      
      expect(response.body.error.message).toBe('No token provided');
    });

    it('should return users with valid auth', async () => {
      const token = 'valid-jwt-token';
      
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      expect(Array.isArray(response.body)).toBe(true);
    });
  });
});
```

## Development Scripts

```json
{
  "scripts": {
    "dev": "NODE_ENV=development nodemon --watch 'src/**/*.ts' --exec 'ts-node' src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "start:prod": "NODE_ENV=production node -r dotenv/config dist/server.js",
    "test": "jest --watchAll=false",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:e2e": "jest --config ./test/jest-e2e.json",
    "lint": "eslint . --ext .ts",
    "lint:fix": "eslint . --ext .ts --fix",
    "typecheck": "tsc --noEmit",
    "migration:generate": "typeorm migration:generate -n",
    "migration:run": "typeorm migration:run",
    "migration:revert": "typeorm migration:revert"
  }
}
```

## Best Practices

### Code Organization
1. Keep files focused and single-purpose
2. Use consistent folder structure across features
3. Separate concerns (routes, logic, data access)
4. Group related functionality together
5. Maintain clear import paths

### Error Handling
1. Use custom error classes for different scenarios
2. Always catch async errors in controllers
3. Return consistent error response format
4. Log errors with appropriate context
5. Don't expose sensitive error details in production

### Security
1. Always validate and sanitize input
2. Use parameterized queries to prevent SQL injection
3. Implement rate limiting for APIs
4. Use helmet for security headers
5. Keep dependencies updated
6. Never log sensitive data

### Performance
1. Use database indexes appropriately
2. Implement caching where beneficial
3. Use pagination for large datasets
4. Optimize database queries (avoid N+1)
5. Use connection pooling
6. Implement request timeout handling

### Testing
1. Write tests for all critical paths
2. Mock external dependencies
3. Use factory patterns for test data
4. Test error scenarios
5. Maintain good test coverage (>80%)

## Common Patterns

### Repository Pattern
```typescript
// src/database/repositories/userRepository.ts
import { EntityRepository, Repository } from 'typeorm';
import { User } from '../models/User';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  async findByEmail(email: string): Promise<User | undefined> {
    return this.findOne({ where: { email } });
  }

  async findActive(): Promise<User[]> {
    return this.find({ where: { isActive: true } });
  }
}
```

### Factory Pattern
```typescript
// src/utils/factories/userFactory.ts
import { User } from '../../database/models/User';

export class UserFactory {
  static create(data: Partial<User>): User {
    const user = new User();
    Object.assign(user, {
      email: data.email || 'test@example.com',
      name: data.name || 'Test User',
      isActive: data.isActive ?? true,
      createdAt: data.createdAt || new Date(),
      ...data
    });
    return user;
  }
}
```

### Event Emitter Pattern
```typescript
// src/utils/events/eventEmitter.ts
import { EventEmitter } from 'events';

class AppEventEmitter extends EventEmitter {
  emitUserCreated(user: any): void {
    this.emit('user:created', user);
  }

  onUserCreated(handler: (user: any) => void): void {
    this.on('user:created', handler);
  }
}

export const appEvents = new AppEventEmitter();
```

## Documentation Requirements

### CLAUDE.md Files
Each major directory must contain a CLAUDE.md file documenting:
- Directory purpose and architecture
- File descriptions and key functions
- Dependencies and integration points
- Common workflows and patterns
- Performance and security notes

### API Documentation
- Use JSDoc for function documentation
- Document all API endpoints with examples
- Include request/response schemas
- Document error responses
- Maintain API changelog

### Code Comments
- Comment complex business logic
- Explain non-obvious decisions
- Document workarounds with reasons
- Keep comments up to date
- Use TypeScript types as documentation
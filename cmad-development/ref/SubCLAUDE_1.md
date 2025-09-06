# Database Layer - VEMASS District Server Data Management

## Directory Purpose
The `database/` directory contains the complete data access layer for the VEMASS District Server. It implements a three-tier architecture with Models (data structure), Services (data access), and Controllers (business logic). This separation ensures clean code organization, testability, and maintainability.

## Architecture Overview

### Three-Tier Structure
```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│   Models    │────▶│   Services   │────▶│ Controllers  │
│  (TypeORM)  │     │ (Repository) │     │ (Business)   │
└─────────────┘     └──────────────┘     └──────────────┘
     Define              Query              Process
   Structure           Database            & Validate
```

### Design Principles
- **Separation of Concerns**: Each layer has a specific responsibility
- **Type Safety**: Full TypeScript typing throughout
- **Transaction Support**: Complex operations wrapped in transactions
- **Relationship Management**: Efficient loading of related data
- **Audit Trail**: Automatic history tracking for changes

## Directory Structure

### models/
**Purpose**: TypeORM entity definitions that map to database tables
**Key Features**:
- Entity decorators define table structure
- Relationship decorators define foreign keys
- Validation decorators ensure data integrity
- Custom methods for entity-specific logic

### services/
**Purpose**: Data access layer using repository pattern
**Key Features**:
- Abstracts TypeORM queries
- Handles complex joins and relations
- Provides pagination and filtering
- Optimizes query performance

### controllers/
**Purpose**: Business logic layer between API routes and services
**Key Features**:
- Input validation and sanitization
- Transaction management
- Business rule enforcement
- Response formatting
- Error handling

### databaseTypes.ts
**Purpose**: Shared TypeScript interfaces and types
**Contents**:
- Request/response interfaces
- Query parameter types
- Enum definitions
- Utility types

## Database Schema

### Core Entities

#### User Management
- **user**: System users with authentication
- **role**: Role definitions (admin, security, maintenance, observer)
- **permission**: Fine-grained access control
- **samlMapping**: SSO attribute mappings

#### Campus Infrastructure
- **campus**: Physical locations with devices
- **district**: Multi-tenant district support
- **tag**: Campus grouping and categorization
- **campusStatus**: Real-time connection status
- **deviceInfo**: Hardware health metrics

#### Alert System
- **capMsg**: CAP message templates
- **activeCapMsg**: Currently broadcasting alerts
- **campusAlert**: Alert history and analytics
- **playlist**: Audio playlists for notifications

#### Automation & Config
- **event**: Automation rules and triggers
- **settings**: Key-value configuration store
- **notification**: In-app user notifications
- **reviewItem**: Priority tasks and items

#### Security & Audit
- **history**: Comprehensive audit log
- **campusApiToken**: Device authentication tokens

## Entity Relationships

### Many-to-Many
```typescript
// User ↔ Role
@ManyToMany(() => Role)
@JoinTable()
roles: Role[];

// Campus ↔ Tag
@ManyToMany(() => Tag)
@JoinTable()
tags: Tag[];
```

### One-to-Many
```typescript
// District → Campus
@OneToMany(() => Campus, campus => campus.district)
campuses: Campus[];

// User → Notification
@OneToMany(() => Notification, notification => notification.user)
notifications: Notification[];
```

### Polymorphic Relations
History entity can reference multiple entity types using:
- `entityType`: String identifier of entity
- `entityId`: ID of the referenced entity

## Common Patterns

### Service Pattern
```typescript
export default class EntityService {
  private repository = getRepository(Entity);
  
  async findAll(options?: QueryOptions): Promise<Entity[]> {
    const query = this.repository.createQueryBuilder('entity');
    
    // Apply filters
    if (options?.filter) {
      query.where(options.filter);
    }
    
    // Apply pagination
    if (options?.limit) {
      query.limit(options.limit);
      query.offset(options.offset || 0);
    }
    
    // Load relations
    if (options?.relations) {
      options.relations.forEach(rel => query.leftJoinAndSelect(`entity.${rel}`, rel));
    }
    
    return query.getMany();
  }
}
```

### Controller Pattern
```typescript
export default class EntityController {
  private service = new EntityService();
  
  async create(data: CreateEntityDto): Promise<ControllerResponse> {
    try {
      // Validate input
      const validation = await this.validate(data);
      if (!validation.valid) {
        return { success: false, code: 400, message: validation.error };
      }
      
      // Business logic
      const entity = await this.service.create(data);
      
      // Audit logging
      await HistoryController.log('CREATE', 'Entity', entity.id, userId);
      
      return { success: true, code: 201, data: entity };
    } catch (error) {
      logger.error('Entity creation failed', error);
      return { success: false, code: 500, message: 'Internal error' };
    }
  }
}
```

### Transaction Pattern
```typescript
async complexOperation(data: ComplexData): Promise<Result> {
  const queryRunner = getConnection().createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();
  
  try {
    // Multiple operations
    const entity1 = await queryRunner.manager.save(Entity1, data.entity1);
    const entity2 = await queryRunner.manager.save(Entity2, data.entity2);
    
    // Commit if all succeed
    await queryRunner.commitTransaction();
    return { entity1, entity2 };
  } catch (error) {
    // Rollback on any failure
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
}
```

## Query Optimization

### Eager vs Lazy Loading
```typescript
// Eager loading for commonly needed relations
@ManyToOne(() => User, { eager: true })
createdBy: User;

// Lazy loading for occasional access
@OneToMany(() => History, history => history.entity, { lazy: true })
history: Promise<History[]>;
```

### Query Builder Optimization
```typescript
// Efficient pagination with total count
const [items, total] = await repository.findAndCount({
  skip: offset,
  take: limit,
  relations: ['necessaryRelation'],
  where: conditions
});
```

### Index Usage
Models define indexes for performance:
```typescript
@Entity()
@Index(['status', 'lastSeen'])
export class Campus {
  // Indexed fields for common queries
}
```

## Data Validation

### Model-Level Validation
```typescript
@Column()
@IsEmail()
@IsNotEmpty()
email: string;

@Column()
@MinLength(8)
@Matches(/(?=.*[A-Z])(?=.*[0-9])/)
password: string;
```

### Controller-Level Validation
```typescript
private validate(data: any): ValidationResult {
  // Business rule validation
  if (data.startDate > data.endDate) {
    return { valid: false, error: 'Start date must be before end date' };
  }
  
  // Permission validation
  if (!this.hasPermission(user, data.campusId)) {
    return { valid: false, error: 'No permission for campus' };
  }
  
  return { valid: true };
}
```

## Database Connection

### Configuration
Connection configured in `src/utils/app/dbConnection.ts`:
```typescript
{
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: ['src/database/models/*.ts'],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,  // Use migrations in production
  logging: process.env.NODE_ENV === 'development'
}
```

### Connection Pool
- Maximum connections: 20
- Connection timeout: 30 seconds
- Idle timeout: 10 seconds

## Audit System

### History Tracking
All controllers integrate with history tracking:
```typescript
// After any data modification
await HistoryController.createHistoryItem({
  entityType: 'Campus',
  entityId: campus.id,
  action: 'UPDATE',
  userId: req.user.id,
  changes: JSON.stringify(changes),
  timestamp: new Date()
});
```

### Trackable Actions
- CREATE: New entity created
- UPDATE: Entity modified
- DELETE: Entity removed
- LOGIN: User authentication
- ALERT: Emergency notification sent

## Error Handling

### Service Layer
```typescript
try {
  return await this.repository.save(entity);
} catch (error) {
  if (error.code === '23505') {  // Unique constraint
    throw new ConflictError('Duplicate entry');
  }
  throw error;
}
```

### Controller Layer
```typescript
try {
  const result = await this.service.operation();
  return { success: true, code: 200, data: result };
} catch (error) {
  if (error instanceof ValidationError) {
    return { success: false, code: 400, message: error.message };
  }
  logger.error('Operation failed', error);
  return { success: false, code: 500, message: 'Internal error' };
}
```

## Testing Strategy

### Unit Tests
- Mock services in controller tests
- Mock repositories in service tests
- Test validation logic
- Test error scenarios

### Integration Tests
- Use test database
- Test full data flow
- Verify relationships
- Check constraints

## Performance Considerations

### Query Efficiency
- Use select() to limit fields
- Avoid N+1 queries with proper joins
- Implement query result caching
- Use database views for complex queries

### Bulk Operations
```typescript
// Efficient bulk insert
await repository.createQueryBuilder()
  .insert()
  .into(Entity)
  .values(arrayOfEntities)
  .execute();
```

### Connection Management
- Reuse connections from pool
- Release connections promptly
- Monitor pool exhaustion
- Implement connection retry logic

## Security Measures

### SQL Injection Prevention
- TypeORM parameterizes all queries
- Never use raw string concatenation
- Validate input types

### Data Encryption
- Passwords hashed with bcrypt
- Sensitive data encrypted at rest
- API tokens use secure generation

### Access Control
- Row-level security via campus permissions
- Column-level filtering by user role
- Audit trail for all modifications

## Migration Strategy

See `migrations/CLAUDE.md` for detailed migration documentation.

Key points:
- Migrations run automatically on startup
- Never modify existing migrations
- Test migrations on development first
- Backup database before production migrations

## Best Practices

### Entity Design
- Use meaningful property names
- Define all relationships explicitly
- Add appropriate indexes
- Include timestamps (created, updated)

### Service Implementation
- Keep services focused on data access
- Return entities, not formatted data
- Handle database-specific errors
- Use transactions for multi-step operations

### Controller Logic
- Validate all input
- Enforce business rules
- Format responses consistently
- Log important operations

### General Guidelines
- Never expose internal errors to API
- Always use TypeScript types
- Document complex queries
- Keep methods small and focused
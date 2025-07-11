# Database Layer Documentation

## Overview

The database layer implements a three-tier architecture pattern for clean separation of concerns:
1. **Models** - TypeORM entity definitions
2. **Services** - Data access layer with TypeORM queries
3. **Controllers** - Business logic and validation

## Directory Structure

```
database/
├── models/          # TypeORM entities
│   ├── User.ts
│   ├── WorkItem.ts
│   └── Agent.ts
├── controllers/     # Business logic
│   ├── userController.ts
│   ├── workItemController.ts
│   └── agentController.ts
├── services/        # Data access
│   ├── userService.ts
│   ├── workItemService.ts
│   └── agentService.ts
└── databaseTypes.ts # Shared types/DTOs
```

## Model Pattern

TypeORM entities with decorators:
```typescript
@Entity('work_items')
export class WorkItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

## Service Pattern

Data access functions:
```typescript
export async function findAll(): Promise<WorkItem[]> {
  const repository = getRepository(WorkItem);
  return repository.find();
}

export async function create(data: CreateWorkItemDto): Promise<WorkItem> {
  const repository = getRepository(WorkItem);
  const item = repository.create(data);
  return repository.save(item);
}
```

## Controller Pattern

Business logic with error handling:
```typescript
export async function createWorkItem(data: CreateWorkItemDto): Promise<ControllerResponse> {
  try {
    // Validation
    if (!data.title) {
      return {
        success: false,
        code: 400,
        message: 'Title is required'
      };
    }

    // Business logic
    const workItem = await workItemService.create(data);
    
    return {
      success: true,
      code: 201,
      message: 'Work item created',
      data: workItem
    };
  } catch (error) {
    logger.error('Error creating work item:', error);
    return {
      success: false,
      code: 500,
      message: 'Internal server error'
    };
  }
}
```

## Database Types

Shared types and DTOs:
```typescript
// Request DTOs
export interface CreateWorkItemDto {
  title: string;
  description: string;
  sourceType: 'gitlab' | 'github';
  sourceIssueId: string;
}

// Response types
export interface ControllerResponse<T = any> {
  success: boolean;
  code: number;
  message: string;
  data?: T;
}
```

## TypeORM Configuration

Database connection options:
- SQLite for development
- PostgreSQL for production
- Synchronize in development only
- Logging in development only

## Migrations

TypeORM migration commands:
```bash
# Generate migration
yarn workspace backend typeorm migration:generate -n MigrationName

# Run migrations
yarn workspace backend typeorm migration:run

# Revert migration
yarn workspace backend typeorm migration:revert
```

## Best Practices

1. **Separation of Concerns**
   - Models: Pure data structure
   - Services: Database operations only
   - Controllers: Business logic and validation

2. **Error Handling**
   - Always wrap in try-catch
   - Return consistent response format
   - Log errors with context

3. **Validation**
   - Validate in controllers before service calls
   - Use DTOs for type safety
   - Return specific error messages

4. **Performance**
   - Use relations wisely
   - Implement pagination
   - Add database indexes
   - Use query builder for complex queries

## Future Enhancements

- Repository pattern implementation
- Database seeding utilities
- Soft delete support
- Audit logging
- Query optimization helpers
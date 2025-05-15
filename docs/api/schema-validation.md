# Schema Validation API

The Schema Validation API provides utilities for validating data against schemas using Zod.

## Overview

Pubflow uses Zod for schema validation, allowing you to define schemas for your entities and validate data before sending it to the server.

## API Reference

### `validateWithSchema(schema, data)`

Validates data against a schema.

#### Parameters

- `schema` (z.ZodType<T>): Zod schema
- `data` (unknown): Data to validate

#### Returns

- (ValidationResult<T>): Validation result
  - `success` (boolean): Whether validation was successful
  - `data` (T, optional): Validated data (only present if success is true)
  - `errors` (Record<string, string[]>, optional): Validation errors (only present if success is false)

#### Example

```typescript
import { z } from 'zod';
import { validateWithSchema } from '@pubflow/core';

// Define schema
const userSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  age: z.number().min(18)
});

// Validate data
const result = validateWithSchema(userSchema, {
  name: 'J', // Too short
  email: 'invalid-email', // Invalid email
  age: 16 // Too young
});

if (!result.success) {
  console.error('Validation errors:', result.errors);
  // Output:
  // {
  //   name: ['String must contain at least 2 character(s)'],
  //   email: ['Invalid email'],
  //   age: ['Number must be greater than or equal to 18']
  // }
}
```

### `createSchema(schemas)`

Creates schemas for an entity.

#### Parameters

- `schemas` (object): Object containing entity, create, and update schemas
  - `entity` (z.ZodObject<T>, optional): Schema for the complete entity
  - `create` (z.ZodObject<U>, optional): Schema for creating an entity
  - `update` (z.ZodObject<V>, optional): Schema for updating an entity

#### Returns

- (object): The schemas object

#### Example

```typescript
import { z } from 'zod';
import { createSchema } from '@pubflow/core';

// Define schemas
const schemas = createSchema({
  // Schema for the complete entity
  entity: z.object({
    id: z.string(),
    name: z.string().min(2),
    email: z.string().email(),
    age: z.number().min(18),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime()
  }),
  
  // Schema for creating an entity
  create: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    age: z.number().min(18)
  }),
  
  // Schema for updating an entity
  update: z.object({
    name: z.string().min(2).optional(),
    email: z.string().email().optional(),
    age: z.number().min(18).optional()
  })
});

// Use schemas
const createResult = validateWithSchema(schemas.create, data);
const updateResult = validateWithSchema(schemas.update, data);
```

### `createUpdateSchema(createSchema)`

Creates an update schema from a create schema by making all properties optional.

#### Parameters

- `createSchema` (z.ZodObject<T>): Create schema

#### Returns

- (z.ZodObject<{ [K in keyof T]: z.ZodOptional<T[K]> }>): Update schema

#### Example

```typescript
import { z } from 'zod';
import { createUpdateSchema } from '@pubflow/core';

// Define create schema
const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  age: z.number().min(18)
});

// Create update schema
const updateUserSchema = createUpdateSchema(createUserSchema);

// Equivalent to:
// z.object({
//   name: z.string().min(2).optional(),
//   email: z.string().email().optional(),
//   age: z.number().min(18).optional()
// })
```

## Using with Bridge API

Schema validation can be used with the Bridge API to validate data before sending it to the server:

```typescript
import { z } from 'zod';
import { validateWithSchema, BridgeApiService } from '@pubflow/core';

// Define schema
const userSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  age: z.number().min(18)
});

// Create Bridge API service
const userService = new BridgeApiService<User>(apiClient, {
  endpoint: 'users'
});

// Validate and create
async function createUser(data: unknown) {
  const validationResult = validateWithSchema(userSchema, data);
  
  if (!validationResult.success) {
    console.error('Validation errors:', validationResult.errors);
    return { success: false, errors: validationResult.errors };
  }
  
  try {
    const user = await userService.create(validationResult.data);
    return { success: true, user };
  } catch (error) {
    return { success: false, error };
  }
}
```

## Advanced Validation

Zod provides many features for advanced validation:

### Custom Error Messages

```typescript
const userSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  age: z.number().min(18, { message: 'You must be at least 18 years old' })
});
```

### Transformations

```typescript
const userSchema = z.object({
  name: z.string().transform(val => val.trim()),
  email: z.string().email().transform(val => val.toLowerCase()),
  birthYear: z.number().transform(year => new Date().getFullYear() - year)
});
```

### Refinements

```typescript
const userSchema = z.object({
  password: z.string().min(8).refine(
    password => /[A-Z]/.test(password) && /[0-9]/.test(password),
    { message: 'Password must contain at least one uppercase letter and one number' }
  )
});
```

### Union Types

```typescript
const statusSchema = z.union([
  z.literal('active'),
  z.literal('inactive'),
  z.literal('pending')
]);

const userSchema = z.object({
  status: statusSchema
});
```

For more information on Zod, see the [Zod documentation](https://github.com/colinhacks/zod).

# Bridge API

The Bridge API provides methods for interacting with backend APIs that follow the Bridge pattern.

## Overview

The `BridgeApiService` class provides standardized CRUD operations, advanced search capabilities, and support for custom endpoints.

## API Reference

### `BridgeApiService<T>`

Generic class for interacting with Bridge API endpoints. The type parameter `T` represents the entity type.

#### Constructor

```typescript
constructor(apiClient: ApiClient, config: EntityConfig)
```

Creates a new Bridge API service.

##### Parameters

- `apiClient` (ApiClient): API client for making requests
- `config` (EntityConfig): Entity configuration
  - `endpoint` (string): Entity endpoint name
  - `basePath` (string, optional): Custom base path (overrides the global bridgeBasePath)
  - `customEndpoints` (Record<string, string>, optional): Custom endpoints for this entity

##### Example

```typescript
import { BridgeApiService, ApiClient } from '@pubflow/core';

// Define entity type
interface User {
  id: string;
  name: string;
  email: string;
}

// Create Bridge API service
const userService = new BridgeApiService<User>(
  new ApiClient(config, storage),
  {
    endpoint: 'users',
    customEndpoints: {
      activate: '/users/activate',
      deactivate: '/users/deactivate'
    }
  }
);
```

#### Methods

### `getList(params?)`

Gets a list of entities.

##### Parameters

- `params` (QueryParams, optional): Query parameters
  - `page` (number, optional): Page number (1-based)
  - `limit` (number, optional): Number of items per page
  - `orderBy` (string, optional): Field to sort by
  - `orderDir` ('asc' | 'desc', optional): Sort direction
  - `useRows` (boolean, optional): Whether to use rows property in response

##### Returns

- (Promise<PaginatedResponse<T>>): Paginated list of entities
  - `data` (T[]): Array of entities
  - `meta` (PaginationMeta): Pagination metadata
    - `page` (number): Current page
    - `limit` (number): Items per page
    - `total` (number): Total number of items
    - `hasMore` (boolean): Whether there are more pages

##### Example

```typescript
const { data: users, meta } = await userService.getList({
  page: 1,
  limit: 10,
  orderBy: 'name',
  orderDir: 'asc'
});

console.log(`Showing ${users.length} of ${meta.total} users`);
```

### `getById(id, params?)`

Gets an entity by ID.

##### Parameters

- `id` (string): Entity ID
- `params` (QueryParams, optional): Query parameters

##### Returns

- (Promise<T>): Entity

##### Example

```typescript
const user = await userService.getById('123');
console.log('User:', user.name);
```

### `create(data)`

Creates a new entity.

##### Parameters

- `data` (Partial<T>): Entity data

##### Returns

- (Promise<T>): Created entity

##### Example

```typescript
const newUser = await userService.create({
  name: 'John Doe',
  email: 'john@example.com'
});

console.log('Created user with ID:', newUser.id);
```

### `update(id, data)`

Updates an existing entity.

##### Parameters

- `id` (string): Entity ID
- `data` (Partial<T>): Entity data

##### Returns

- (Promise<T>): Updated entity

##### Example

```typescript
const updatedUser = await userService.update('123', {
  name: 'Jane Doe'
});

console.log('Updated user:', updatedUser.name);
```

### `delete(id)`

Deletes an entity.

##### Parameters

- `id` (string): Entity ID

##### Returns

- (Promise<void>)

##### Example

```typescript
await userService.delete('123');
console.log('User deleted');
```

### `search(params)`

Searches for entities.

##### Parameters

- `params` (SearchParams): Search parameters
  - `q` (string, optional): Search term for full-text search
  - `filters` (FilterDefinition[], optional): Filters to apply
    - `field` (string): Field to filter on
    - `operator` (FilterOperator | string): Filter operator
    - `value` (any): Filter value
  - `page` (number, optional): Page number (1-based)
  - `limit` (number, optional): Number of items per page
  - `orderBy` (string, optional): Field to sort by
  - `orderDir` ('asc' | 'desc', optional): Sort direction

##### Returns

- (Promise<PaginatedResponse<T>>): Paginated list of entities

##### Example

```typescript
const { data: users, meta } = await userService.search({
  q: 'john',
  filters: [
    { field: 'status', operator: 'equals', value: 'active' },
    { field: 'age', operator: 'gt', value: 18 }
  ],
  page: 1,
  limit: 10,
  orderBy: 'name',
  orderDir: 'asc'
});

console.log(`Found ${meta.total} users matching the search criteria`);
```

### `callCustomEndpoint<R>(endpointKey, data?, method?)`

Calls a custom endpoint.

##### Parameters

- `endpointKey` (string): Key of the custom endpoint
- `data` (any, optional): Request data
- `method` (HttpMethod, optional): HTTP method. Default: 'POST'

##### Returns

- (Promise<R>): Response data

##### Example

```typescript
// Activate a user
const result = await userService.callCustomEndpoint<{ success: boolean }>(
  'activate',
  { userId: '123' }
);

console.log('Activation result:', result.success);

// Deactivate a user
const result = await userService.callCustomEndpoint<{ success: boolean }>(
  'deactivate',
  { userId: '123' }
);

console.log('Deactivation result:', result.success);
```

## Filter Operators

The `FilterOperator` enum provides the following operators for filtering:

- `EQUALS`: Equals
- `NOT_EQUALS`: Not equals
- `CONTAINS`: Contains
- `NOT_CONTAINS`: Does not contain
- `STARTS_WITH`: Starts with
- `ENDS_WITH`: Ends with
- `GREATER_THAN`: Greater than
- `GREATER_THAN_OR_EQUALS`: Greater than or equals
- `LESS_THAN`: Less than
- `LESS_THAN_OR_EQUALS`: Less than or equals
- `IN`: In list
- `NOT_IN`: Not in list
- `IS_NULL`: Is null
- `IS_NOT_NULL`: Is not null

Example:

```typescript
import { FilterOperator } from '@pubflow/core';

const { data: users } = await userService.search({
  filters: [
    { field: 'name', operator: FilterOperator.CONTAINS, value: 'john' },
    { field: 'age', operator: FilterOperator.GREATER_THAN, value: 18 },
    { field: 'status', operator: FilterOperator.IN, value: ['active', 'pending'] },
    { field: 'deletedAt', operator: FilterOperator.IS_NULL, value: true }
  ]
});
```

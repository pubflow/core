# Utilities API

The Utilities API provides helper functions for common tasks.

## Overview

Pubflow includes various utility functions to help with common tasks such as deep merging objects, debouncing functions, and parsing JSON safely.

## API Reference

### `deepMerge(target, source)`

Deep merges two objects.

#### Parameters

- `target` (T extends object): Target object
- `source` (U extends object): Source object

#### Returns

- (T & U): Merged object

#### Example

```typescript
import { deepMerge } from '@pubflow/core';

const obj1 = { a: 1, b: { c: 2 } };
const obj2 = { b: { d: 3 }, e: 4 };

const merged = deepMerge(obj1, obj2);
// Result: { a: 1, b: { c: 2, d: 3 }, e: 4 }
```

### `isObject(item)`

Checks if a value is an object.

#### Parameters

- `item` (any): Value to check

#### Returns

- (boolean): Whether the value is an object

#### Example

```typescript
import { isObject } from '@pubflow/core';

console.log(isObject({})); // true
console.log(isObject([])); // false
console.log(isObject(null)); // false
console.log(isObject(42)); // false
```

### `formatError(error)`

Formats an error message.

#### Parameters

- `error` (any): Error object or string

#### Returns

- (string): Formatted error message

#### Example

```typescript
import { formatError } from '@pubflow/core';

try {
  // Some code that might throw an error
} catch (error) {
  console.error(formatError(error));
}
```

### `debounce(func, wait)`

Debounces a function.

#### Parameters

- `func` (T extends (...args: any[]) => any): Function to debounce
- `wait` (number): Wait time in milliseconds

#### Returns

- ((...args: Parameters<T>) => void): Debounced function

#### Example

```typescript
import { debounce } from '@pubflow/core';

// Create a debounced function that will only execute after 300ms of inactivity
const debouncedSearch = debounce((query) => {
  // Search logic
  console.log('Searching for:', query);
}, 300);

// Call the debounced function
debouncedSearch('hello'); // Will not execute immediately
debouncedSearch('hello world'); // Will cancel the previous call
// After 300ms, 'Searching for: hello world' will be logged
```

### `throttle(func, limit)`

Throttles a function.

#### Parameters

- `func` (T extends (...args: any[]) => any): Function to throttle
- `limit` (number): Limit in milliseconds

#### Returns

- ((...args: Parameters<T>) => void): Throttled function

#### Example

```typescript
import { throttle } from '@pubflow/core';

// Create a throttled function that will execute at most once every 1000ms
const throttledScroll = throttle(() => {
  // Scroll handling logic
  console.log('Scroll event handled');
}, 1000);

// Add event listener
window.addEventListener('scroll', throttledScroll);
```

### `randomString(length)`

Generates a random string.

#### Parameters

- `length` (number): Length of the string

#### Returns

- (string): Random string

#### Example

```typescript
import { randomString } from '@pubflow/core';

const id = randomString(10);
console.log('Random ID:', id);
```

### `safeJsonParse(json, fallback)`

Parses a JSON string safely.

#### Parameters

- `json` (string | null): JSON string
- `fallback` (T): Fallback value if parsing fails

#### Returns

- (T): Parsed JSON or fallback

#### Example

```typescript
import { safeJsonParse } from '@pubflow/core';

// Parse user data from localStorage
const userData = safeJsonParse(localStorage.getItem('user_data'), null);

if (userData) {
  console.log('User:', userData.name);
} else {
  console.log('No user data found');
}
```

## Common Use Cases

### Debouncing Search Input

```typescript
import { debounce } from '@pubflow/core';
import React, { useState, useCallback } from 'react';

function SearchComponent() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  
  // Create a debounced search function
  const debouncedSearch = useCallback(
    debounce(async (searchQuery) => {
      // Perform search
      const response = await fetch(`/api/search?q=${searchQuery}`);
      const data = await response.json();
      setResults(data);
    }, 300),
    []
  );
  
  // Handle input change
  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  };
  
  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder="Search..."
      />
      <ul>
        {results.map((result) => (
          <li key={result.id}>{result.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

### Throttling Scroll Events

```typescript
import { throttle } from '@pubflow/core';
import React, { useEffect, useState } from 'react';

function ScrollComponent() {
  const [scrollPosition, setScrollPosition] = useState(0);
  
  useEffect(() => {
    // Create a throttled scroll handler
    const handleScroll = throttle(() => {
      const position = window.scrollY;
      setScrollPosition(position);
      
      // Load more content if near bottom
      if (position + window.innerHeight >= document.body.offsetHeight - 200) {
        console.log('Loading more content...');
        // Load more content
      }
    }, 200);
    
    // Add event listener
    window.addEventListener('scroll', handleScroll);
    
    // Clean up
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  return (
    <div>
      <p>Scroll position: {scrollPosition}px</p>
      {/* Content */}
    </div>
  );
}
```

### Safe Storage Access

```typescript
import { safeJsonParse } from '@pubflow/core';

// Get user preferences from storage
function getUserPreferences() {
  const defaultPreferences = {
    theme: 'light',
    fontSize: 'medium',
    notifications: true
  };
  
  return safeJsonParse(localStorage.getItem('user_preferences'), defaultPreferences);
}

// Save user preferences to storage
function saveUserPreferences(preferences) {
  try {
    localStorage.setItem('user_preferences', JSON.stringify(preferences));
    return true;
  } catch (error) {
    console.error('Failed to save preferences:', error);
    return false;
  }
}
```

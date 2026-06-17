# Pubflow Framework Documentation

Welcome to the Pubflow Framework documentation. This guide provides comprehensive information about the Pubflow Framework, its architecture, components, and usage.

## Table of Contents

- [Introduction](#introduction)
- [Getting Started](#getting-started)
- [Core Concepts](#core-concepts)
- [API Reference](#api-reference)
- [Guides](#guides)
- [Examples](#examples)

## Introduction

Pubflow is a modular framework designed to simplify interaction with backend APIs, particularly those following the Bridge pattern. It provides a standardized way to handle authentication, data operations, and UI components across different platforms.

### Key Features

- **Multi-initialization**: Support for connecting to multiple backends
- **Authentication**: Session token management with secure storage
- **Bridge API**: Standardized CRUD operations with type safety
- **Schema Validation**: Client-side data validation with Zod
- **Platform Adapters**: Support for React, Next.js, and React Native

## Getting Started

To get started with Pubflow, you need to install the core package and the appropriate adapter for your platform:

```bash
# For React applications
npm install @pubflow/core @pubflow/react

# For Next.js applications
npm install @pubflow/core @pubflow/nextjs

# For React Native applications
npm install @pubflow/core @pubflow/react-native
```

Then, initialize the framework in your application:

```typescript
import { PubflowProvider } from '@pubflow/react'; // or @pubflow/nextjs, @pubflow/react-native

function App() {
  return (
    <PubflowProvider 
      config={{
        baseUrl: 'https://api.example.com'
      }}
    >
      {/* Your application */}
    </PubflowProvider>
  );
}
```

## Core Concepts

Pubflow is built around several core concepts:

- **Configuration**: Centralized configuration with support for multiple instances
- **Authentication**: User authentication and session management
- **Bridge API**: Standardized API for CRUD operations
- **Schema Validation**: Client-side data validation
- **Storage**: Abstract storage interface for different platforms

For more details, see the [Core Concepts](./core-concepts.md) guide.

## API Reference

- [Configuration](./api/configuration.md)
- [Authentication](./api/authentication.md)
- [Bridge API](./api/bridge-api.md)
- [Schema Validation](./api/schema-validation.md)
- [Storage](./api/storage.md)
- [Utilities](./api/utilities.md)

## Guides

- [Multi-initialization](./guides/multi-initialization.md)
- [Multi-backend Modules](./multi-backend-modules.md)
- [Authentication Flow](./guides/authentication-flow.md)
- [Advanced Search](./guides/advanced-search.md)
- [Schema Validation](./guides/schema-validation.md)
- [Custom Endpoints](./guides/custom-endpoints.md)

## Examples

- [Basic CRUD Operations](./examples/basic-crud.md)
- [Authentication](./examples/authentication.md)
- [Advanced Search](./examples/advanced-search.md)
- [Multi-backend](./examples/multi-backend.md)

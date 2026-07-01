# @agarwal-ai/core

Core utilities, types, and configuration for the AGARWAL AI Framework.

## Installation

```bash
npm install @agarwal-ai/core
```

## Quick Start

```typescript
import { createAgarwal, withRetry, generateId } from '@agarwal-ai/core';

// Initialize the framework
const framework = createAgarwal({
  name: 'my-project',
  settings: { logLevel: 'info', environment: 'production' }
});

// Check active layers
console.log(framework.getActiveLayers());
// => ['agent', 'governance', 'workflow', 'autonomous', 'lifecycle']

// Enable quantum layer when ready
framework.enableLayer('resilient');

// Retry utility
const result = await withRetry(
  () => fetchDataFromAPI(),
  { maxRetries: 3, baseDelay: 1000 }
);
```

## API

### `createAgarwal(config?)`
Initialize the AGARWAL framework with optional configuration.

### `withRetry(fn, options?)`
Retry an async function with exponential backoff.

### `generateId(prefix?)`
Generate a unique, timestamped ID.

### `deepMerge(target, ...sources)`
Deep merge objects (useful for config composition).

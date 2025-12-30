# batching-buffer

A utility for batching events with configurable size limits and timeouts. Automatically collects items and processes them in batches when either the maximum buffer size is reached or a timeout period elapses.

## Installation

```bash
npm install batching-buffer
# or
pnpm add batching-buffer
# or
yarn add batching-buffer
# or
bun add batching-buffer
```

## Usage

### Basic Example

```typescript
import { BatchingBuffer } from 'batching-buffer';

const buffer = new BatchingBuffer({
  maxSize: 10,
  callback: (events) => {
    console.log('Processing batch:', events);
    // Process your events here
  },
});

// Add items to the buffer
buffer.add({ id: 1, data: 'item1' });
buffer.add({ id: 2, data: 'item2' });
// ... when 10 items are added, callback is automatically called
```

### With Timeout

```typescript
import { BatchingBuffer } from 'batching-buffer';

const buffer = new BatchingBuffer({
  maxSize: 10,
  timeout: 5000, // Flush after 5 seconds if buffer is not full
  callback: (events) => {
    console.log('Processing batch:', events);
  },
});

buffer.add({ id: 1 });
// If no more items are added within 5 seconds, callback is called
```

### Manual Flush

```typescript
const buffer = new BatchingBuffer({
  maxSize: 10,
  callback: (events) => {
    console.log('Processing batch:', events);
  },
});

buffer.add({ id: 1 });
buffer.add({ id: 2 });
buffer.flush(); // Manually trigger processing
```

## API

### `BatchingBuffer<TEvent>`

A generic class that batches events of type `TEvent`.

#### Constructor

```typescript
new BatchingBuffer(config: BatchingBufferConfig<TEvent>)
```

#### Configuration

```typescript
type BatchingBufferConfig<TEvent> = {
  maxSize: number;        // Maximum number of items before auto-flush
  timeout?: number;      // Optional timeout in milliseconds
  callback: (events: TEvent[]) => unknown; // Called when batch is flushed
};
```

#### Methods

- **`add(item: TEvent)`**: Add an item to the buffer. Automatically flushes when `maxSize` is reached.
- **`flush()`**: Manually flush the buffer, calling the callback with all current items.
- **`buffer`**: Read-only property that returns the current buffer array.

## Behavior

- **Size-based flushing**: When `maxSize` items are added, the buffer automatically flushes.
- **Timeout-based flushing**: If `timeout` is set, the buffer flushes after the timeout period if items were added but the buffer hasn't reached `maxSize`.
- **Timer management**: The timeout timer is automatically cleared when the buffer is flushed due to size limits.
- **Empty buffer protection**: Calling `flush()` on an empty buffer does nothing.

## Examples

### Logging Events

```typescript
import { BatchingBuffer } from 'batching-buffer';

const logBuffer = new BatchingBuffer({
  maxSize: 50,
  timeout: 1000,
  callback: (logs) => {
    // Send logs to your logging service
    fetch('/api/logs', {
      method: 'POST',
      body: JSON.stringify(logs),
    });
  },
});

// Throughout your application
logBuffer.add({ level: 'info', message: 'User logged in' });
logBuffer.add({ level: 'error', message: 'Failed to connect' });
```

### Analytics Events

```typescript
import { BatchingBuffer } from 'batching-buffer';

const analyticsBuffer = new BatchingBuffer({
  maxSize: 20,
  timeout: 30000, // 30 seconds
  callback: (events) => {
    // Send to analytics service
    analytics.trackBatch(events);
  },
});

// Track user actions
analyticsBuffer.add({ event: 'click', element: 'button' });
analyticsBuffer.add({ event: 'view', page: '/home' });
```

## Requirements

- Node.js 18+ or Bun
- TypeScript 5+ (for TypeScript projects)

## License

MIT

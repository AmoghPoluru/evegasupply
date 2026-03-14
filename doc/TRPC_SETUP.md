# How to Setup tRPC

This guide will walk you through setting up tRPC with Next.js App Router and React Query from scratch.

## Prerequisites

- Node.js 18+ installed
- Next.js project with App Router
- Basic understanding of TypeScript

## Step 1: Install Dependencies

Install the required tRPC and React Query packages:

```bash
npm install @trpc/server @trpc/client @trpc/next @trpc/react-query @trpc/tanstack-react-query @tanstack/react-query superjson zod
```

**Package explanations:**
- `@trpc/server`: Core tRPC server functionality
- `@trpc/client`: Client-side tRPC client
- `@trpc/next`: Next.js integration utilities
- `@trpc/react-query`: React Query integration (legacy)
- `@trpc/tanstack-react-query`: Modern React Query integration
- `@tanstack/react-query`: React Query for data fetching
- `superjson`: Serialization for complex types (Date, Map, Set, etc.)
- `zod`: Schema validation library

## Step 2: Create tRPC Directory Structure

Create the tRPC directory structure:

```bash
mkdir -p src/trpc/routers
```

Your structure should look like:
```
src/trpc/
├── init.ts
├── routers/
│   └── _app.ts
├── server.tsx
├── client.tsx
└── query-client.ts
```

## Step 3: Initialize tRPC (Core Setup)

Create `src/trpc/init.ts`:

```typescript
import { initTRPC } from '@trpc/server';
import superjson from 'superjson';

/**
 * Context type definition
 * Add context properties here as needed (db, session, user, etc.)
 */
export type Context = {
  // Add context properties here
  // For example: db, session, user, etc.
};

/**
 * Context creation function
 * This will be used in API routes and server components
 */
export const createTRPCContext = async (): Promise<Context> => {
  // Add context creation logic here
  // For example: get user session, database connection, etc.
  return {};
};

/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
export const createTRPCRouter = t.router;
export const baseProcedure = t.procedure;
```

**What this does:**
- Sets up the base tRPC instance
- Defines the context type (for request context like user, db, etc.)
- Creates reusable router and procedure helpers
- Configures superjson transformer for complex types

## Step 4: Create Query Client Configuration

Create `src/trpc/query-client.ts`:

```typescript
import {
  defaultShouldDehydrateQuery,
  QueryClient,
} from '@tanstack/react-query';
import superjson from 'superjson';

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000, // 30 seconds
      },
      dehydrate: {
        serializeData: superjson.serialize,
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === 'pending',
      },
      hydrate: {
        deserializeData: superjson.deserialize,
      },
    },
  });
}
```

**What this does:**
- Creates a React Query client with proper configuration
- Sets stale time to 30 seconds
- Configures superjson for serialization/deserialization
- Handles pending queries for SSR

## Step 5: Create Main Router

Create `src/trpc/routers/_app.ts`:

```typescript
import { z } from 'zod';
import { baseProcedure, createTRPCRouter } from '../init';

export const appRouter = createTRPCRouter({
  hello: baseProcedure
    .input(
      z.object({
        text: z.string().optional(),
      }),
    )
    .query((opts) => {
      return {
        greeting: `Hello ${opts.input.text ?? 'world'}!`,
      };
    }),
});

export type AppRouter = typeof appRouter;
```

**What this does:**
- Creates the main router with all your API endpoints
- Defines a simple `hello` query endpoint as an example
- Exports the router type for client-side type safety

## Step 6: Create Server-Side Utilities

Create `src/trpc/server.tsx`:

```typescript
import 'server-only'; // Ensures this file cannot be imported from client
import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query';
import { cache } from 'react';
import { makeQueryClient } from './query-client';
import { appRouter } from './routers/_app';
import { createTRPCContext } from './init';

// Create a stable getter for the query client
export const getQueryClient = cache(makeQueryClient);

export const trpc = createTRPCOptionsProxy({
  ctx: createTRPCContext,
  router: appRouter,
  queryClient: getQueryClient,
});

// Helper function to hydrate client
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

export function HydrateClient(props: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {props.children}
    </HydrationBoundary>
  );
}

// Helper function to prefetch queries
export function prefetch<T extends ReturnType<typeof trpc.hello.queryOptions>>(
  queryOptions: T,
) {
  const queryClient = getQueryClient();
  if (queryOptions.queryKey[1]?.type === 'infinite') {
    void queryClient.prefetchInfiniteQuery(queryOptions as any);
  } else {
    void queryClient.prefetchQuery(queryOptions);
  }
}

// Server caller for direct server component usage
export const caller = appRouter.createCaller(createTRPCContext);
```

**What this does:**
- Provides server-side utilities for prefetching and hydrating data
- Creates a stable query client getter
- Exports a direct caller for server components

## Step 7: Create Client-Side Provider

Create `src/trpc/client.tsx`:

```typescript
'use client';
import type { QueryClient } from '@tanstack/react-query';
import { QueryClientProvider } from '@tanstack/react-query';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { createTRPCContext } from '@trpc/tanstack-react-query';
import { useState } from 'react';
import superjson from 'superjson';
import { makeQueryClient } from './query-client';
import type { AppRouter } from './routers/_app';

export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>();

let browserQueryClient: QueryClient;

function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return makeQueryClient();
  }
  // Browser: make a new query client if we don't already have one
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}

function getUrl() {
  const base = (() => {
    if (typeof window !== 'undefined') return '';
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
    return 'http://localhost:3000';
  })();
  return `${base}/api/trpc`;
}

export function TRPCReactProvider(
  props: Readonly<{
    children: React.ReactNode;
  }>,
) {
  const queryClient = getQueryClient();
  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [
        httpBatchLink({
          transformer: superjson,
          url: getUrl(),
        }),
      ],
    }),
  );
  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        {props.children}
      </TRPCProvider>
    </QueryClientProvider>
  );
}
```

**What this does:**
- Creates the client-side tRPC provider
- Sets up React Query provider
- Configures HTTP batch link for efficient requests
- Handles URL resolution for different environments

## Step 8: Create API Route Handler

Create `src/app/api/trpc/[trpc]/route.ts`:

```typescript
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/trpc/routers/_app';
import { createTRPCContext } from '@/trpc/init';

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: createTRPCContext,
  });

export { handler as GET, handler as POST };
```

**What this does:**
- Creates the Next.js API route handler
- Exposes tRPC endpoints at `/api/trpc/*`
- Handles both GET and POST requests

## Step 9: Add Provider to Root Layout

Update `src/app/layout.tsx` to wrap your app with the tRPC provider:

```typescript
import { TRPCReactProvider } from "@/trpc/client";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <TRPCReactProvider>
          {children}
        </TRPCReactProvider>
      </body>
    </html>
  );
}
```

## Step 10: Test Your Setup

Create a test component to verify everything works.

Create `src/app/test/page.tsx`:

```typescript
'use client';
import { useTRPC } from '@/trpc/client';

export default function TestPage() {
  const { data, isLoading } = useTRPC.hello.useQuery({ text: 'tRPC' });
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      <h1>tRPC Test</h1>
      <p>{data?.greeting}</p>
    </div>
  );
}
```

Visit `http://localhost:3000/test` and you should see "Hello tRPC!".

## Step 11: Verify Setup

- ✅ tRPC provider wraps your app
- ✅ API route handler created
- ✅ Can call tRPC endpoints from client components
- ✅ Type safety works (autocomplete in IDE)

## Adding New Endpoints

### Example: Add a Query Endpoint

In `src/trpc/routers/_app.ts`:

```typescript
export const appRouter = createTRPCRouter({
  // ... existing endpoints
  
  getUser: baseProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      // Your logic here
      return { id: input.id, name: 'John Doe' };
    }),
});
```

Use in component:
```typescript
const { data } = useTRPC.getUser.useQuery({ id: '123' });
```

### Example: Add a Mutation Endpoint

In `src/trpc/routers/_app.ts`:

```typescript
export const appRouter = createTRPCRouter({
  // ... existing endpoints
  
  updateUser: baseProcedure
    .input(z.object({ 
      id: z.string(),
      name: z.string() 
    }))
    .mutation(async ({ input }) => {
      // Your logic here
      return { success: true };
    }),
});
```

Use in component:
```typescript
const updateUser = useTRPC.updateUser.useMutation();

const handleUpdate = async () => {
  await updateUser.mutateAsync({ id: '123', name: 'Jane Doe' });
};
```

## Using in Server Components

### Option 1: Prefetch and Hydrate

```typescript
import { prefetch } from '@/trpc/server';
import { trpc } from '@/trpc/server';
import { HydrateClient } from '@/trpc/server';
import ClientComponent from './client-component';

export default async function ServerPage() {
  await prefetch(trpc.hello.queryOptions({ text: 'Server' }));
  
  return (
    <HydrateClient>
      <ClientComponent />
    </HydrateClient>
  );
}
```

### Option 2: Direct Caller

```typescript
import { caller } from '@/trpc/server';

export default async function ServerPage() {
  const result = await caller.hello({ text: 'Direct' });
  
  return <div>{result.greeting}</div>;
}
```

## Adding Context (Database, Auth, etc.)

Update `src/trpc/init.ts` to add context:

```typescript
export type Context = {
  db: Database; // Your database instance
  user: User | null; // Authenticated user
  // ... other context properties
};

export const createTRPCContext = async (): Promise<Context> => {
  // Get user from session/cookie
  const user = await getCurrentUser();
  
  return {
    db: getDatabase(),
    user,
  };
};
```

## Troubleshooting

### "Cannot find module" errors
- Ensure all packages are installed
- Check TypeScript path aliases in `tsconfig.json`

### Type errors
- Make sure `AppRouter` type is exported from `_app.ts`
- Regenerate types if you've changed the router

### API route not found
- Verify the route file is at `src/app/api/trpc/[trpc]/route.ts`
- Check that Next.js is running (`npm run dev`)

### Context errors
- Ensure `createTRPCContext` returns the correct type
- Check that context is properly typed in `init.ts`

## Next Steps

- Add authentication middleware
- Create protected procedures
- Add error handling
- Set up database integration
- Add more complex endpoints

## Resources

- [tRPC Documentation](https://trpc.io/docs)
- [tRPC with Next.js](https://trpc.io/docs/nextjs)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Zod Documentation](https://zod.dev)

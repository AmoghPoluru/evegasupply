import { initTRPC } from '@trpc/server';
import { getPayload } from 'payload';
import config from '@payload-config';
import superjson from 'superjson';
import { headers as getHeaders } from 'next/headers';

import { cache } from 'react';

export const createTRPCContext = cache(async () => {
  /**
   * @see: https://trpc.io/docs/server/context
   * Creates the base context for tRPC calls
   * The procedures will extend this context with payload, headers, etc.
   */
  const payload = await getPayload({ config });
  const headers = await getHeaders();
  
  return {
    payload,
    headers,
  };
});

// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.context<typeof createTRPCContext>().create({
  /**
   * @see https://trpc.io/docs/server/data-transformers
   */
  transformer: superjson,
});

// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure.use(async ({ ctx, next }) => {
  // Use payload from context if available, otherwise create new instance
  const payload = ctx.payload || await getPayload({ config });

  return next({ ctx: { ...ctx, payload } });
});

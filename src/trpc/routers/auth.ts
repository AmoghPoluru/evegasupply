import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { headers as getHeaders } from 'next/headers';
import { baseProcedure, createTRPCRouter } from '../init';
import { generateAuthCookie, clearAuthCookie } from '@/lib/auth-utils';

export const authRouter = createTRPCRouter({
  session: baseProcedure.query(async ({ ctx }) => {
    const headers = await getHeaders();
    const session = await ctx.payload.auth({ headers });
    return session;
  }),

  register: baseProcedure
    .input(
      z.object({
        name: z.string().min(2, 'Name must be at least 2 characters'),
        email: z.string().email('Invalid email address'),
        password: z.string().min(6, 'Password must be at least 6 characters'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user already exists
      const existingUsers = await ctx.payload.find({
        collection: 'users',
        where: {
          email: {
            equals: input.email,
          },
        },
        limit: 1,
      });

      if (existingUsers.docs.length > 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'User with this email already exists',
        });
      }

      // Create user
      await ctx.payload.create({
        collection: 'users',
        data: {
          name: input.name,
          email: input.email,
          password: input.password,
          role: 'user', // Default role
        },
      });

      // Login the user after registration
      const data = await ctx.payload.login({
        collection: 'users',
        data: {
          email: input.email,
          password: input.password,
        },
      });

      if (!data.token) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Failed to login after registration',
        });
      }

      // Set the authentication cookie
      await generateAuthCookie({
        prefix: ctx.payload.config.cookiePrefix,
        value: data.token,
      });

      // Return user without password
      const { password: _, ...userWithoutPassword } = data.user;
      return {
        user: userWithoutPassword,
      };
    }),

  login: baseProcedure
    .input(
      z.object({
        email: z.string().email('Invalid email address'),
        password: z.string().min(1, 'Password is required'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const data = await ctx.payload.login({
          collection: 'users',
          data: {
            email: input.email,
            password: input.password,
          },
        });

        if (!data.token) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Invalid email or password',
          });
        }

        // Set the authentication cookie
        await generateAuthCookie({
          prefix: ctx.payload.config.cookiePrefix,
          value: data.token,
        });

        // Return user without password
        const { password: _, ...userWithoutPassword } = data.user;
        return {
          user: userWithoutPassword,
          token: data.token,
        };
      } catch (error) {
        // Re-throw TRPCErrors as-is (they already have user-friendly messages)
        if (error instanceof TRPCError) {
          throw error;
        }

        // For any other errors (including Payload authentication errors),
        // throw a user-friendly error message
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid email or password',
        });
      }
    }),

  logout: baseProcedure.mutation(async ({ ctx }) => {
    await clearAuthCookie({
      prefix: ctx.payload.config.cookiePrefix,
    });
    return { success: true };
  }),

  getCurrentUser: baseProcedure.query(async ({ ctx }) => {
    const headers = await getHeaders();
    const session = await ctx.payload.auth({ headers });

    if (!session.user) {
      return null;
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = session.user;
    return userWithoutPassword;
  }),
});

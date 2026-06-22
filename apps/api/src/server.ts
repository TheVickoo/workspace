import Fastify from 'fastify';
import cors from 'cors';
import { db } from '@repsync/db';
import * as schema from '@repsync/db';
import { eq, desc } from 'drizzle-orm';
import dotenv from 'dotenv';

dotenv.config();

const fastify = Fastify({
  logger: true,
});

// Use basic express-style middleware for cors if needed, or fastify-cors
// Let's use @fastify/cors instead of cors for better compatibility, but for now we'll write a manual response header or use fastify plugin.
fastify.addHook('onRequest', (request, reply, done) => {
  reply.header('Access-Control-Allow-Origin', '*');
  reply.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (request.method === 'OPTIONS') {
    reply.send();
  } else {
    done();
  }
});

const DEFAULT_USER_ID = 'local_admin';

// Basic REST endpoints for the React dashboard
fastify.get('/api/workouts', async (request, reply) => {
  const recentWorkouts = await db.query.workouts.findMany({
    where: eq(schema.workouts.userId, DEFAULT_USER_ID),
    orderBy: [desc(schema.workouts.date)],
    with: {
      // Assuming we setup relations in schema.ts, if not we'll join or fetch directly
    },
    limit: 10,
  });
  return recentWorkouts;
});

fastify.get('/api/routines/latest', async (request, reply) => {
  const latestRoutine = await db.query.aiRoutines.findFirst({
    where: eq(schema.aiRoutines.userId, DEFAULT_USER_ID),
    orderBy: [desc(schema.aiRoutines.createdAt)],
  });
  return latestRoutine || null;
});

const start = async () => {
  try {
    await fastify.listen({ port: 3001, host: '0.0.0.0' });
    console.log('Fastify API running on http://localhost:3001');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();

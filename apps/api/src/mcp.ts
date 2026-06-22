import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { db } from '@repsync/db';
import * as schema from '@repsync/db';
import { eq, desc } from 'drizzle-orm';

const server = new Server(
  {
    name: 'repsync-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const DEFAULT_USER_ID = 'local_admin';

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'get_recent_workouts',
        description: 'Get the user\'s most recent logged workouts.',
        inputSchema: {
          type: 'object',
          properties: {
            limit: {
              type: 'number',
              description: 'Number of recent workouts to retrieve (default: 5)',
            },
          },
        },
      },
      {
        name: 'generate_routine',
        description: 'Save a new AI-generated workout routine for the user.',
        inputSchema: {
          type: 'object',
          properties: {
            aiMessage: {
              type: 'string',
              description: 'A message from the coach explaining the routine.',
            },
            plannedExercises: {
              type: 'array',
              description: 'Array of planned exercises with target sets/reps/weight',
              items: {
                type: 'object',
                properties: {
                  exerciseName: { type: 'string' },
                  targetSets: { type: 'number' },
                  targetReps: { type: 'number' },
                  targetWeight: { type: 'number', description: 'Target weight in kg/lbs' }
                },
                required: ['exerciseName', 'targetSets', 'targetReps']
              }
            }
          },
          required: ['aiMessage', 'plannedExercises'],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const toolName = request.params.name;
  
  if (toolName === 'get_recent_workouts') {
    const limit = (request.params.arguments?.limit as number) || 5;
    
    // We'll fetch workouts, but for the MCP we should probably include sets.
    // Assuming simple fetch for now since relations aren't fully defined.
    const workouts = await db
      .select()
      .from(schema.workouts)
      .where(eq(schema.workouts.userId, DEFAULT_USER_ID))
      .orderBy(desc(schema.workouts.date))
      .limit(limit);
      
    return {
      content: [{ type: 'text', text: JSON.stringify(workouts, null, 2) }],
    };
  }
  
  if (toolName === 'generate_routine') {
    const aiMessage = request.params.arguments?.aiMessage as string;
    const plannedExercises = request.params.arguments?.plannedExercises;
    
    const id = crypto.randomUUID();
    
    await db.insert(schema.aiRoutines).values({
      id,
      userId: DEFAULT_USER_ID,
      aiMessage,
      plannedExercises,
    });
    
    return {
      content: [{ type: 'text', text: `Successfully generated and saved routine: ${id}` }],
    };
  }

  throw new Error(`Tool not found: ${toolName}`);
});

const transport = new StdioServerTransport();
server.connect(transport).then(() => {
  // Use console.error for logging in stdio mode, as console.log breaks the protocol
  console.error('RepSync MCP Server running on stdio');
});

import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// 1. users
export const users = sqliteTable('users', {
  id: text('id').primaryKey(), // e.g., 'local_admin'
});

// 2. exercises
export const exercises = sqliteTable('exercises', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  category: text('category').notNull(), // 'legs', 'push', 'pull', 'core'
});

// 3. workouts
export const workouts = sqliteTable('workouts', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  date: integer('date', { mode: 'timestamp' })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  notes: text('notes'),
});

// 4. workout_sets
export const workoutSets = sqliteTable('workout_sets', {
  id: text('id').primaryKey(),
  workoutId: text('workout_id')
    .notNull()
    .references(() => workouts.id),
  exerciseId: text('exercise_id')
    .notNull()
    .references(() => exercises.id),
  setNumber: integer('set_number').notNull(),
  weight: real('weight').notNull(), // kg/lbs
  reps: integer('reps').notNull(),
  rpe: integer('rpe'), // Rate of Perceived Exertion (1-10)
});

// 5. ai_routines
export const aiRoutines = sqliteTable('ai_routines', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  targetDate: integer('target_date', { mode: 'timestamp' }),
  aiMessage: text('ai_message').notNull(),
  plannedExercises: text('planned_exercises', { mode: 'json' }).notNull(), // JSON blob for planned exercises
});

import { relations } from 'drizzle-orm';

export const usersRelations = relations(users, ({ many }) => ({
  workouts: many(workouts),
  aiRoutines: many(aiRoutines),
}));

export const workoutsRelations = relations(workouts, ({ one, many }) => ({
  user: one(users, {
    fields: [workouts.userId],
    references: [users.id],
  }),
  sets: many(workoutSets),
}));

export const workoutSetsRelations = relations(workoutSets, ({ one }) => ({
  workout: one(workouts, {
    fields: [workoutSets.workoutId],
    references: [workouts.id],
  }),
  exercise: one(exercises, {
    fields: [workoutSets.exerciseId],
    references: [exercises.id],
  }),
}));

export const exercisesRelations = relations(exercises, ({ many }) => ({
  workoutSets: many(workoutSets),
}));

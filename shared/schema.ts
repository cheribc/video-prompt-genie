import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const prompts = pgTable("prompts", {
  id: serial("id").primaryKey(),
  prompt: text("prompt").notNull(),
  category: text("category").notNull(),
  style: text("style").notNull(),
  duration: text("duration").notNull(),
  complexity: text("complexity").notNull(),
  elements: jsonb("elements").$type<{
    weather_effects: boolean;
    dynamic_lighting: boolean;
    camera_movement: boolean;
  }>().notNull(),
  metadata: jsonb("metadata").$type<{
    generated_at: string;
    version: string;
    template_id?: string;
  }>().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const templates = pgTable("templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  promptTemplate: text("prompt_template").notNull(),
  isPopular: boolean("is_popular").default(false),
  usageCount: integer("usage_count").default(0),
  rating: integer("rating").default(50), // out of 50 (5.0 * 10)
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPromptSchema = createInsertSchema(prompts).omit({
  id: true,
  createdAt: true,
});

export const insertTemplateSchema = createInsertSchema(templates).omit({
  id: true,
  createdAt: true,
  usageCount: true,
});

export type InsertPrompt = z.infer<typeof insertPromptSchema>;
export type Prompt = typeof prompts.$inferSelect;
export type InsertTemplate = z.infer<typeof insertTemplateSchema>;
export type Template = typeof templates.$inferSelect;

// Configuration types
export const promptConfigSchema = z.object({
  category: z.string(),
  style: z.string(), 
  duration: z.string(),
  complexity: z.string(),
  elements: z.object({
    weather_effects: z.boolean(),
    dynamic_lighting: z.boolean(),
    camera_movement: z.boolean(),
  }),
});

export type PromptConfig = z.infer<typeof promptConfigSchema>;

import { pgTable, serial, text, timestamp, integer, boolean, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const blogsTable = pgTable("blogs", {
  id: serial("id").primaryKey(),
  // Nullable: seeded blogs (pysy.exe, putzermann core) start without a linked user
  userId: integer("user_id").references(() => usersTable.id, { onDelete: "cascade" }),
  // For seeded blogs: the username that will have owner rights when they register
  ownerUsername: text("owner_username").unique(),
  title: text("title").notNull().default(""),
  handle: text("handle").notNull().unique(),
  description: text("description").notNull().default(""),
  avatarUrl: text("avatar_url"),
  coverUrl: text("cover_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const blogPostsTable = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  blogId: integer("blog_id").notNull().references(() => blogsTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  content: text("content").notNull().default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const blogMediaTable = pgTable("blog_media", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull().references(() => blogPostsTable.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // 'image' | 'video' | 'audio'
  url: text("url").notNull(),
  order: integer("order").notNull().default(0),
  isCircle: boolean("is_circle").notNull().default(false),
});

export const blogPostLikesTable = pgTable("blog_post_likes", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull().references(() => blogPostsTable.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => ({
  uniq: unique().on(t.postId, t.userId),
}));

export const blogCommentsTable = pgTable("blog_comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull().references(() => blogPostsTable.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const createBlogSchema = createInsertSchema(blogsTable)
  .omit({ id: true, userId: true, ownerUsername: true, createdAt: true, updatedAt: true })
  .extend({
    handle: z.string().min(1).max(50).regex(/^[a-zA-Z0-9_\-]+$/, "handle может содержать только буквы, цифры, _ и -").optional(),
    title: z.string().max(120).optional().or(z.literal("")),
    description: z.string().max(500).optional().or(z.literal("")),
  });

export const insertBlogPostSchema = createInsertSchema(blogPostsTable)
  .omit({ id: true, createdAt: true, updatedAt: true, blogId: true })
  .extend({
    media: z.array(z.object({
      type: z.enum(["image", "video", "audio"]),
      url: z.string().min(1),
      isCircle: z.boolean().optional(),
    })).default([]),
  });

export const insertBlogMediaSchema = createInsertSchema(blogMediaTable).omit({ id: true });
export type CreateBlogInput = z.infer<typeof createBlogSchema>;
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type InsertBlogMedia = z.infer<typeof insertBlogMediaSchema>;
export type Blog = typeof blogsTable.$inferSelect;
export type BlogPost = typeof blogPostsTable.$inferSelect;
export type BlogMedia = typeof blogMediaTable.$inferSelect;
export type BlogPostLike = typeof blogPostLikesTable.$inferSelect;
export type BlogComment = typeof blogCommentsTable.$inferSelect;

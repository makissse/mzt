---
name: Blog ownership model
description: How pre-seeded blogs grant ownership to future users who register with a matching username
---

# Blog ownership model

## Rule
Blogs have two fields for ownership: `userId` (nullable FK to users) and `ownerUsername` (text, nullable, unique-when-not-null). Pre-seeded blogs start with `userId = null` and `ownerUsername = "pysy"` / `"putzermann"`.

## Why
The two blog owners (pysy.exe, putzermann core) hadn't registered at build time. Ownership is granted when a user's `username` matches `blog.ownerUsername` — checked server-side in `resolveIsOwner()` in `artifacts/api-server/src/routes/blogs.ts`.

## How to apply
- Server: `resolveIsOwner(blog, userId)` checks `blog.userId === userId` first, then falls back to a DB lookup of username vs `blog.ownerUsername`.
- When the matching user first edits/posts to their blog, `userId` is auto-linked so future checks are fast.
- Frontend trusts the server's `isOwner` field in the blog response.
- To add more seeded blogs: edit `artifacts/api-server/src/lib/seed-blogs.ts`.
- Blog handles: `pysy-exe` (ownerUsername: "pysy"), `putzermann-core` (ownerUsername: "putzermann").

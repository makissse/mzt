import { db, blogsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const SEEDED_BLOGS = [
  {
    title: "pysy.exe",
    handle: "pysy-exe",
    ownerUsername: "pysy",
    description: "",
  },
  {
    title: "putzermann core",
    handle: "putzermann-core",
    ownerUsername: "host9315",
    description: "",
  },
];

export async function seedBlogs(): Promise<void> {
  for (const seed of SEEDED_BLOGS) {
    const [existing] = await db
      .select()
      .from(blogsTable)
      .where(eq(blogsTable.handle, seed.handle))
      .limit(1);

    if (!existing) {
      await db.insert(blogsTable).values({
        userId: null,
        ownerUsername: seed.ownerUsername,
        title: seed.title,
        handle: seed.handle,
        description: seed.description,
        avatarUrl: null,
        coverUrl: null,
      });
      console.log(`[seed] Created blog: ${seed.title} (@${seed.handle})`);
    } else if (existing.ownerUsername !== seed.ownerUsername) {
      // Keep ownerUsername in sync with seed config
      await db.update(blogsTable)
        .set({ ownerUsername: seed.ownerUsername })
        .where(eq(blogsTable.handle, seed.handle));
    }
  }
}

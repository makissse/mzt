// Display overrides for the two seeded test blogs.
// These blogs are owned by fixed editor accounts, so the UI should always
// show the blog's owner nickname/initials regardless of who is logged in.

const BLOG_META: Record<
  string,
  { ownerHandle: string; avatarFallback: string }
> = {
  'pysy-exe': { ownerHandle: 'pysy', avatarFallback: 'P' },
  'putzermann-core': { ownerHandle: 'host9315', avatarFallback: 'PC' },
};

export function getBlogMeta(handle: string) {
  return BLOG_META[handle];
}

export function blogOwnerUsername(handle: string, fallback?: string | null): string {
  return BLOG_META[handle]?.ownerHandle ?? fallback ?? handle;
}

export function blogAvatarFallback(handle: string, username: string): string {
  return BLOG_META[handle]?.avatarFallback ?? username.slice(0, 2).toUpperCase();
}

export function formatOwnerUsername(handle: string, fallback?: string | null): string {
  return `@${blogOwnerUsername(handle, fallback)}`;
}

import type { createAdminClient } from "@/lib/supabase/server";

/**
 * Finds and removes blog photos that no post uses any more. Photos can be copied from one post
 * into another, so a file is only removed when no post at all (body or cover) points to it.
 * Only server actions import this: the helpers take the service-role client, and callers check
 * permissions first.
 */

export const BLOG_IMAGE_BUCKET = "blog-images";

/** Uploads younger than this are kept: the editor may not have autosaved the post yet. */
export const ORPHAN_GRACE_MS = 24 * 60 * 60 * 1000;

const PAGE_SIZE = 1000;

type AdminClient = ReturnType<typeof createAdminClient>;

/** Storage paths (<author id>/<file>) of every blog-images address in a piece of text. */
export function blogImagePathsIn(text: string | null | undefined): string[] {
  if (!text) return [];
  const paths: string[] = [];
  for (const match of text.matchAll(/\/storage\/v1\/object\/public\/blog-images\/([A-Za-z0-9._-]+\/[A-Za-z0-9._-]+)/g)) {
    if (!match[1].includes("..")) paths.push(match[1]);
  }
  return paths;
}

/** Every bucket path any post still uses, drafts included. */
export async function referencedBlogImagePaths(admin: AdminClient): Promise<Set<string>> {
  const referenced = new Set<string>();
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await (admin.from("blog_posts") as any)
      .select("content, cover_image")
      .order("id")
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw error;
    const rows = (data ?? []) as Array<{ content: string | null; cover_image: string | null }>;
    for (const row of rows) {
      for (const path of blogImagePathsIn(row.content)) referenced.add(path);
      for (const path of blogImagePathsIn(row.cover_image)) referenced.add(path);
    }
    if (rows.length < PAGE_SIZE) return referenced;
  }
}

/** Removes the given paths that no post references. Returns how many files were removed. */
export async function removeUnusedBlogImages(admin: AdminClient, candidates: Iterable<string>): Promise<number> {
  const unique = [...new Set(candidates)];
  if (unique.length === 0) return 0;
  const referenced = await referencedBlogImagePaths(admin);
  const unused = unique.filter((path) => !referenced.has(path));
  if (unused.length === 0) return 0;
  const { error } = await admin.storage.from(BLOG_IMAGE_BUCKET).remove(unused);
  if (error) throw error;
  return unused.length;
}

async function listFolder(admin: AdminClient, prefix: string) {
  const entries: Array<{ name: string; id: string | null; created_at?: string | null }> = [];
  for (let offset = 0; ; offset += PAGE_SIZE) {
    const { data, error } = await admin.storage
      .from(BLOG_IMAGE_BUCKET)
      .list(prefix, { limit: PAGE_SIZE, offset, sortBy: { column: "name", order: "asc" } });
    if (error) throw error;
    entries.push(...(data ?? []));
    if ((data ?? []).length < PAGE_SIZE) return entries;
  }
}

/**
 * Walks the whole bucket and removes files that are older than the grace period and that no post
 * references. Returns how many files were checked and removed.
 */
export async function sweepUnusedBlogImages(admin: AdminClient, now = Date.now()): Promise<{ checked: number; removed: number }> {
  const { data: bucket } = await admin.storage.getBucket(BLOG_IMAGE_BUCKET);
  if (!bucket) return { checked: 0, removed: 0 };

  const referenced = await referencedBlogImagePaths(admin);
  const unused: string[] = [];
  let checked = 0;

  // Top level entries without an id are the authors' folders.
  for (const folder of (await listFolder(admin, "")).filter((entry) => entry.id === null)) {
    for (const file of await listFolder(admin, folder.name)) {
      if (file.id === null) continue;
      checked += 1;
      const path = `${folder.name}/${file.name}`;
      const created = file.created_at ? Date.parse(file.created_at) : NaN;
      const oldEnough = Number.isFinite(created) && now - created > ORPHAN_GRACE_MS;
      if (oldEnough && !referenced.has(path)) unused.push(path);
    }
  }

  for (let i = 0; i < unused.length; i += 100) {
    const { error } = await admin.storage.from(BLOG_IMAGE_BUCKET).remove(unused.slice(i, i + 100));
    if (error) throw error;
  }
  return { checked, removed: unused.length };
}

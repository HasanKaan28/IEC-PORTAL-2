/**
 * Upload rules shared by the editor and the server action. Vercel refuses request bodies over
 * 4.5 MB, so the server takes at most 4 MB; the editor shrinks larger photos before sending them.
 */
export const BLOG_IMAGE_MAX_BYTES = 4 * 1024 * 1024;

export const BLOG_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;

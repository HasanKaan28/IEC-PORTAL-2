import React from "react";
import AdminCommentModerator from "@/components/portal/AdminCommentModerator";
import { getAllBlogCommentsForAdmin } from "@/lib/blog/blog-queries";

export default async function AdminBlogCommentsPage() {
  const comments = await getAllBlogCommentsForAdmin("all");

  return <AdminCommentModerator initialComments={comments} />;
}

import React from "react";
import { redirect } from "next/navigation";
import AdminCommentModerator from "@/components/portal/AdminCommentModerator";
import { getSessionUser } from "@/lib/auth/session";
import { canAccessAdminSection } from "@/lib/admin/admin-access";
import { getAllBlogCommentsForAdmin } from "@/lib/blog/blog-queries";

export default async function AdminBlogCommentsPage() {
  const user = await getSessionUser();
  if (!canAccessAdminSection(user, "comments")) redirect("/portal/admin");

  const comments = await getAllBlogCommentsForAdmin("all");

  return <AdminCommentModerator initialComments={comments} />;
}

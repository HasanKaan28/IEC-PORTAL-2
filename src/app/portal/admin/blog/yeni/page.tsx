import React from "react";
import { redirect } from "next/navigation";
import BlogEditorStudio from "@/components/portal/BlogEditorStudio";
import { getSessionUser, userCan } from "@/lib/auth/session";

export default async function AdminBlogCreatePage() {
  const user = await getSessionUser();
  if (!userCan(user, "blog.write")) redirect("/portal/admin/blog");

  return <BlogEditorStudio canPublish={userCan(user, "blog.publish")} />;
}

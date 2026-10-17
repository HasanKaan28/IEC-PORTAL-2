import { redirect } from "next/navigation";

/** Old address of the editor; new posts are written in the workspace. */
export default function AdminBlogCreatePage() {
  redirect("/portal/blog/yaz");
}

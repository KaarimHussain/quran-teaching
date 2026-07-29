"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireCurrentUser } from "@/lib/dal";

async function requireAdmin() {
  const user = await requireCurrentUser();
  if (user.role !== "SUPER_ADMIN") throw new Error("Forbidden");
  return user;
}

function toSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

export type BlogPostState = { error?: string } | undefined;

export async function createBlogPost(
  _prevState: BlogPostState,
  formData: FormData
): Promise<BlogPostState> {
  const user = await requireAdmin();

  const title = formData.get("title");
  const body = formData.get("body");
  const excerpt = formData.get("excerpt");
  const language = formData.get("language");
  const publishRaw = formData.get("publish");

  if (typeof title !== "string" || title.trim().length < 3) {
    return { error: "Title must be at least 3 characters." };
  }
  if (typeof body !== "string" || body.trim().length < 10) {
    return { error: "Post body must be at least 10 characters." };
  }

  const validLanguages = ["EN", "UR", "AR"];
  const resolvedLanguage =
    typeof language === "string" && validLanguages.includes(language)
      ? (language as "EN" | "UR" | "AR")
      : "EN";

  const publish = publishRaw === "true";
  let slug = toSlug(title.trim());

  // Ensure slug uniqueness
  const existing = await prisma.blogPost.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now()}`;

  await prisma.blogPost.create({
    data: {
      title: title.trim(),
      slug,
      body: body.trim(),
      excerpt: typeof excerpt === "string" && excerpt.trim() ? excerpt.trim() : null,
      language: resolvedLanguage,
      isPublished: publish,
      publishedAt: publish ? new Date() : null,
      authorUserId: user.id,
    },
  });

  revalidatePath("/admin/blog");
  revalidatePath("/blog");
}

export async function toggleBlogPostPublished(formData: FormData) {
  await requireAdmin();

  const id = formData.get("id");
  const currentPublished = formData.get("isPublished") === "true";

  if (typeof id !== "string") return;

  await prisma.blogPost.update({
    where: { id },
    data: {
      isPublished: !currentPublished,
      publishedAt: !currentPublished ? new Date() : null,
    },
  });

  revalidatePath("/admin/blog");
  revalidatePath("/blog");
}

export async function deleteBlogPost(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id");
  if (typeof id !== "string") return;

  await prisma.blogPost.delete({ where: { id } });

  revalidatePath("/admin/blog");
  revalidatePath("/blog");
}

import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";

export async function generateStaticParams() {
  const posts = await prisma.blogPost.findMany({
    where: { isPublished: true },
    select: { slug: true },
  });
  return posts.map((p) => ({ slug: p.slug }));
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({
    where: { slug, isPublished: true },
    include: { author: { select: { name: true } } },
  });

  if (!post) notFound();

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <Button asChild variant="ghost" size="sm" className="mb-6 -ml-2 gap-1 text-muted-foreground">
        <Link href="/blog">
          <ArrowLeft className="size-4" /> Back to blog
        </Link>
      </Button>

      <article className="flex flex-col gap-6">
        <header className="flex flex-col gap-2">
          <h1 className="font-heading text-3xl leading-tight text-primary">{post.title}</h1>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="size-4" />
            {post.publishedAt
              ? new Date(post.publishedAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              : ""}
            <span>·</span>
            <span>by {post.author.name}</span>
          </p>
        </header>

        <div className="prose prose-neutral dark:prose-invert max-w-none whitespace-pre-wrap text-foreground leading-relaxed">
          {post.body}
        </div>
      </article>
    </main>
  );
}

import Link from "next/link";
import { Calendar, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { NewsletterForm } from "@/components/newsletter-form";
import { prisma } from "@/lib/db";

const languageLabel: Record<string, string> = { EN: "English", UR: "Urdu", AR: "Arabic" };

export const metadata = { title: "Blog — Quran Learning" };

export default async function BlogPage() {
  const posts = await prisma.blogPost.findMany({
    where: { isPublished: true },
    orderBy: { publishedAt: "desc" },
    include: { author: { select: { name: true } } },
  });

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-10 flex flex-col gap-2">
        <h1 className="font-heading text-3xl text-primary">Blog</h1>
        <p className="text-muted-foreground">
          Articles, tips, and news from the Free Quranic Learning Portal.
        </p>
      </div>

      {posts.length === 0 ? (
        <p className="text-sm text-muted-foreground">No articles published yet. Check back soon.</p>
      ) : (
        <div className="flex flex-col gap-5">
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="group block">
              <Card className="border-border/80 transition-shadow group-hover:shadow-md">
                <CardHeader>
                  <div className="mb-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="size-3.5" />
                      {post.publishedAt
                        ? new Date(post.publishedAt).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })
                        : ""}
                    </span>
                    <span>·</span>
                    <span>by {post.author.name}</span>
                    <Badge variant="outline" className="rounded-full gap-1 py-0 text-xs">
                      <Globe className="size-3" /> {languageLabel[post.language]}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    {post.title}
                  </CardTitle>
                  {post.excerpt && (
                    <CardDescription className="text-sm leading-relaxed">
                      {post.excerpt}
                    </CardDescription>
                  )}
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-12 rounded-xl border border-border bg-muted/40 p-6">
        <NewsletterForm />
      </div>
    </main>
  );
}

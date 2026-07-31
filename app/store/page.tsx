import { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { StoreClient, StoreItemWithRelations } from "@/components/store/store-client";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Curriculum Marketplace | Quran Learning",
  description:
    "Explore premium Islamic courses, documents, videos, audios, and historical stories crafted by qualified teachers.",
};

export default async function StorePage() {
  const itemsRaw = await prisma.storeItem.findMany({
    where: { isPublished: true },
    orderBy: { publishedAt: "desc" },
    include: {
      _count: { select: { modules: true } },
      createdBy: {
        select: {
          name: true,
          role: true,
        },
      },
      modules: {
        select: {
          id: true,
          title: true,
          description: true,
          moduleOrder: true,
          durationMins: true,
          contentUrl: true,
        },
        orderBy: { moduleOrder: "asc" },
      },
    },
  });

  // Cast dates to ISO strings / compatible type if needed for client serialization
  const items: StoreItemWithRelations[] = itemsRaw.map((item) => ({
    ...item,
    publishedAt: item.publishedAt ? item.publishedAt.toISOString() : null,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  }));

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <StoreClient items={items} />
      </main>
      <SiteFooter />
    </>
  );
}

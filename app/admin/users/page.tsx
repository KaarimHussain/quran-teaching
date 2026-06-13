import { Search, Users as UsersIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { prisma } from "@/lib/db";
import { requireCurrentUser } from "@/lib/dal";
import { roleLabel } from "@/lib/roles";
import { toggleUserActive } from "./actions";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const currentUser = await requireCurrentUser();
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  const users = await prisma.user.findMany({
    where: query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, email: true, role: true, isActive: true },
    take: 100,
  });

  return (
    <DashboardShell
      role="admin"
      roleLabel={roleLabel[currentUser.role]}
      userName={currentUser.name}
      title="Users"
      description="Manage platform accounts across all roles."
    >
      <div className="flex flex-col gap-6">
        <Card className="border-border/80">
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>
              {query ? `Showing results for "${query}"` : `${users.length} accounts`}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <form className="flex gap-2">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  name="q"
                  defaultValue={query}
                  placeholder="Search by name or email…"
                  className="pl-9"
                />
              </div>
              <Button type="submit" variant="outline" className="rounded-full">
                Search
              </Button>
            </form>

            <div className="flex flex-col gap-2">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between gap-3 rounded-xl border border-border p-3">
                  <div className="flex flex-col overflow-hidden">
                    <span className="truncate text-sm font-medium leading-tight">{user.name}</span>
                    <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge variant="secondary" className="rounded-full">
                      {roleLabel[user.role]}
                    </Badge>
                    <Badge variant={user.isActive ? "default" : "destructive"} className="rounded-full">
                      {user.isActive ? "Active" : "Suspended"}
                    </Badge>
                    {user.id !== currentUser.id && (
                      <form action={toggleUserActive}>
                        <input type="hidden" name="userId" value={user.id} />
                        <Button type="submit" size="sm" variant="outline" className="rounded-full">
                          {user.isActive ? "Suspend" : "Activate"}
                        </Button>
                      </form>
                    )}
                  </div>
                </div>
              ))}

              {users.length === 0 && (
                <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
                  <UsersIcon className="size-6" />
                  <span className="text-sm">No users match your search.</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}

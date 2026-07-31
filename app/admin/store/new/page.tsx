import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireCurrentUser } from "@/lib/dal";
import { roleLabel } from "@/lib/roles";
import { CreateItemForm } from "../create-item-form";

export default async function AdminStoreNewPage() {
  const user = await requireCurrentUser();
  if (user.role !== "SUPER_ADMIN") throw new Error("Forbidden");

  const t = await getTranslations("pages.admin.store");

  return (
    <DashboardShell
      role="admin"
      roleLabel={roleLabel[user.role]}
      userName={user.name}
      title={t("form.pageTitle")}
      description={t("form.pageDesc")}
    >
      <div className="mx-auto w-full max-w-2xl">
        <Card className="border-border/80">
          <CardHeader>
            <CardTitle>{t("form.pageTitle")}</CardTitle>
            <CardDescription>{t("form.pageDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <CreateItemForm />
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}

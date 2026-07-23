import { Award, GraduationCap, Trash2 } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { SubmitButton } from "@/components/ui/submit-button";
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
import { formatDate } from "@/lib/format";
import { IssueCertificateForm } from "./issue-form";
import { revokeCertificate } from "./actions";

const levelColors: Record<string, string> = {
  BEGINNER: "bg-chart-4/10 text-chart-4",
  INTERMEDIATE: "bg-primary/10 text-primary",
  ADVANCED: "bg-accent/20 text-accent-foreground",
};

export default async function AdminCertificatesPage() {
  const currentUser = await requireCurrentUser();
  const t = await getTranslations("pages.admin");

  const [certificates, students, courses] = await Promise.all([
    prisma.certificate.findMany({
      orderBy: { issuedAt: "desc" },
      include: {
        student: { select: { name: true } },
        course: { select: { name: true } },
      },
    }),
    prisma.user.findMany({
      where: { role: "STUDENT", isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.course.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  const uniqueStudents = new Set(certificates.map((c) => c.studentUserId)).size;

  return (
    <DashboardShell
      role="admin"
      roleLabel={roleLabel[currentUser.role]}
      userName={currentUser.name}
      title={t("certificates")}
      description={t("certificatesDesc")}
    >
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-4">
          <Card size="sm" className="border-border/80">
            <CardContent className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Award className="size-5" />
              </span>
              <div className="flex flex-col">
                <span className="font-heading text-xl text-primary">{certificates.length.toLocaleString()}</span>
                <span className="text-xs text-muted-foreground">{t("cert.certificatesIssued")}</span>
              </div>
            </CardContent>
          </Card>
          <Card size="sm" className="border-border/80">
            <CardContent className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-chart-4/10 text-chart-4">
                <GraduationCap className="size-5" />
              </span>
              <div className="flex flex-col">
                <span className="font-heading text-xl text-primary">{uniqueStudents.toLocaleString()}</span>
                <span className="text-xs text-muted-foreground">{t("cert.studentsCertified")}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/80">
          <CardHeader>
            <CardTitle>{t("cert.issueCertificate")}</CardTitle>
            <CardDescription>
              {t("cert.issueCertificateDesc")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {students.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("cert.noActiveStudents")}</p>
            ) : courses.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("cert.noActiveCourses")}</p>
            ) : (
              <IssueCertificateForm students={students} courses={courses} />
            )}
          </CardContent>
        </Card>

        <Card className="border-border/80">
          <CardHeader>
            <CardTitle>{t("cert.issuedCertificates")}</CardTitle>
            <CardDescription>
              {certificates.length === 0
                ? t("cert.noCertificatesYet")
                : `${certificates.length} certificate${certificates.length === 1 ? "" : "s"} on record`}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-border p-3"
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Award className="size-4" />
                  </span>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium leading-tight">{cert.student.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {cert.course.name} · {t("cert.issued")} {formatDate(cert.issuedAt)}
                    </span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge className={`rounded-full text-xs ${levelColors[cert.pathwayLevel] ?? ""}`}>
                    {cert.pathwayLevel.charAt(0) + cert.pathwayLevel.slice(1).toLowerCase()}
                  </Badge>
                  <form action={revokeCertificate}>
                    <input type="hidden" name="id" value={cert.id} />
                    <SubmitButton
                      size="sm"
                      variant="outline"
                      className="rounded-full text-destructive hover:text-destructive"
                      pendingLabel={t("cert.revoking")}
                    >
                      <Trash2 className="size-3.5" /> {t("cert.revoke")}
                    </SubmitButton>
                  </form>
                </div>
              </div>
            ))}
            {certificates.length === 0 && (
              <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
                <Award className="size-6" />
                <span className="text-sm">{t("cert.noCertificatesYet")}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}

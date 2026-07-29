import { NextRequest, NextResponse } from "next/server";
import { Document, Page, Text, View, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import { cookies } from "next/headers";
import { decrypt, COOKIE_NAME } from "@/lib/session";
import { prisma } from "@/lib/db";

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    fontFamily: "Helvetica",
    padding: 50,
  },
  header: {
    borderBottomWidth: 2,
    borderBottomColor: "#2a4a3a",
    borderBottomStyle: "solid",
    paddingBottom: 16,
    marginBottom: 24,
  },
  platformName: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: "#2a4a3a",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  docTitle: {
    fontSize: 13,
    color: "#5a7a64",
    marginTop: 4,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  studentSection: {
    marginBottom: 20,
    backgroundColor: "#f7faf7",
    padding: 14,
    borderRadius: 6,
  },
  label: {
    fontSize: 9,
    color: "#8a9e8a",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 2,
  },
  value: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: "#1e3528",
  },
  subValue: {
    fontSize: 10,
    color: "#5a7a64",
    marginTop: 2,
  },
  table: {
    marginTop: 16,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#2a4a3a",
    padding: 8,
    borderRadius: 4,
    marginBottom: 2,
  },
  tableHeaderCell: {
    color: "#f0f8f0",
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e8ede8",
    borderBottomStyle: "solid",
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  tableRowAlt: {
    flexDirection: "row",
    backgroundColor: "#f7faf7",
    borderBottomWidth: 1,
    borderBottomColor: "#e8ede8",
    borderBottomStyle: "solid",
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  cell: {
    fontSize: 10,
    color: "#3d5244",
  },
  cellBold: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#1e3528",
  },
  passCell: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#2a7a4a",
  },
  failCell: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#c0392b",
  },
  footer: {
    position: "absolute",
    bottom: 40,
    left: 50,
    right: 50,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#e8ede8",
    borderTopStyle: "solid",
    paddingTop: 10,
  },
  footerText: {
    fontSize: 8,
    color: "#8a9e8a",
  },
  summaryRow: {
    flexDirection: "row",
    gap: 20,
    marginTop: 16,
    padding: 12,
    backgroundColor: "#f0f4f0",
    borderRadius: 6,
  },
  summaryItem: {
    flexDirection: "column",
    alignItems: "center",
  },
  summaryNumber: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: "#2a4a3a",
  },
  summaryLabel: {
    fontSize: 8,
    color: "#5a7a64",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});

const COL_WIDTHS = ["30%", "20%", "18%", "10%", "10%", "12%"];

function TranscriptPDF({
  studentName,
  studentEmail,
  generatedAt,
  results,
}: {
  studentName: string;
  studentEmail: string;
  generatedAt: Date;
  results: Array<{
    assessmentTitle: string;
    courseName: string;
    pathwayLevel: string;
    score: number;
    passed: boolean;
    gradedAt: Date;
    notes: string | null;
  }>;
}) {
  const passed = results.filter((r) => r.passed).length;
  const failed = results.length - passed;
  const avg = results.length
    ? Math.round(results.reduce((s, r) => s + r.score, 0) / results.length)
    : 0;

  const levelLabel: Record<string, string> = {
    BEGINNER: "Beginner",
    INTERMEDIATE: "Intermediate",
    ADVANCED: "Advanced",
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.platformName}>Quran Learning</Text>
          <Text style={styles.docTitle}>Official Academic Transcript</Text>
        </View>

        <View style={styles.studentSection}>
          <Text style={styles.label}>Student</Text>
          <Text style={styles.value}>{studentName}</Text>
          <Text style={styles.subValue}>{studentEmail}</Text>
          <Text style={[styles.subValue, { marginTop: 6 }]}>
            Generated:{" "}
            {generatedAt.toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </Text>
        </View>

        <View style={styles.summaryRow}>
          {[
            { value: results.length, label: "Total" },
            { value: passed, label: "Passed" },
            { value: failed, label: "Failed" },
            { value: `${avg}%`, label: "Avg Score" },
          ].map((item) => (
            <View key={item.label} style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>{item.value}</Text>
              <Text style={styles.summaryLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            {["Assessment", "Course", "Level", "Score", "Result", "Date"].map((h, i) => (
              <Text key={h} style={[styles.tableHeaderCell, { width: COL_WIDTHS[i] }]}>
                {h}
              </Text>
            ))}
          </View>

          {results.map((r, idx) => {
            const Row = idx % 2 === 0 ? styles.tableRow : styles.tableRowAlt;
            return (
              <View key={idx} style={Row}>
                <Text style={[styles.cellBold, { width: COL_WIDTHS[0] }]}>{r.assessmentTitle}</Text>
                <Text style={[styles.cell, { width: COL_WIDTHS[1] }]}>{r.courseName}</Text>
                <Text style={[styles.cell, { width: COL_WIDTHS[2] }]}>{levelLabel[r.pathwayLevel] ?? r.pathwayLevel}</Text>
                <Text style={[styles.cellBold, { width: COL_WIDTHS[3] }]}>{r.score}%</Text>
                <Text style={[r.passed ? styles.passCell : styles.failCell, { width: COL_WIDTHS[4] }]}>
                  {r.passed ? "PASS" : "FAIL"}
                </Text>
                <Text style={[styles.cell, { width: COL_WIDTHS[5] }]}>
                  {new Date(r.gradedAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Free Quranic Learning Portal · quranlearning.org
          </Text>
          <Text style={styles.footerText}>
            This is an official academic record. Do not alter.
          </Text>
        </View>
      </Page>
    </Document>
  );
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  const cookieStore = await cookies();
  const session = await decrypt(cookieStore.get(COOKIE_NAME)?.value);
  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { studentId } = await params;

  const isOwner = session.userId === studentId;
  const isAdminOrTeacher =
    session.role === "SUPER_ADMIN" || session.role === "TEACHER";

  if (!isOwner && !isAdminOrTeacher) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [student, results] = await Promise.all([
    prisma.user.findUnique({
      where: { id: studentId },
      select: { name: true, email: true },
    }),
    prisma.assessmentResult.findMany({
      where: { studentUserId: studentId },
      orderBy: { gradedAt: "asc" },
      include: {
        assessment: {
          include: { course: { select: { name: true } } },
        },
      },
    }),
  ]);

  if (!student) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  const pdfBuffer = await renderToBuffer(
    <TranscriptPDF
      studentName={student.name}
      studentEmail={student.email}
      generatedAt={new Date()}
      results={results.map((r) => ({
        assessmentTitle: r.assessment.title,
        courseName: r.assessment.course.name,
        pathwayLevel: r.assessment.pathwayLevel,
        score: r.score,
        passed: r.passed,
        gradedAt: r.gradedAt,
        notes: r.notes,
      }))}
    />
  );

  const safeName = student.name.replace(/[^a-z0-9]/gi, "-").toLowerCase();

  return new Response(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="transcript-${safeName}.pdf"`,
    },
  });
}

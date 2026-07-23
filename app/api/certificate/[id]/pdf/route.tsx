import { NextRequest, NextResponse } from "next/server";
import { Document, Page, Text, View, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import { cookies } from "next/headers";
import { decrypt, COOKIE_NAME } from "@/lib/session";
import { prisma } from "@/lib/db";

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#f9f7f2",
    fontFamily: "Helvetica",
    position: "relative",
  },
  outerBorder: {
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    bottom: 20,
    borderWidth: 3,
    borderColor: "#2a4a3a",
    borderStyle: "solid",
  },
  innerBorder: {
    position: "absolute",
    top: 30,
    left: 30,
    right: 30,
    bottom: 30,
    borderWidth: 1,
    borderColor: "#8fa896",
    borderStyle: "solid",
  },
  content: {
    flex: 1,
    padding: 70,
    alignItems: "center",
  },
  platformName: {
    fontSize: 26,
    fontFamily: "Helvetica-Bold",
    color: "#2a4a3a",
    letterSpacing: 4,
    textTransform: "uppercase",
    textAlign: "center",
  },
  platformTagline: {
    fontSize: 10,
    color: "#5a7a64",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginTop: 4,
    textAlign: "center",
  },
  divider: {
    height: 1,
    backgroundColor: "#8fa896",
    width: "60%",
    marginVertical: 18,
  },
  certTitle: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: "#5a7a64",
    letterSpacing: 5,
    textTransform: "uppercase",
    textAlign: "center",
    marginBottom: 6,
  },
  certSubtitle: {
    fontSize: 10,
    color: "#8a9e8a",
    letterSpacing: 1,
    textAlign: "center",
    marginBottom: 24,
  },
  awardedTo: {
    fontSize: 11,
    color: "#5a7a64",
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: 1,
  },
  studentName: {
    fontSize: 36,
    fontFamily: "Helvetica-BoldOblique",
    color: "#1e3528",
    textAlign: "center",
    marginBottom: 20,
  },
  forCompletingRow: {
    fontSize: 11,
    color: "#5a7a64",
    textAlign: "center",
    marginBottom: 8,
  },
  courseName: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: "#2a4a3a",
    textAlign: "center",
    marginBottom: 10,
  },
  levelBadge: {
    backgroundColor: "#2a4a3a",
    paddingHorizontal: 24,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 30,
  },
  levelText: {
    color: "#f0f8f0",
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  footer: {
    position: "absolute",
    bottom: 55,
    left: 70,
    right: 70,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  seal: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: "#2a4a3a",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f4f0",
  },
  sealInner: {
    fontSize: 8,
    color: "#2a4a3a",
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.5,
  },
  dateBlock: {
    alignItems: "flex-end",
  },
  dateLabel: {
    fontSize: 8,
    color: "#8a9e8a",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 3,
  },
  dateValue: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: "#3d5244",
  },
});

function CertificatePDF({
  studentName,
  courseName,
  level,
  issuedAt,
}: {
  studentName: string;
  courseName: string;
  level: string;
  issuedAt: Date;
}) {
  const issuedDate = issuedAt.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.outerBorder} />
        <View style={styles.innerBorder} />

        <View style={styles.content}>
          <Text style={styles.platformName}>Quran Learning</Text>
          <Text style={styles.platformTagline}>Free Quranic Education for Everyone</Text>

          <View style={styles.divider} />

          <Text style={styles.certTitle}>Certificate of Completion</Text>
          <Text style={styles.certSubtitle}>This is to certify that</Text>

          <Text style={styles.awardedTo}>THIS CERTIFICATE IS PROUDLY PRESENTED TO</Text>
          <Text style={styles.studentName}>{studentName}</Text>

          <Text style={styles.forCompletingRow}>for successfully completing</Text>
          <Text style={styles.courseName}>{courseName}</Text>

          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>{level} Level</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.seal}>
            <Text style={styles.sealInner}>QURAN{"\n"}LEARNING{"\n"}✦</Text>
          </View>
          <View style={styles.dateBlock}>
            <Text style={styles.dateLabel}>Date of Issue</Text>
            <Text style={styles.dateValue}>{issuedDate}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieStore = await cookies();
  const session = await decrypt(cookieStore.get(COOKIE_NAME)?.value);
  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const cert = await prisma.certificate.findUnique({
    where: { id },
    include: {
      student: { select: { id: true, name: true } },
      course: { select: { name: true } },
    },
  });

  if (!cert) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isOwner = cert.studentUserId === session.userId;
  const isAdmin = session.role === "SUPER_ADMIN";
  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const levelLabel =
    cert.pathwayLevel.charAt(0) + cert.pathwayLevel.slice(1).toLowerCase();

  const pdfBuffer = await renderToBuffer(
    <CertificatePDF
      studentName={cert.student.name}
      courseName={cert.course.name}
      level={levelLabel}
      issuedAt={cert.issuedAt}
    />
  );

  return new Response(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="certificate-${id}.pdf"`,
    },
  });
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromCookie } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromCookie(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const riskLevel = searchParams.get("riskLevel") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) where.OR = [{ title: { contains: search, mode: "insensitive" } }, { user: { name: { contains: search, mode: "insensitive" } } }];
    if (status) where.status = status;
    if (riskLevel) where.riskLevel = riskLevel;

    const [alerts, total] = await Promise.all([
      prisma.alert.findMany({
        where, skip, take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, phone: true } },
          category: { select: { name: true, type: true, color: true } },
        },
      }),
      prisma.alert.count({ where }),
    ]);

    const logs = alerts.length ? await prisma.activityLog.findMany({
      where: { action: { in: alerts.map(a => "GUARDIAN_VERIFY:" + a.id) } },
      select: { action: true, description: true },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    }) : [];
    const checks = new Map<string, string>();
    for (const log of logs) {
      const id = log.action.slice("GUARDIAN_VERIFY:".length);
      if (checks.has(id)) continue;
      try {
        const result = JSON.parse(log.description || "{}");
        if (["TERVERIFIKASI", "PERLU_PEMERIKSAAN", "DITOLAK"].includes(result.status)) {
          checks.set(id, result.status);
        }
      } catch { /* Ignore malformed historical log. */ }
    }
    return NextResponse.json({
      alerts: alerts.map(a => ({ ...a, verificationStatus: checks.get(a.id) || "BELUM_DIVERIFIKASI" })),
      total, page, totalPages: Math.ceil(total / limit),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

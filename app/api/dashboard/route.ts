import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromCookie } from "@/lib/auth";
import { startOfDay, endOfDay, startOfMonth, endOfMonth, startOfYear, endOfYear, startOfWeek, addDays, format } from "date-fns";
import { id as localeId } from "date-fns/locale";

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromCookie(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const yearStart = startOfYear(now);
    const yearEnd = endOfYear(now);

    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    const yearMonths = Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now.getFullYear(), i, 1);
      return { label: format(d, "MMM", { locale: localeId }), start: startOfMonth(d), end: endOfMonth(d) };
    });

    const monthWeeks = Array.from({ length: 5 }, (_, i) => {
      const start = addDays(monthStart, i * 7);
      const end = addDays(start, 6);
      return { label: `Minggu ${i + 1}`, start, end: end > monthEnd ? monthEnd : end };
    });

    const [
      totalAlerts, todayAlerts, monthAlerts, activeAlerts,
      byStatus, byCategory, recentLogs, weekChart, monthChart, yearChart
    ] = await Promise.all([
      prisma.alert.count(),
      prisma.alert.count({ where: { createdAt: { gte: todayStart, lte: todayEnd } } }),
      prisma.alert.count({ where: { createdAt: { gte: monthStart, lte: monthEnd } } }),
      prisma.alert.count({ where: { status: { in: ["AKTIF", "DIPROSES"] } } }),

      prisma.alert.groupBy({ by: ["status"], _count: { status: true } }),

      prisma.alert.groupBy({
        by: ["categoryId"], _count: { categoryId: true },
        orderBy: { _count: { categoryId: "desc" } }, take: 6,
      }),

      prisma.activityLog.findMany({
        take: 10, orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true } } },
      }),

      Promise.all(weekDays.map(async d => ({
        label: format(d, "EEE", { locale: localeId }),
        count: await prisma.alert.count({ where: { createdAt: { gte: startOfDay(d), lte: endOfDay(d) } } }),
      }))),

      Promise.all(monthWeeks.map(async w => ({
        label: w.label,
        count: await prisma.alert.count({ where: { createdAt: { gte: w.start, lte: w.end } } }),
      }))),

      Promise.all(yearMonths.map(async m => ({
        label: m.label,
        count: await prisma.alert.count({ where: { createdAt: { gte: m.start, lte: m.end } } }),
      }))),
    ]);

    const catIds = byCategory.map(c => c.categoryId).filter(Boolean) as string[];
    const cats = await prisma.alertCategory.findMany({ where: { id: { in: catIds } }, select: { id: true, name: true, type: true } });
    const catMap = Object.fromEntries(cats.map(c => [c.id, c]));

    return NextResponse.json({
      stats: { totalAlerts, todayAlerts, monthAlerts, activeAlerts, avgPerWeek: Math.round(monthAlerts / 4) },
      byStatus: byStatus.map(s => ({ status: s.status, count: s._count.status })),
      byCategory: byCategory.map(c => ({
        categoryId: c.categoryId,
        name: catMap[c.categoryId!]?.name || "Lainnya",
        type: catMap[c.categoryId!]?.type || "-",
        count: c._count.categoryId,
      })),
      recentLogs: recentLogs.map(l => ({ id: l.id, action: l.action, description: l.description, createdAt: l.createdAt, userName: l.user?.name })),
      charts: { week: weekChart, month: monthChart, year: yearChart },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

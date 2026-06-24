import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromCookie } from "@/lib/auth";
import ExcelJS from "exceljs";
import { startOfDay, endOfDay, startOfMonth, endOfMonth, startOfYear, endOfYear, addDays } from "date-fns";

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromCookie(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("mode") || "day";
    const date = searchParams.get("date") || new Date().toISOString().slice(0, 10);
    const month = parseInt(searchParams.get("month") || String(new Date().getMonth() + 1));
    const week = parseInt(searchParams.get("week") || "1");
    const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()));

    let start: Date, end: Date, periodLabel: string;

    if (mode === "day") {
      const d = new Date(date);
      start = startOfDay(d); end = endOfDay(d);
      periodLabel = `Harian — ${d.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}`;
    } else if (mode === "week") {
      const monthStart = new Date(year, month - 1, 1);
      start = addDays(monthStart, (week - 1) * 7);
      end = endOfDay(addDays(start, 6));
      periodLabel = `Mingguan — Minggu ke-${week}`;
    } else if (mode === "month") {
      start = startOfMonth(new Date(year, month - 1, 1));
      end = endOfMonth(new Date(year, month - 1, 1));
      periodLabel = `Bulanan — ${new Date(year, month - 1).toLocaleDateString("id-ID", { month: "long", year: "numeric" })}`;
    } else {
      start = startOfYear(new Date(year, 0, 1));
      end = endOfYear(new Date(year, 0, 1));
      periodLabel = `Tahunan — ${year}`;
    }

    const alerts = await prisma.alert.findMany({
      where: { createdAt: { gte: start, lte: end } },
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, phone: true } }, category: { select: { name: true, type: true } } },
    });

    const wb = new ExcelJS.Workbook();
    wb.creator = "KomplekGuard AI Admin";
    const ws = wb.addWorksheet("Laporan Alert");

    ws.mergeCells("A1:H1");
    ws.getCell("A1").value = "LAPORAN ALERT KEAMANAN — KOMPLEKGUARD AI";
    ws.getCell("A1").font = { bold: true, size: 14, color: { argb: "FF0A1628" } };
    ws.getCell("A1").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF00BCD4" } };
    ws.getCell("A1").alignment = { horizontal: "center" };

    ws.mergeCells("A2:H2");
    ws.getCell("A2").value = `${periodLabel} | Total: ${alerts.length} alert | ${new Date().toLocaleString("id-ID")}`;
    ws.getCell("A2").alignment = { horizontal: "center" };
    ws.addRow([]);

    const hdr = ws.addRow(["No", "Tanggal", "Judul", "Kategori", "Tipe", "Status", "Level Risiko", "Pelapor"]);
    hdr.font = { bold: true, color: { argb: "FFFFFFFF" } };
    hdr.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0A1628" } };
    hdr.alignment = { horizontal: "center" };
    ws.columns = [
      { key: "no", width: 5 }, { key: "date", width: 22 }, { key: "title", width: 35 },
      { key: "cat", width: 20 }, { key: "type", width: 15 }, { key: "status", width: 13 },
      { key: "risk", width: 14 }, { key: "user", width: 25 },
    ];

    const SC: Record<string, string> = { AKTIF: "FFEF5350", DIPROSES: "FFFFA726", SELESAI: "FF66BB6A", DIBATALKAN: "FF9E9E9E" };
    const RC: Record<string, string> = { RENDAH: "FF66BB6A", SEDANG: "FFFFA726", TINGGI: "FFEF5350", KRITIS: "FFB71C1C" };

    alerts.forEach((a, i) => {
      const row = ws.addRow([i + 1, new Date(a.createdAt).toLocaleString("id-ID"), a.title, a.category?.name || a.customCategory || "Lainnya", a.category?.type || "-", a.status, a.riskLevel, a.user?.name || "-"]);
      row.getCell(6).fill = { type: "pattern", pattern: "solid", fgColor: { argb: SC[a.status] || "FFEEEEEE" } };
      row.getCell(6).font = { color: { argb: "FFFFFFFF" }, bold: true };
      row.getCell(7).fill = { type: "pattern", pattern: "solid", fgColor: { argb: (a.riskLevel ? RC[a.riskLevel] : undefined) || "FFEEEEEE" } };
      row.getCell(7).font = { color: { argb: "FFFFFFFF" }, bold: true };
      if (i % 2 === 0) [1,2,3,4,5,8].forEach(c => { row.getCell(c).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF8F8F8" } }; });
      row.eachCell(cell => { cell.border = { top: { style: "thin", color: { argb: "FFDDDDDD" } }, bottom: { style: "thin", color: { argb: "FFDDDDDD" } }, left: { style: "thin", color: { argb: "FFDDDDDD" } }, right: { style: "thin", color: { argb: "FFDDDDDD" } } }; });
    });

    await prisma.activityLog.create({ data: { userId: user.userId, action: "EXPORT_EXCEL", description: `Download laporan: ${periodLabel}` } });

    const buf = await wb.xlsx.writeBuffer();
    return new NextResponse(buf as ArrayBuffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="KomplekGuard-Alert-${mode}-${year}.xlsx"`,
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Gagal generate Excel" }, { status: 500 });
  }
}

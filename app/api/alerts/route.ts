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

    return NextResponse.json({ alerts, total, page, totalPages: Math.ceil(total / limit) });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

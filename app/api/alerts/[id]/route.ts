import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromCookie } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserFromCookie(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const alert = await prisma.alert.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, phone: true, address: true } },
      category: true,
      responses: { include: { user: { select: { name: true, role: true } } }, orderBy: { createdAt: "desc" } },
    },
  });
  if (!alert) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ alert });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserFromCookie(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { status } = await req.json();
  const alert = await prisma.alert.update({ where: { id }, data: { status, updatedAt: new Date() } });
  await prisma.activityLog.create({ data: { userId: user.userId, action: "UPDATE_ALERT_STATUS", description: `Status alert #${id.slice(0,8)} diubah ke ${status}` } });
  return NextResponse.json({ success: true, alert });
}

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "komplekguard-admin-secret-minimum-32-chars"
);

export interface JWTPayload {
  userId: string;
  email: string;
  name: string;
  role: string;
}

export async function signToken(payload: JWTPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .setIssuer("komplekguard")
    .setAudience("admin-panel")
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      issuer: "komplekguard",
      audience: "admin-panel",
    });
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

export async function getServerSession(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("kg-admin-token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function getUserFromCookie(request: NextRequest): Promise<JWTPayload | null> {
  const token = request.cookies.get("kg-admin-token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: 8 * 60 * 60,
  path: "/",
};

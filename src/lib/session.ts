// Edge runtime 호환 (jose만 사용, bcryptjs 미사용)
import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import type { SessionPayload } from "@/types/auth.types";

export const SESSION_COOKIE = "session";
export const SESSION_MAX_AGE = 7 * 24 * 60 * 60; // 7일 (초 단위)

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET 환경변수가 설정되지 않았습니다.");
  }
  return new TextEncoder().encode(secret);
}

export async function createToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getJwtSecret());
}

export async function verifyToken(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return extractSessionPayload(payload);
  } catch {
    return null;
  }
}

function extractSessionPayload(payload: JWTPayload): SessionPayload | null {
  const { userId, userName, teamId, teamName, role } = payload as Record<
    string,
    unknown
  >;

  if (
    typeof userId !== "string" ||
    typeof userName !== "string" ||
    typeof teamId !== "string" ||
    typeof teamName !== "string" ||
    (role !== "user" && role !== "admin")
  ) {
    return null;
  }

  return { userId, userName, teamId, teamName, role };
}

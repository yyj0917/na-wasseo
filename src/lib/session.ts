// Edge runtime 호환 (jose만 사용, bcryptjs 미사용)
import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import type { SessionPayload } from "@/types/auth.types";

export const SESSION_COOKIE = "session";
// 브라우저 쿠키 최대 수명 (400일 = 브라우저 스펙 상한)
export const SESSION_MAX_AGE = 400 * 24 * 60 * 60;

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET 환경변수가 설정되지 않았습니다.");
  }
  return new TextEncoder().encode(secret);
}

export async function createToken(payload: SessionPayload): Promise<string> {
  // exp 클레임 미설정 → 토큰 자체는 시간 만료 없음
  // 세션 종료는 쿠키 삭제(로그아웃) 또는 브라우저 캐시 제거로만 가능
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
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

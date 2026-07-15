import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const CHALLENGE_COOKIE = "gng-webauthn-challenge";
const CHALLENGE_MAX_AGE = 300;

export type WebAuthnChallengePayload = {
  challenge: string;
  subscriberId: string;
  email: string;
  flow: "register" | "authenticate";
  exp: number;
};

function getWebAuthnSecret() {
  const secret =
    process.env.WEBAUTHN_SECRET?.trim() ||
    process.env.AIRTABLE_API_KEY?.trim();
  if (!secret) {
    throw new Error("WEBAUTHN_SECRET is not configured.");
  }
  return secret;
}

function signPayload(encoded: string) {
  return createHmac("sha256", getWebAuthnSecret())
    .update(encoded)
    .digest("base64url");
}

function encodePayload(payload: WebAuthnChallengePayload) {
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encoded}.${signPayload(encoded)}`;
}

function decodePayload(token: string): WebAuthnChallengePayload | null {
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;

  const expected = signPayload(encoded);
  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8")
    ) as WebAuthnChallengePayload;
    if (!payload.exp || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function storeWebAuthnChallenge(
  payload: Omit<WebAuthnChallengePayload, "exp"> & { exp?: number }
) {
  const cookieStore = await cookies();
  const fullPayload: WebAuthnChallengePayload = {
    ...payload,
    exp: payload.exp ?? Date.now() + CHALLENGE_MAX_AGE * 1000,
  };
  cookieStore.set(CHALLENGE_COOKIE, encodePayload(fullPayload), {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: CHALLENGE_MAX_AGE,
  });
}

export async function consumeWebAuthnChallenge(
  expectedFlow: WebAuthnChallengePayload["flow"]
): Promise<WebAuthnChallengePayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(CHALLENGE_COOKIE)?.value;
  if (!token) return null;

  cookieStore.delete(CHALLENGE_COOKIE);
  const payload = decodePayload(token);
  if (!payload || payload.flow !== expectedFlow) return null;
  return payload;
}

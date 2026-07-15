export function getWebAuthnRpId() {
  const configured = process.env.WEBAUTHN_RP_ID?.trim();
  if (configured) return configured;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");
  if (appUrl) {
    try {
      return new URL(appUrl).hostname;
    } catch {
      // fall through
    }
  }

  return "localhost";
}

export function getWebAuthnOrigin() {
  const configured = process.env.WEBAUTHN_ORIGIN?.trim().replace(/\/$/, "");
  if (configured) return configured;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");
  if (appUrl) return appUrl;

  return "http://localhost:3001";
}

export function getWebAuthnRpName() {
  return process.env.WEBAUTHN_RP_NAME?.trim() || "GNG Admin";
}

export function subscriberIdToUserId(subscriberId: string) {
  return Uint8Array.from(new TextEncoder().encode(subscriberId));
}

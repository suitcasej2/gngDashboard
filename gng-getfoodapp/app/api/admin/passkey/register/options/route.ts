import { NextResponse } from "next/server";
import { generateRegistrationOptions } from "@simplewebauthn/server";

import { listPasskeysForEmail } from "@/lib/admin-passkeys";
import { requireAdminEnrollmentSession } from "@/lib/admin";
import {
  getWebAuthnRpId,
  getWebAuthnRpName,
  subscriberIdToUserId,
} from "@/lib/webauthn-config";
import { storeWebAuthnChallenge } from "@/lib/webauthn-challenge";

export async function POST() {
  try {
    const admin = await requireAdminEnrollmentSession();
    const existing = await listPasskeysForEmail(admin.email);

    const options = await generateRegistrationOptions({
      rpName: getWebAuthnRpName(),
      rpID: getWebAuthnRpId(),
      userName: admin.email,
      userDisplayName: admin.fullName || admin.email,
      userID: subscriberIdToUserId(admin.id),
      attestationType: "none",
      excludeCredentials: existing.map((passkey) => ({
        id: passkey.credentialId,
        transports: passkey.transports as AuthenticatorTransport[],
      })),
      authenticatorSelection: {
        residentKey: "required",
        userVerification: "required",
      },
    });

    await storeWebAuthnChallenge({
      challenge: options.challenge,
      subscriberId: admin.id,
      email: admin.email,
      flow: "register",
    });

    return NextResponse.json(options);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not start Face ID setup.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

import { NextResponse } from "next/server";
import { verifyRegistrationResponse } from "@simplewebauthn/server";

import { createPasskey } from "@/lib/admin-passkeys";
import { setAdminSession } from "@/lib/admin-session";
import { requireAdminEnrollmentSession } from "@/lib/admin";
import {
  getWebAuthnOrigin,
  getWebAuthnRpId,
} from "@/lib/webauthn-config";
import { consumeWebAuthnChallenge } from "@/lib/webauthn-challenge";

export async function POST(request: Request) {
  try {
    const admin = await requireAdminEnrollmentSession();
    const challenge = await consumeWebAuthnChallenge("register");
    if (!challenge || challenge.subscriberId !== admin.id) {
      return NextResponse.json(
        { error: "Face ID setup expired. Please try again." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const verification = await verifyRegistrationResponse({
      response: body,
      expectedChallenge: challenge.challenge,
      expectedOrigin: getWebAuthnOrigin(),
      expectedRPID: getWebAuthnRpId(),
      requireUserVerification: true,
    });

    if (!verification.verified || !verification.registrationInfo) {
      return NextResponse.json(
        { error: "Face ID verification failed." },
        { status: 400 }
      );
    }

    const { credential, credentialDeviceType, credentialBackedUp } =
      verification.registrationInfo;

    await createPasskey({
      email: admin.email,
      credentialId: credential.id,
      publicKey: Buffer.from(credential.publicKey).toString("base64url"),
      counter: credential.counter,
      transports: credential.transports,
    });

    await setAdminSession(admin.id);

    return NextResponse.json({
      ok: true,
      deviceType: credentialDeviceType,
      backedUp: credentialBackedUp,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not save Face ID passkey.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

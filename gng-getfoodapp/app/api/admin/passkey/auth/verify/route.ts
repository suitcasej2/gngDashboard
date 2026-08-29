import { NextResponse } from "next/server";
import { verifyAuthenticationResponse } from "@simplewebauthn/server";

import {
  findPasskeyByCredentialId,
  updatePasskeyCounter,
} from "@/lib/admin-passkeys";
import { isAdminSubscriber } from "@/lib/admin";
import { setAdminSession } from "@/lib/admin-session";
import { findSubscriberByEmail } from "@/lib/subscriber";
import {
  getWebAuthnOrigin,
  getWebAuthnRpId,
} from "@/lib/webauthn-config";
import { consumeWebAuthnChallenge } from "@/lib/webauthn-challenge";

export async function POST(request: Request) {
  try {
    const challenge = await consumeWebAuthnChallenge("authenticate");
    if (!challenge) {
      return NextResponse.json(
        { error: "Sign-in expired. Please try your passkey again." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const passkey = await findPasskeyByCredentialId(body.id);
    if (!passkey) {
      return NextResponse.json(
        { error: "Unrecognized admin passkey." },
        { status: 403 }
      );
    }

    const subscriber = await findSubscriberByEmail(passkey.email);
    if (!subscriber || !isAdminSubscriber(subscriber)) {
      return NextResponse.json(
        { error: "That passkey is not linked to a Staff/admin account." },
        { status: 403 }
      );
    }

    const verification = await verifyAuthenticationResponse({
      response: body,
      expectedChallenge: challenge.challenge,
      expectedOrigin: getWebAuthnOrigin(),
      expectedRPID: getWebAuthnRpId(),
      requireUserVerification: false,
      credential: {
        id: passkey.credentialId,
        publicKey: Buffer.from(passkey.publicKey, "base64url"),
        counter: passkey.counter,
        transports: passkey.transports as AuthenticatorTransport[],
      },
    });

    if (!verification.verified) {
      return NextResponse.json(
        { error: "Passkey verification failed." },
        { status: 400 }
      );
    }

    const { newCounter } = verification.authenticationInfo;
    await updatePasskeyCounter(passkey.id, newCounter);

    await setAdminSession(subscriber.id);

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Could not verify passkey sign-in.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

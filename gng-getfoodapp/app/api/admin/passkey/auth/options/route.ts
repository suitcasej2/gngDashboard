import { NextResponse } from "next/server";
import { generateAuthenticationOptions } from "@simplewebauthn/server";

import { listAllPasskeys } from "@/lib/admin-passkeys";
import { isAdminEmail } from "@/lib/admin-emails";
import { findSubscriberByEmail } from "@/lib/subscriber";
import { getWebAuthnRpId } from "@/lib/webauthn-config";
import { storeWebAuthnChallenge } from "@/lib/webauthn-challenge";

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      email?: string;
    };
    const email = body.email?.trim().toLowerCase();

    let subscriberId = "";
    let challengeEmail = "";

    if (email) {
      if (!isAdminEmail(email)) {
        return NextResponse.json(
          { error: "That email is not authorized for admin access." },
          { status: 403 }
        );
      }
      const subscriber = await findSubscriberByEmail(email);
      if (!subscriber) {
        return NextResponse.json(
          { error: "No account found for that email." },
          { status: 404 }
        );
      }
      subscriberId = subscriber.id;
      challengeEmail = subscriber.email;
    }

    const passkeys = await listAllPasskeys();
    if (passkeys.length === 0) {
      return NextResponse.json(
        {
          error:
            "No admin passkeys are set up yet. Sign in with email first, then enroll Face ID.",
        },
        { status: 404 }
      );
    }

    const options = await generateAuthenticationOptions({
      rpID: getWebAuthnRpId(),
      userVerification: "required",
      allowCredentials: email
        ? passkeys
            .filter((passkey) => passkey.email === email)
            .map((passkey) => ({
              id: passkey.credentialId,
              transports: passkey.transports as AuthenticatorTransport[],
            }))
        : undefined,
    });

    await storeWebAuthnChallenge({
      challenge: options.challenge,
      subscriberId: subscriberId || "discoverable",
      email: challengeEmail,
      flow: "authenticate",
    });

    return NextResponse.json(options);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not start admin sign-in.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

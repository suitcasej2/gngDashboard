import { NextResponse } from "next/server";
import { getSessionSubscriber } from "@/lib/auth";
import { isAdminSubscriber } from "@/lib/admin";

export async function GET() {
  const subscriber = await getSessionSubscriber();
  if (!subscriber) {
    return NextResponse.json({ subscriber: null });
  }

  return NextResponse.json({
    subscriber: {
      id: subscriber.id,
      email: subscriber.email,
      fullName: subscriber.fullName,
    },
    isAdmin: isAdminSubscriber(subscriber),
  });
}

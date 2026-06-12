import { NextResponse } from "next/server";
import { getSessionSubscriber } from "@/lib/auth";

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
  });
}

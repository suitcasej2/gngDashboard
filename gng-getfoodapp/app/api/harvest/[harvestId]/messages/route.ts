import { NextResponse } from "next/server";
import { getSessionSubscriber } from "@/lib/auth";
import { friendlyAirtableError } from "@/lib/airtable-errors";
import { getHarvestById, isHarvestChatOpen } from "@/lib/harvest";
import {
  listMessagesForHarvest,
  postHarvestMessage,
} from "@/lib/harvest-messages";

type RouteContext = { params: Promise<{ harvestId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const subscriber = await getSessionSubscriber();
  if (!subscriber) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { harvestId } = await context.params;
  const harvest = await getHarvestById(harvestId);
  if (!harvest) {
    return NextResponse.json({ error: "Harvest not found" }, { status: 404 });
  }

  try {
    const messages = await listMessagesForHarvest(harvestId);
    return NextResponse.json({
      messages,
      chatOpen: isHarvestChatOpen(harvest),
    });
  } catch (e) {
    return NextResponse.json(
      { error: friendlyAirtableError(e) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request, context: RouteContext) {
  const subscriber = await getSessionSubscriber();
  if (!subscriber) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { harvestId } = await context.params;
  const harvest = await getHarvestById(harvestId);
  if (!harvest) {
    return NextResponse.json({ error: "Harvest not found" }, { status: 404 });
  }

  if (!isHarvestChatOpen(harvest)) {
    return NextResponse.json(
      { error: "Chat is closed for completed harvests." },
      { status: 403 }
    );
  }

  let body: string;
  try {
    const json = (await request.json()) as { body?: string };
    body = json.body?.trim() ?? "";
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!body) {
    return NextResponse.json(
      { error: "Message cannot be empty." },
      { status: 400 }
    );
  }

  try {
    const message = await postHarvestMessage({
      harvestId,
      subscriberId: subscriber.id,
      body,
    });
    return NextResponse.json({ message });
  } catch (e) {
    return NextResponse.json(
      { error: friendlyAirtableError(e) },
      { status: 500 }
    );
  }
}

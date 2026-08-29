export type PushPayload = {
  heading: string;
  content: string;
  url?: string;
};

export type PushSendResult =
  | { ok: true; notificationId: string }
  | { ok: false; skipped?: true; message: string };

export function getSubscriberAppUrl() {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (configured) return configured;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3001";
}

export function isPushConfigured() {
  return Boolean(
    process.env.ONESIGNAL_APP_ID && process.env.ONESIGNAL_REST_API_KEY
  );
}

type OneSignalCreateResponse = {
  id?: string;
  errors?: string[];
};

async function postOneSignalNotification(
  body: Record<string, unknown>
): Promise<PushSendResult> {
  const appId = process.env.ONESIGNAL_APP_ID;
  const apiKey = process.env.ONESIGNAL_REST_API_KEY;

  if (!appId || !apiKey) {
    console.warn("[push] OneSignal is not configured — skipping notification.");
    return {
      ok: false,
      skipped: true,
      message: "Push is not configured on the server (missing OneSignal env vars).",
    };
  }

  const res = await fetch("https://api.onesignal.com/notifications", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Key ${apiKey}`,
    },
    body: JSON.stringify({
      app_id: appId,
      target_channel: "push",
      ...body,
    }),
  });

  let data: OneSignalCreateResponse = {};
  try {
    data = (await res.json()) as OneSignalCreateResponse;
  } catch {
    data = {};
  }

  if (!res.ok) {
    const message =
      data.errors?.join("; ") ||
      `OneSignal request failed (${res.status}).`;
    console.error("[push] OneSignal error:", message);
    return { ok: false, message };
  }

  if (data.errors?.length || !data.id) {
    const message =
      data.errors?.join("; ") ||
      "No push subscribers received this notification.";
    console.error("[push] OneSignal error:", message);
    return { ok: false, message };
  }

  return { ok: true, notificationId: data.id };
}

function resolveTargetUrl(url?: string) {
  const appUrl = getSubscriberAppUrl();
  if (!url) return appUrl;
  return url.startsWith("http") ? url : `${appUrl}${url}`;
}

export async function sendPushToSubscribers(
  payload: PushPayload
): Promise<PushSendResult> {
  const appUrl = getSubscriberAppUrl();
  return postOneSignalNotification({
    included_segments: ["All"],
    headings: { en: payload.heading },
    contents: { en: payload.content },
    web_url: resolveTargetUrl(payload.url),
    chrome_web_icon: `${appUrl}/AppIcon.png`,
  });
}

/** OneSignal caps alias batches; chunk external IDs. */
const EXTERNAL_ID_CHUNK = 200;

/**
 * Push to specific subscribers (OneSignal external_id === Airtable subscriber record id).
 * Clients call OneSignal.login(subscriber.id) on sign-in.
 */
export async function sendPushToExternalIds(
  externalIds: string[],
  payload: PushPayload
): Promise<PushSendResult> {
  const unique = [...new Set(externalIds.filter(Boolean))];
  if (unique.length === 0) {
    return { ok: false, skipped: true, message: "No recipients." };
  }

  const appUrl = getSubscriberAppUrl();
  const targetUrl = resolveTargetUrl(payload.url);
  let lastId = "";

  for (let i = 0; i < unique.length; i += EXTERNAL_ID_CHUNK) {
    const chunk = unique.slice(i, i + EXTERNAL_ID_CHUNK);
    const result = await postOneSignalNotification({
      include_aliases: { external_id: chunk },
      headings: { en: payload.heading },
      contents: { en: payload.content },
      web_url: targetUrl,
      chrome_web_icon: `${appUrl}/AppIcon.png`,
    });

    if (!result.ok) return result;
    lastId = result.notificationId;
  }

  return { ok: true, notificationId: lastId };
}

export async function notifyNewHarvest(harvestName: string) {
  return sendPushToSubscribers({
    heading: "New harvest is live",
    content: `${harvestName} is ready — RSVP now!`,
    url: "/harvest/rsvp",
  });
}

export async function notifyCeoMessage(
  message: string,
  harvestId?: string,
  messageId?: string
) {
  const preview =
    message.trim().length > 140
      ? `${message.trim().slice(0, 137)}…`
      : message.trim();

  const path = messageId ? `/?message=${messageId}` : harvestId ? "/" : "/";

  return sendPushToSubscribers({
    heading: "Mia's Broadcast",
    content: preview || "You have a new broadcast from Mia.",
    url: path,
  });
}

export async function notifyRsvpReminder(
  kind: "friday" | "monday",
  harvestName: string,
  subscriberIds: string[]
) {
  if (kind === "friday") {
    return sendPushToExternalIds(subscriberIds, {
      heading: "RSVP reminder",
      content: `Friday is the preferred deadline for ${harvestName}. Tap to RSVP.`,
      url: "/harvest/rsvp",
    });
  }

  return sendPushToExternalIds(subscriberIds, {
    heading: "Last reminder to RSVP",
    content: `${harvestName} is this week — please RSVP if you haven’t yet.`,
    url: "/harvest/rsvp",
  });
}

export async function notifyAutoDonate(subscriberIds: string[]) {
  return sendPushToExternalIds(subscriberIds, {
    heading: "We've marked you as Donate",
    content:
      "You hadn’t RSVP’d by 9am, so we marked your box as Donate. You can still update your RSVP.",
    url: "/harvest/rsvp",
  });
}

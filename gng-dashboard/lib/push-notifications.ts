export type PushPayload = {
  heading: string;
  content: string;
  url?: string;
};

export function getSubscriberAppUrl() {
  const configured = process.env.GETFOODAPP_URL?.replace(/\/$/, "");
  if (configured) return configured;
  return "http://localhost:3001";
}

export function isPushConfigured() {
  return Boolean(
    process.env.ONESIGNAL_APP_ID && process.env.ONESIGNAL_REST_API_KEY
  );
}

export async function sendPushToSubscribers(payload: PushPayload) {
  const appId = process.env.ONESIGNAL_APP_ID;
  const apiKey = process.env.ONESIGNAL_REST_API_KEY;

  if (!appId || !apiKey) {
    console.warn("[push] OneSignal is not configured — skipping notification.");
    return { ok: false as const, skipped: true as const };
  }

  const appUrl = getSubscriberAppUrl();
  const targetUrl = payload.url
    ? payload.url.startsWith("http")
      ? payload.url
      : `${appUrl}${payload.url}`
    : appUrl;

  const res = await fetch("https://api.onesignal.com/notifications", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Key ${apiKey}`,
    },
    body: JSON.stringify({
      app_id: appId,
      included_segments: ["Subscribed Users"],
      headings: { en: payload.heading },
      contents: { en: payload.content },
      url: targetUrl,
      chrome_web_icon: `${appUrl}/AppIcon.png`,
    }),
  });

  if (!res.ok) {
    const message = await res.text();
    console.error("[push] OneSignal error:", message);
    return { ok: false as const, message };
  }

  return { ok: true as const };
}

export async function notifyNewHarvest(harvestName: string) {
  return sendPushToSubscribers({
    heading: "New harvest is live",
    content: `${harvestName} is ready — RSVP now!`,
    url: "/harvest/rsvp",
  });
}

export async function notifyCeoMessage(message: string) {
  const preview =
    message.trim().length > 140
      ? `${message.trim().slice(0, 137)}…`
      : message.trim();

  return sendPushToSubscribers({
    heading: "Message from GNG",
    content: preview || "You have a new update from the GNG team.",
    url: "/",
  });
}

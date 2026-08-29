export type MassEmailContent = {
  subject: string;
  eyebrow?: string;
  headline?: string;
  opening: string;
  /** Yellow branded callout near the top (dates, urgency, key CTA). */
  highlight?: string;
  middle?: string;
  bullets?: string;
  buttonLabel?: string;
  buttonUrl?: string;
  closing?: string;
};

const LOGO_URL =
  "https://images.squarespace-cdn.com/content/v1/5937f47d3a04118cbadb1c8f/cdaff35d-5a8e-40be-90bb-86b0c53520fa/LogoW.png?format=300w";

const APP_ICON_PATH = "/icons/icon-192.png";
const DEFAULT_APP_ORIGIN = "https://gng-get-food-app.vercel.app";

export function getMassEmailAppIconUrl(origin?: string): string {
  const base = (origin || DEFAULT_APP_ORIGIN).replace(/\/$/, "");
  return `${base}${APP_ICON_PATH}`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Yellow-highlight month + day phrases like "August 19th". */
function emphasizeDates(escaped: string): string {
  return escaped.replace(
    /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:st|nd|rd|th)?\b/gi,
    (match) =>
      `<span style="background-color:#fff904; padding:2px 6px; border-radius:4px; font-weight:bold; color:#381810;">${match}</span>`
  );
}

/** Split on blank lines into paragraphs; single newlines become <br>. */
function paragraphsToHtml(
  raw: string,
  options?: { emphasizeDates?: boolean }
): string {
  const blocks = raw
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);

  return blocks
    .map((block) => {
      let html = escapeHtml(block).replace(/\n/g, "<br>");
      if (options?.emphasizeDates) {
        html = emphasizeDates(html);
      }
      return `<p style="margin:0 0 16px 0; font-size:15px; line-height:1.55; color:#4a3728;">${html}</p>`;
    })
    .join("\n");
}

function bulletsToHtml(raw: string): string {
  const items = raw
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trim().replace(/^[-•*]\s+/, ""))
    .filter(Boolean);

  if (items.length === 0) return "";

  const lis = items
    .map(
      (item) =>
        `<li style="margin:0 0 8px 0; font-size:15px; line-height:1.5; color:#4a3728;">${escapeHtml(item)}</li>`
    )
    .join("");

  return `<ul style="margin:0 0 20px 0; padding:0 0 0 1.25rem;">${lis}</ul>`;
}

function normalizeUrl(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^mailto:/i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function calloutToHtml(raw: string): string {
  const lines = raw
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) return "";

  const [first, ...rest] = lines;
  const titleHtml = emphasizeDates(escapeHtml(first));
  const detailHtml = rest.length
    ? `<p style="margin:8px 0 0 0; font-family:Arial, Helvetica, sans-serif; font-size:15px; line-height:1.45; font-weight:normal; color:#381810;">${emphasizeDates(
        rest.map((line) => escapeHtml(line)).join("<br>")
      )}</p>`
    : "";

  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 20px 0; border-collapse:separate;">
  <tr>
    <td style="padding:16px 18px; background-color:#fff904; border:2px solid #381810; border-radius:14px; font-family:Arial, Helvetica, sans-serif; color:#381810;">
      <p style="margin:0; font-family:Georgia, 'Times New Roman', serif; font-size:20px; line-height:1.25; font-weight:bold; color:#381810;">
        ${titleHtml}
      </p>
      ${detailHtml}
    </td>
  </tr>
</table>`;
}

function buttonToHtml(label: string, url: string, options?: { early?: boolean }) {
  const margin = options?.early ? "0 0 22px 0" : "8px 0 24px 0";
  return `<a href="${escapeHtml(url)}" style="display:block; text-align:center; background-color:#56bb55; color:#ffffff; text-decoration:none; font-family:Arial, Helvetica, sans-serif; font-size:17px; font-weight:bold; padding:16px 18px; border-radius:999px; margin:${margin}; border:2px solid #381810;">${escapeHtml(label)}</a>`;
}

/** Home-screen style preview of the Get Food app icon. */
function appIconPreviewHtml(appIconUrl: string): string {
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:4px 0 20px 0;">
  <tr>
    <td align="center" style="padding:18px 16px; background-color:#faf7f2; border:1px solid #e8e0d8; border-radius:14px;">
      <p style="margin:0 0 14px 0; font-family:Arial, Helvetica, sans-serif; font-size:12px; font-weight:bold; letter-spacing:0.12em; text-transform:uppercase; color:#8a7364;">
        Looks like this on your phone
      </p>
      <img src="${escapeHtml(appIconUrl)}" alt="Get Food app icon" width="88" height="88" style="display:block; margin:0 auto; width:88px; height:88px; border:0; border-radius:20px; box-shadow:0 4px 14px rgba(56,24,16,0.18);">
      <p style="margin:10px 0 0 0; font-family:Arial, Helvetica, sans-serif; font-size:13px; line-height:1.3; color:#381810;">
        Get Food
      </p>
    </td>
  </tr>
</table>`;
}

export function buildMassEmailHtml(
  content: MassEmailContent,
  options?: { origin?: string; appIconUrl?: string }
): string {
  const eyebrow = content.eyebrow?.trim() || "Good Neighbor Gardens";
  const headline = content.headline?.trim() || content.subject.trim();
  const openingHtml = paragraphsToHtml(content.opening, {
    emphasizeDates: true,
  });
  const highlight = content.highlight?.trim();
  const middleHtml = content.middle?.trim()
    ? paragraphsToHtml(content.middle, { emphasizeDates: true })
    : "";
  const bulletsHtml = content.bullets?.trim()
    ? bulletsToHtml(content.bullets)
    : "";
  const closingHtml = content.closing?.trim()
    ? paragraphsToHtml(content.closing, { emphasizeDates: true })
    : "";

  const buttonLabel = content.buttonLabel?.trim();
  const buttonUrl = content.buttonUrl
    ? normalizeUrl(content.buttonUrl)
    : null;
  const showButton = Boolean(buttonLabel && buttonUrl);
  const appIconUrl =
    options?.appIconUrl?.trim() || getMassEmailAppIconUrl(options?.origin);

  // Callout + early CTA sit above the long body so the ask isn't buried.
  const calloutHtml = highlight ? calloutToHtml(highlight) : "";
  const earlyButtonHtml =
    showButton && highlight
      ? buttonToHtml(buttonLabel!, buttonUrl!, { early: true })
      : "";
  const mainButtonHtml = showButton
    ? buttonToHtml(buttonLabel!, buttonUrl!)
    : "";
  // Show icon preview when there's an install-style CTA.
  const iconHtml = showButton ? appIconPreviewHtml(appIconUrl) : "";

  const preheader = escapeHtml(content.subject.trim());

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <title>${escapeHtml(content.subject.trim())}</title>
</head>
<body style="margin:0; padding:0; background-color:#faf9f7;">
  <div style="display:none; max-height:0; overflow:hidden; mso-hide:all; font-size:1px; line-height:1px; color:#faf9f7;">
    ${preheader}
  </div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#faf9f7;">
    <tr>
      <td align="center" style="padding:28px 16px;">
        <table role="presentation" width="560" cellspacing="0" cellpadding="0" border="0" style="width:100%; max-width:560px; border-collapse:collapse; background-color:#ffffff; border:1px solid #e8e0d8; border-radius:16px;">
          <tr>
            <td align="center" style="padding:20px 24px; background-color:#381810; border-radius:16px 16px 0 0;">
              <img src="${LOGO_URL}" alt="Good Neighbor Gardens" width="96" style="display:block; margin:0 auto; width:96px; max-width:96px; height:auto; border:0;">
            </td>
          </tr>
          <tr>
            <td style="padding:28px 24px 8px 24px; font-family:Arial, Helvetica, sans-serif; color:#381810;">
              <p style="margin:0 0 6px 0; font-size:12px; font-weight:bold; letter-spacing:0.12em; text-transform:uppercase; color:#8a7364;">
                ${escapeHtml(eyebrow)}
              </p>
              <h1 style="margin:0 0 16px 0; font-family:Georgia, 'Times New Roman', serif; font-size:26px; line-height:1.2; font-weight:bold; color:#381810;">
                ${escapeHtml(headline)}
              </h1>
              ${calloutHtml}
              ${iconHtml}
              ${earlyButtonHtml}
              ${openingHtml}
              ${middleHtml}
              ${bulletsHtml}
              ${mainButtonHtml}
              ${closingHtml}
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:22px 24px; background-color:#381810; border-radius:0 0 16px 16px; font-family:Arial, Helvetica, sans-serif; color:#ffffff; font-size:12px; line-height:1.6;">
              <img src="${LOGO_URL}" alt="" width="72" style="display:block; margin:0 auto 12px auto; width:72px; max-width:72px; height:auto; border:0;">
              <p style="margin:0 0 12px 0; color:#f0e8e0;">
                Good Neighbor Gardens · San Diego
              </p>
              <p style="margin:0;">
                <a href="{{unsubscribe_url}}" style="color:#ffffff; text-decoration:underline;">Unsubscribe</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

import { getAdminSessionSubscriber } from "@/lib/admin-session";

const ALLOWED_FOLDERS = new Set([
  "harvest-box",
  "recipe",
  "bread-butter-jam",
  "donor-logo",
]);

const ALLOWED_CONTENT_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
];

const MAX_BYTES = 12 * 1024 * 1024;

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        const admin = await getAdminSessionSubscriber();
        if (!admin) {
          throw new Error("Admin session required. Please sign in again.");
        }

        if (!process.env.BLOB_READ_WRITE_TOKEN) {
          throw new Error("Image uploads are not configured (missing BLOB_READ_WRITE_TOKEN).");
        }

        const folder = pathname.split("/")[0] ?? "";
        if (!ALLOWED_FOLDERS.has(folder)) {
          throw new Error("Invalid upload folder.");
        }

        return {
          allowedContentTypes: ALLOWED_CONTENT_TYPES,
          maximumSizeInBytes: MAX_BYTES,
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async () => {
        // Client already receives the blob URL from the upload response.
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not prepare image upload.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

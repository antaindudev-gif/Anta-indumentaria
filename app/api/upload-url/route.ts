import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { s3Client } from "@/lib/s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Only allow image types
const ALLOWED_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
];

// 20 MB max for the presigned upload (R2 enforces this when signing)
const MAX_SIZE_BYTES = 20 * 1024 * 1024;

export async function GET(req: NextRequest) {
  // Auth check — only admins can generate upload URLs
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const folder = searchParams.get("folder") ?? "home";
  const contentType = searchParams.get("contentType") ?? "image/jpeg";
  const originalName = searchParams.get("filename") ?? "upload";

  if (!ALLOWED_CONTENT_TYPES.includes(contentType)) {
    return NextResponse.json({ error: "Tipo de archivo no permitido" }, { status: 400 });
  }

  const bucketName = process.env.R2_BUCKET_NAME;
  const publicUrl = process.env.R2_PUBLIC_URL;
  if (!bucketName || !publicUrl) {
    return NextResponse.json({ error: "Configuración de storage incompleta" }, { status: 500 });
  }

  // Build a unique key. We keep the original extension but prefix with folder + timestamp.
  const ext = originalName.includes(".") ? originalName.split(".").pop()! : "jpg";
  const key = `${folder}/${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: contentType,
    // Do NOT include ContentLength here — it gets added to SignedHeaders and forces
    // a CORS preflight that R2 blocks when the upload comes from the browser.
  });

  // Presigned URL expires in 5 minutes.
  // unhoistableHeaders: tell the SDK NOT to sign content-length/checksum headers
  // so the browser can do a simple (non-preflighted) PUT request.
  const uploadUrl = await getSignedUrl(s3Client, command, {
    expiresIn: 300,
    unhoistableHeaders: new Set([
      "content-length",
      "x-amz-checksum-crc32",
      "x-amz-sdk-checksum-algorithm",
    ]),
  });
  const finalUrl = `${publicUrl}/${key}`;

  return NextResponse.json({ uploadUrl, finalUrl, key });
}

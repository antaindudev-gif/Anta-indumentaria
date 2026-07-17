import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Separate S3 client for presigned URLs — checksums disabled so the browser
// can PUT directly without triggering a CORS preflight.
const s3Presign = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",
});

// Only allow image types
const ALLOWED_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
];

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
  });

  // With requestChecksumCalculation: "WHEN_REQUIRED" on the client,
  // no checksum or content-length headers are added to the signed URL.
  // The browser can PUT directly — no preflight, no CORS issues.
  const uploadUrl = await getSignedUrl(s3Presign, command, { expiresIn: 300 });
  const finalUrl = `${publicUrl}/${key}`;

  return NextResponse.json({ uploadUrl, finalUrl, key });
}

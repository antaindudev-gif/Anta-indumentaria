import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

export const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function uploadToR2(buffer: Buffer, filename: string, contentType: string = 'image/webp') {
  const bucketName = process.env.R2_BUCKET_NAME;
  if (!bucketName) throw new Error("R2_BUCKET_NAME is not set");

  await s3Client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: filename,
      Body: buffer,
      ContentType: contentType,
    })
  );

  return `${process.env.R2_PUBLIC_URL}/${filename}`;
}

export async function deleteFromR2(url: string) {
  if (!url) return;
  const bucketName = process.env.R2_BUCKET_NAME;
  if (!bucketName) return;

  const publicUrl = process.env.R2_PUBLIC_URL;
  if (!publicUrl) return;

  if (url.startsWith(publicUrl)) {
    const filename = url.replace(`${publicUrl}/`, '');
    try {
      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: bucketName,
          Key: filename,
        })
      );
    } catch (error) {
      console.error("Error deleting from R2:", error);
    }
  }
}

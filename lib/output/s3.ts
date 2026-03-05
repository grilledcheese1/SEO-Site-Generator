import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    }
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || "seoweboptimizer-outputs";

/**
 * Uploads a node buffer (such as a zip) to S3 and returns a time-controlled download URL.
 */
export async function uploadToS3AndGetUrl(buffer: Buffer, filename: string): Promise<string> {
    if (!process.env.AWS_ACCESS_KEY_ID) {
        console.warn("AWS Credentials missing. Assuming local test execution.");
        return `http://localhost:3000/mock-download/${filename}`;
  }

  const s3Key = `themes/${Date.now()}-${filename}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: s3Key,
    Body: buffer,
    ContentType: "application/zip",
  });

  // 1. Upload
  await s3Client.send(command);

  // 2. Generate 1 hour presigned request
  const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  
  return presignedUrl;
}

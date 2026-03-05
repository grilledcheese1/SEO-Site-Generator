import { NextResponse } from "next/server";
import { compileHtml } from "@/lib/output/compiler";
import { createZipBuffer } from "@/lib/output/zipper";
import { uploadToS3AndGetUrl } from "@/lib/output/s3";
import { z } from "zod";
import { updateJobStatus } from "@/lib/db/jobs";

const outputRequestSchema = z.object({
  jobId: z.string().uuid().optional(),
  headHtml: z.string(),
  bodyHtml: z.string(),
  metadata: z.object({
    title: z.string(),
    description: z.string(),
    url: z.string(),
    canonical: z.string().optional()
  })
});

/**
 * Handles combining the head and body HTML payloads, encapsulating them into 
 * a ZIP file, uploading to S3, and optionally closing out a Jobs Database execution entry.
 */
export async function POST(req: Request) {
  try {
    const json = await req.json();
    const payload = outputRequestSchema.parse(json);

    const finalHtml = compileHtml(payload.headHtml, payload.bodyHtml, payload.metadata);

    const zipBuffer = await createZipBuffer(finalHtml);
    const filename = `theme-${Date.now()}.zip`;

    const downloadUrl = await uploadToS3AndGetUrl(zipBuffer, filename);

    // If a worker passed a Job ID along the pipeline, close it out now
    if (payload.jobId) {
      await updateJobStatus(payload.jobId, "COMPLETE", downloadUrl);
    }

    return NextResponse.json({ downloadUrl });

  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 400 });
  }
}

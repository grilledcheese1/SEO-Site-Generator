import { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } from "@aws-sdk/client-sqs";
import { jobMessageSchema } from "../validation/schemas";
import { updateJobStatus } from "../db/jobs";

const sqsClient = new SQSClient({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    }
});

const QUEUE_URL = process.env.SQS_QUEUE_URL || "";

/**
 * Starts a Long Polling (20s) SQS receive loop processing messages one by one.
 * Orchestrates the full pipeline.
 */
export async function startConsumerWorker() {
    if (!QUEUE_URL) {
        console.warn("SQS_QUEUE_URL missing. Consumer exiting.");
        return;
    }

    console.log("Starting SQS consumer worker with 20s long polling...");

    while (true) {
        try {
            const receiveCommand = new ReceiveMessageCommand({
                QueueUrl: QUEUE_URL,
                MaxNumberOfMessages: 1,
                WaitTimeSeconds: 20 // Enforce minimal empty calls
            });

            const response = await sqsClient.send(receiveCommand);

            if (response.Messages && response.Messages.length > 0) {
                for (const message of response.Messages) {
                    if (!message.Body || !message.ReceiptHandle) continue;

                    console.log("Received Job:", message.Body);

                    let jobContext;
                    try {
                        // Strictly validate incoming worker data
                        const rawBody = JSON.parse(message.Body);
                        jobContext = jobMessageSchema.parse(rawBody);
                    } catch (e) {
                        console.error("Malformed queue payload. Fails validation bounds.", e);
                        continue; // Will eventually hit dead letter queue or visibility timeout
                    }

                    try {
                        // 1. Mark Processing
                        await updateJobStatus(jobContext.jobId, "PROCESSING");

                        // TODO: Orchestrate actual pipeline fetches 
                        // (POST /api/parse -> POST /api/classify -> POST /api/theme -> POST /api/map -> POST /api/seo -> POST /api/output)
                        // In a real worker, you'd HTTP fetch these internal micro-routes, or just call the TS functions directly.
                        // For architecture scaffolding, we define the structure here.

                        console.log(`[Worker] Orchestrating complete pipeline for Job: ${jobContext.jobId}`);

            // 2. Mark Complete
            await updateJobStatus(jobContext.jobId, "COMPLETE", "https://mock-s3-download-url.com");

            // 3. Purge Message
            await sqsClient.send(new DeleteMessageCommand({
              QueueUrl: QUEUE_URL,
              ReceiptHandle: message.ReceiptHandle
            }));

          } catch (jobError) {
            console.error("Job Pipeline Execution Failed:", jobError);
            await updateJobStatus(jobContext.jobId, "FAILED");
          }
        }
      }
    } catch(err) {
      console.error("SQS Receive Error:", err);
      // Brief sleep before retrying on severe network failure
      await new Promise(r => setTimeout(r, 5000));
    }
  }
}

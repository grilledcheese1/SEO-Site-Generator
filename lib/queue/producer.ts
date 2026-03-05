import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import type { JobMessage } from "../validation/schemas";

const sqsClient = new SQSClient({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    }
});

const QUEUE_URL = process.env.SQS_QUEUE_URL || "";

/**
 * Dispatches the structured Generation task into the FIFO queue.
 * Requires MessageGroupId set to userId to process one theme at a time per user.
 */
export async function enqueueThemeJob(jobMessage: JobMessage): Promise<void> {
    if (!QUEUE_URL) {
        console.warn("SQS_QUEUE_URL missing. Skipping enqueue for testing.");
        return;
    }

    const command = new SendMessageCommand({
        QueueUrl: QUEUE_URL,
        MessageBody: JSON.stringify(jobMessage),
        MessageGroupId: jobMessage.userId, // Strict ordering per user
        MessageDeduplicationId: jobMessage.jobId // Prevent duplicate executions
    });

    await sqsClient.send(command);
}

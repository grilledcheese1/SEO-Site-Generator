import { z } from "zod";

/**
 * Validates untyped data against a Zod schema, throwing an error on failure.
 * Ensures the pipeline cleanly fails bad payloads before sending to expensive APIs.
 */
export function validatePayload<T>(schema: z.ZodSchema<T>, data: unknown): T {
    const result = schema.safeParse(data);
    if (!result.success) {
        throw new Error(`Validation Error: ${JSON.stringify(result.error.format())}`);
  }
  return result.data;
}

/**
 * Validates untyped data but returns null on failure instead of throwing.
 */
export function validatePayloadSafe<T>(schema: z.ZodSchema<T>, data: unknown): T | null {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error("Payload validation failed", result.error.format());
    return null;
  }
  return result.data;
}

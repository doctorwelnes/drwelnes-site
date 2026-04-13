import { NextResponse } from "next/server";
import { ZodSchema, ZodError } from "zod";

export function validateRequest<T>(schema: ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: NextResponse } {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    const errorMessage = formatZodError(result.error);
    return {
      success: false,
      error: NextResponse.json({ error: "Validation failed", details: errorMessage }, { status: 400 }),
    };
  }
  
  return { success: true, data: result.data };
}

function formatZodError(error: ZodError): string {
  const issues = error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`);
  return issues.join("; ");
}

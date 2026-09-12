import { revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;
  const headerSecret = request.headers.get("x-revalidate-secret");
  const authHeader = request.headers.get("authorization");
  const bearerToken = authHeader?.replace(/^Bearer\s+/i, "");

  // If REVALIDATE_SECRET is configured, enforce matching token
  if (secret) {
    if (headerSecret !== secret && bearerToken !== secret) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid or missing secret token" },
        { status: 401 }
      );
    }
  }

  try {
    revalidateTag("exam-data", "max");
    revalidateTag("exam-sheets", "max");

    return NextResponse.json({
      revalidated: true,
      tags: ["exam-data", "exam-sheets"],
      now: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to revalidate cache", details: String(error) },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch(`${process.env.DEBLOG_BACKEND_URL}/health`, {
      method: "GET",
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });

    const text = await response.text();
    console.log("Health check response text:", text);
    return NextResponse.json(
      {
        backendStatus: response.status,
        backendResponse: text,
        frontendMessage: "Health check successful",
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        backendStatus: null,
        backendResponse: null,
        frontendMessage: "Health check failed",
      },
      { status: 500 }
    );
  }
}

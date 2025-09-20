import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const internalRequest = request.headers.get("frontend-internal-request");
    if (internalRequest !== "true") {
      return NextResponse.json({
        success: false,
        statusCode: 400,
        message: "Missing Frontend-Internal-Request header",
      }, { status: 400 });
    }

import { NextResponse } from "next/server";

export async function PUT() {
  return NextResponse.json({
    success: false,
    statusCode: 404,
    message: "Not Found"
  }, { status: 404 });
}

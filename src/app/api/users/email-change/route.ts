import { httpStatus } from "@/constants/index.constants";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: false,
    statusCode: httpStatus.NOT_FOUND,
    message: "Not Found"
  }, { status: httpStatus.NOT_FOUND });
}

export async function POST() {
  return NextResponse.json({
    success: false,
    statusCode: httpStatus.NOT_FOUND,
    message: "Not Found"
  }, { status: httpStatus.NOT_FOUND });
}

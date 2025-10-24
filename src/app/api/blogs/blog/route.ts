import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb.lib";

export const runtime = "nodejs";

export async function GET() {
  try {
    const db = await getDatabase(process.env.MONGODB_DB_BLOG!);
    const posts = await db
      .collection("posts")
      .find({})
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray();

    return NextResponse.json({
      success: true,
      statusCode: 200,
      message: "Blog posts fetched successfully",
      posts,
    });
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return NextResponse.json(
      {
        success: false,
        statusCode: 500,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}

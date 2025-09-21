import { getDatabase } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, category, keywords, post_ipfs_hash, user_id } =
      body;

    // Validate user ID
    if (!user_id) {
      return NextResponse.json(
        { message: "User ID is required" },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!title || !content || !category) {
      return NextResponse.json(
        { message: "Title, content, and category are required" },
        { status: 400 }
      );
    }

    // Validate category
    const validCategories = [
      "decode",
      "dehive",
      "dedao",
      "decareer",
      "decourse",
      "defuel",
      "deid",
    ];

    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { message: "Invalid category" },
        { status: 400 }
      );
    }

    // Get database connection
    const db = await getDatabase(process.env.MONGODB_DB_BLOG!);

    // Create blog post document
    const requestBody = {
      user_id,
      post_ipfs_hash: post_ipfs_hash || "",
      title,
      content,
      category,
      keywords: keywords || "",
      upvote: 0,
      downvote: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    console.log("requestBody", requestBody);

    // Insert into database
    const result = await db.collection("blogs").insertOne(requestBody);

    return NextResponse.json(
      {
        message: "Blog post created successfully",
        postId: result.insertedId,
        post_ipfs_hash,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating blog post:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

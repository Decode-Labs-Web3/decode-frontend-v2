import { getDatabase } from "@/lib/mongodb.lib";
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export const runtime = "nodejs";

const VALID_CATEGORIES = [
  "decode",
  "dehive",
  "dedao",
  "decareer",
  "decourse",
  "defuel",
  "deid",
] as const;

function normalizeKeywords(input: string | string[] | undefined) {
  const arr = Array.isArray(input)
    ? input
    : String(input ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
  return [...new Set(arr.map((s) => s.toLowerCase()))];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, category, keywords, post_ipfs_hash, user_id } =
      body;

    if (!user_id) {
      return NextResponse.json(
        {
          success: false,
          statusCode: 400,
          message: "User ID is required",
        },
        { status: 400 }
      );
    }
    if (!ObjectId.isValid(user_id)) {
      return NextResponse.json({ message: "Invalid user_id" }, { status: 400 });
    }
    if (!title || !content || !category) {
      return NextResponse.json(
        {
          success: false,
          statusCode: 400,
          message: "Title, content, and category are required",
        },
        { status: 400 }
      );
    }
    if (!VALID_CATEGORIES.includes(category)) {
      return NextResponse.json(
        {
          success: false,
          statusCode: 400,
          message: "Invalid category",
        },
        { status: 400 }
      );
    }

    const db = await getDatabase(process.env.MONGODB_DB_BLOG!);

    const kw = normalizeKeywords(keywords);
    if (kw.length) {
      const ops = kw.map((name) => ({
        updateOne: {
          filter: { name },
          update: { $setOnInsert: { name } },
          upsert: true,
          collation: { locale: "en", strength: 2 },
        },
      }));
      await db.collection("keywords").bulkWrite(ops, { ordered: false });
    }

    const doc = {
      user_id: new ObjectId(user_id),
      title: String(title),
      content: String(content),
      category,
      keywords: kw,
      upvote: 0,
      downvote: 0,
      post_ipfs_hash: post_ipfs_hash ? String(post_ipfs_hash) : "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("blogs").insertOne(doc);

    return NextResponse.json(
      {
        success: true,
        statusCode: 201,
        message: "Blog post created successfully",
        postId: result.insertedId,
        post_ipfs_hash: doc.post_ipfs_hash,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating blog post:", error);
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

import clientPromise from "@/lib/mongodb.lib";
import { NextResponse } from "next/server";
export const runtime = "nodejs";
export async function GET() {
  const client = await clientPromise;
  const db = client?.db(process.env.MONGODB_DB_USER);
  const ping = await db?.command({ ping: 1 });
  return NextResponse.json({ ok: true, ping: ping });
}

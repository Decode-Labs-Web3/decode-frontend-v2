import { MongoClient, Db } from "mongodb";
const uri = process.env.MONGODB_URI || `mongodb://localhost:27017`;
if (!uri) console.error("Missing MONGODB_URI");
declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}
let clientPromise = global._mongoClientPromise;
if (!clientPromise) {
  const client = new MongoClient(uri);
  clientPromise = client.connect();
  global._mongoClientPromise = clientPromise;
}
export async function getDatabase(dbName: string): Promise<Db> {
  const client = await clientPromise;
  if (!client) {
    throw new Error("MongoDB client is not initialized");
  }
  return client.db(dbName);
}
export default clientPromise;

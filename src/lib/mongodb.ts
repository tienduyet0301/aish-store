import { MongoClient } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const uri = process.env.MONGODB_URI;
const options = {};

let client;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export async function connectToDatabase() {
  const client = await clientPromise;
  const db = client.db("aishh");

  // Update schema if needed
  const collections = await db.listCollections().toArray();
  const collectionNames = collections.map(col => col.name);

  // Create banners collection if it doesn't exist
  if (!collectionNames.includes("banners")) {
    await db.createCollection("banners");
    // Create indexes
    await db.collection("banners").createIndex({ order: 1 });
    await db.collection("banners").createIndex({ createdAt: 1 });
  }

  // Update products schema if needed
  if (collectionNames.includes("products")) {
    await db.collection("products").updateMany(
      { sizeGuideImage: { $exists: false } },
      { $set: { sizeGuideImage: "" } }
    );
  }

  return { client, db };
}

export default clientPromise; 
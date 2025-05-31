import { MongoClient } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local');
}

const uri = process.env.MONGODB_URI;
const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

let client: MongoClient;
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

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;

export async function connectToDatabase() {
  try {
    // Get client and ensure it's connected
    const client = await clientPromise;
    const db = client.db("aishh");
    
    // Test the connection
    await db.command({ ping: 1 });
    console.log("Successfully connected to MongoDB.");

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

    return { db, client };
  } catch (error) {
    console.error("Error connecting to database:", error);
    throw new Error("Failed to connect to database");
  }
} 
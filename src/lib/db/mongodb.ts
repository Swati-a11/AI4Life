// Cached MongoDB client helper (server-side only)
// Lazily connects when MONGODB_URI is configured; safely falls back if missing.

let cachedClient: any = null;

export async function getMongoClient() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    return null;
  }

  if (cachedClient) {
    return cachedClient;
  }

  try {
    // Dynamic import to prevent client bundling
    const { MongoClient } = await import("mongodb");
    const client = new MongoClient(uri);
    await client.connect();
    cachedClient = client;
    return cachedClient;
  } catch (err) {
    console.warn("MongoDB connection failed, falling back to server state store:", err);
    return null;
  }
}

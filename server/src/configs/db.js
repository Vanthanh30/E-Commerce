import mongoose from "mongoose";

function getDatabaseName(uri) {
  try {
    const parsed = new URL(uri);
    return parsed.pathname.replace("/", "") || "crud";
  } catch {
    return "crud";
  }
}

function localFallbackUri(uri) {
  return `mongodb://127.0.0.1:27017/${getDatabaseName(uri)}`;
}

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("Missing MONGODB_URI in server/.env");
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    });
  } catch (error) {
    const isSrvDnsError = uri.startsWith("mongodb+srv://") && ["ENOTFOUND", "ENODATA"].includes(error.code);
    if (!isSrvDnsError) throw error;

    const fallbackUri = localFallbackUri(uri);
    console.warn(`MongoDB Atlas SRV không resolve được (${error.code}). Fallback sang local: ${fallbackUri}`);
    await mongoose.connect(fallbackUri, {
      serverSelectionTimeoutMS: 5000
    });
  }

  console.log(`MongoDB connected: ${mongoose.connection.name}`);
}

export function mongoHealth() {
  return {
    ok: mongoose.connection.readyState === 1,
    readyState: mongoose.connection.readyState,
    database: mongoose.connection.name || null
  };
}

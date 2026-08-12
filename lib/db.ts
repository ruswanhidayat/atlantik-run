import { neon } from "@neondatabase/serverless";

const databaseUrl =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL;

if (!databaseUrl) {
  throw new Error(
    "Database connection string tidak ditemukan. Pastikan DATABASE_URL atau POSTGRES_URL tersedia."
  );
}

export const sql = neon(databaseUrl);
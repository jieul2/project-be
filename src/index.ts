import "dotenv/config";
import { serve } from "@hono/node-server";
import app from "./app";
import { connectDB } from "./config/db";

const port = Number(process.env.PORT) || 8080;

connectDB().then(() => {
  console.log(`Server is running on port: ${port}`);
  serve({ fetch: app.fetch, port });
});

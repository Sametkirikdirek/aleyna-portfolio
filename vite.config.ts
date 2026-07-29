import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fetchMediumPosts } from "./lib/mediumFeed.js";

export default defineConfig({
  plugins: [
    react(),
    {
      name: "medium-api-dev",
      configureServer(server) {
        server.middlewares.use("/api/medium", async (_req, res) => {
          try {
            const posts = await fetchMediumPosts(8);
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ posts, source: "medium" }));
          } catch (error) {
            res.statusCode = 502;
            res.setHeader("Content-Type", "application/json");
            res.end(
              JSON.stringify({
                error: "Medium feed could not be loaded",
                message: error instanceof Error ? error.message : "Unknown error",
              })
            );
          }
        });
      },
    },
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});

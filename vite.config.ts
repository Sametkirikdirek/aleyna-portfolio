import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { fetchMediumPosts } from "./lib/mediumFeed.js";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      react(),
      {
        name: "api-dev-middleware",
        configureServer(server) {
          // 1. Medium Feed API Dev Proxy
          server.middlewares.use("/api/medium", async (_req, res) => {
            try {
              const posts = await fetchMediumPosts();
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

          // 2. Cloudinary Upload API Dev Proxy
          server.middlewares.use("/api/upload", async (req, res) => {
            if (req.method !== "POST") {
              res.statusCode = 405;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "Method not allowed" }));
              return;
            }

            try {
              const fullUrl = `http://${req.headers.host || "localhost"}${req.url}`;
              const webReq = new Request(fullUrl, {
                method: req.method,
                headers: req.headers as any,
                body: req as any,
                duplex: "half",
              });

              const formData = await webReq.formData();
              const file = formData.get("file");
              const folder = (formData.get("folder") as string) || "portfolio";

              if (!file) {
                res.statusCode = 400;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify({ error: "Yüklenecek dosya bulunamadı" }));
                return;
              }

              const cloudName =
                env.CLOUDINARY_CLOUD_NAME ||
                env.VITE_CLOUDINARY_CLOUD_NAME ||
                process.env.CLOUDINARY_CLOUD_NAME ||
                "REMOVED_CLOUD_NAME";
              const uploadPreset =
                env.CLOUDINARY_UPLOAD_PRESET ||
                env.VITE_CLOUDINARY_UPLOAD_PRESET ||
                process.env.CLOUDINARY_UPLOAD_PRESET ||
                "REMOVED_UPLOAD_PRESET";

              const uploadData = new FormData();
              uploadData.append("file", file);
              uploadData.append("upload_preset", uploadPreset);
              uploadData.append("folder", folder);

              const cloudinaryRes = await fetch(
                `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
                {
                  method: "POST",
                  body: uploadData,
                }
              );

              const result = await cloudinaryRes.json();
              res.statusCode = cloudinaryRes.status;
              res.setHeader("Content-Type", "application/json");
              res.end(
                JSON.stringify({
                  url: result.secure_url || result.url,
                  publicId: result.public_id,
                })
              );
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader("Content-Type", "application/json");
              res.end(
                JSON.stringify({
                  error: err?.message || "Sunucu yükleme hatası",
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
  };
});

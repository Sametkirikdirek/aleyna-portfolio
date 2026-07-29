import { fetchMediumPosts } from "../lib/mediumFeed.js";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputPath = join(__dirname, "../public/medium-posts.json");

const posts = await fetchMediumPosts();

writeFileSync(
  outputPath,
  JSON.stringify(
    {
      posts,
      source: "medium",
      syncedAt: new Date().toISOString(),
      profile: "https://medium.com/@aleynaaltunsu",
    },
    null,
    2
  ),
  "utf8"
);

console.log(`Medium: ${posts.length} yazi kaydedildi -> public/medium-posts.json`);

import { fetchMediumPosts } from "../lib/mediumFeed.js";

export const config = {
  runtime: "edge",
};

export default async function handler(_request) {
  try {
    const posts = await fetchMediumPosts();

    return Response.json(
      { posts, source: "medium", count: posts.length },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    return Response.json(
      {
        error: "Medium feed could not be loaded",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 502 }
    );
  }
}

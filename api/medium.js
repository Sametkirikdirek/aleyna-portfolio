import { fetchMediumPosts } from "../lib/mediumFeed.js";

export default async function handler(_request) {
  try {
    const posts = await fetchMediumPosts(8);

    return new Response(JSON.stringify({ posts, source: "medium" }), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Medium feed could not be loaded",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 502, headers: { "Content-Type": "application/json" } }
    );
  }
}

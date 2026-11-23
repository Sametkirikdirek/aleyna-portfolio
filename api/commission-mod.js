/**
 * SECURITY: Retired legacy Telegram one-click decision links.
 *
 * They previously used an easily predictable non-cryptographic token and a GET
 * request that mutated a commission. Old links are intentionally invalidated.
 * Review requests from the authenticated moderator dashboard instead.
 */
export const config = { runtime: "edge" };

export default async function handler() {
  return new Response(
    JSON.stringify({
      error: "Bu bağlantı güvenlik nedeniyle devre dışı. Talepleri yönetim panelinden inceleyin.",
      adminUrl: "/admin/dashboard",
    }),
    {
      status: 410,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    }
  );
}

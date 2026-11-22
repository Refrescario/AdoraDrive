import { createAPIFileRoute } from "@tanstack/react-start/api";

// Proxy reverso para assets do Lovable CDN (/__l5e/assets-v1/...)
// Os arquivos de mídia (imagens, áudios, vídeos) foram criados no Lovable
// e suas URLs apontam para /__l5e/. Este proxy repassa a requisição ao CDN
// original para que os assets funcionem enquanto não são migrados para Supabase Storage.

const LOVABLE_CDN = "https://gptengineer.app";

export const APIRoute = createAPIFileRoute("/api/assets/$")({
  GET: async ({ request, params }) => {
    const splat = (params as Record<string, string>)["_splat"] ?? "";
    const targetUrl = `${LOVABLE_CDN}/__l5e/assets-v1/${splat}`;

    try {
      const upstream = await fetch(targetUrl, {
        headers: {
          "User-Agent": "AdoraDrive/1.0",
          Referer: LOVABLE_CDN,
          Origin: LOVABLE_CDN,
        },
      });

      if (!upstream.ok) {
        return new Response("Asset not found", { status: 404 });
      }

      const contentType = upstream.headers.get("content-type") ?? "application/octet-stream";
      const body = await upstream.arrayBuffer();

      return new Response(body, {
        status: 200,
        headers: {
          "content-type": contentType,
          "cache-control": "public, max-age=31536000, immutable",
          "access-control-allow-origin": "*",
        },
      });
    } catch {
      return new Response("Proxy error", { status: 502 });
    }
  },
});

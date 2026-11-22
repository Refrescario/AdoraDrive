import { createAPIFileRoute } from '@tanstack/react-start/api';
import { supabaseAdmin } from '@/integrations/supabase/client.server';

export const APIRoute = createAPIFileRoute('/api/activate')({
  POST: async ({ request }) => {
    try {
      const body = await request.json() as unknown;
      if (typeof body !== 'object' || body === null || typeof (body as Record<string, unknown>).code !== 'string' || typeof (body as Record<string, unknown>).deviceId !== 'string') {
        return new Response(JSON.stringify({ error: 'Dados inválidos.' }), { status: 400, headers: { 'content-type': 'application/json', 'access-control-allow-origin': '*' } });
      }
      const { code, deviceId } = body as { code: string; deviceId: string };
      const normalizedCode = code.trim().toUpperCase();
      if (!normalizedCode || normalizedCode.length < 10 || normalizedCode.length > 50) {
        return new Response(JSON.stringify({ error: 'Código inválido.' }), { status: 400, headers: { 'content-type': 'application/json', 'access-control-allow-origin': '*' } });
      }
      const { data: row, error: fetchError } = await supabaseAdmin.from('activation_codes').select('id, code, used_at').eq('code', normalizedCode).single();
      if (fetchError || !row) {
        return new Response(JSON.stringify({ error: 'Código inválido ou não encontrado.' }), { status: 404, headers: { 'content-type': 'application/json', 'access-control-allow-origin': '*' } });
      }
      if (row.used_at) {
        return new Response(JSON.stringify({ error: 'Código já utilizado.' }), { status: 409, headers: { 'content-type': 'application/json', 'access-control-allow-origin': '*' } });
      }
      const { error: updateError } = await supabaseAdmin.from('activation_codes').update({ used_at: new Date().toISOString(), used_by_device: deviceId.trim().slice(0, 200) }).eq('id', row.id).is('used_at', null);
      if (updateError) {
        return new Response(JSON.stringify({ error: 'Não foi possível ativar. Tente novamente.' }), { status: 500, headers: { 'content-type': 'application/json', 'access-control-allow-origin': '*' } });
      }
      return new Response(JSON.stringify({ activated: true }), { status: 200, headers: { 'content-type': 'application/json', 'access-control-allow-origin': '*' } });
    } catch {
      return new Response(JSON.stringify({ error: 'Erro interno.' }), { status: 500, headers: { 'content-type': 'application/json', 'access-control-allow-origin': '*' } });
    }
  },
  OPTIONS: async () => new Response(null, { status: 204, headers: { 'access-control-allow-origin': '*', 'access-control-allow-methods': 'POST, OPTIONS', 'access-control-allow-headers': 'content-type' } }),
});
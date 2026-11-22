import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { supabaseAdmin } from '@/integrations/supabase/client.server';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function assertAdmin(claims: any) {
  // O JWT já contém app_metadata.role — sem necessidade de round-trip ao DB
  const role = claims?.app_metadata?.role;
  if (role !== 'admin') throw new Error('Conta não autorizada a emitir licenças.');
}

export const generateActivationCodes = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator(input => z.object({ quantity: z.number().int().min(1).max(500) }).parse(input))
  .handler(async ({ data, context }) => {
    assertAdmin(context.claims);

    const codes: string[] = [];
    for (let i = 0; i < data.quantity; i++) {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      const seg = () => Array.from(crypto.getRandomValues(new Uint8Array(4)), b => chars[b % chars.length]).join('');
      codes.push(`ADORA-${seg()}-${seg()}-${seg()}`);
    }

    const rows = codes.map(code => ({ code, created_by: context.userId }));
    const { error: insertError } = await supabaseAdmin.from('activation_codes').insert(rows);
    if (insertError) throw new Error('Não foi possível salvar os códigos.');

    return { codes };
  });

export const listActivationCodes = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    assertAdmin(context.claims);

    const { data, error: fetchError } = await supabaseAdmin
      .from('activation_codes')
      .select('id, code, used_at, used_by_device, created_at')
      .order('created_at', { ascending: false })
      .limit(200);

    if (fetchError) throw new Error('Não foi possível listar os códigos.');
    return { codes: data ?? [] };
  });

export const redeemActivationCode = createServerFn({ method: 'POST' })
  .inputValidator(input => z.object({
    code: z.string().trim().toUpperCase().min(10).max(50),
    deviceId: z.string().trim().min(1).max(200),
  }).parse(input))
  .handler(async ({ data }) => {
    const { data: ok, error } = await supabaseAdmin.rpc('consume_activation_code', {
      p_code: data.code,
      p_device_id: data.deviceId,
    });
    if (error) throw new Error('Não foi possível verificar o código.');
    if (!ok) throw new Error('Código inválido ou já utilizado.');
    return { activated: true };
  });

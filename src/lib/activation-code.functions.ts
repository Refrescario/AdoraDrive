import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { supabaseAdmin } from '@/integrations/supabase/client.server';

async function assertAdmin(userId: string) {
  // auth.admin não funciona com sb_secret_ keys — consulta direto via SQL
  const { data, error } = await supabaseAdmin.rpc('get_user_role', { _user_id: userId });
  if (error || data !== 'admin') throw new Error('Conta não autorizada a emitir licenças.');
}

// Gera N códigos de ativação únicos e os insere na tabela
export const generateActivationCodes = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator(input => z.object({ quantity: z.number().int().min(1).max(500) }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);

    const codes: string[] = [];
    for (let i = 0; i < data.quantity; i++) {
      // Formato: ADORA-XXXX-XXXX-XXXX (letras maiúsculas + números, sem ambíguos)
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      const seg = () => Array.from(crypto.getRandomValues(new Uint8Array(4)), b => chars[b % chars.length]).join('');
      codes.push(`ADORA-${seg()}-${seg()}-${seg()}`);
    }

    const rows = codes.map(code => ({ code, created_by: context.userId }));
    const { error: insertError } = await supabaseAdmin.from('activation_codes').insert(rows);
    if (insertError) throw new Error('Não foi possível salvar os códigos.');

    return { codes };
  });

// Lista códigos gerados (para painel admin)
export const listActivationCodes = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);

    const { data, error: fetchError } = await supabaseAdmin
      .from('activation_codes')
      .select('id, code, used_at, used_by_device, created_at')
      .order('created_at', { ascending: false })
      .limit(200);

    if (fetchError) throw new Error('Não foi possível listar os códigos.');
    return { codes: data ?? [] };
  });

// Consome um código de ativação (chamado pelo APK/web na ativação)
// Não requer autenticação — qualquer pessoa com o código pode ativar
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

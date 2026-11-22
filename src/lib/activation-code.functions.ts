import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { requireIssuerRole } from './license-permissions';
import { supabaseAdmin } from '@/integrations/supabase/client.server';

// Gera N códigos de ativação únicos e os insere na tabela
export const generateActivationCodes = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator(input => z.object({ quantity: z.number().int().min(1).max(500) }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: admin, error } = await context.supabase.rpc('has_role', { _user_id: context.userId, _role: 'admin' });
    requireIssuerRole({ data: admin, error });

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
    const { data: admin, error } = await context.supabase.rpc('has_role', { _user_id: context.userId, _role: 'admin' });
    requireIssuerRole({ data: admin, error });

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

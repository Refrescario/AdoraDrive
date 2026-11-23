import { createFileRoute } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { useEffect, useState } from 'react';
import { LockKeyhole, KeyRound, Copy, Download, LoaderCircle, LogOut, RefreshCw, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ProductScreen } from '@/components/ProductScreen';
import { ScannerAccount } from '@/components/ScannerAccount';
import { Button } from '@/components/ui/button';
import { generateActivationCodes, listActivationCodes } from '@/lib/activation-code.functions';

export const Route = createFileRoute('/licencas')({
  head: () => ({ meta: [
    { title: 'AdoraDrive — Emissão de licenças' },
    { name: 'description', content: 'Área restrita para emitir licenças AdoraDrive.' },
    { name: 'robots', content: 'noindex, nofollow' },
  ] }), component: LicenseIssuer,
});

type CodeRow = { id: string; code: string; used_at: string | null; used_by_device: string | null; created_at: string };

function downloadCodes(codes: string[]) {
  const content = codes.join('\n');
  const url = URL.createObjectURL(new Blob([content], { type: 'text/plain' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `codigos-adoradrive-${new Date().toISOString().slice(0, 10)}.txt`;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function LicenseIssuer() {
  const generateFn = useServerFn(generateActivationCodes);
  const listFn = useServerFn(listActivationCodes);

  const [userId, setUserId] = useState<string | null>(null);
  const [admin, setAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  const [rows, setRows] = useState<CodeRow[]>([]);
  const [quantity, setQuantity] = useState(10);
  const [busy, setBusy] = useState(false);
  const [newCodes, setNewCodes] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    let alive = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (alive) { setUserId(data.session?.user.id ?? null); if (!data.session) setChecking(false); }
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user.id ?? null);
      setAdmin(false); setRows([]); setNewCodes([]);
      if (!session) setChecking(false);
    });
    return () => { alive = false; data.subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (!userId) return;
    let alive = true;
    setChecking(true);
    void listFn().then(result => {
      if (alive) { setAdmin(true); setRows(result.codes); }
    }).catch(() => {
      if (alive) { setAdmin(false); setMessage('Conta não autorizada ou erro de conexão.'); }
    }).finally(() => { if (alive) setChecking(false); });
    return () => { alive = false; };
  }, [userId, revision, listFn]);

  const handleGenerate = async () => {
    setBusy(true); setMessage(''); setNewCodes([]);
    try {
      const result = await generateFn({ data: { quantity } });
      setNewCodes(result.codes);
      setMessage(`${result.codes.length} código(s) gerado(s) com sucesso.`);
      setRevision(v => v + 1);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Não foi possível gerar os códigos.');
    } finally {
      setBusy(false);
    }
  };

  const copy = async (value: string) => {
    try { await navigator.clipboard.writeText(value); setMessage('Copiado.'); }
    catch { setMessage('Não foi possível copiar.'); }
  };

  const used = rows.filter(r => r.used_at).length;
  const free = rows.filter(r => !r.used_at).length;

  return <ProductScreen><div className="mx-auto max-w-3xl">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <LockKeyhole className="mb-4 size-9 text-primary" />
        <h1 className="font-display text-2xl sm:text-3xl">Emissão de licenças</h1>
        <p className="mt-3 text-muted-foreground">AdoraDrive · Acesso restrito</p>
      </div>
      {userId && <Button variant="outline" onClick={async () => { await supabase.auth.signOut(); }}>
        <LogOut />Sair
      </Button>}
    </div>

    <div className="my-7 border-y py-5">
      {checking
        ? <p className="flex items-center gap-2"><LoaderCircle className="animate-spin" />Conferindo acesso…</p>
        : !userId ? <ScannerAccount purpose="licenses" />
        : !admin ? <p className="text-chart-4">Sua conta ainda não está autorizada a emitir licenças.</p>
        : <p className="flex items-center gap-2 text-primary"><KeyRound />Conta autorizada · {free} disponíveis · {used} usados</p>
      }
      {userId && !admin && !checking && <Button variant="outline" className="mt-4" onClick={() => setRevision(v => v + 1)}><RefreshCw />Conferir acesso</Button>}
    </div>

    {admin && <>
      {/* Gerador em lote */}
      <section className="grid gap-4">
        <h2 className="font-bold">Gerar novos códigos</h2>
        <div className="flex items-center gap-3">
          <label htmlFor="qty" className="text-sm text-muted-foreground">Quantidade:</label>
          <input
            id="qty"
            type="number"
            min={1} max={500}
            value={quantity}
            onChange={e => setQuantity(Math.max(1, Math.min(500, Number(e.target.value))))}
            className="w-24 rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          <Button onClick={handleGenerate} disabled={busy}>
            {busy ? <LoaderCircle className="animate-spin" /> : <Plus />}
            Gerar {quantity} código{quantity !== 1 ? 's' : ''}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">Cada código é de uso único. Formato: ADORA-XXXX-XXXX-XXXX. Envie por WhatsApp ou e-mail ao cliente.</p>
      </section>

      {/* Códigos recém gerados */}
      {newCodes.length > 0 && <section className="mt-7 border-y py-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-bold">{newCodes.length} código{newCodes.length !== 1 ? 's' : ''} prontos para enviar</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => void copy(newCodes.join('\n'))}><Copy />Copiar todos</Button>
            <Button size="sm" onClick={() => downloadCodes(newCodes)}><Download />Baixar .txt</Button>
          </div>
        </div>
        <ul className="mt-4 grid gap-2">
          {newCodes.map(code => (
            <li key={code} className="flex items-center justify-between gap-3 rounded-md border px-3 py-2">
              <span className="font-mono text-sm text-primary">{code}</span>
              <Button size="icon" variant="ghost" onClick={() => void copy(code)}><Copy className="size-4" /></Button>
            </li>
          ))}
        </ul>
      </section>}

      {/* Histórico */}
      <section className="mt-8">
        <h2 className="font-display text-lg">Todos os códigos</h2>
        {!rows.length
          ? <p className="mt-4 text-muted-foreground">Nenhum código gerado ainda.</p>
          : <ul className="mt-4 divide-y">
            {rows.map(row => (
              <li key={row.id} className="py-3">
                <div className="flex items-center justify-between gap-3">
                  <span className={`font-mono text-sm ${row.used_at ? 'text-muted-foreground line-through' : 'text-primary'}`}>{row.code}</span>
                  {!row.used_at && <Button size="icon" variant="ghost" onClick={() => void copy(row.code)}><Copy className="size-4" /></Button>}
                </div>
                {row.used_at && <p className="mt-1 text-xs text-muted-foreground">Usado em {new Date(row.used_at).toLocaleString('pt-BR')}</p>}
              </li>
            ))}
          </ul>
        }
      </section>

      <p role="status" aria-live="polite" className="mt-5 text-sm text-chart-4">{message}</p>
    </>}
  </div></ProductScreen>;
}

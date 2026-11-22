import { createFileRoute, Link } from '@tanstack/react-router';
import { useRef, useState } from 'react';
import { KeyRound, ShieldCheck, CircleAlert, ShoppingBag, Upload, LoaderCircle, LockKeyhole } from 'lucide-react';
import { ProductScreen } from '@/components/ProductScreen';
import { Button } from '@/components/ui/button';
import { useActivationLicense } from '@/hooks/use-activation-license';

export const Route = createFileRoute('/ativacao')({
  head: () => ({ meta: [
    { title: 'AdoraDrive — Ativação' },
    { name: 'description', content: 'Ative o AdoraDrive com seu código de licença.' },
    { property: 'og:title', content: 'AdoraDrive — Ativação' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary' },
  ] }), component: Activation,
});

function Activation() {
  const [busy, setBusy] = useState(false);
  const [inputCode, setInputCode] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);
  const { activated, activatedAt, ready, message, setMessage, activate } = useActivationLicense();

  async function handleActivate() {
    const trimmed = inputCode.replace(/\s+/g, '').trim();
    if (!trimmed) return;
    setBusy(true);
    setMessage('');
    try {
      await activate(trimmed);
      setInputCode('');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Não foi possível validar o código.');
    } finally {
      setBusy(false);
    }
  }

  return <ProductScreen><div className="mx-auto max-w-xl">
    <KeyRound className="mb-5 size-10 text-primary" />
    <h1 className="font-display text-2xl sm:text-3xl">Ativar AdoraDrive</h1>
    <div className="mt-5 flex items-center gap-2 text-primary">
      <ShieldCheck className="size-5 shrink-0" />
      <span>{activated ? 'Licença ativa' : 'Nenhuma licença verificada'}</span>
    </div>

    {ready && !activated && <section className="mt-7 border-y py-5">
      <h2 className="mb-3 font-bold">Como ativar</h2>
      <ol className="grid gap-3 text-sm text-muted-foreground">
        <li className="flex gap-2"><span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">1</span><span>Receba o código no formato <strong className="text-foreground font-mono">ADORA-XXXX-XXXX-XXXX</strong> de quem vendeu sua licença.</span></li>
        <li className="flex gap-2"><span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">2</span><span>Cole o código no campo abaixo e toque em <strong className="text-foreground">Ativar</strong>.</span></li>
        <li className="flex gap-2"><span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">3</span><span>Pronto. O aplicativo funciona <strong className="text-foreground">sem internet</strong> depois da ativação.</span></li>
      </ol>
    </section>}

    {!activated && <div className="mt-7 grid gap-4">
      <label htmlFor="activation-code" className="font-bold">Código de ativação</label>
      <div
        id="activation-code"
        contentEditable
        suppressContentEditableWarning
        data-placeholder="ADORA-XXXX-XXXX-XXXX"
        onInput={e => {
          const el = e.currentTarget;
          setInputCode((el.innerText || '').replace(/\s+/g, ''));
        }}
        className="min-h-16 w-full break-all rounded-md border border-input bg-background p-3 font-mono text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground"
        style={{ WebkitUserSelect: 'text', userSelect: 'text', WebkitUserModify: 'read-write-plaintext-only' } as React.CSSProperties}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <Button
          type="button"
          disabled={!ready || busy || !inputCode.trim()}
          className="min-h-12"
          onClick={handleActivate}
        >
          {busy ? <LoaderCircle className="animate-spin" /> : <KeyRound />}
          Ativar
        </Button>
        <Button type="button" variant="outline" className="min-h-12" onClick={() => fileInput.current?.click()}>
          <Upload />Importar arquivo
        </Button>
      </div>
      <input ref={fileInput} type="file" accept=".adora,.txt,text/plain" className="hidden" aria-label="Arquivo de licença" onChange={async event => {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file) return;
        if (file.size > 4096) { setMessage('Arquivo muito grande.'); return; }
        try {
          const text = (await file.text()).replace(/\s+/g, '').trim();
          setInputCode(text);
          setMessage('Código carregado. Toque em Ativar para confirmar.');
        } catch { setMessage('Não foi possível ler o arquivo.'); }
      }} />
      <p role="status" aria-live="polite" className="min-h-6 break-words text-sm text-chart-4">{message}</p>
    </div>}

    {activated && <>
      <p role="status" aria-live="polite" className="mt-5 break-words text-sm text-primary">{message}</p>
      <Button asChild className="mt-5 min-h-12 w-full"><Link to="/">Abrir AdoraDrive</Link></Button>
      {activatedAt && <p className="mt-3 text-sm text-muted-foreground">Ativada em {new Date(activatedAt).toLocaleDateString('pt-BR')} · Sem prazo de expiração · Funciona offline.</p>}
    </>}

    <div className="mt-7 flex items-start gap-3 border-y py-5 text-muted-foreground">
      <CircleAlert className="mt-1 size-5 shrink-0 text-chart-4" />
      <p className="text-sm">Cada código de ativação é de uso único. Após ativar, o aplicativo funciona sem internet neste dispositivo.</p>
    </div>
    <Button asChild variant="outline" className="mt-6 min-h-11"><Link to="/loja"><ShoppingBag />Ver temas gratuitos</Link></Button>
    <Button asChild variant="ghost" className="mt-3 min-h-11"><Link to="/licencas"><LockKeyhole />Área de emissão</Link></Button>
  </div></ProductScreen>;
}

import { createFileRoute, Link } from '@tanstack/react-router';
import { useRef, useState } from 'react';
import { KeyRound, ShieldCheck, CircleAlert, ShoppingBag, Copy, Upload, LoaderCircle, LockKeyhole, Wifi } from 'lucide-react';
import { ProductScreen } from '@/components/ProductScreen';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useDeviceLicense } from '@/hooks/use-device-license';

export const Route = createFileRoute('/ativacao')({
  head: () => ({ meta: [
    { title: 'AdoraDrive — Ativação por licença' },
    { name: 'description', content: 'Ative a licença do AdoraDrive por assinatura vinculada à instalação, com validação offline.' },
    { property: 'og:title', content: 'AdoraDrive — Ativação por licença' },
    { property: 'og:description', content: 'Sua licença e seus temas no AdoraDrive.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ] }), component: Activation,
});

function Activation() {
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const { deviceId, license, ready, needsOnlineSetup, message, setMessage, activate } = useDeviceLicense();
  return <ProductScreen><div className="mx-auto max-w-xl">
    <KeyRound className="mb-5 size-10 text-primary" />
    <h1 className="font-display text-2xl sm:text-3xl">Ativar AdoraDrive</h1>
    <div className="mt-5 flex items-center gap-2 text-primary"><ShieldCheck className="size-5 shrink-0" /><span>{license ? 'Licença do aplicativo ativa' : 'Nenhuma licença verificada'}</span></div>

    {/* One-time online setup notice — shown only on the very first visit before any keys are cached */}
    {ready && needsOnlineSetup && <div className="mt-5 flex items-start gap-3 rounded-lg border border-chart-4/40 bg-chart-4/8 p-4 text-sm">
      <Wifi className="mt-0.5 size-5 shrink-0 text-chart-4" />
      <div className="grid gap-1">
        <p className="font-semibold text-chart-4">Conexão necessária nesta primeira visita</p>
        <p className="text-muted-foreground">Esta central ainda não baixou o verificador de licenças. Conecte à internet uma vez para preparar a ativação. Depois disso, o AdoraDrive funciona sem internet.</p>
      </div>
    </div>}

    {/* Step-by-step guide shown before activation */}
    {ready && !license && <section className="mt-7 border-y py-5">
      <h2 className="mb-3 font-bold">Como ativar em 3 passos</h2>
      <ol className="grid gap-3 text-sm text-muted-foreground">
        <li className="flex gap-2"><span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">1</span><span>Copie o <strong className="text-foreground">ID desta instalação</strong> abaixo e envie para quem emitiu sua licença.</span></li>
        <li className="flex gap-2"><span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">2</span><span>Receba a chave por WhatsApp ou e-mail e cole no campo <strong className="text-foreground">Código da licença</strong>.</span></li>
        <li className="flex gap-2"><span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">3</span><span>Clique em <strong className="text-foreground">Ativar licença</strong>. Após isso, o aplicativo abre sem precisar de internet.</span></li>
      </ol>
    </section>}

    <section className="mt-7 border-y py-5">
      <h2 className="font-bold">ID desta instalação</h2>
      <p className="mt-2 break-all font-mono text-sm text-primary">{deviceId || (ready ? 'Identificação indisponível' : 'Preparando identificação…')}</p>
      <Button variant="outline" disabled={!deviceId} className="mt-3" onClick={async () => { try { await navigator.clipboard.writeText(deviceId); setMessage('ID copiado.'); } catch { setMessage('Não foi possível copiar. Selecione o ID e copie manualmente.'); } }}><Copy />Copiar ID</Button>
      <p className="mt-3 text-sm text-muted-foreground">Este ID identifica esta central. Envie-o para receber sua chave. <strong>Limpar os dados do navegador ou reinstalar gera um ID diferente</strong>, e será necessário pedir uma nova licença.</p>
    </section>
    <form className="mt-7 grid gap-4" onSubmit={async event => {
      event.preventDefault();
      setBusy(true); setMessage('');
      try { await activate(code); setCode(''); }
      catch (error) { setMessage(error instanceof Error ? error.message : 'Não foi possível validar a licença.'); }
      finally { setBusy(false); }
    }}>
      <label htmlFor="license-code" className="font-bold">Código da licença</label>
      <Textarea id="license-code" name="license-code" placeholder="Cole a chave completa recebida na compra" autoComplete="off" spellCheck={false} required maxLength={4096} value={code} onChange={event => { setCode(event.target.value); setMessage(''); }} className="min-h-28 break-all font-mono text-sm" />
      <div className="grid gap-3 sm:grid-cols-2">
        <Button type="submit" disabled={!ready || !deviceId || needsOnlineSetup || !code.trim() || busy} className="min-h-12">{busy ? <LoaderCircle className="animate-spin" /> : <KeyRound />}Ativar licença</Button>
        <Button type="button" variant="outline" className="min-h-12" onClick={() => fileInput.current?.click()}><Upload />Importar arquivo .adora</Button>
      </div>
      <input ref={fileInput} type="file" accept=".adora,.txt,text/plain" className="hidden" aria-label="Arquivo de licença" onChange={async event => {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file) return;
        if (file.size > 4096) { setMessage('Arquivo muito grande. Selecione apenas a licença recebida.'); return; }
        try { setCode((await file.text()).trim()); setMessage('Licença carregada. Toque em Ativar licença para conferir.'); }
        catch { setMessage('Não foi possível ler o arquivo.'); }
      }} />
      <p role="status" aria-live="polite" className="min-h-6 break-words text-sm text-chart-4">{message}</p>
    </form>
    {license && <Button asChild className="mt-3 min-h-12 w-full"><Link to="/">Abrir AdoraDrive</Link></Button>}
    {license && <p className="mt-3 text-sm text-muted-foreground">Emitida em {new Date(license.issuedAt).toLocaleDateString('pt-BR')} · Sem prazo de expiração · Funciona offline.</p>}
    <div className="mt-5 flex items-start gap-3 border-y py-5 text-muted-foreground"><CircleAlert className="mt-1 size-5 shrink-0 text-chart-4" /><div className="grid gap-3">
      <p>A licença está vinculada a esta instalação do navegador. Todos os temas, estáticos e animados, são gratuitos e incluídos na licença, sem mensalidade ou prazo de expiração.</p>
    </div></div>
    <Button asChild variant="outline" className="mt-6 min-h-11"><Link to="/loja"><ShoppingBag />Ver temas gratuitos</Link></Button>
    <Button asChild variant="ghost" className="mt-3 min-h-11"><Link to="/licencas"><LockKeyhole />Área de emissão</Link></Button>
  </div></ProductScreen>;
}
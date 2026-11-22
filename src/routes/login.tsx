import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Mail, LoaderCircle, LogIn, ChevronLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "AdoraDrive — Entrar" },
      { name: "description", content: "Entre na sua conta AdoraDrive para gerenciar licenças e histórico." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup" | "reset">("login");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  // Se já logado, redireciona para licencas
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/licencas" });
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) navigate({ to: "/licencas" });
    });
    return () => data.subscription.unsubscribe();
  }, [navigate]);

  const signInWithGoogle = async () => {
    setPending(true);
    setMessage("");
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin + "/auth/callback" },
      });
      if (error) setMessage("Não foi possível entrar com Google. Tente novamente.");
    } catch {
      setMessage("Sem conexão. Tente novamente.");
    } finally {
      setPending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPending(true);
    setMessage("");
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email"));
    const password = String(form.get("password") ?? "");
    try {
      if (mode === "reset") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + "/scanner-reset",
        });
        setMessage(error ? "Não foi possível enviar o email. Tente novamente." : "Confira seu email para recuperar a senha.");
      } else if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/auth/callback" },
        });
        if (error) setMessage("Não foi possível criar a conta. Confira os dados e tente novamente.");
        else if (data.session) navigate({ to: "/licencas" });
        else setMessage("Confira seu email e confirme a conta antes de entrar.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) setMessage("Email ou senha inválidos, ou email ainda não confirmado.");
        else navigate({ to: "/licencas" });
      }
    } catch {
      setMessage("Sem conexão. Tente novamente.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="adora-theme min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <h1 className="font-display text-4xl font-extrabold">
            Adora<span className="text-primary">Drive</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground tracking-widest">FÉ EM CADA TRAJETO</p>
        </div>

        {/* Card */}
        <div className="glass rounded-xl p-6 sm:p-8 shadow-lg">
          <h2 className="mb-6 text-xl font-bold">
            {mode === "signup" ? "Criar conta" : mode === "reset" ? "Recuperar senha" : "Entrar"}
          </h2>

          {/* Google */}
          {mode !== "reset" && (
            <Button
              disabled={pending}
              variant="outline"
              className="mb-4 w-full h-12"
              onClick={signInWithGoogle}
            >
              {pending ? (
                <LoaderCircle className="animate-spin" size={18} />
              ) : (
                <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18">
                  <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/>
                </svg>
              )}
              Continuar com Google
            </Button>
          )}

          {mode !== "reset" && (
            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
              <div className="relative flex justify-center text-xs"><span className="bg-card px-2 text-muted-foreground">ou continue com email</span></div>
            </div>
          )}

          {/* Email/senha form */}
          <form className="grid gap-3" onSubmit={handleSubmit}>
            <label className="grid gap-1 text-sm">
              Email
              <Input name="email" type="email" autoComplete="email" required />
            </label>
            {mode !== "reset" && (
              <label className="grid gap-1 text-sm">
                Senha
                <Input
                  name="password"
                  type="password"
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  minLength={8}
                  required
                />
              </label>
            )}
            <Button disabled={pending} type="submit" className="h-12 mt-1">
              {pending ? <LoaderCircle className="animate-spin" /> : <Mail size={16} />}
              {mode === "signup" ? "Criar conta" : mode === "reset" ? "Enviar email de recuperação" : "Entrar com email"}
            </Button>
          </form>

          {message && (
            <p role="status" className="mt-3 text-sm text-chart-4">{message}</p>
          )}

          {/* Alternar modo */}
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setMode(mode === "signup" ? "login" : "signup"); setMessage(""); }}
            >
              {mode === "signup" ? "Já tenho conta" : "Criar conta"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setMode(mode === "reset" ? "login" : "reset"); setMessage(""); }}
            >
              {mode === "reset" ? "← Voltar" : "Esqueci a senha"}
            </Button>
          </div>
        </div>

        {/* Voltar */}
        <div className="mt-6 text-center">
          <Link to="/loja" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ChevronLeft size={16} />Voltar à loja
          </Link>
        </div>
      </div>
    </div>
  );
}

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { LoaderCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth/callback")({
  component: AuthCallback,
});

function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase processa o hash/token automaticamente ao chamar getSession
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        navigate({ to: "/licencas" });
      } else {
        // Aguarda um tick para o Supabase processar o token da URL
        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
          if (session) {
            listener.subscription.unsubscribe();
            navigate({ to: "/licencas" });
          }
        });
        // Timeout de segurança
        setTimeout(() => {
          navigate({ to: "/login" });
        }, 5000);
      }
    });
  }, [navigate]);

  return (
    <div className="adora-theme min-h-screen bg-background text-foreground flex flex-col items-center justify-center gap-4">
      <LoaderCircle className="animate-spin text-primary" size={40} />
      <p className="text-muted-foreground">Finalizando login…</p>
    </div>
  );
}

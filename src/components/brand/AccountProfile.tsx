import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AccountProfile({ userId }: { userId: string }) {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  useEffect(() => {
    let active = true;
    void supabase.from("profiles").select("display_name").eq("id", userId).single().then(({ data, error }) => {
      if (!active) return;
      if (error) setMessage("Não foi possível carregar seu perfil.");
      else setName(data.display_name);
    });
    return () => { active = false; };
  }, [userId]);
  return (
    <form className="mt-5 space-y-3" onSubmit={async (event) => {
      event.preventDefault();
      setBusy(true);
      setMessage("");
      try {
        const { data, error } = await supabase.from("profiles").update({ display_name: name.trim() }).eq("id", userId).select("display_name").single();
        if (error || !data) throw error;
        setName(data.display_name);
        setMessage("Perfil atualizado.");
      } catch { setMessage("Não foi possível salvar seu perfil. Tente novamente."); }
      finally { setBusy(false); }
    }}>
      <Label htmlFor="profile-name">Seu nome</Label>
      <Input id="profile-name" value={name} onChange={(event) => setName(event.target.value)} minLength={2} maxLength={100} required disabled={busy} />
      <div className="flex gap-2">
        <Button type="submit" disabled={busy || !name.trim()}>{busy ? "Salvando…" : "Salvar perfil"}</Button>
        <Button type="button" variant="outline" disabled={busy} onClick={async () => {
          await queryClient.cancelQueries();
          queryClient.clear();
          await supabase.auth.signOut();
          await navigate({ to: "/login", replace: true });
        }}>Sair</Button>
      </div>
      {message && <p role="status" className="text-sm text-muted-foreground">{message}</p>}
    </form>
  );
}
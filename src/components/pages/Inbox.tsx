import { useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import { ArrowLeft, Check, CheckCheck, Search, Send, UserRound } from "lucide-react";
import { useCrm } from "@/lib/crm/context";
import { fmtDate, fmtTime } from "@/lib/crm/metrics";
import { stageLabel } from "@/lib/crm/types";
import { OriginBadge } from "@/components/crm/OriginBadge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Inbox({
  selected,
  onSelect,
}: {
  selected?: string | undefined;
  onSelect: (id?: string) => void;
}) {
  const { state, sendMessage, markRead, openLead, mode } = useCrm();
  const [q, setQ] = useState("");
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const list = useMemo(() => {
    const convIds = new Set(state.conversations.map((c) => c.leadId));
    const extra =
      selected && !convIds.has(selected) ? [{ leadId: selected, messages: [], unread: 0 }] : [];
    return [...state.conversations, ...extra]
      .map((c) => ({ c, l: state.leads.find((l) => l.id === c.leadId)! }))
      .filter(
        ({ l }) => l && (l.name + l.company + l.phone).toLowerCase().includes(q.toLowerCase()),
      )
      .sort((a, b) =>
        (b.c.messages.at(-1)?.at ?? b.l.createdAt).localeCompare(
          a.c.messages.at(-1)?.at ?? a.l.createdAt,
        ),
      );
  }, [state, q, selected]);

  const cur = list.find((x) => x.l.id === selected);
  useEffect(() => {
    if (selected) markRead(selected);
  }, [selected, cur?.c.messages.length, markRead]);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [cur?.c.messages.length, selected]);

  const select = onSelect;

  return (
    <div className="-m-4 flex h-[calc(100vh-9rem)] overflow-hidden border-border md:-m-6 lg:-m-8 lg:h-[calc(100vh-2rem)]">
      <aside
        className={cn(
          "flex w-full flex-col border-r border-border md:w-80",
          cur && "hidden md:flex",
        )}
      >
        <div className="border-b border-border p-3">
          <h1 className="mb-2 font-display text-lg font-bold">LeadTrace Inbox</h1>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              aria-label="Buscar conversas"
              className="pl-8"
              placeholder="Buscar nome, empresa, telefone"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </div>
        <ul className="flex-1 overflow-y-auto">
          {list.map(({ c, l }) => {
            const last = c.messages.at(-1);
            return (
              <li key={l.id}>
                <button
                  onClick={() => select(l.id)}
                  className={cn(
                    "flex w-full gap-3 border-b border-border/50 p-3 text-left hover:bg-accent",
                    selected === l.id && "bg-accent",
                  )}
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-surface text-sm font-semibold">
                    {l.name[0]}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span
                        className={cn("truncate text-sm", c.unread ? "font-bold" : "font-medium")}
                      >
                        {l.name}
                      </span>
                      <span className="shrink-0 text-[10px] text-muted-foreground">
                        {last ? fmtDate(last.at) : "novo"}
                      </span>
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {last ? (last.dir === "out" ? "Você: " : "") + last.text : "Sem mensagens"}
                    </span>
                    <span className="mt-1 flex items-center justify-between gap-2">
                      <OriginBadge source={l.source} />
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        {l.owner.split(" ")[0]}
                        {c.unread > 0 && (
                          <span className="rounded-full bg-primary px-1.5 font-bold text-primary-foreground">
                            {c.unread}
                          </span>
                        )}
                      </span>
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      {cur ? (
        <section className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center gap-3 border-b border-border p-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label="Voltar"
              onClick={() => select(undefined)}
            >
              <ArrowLeft />
            </Button>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{cur.l.name}</p>
              <p className="text-xs text-muted-foreground">
                {cur.l.phone} · {cur.l.company}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="xl:hidden"
              onClick={() => openLead(cur.l.id)}
            >
              <UserRound /> Perfil
            </Button>
          </header>
          <div className="flex-1 space-y-2 overflow-y-auto bg-deep p-4" aria-live="polite">
            {cur.c.messages.length === 0 && (
              <p className="text-center text-sm text-muted-foreground">
                Nenhuma mensagem ainda. Inicie a conversa.
              </p>
            )}
            {cur.c.messages.map((m) => (
              <div
                key={m.id}
                className={cn("flex", m.dir === "out" ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-3 py-2 text-sm",
                    m.dir === "out"
                      ? "rounded-br-sm bg-primary text-primary-foreground"
                      : "rounded-bl-sm bg-card",
                  )}
                >
                  <p className="whitespace-pre-wrap break-words">{m.text}</p>
                  <span className="mt-1 flex items-center justify-end gap-1 text-[10px] opacity-70">
                    {fmtTime(m.at)}
                    {m.dir === "out" &&
                      (m.status === "failed" ? (
                        <span>Falha no envio</span>
                      ) : m.status === "sent" ? (
                        <Check className="size-3" />
                      ) : (
                        <CheckCheck
                          className={cn("size-3", m.status === "read" && "text-electric")}
                        />
                      ))}
                  </span>
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>
          <form
            className="flex gap-2 border-t border-border p-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (!text.trim()) return;
              sendMessage(cur.l.id, text.trim());
              setText("");
            }}
          >
            <Input
              aria-label="Mensagem"
              disabled={mode === "live"}
              placeholder={
                mode === "demo"
                  ? "Escreva uma mensagem (simulada)…"
                  : "WhatsApp ainda não configurado"
              }
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <Button type="submit" aria-label="Enviar" disabled={mode === "live"}>
              <Send />
            </Button>
          </form>
          <p className="px-3 pb-2 text-[10px] text-muted-foreground">
            {mode === "demo"
              ? "Modo demonstração — nenhuma mensagem será enviada pelo WhatsApp."
              : "Integração oficial pendente — envio de mensagens indisponível."}
          </p>
        </section>
      ) : (
        <div className="hidden flex-1 items-center justify-center text-sm text-muted-foreground md:flex">
          Selecione uma conversa
        </div>
      )}

      {cur && (
        <aside className="hidden w-72 shrink-0 space-y-4 overflow-y-auto border-l border-border p-4 xl:block">
          <div>
            <p className="font-display text-lg font-bold">{cur.l.name}</p>
            <p className="text-xs text-muted-foreground">
              {cur.l.role} · {cur.l.company}
            </p>
          </div>
          <dl className="space-y-2 text-sm">
            <div>
              <dt className="text-xs text-muted-foreground">Telefone</dt>
              <dd>{cur.l.phone}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Origem</dt>
              <dd>
                <OriginBadge source={cur.l.source} />
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Campanha</dt>
              <dd>{cur.l.attribution.campaign ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Pipeline</dt>
              <dd>{stageLabel(cur.l.stage)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Responsável</dt>
              <dd>{cur.l.owner}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Tags</dt>
              <dd className="flex flex-wrap gap-1">
                {cur.l.tags.map((t) => (
                  <span key={t} className="rounded-full bg-muted px-2 text-[11px]">
                    {t}
                  </span>
                ))}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Observações</dt>
              <dd className="text-xs">{cur.l.notes}</dd>
            </div>
          </dl>
          <div>
            <p className="mb-1 text-xs text-muted-foreground">Atividades</p>
            <ul className="space-y-1">
              {state.activities
                .filter((a) => a.leadId === cur.l.id)
                .slice(0, 6)
                .map((a) => (
                  <li key={a.id} className="text-xs">
                    {a.text} <span className="text-muted-foreground">· {fmtDate(a.at)}</span>
                  </li>
                ))}
            </ul>
          </div>
          <Button
            variant="secondary"
            size="sm"
            className="w-full"
            onClick={() => openLead(cur.l.id)}
          >
            Abrir lead completo
          </Button>
        </aside>
      )}
    </div>
  );
}

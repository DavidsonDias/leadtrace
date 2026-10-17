import { useMemo, useState } from "react";
import { Download, Plus, Search } from "lucide-react";
import { useCrm } from "@/lib/crm/context";
import { brl, filterLeads, fmtDate, type LeadFilter } from "@/lib/crm/metrics";
import {
  OWNERS,
  SERVICES,
  SOURCES,
  SOURCE_KEYS,
  stageLabel,
  type Lead,
  type SourceKey,
} from "@/lib/crm/types";
import { OriginBadge } from "@/components/crm/OriginBadge";
import { PageHeader, EmptyState } from "@/components/crm/PageHeader";
import { FilterBar } from "@/components/crm/FilterBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCrmFeedback } from "@/lib/crm/feedback";
import { z } from "zod";

const PAGE = 12;
const sel = "h-9 w-full rounded-md border border-input bg-background px-2 text-sm";
type SortKey = "createdAt" | "lastInteraction" | "name" | "value";

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  company: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(8).max(25),
  email: z.string().trim().email().max(255).or(z.literal("")),
});

export function Leads() {
  const toast = useCrmFeedback();
  const { state, openLead, addLead } = useCrm();
  const [f, setF] = useState<LeadFilter>({ period: "all", owner: "all", source: "all" });
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortKey>("createdAt");
  const [page, setPage] = useState(0);
  const [open, setOpen] = useState(false);

  const rows = useMemo(() => {
    const r = filterLeads(state.leads, f).filter((l) =>
      (l.name + l.company + l.phone + l.email).toLowerCase().includes(q.toLowerCase()),
    );
    return r.sort((a, b) =>
      sort === "name"
        ? a.name.localeCompare(b.name)
        : sort === "value"
          ? (b.value ?? 0) - (a.value ?? 0)
          : b[sort].localeCompare(a[sort]),
    );
  }, [state.leads, f, q, sort]);
  const pages = Math.max(1, Math.ceil(rows.length / PAGE));
  const view = rows.slice(page * PAGE, page * PAGE + PAGE);

  const exportCsv = () => {
    const head = [
      "Nome",
      "Empresa",
      "Telefone",
      "E-mail",
      "Origem",
      "Etapa",
      "Responsável",
      "Valor",
      "Entrada",
      "Último contato",
    ];
    const esc = (v: unknown) =>
      `"${String(v ?? "")
        .replace(/^[=+@\-\t\r]/, "'\u0024&")
        .replace(/"/g, '""')}"`;
    const csv = [
      head,
      ...rows.map((l) => [
        l.name,
        l.company,
        l.phone,
        l.email,
        SOURCES[l.source].label,
        stageLabel(l.stage),
        l.owner,
        l.value ?? "",
        l.createdAt.slice(0, 10),
        l.lastInteraction.slice(0, 10),
      ]),
    ]
      .map((r) => r.map(esc).join(";"))
      .join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(["\ufeff" + csv], { type: "text/csv" }));
    a.download = "leadtrace-leads.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div>
      <PageHeader
        title="Leads"
        subtitle={`${rows.length} leads encontrados`}
        actions={
          <>
            <Button variant="outline" onClick={exportCsv}>
              <Download /> CSV
            </Button>
            <Button onClick={() => setOpen(true)}>
              <Plus /> Novo lead
            </Button>
          </>
        }
      />
      <FilterBar
        value={f}
        onChange={(v) => {
          setF(v);
          setPage(0);
        }}
      />
      <div className="mb-3 flex flex-wrap gap-2">
        <div className="relative min-w-60 flex-1">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            aria-label="Pesquisar"
            className="pl-8"
            placeholder="Pesquisar…"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(0);
            }}
          />
        </div>
        <select
          aria-label="Ordenar"
          className="h-9 rounded-md border border-input bg-card px-2 text-sm"
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
        >
          <option value="createdAt">Mais recentes</option>
          <option value="lastInteraction">Último contato</option>
          <option value="name">Nome</option>
          <option value="value">Maior valor</option>
        </select>
      </div>
      {view.length === 0 ? (
        <EmptyState
          title="Nenhum lead encontrado"
          hint="Ajuste filtros ou cadastre um novo lead."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-muted-foreground">
              <tr className="border-b border-border">
                {[
                  "Lead",
                  "Origem",
                  "Etapa",
                  "Responsável",
                  "Valor",
                  "Entrada",
                  "Último contato",
                ].map((h) => (
                  <th key={h} className="px-3 py-2 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {view.map((l) => (
                <tr
                  key={l.id}
                  className="cursor-pointer border-b border-border/50 hover:bg-accent"
                  onClick={() => openLead(l.id)}
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && openLead(l.id)}
                >
                  <td className="px-3 py-2">
                    <p className="font-medium">{l.name}</p>
                    <p className="text-xs text-muted-foreground">{l.company}</p>
                  </td>
                  <td className="px-3 py-2">
                    <OriginBadge source={l.source} />
                  </td>
                  <td className="whitespace-nowrap px-3 py-2">{stageLabel(l.stage)}</td>
                  <td className="whitespace-nowrap px-3 py-2">{l.owner}</td>
                  <td className="whitespace-nowrap px-3 py-2">{brl(l.value)}</td>
                  <td className="whitespace-nowrap px-3 py-2">{fmtDate(l.createdAt)}</td>
                  <td className="whitespace-nowrap px-3 py-2">{fmtDate(l.lastInteraction)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="mt-3 flex items-center justify-end gap-2 text-sm">
        <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>
          Anterior
        </Button>
        <span className="text-muted-foreground">
          {page + 1} / {pages}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= pages - 1}
          onClick={() => setPage(page + 1)}
        >
          Próxima
        </Button>
      </div>
      <NewLead
        open={open}
        onOpenChange={setOpen}
        onCreate={(l) => {
          const id = addLead(l);
          toast.success("Lead criado");
          openLead(id);
        }}
      />
    </div>
  );
}

function NewLead({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onCreate: Parameters<ReturnType<typeof useCrm>["addLead"]>[0] extends infer T
    ? (l: T) => void
    : never;
}) {
  const { owners } = useCrm();
  const [v, setV] = useState({
    name: "",
    company: "",
    role: "Síndico",
    phone: "",
    email: "",
    service: SERVICES[0]!,
    source: "unknown" as SourceKey,
    owner: owners[0]!,
    value: "",
  });
  const [err, setErr] = useState<string | null>(null);
  const set = (k: keyof typeof v) => (e: { target: { value: string } }) =>
    setV({ ...v, [k]: e.target.value });
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo lead</DialogTitle>
        </DialogHeader>
        <form
          id="nl"
          className="grid grid-cols-2 gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            const r = schema.safeParse(v);
            if (!r.success) {
              setErr("Verifique nome, empresa, telefone e e-mail.");
              return;
            }
            const lead: Omit<
              Lead,
              "id" | "createdAt" | "lastInteraction" | "attributionHistory" | "attribution"
            > = {
              ...r.data,
              role: v.role,
              service: v.service,
              source: v.source,
              owner: v.owner,
              value: v.value ? Number(v.value) : undefined,
              stage: "novo",
              tags: [],
              notes: "",
            };
            onCreate(lead);
            onOpenChange(false);
            setErr(null);
            setV({ ...v, name: "", company: "", phone: "", email: "", value: "" });
          }}
        >
          <div className="col-span-2">
            <Label>Nome</Label>
            <Input value={v.name} onChange={set("name")} required />
          </div>
          <div className="col-span-2">
            <Label>Empresa / condomínio</Label>
            <Input value={v.company} onChange={set("company")} required />
          </div>
          <div>
            <Label>Telefone</Label>
            <Input value={v.phone} onChange={set("phone")} required />
          </div>
          <div>
            <Label>E-mail</Label>
            <Input type="email" value={v.email} onChange={set("email")} />
          </div>
          <div>
            <Label>Serviço</Label>
            <select className={sel} value={v.service} onChange={set("service")}>
              {SERVICES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <Label>Origem</Label>
            <select className={sel} value={v.source} onChange={set("source")}>
              {SOURCE_KEYS.map((k) => (
                <option key={k} value={k}>
                  {SOURCES[k].label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Responsável</Label>
            <select className={sel} value={v.owner} onChange={set("owner")}>
              {owners.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <Label>Valor estimado (R$)</Label>
            <Input type="number" min={0} value={v.value} onChange={set("value")} />
          </div>
          {err && <p className="col-span-2 text-sm text-destructive">{err}</p>}
        </form>
        <DialogFooter>
          <Button type="submit" form="nl">
            Criar lead
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

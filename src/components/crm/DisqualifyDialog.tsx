import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DISQUALIFY_REASONS } from "@/lib/crm/types";
import { cn } from "@/lib/utils";

export function DisqualifyDialog({ open, onOpenChange, leadName, onConfirm }: { open: boolean; onOpenChange: (o: boolean) => void; leadName: string; onConfirm: (reason: string, note: string) => void }) {
  const [reason, setReason] = useState<string>("");
  const [note, setNote] = useState("");
  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) { setReason(""); setNote(""); } }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Desqualificar lead</DialogTitle>
          <DialogDescription>Informe o motivo para {leadName}. Isso alimenta os relatórios.</DialogDescription>
        </DialogHeader>
        <div role="radiogroup" aria-label="Motivo" className="grid grid-cols-2 gap-2">
          {DISQUALIFY_REASONS.map((r) => (
            <button key={r} type="button" role="radio" aria-checked={reason === r} onClick={() => setReason(r)} className={cn("rounded-md border border-border px-3 py-2 text-left text-sm transition-colors hover:bg-accent", reason === r && "border-primary bg-primary/10 text-primary")}>{r}</button>
          ))}
        </div>
        <Textarea placeholder="Observação complementar (opcional)" value={note} onChange={(e) => setNote(e.target.value)} />
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button variant="destructive" disabled={!reason || (reason === "Outro" && !note.trim())} onClick={() => { onConfirm(reason, note.trim()); onOpenChange(false); setReason(""); setNote(""); }}>Confirmar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

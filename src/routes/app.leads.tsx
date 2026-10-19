import { createFileRoute } from "@tanstack/react-router";
import { Leads } from "@/components/pages/Leads";
import { privateRouteMeta } from "@/lib/route-meta";
export const Route = createFileRoute("/app/leads")({
  head: () => privateRouteMeta("Leads demonstrativos", "Contatos, responsáveis e histórico de leads fictícios no LeadTrace CRM."),
  component: Leads,
});

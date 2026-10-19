import { createFileRoute } from "@tanstack/react-router";
import { Deals } from "@/components/pages/Deals";
import { privateRouteMeta } from "@/lib/route-meta";
export const Route = createFileRoute("/app/deals")({
  head: () => privateRouteMeta("Propostas demonstrativas", "Valores e acompanhamento de propostas fictícias no LeadTrace CRM."),
  component: Deals,
});

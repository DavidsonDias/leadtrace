import { createFileRoute } from "@tanstack/react-router";
import { Origin } from "@/components/pages/Origin";
import { privateRouteMeta } from "@/lib/route-meta";
export const Route = createFileRoute("/app/origin")({
  head: () => privateRouteMeta("Origem demonstrativa", "Evidências e atribuição de origem dos leads fictícios no LeadTrace CRM."),
  component: Origin,
});

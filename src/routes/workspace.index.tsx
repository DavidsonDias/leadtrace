import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "@/components/pages/Dashboard";
import { privateRouteMeta } from "@/lib/route-meta";
export const Route = createFileRoute("/workspace/")({
  head: () => privateRouteMeta("Visão geral da organização", "Indicadores e alertas do ambiente de trabalho LeadTrace CRM."),
  component: Dashboard,
});

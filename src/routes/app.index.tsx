import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "@/components/pages/Dashboard";
import { privateRouteMeta } from "@/lib/route-meta";
export const Route = createFileRoute("/app/")({
  head: () => privateRouteMeta("Dashboard demonstrativo", "Indicadores e alertas comerciais com dados fictícios do LeadTrace CRM."),
  component: Dashboard,
});

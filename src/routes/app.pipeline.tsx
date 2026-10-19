import { createFileRoute } from "@tanstack/react-router";
import { Pipeline } from "@/components/pages/Pipeline";
import { privateRouteMeta } from "@/lib/route-meta";
export const Route = createFileRoute("/app/pipeline")({
  head: () => privateRouteMeta("Pipeline demonstrativo", "Etapas e oportunidades comerciais simuladas no LeadTrace CRM."),
  component: Pipeline,
});

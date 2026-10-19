import { createFileRoute } from "@tanstack/react-router";
import { FollowUp } from "@/components/pages/FollowUp";
import { privateRouteMeta } from "@/lib/route-meta";
export const Route = createFileRoute("/app/followup")({
  head: () => privateRouteMeta("Follow-up demonstrativo", "Alertas e próximos acompanhamentos comerciais com dados fictícios do LeadTrace CRM."),
  component: FollowUp,
});

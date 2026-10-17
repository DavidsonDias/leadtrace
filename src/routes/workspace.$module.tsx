import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { Dashboard } from "@/components/pages/Dashboard";
import { Leads } from "@/components/pages/Leads";
import { Pipeline } from "@/components/pages/Pipeline";
import { Origin } from "@/components/pages/Origin";
import { Deals } from "@/components/pages/Deals";
import { FollowUp } from "@/components/pages/FollowUp";
import { Inbox } from "@/components/pages/Inbox";
import { WorkspaceSettings } from "@/components/workspace/Settings";
export const Route = createFileRoute("/workspace/$module")({
  validateSearch: z.object({ lead: z.string().uuid().optional() }),
  component: Page,
});
function Page() {
  const { module } = Route.useParams(),
    { lead } = Route.useSearch(),
    nav = useNavigate({ from: "/workspace/$module" });
  switch (module) {
    case "dashboard":
      return <Dashboard />;
    case "leads":
      return <Leads />;
    case "pipeline":
      return <Pipeline />;
    case "origin":
      return <Origin />;
    case "deals":
      return <Deals />;
    case "followup":
      return <FollowUp />;
    case "inbox":
      return <Inbox selected={lead} onSelect={(id) => void nav({ search: { lead: id } })} />;
    case "settings":
      return <WorkspaceSettings />;
    default:
      return <h1 className="text-xl">Módulo não encontrado</h1>;
  }
}

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { Inbox } from "@/components/pages/Inbox";
export const Route = createFileRoute("/app/inbox")({
  validateSearch: z.object({ lead: z.string().optional() }),
  component: Page,
});
function Page() {
  const { lead } = Route.useSearch(),
    nav = useNavigate({ from: "/app/inbox" });
  return <Inbox selected={lead} onSelect={(id) => void nav({ search: { lead: id } })} />;
}

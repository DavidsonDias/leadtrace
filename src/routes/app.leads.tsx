import { createFileRoute } from "@tanstack/react-router";
import { Leads } from "@/components/pages/Leads";
export const Route = createFileRoute("/app/leads")({ component: Leads });

import { createFileRoute } from "@tanstack/react-router";
import { Deals } from "@/components/pages/Deals";
export const Route = createFileRoute("/app/deals")({ component: Deals });

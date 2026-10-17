import { createFileRoute } from "@tanstack/react-router";
import { FollowUp } from "@/components/pages/FollowUp";
export const Route = createFileRoute("/app/followup")({ component: FollowUp });

import { createFileRoute } from "@tanstack/react-router";
import { Pipeline } from "@/components/pages/Pipeline";
export const Route = createFileRoute("/app/pipeline")({ component: Pipeline });

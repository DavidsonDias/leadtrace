import { toast } from "sonner";
import { useCrm } from "./context";
/** Demo screens can confirm immediately; live success is confirmed only by the backend provider. */
export function useCrmFeedback() {
  const { mode } = useCrm();
  if (mode === "demo") return toast;
  return Object.assign((..._args: Parameters<typeof toast>) => "", {
    ...toast,
    success: (..._args: Parameters<typeof toast.success>) => "",
  });
}

import { useEffect, useState } from "react";
import { Moon, Sun, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Preferences() {
  const [light, setLight] = useState(false);
  const [offline, setOffline] = useState(false);
  useEffect(() => {
    try {
      setLight(localStorage.getItem("leadtrace.theme") === "light");
    } catch {
      /* session-only preference */
    }
    const sync = () => setOffline(!navigator.onLine);
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    if ("serviceWorker" in navigator && import.meta.env.PROD) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* installation is optional */
      });
    }
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);
  useEffect(() => {
    document.documentElement.dataset["theme"] = light ? "light" : "dark";
  }, [light]);
  return (
    <>
      {offline && (
        <div
          role="status"
          className="fixed inset-x-0 top-0 z-50 flex items-center justify-center gap-2 bg-warning px-3 py-2 text-sm text-primary-foreground"
        >
          <WifiOff className="size-4" />
          Você está offline. Integrações externas indisponíveis.
        </div>
      )}
      <Button
        className="fixed bottom-20 right-4 z-50 rounded-full shadow-lg lg:bottom-4"
        variant="outline"
        size="icon"
        aria-label={light ? "Ativar tema escuro" : "Ativar tema claro"}
        onClick={() => {
          const next = !light;
          setLight(next);
          try {
            localStorage.setItem("leadtrace.theme", next ? "light" : "dark");
          } catch {
            /* session-only preference */
          }
        }}
      >
        {light ? <Moon /> : <Sun />}
      </Button>
    </>
  );
}

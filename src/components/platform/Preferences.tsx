import { useEffect, useRef, useState } from "react";
import { Moon, Sun, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Preferences() {
  const [light, setLight] = useState(false);
  const [ready, setReady] = useState(false);
  const [offline, setOffline] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const updating = useRef(false);
  useEffect(() => {
    if (!("serviceWorker" in navigator) || !import.meta.env.PROD) return;
    let active = true;
    const changed = () => {
      if (updating.current) window.location.reload();
    };
    navigator.serviceWorker.addEventListener("controllerchange", changed);
    void navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        if (!active) return;
        if (registration.waiting) setWaitingWorker(registration.waiting);
        registration.addEventListener("updatefound", () => {
          const worker = registration.installing;
          worker?.addEventListener("statechange", () => {
            if (active && worker.state === "installed" && navigator.serviceWorker.controller)
              setWaitingWorker(worker);
          });
        });
      })
      .catch(() => {
        /* Browser installation is optional. */
      });
    return () => {
      active = false;
      navigator.serviceWorker.removeEventListener("controllerchange", changed);
    };
  }, []);
  useEffect(() => {
    try {
      setLight(localStorage.getItem("leadtrace.theme") === "light");
    } catch {
      /* session-only preference */
    }
    setReady(true);
    const sync = () => setOffline(!navigator.onLine);
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
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
      {waitingWorker && (
        <div
          role="status"
          className="fixed inset-x-4 bottom-36 z-50 mx-auto flex max-w-md items-center justify-between gap-3 rounded-lg border border-border bg-card p-3 shadow-lg lg:bottom-20"
        >
          <p className="text-sm">Uma nova versão do LeadTrace está disponível.</p>
          <Button
            size="sm"
            onClick={() => {
              updating.current = true;
              waitingWorker.postMessage({ type: "SKIP_WAITING" });
            }}
          >
            Atualizar
          </Button>
        </div>
      )}
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
        disabled={!ready}
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

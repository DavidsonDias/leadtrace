const configured = import.meta.env.VITE_PUBLIC_SITE_URL;
let url = "https://leadtrace-two.vercel.app";
try {
  if (configured) {
    const candidate = new URL(configured);
    if (candidate.protocol === "https:") url = candidate.origin;
  }
} catch {
  /* Keep the existing stable deployment URL. */
}
export const SITE_URL = url;

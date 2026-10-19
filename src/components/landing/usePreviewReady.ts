import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

/** Keep SSR controls inert until React can handle their actions. */
export function usePreviewReady() {
  return useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);
}

import { isLocalDevModeEnabled } from "./local-dev.js";

(async () => {
  try {
    const isLocalDevMode = await isLocalDevModeEnabled();
    if (!isLocalDevMode) return;

    console.info("[WhaScale] Local Dev Mode ativo (premium local via bundles .js)");
  } catch (error) {
    console.error("[WhaScale] Falha ao inicializar Local Dev Mode", error);
  }
})();

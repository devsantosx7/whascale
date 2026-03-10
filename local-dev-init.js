import { getLocalDevApiBaseUrl, isLocalDevModeEnabled } from "./local-dev.js";

(async () => {
  try {
    const isLocalDevMode = await isLocalDevModeEnabled();
    if (!isLocalDevMode) return;

    const localDevApiBaseUrl = await getLocalDevApiBaseUrl();
    console.info(`[WhaScale] Local Dev Mode ativo (premium local via bundles .js)${localDevApiBaseUrl ? ` | API local: ${localDevApiBaseUrl}` : ""}`);
  } catch (error) {
    console.error("[WhaScale] Falha ao inicializar Local Dev Mode", error);
  }
})();

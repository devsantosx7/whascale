import { getLocalDevApiBaseUrl, isLocalDevModeEnabled } from "./local-dev.js";
import { installNetworkMocks } from "./api-client.js";
import { isLocalDevModeEnabled } from "./local-dev.js";

(async () => {
  try {
    const isLocalDevMode = await isLocalDevModeEnabled();
    if (!isLocalDevMode) return;

    const localDevApiBaseUrl = await getLocalDevApiBaseUrl();
    console.info(`[WhaScale] Local Dev Mode ativo (premium local via bundles .js)${localDevApiBaseUrl ? ` | API local: ${localDevApiBaseUrl}` : ""}`);
    await installNetworkMocks();
    console.info("[WhaScale] Local Dev Mode ativo (Mock API + premium local)");
  } catch (error) {
    console.error("[WhaScale] Falha ao inicializar Local Dev Mode", error);
  }
})();

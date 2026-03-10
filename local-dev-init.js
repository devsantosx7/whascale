import { installNetworkMocks } from "./api-client.js";
import { isLocalDevModeEnabled } from "./local-dev.js";

(async () => {
  try {
    const isLocalDevMode = await isLocalDevModeEnabled();
    if (!isLocalDevMode) return;

    await installNetworkMocks();
    console.info("[WhaScale] Local Dev Mode ativo (Mock API + premium local)");
  } catch (error) {
    console.error("[WhaScale] Falha ao inicializar Local Dev Mode", error);
  }
})();

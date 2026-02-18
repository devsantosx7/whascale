import { isLocalDevModeEnabled } from "./local-dev.js";

function injectPremiumGateOverride() {
  const script = document.createElement("script");
  script.type = "text/javascript";
  script.textContent = `
    (() => {
      const forcePremiumGate = () => true;

      const criterion = window.__CRITERION__ || {};
      criterion.getFeatureFlagOverride = forcePremiumGate;
      window.__CRITERION__ = criterion;

      const patchFeatureGateClient = (client) => {
        if (!client || client.__whascalePremiumPatched) return client;

        if (typeof client.checkGate === "function") {
          client.checkGate = () => true;
        }

        if (typeof client.initializeCalled === "function") {
          client.initializeCalled = () => true;
        }

        if (typeof client.initializeCompleted === "function") {
          client.initializeCompleted = () => true;
        }

        if (typeof client.waitUntilInitializeCompleted === "function") {
          client.waitUntilInitializeCompleted = async () => true;
        }

        client.__whascalePremiumPatched = true;
        return client;
      };

      let featureGatesClient = patchFeatureGateClient(window.__FEATUREGATES_JS__);

      try {
        Object.defineProperty(window, "__FEATUREGATES_JS__", {
          configurable: true,
          get() {
            return featureGatesClient;
          },
          set(value) {
            featureGatesClient = patchFeatureGateClient(value);
          }
        });
      } catch (_error) {
        window.__FEATUREGATES_JS__ = patchFeatureGateClient(window.__FEATUREGATES_JS__);
      }
    })();
  `;

  (document.head || document.documentElement).appendChild(script);
  script.remove();
}

(async () => {
  try {
    const isLocalDevMode = await isLocalDevModeEnabled();
    if (!isLocalDevMode) return;

    injectPremiumGateOverride();

    const apiClient = await import(chrome.runtime.getURL("api-client.js"));
    await apiClient.installNetworkMocks();
  } catch (error) {
    console.error("[WhaScale] Falha ao inicializar Local Dev Mode", error);
  }
})();

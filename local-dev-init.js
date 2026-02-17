(async () => {
  try {
    const apiClient = await import(chrome.runtime.getURL("api-client.js"));
    await apiClient.installNetworkMocks();
  } catch (error) {
    console.error("[WhaScale] Falha ao inicializar Local Dev Mode", error);
  }
})();

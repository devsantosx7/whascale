import { getLocalDevApiBaseUrl, getLocalDevApiBaseUrlSync, isLocalDevModeEnabled } from "./local-dev.js";

const ACCESS_TOKEN = "ffce211a-7b07-4d91-ba5d-c40bb4034a83";
const PLACEHOLDER_XLSX_BASE64 = "UExBQ0VIT0xERVJfWExTWA==";

const LOCAL_DEV_REMOTE_DOMAIN = "wascript.com.br";

function isLocalDevRemoteHost(hostname = "") {
  return hostname === LOCAL_DEV_REMOTE_DOMAIN || hostname.endsWith(`.${LOCAL_DEV_REMOTE_DOMAIN}`);
}

function isLocalDevApiLikeRequest(urlInstance) {
  if (!urlInstance) return false;
  return urlInstance.pathname.startsWith("/api/") || isLocalDevRemoteHost(urlInstance.hostname);
}

function buildPremiumFeatures() {
  return {
    signature: true,
    insert_name: true,
    chat_assistant: true,
    replace_text: true,
    view_attendants: true,
    fluxo: true,
    webhook: true,
    notes: true
  };
}


function getOriginalFetch() {
  if (!globalThis.fetch) return null;
  if (!globalThis.__WHASCALE_ORIGINAL_FETCH__) {
    globalThis.__WHASCALE_ORIGINAL_FETCH__ = globalThis.fetch.bind(globalThis);
  }
  return globalThis.__WHASCALE_ORIGINAL_FETCH__;
}

function buildLocalApiUrl(apiBaseUrl, pathname) {
  if (!apiBaseUrl) return null;
  try {
    return new URL(pathname, `${apiBaseUrl}/`).toString();
  } catch (_error) {
    return null;
  }
}

async function requestLocalApi(apiBaseUrl, urlInstance, options = {}) {
  if (!urlInstance) return null;
  const pathname = `/__proxy/${urlInstance.hostname}${urlInstance.pathname}${urlInstance.search}`;
  const localApiUrl = buildLocalApiUrl(apiBaseUrl, pathname);
  if (!localApiUrl) return null;

  const originalFetch = getOriginalFetch();
  if (!originalFetch) return null;

  try {
    const response = await originalFetch(localApiUrl, options);
    if (!response.ok) return null;
    return response;
  } catch (_error) {
    return null;
  }
}


function safeCreateUrl(rawUrl) {
  try {
    return new URL(rawUrl);
  } catch (_error) {
    try {
      return new URL(rawUrl, globalThis.location?.origin || "https://web.whatsapp.com");
    } catch (_secondError) {
      return null;
    }
  }
}


function buildBlockedResponse(urlInstance) {
  return buildJsonResponse({
    success: false,
    local_dev_blocked: true,
    message: "Requisição bloqueada no LOCAL_DEV_MODE",
    target: urlInstance?.toString?.() || "unknown"
  }, 503);
}

function buildJsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

function getRequestBody(options = {}) {
  if (!options?.body || typeof options.body !== "string") return {};
  try {
    return JSON.parse(options.body);
  } catch (_error) {
    return {};
  }
}

function buildAuthResponse(body = {}) {
  const bearerToken = body.bearer_token || "local-dev-bearer-token";
  const userId = body.user_id || "local-dev-user";
  const now = new Date().toISOString();

  return {
    session: {
      is_load: true,
      is_auth: true,
      is_auth_google: false,
      user_status: "active",
      is_premium: true
    },
    user: {
      user_id: userId,
      name: "Local Dev User",
      email: "local-dev@whascale.test",
      wl_id: "local-dev-wl",
      bearer_token: bearerToken,
      access_token_plugin: ACCESS_TOKEN,
      user_premium: {
        active: true,
        data_liberacao: "2099-12-31T00:00:00.000Z",
        liberacoes: buildPremiumFeatures()
      },
      dataCadastro: now,
      whatsapp_registro: "5511999999999",
      whatsapp_plugin: "5511888888888",
      path: "/local/dev",
      afiliado: "local",
      campanhaID: "local-dev-campaign",
      cookies: {
        _fbc: "local_fbc",
        _fbp: "local_fbp",
        _ga: "local_ga",
        _ttclid: "local_ttclid",
        _ttp: "local_ttp"
      }
    },
    auth_google: {}
  };
}

function isBackendPluginPath(pathname, method) {
  if (method === "GET" && pathname.startsWith("/api/services/initial-data/")) return true;
  if (method === "GET" && pathname.startsWith("/api/urls/install/")) return true;
  if (method === "GET" && pathname.startsWith("/api/urls/uninstall/")) return true;
  if (method === "GET" && pathname.startsWith("/api/urls/notes/")) return true;
  if (method === "POST" && pathname.includes("/api/auth/login-bearer/")) return true;
  if (method === "POST" && pathname.includes("/api/auth/validation/")) return true;
  return false;
}

export function mockRouter(rawUrl, options = {}) {
  const url = new URL(rawUrl);
  const pathname = url.pathname;
  const method = (options.method || "GET").toUpperCase();
  const body = getRequestBody(options);

  if (isBackendPluginPath(pathname, method)) {
    if (method === "GET" && pathname.startsWith("/api/services/initial-data/")) {
      return buildJsonResponse({ success: true, extension_id: pathname.split("/").pop(), mode: "local-dev", liberacoes: buildPremiumFeatures(), premium: true });
    }
    if (method === "GET" && pathname.startsWith("/api/urls/install/")) {
      return buildJsonResponse({ success: true, url: "https://web.whatsapp.com/" });
    }
    if (method === "GET" && pathname.startsWith("/api/urls/uninstall/")) {
      return buildJsonResponse({ success: true, url: "https://web.whatsapp.com/" });
    }
    if (method === "GET" && pathname.startsWith("/api/urls/notes/")) {
      return buildJsonResponse({ success: true, url: "https://web.whatsapp.com/" });
    }
    if (method === "POST" && pathname.includes("/api/auth/login-bearer/")) {
      return buildJsonResponse(buildAuthResponse(body));
    }
    if (method === "POST" && pathname.includes("/api/auth/validation/")) {
      return buildJsonResponse(buildAuthResponse(body));
    }
  }

  if (method === "POST" && pathname === "/api/audio/convert-ptt-base64") {
    return buildJsonResponse({ base64: body.base64 || "" });
  }

  if (method === "GET" && pathname === "/extend/domSelector.json") {
    return buildJsonResponse({ version: "local-dev-1.0.0" });
  }

  if (pathname === "/api/XLSX/exportFunil" && method === "POST") {
    return buildJsonResponse({ success: true, XLSXbase64: PLACEHOLDER_XLSX_BASE64, filename: "export-funil-local-dev.xlsx" });
  }
  if (pathname === "/api/XLSX/envioEmMassa" && method === "POST") {
    return buildJsonResponse({ XLSXbase64: PLACEHOLDER_XLSX_BASE64 });
  }
  if (pathname === "/api/XLSX/gabarito" && method === "GET") {
    return buildJsonResponse({ XLSXbase64: PLACEHOLDER_XLSX_BASE64 });
  }
  if (pathname === "/api/XLSX/contactprofile" && method === "POST") {
    return buildJsonResponse({ XLSXbase64: PLACEHOLDER_XLSX_BASE64 });
  }
  if (pathname === "/api/XLSX/exportrelatorio" && method === "POST") {
    return buildJsonResponse({ XLSXbase64: PLACEHOLDER_XLSX_BASE64 });
  }

  return null;
}

export async function apiRequest(input, options = {}) {
  const url = typeof input === "string" ? input : input.url;
  const isLocalDevMode = await isLocalDevModeEnabled();
  if (!isLocalDevMode) return fetch(input, options);

  const mockedResponse = mockRouter(url, options);
  if (mockedResponse) return mockedResponse;

  const localApiBaseUrl = await getLocalDevApiBaseUrl();
  const urlInstance = safeCreateUrl(url);
  if (isLocalDevApiLikeRequest(urlInstance)) {
    if (localApiBaseUrl) {
      const localResponse = await requestLocalApi(localApiBaseUrl, urlInstance, options);
      if (localResponse) return localResponse;
    }
    return buildBlockedResponse(urlInstance);
  }

  return fetch(input, options);
}

function patchFetch() {
  if (!globalThis.fetch || globalThis.__WHASCALE_FETCH_PATCHED__) return;
  const originalFetch = getOriginalFetch();
  globalThis.fetch = async (input, options = {}) => {
    const url = typeof input === "string" ? input : input?.url;
    if (url) {
      const mockedResponse = mockRouter(url, options);
      if (mockedResponse) return mockedResponse;

      const localApiBaseUrl = getLocalDevApiBaseUrlSync();
      const urlInstance = safeCreateUrl(url);
      if (isLocalDevApiLikeRequest(urlInstance)) {
        if (localApiBaseUrl) {
          const localResponse = await requestLocalApi(localApiBaseUrl, urlInstance, options);
          if (localResponse) return localResponse;
        }
        return buildBlockedResponse(urlInstance);
      }
    }
    return originalFetch(input, options);
  };
  globalThis.__WHASCALE_FETCH_PATCHED__ = true;
}

function patchXMLHttpRequest() {
  if (!globalThis.XMLHttpRequest || globalThis.__WHASCALE_XHR_PATCHED__) return;

  const originalOpen = XMLHttpRequest.prototype.open;
  const originalSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function(method, url, ...rest) {
    this.__whascaleMockMethod = method;
    this.__whascaleMockUrl = url;
    return originalOpen.call(this, method, url, ...rest);
  };

  XMLHttpRequest.prototype.send = function(body) {
    const url = this.__whascaleMockUrl;
    if (!url) return originalSend.call(this, body);

    const requestOptions = {
      method: this.__whascaleMockMethod || "GET",
      body: typeof body === "string" ? body : undefined
    };

    const mockedResponse = mockRouter(url, requestOptions);

    if (mockedResponse) {
      mockedResponse.text().then((responseText) => {
        Object.defineProperty(this, "readyState", { configurable: true, value: 4 });
        Object.defineProperty(this, "status", { configurable: true, value: 200 });
        Object.defineProperty(this, "responseText", { configurable: true, value: responseText });
        Object.defineProperty(this, "response", { configurable: true, value: responseText });

        this.onreadystatechange?.();
        this.onload?.();
        this.dispatchEvent(new Event("readystatechange"));
        this.dispatchEvent(new Event("load"));
        this.dispatchEvent(new Event("loadend"));
      });
      return;
    }

    const localApiBaseUrl = getLocalDevApiBaseUrlSync();
    const urlInstance = safeCreateUrl(url);
    if (!isLocalDevApiLikeRequest(urlInstance)) return originalSend.call(this, body);

    if (!localApiBaseUrl) {
      const blocked = buildBlockedResponse(urlInstance);
      blocked.text().then((responseText) => {
        Object.defineProperty(this, "readyState", { configurable: true, value: 4 });
        Object.defineProperty(this, "status", { configurable: true, value: 503 });
        Object.defineProperty(this, "responseText", { configurable: true, value: responseText });
        Object.defineProperty(this, "response", { configurable: true, value: responseText });
        this.onreadystatechange?.();
        this.onload?.();
        this.dispatchEvent(new Event("readystatechange"));
        this.dispatchEvent(new Event("load"));
        this.dispatchEvent(new Event("loadend"));
      });
      return;
    }

    requestLocalApi(localApiBaseUrl, urlInstance, requestOptions).then((localResponse) => {
      if (!localResponse) {
        const blocked = buildBlockedResponse(urlInstance);
        return blocked.text().then((responseText) => {
          Object.defineProperty(this, "readyState", { configurable: true, value: 4 });
          Object.defineProperty(this, "status", { configurable: true, value: 503 });
          Object.defineProperty(this, "responseText", { configurable: true, value: responseText });
          Object.defineProperty(this, "response", { configurable: true, value: responseText });
          this.onreadystatechange?.();
          this.onload?.();
          this.dispatchEvent(new Event("readystatechange"));
          this.dispatchEvent(new Event("load"));
          this.dispatchEvent(new Event("loadend"));
        });
      }

      localResponse.text().then((responseText) => {
        Object.defineProperty(this, "readyState", { configurable: true, value: 4 });
        Object.defineProperty(this, "status", { configurable: true, value: localResponse.status });
        Object.defineProperty(this, "responseText", { configurable: true, value: responseText });
        Object.defineProperty(this, "response", { configurable: true, value: responseText });

        this.onreadystatechange?.();
        this.onload?.();
        this.dispatchEvent(new Event("readystatechange"));
        this.dispatchEvent(new Event("load"));
        this.dispatchEvent(new Event("loadend"));
      });
    });
  };

  globalThis.__WHASCALE_XHR_PATCHED__ = true;
}


function patchSendBeacon() {
  if (!globalThis.navigator?.sendBeacon || globalThis.__WHASCALE_BEACON_PATCHED__) return;
  const originalSendBeacon = globalThis.navigator.sendBeacon.bind(globalThis.navigator);

  globalThis.navigator.sendBeacon = function(url, data) {
    const localApiBaseUrl = getLocalDevApiBaseUrlSync();
    const urlInstance = safeCreateUrl(typeof url === "string" ? url : String(url));
    if (!isLocalDevApiLikeRequest(urlInstance)) {
      return originalSendBeacon(url, data);
    }

    if (!localApiBaseUrl) return false;

    const payload = typeof data === "string" ? data : data ? "[binary]" : "";
    requestLocalApi(localApiBaseUrl, urlInstance, {
      method: "POST",
      body: payload,
      headers: { "Content-Type": "text/plain" }
    });
    return true;
  };

  globalThis.__WHASCALE_BEACON_PATCHED__ = true;
}

function patchWebSocket() {
  if (!globalThis.WebSocket || globalThis.__WHASCALE_WS_PATCHED__) return;
  const OriginalWebSocket = globalThis.WebSocket;

  globalThis.WebSocket = function(url, protocols) {
    const urlInstance = safeCreateUrl(typeof url === "string" ? url : String(url));
    if (urlInstance && isLocalDevRemoteHost(urlInstance.hostname)) {
      console.info("[WhaScale][LocalDev] WebSocket remoto bloqueado:", urlInstance.toString());
      const eventTarget = new EventTarget();
      const socketShim = {
        readyState: 3,
        url: urlInstance.toString(),
        close: () => {},
        send: () => {},
        addEventListener: (...args) => eventTarget.addEventListener(...args),
        removeEventListener: (...args) => eventTarget.removeEventListener(...args),
        dispatchEvent: (...args) => eventTarget.dispatchEvent(...args)
      };
      setTimeout(() => socketShim.dispatchEvent(new Event("close")), 0);
      return socketShim;
    }
    return new OriginalWebSocket(url, protocols);
  };

  globalThis.WebSocket.prototype = OriginalWebSocket.prototype;
  globalThis.__WHASCALE_WS_PATCHED__ = true;
}

export async function installNetworkMocks() {
  if (!(await isLocalDevModeEnabled())) return;
  patchFetch();
  patchXMLHttpRequest();
  patchSendBeacon();
  patchWebSocket();
}

globalThis.WhaScaleApiClient = {
  apiRequest,
  installNetworkMocks,
  mockRouter
};

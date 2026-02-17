import { isLocalDevModeEnabled } from "./local-dev.js";

const ACCESS_TOKEN = "ffce211a-7b07-4d91-ba5d-c40bb4034a83";
const PLACEHOLDER_XLSX_BASE64 = "UExBQ0VIT0xERVJfWExTWA==";

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
      user_premium: true,
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

export function mockRouter(rawUrl, options = {}) {
  const url = new URL(rawUrl);
  const pathname = url.pathname;
  const method = (options.method || "GET").toUpperCase();
  const body = getRequestBody(options);

  if (url.origin === "https://backend-plugin.wascript.com.br") {
    if (method === "GET" && pathname.startsWith("/api/services/initial-data/")) {
      return buildJsonResponse({ success: true, extension_id: pathname.split("/").pop(), mode: "local-dev" });
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

  if (url.origin === "https://backend-utils.wascript.com.br" && method === "POST" && pathname === "/api/audio/convert-ptt-base64") {
    return buildJsonResponse({ base64: body.base64 || "" });
  }

  if (url.origin === "https://painel-new.wascript.com.br" && method === "GET" && pathname === "/extend/domSelector.json") {
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
  if (await isLocalDevModeEnabled()) {
    const mockedResponse = mockRouter(url, options);
    if (mockedResponse) return mockedResponse;
  }
  return fetch(input, options);
}

function patchFetch() {
  if (!globalThis.fetch || globalThis.__WHASCALE_FETCH_PATCHED__) return;
  const originalFetch = globalThis.fetch.bind(globalThis);
  globalThis.fetch = async (input, options = {}) => {
    const url = typeof input === "string" ? input : input?.url;
    if (url) {
      const mockedResponse = mockRouter(url, options);
      if (mockedResponse) return mockedResponse;
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

    const mockedResponse = mockRouter(url, {
      method: this.__whascaleMockMethod || "GET",
      body: typeof body === "string" ? body : undefined
    });

    if (!mockedResponse) return originalSend.call(this, body);

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
  };

  globalThis.__WHASCALE_XHR_PATCHED__ = true;
}

export async function installNetworkMocks() {
  if (!(await isLocalDevModeEnabled())) return;
  patchFetch();
  patchXMLHttpRequest();
}

globalThis.WhaScaleApiClient = {
  apiRequest,
  installNetworkMocks,
  mockRouter
};

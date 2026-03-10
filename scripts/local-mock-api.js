#!/usr/bin/env node
import http from "node:http";

const PORT = Number(process.env.PORT || 4010);

const ACCESS_TOKEN = "ffce211a-7b07-4d91-ba5d-c40bb4034a83";
const PLACEHOLDER_XLSX_BASE64 = "UExBQ0VIT0xERVJfWExTWA==";

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

function sendJson(res, payload, status = 200) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  });
  res.end(body);
}

function parseBody(req) {
  return new Promise((resolve) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
    });
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        resolve({});
      }
    });
  });
}

function buildAuthResponse(body = {}) {
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
      user_id: body.user_id || "local-dev-user",
      name: "Local Dev User",
      email: "local-dev@whascale.test",
      wl_id: "local-dev-wl",
      bearer_token: body.bearer_token || "local-dev-bearer-token",
      access_token_plugin: ACCESS_TOKEN,
      user_premium: {
        active: true,
        data_liberacao: "2099-12-31T00:00:00.000Z",
        liberacoes: buildPremiumFeatures()
      },
      dataCadastro: now
    },
    auth_google: {}
  };
}

const server = http.createServer(async (req, res) => {
  const requestUrl = new URL(req.url || "/", `http://localhost:${PORT}`);
  const pathname = requestUrl.pathname;

  if (req.method === "OPTIONS") {
    sendJson(res, { ok: true }, 204);
    return;
  }

  if (req.method === "GET" && pathname === "/health") {
    sendJson(res, { ok: true, service: "whascale-local-mock-api" });
    return;
  }


  if (pathname.startsWith("/__proxy/")) {
    const forwarded = pathname.replace("/__proxy", "") + requestUrl.search;
    sendJson(res, {
      success: true,
      proxied: true,
      method: req.method,
      forwarded_path: forwarded,
      note: "Rota genérica local para cobrir qualquer conexão remota no LOCAL_DEV_MODE"
    });
    return;
  }

  const body = await parseBody(req);


  if (req.method === "GET" && pathname.startsWith("/api/services/initial-data/")) {
    sendJson(res, {
      success: true,
      extension_id: pathname.split("/").pop(),
      mode: "local-dev",
      premium: true,
      liberacoes: buildPremiumFeatures()
    });
    return;
  }

  if (req.method === "POST" && pathname === "/api/auth/login-bearer/") {
    sendJson(res, buildAuthResponse(body));
    return;
  }
  if (req.method === "POST" && pathname === "/api/auth/validation/") {
    sendJson(res, buildAuthResponse(body));
    return;
  }
  if (req.method === "POST" && pathname === "/api/XLSX/exportFunil") {
    sendJson(res, { success: true, XLSXbase64: PLACEHOLDER_XLSX_BASE64, filename: "export-funil-local-dev.xlsx" });
    return;
  }
  if (req.method === "POST" && pathname === "/api/XLSX/envioEmMassa") {
    sendJson(res, { XLSXbase64: PLACEHOLDER_XLSX_BASE64 });
    return;
  }
  if (req.method === "GET" && pathname === "/api/XLSX/gabarito") {
    sendJson(res, { XLSXbase64: PLACEHOLDER_XLSX_BASE64 });
    return;
  }
  if (req.method === "POST" && pathname === "/api/XLSX/contactprofile") {
    sendJson(res, { XLSXbase64: PLACEHOLDER_XLSX_BASE64 });
    return;
  }
  if (req.method === "POST" && pathname === "/api/XLSX/exportrelatorio") {
    sendJson(res, { XLSXbase64: PLACEHOLDER_XLSX_BASE64 });
    return;
  }

  sendJson(res, { success: true, mocked: true, message: "Rota não mapeada especificamente, resposta genérica local", pathname, method: req.method });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`[WhaScale] Mock API rodando em http://localhost:${PORT}`);
});

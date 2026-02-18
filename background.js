import { installNetworkMocks } from "./api-client.js";

(async () => {
  try {
    await installNetworkMocks();
  } catch (error) {
    console.error("[WhaScale] Falha ao inicializar Local Dev Mode no background", error);
  }
})();

function r(e, t, o) {
  chrome.tabs.query({ url: e }, function(a) {
    a.length > 0 && a.forEach((s) => {
      chrome.tabs.sendMessage(s.id, { action: t, dados: o });
    });
  });
}
async function h(e) {
  return new Promise((t, o) => {
    chrome.storage.local.get([e], function(a) {
      a[e] === void 0 ? o() : t(a[e]);
    });
  });
}
function d(e) {
  const t = new Date(e), o = /* @__PURE__ */ new Date(), a = t.getTime() - o.getTime();
  return a <= 12e4 || a < 0;
}
async function w() {
  const e = await h("notifications"), t = [], o = [];
  let a = 0;
  for (let s of e)
    !s.timeOut && d(`${s.date}T${s.time}`) && (s.timeOut = !0, o.push(s)), s.timeOut && !s.read && a++, t.push(s);
  r("https://web.whatsapp.com/*", "Update_Notificação", { update: t, dispart: o, tam: a });
}
const f = {
  // NomeID Da WL Ativa
  name: "watidy",
  // Versão de build
  version: "7.4.3.14",
  // Chave de criptografia
  cript_key: "ffce211a-7b07-4d91-ba5d-c40bb4034a83",
  // Url do backend principal
  backend_plugin: "https://backend-plugin.wascript.com.br/",
  // Url do backend Antigo
  backend: "https://painel-old.wascript.com.br/",
  // Url do backend de funções auxiliares
  backend_utils: "https://backend-utils.wascript.com.br/",
  // WebSockets
  webSocket: {
    "multi-atendimento": "https://multi-atendimento.wascript.com.br",
    "api-whatsapp": "https://api-whatsapp.wascript.com.br"
  },
  // Url do painel de clientes
  painel_cliente: "https://app.wascript.com.br",
  // Url do audio transcriber
  audio_transcriber: "https://audio-transcriber.wascript.com.br/transcription",
  // Selector de elementos DOM
  domSelector: "https://painel-new.wascript.com.br/extend/domSelector.json",
  // Limite de mídia no Resposta Rápida
  midiaLimit: 50
};
async function b() {
  try {
    const t = await (await fetch(f.domSelector)).json();
    typeof t == "object" && typeof t.version == "string" && r("https://web.whatsapp.com/*", "Update_DomSelector", { version: t.version });
  } catch (e) {
    console.error("Error ao tentar Capturar o Dom Selector virtual", e);
  }
}
function c() {
  chrome.alarms.get("One_Minute", (e) => {
    e || chrome.alarms.create("One_Minute", { periodInMinutes: 1 });
  }), chrome.alarms.get("Five_Minutes", (e) => {
    e || chrome.alarms.create("Five_Minutes", { periodInMinutes: 5 });
  }), chrome.alarms.get("Ten_Minutes", (e) => {
    e || chrome.alarms.create("Ten_Minutes", { periodInMinutes: 10 });
  }), chrome.alarms.get("Thirty_Minutes", (e) => {
    e || chrome.alarms.create("Thirty_Minutes", { periodInMinutes: 30 });
  });
}
chrome.alarms.onAlarm.addListener((e) => {
  switch (e.name) {
    // 1 Minuto
    case "One_Minute":
      r("https://web.whatsapp.com/*", "Update_Agendamento", {}), r("https://web.whatsapp.com/*", "Update_Status", {}), r("https://web.whatsapp.com/*", "Update_BackupAutomatico", {}), r("https://web.whatsapp.com/*", "Update_MeetAoVivo", {}), w();
      break;
    // 5 Minutos
    case "Five_Minutes":
      r("https://web.whatsapp.com/*", "dispatch_timing_follow", {});
      break;
    // 10 Minutos
    case "Ten_Minutes":
      b();
      break;
    // 30 Minutos
    case "Thirty_Minutes":
      r("https://web.whatsapp.com/*", "Remote-Notificacao", {});
      break;
    // Alarme de manter o sistema ativo
    case "keepAwake":
      chrome.runtime.getPlatformInfo();
      break;
  }
});
const g = () => {
  const e = /* @__PURE__ */ new Date();
  e.setDate(e.getDate() + 1);
  const t = e.getFullYear(), o = String(e.getMonth() + 1).padStart(2, "0"), a = String(e.getDate()).padStart(2, "0");
  return `${t}-${o}-${a}`;
}, _ = {
  date: g(),
  items: [
    "respostasRapidas",
    "respostasRapidasAcao",
    "categoria",
    "agendamentos",
    "agendamentosNaoDisparados",
    "sendAfterWhatsAppOpens",
    "crm",
    "contatos",
    "notes",
    "notifications",
    "perfil",
    "userTabs",
    "agrupamentos",
    "relatorio",
    "encomendas",
    "autoatendimento",
    "webhook",
    "IA",
    "status",
    "pinChat",
    "atendimento",
    "backupAutomatico",
    "whatsApi",
    "replacementStorage",
    "FollowUp",
    "fluxo"
  ],
  recurrency: "diario",
  time: "10:30"
};
async function k() {
  chrome.storage.local.get(null, (e) => {
    chrome.storage.local.set({
      agendamentos: e.agendamentos || [],
      agendamentosNaoDisparados: e.agendamentosNaoDisparados || [],
      sendAfterWhatsAppOpens: e.sendAfterWhatsAppOpens || !1,
      notifications: e.notifications || [],
      userTabs: e.userTabs || [],
      contatos: e.contatos || [],
      notes: e.notes || [],
      agendaMsg: e.agendaMsg || [],
      perfil: e.perfil || [],
      categoria: e.categoria || [],
      initSystem: e.initSystem ?? !0,
      backupAutomatico: e.backupAutomatico || _,
      crm: e.crm || [],
      fluxo: e.fluxo || { workflows: [], currentWorkflow: null },
      fluxoFiles: e.fluxoFiles || [],
      agrupamentos: e.agrupamentos || [],
      relatorio: e.relatorio || [],
      encomendas: e.encomendas || [],
      autoatendimento: e.autoatendimento || [],
      FollowUp: e.FollowUp || [],
      webhook: e.webhook || [],
      IA: e.IA || { activeIA: "Gemini", keyGemini: "", keyGPT: "", keyGroq: "", instance: null },
      status: e.status || [],
      pinChat: e.pinChat || [],
      atendimento: e.atendimento || void 0,
      whatsApi: e.whatsApi || { active: !1, token: "", userID: "" },
      replacementStorage: e.replacementStorage || { items: [], isEnabled: !0 },
      initDate: e.initDate || !1,
      //Armazena a data em que o plugin foi instalado para validar a utilização de algumas funções do usuário free
      modalLead: e.modalLead || {},
      // Respostas Rapidas OLD
      guardaMsg: e.guardaMsg || [],
      medias: e.medias || [],
      // Respostas Rapidas New
      respostasRapidas: e.respostasRapidas || [],
      respostasRapidasAcao: e.respostasRapidasAcao || []
    });
  });
}
function u() {
  chrome.tabs.query({ url: "https://web.whatsapp.com/*" }, function(e) {
    e.length > 0 && e[0].id !== void 0 ? chrome.tabs.reload(e[0].id) : chrome.tabs.create({ url: "https://web.whatsapp.com" });
  });
}
function M() {
  chrome.runtime.setUninstallURL(`https://backend-plugin.wascript.com.br/api/urls/uninstall/${chrome.runtime.id}`);
}
function A(e) {
  e.reason === "install" && fetch(`https://backend-plugin.wascript.com.br/api/urls/install/${chrome.runtime.id}`).then((t) => {
    if (!t.ok)
      throw new Error("Erro na requisição: " + t.status);
    return t.json();
  }).then((t) => {
    t.success && chrome.tabs.create({ url: t.url });
  }).catch((t) => {
    console.error("Erro ao fazer a requisição:", t);
  });
}
function n(e) {
  const t = chrome.runtime.getURL(e + "/src/index.html");
  chrome.tabs.query({ url: t }, function(o) {
    o.length > 0 && o.forEach((a) => {
      a.id !== void 0 && chrome.tabs.remove(a.id);
    }), chrome.tabs.create({ url: t });
  });
}
const i = /* @__PURE__ */ new Map(), m = (e, t, o) => {
  o.url && i.set(e, o.url);
}, l = (e) => {
  const t = i.get(e);
  i.delete(e), t && t.includes("https://web.whatsapp") && chrome.runtime.sendMessage({ action: "whatsIsClosed" });
}, p = () => {
  try {
    chrome.tabs.onUpdated.removeListener(m), chrome.tabs.onRemoved.removeListener(l);
  } catch (e) {
    console.error("erro ao remover os ouvintes do WhatsIsOpen", e);
  } finally {
    chrome.tabs.onUpdated.addListener(m), chrome.tabs.onRemoved.addListener(l);
  }
}, y = () => {
  chrome.runtime.onMessageExternal.addListener(async (e, t, o) => {
    switch (e.action) {
      // Informa que a extensão foi Instalada
      case "is_instaled":
        o({ success: !0 });
        break;
      case "user_auth":
        r("https://web.whatsapp.com/*", "user_auth_callback", { bearer_token: e.bearer_token }), chrome.tabs.query({ url: "https://web.whatsapp.com/*" }, (a) => {
          if (a && a.length > 0) {
            const s = a[0];
            chrome.windows.update(s.windowId, { focused: !0 }), chrome.tabs.update(s.id, { active: !0 });
          }
        }), e.close_painel && t.tab && t.tab.id && setTimeout(() => {
          chrome.tabs.remove(t.tab.id);
        }, 100);
        break;
      case "open_whatsapp":
        await chrome.storage.local.set({
          redirect_painel: {
            bearer: e.bearer,
            timer: Math.floor(Date.now() / 6e4)
          }
        }), chrome.tabs.query({ url: "https://web.whatsapp.com/*" }, (a) => {
          if (a && a.length > 0) {
            const s = a[0];
            chrome.windows.update(s.windowId, { focused: !0 }), chrome.tabs.update(s.id, { active: !0 }), r("https://web.whatsapp.com/*", "redirect_painel", {});
          } else
            chrome.tabs.create({ url: "https://web.whatsapp.com/" });
        });
        break;
    }
    return !0;
  });
};
y();
c();
p();
chrome.action.onClicked.addListener(() => {
  c(), p(), u();
});
chrome.runtime.onInstalled.addListener(async function(e) {
  A(e), u(), c(), k(), p(), M(), e.reason === "update" && chrome.tabs.create({
    url: `https://backend-plugin.wascript.com.br/api/urls/notes/${chrome.runtime.id}`
  });
});
chrome.runtime.onMessage.addListener((e, t, o) => {
  switch (e.message) {
    case "CRM":
      n("crm");
      break;
    case "FLOW":
      n("fluxo");
      break;
    case "funnil":
      n("funnil");
      break;
    case "promotional":
      chrome.tabs.create({ url: e.path });
      break;
  }
});

export const LOCAL_DEV_MODE_DEFAULT = false;
export const LOCAL_DEV_MODE_STORAGE_KEY = "LOCAL_DEV_MODE";
export const LOCAL_DEV_API_BASE_URL_STORAGE_KEY = "LOCAL_DEV_API_BASE_URL";

function parseModeValue(value) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value === "true";
  return LOCAL_DEV_MODE_DEFAULT;
}

async function readChromeStorageMode() {
  if (!globalThis.chrome?.storage?.local) return null;
  return new Promise((resolve) => {
    chrome.storage.local.get([LOCAL_DEV_MODE_STORAGE_KEY], (result) => {
      resolve(parseModeValue(result?.[LOCAL_DEV_MODE_STORAGE_KEY]));
    });
  });
}

function readLocalStorageMode() {
  try {
    if (!globalThis.localStorage) return null;
    return parseModeValue(localStorage.getItem(LOCAL_DEV_MODE_STORAGE_KEY));
  } catch (_error) {
    return null;
  }
}

function normalizeApiBaseUrl(value) {
  if (typeof value !== "string") return null;
  const trimmedValue = value.trim();
  if (!trimmedValue) return null;
  return trimmedValue.replace(/\/+$/, "");
}

async function readChromeStorageApiBaseUrl() {
  if (!globalThis.chrome?.storage?.local) return null;
  return new Promise((resolve) => {
    chrome.storage.local.get([LOCAL_DEV_API_BASE_URL_STORAGE_KEY], (result) => {
      resolve(normalizeApiBaseUrl(result?.[LOCAL_DEV_API_BASE_URL_STORAGE_KEY]));
    });
  });
}

function readLocalStorageApiBaseUrl() {
  try {
    if (!globalThis.localStorage) return null;
    return normalizeApiBaseUrl(localStorage.getItem(LOCAL_DEV_API_BASE_URL_STORAGE_KEY));
  } catch (_error) {
    return null;
  }
}

export async function isLocalDevModeEnabled() {
  const chromeMode = await readChromeStorageMode();
  if (chromeMode !== null) return chromeMode;

  const localStorageMode = readLocalStorageMode();
  if (localStorageMode !== null) return localStorageMode;

  return LOCAL_DEV_MODE_DEFAULT;
}

export async function getLocalDevApiBaseUrl() {
  const chromeApiBaseUrl = await readChromeStorageApiBaseUrl();
  if (chromeApiBaseUrl !== null) return chromeApiBaseUrl;

  return readLocalStorageApiBaseUrl();
}

export function getLocalDevApiBaseUrlSync() {
  return readLocalStorageApiBaseUrl();
}

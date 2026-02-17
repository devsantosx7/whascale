export const LOCAL_DEV_MODE_DEFAULT = false;
export const LOCAL_DEV_MODE_STORAGE_KEY = "LOCAL_DEV_MODE";

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

export async function isLocalDevModeEnabled() {
  const chromeMode = await readChromeStorageMode();
  if (chromeMode !== null) return chromeMode;

  const localStorageMode = readLocalStorageMode();
  if (localStorageMode !== null) return localStorageMode;

  return LOCAL_DEV_MODE_DEFAULT;
}

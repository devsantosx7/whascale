# Local Dev (Mock API + liberações locais)

## 1) Ativar modo local da extensão
No console da página do WhatsApp Web (`https://web.whatsapp.com`):

```js
localStorage.setItem("LOCAL_DEV_MODE", "true");
```

Ou no `chrome.storage.local` (via service worker/background da extensão):

```js
chrome.storage.local.set({ LOCAL_DEV_MODE: true });
```

## 2) Subir Mock API local

```bash
node scripts/local-mock-api.js
```

Por padrão sobe em `http://localhost:4010`.

## 3) Conectar a extensão na API local
No console do WhatsApp Web:

```js
localStorage.setItem("LOCAL_DEV_API_BASE_URL", "http://localhost:4010");
```

Depois recarregue a aba do WhatsApp Web.

## 4) O que já está liberado localmente
- Login/validação com usuário premium mockado.
- Rotas de exportação XLSX.
- Conversão de áudio e domSelector mockados no próprio bundle local.
- Fallback: se uma rota `/api/*` não estiver no mock interno, a extensão tenta chamar `LOCAL_DEV_API_BASE_URL`.

## 5) Desativar

```js
localStorage.setItem("LOCAL_DEV_MODE", "false");
localStorage.removeItem("LOCAL_DEV_API_BASE_URL");
```

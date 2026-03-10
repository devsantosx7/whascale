# Local Dev / Mock API (WhaScale)

Este projeto já suporta **Mock API local** e **liberação premium local** para teste.

## 1) Como ativar o modo local

No contexto da extensão (Service Worker ou Console da página do WhatsApp), rode:

```js
chrome.storage.local.set({ LOCAL_DEV_MODE: true })
```

Depois recarregue a extensão e a aba do WhatsApp Web.

Para desativar:

```js
chrome.storage.local.set({ LOCAL_DEV_MODE: false })
```

## 2) O que é mockado no modo local

Quando `LOCAL_DEV_MODE=true`, a extensão intercepta chamadas de rede (`fetch` e `XMLHttpRequest`) e responde localmente para rotas de autenticação e utilitários, incluindo:

- `/api/auth/login-bearer/`
- `/api/auth/validation/`
- `/api/services/initial-data/:id`
- `/api/urls/install/:id`
- `/api/urls/uninstall/:id`
- `/api/urls/notes/:id`
- `/api/audio/convert-ptt-base64`
- `/extend/domSelector.json`
- `/api/XLSX/*`

Além disso, as respostas de auth retornam usuário com `user_premium: true` para liberar funcionalidades localmente.

## 3) Suporte para outro domínio (cliente)

As rotas mockadas são reconhecidas **por caminho (pathname)**, então você pode testar em outro domínio sem depender dos domínios padrão da Wascript.

## 4) Dica rápida de validação

Com modo local ativado, teste no console:

```js
fetch('https://qualquer-dominio.com/api/auth/validation/', {
  method: 'POST',
  body: JSON.stringify({ bearer_token: 'teste', user_id: 'u1' })
}).then(r => r.json()).then(console.log)
```

Você deve receber `is_premium: true` e dados de usuário local.

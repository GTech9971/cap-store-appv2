# CapStoreApp v2

電子部品管理アプリをtauri, react/ts, ionicで構築

## .env

```text
VITE_APP_API_URL=http://localhost:5000
VITE_APP_ENABLE_API_MOCKING=false

VITE_APP_AKIZUKI_URL=https://akizukidenshi.com
VITE_APP_LOCATIONS_DESK_ID=L-000001(例)
VITE_APP_LOCATIONS_CABINET_ID=L-000002(例)

VITE_APP_OKTA_ISSUER=XXXX
VITE_APP_OKTA_CLIENTID=XXXX
VITE_APP_OKTA_REDIRECTURI=XXXX
```

Windowsは`http://tauri.localhost`
Macは`tauri://localhost`

## MSW

```bash
npm i msw --save-dev
```

```bash
npx msw init .\public\
```

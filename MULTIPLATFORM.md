# LifeOS Hub — Guia Multiplataforma

> 👶 **Primeira vez? Nunca compilou um app antes?**
> Veja o guia detalhado passo a passo (explicado do zero):
> **👉 [COMO_INSTALAR_NO_CELULAR.md](./COMO_INSTALAR_NO_CELULAR.md)**

---

Este arquivo é o **guia técnico de referência** para quem já conhece o fluxo.

---

## Plataformas suportadas

| Plataforma | Tecnologia | Resultado |
|---|---|---|
| Web | Vite | `dist/` |
| Android | Capacitor 8 | Projeto Android Studio |
| iOS | Capacitor 8 | Projeto Xcode |
| Windows | Electron 41 + electron-builder | Instalador NSIS + portátil |
| macOS | Electron 41 + electron-builder | DMG |
| Linux | Electron 41 + electron-builder | AppImage + deb |

---

## Web

```bash
npm run build          # gera dist/ com base "/"
npm run preview        # visualiza o build localmente
```

---

## Android & iOS (Capacitor)

### Pré-requisitos
- Android: Android Studio + Android SDK (API 22+)
- iOS: macOS + Xcode 14+ + CocoaPods

### Primeiro uso

```bash
# Instalar as plataformas nativas (executar apenas uma vez)
npx cap add android
npx cap add ios
```

### Fluxo de desenvolvimento

```bash
# 1. Compilar o app web com caminhos relativos (base "./")
npm run build:mobile

# 2. Sincronizar o build com os projetos nativos
npm run cap:sync

# 3. Abrir no Android Studio / Xcode
npm run cap:android
npm run cap:ios
```

### Atalho (build + sync)

```bash
npm run deploy:android   # build:mobile + cap sync android
npm run deploy:ios       # build:mobile + cap sync ios
```

> **Nota:** A sessão Supabase é salva via `@capacitor/preferences` (NSUserDefaults no iOS, SharedPreferences no Android) em vez de `localStorage`, evitando logout inesperado quando o iOS limpa o armazenamento sob pressão de memória.

---

## Windows / Desktop (Electron)

### Pré-requisitos
- Node.js 18+ com npm
- Para gerar o `.exe` assinado: certificado de assinatura de código (opcional mas recomendado para distribuição)

### Desenvolvimento

```bash
npm run dev:electron     # abre o Electron com hot-reload do Vite
```

### Build de produção

```bash
npm run build:electron   # compila renderer + main + preload
```

### Empacotamento

```bash
npm run package:win      # gera instalador NSIS e portátil em release/
npm run package:mac      # gera DMG em release/
npm run package:linux    # gera AppImage + deb em release/
```

Os pacotes gerados ficam na pasta `release/`.

---

## Recursos de ícone necessários

Crie a pasta `build-resources/` com os seguintes arquivos antes de empacotar:

```
build-resources/
  icon.ico    ← Windows (256×256 multi-resolução)
  icon.icns   ← macOS
  icon.png    ← Linux (512×512)
  entitlements.mac.plist  ← macOS hardened runtime (ver abaixo)
```

Exemplo de `entitlements.mac.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>com.apple.security.cs.allow-jit</key><false/>
    <key>com.apple.security.network.client</key><true/>
  </dict>
</plist>
```

---

## Variável de ambiente `BUILD_TARGET`

Os scripts usam [`cross-env`](https://github.com/kentcdodds/cross-env) para definir
`BUILD_TARGET`, garantindo compatibilidade com Windows, macOS e Linux sem ajustes manuais.

| Valor | Usado em |
|---|---|
| *(vazio/web)* | `npm run build` — build web padrão (`base: "/"`) |
| `native` | `npm run build:mobile` — build Capacitor (`base: "./"`) |
| `electron` | `npm run build:electron` / `dev:electron` — Electron (`base: "./"` + plugin) |

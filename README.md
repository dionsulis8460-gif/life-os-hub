# LifeOS Hub

> App multiplataforma de produtividade pessoal — Rotina, Hábitos, Metas, Finanças, Alimentação e Estudos.

## Rodar localmente (desenvolvimento web)

Veja o guia completo com todos os comandos: **[COMO_RODAR_LOCALMENTE.md](./COMO_RODAR_LOCALMENTE.md)**

Resumo rápido:

```sh
git clone https://github.com/dionsulis8460-gif/life-os-hub.git
cd life-os-hub
npm install
cp .env.example .env   # preencha com suas chaves do Supabase
npm run dev            # abre em http://localhost:5173
```

## Instalar no celular (Android / iOS)

Veja o passo a passo detalhado: **[COMO_INSTALAR_NO_CELULAR.md](./COMO_INSTALAR_NO_CELULAR.md)**

## Multiplataforma (Web / Android / iOS / Electron)

Veja o guia técnico: **[MULTIPLATFORM.md](./MULTIPLATFORM.md)**

## Tecnologias

- **Frontend:** React + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend / DB:** Supabase (PostgreSQL + Auth + Edge Functions)
- **Mobile:** Capacitor 8 (Android & iOS)
- **Desktop:** Electron 41 (Windows / Mac / Linux)


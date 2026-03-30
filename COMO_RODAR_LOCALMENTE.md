# 💻 Como rodar o LifeOS Hub no seu PC (modo web)

> Estes comandos sobem o servidor de desenvolvimento local — você acessa o app pelo navegador em `http://localhost:5173`.
> Não é necessário celular nem Android Studio para isso.

---

## Pré-requisitos

| O que precisa | Onde baixar |
|---|---|
| **Node.js LTS** (v18 ou mais recente) | https://nodejs.org → botão verde "LTS" |
| **Git** | https://git-scm.com/downloads |
| Conta no **Supabase** (grátis) | https://supabase.com |

> ⚠️ **Não coloque a pasta do projeto dentro do Google Drive, OneDrive ou Dropbox.**  
> Use uma pasta local: `C:\Dev\LifeOS` (Windows) ou `~/Dev/LifeOS` (Mac/Linux).

---

## Passo a passo

### 1 — Clonar o repositório

```bash
git clone https://github.com/dionsulis8460-gif/life-os-hub.git
cd life-os-hub
```

### 2 — Instalar as dependências

```bash
npm install
```

> Isso pode demorar 1–2 minutos na primeira vez.

### 3 — Configurar as variáveis de ambiente (Supabase)

```bash
# Copiar o arquivo de exemplo
cp .env.example .env
```

Agora abra o arquivo `.env` no seu editor de texto (Bloco de Notas, VS Code, etc.) e preencha com os dados do seu projeto Supabase:

```
VITE_SUPABASE_PROJECT_ID=cole_aqui_o_project_ref
VITE_SUPABASE_PUBLISHABLE_KEY=cole_aqui_a_anon_key
VITE_SUPABASE_URL=https://SEU_PROJECT_REF.supabase.co
```

> **Onde achar esses valores?**
> 1. Acesse https://supabase.com → entre no seu projeto
> 2. Vá em **Project Settings → API**
> 3. Copie **Project URL** → cole em `VITE_SUPABASE_URL`
> 4. Copie **Project Reference ID** → cole em `VITE_SUPABASE_PROJECT_ID`
> 5. Copie **anon / public** key → cole em `VITE_SUPABASE_PUBLISHABLE_KEY`

### 4 — Subir o servidor de desenvolvimento

```bash
npm run dev
```

Abra o navegador em **http://localhost:5173** 🎉

---

## Resumo rápido (copie e cole tudo de uma vez)

```bash
git clone https://github.com/dionsulis8460-gif/life-os-hub.git
cd life-os-hub
npm install
cp .env.example .env
# ✏️  Edite o arquivo .env com suas chaves do Supabase antes de continuar
npm run dev
```

---

## Configurar login com Google e Apple (OAuth)

O login social usa o Supabase como intermediário. Sem essa configuração, o botão "Continuar com Google/Apple" vai abrir o fluxo OAuth mas voltar com erro.

### Google

**1 — Google Cloud Console**
1. Acesse https://console.cloud.google.com → crie (ou selecione) um projeto
2. Vá em **APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID**
3. Tipo de aplicação: **Web application**
4. Em **Authorized redirect URIs**, adicione:
   ```
   https://SEU_PROJECT_REF.supabase.co/auth/v1/callback
   ```
5. Anote o **Client ID** e o **Client Secret**

**2 — Supabase Dashboard**
1. Acesse seu projeto em https://supabase.com → **Authentication → Providers → Google**
2. Ative (toggle **Enable**) e cole o Client ID e Client Secret do passo anterior
3. Salve

**3 — Redirect URLs (localhost)**
1. Ainda no Supabase → **Authentication → URL Configuration**
2. Em **Redirect URLs**, adicione:
   ```
   http://localhost:5173/**
   ```
3. Confirme que o **Site URL** seja `http://localhost:5173` (para desenvolvimento local)

---

### Apple

1. Acesse https://developer.apple.com → **Certificates, IDs & Profiles → Keys → crie uma key** com "Sign in with Apple"
2. No Supabase → **Authentication → Providers → Apple**: cole o Key ID, Team ID, Client ID (Bundle ID) e o arquivo `.p8`
3. Adicione `http://localhost:5173/**` nas Redirect URLs (mesmo passo acima)

> ⚠️ Apple OAuth exige conta paga no Apple Developer Program (US$ 99/ano).

---

## Outros comandos úteis

| Comando | O que faz |
|---|---|
| `npm run dev` | Sobe o servidor local com hot-reload |
| `npm run build` | Gera a versão de produção em `dist/` |
| `npm run preview` | Visualiza o build de produção localmente |
| `npm test` | Roda os testes automatizados |
| `npm run lint` | Verifica problemas no código |

---

## Problemas comuns

### `npm install` dá erro ENOTDIR ou EPERM
→ A pasta está dentro do Google Drive / OneDrive. Mova para uma pasta local.

### `npm` não é reconhecido
→ Node.js não foi instalado corretamente. Reinstale pelo https://nodejs.org e reinicie o terminal.

### App abre mas dá erro de autenticação / tela em branco
→ Verifique se o arquivo `.env` foi preenchido com as chaves corretas do Supabase.

### Porta 5173 já está em uso
```bash
# Rodar em outra porta
npm run dev -- --port 3000
```

---

## Para instalar no celular

Consulte o guia completo: **[COMO_INSTALAR_NO_CELULAR.md](./COMO_INSTALAR_NO_CELULAR.md)**

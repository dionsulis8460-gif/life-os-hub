# 📱 Como instalar o LifeOS Hub no seu celular — passo a passo completo

> **Não precisa saber programar.** Basta seguir cada passo na ordem. Se algo der errado, consulte a seção [Problemas Comuns](#-problemas-comuns) no final.

> 🚨 **ATENÇÃO — Leia antes de começar:**
> **Nunca coloque a pasta do projeto dentro do Google Drive, OneDrive, Dropbox ou qualquer pasta sincronizada na nuvem.** Esses serviços criam arquivos fantasmas que impedem o `npm install` de funcionar e causam erros do tipo `ENOTDIR` ou `EPERM`. Use sempre uma pasta local, por exemplo: `C:\Dev\LifeOS` no Windows ou `/Users/seu-nome/Dev/LifeOS` no Mac.

---

## Índice

1. [O que você vai precisar](#-o-que-você-vai-precisar)
2. [PARTE 1 — Android (qualquer PC/Mac)](#parte-1--android-qualquer-pcmac)
   - [Passo 1 — Baixar e instalar o Node.js](#passo-1--baixar-e-instalar-o-nodejs)
   - [Passo 2 — Baixar o código do app](#passo-2--baixar-o-código-do-app)
   - [Passo 3 — Instalar as dependências do projeto](#passo-3--instalar-as-dependências-do-projeto)
   - [Passo 4 — Baixar e instalar o Android Studio](#passo-4--baixar-e-instalar-o-android-studio)
   - [Passo 5 — Preparar o celular Android](#passo-5--preparar-o-celular-android)
   - [Passo 6 — Compilar e abrir no Android Studio](#passo-6--compilar-e-abrir-no-android-studio)
   - [Passo 7 — Instalar o app no celular pelo Android Studio](#passo-7--instalar-o-app-no-celular-pelo-android-studio)
3. [PARTE 2 — iPhone/iOS (somente no Mac)](#parte-2--iphoneios-somente-no-mac)
   - [Passo 1 — Pré-requisitos do Mac](#passo-1--pré-requisitos-do-mac)
   - [Passo 2 — Baixar o código e instalar dependências](#passo-2--baixar-o-código-e-instalar-dependências)
   - [Passo 3 — Instalar o Xcode e o CocoaPods](#passo-3--instalar-o-xcode-e-o-cocoapods)
   - [Passo 4 — Preparar o iPhone](#passo-4--preparar-o-iphone)
   - [Passo 5 — Compilar e abrir no Xcode](#passo-5--compilar-e-abrir-no-xcode)
   - [Passo 6 — Instalar no iPhone pelo Xcode](#passo-6--instalar-no-iphone-pelo-xcode)
4. [Problemas Comuns](#-problemas-comuns)
   - [ENOTDIR / pasta no Google Drive](#-enotdir-not-a-directory-ou-eperm-operation-not-permitted-ao-rodar-npm-install)
   - [npm não reconhecido](#-npm-command-not-found-ou-npm-não-é-reconhecido)
   - [Android Studio não encontra o celular](#-android-studio-não-encontra-meu-celular)
   - [Gradle sync failed](#-gradle-sync-failed-no-android-studio)
   - [CocoaPods not found](#-cocoapods-not-found-ao-rodar-npx-cap-add-ios)
   - [iPhone não aparece no Xcode](#-iphone-não-aparece-no-xcode)
   - [Untrusted Developer](#-untrusted-developer-ao-abrir-o-app-no-iphone)
   - [App trava ou fica em branco](#-o-app-trava-ou-fica-em-branco)

---

## 🛒 O que você vai precisar

### Para Android
| Item | Obrigatório? | Custo |
|------|-------------|-------|
| Computador (Windows, Mac ou Linux) | ✅ Sim | — |
| Celular Android (versão 5.0+) | ✅ Sim | — |
| Cabo USB do celular | ✅ Sim | — |
| Node.js (programa gratuito) | ✅ Sim | Grátis |
| Android Studio (programa gratuito) | ✅ Sim | Grátis |
| Conta Google / Play Store | ❌ Não | — |

### Para iPhone (iOS)
| Item | Obrigatório? | Custo |
|------|-------------|-------|
| **Mac** (MacBook, iMac, Mac Mini) | ✅ Sim | — |
| iPhone com iOS 16+ | ✅ Sim | — |
| Cabo USB/Lightning/USB-C do iPhone | ✅ Sim | — |
| Xcode (App Store) | ✅ Sim | Grátis |
| Apple ID (conta Apple gratuita) | ✅ Sim | Grátis |
| Conta de Desenvolvedor Apple paga | ❌ Não (só para publicar na App Store) | — |

> ⚠️ **iOS sem Mac não é possível.** A Apple exige obrigatoriamente um Mac + Xcode para compilar apps iOS.

---

## PARTE 1 — Android (qualquer PC/Mac)

### Passo 1 — Baixar e instalar o Node.js

Node.js é o programa que vai compilar o código do app.

1. Acesse **https://nodejs.org**
2. Clique no botão verde escrito **"LTS"** (versão estável recomendada)
3. Baixe e execute o instalador
4. Durante a instalação, clique em **Next → Next → Next → Install** (pode aceitar tudo padrão)
5. Quando terminar, abra o **Terminal** (no Windows: pressione `Windows + R`, digite `cmd`, Enter):

```
node --version
```

Deve aparecer algo como `v20.x.x`. Se aparecer, o Node.js está instalado. ✅

---

### Passo 2 — Baixar o código do app

Você tem duas opções:

**Opção A — Baixar como ZIP (mais fácil)**

1. Acesse https://github.com/dionsulis8460-gif/life-os-hub
2. Clique no botão verde **"< > Code"**
3. Clique em **"Download ZIP"**
4. Extraia o ZIP em uma pasta **local** (fora do Google Drive / OneDrive / Dropbox):
   - ✅ Windows: `C:\Dev\LifeOS` (crie essa pasta primeiro se não existir)
   - ✅ Mac/Linux: `/Users/seu-nome/Dev/LifeOS`
   - ❌ NÃO use: `G:\Meu Drive\...` ou `C:\Users\...\OneDrive\...`

> ⚠️ **Por quê não usar o Google Drive?** O Google Drive cria arquivos "fantasma" de sincronização na pasta. Quando o `npm install` tenta criar a pasta `node_modules`, encontra esses arquivos no lugar e trava com erro `ENOTDIR`. Isso não tem como ser consertado sem mover a pasta.

**Opção B — Usar Git (mais profissional)**

Se quiser usar Git, instale em **https://git-scm.com** e execute:
```bash
git clone https://github.com/dionsulis8460-gif/life-os-hub.git
cd life-os-hub
```

---

### Passo 3 — Instalar as dependências do projeto

Abra o **Terminal** (ou Prompt de Comando no Windows) dentro da pasta do projeto.

> 💡 **Dica para Windows:** Abra a pasta no Explorer, clique na barra de endereço, digite `cmd` e pressione Enter. O terminal já abre na pasta certa.

Execute os comandos abaixo **um de cada vez**:

```bash
# Instala todas as bibliotecas do projeto (pode demorar alguns minutos)
npm install
```

Aguarde aparecer algo como `added 1234 packages`. ✅

```bash
# Adiciona a plataforma Android ao projeto (execute apenas UMA VEZ)
npx cap add android
```

> ⚠️ Se aparecer erro dizendo que a pasta `android` já existe, pode ignorar e seguir.

---

### Passo 4 — Baixar e instalar o Android Studio

O Android Studio é o programa da Google para compilar apps Android.

1. Acesse **https://developer.android.com/studio**
2. Clique em **"Download Android Studio"**
3. Instale normalmente (Next → Next → Install)
4. Na primeira abertura, o Android Studio vai mostrar um assistente de configuração:
   - Escolha **"Standard"** quando perguntar o tipo de instalação
   - Aceite as licenças clicando em **"Accept"** para cada uma
   - Clique em **"Finish"** e aguarde o download do SDK (pode demorar 10-20 minutos)

> 💡 O Android Studio vai baixar o Android SDK automaticamente. Não precisa fazer mais nada.

---

### Passo 5 — Preparar o celular Android

Você precisa ativar o **Modo Desenvolvedor** no seu celular para instalar apps pelo computador.

1. Abra **Configurações** no celular
2. Vá em **Sobre o telefone** (ou "Sobre o dispositivo")
3. Procure **"Número do build"** (ou "Versão de compilação")
4. **Toque 7 vezes seguidas** nessa linha
5. Vai aparecer: _"Você agora é um desenvolvedor"_ 🎉
6. Volte para **Configurações → Sistema → Opções do desenvolvedor**
7. Ative **"Depuração USB"**
8. Conecte o celular no computador com o cabo USB
9. No celular vai aparecer um pop-up perguntando: _"Permitir depuração USB?"_
10. Toque em **"Permitir"** (pode marcar "Sempre permitir deste computador")

> 💡 Se não aparecer "Opções do desenvolvedor", alguns celulares escondem diferente. Pesquise no Google: `"ativar modo desenvolvedor [modelo do seu celular]"`.

---

### Passo 6 — Compilar e abrir no Android Studio

No terminal, dentro da pasta do projeto, execute:

```bash
# Compila o app e sincroniza com o projeto Android
npm run deploy:android
```

Aguarde terminar (pode demorar 1-3 minutos). Você vai ver:
```
✓ built in X.XXs
✔ Copying web assets from dist to android/app/src/main/assets/public
✔ Syncing Android project
```

Agora abra o Android Studio:

```bash
# Abre o projeto no Android Studio
npm run cap:android
```

O Android Studio vai abrir com o projeto. Aguarde aparecer a mensagem **"Gradle sync finished"** na barra de baixo (pode demorar alguns minutos na primeira vez).

---

### Passo 7 — Instalar o app no celular pelo Android Studio

1. Verifique se seu celular aparece no menu suspenso no topo do Android Studio (onde está escrito o nome do dispositivo)
   - Deve aparecer o nome do seu celular, por exemplo: _"Samsung Galaxy S21"_
   - Se aparecer _"No devices"_, verifique se o cabo está conectado e a depuração USB está ativa

2. Clique no botão ▶️ **verde (Run)** na barra de ferramentas do Android Studio

3. O Android Studio vai compilar e instalar o app no seu celular automaticamente

4. O app **LifeOS Hub** vai aparecer no seu celular em alguns minutos! 🎉

> 💡 **Na primeira vez**, o Android Studio precisa baixar o Gradle, o que pode demorar 5-10 minutos. Da segunda vez em diante é bem mais rápido.

---

## PARTE 2 — iPhone/iOS (somente no Mac)

> ⚠️ **Lembrete:** Você PRECISA de um Mac. Não é possível compilar para iOS no Windows ou Linux.

---

### Passo 1 — Pré-requisitos do Mac

Abra o **Terminal** (CMD + Espaço, digite "Terminal", Enter) e verifique o Node.js:

```bash
node --version
```

Se não tiver instalado, siga o [Passo 1 do Android](#passo-1--baixar-e-instalar-o-nodejs) acima.

---

### Passo 2 — Baixar o código e instalar dependências

Siga o [Passo 2](#passo-2--baixar-o-código-do-app) e o [Passo 3](#passo-3--instalar-as-dependências-do-projeto) da seção Android acima, mas no final execute também:

```bash
# Adiciona a plataforma iOS ao projeto (execute apenas UMA VEZ)
npx cap add ios
```

---

### Passo 3 — Instalar o Xcode e o CocoaPods

**Instalar o Xcode:**
1. Abra a **App Store** no seu Mac
2. Pesquise por **"Xcode"**
3. Clique em **"Obter"** e aguarde o download (pode ter mais de 10 GB — demora bastante)
4. Após instalar, abra o Xcode pelo menos uma vez para aceitar os termos de licença

**Instalar o CocoaPods** (gerenciador de dependências do iOS):

No Terminal:
```bash
sudo gem install cocoapods
```

Vai pedir sua senha do Mac (a mesma do login). Digite e pressione Enter (a senha não aparece na tela — isso é normal).

Aguarde a instalação terminar. ✅

---

### Passo 4 — Preparar o iPhone

1. Conecte o iPhone no Mac com o cabo
2. No iPhone, vai aparecer: _"Confiar neste computador?"_
3. Toque em **"Confiar"** e digite o código do iPhone
4. Abra o **Xcode** no Mac → no menu superior vá em **Window → Devices and Simulators**
5. Seu iPhone deve aparecer na lista

**Configurar sua conta Apple no Xcode:**
1. No Xcode, vá em **Xcode → Settings** (ou Preferences)
2. Clique na aba **Accounts**
3. Clique no **+** embaixo à esquerda
4. Escolha **Apple ID** e faça login com seu Apple ID (conta gratuita)

---

### Passo 5 — Compilar e abrir no Xcode

No Terminal, dentro da pasta do projeto:

```bash
# Compila o app e sincroniza com o projeto iOS
npm run deploy:ios
```

Aguarde terminar. Em seguida:

```bash
# Abre o projeto no Xcode
npm run cap:ios
```

No Xcode, aguarde o projeto carregar completamente.

**Configurar o Team (assinatura do app):**
1. No Xcode, clique em **"App"** na lista à esquerda (o item com ícone de pasta azul)
2. Clique na aba **Signing & Capabilities**
3. Em **Team**, selecione seu nome (Apple ID)
4. Se aparecer um aviso vermelho sobre "Bundle Identifier", clique em **"Try Again"** ou mude o Bundle ID para algo único como `com.seunome.lifeoshub`

---

### Passo 6 — Instalar no iPhone pelo Xcode

1. No menu suspenso de dispositivos no topo do Xcode, selecione **seu iPhone**
2. Clique no botão ▶️ **(Run)**
3. O Xcode vai compilar e instalar o app no iPhone

**Se aparecer erro "Untrusted Developer":**
1. No iPhone vá em **Configurações → Geral → VPN e Gerenciamento de Dispositivo**
2. Toque no seu Apple ID/e-mail
3. Toque em **"Confiar em [seu email]"**
4. Tente executar o app novamente no Xcode

O **LifeOS Hub** vai aparecer na tela inicial do seu iPhone! 🎉

---

## 🔄 Atualizar o app no futuro

Sempre que você mudar o código e quiser atualizar o app no celular:

**Android:**
```bash
npm run deploy:android
# Depois clique em ▶️ Run no Android Studio
```

**iOS:**
```bash
npm run deploy:ios
# Depois clique em ▶️ Run no Xcode
```

---

## 🆘 Problemas Comuns

### ❌ "ENOTDIR: not a directory" ou "EPERM: operation not permitted" ao rodar `npm install`

**Causa:** O projeto está dentro de uma pasta sincronizada com **Google Drive, OneDrive ou Dropbox**. Esses serviços criam arquivos de espaço reservado ("placeholders") na pasta, e o npm não consegue criar a estrutura `node_modules` por cima deles.

**Solução — mova a pasta do projeto para fora da nuvem:**

1. Feche o terminal / Prompt de Comando
2. Crie uma nova pasta local, por exemplo: `C:\Dev\LifeOS`
   - Pressione `Windows + E` para abrir o Explorador de Arquivos
   - Navegue até o disco `C:`
   - Clique com o botão direito → **Novo → Pasta** → nomeie `Dev`
   - Dentro de `Dev`, crie outra pasta `LifeOS`
3. Copie (ou extraia novamente) todos os arquivos do projeto para `C:\Dev\LifeOS`
4. Delete a pasta `node_modules` se existir dentro da pasta copiada (ela estava corrompida)
5. Abra o terminal nessa nova pasta e execute novamente:
   ```cmd
   npm install
   ```

> 💡 **Dica:** Se quiser manter uma cópia no Google Drive para backup, só copie a pasta de volta para o Drive **depois** de terminar toda a instalação. Nunca desenvolva de dentro da pasta sincronizada.

---


### ❌ "npm: command not found" ou "'npm' não é reconhecido"
**Solução:** O Node.js não foi instalado corretamente. Baixe e instale novamente em https://nodejs.org (versão LTS). Reinicie o terminal após instalar.

---

### ❌ "Android Studio não encontra meu celular"
**Soluções a tentar:**
1. Troque o cabo USB (cabos de carregamento baratos às vezes não transmitem dados)
2. No celular, quando conectar o cabo, puxe a barra de notificações e toque na notificação USB → escolha **"Transferência de arquivos"** (MTP)
3. Verifique se a Depuração USB está ativada (Passo 5)
4. Tente uma porta USB diferente no computador
5. Reinstale os drivers do celular no Windows (pesquise: `"driver ADB [seu modelo]"`)

---

### ❌ "Gradle sync failed" no Android Studio
**Solução:**
1. No Android Studio, vá em **File → Invalidate Caches → Invalidate and Restart**
2. Aguarde o Android Studio reiniciar e sincronizar novamente
3. Se ainda falhar, verifique sua conexão com a internet (o Gradle precisa baixar arquivos)

---

### ❌ "CocoaPods not found" ao rodar `npx cap add ios`
**Solução:**
```bash
sudo gem install cocoapods
pod --version   # deve mostrar algo como 1.14.x
```

---

### ❌ iPhone não aparece no Xcode
**Soluções:**
1. Desbloqueie o iPhone antes de conectar
2. Aceite o pop-up "Confiar neste computador" no iPhone
3. Tente outro cabo (preferencialmente o cabo original Apple)
4. Reinicie o Xcode
5. Reinicie o iPhone

---

### ❌ "Untrusted Developer" ao abrir o app no iPhone
**Solução:** Vá em **Configurações → Geral → VPN e Gerenciamento de Dispositivo**, toque no seu email/Apple ID e toque em **"Confiar"**.

---

### ❌ Erro ao rodar `npm run deploy:android` com mensagem de "BUILD_TARGET"
O projeto usa `cross-env` para garantir compatibilidade com Windows, Mac e Linux.  
Verifique se rodou `npm install` antes. Se ainda der erro, rode novamente:
```bash
npm install
npm run deploy:android
```


### ❌ "O app trava ou fica em branco"
**Solução:**
1. Verifique se o arquivo `.env` existe na pasta do projeto com as variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`
2. Se não tiver, copie o `.env.example` e preencha com suas credenciais do Supabase

---

## 💬 Dúvidas?

Se travar em algum passo, abra uma Issue no repositório descrevendo:
- Qual sistema operacional você usa (Windows 10/11, macOS, Linux)
- Qual celular você tem (marca e modelo)
- O erro completo que apareceu no terminal

---

> 📖 Para referência técnica completa (builds avançados, empacotamento para Windows, etc.) veja [MULTIPLATFORM.md](./MULTIPLATFORM.md).

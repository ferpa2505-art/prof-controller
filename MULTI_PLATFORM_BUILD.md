# 📱 ProF Controller - Build Multiplataforma (iOS, Android, PCs)

## 🎯 Plataformas Suportadas

| Plataforma | Formato | Instalação | Dificuldade |
|-----------|---------|-----------|------------|
| 🪟 **Windows** | .exe | Clica 2x | ⭐ Muito Fácil |
| 🍎 **macOS** | .dmg | Clica 2x | ⭐ Muito Fácil |
| 🐧 **Linux** | .AppImage / .deb | Clica 2x | ⭐ Muito Fácil |
| 📱 **Android** | .apk / Play Store | Instala app | ⭐⭐ Fácil |
| 🍎 **iOS** | .ipa / App Store | Instala app | ⭐⭐⭐ Médio |
| 🌐 **Web** | PWA | Navegador/Install | ⭐ Muito Fácil |

---

## 🚀 Instalação Inicial (Uma Vez)

### 1️⃣ Pré-requisitos Globais

```bash
# Windows
choco install nodejs -y
choco install git -y

# macOS
brew install nodejs git

# Linux (Ubuntu/Debian)
sudo apt-get install nodejs npm git
```

### 2️⃣ Clone o Repositório

```bash
git clone https://github.com/ferpa2505-art/prof-controller.git
cd prof-controller
npm install
```

### 3️⃣ Instale Ferramentas Específicas

#### Para iOS (macOS apenas)
```bash
# Instale Xcode Command Line Tools
xcode-select --install

# Instale CocoaPods (gerenciador de dependências iOS)
sudo gem install cocoapods
```

#### Para Android (Todas as plataformas)
```bash
# 1. Baixe Android Studio: https://developer.android.com/studio
# 2. Instale (próximo, próximo, concluir)
# 3. Abra Android Studio e deixe instalar SDKs (vai levar tempo)
# 4. Após terminar, configure variáveis de ambiente:

# Windows (PowerShell Admin)
[Environment]::SetEnvironmentVariable("ANDROID_HOME", "C:\Users\$env:USERNAME\AppData\Local\Android\Sdk", "User")

# macOS/Linux
echo 'export ANDROID_HOME=$HOME/Library/Android/Sdk' >> ~/.zshrc
source ~/.zshrc
```

---

## 📦 Builds Para Cada Plataforma

### 🪟 Windows (.exe)

```bash
npm run electron-build-win
```

✅ Resultado: `release/ProF Controller Setup 1.0.0.exe`  
⏱️ Tempo: ~5 min  
💾 Tamanho: ~150MB  
📤 Enviar para testadores  

---

### 🍎 macOS (.dmg)

```bash
npm run electron-build-mac
```

✅ Resultado: `release/ProF Controller 1.0.0.dmg`  
⏱️ Tempo: ~5 min  
💾 Tamanho: ~160MB  

---

### 🐧 Linux (.AppImage + .deb)

```bash
npm run electron-build-linux
```

✅ Resultado: `release/ProF Controller-1.0.0.AppImage` + `.deb`  
⏱️ Tempo: ~5 min  
💾 Tamanho: ~170MB  

---

### 📱 Android (.apk + Play Store)

#### Opção 1: Gerar APK Local

```bash
# Setup inicial (uma vez)
npm run capacitor:add-android

# Abra o Android Studio
npm run capacitor:open-android
```

No Android Studio:
1. Menu: **Build** → **Build Bundle / APK**
2. Escolha **APK**
3. Clique em **Build**
4. Arquivo fica em: `android/app/release/app-release.apk`

#### Opção 2: APK Assinado (para Google Play)

```bash
# 1. Crie keystore (assinatura)
keytool -genkey -v -keystore prof-controller-key.keystore \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias prof-controller

# 2. Configure em android/app/build.gradle
# (Vou gerar um script pra isso)

# 3. Build final
npm run capacitor:build-android
```

---

### 🍎 iOS (.ipa + App Store)

⚠️ **Requer Mac + Xcode + Apple Developer Account ($99/ano)**

```bash
# Setup inicial (uma vez)
npm run capacitor:add-ios

# Abra Xcode
npm run capacitor:open-ios
```

No Xcode:
1. Selecione **ProFController** no painel esquerdo
2. Tab **Signing & Capabilities**
3. Escolha seu **Team**
4. Menu: **Product** → **Build** ou **Archive**
5. Para App Store: **Archive** → **Distribute**

---

## 🌐 Web PWA (Navegador)

Já funciona em: https://ferpa2505-art.github.io/prof-controller/

Usuários podem clicar no ícone **Instalar** do navegador para adicionar à tela inicial (funciona em mobile também).

---

## 📊 Fluxo Simplificado Para Testadores

### Cenário 1: Testadores no Windows
```bash
npm run electron-build-win
# Envie: release/ProF Controller Setup 1.0.0.exe
```

### Cenário 2: Testadores em Android
```bash
npm run capacitor:open-android
# (Build APK no Android Studio)
# Envie: app-release.apk via email/WhatsApp
```

### Cenário 3: Testadores em iPhone
```bash
npm run capacitor:open-ios
# (Build IPA no Xcode)
# Envie via TestFlight ou App Store
```

### Cenário 4: Qualquer Dispositivo (Mobile + Desktop)
Envie o link: https://ferpa2505-art.github.io/prof-controller/

Funciona:
- ✅ No navegador
- ✅ Instalável como app (ícone + tela inicial)
- ✅ Offline
- ✅ Notificações push
- ✅ 100% privado

---

## 🔧 Troubleshooting

### "Android SDK not found"
```bash
# Abra Android Studio e deixe instalar SDKs automaticamente
# Ou configure manualmente:
export ANDROID_HOME="$HOME/Library/Android/Sdk"  # macOS/Linux
# ou Configure via Environment Variables no Windows
```

### "Xcode not installed"
```bash
xcode-select --install
```

### "CocoaPods error"
```bash
sudo gem install cocoapods
cd ios/App
pod install
```

### "APK muito grande?"
Normal! Inclui Chromium (~50MB)

---

## 📈 Próximas Fases

- **Fase 1** ✅ PWA Web (pronto)
- **Fase 2** ✅ Desktop (Electron - pronto)
- **Fase 3** 🔄 Android (Capacitor)
- **Fase 4** 🔄 iOS (Capacitor)
- **Fase 5** 🚀 App Stores (Google Play + Apple Store)

---

## 💡 Dica Profissional

Para desenvolvimento mais rápido:

```bash
# Terminal 1: Servidor
npm start

# Terminal 2: Watch app changes
npm run capacitor:sync

# Terminal 3: Abra o emulador
npm run capacitor:open-android
```

Toda mudança no HTML/CSS/JS aparece automaticamente!

---

## 📝 Versionamento

Sempre que atualizar, incremente:

1. `package.json`: `"version": "X.Y.Z"`
2. `app.js`: `const APP_VERSION = 'X.Y.Z'`
3. Refaça o build

---

Dúvidas? 🚀

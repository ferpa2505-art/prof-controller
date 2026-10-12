# 🚀 QuickStart - Gerar Instaladores

## Escolha seu Sistema

### 🪟 Windows
```bash
npm install
npm run electron-build-win
```
Resultado: `release/ProF Controller Setup 1.0.0.exe` (pronto para enviar!)

### 🍎 macOS
```bash
npm install
npm run electron-build-mac
```
Resultado: `release/ProF Controller 1.0.0.dmg`

### 🐧 Linux
```bash
npm install
npm run electron-build-linux
```
Resultado: `release/ProF Controller-1.0.0.AppImage`

### 📱 Android
```bash
npm install
npm run capacitor:add-android
npm run capacitor:open-android
```
No Android Studio: Build > Build Bundle/APK

### 🍎 iOS (macOS only)
```bash
npm install
npm run capacitor:add-ios
npm run capacitor:open-ios
```
No Xcode: Product > Archive

### 🌐 Web (Já está pronto!)
https://ferpa2505-art.github.io/prof-controller/

---

## ⏱️ Tempo Estimado

| Plataforma | Tempo | Tamanho |
|-----------|------|---------|
| Windows | 5 min | 150 MB |
| macOS | 5 min | 160 MB |
| Linux | 5 min | 170 MB |
| Android | 10 min | 80 MB |
| iOS | 15 min | 100 MB |
| Web | 2 min | 2 MB |

---

## 📤 Enviar para Testadores

### Opção 1: Link Web (Recomendado - Simples)
Envie: https://ferpa2505-art.github.io/prof-controller/

Funciona em qualquer dispositivo, qualquer navegador!

### Opção 2: Arquivo Instalador
- Windows: `release/ProF Controller Setup 1.0.0.exe`
- macOS: `release/ProF Controller 1.0.0.dmg`
- Linux: `release/ProF Controller-1.0.0.AppImage`
- Android: `android/app/release/app-release.apk`

### Opção 3: Google Drive / OneDrive
Upload do arquivo .exe/.dmg/.apk e compartilhe o link

### Opção 4: GitHub Releases
1. Crie uma Release no GitHub
2. Upload os arquivos
3. Compartilhe o link de download

---

## ✅ Checklist Antes de Enviar

- [ ] Versão atualizada (app.js + package.json)
- [ ] Buildou sem erros
- [ ] Testou o instalador/app
- [ ] Arquivo não corrompido (download e instale)
- [ ] App abre corretamente
- [ ] Dados locais funcionam (offline)

---

## 🎯 Dica: Menu Interativo

Para um menu fácil:

**Windows:**
```bash
BUILD_ALL.bat
```

**macOS/Linux:**
```bash
chmod +x BUILD_ALL.sh
./BUILD_ALL.sh
```

---

Pronto! Agora você tem um app multiplataforma! 🎉

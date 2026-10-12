# 📦 ProF Controller - Guia de Geração de Instaladores

## 🚀 Instalação Rápida (Para Testas)

### Pré-requisitos
- Node.js 14+ instalado (baixar em https://nodejs.org/)
- npm (vem com Node.js)

### Passos

1. **Clone o repositório:**
```bash
git clone https://github.com/ferpa2505-art/prof-controller.git
cd prof-controller
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Gere o instalador para seu sistema:**

#### 🪟 Windows (.exe)
```bash
npm run electron-build-win
```
O instalador fica em: `release/ProF Controller Setup 1.0.0.exe`

#### 🍎 macOS (.dmg)
```bash
npm run electron-build-mac
```
O instalador fica em: `release/ProF Controller 1.0.0.dmg`

#### 🐧 Linux (.AppImage + .deb)
```bash
npm run electron-build-linux
```
Os instaladores ficam em: `release/ProF Controller-1.0.0.AppImage` e `.deb`

---

## 📋 Alternativa: Build Multiplataforma

Para gerar instaladores para TODAS as plataformas de uma vez:
```bash
npm run electron-build
```

---

## 🔄 Fluxo de Desenvolvimento

Se quer testar mudanças enquanto desenvolve:

```bash
npm run electron-dev
```

Isso abre dois processos:
1. Servidor local (http://localhost:8000)
2. App Electron que recarrega automaticamente

---

## 📤 Compartilhando com Testadores

1. **Gere o instalador** para Windows (mais comum):
   ```bash
   npm run electron-build-win
   ```

2. **Pegue o arquivo** em:
   ```
   release/ProF Controller Setup 1.0.0.exe
   ```

3. **Envie para os testadores** via:
   - 📧 Email
   - ☁️ Google Drive / OneDrive
   - 🌐 GitHub Releases
   - 💾 Pendrive

4. **Testadores instalam** apenas executando o `.exe`
   - Sem precisar de Node.js
   - Sem precisar de linha de comando
   - Como um programa normal

---

## 🎯 Características do Instalador

✅ **Instalação simples** - Clica, aceita, instala  
✅ **Atalho no Desktop** - Lança direto da área de trabalho  
✅ **Atalho no Menu Iniciar** - Encontra fácil  
✅ **Desinstalador** - Remove completamente  
✅ **Atualização automática** - (Opcional, pode adicionar depois)  
✅ **100% Offline** - Funciona sem internet  
✅ **Dados privados** - Tudo fica no computador do usuário  

---

## 🆘 Troubleshooting

### "npm: command not found"
→ Instale Node.js de https://nodejs.org/

### "Electron não encontrado"
→ Execute: `npm install`

### "Build failed - missing dependencies"
→ Execute: `npm install --save-dev electron electron-builder`

### Instalador muito grande?
→ Normal! Inclui o Chromium do Electron (~150MB)

---

## 📊 Tamanhos Aproximados

| Instalador | Tamanho |
|-----------|---------|
| Windows (.exe) | ~150MB |
| macOS (.dmg) | ~160MB |
| Linux (.AppImage) | ~170MB |

---

## 🔐 Segurança

O instalador é **100% seguro**:
- Sem malware (feito por você, em seu computador)
- Sem acesso à internet necessário
- Todos os dados ficam locais (IndexedDB)
- Não coleta telemetria

---

## 📝 Versioning

Toda mudança, atualize:

1. `package.json`: `"version": "X.Y.Z"`
2. `app.js`: `const APP_VERSION = 'X.Y.Z'`
3. Refaça o build

---

Dúvidas? Me chama! 🚀

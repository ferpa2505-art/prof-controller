# 🚀 SETUP RÁPIDO - Google Cloud + Cloudflare (15 MINUTOS)

**Objetivo**: Ter a URL do Worker pronta para usar no app

---

## 📌 PARTE 1: GOOGLE CLOUD (5 minutos)

### Passo 1.1: Abrir Google Cloud Console

```
1. Abra o navegador
2. Cole: https://console.cloud.google.com/
3. Faça login com sua conta Google (Gmail)

✅ Você está na dashboard
```

### Passo 1.2: Criar Projeto

```
1. Clique em: "Selecionar projeto" (canto superior esquerdo)
2. Clique em: "NOVO PROJETO"
3. No campo "Nome": Digite "Levia-IA"
4. Clique em: CRIAR
5. Aguarde 3 segundos

✅ Projeto criado!
```

### Passo 1.3: Ativar Vision API

```
1. No menu esquerdo: "APIs e serviços"
2. Depois: "Biblioteca"
3. Procure por: "Vision" (na barra de busca)
4. Clique em: "Cloud Vision API"
5. Clique em: "ATIVAR" (botão azul grande)
6. Aguarde 3 segundos

✅ Vision API ativada!
```

### Passo 1.4: Criar Service Account (Credenciais)

```
1. No menu esquerdo: "APIs e serviços"
2. Depois: "Credenciais"
3. Clique em: "+ CRIAR CREDENCIAIS" (botão azul)
4. Dropdown abre, escolha: "Conta de serviço"
```

**Na tela "Criar conta de serviço":**

```
Campo 1 - Nome:
Digite: levia-ia-service

Campo 2 - ID:
(deixe como está, preenchido automaticamente)

Campo 3 - Descrição:
Digite: Acesso à Vision API para análise de fotos

Clique: "CRIAR E CONTINUAR"
```

**Na tela "Conceder permissões":**

```
1. Clique no campo de busca "Selecione uma função"
2. Digite: Basic
3. Selecione: "Basic Viewer" (mais simples e gratuito)
4. Clique: "CONTINUAR"
```

**Na tela "Criar chave":**

```
1. Certifique-se que "JSON" está selecionado
2. Clique: "CRIAR"
3. Um arquivo baixa automaticamente: levia-ia-service.json

✅ Chave JSON baixada!
```

---

## 📌 PARTE 2: CLOUDFLARE (8 minutos)

### Passo 2.1: Instalar Wrangler

**No PowerShell:**

```powershell
# Instalar Wrangler globalmente
npm install -g wrangler

# Verificar instalação
wrangler --version

# Você verá algo como: wrangler 3.20.0
```

✅ **Wrangler instalado!**

---

### Passo 2.2: Fazer Login Cloudflare

**No PowerShell:**

```powershell
wrangler login
```

✅ **Seu navegador abre automaticamente**
✅ **Clique em "Autorizar" quando pedir**
✅ **Volte para PowerShell**

---

### Passo 2.3: Adicionar Google API Key

**Vá para a pasta do backend:**

```powershell
cd C:\Users\ferpa\.copilot\repos\copilot-worktrees\prof-controller\ferpa2505-art-congenial-journey\backend
```

**Adicione o secret:**

```powershell
wrangler secret put GOOGLE_VISION_API_KEY
```

**O que fazer:**

```
1. Terminal pede: "? Enter the secret value:"
2. Abra: Downloads\levia-ia-service.json (com Bloco de notas)
3. Selecione TUDO: Ctrl+A
4. Copie: Ctrl+C
5. Volte ao PowerShell
6. Cole: Ctrl+V (ou Shift+Insert)
7. Pressione: ENTER
8. Terminal confirma: "✓ Uploaded secret GOOGLE_VISION_API_KEY"
```

✅ **Secret configurado!**

---

### Passo 2.4: Deploy do Worker

**No PowerShell (mesma pasta):**

```powershell
wrangler deploy
```

**Isso vai:**

```
1. Compilar o código
2. Fazer upload para Cloudflare
3. Gerar uma URL
4. Você verá algo como:

   ✓ Uploaded 1 module to Levia-IA
   ✓ Deployed successfully
   
   https://levia-ia-worker.seu-subdomain.workers.dev
```

**COPIE E GUARDE ESSA URL!**

✅ **Worker em produção!**

---

## 📌 PARTE 3: CONFIGURAR NO APP (2 minutos)

### Passo 3.1: Editar .env.local

**Abra:**

```
Arquivo: .env.local (na raiz do projeto)
```

**Adicione/Edite:**

```
EXPO_PUBLIC_WORKER_URL=https://seu-worker.seu-subdomain.workers.dev
```

(Substitua pela URL que copiou acima)

✅ **.env.local atualizado!**

---

### Passo 3.2: Restart App

**No terminal:**

```powershell
expo start --clear
```

**Pressione:**

```
i - para abrir no iOS Simulator
a - para abrir no Android Emulator
w - para web
```

✅ **App reiniciado!**

---

## 🧪 TESTAR SE FUNCIONOU

### Teste 1: No App

```
1. No app, vá para: Prato Análise
2. Clique em: "Capturar foto"
3. Tire uma foto (ou selecione galeria)
4. Na tela de resultado, clique em: "Analisar com IA"
5. Aguarde 2-3 segundos

✅ Se funcionou:
   └─ Mostra: [Frango, Arroz, Feijão, etc.]

❌ Se não funcionou:
   └─ Mostra: Mensagem de erro
   └─ Veja troubleshooting abaixo
```

### Teste 2: Com cURL (Linha de Comando)

**Abra PowerShell e execute:**

```powershell
$url = "https://seu-worker.seu-subdomain.workers.dev"
$body = @{
    userId = "test-user"
    imageBase64 = "iVBORw0KGgoAAAANS" # Imagem fake para teste
    tipo = "prato"
} | ConvertTo-Json

Invoke-RestMethod -Uri $url -Method POST -Body $body -ContentType "application/json"
```

**Você deve receber:**

```json
{
  "sucesso": true,
  "alimentos": [...],
  "totalCalorias": 360,
  "totalProteina": 31
}
```

✅ **Tudo funcionando!**

---

## 🆘 TROUBLESHOOTING

### ❌ Erro: "Cannot GET https://..."

```
Solução:
1. Verifique se .env.local tem EXPO_PUBLIC_WORKER_URL
2. Confirme que a URL está exata (copie de novo)
3. Restart app: expo start --clear
```

### ❌ Erro: "Rate limit exceeded"

```
Solução:
1. É NORMAL! Você usou 3 análises já
2. Espere até amanhã (reset à 00:00)
3. Ou force reset do AsyncStorage:
   
   No app, abra DevTools:
   └─ Limpe AsyncStorage
   └─ Restart app
```

### ❌ Erro: "Vision API disabled"

```
Solução:
1. Volte a console.cloud.google.com
2. Verifique se Vision API está ativada
3. Tente ativar novamente
```

### ❌ Erro: "Invalid credential"

```
Solução:
1. Verifique o JSON que colou
2. Copie TUDO do arquivo levia-ia-service.json
3. Execute novamente: wrangler secret put GOOGLE_VISION_API_KEY
4. Faça deploy novo: wrangler deploy
```

---

## ✅ CHECKLIST FINAL

```
Google Cloud:
[ ] Projeto criado (Levia-IA)
[ ] Vision API ativada
[ ] Service Account criado
[ ] Arquivo JSON baixado (Downloads/)

Cloudflare:
[ ] Wrangler instalado
[ ] Login feito (wrangler login)
[ ] Secret adicionado (wrangler secret put ...)
[ ] Worker deployado (wrangler deploy)
[ ] URL copiada

App:
[ ] .env.local configurado com WORKER_URL
[ ] App reiniciado (expo start --clear)
[ ] Testou no Prato Análise
[ ] Funciona! ✅
```

---

## 📞 PRÓXIMOS PASSOS

1. ✅ Integrar em app/prato/resultado.tsx
2. ✅ Integrar em app/receita/resultado.tsx
3. ✅ Testar com imagens reais
4. ✅ Conectar com CustomRecipesContext

---

**Tempo total**: 15 minutos
**Dificuldade**: ⭐⭐ (Fácil)
**Resultado**: URL pronta para usar! 🚀

# 🔧 Guia Prático: Configurar Google Cloud (PASSO-A-PASSO)

**Tempo estimado**: 15 minutos
**Requisitos**: Conta Google (Gmail)
**Resultado**: Chave JSON pronta para usar

---

## ✅ PASSO 1: Ir para Google Cloud Console

```
1. Abra o navegador
2. Digite: https://console.cloud.google.com/
3. Faça login com sua conta Google (Gmail)

⚠️ Se não tiver conta Google:
   → Crie uma em gmail.com (leva 2 min)
   → Volte para console.cloud.google.com
```

**Você verá uma tela assim:**
```
┌─────────────────────────────────────────────┐
│ Google Cloud Console                        │
│                                             │
│ [Selecionar projeto] ▼                     │
│                                             │
│ Dashboard    APIs & Serviços    Recursos   │
└─────────────────────────────────────────────┘
```

---

## ✅ PASSO 2: Criar um Novo Projeto

**Na tela inicial:**

```
1. Clique em: "Selecionar projeto" (canto superior esquerdo)
2. Uma janela abre
3. Clique em: "NOVO PROJETO"
```

**Na próxima tela:**

```
┌─────────────────────────────────────────────┐
│ Criar projeto                               │
│                                             │
│ Nome do projeto:                            │
│ [Levia-IA                       ]            │
│                                             │
│ Selecionar organização: (opcional)          │
│ [Sem organização                 ▼]         │
│                                             │
│              [ CRIAR ]                      │
└─────────────────────────────────────────────┘
```

**O que fazer:**

```
1. No campo "Nome do projeto", escreva: Levia-IA
2. Deixe "Organização" como está
3. Clique em CRIAR
4. Aguarde 2-3 segundos
```

**Depois que criar:**

```
✓ Você verá: "Projeto Levia-IA criado com sucesso!"
✓ Google automaticamente ativa o projeto
✓ Você volta para a dashboard
```

---

## ✅ PASSO 3: Ativar Vision API

**Agora você está na dashboard do projeto "Levia-IA"**

```
1. No menu esquerdo, clique em: "APIs e serviços"
2. Depois clique em: "Biblioteca"
   (ou digite na barra de busca: "Vision API")
```

**Você verá a tela da "Biblioteca de APIs"**

```
┌─────────────────────────────────────────────┐
│ Pesquisar APIs      [    Vision API   ]    │
├─────────────────────────────────────────────┤
│                                             │
│ Cloud Vision API                            │
│ ⭐⭐⭐⭐ (4.5 estrelas)                        │
│ "Identifica objetos, rostos, texto..."     │
│                                             │
│                  [ ATIVAR ]                 │
└─────────────────────────────────────────────┘
```

**O que fazer:**

```
1. Procure por: "Cloud Vision API"
2. Clique no resultado
3. Uma página abre com detalhes
4. Clique em: "ATIVAR" (botão azul)
5. Aguarde 2-3 segundos
```

**Depois de ativar:**

```
✓ Você verá: "API ativada com sucesso"
✓ Botão muda para: "GERENCIAR"
✓ Você pode fechar essa aba ou ir para próximo passo
```

---

## ✅ PASSO 4: Criar Service Account (Credenciais)

**Agora você precisa criar uma "chave" para que seu app acesse a API**

```
1. No menu esquerdo, clique em: "APIs e serviços"
2. Clique em: "Credenciais"
```

**Você verá uma tela assim:**

```
┌─────────────────────────────────────────────┐
│ Credenciais                                 │
│                                             │
│ [+ CRIAR CREDENCIAIS] ▼                    │
│                                             │
│ Suas credenciais:                           │
│ (vazio inicialmente)                        │
└─────────────────────────────────────────────┘
```

**O que fazer:**

```
1. Clique em: "+ CRIAR CREDENCIAIS"
2. Um menu dropdown abre com 3 opções:
   └─ Chave de API
   └─ Certificado OAuth 2.0
   └─ Conta de serviço  ← ESCOLHA ESTA

3. Clique em: "Conta de serviço"
```

**Próxima tela: "Criar conta de serviço"**

```
┌─────────────────────────────────────────────┐
│ Detalhes da conta de serviço                │
│                                             │
│ Nome:                                       │
│ [levia-ia-service              ]            │
│                                             │
│ ID:                                         │
│ levia-ia-service@levia-ia...google.com      │
│ (preenchido automaticamente)                │
│                                             │
│ Descrição (opcional):                       │
│ [Acesso à Vision API para análise de fotos ]│
│                                             │
│           [ CRIAR E CONTINUAR ]             │
└─────────────────────────────────────────────┘
```

**O que fazer:**

```
1. Campo "Nome": Escreva "levia-ia-service"
2. Deixe o ID como está (preenchido automaticamente)
3. Descrição: "Acesso à Vision API para análise de fotos"
4. Clique em: "CRIAR E CONTINUAR"
```

**Próxima tela: "Conceder permissões de função"**

```
┌─────────────────────────────────────────────┐
│ Conceder esta conta de serviço acesso       │
│ ao projeto (Opcional)                       │
│                                             │
│ Selecione uma função:                       │
│ [Pesquisar função...                    ▼]  │
│                                             │
│ Roles selecionadas:                         │
│ (nenhuma ainda)                             │
│                                             │
│     [ VOLTAR ]  [ CONTINUAR ]               │
└─────────────────────────────────────────────┘
```

**O que fazer:**

```
1. Clique no campo: "Pesquisar função..."
2. Digite: "Basic Viewer"
3. Selecione: "Basic Viewer" (role mais simples)
4. Clique em: "CONTINUAR"
```

**Próxima tela: "Criar chave"**

```
┌─────────────────────────────────────────────┐
│ Criar chave para essa conta de serviço      │
│                                             │
│ Tipo de chave:                              │
│ ○ JSON  ← DEIXE SELECIONADO                │
│ ○ P12                                       │
│                                             │
│     [ VOLTAR ]  [ CRIAR ]                   │
└─────────────────────────────────────────────┘
```

**O que fazer:**

```
1. Deixe "JSON" selecionado (padrão)
2. Clique em: "CRIAR"
3. Aguarde 2-3 segundos
```

**Resultado:**

```
✅ Um arquivo JSON é automaticamente BAIXADO
   Nome: levia-ia-service.json
   Tamanho: ~2.5KB

   Arquivo contém:
   ├─ "type": "service_account"
   ├─ "project_id": "levia-ia-123456"
   ├─ "private_key_id": "abc123..."
   ├─ "private_key": "-----BEGIN RSA PRIVATE KEY-----..."
   ├─ "client_email": "levia-ia-service@..."
   └─ (mais campos)
```

---

## ✅ PASSO 5: Verificar a Chave

**Aonde o arquivo foi baixado?**

```
Windows:
└─ C:\Users\[SEU_USUARIO]\Downloads\levia-ia-service.json

Mac:
└─ /Users/[SEU_USUARIO]/Downloads/levia-ia-service.json

Linux:
└─ ~/Downloads/levia-ia-service.json
```

**Verificar se está OK:**

```
1. Abra: Downloads
2. Procure por: levia-ia-service.json
3. Clique com botão direito > Abrir com > Bloco de notas
4. Você verá um JSON assim:

{
  "type": "service_account",
  "project_id": "levia-ia-abcdef",
  "private_key_id": "1234567890abcdef",
  "private_key": "-----BEGIN RSA PRIVATE KEY-----\n...",
  "client_email": "levia-ia-service@levia-ia-abcdef.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  ...
}
```

✅ **Se você vê isso, está perfeito!**

---

## ✅ PASSO 6: Usar a Chave no Cloudflare Worker

**Agora você tem o arquivo JSON. Precisa adicionar ao Cloudflare:**

```bash
# No terminal/PowerShell, execute:

# 1. Instalar Wrangler (se ainda não tiver)
npm install -g wrangler

# 2. Autenticar
wrangler login

# 3. Na pasta do seu projeto
cd backend

# 4. Adicionar a chave como secret
wrangler secret put GOOGLE_VISION_API_KEY

# 5. Uma janela abrirá pedindo a chave
#    COPIE TUDO do arquivo JSON e COLE lá
#    Depois ENTER

# 6. Deploy
wrangler deploy
```

**Após o deploy:**

```
✅ Você receberá:
   Deployment ID: abc123...
   URL: https://seu-worker.seu-subdomain.workers.dev

   COPIE ESSA URL E GUARDE!
```

---

## ✅ PASSO 7: Configurar no App

**Agora coloque a URL no .env do seu app:**

```bash
# Arquivo: .env.local

EXPO_PUBLIC_WORKER_URL=https://seu-worker.seu-subdomain.workers.dev
```

---

## 🧪 TESTAR SE FUNCIONOU

**Faça um teste rápido com cURL:**

```bash
# Abra PowerShell ou Terminal

# Comando:
curl -X POST https://seu-worker.seu-subdomain.workers.dev `
  -H "Content-Type: application/json" `
  -d '{
    "userId": "test-user",
    "imageBase64": "iVBORw0KGgoAAAANS...",
    "tipo": "prato"
  }'

# Você deve receber:
{
  "sucesso": true,
  "alimentos": [
    {"nome": "Frango", "quantidade": "150g", ...}
  ],
  "totalCalorias": 360,
  "totalProteina": 31
}
```

---

## 🆘 PROBLEMAS COMUNS

### ❌ Problema: "Access Denied" ao ativar Vision API

```
Solução:
1. Vá para: https://console.cloud.google.com/billing
2. Certifique-se de que há um método de pagamento configurado
3. (Google oferece $300/mês grátis para novos usuários)
4. Tente ativar a API novamente
```

### ❌ Problema: "Projeto não criado"

```
Solução:
1. Tente criar novamente
2. Use outro nome: "Levia-App-IA" 
3. Aguarde 5 segundos completos
4. Refresque a página (F5)
```

### ❌ Problema: Não consegue fazer login

```
Solução:
1. Certifique-se de usar conta Google (Gmail)
2. Se tiver 2FA ativado, confirme
3. Tente em modo Privado/Anônimo (Ctrl+Shift+P no Chrome)
4. Limpe cookies: Ctrl+Shift+Delete
```

### ❌ Problema: "Secret put" falha no Wrangler

```
Solução:
1. Certifique-se de ter logado: wrangler login
2. Copie APENAS o conteúdo JSON (sem quotes externas)
3. Cole no terminal quando solicitar
4. Pressione Ctrl+D (Linux/Mac) ou Ctrl+Z + Enter (Windows)
```

---

## ✅ CHECKLIST FINAL

```
[ ] Criou conta Google (Gmail)
[ ] Acessou console.cloud.google.com
[ ] Criou projeto "Levia-IA"
[ ] Ativou Cloud Vision API
[ ] Criou Service Account
[ ] Baixou arquivo levia-ia-service.json
[ ] Instalou Wrangler (npm install -g wrangler)
[ ] Fez wrangler login
[ ] Adicionou secret (wrangler secret put ...)
[ ] Fez deploy (wrangler deploy)
[ ] Copiou URL do Worker
[ ] Configurou WORKER_URL em .env.local
[ ] Testou com cURL (funcionou!)
```

---

## 🎯 Resumo Rápido

| Passo | O que fazer | Tempo |
|-------|-----------|-------|
| 1 | Ir a console.cloud.google.com | 1 min |
| 2 | Criar projeto "Levia-IA" | 2 min |
| 3 | Ativar Vision API | 2 min |
| 4 | Criar Service Account | 3 min |
| 5 | Baixar JSON | 1 min |
| 6 | Instalar Wrangler | 2 min |
| 7 | Deploy Worker | 2 min |
| 8 | Configurar .env | 1 min |
| **Total** | | **16 min** |

---

**Status**: ✅ **Você tem tudo que precisa!**

Próximo: Chamar `wrangler deploy` e ter a URL pronta! 🚀

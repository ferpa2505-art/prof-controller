# ⚡ Quick Start Deploy - 5 Minutos

## 🚀 Deploy Imediato no GitHub Pages

### Passo 1️⃣: Verificar Repositório

```bash
# Confirmar que está no repositório
git status

# Deve mostrar:
# On branch [sua-branch]
# Your branch is up to date with 'origin/...'.
```

### Passo 2️⃣: Fazer Commit Final

```bash
# Adicionar todos os arquivos de deploy
git add package.json DEPLOYMENT.md QUICKSTART_DEPLOY.md .github/workflows/deploy.yml

# Fazer commit
git commit -m "🚀 Deploy: GitHub Pages automation + documentação"

# Push para origin
git push origin HEAD
```

### Passo 3️⃣: Ativar GitHub Pages

1. Abrir **GitHub.com** → seu repositório
2. Ir para **Settings** (⚙️)
3. Esquerda: Clicar **Pages**
4. **Source**: Selecionar **Deploy from a branch**
5. **Branch**: Selecionar seu branch (ex: `ferpa2505-art-notifications-recurrence`)
6. **Folder**: Manter `/root`
7. Clicar **Save**

✅ **GitHub Pages está ativado!**

### Passo 4️⃣: Verificar Workflow

1. Ir para **Actions** (acima dos arquivos)
2. Verificar se há workflow rodando
3. Esperar completar (leva ~1-2 minutos)
4. Deve mostrar ✅ verde

### Passo 5️⃣: Acessar URL

Depois de ~2 minutos, seu app estará em:

```
https://ferpa2505-art.github.io/[repo-name]/
```

Exemplo:
```
https://ferpa2505-art.github.io/prof-controller/
```

---

## ✅ Verificação Pós-Deploy

Abrir seu navegador em: `https://ferpa2505-art.github.io/prof-controller/`

### Checklist:
- [ ] App carrega
- [ ] Dashboard mostra dados
- [ ] Contas funcionam
- [ ] Transações funcionam
- [ ] Investimentos buscam cotação
- [ ] Muda idioma instantaneamente
- [ ] Muda tema sem reload
- [ ] Funciona offline (F12 → Network → Offline)

Se tudo funcionar: **✅ Deploy bem-sucedido!**

---

## 🔧 Alternativa: Deploy em 1 Clique (Vercel)

Se preferir mais simples:

1. Ir para https://vercel.com
2. Login com GitHub
3. Clicar **New Project**
4. Selecionar seu repositório
5. Clicar **Deploy**

**Pronto!** App em `prof-controller.vercel.app`

---

## 📱 Testar no Celular

Depois de deployado:

### Android (Chrome):
1. Abrir `https://[sua-url]` no Chrome
2. Menu (⋮) → **Instalar app**
3. App aparece na home

### iOS (Safari):
1. Abrir `https://[sua-url]` no Safari
2. Compartilhar → **Adicionar à Tela de Início**
3. App aparece na home

---

## 🐛 Troubleshooting Rápido

### "GitHub Pages não aparece"
- Esperar 5 minutos
- Ir em Settings → Pages → checar **Branch** e **Folder**
- Fazer push novamente

### "App não carrega"
- Verificar URL corretamente
- Limpar cache: Ctrl+Shift+Delete
- Recarregar: Ctrl+F5

### "Offline não funciona"
- DevTools (F12) → Application → Service Workers
- Deve mostrar "activated and running"
- Se não: Clicar "Unregister" e recarregar

### "Cotações não atualizam"
- Verificar API keys em Settings
- Testar conexão (botão Testar)
- Verificar DevTools → Network → filtro "api"

---

## 📊 Status do Deploy

| Item | Status |
|------|--------|
| **Código** | ✅ Pronto |
| **GitHub Actions** | ✅ Configurado |
| **GitHub Pages** | ⏳ Ativando... |
| **Domínio Custom** | 🔲 Opcional |
| **HTTPS** | ✅ Automático |
| **Service Worker** | ✅ Ativado |
| **PWA** | ✅ Instalável |

---

## 🎉 Parabéns!

ProF Controller está pronto para produção!

**URLs disponíveis após deploy:**

- 🌐 GitHub Pages: `https://ferpa2505-art.github.io/prof-controller/`
- 🔗 Custom Domain: `https://profcontroller.dev` (se configurado)
- 📱 PWA Instalável: Menu Chrome → Instalar

---

## 📞 Próximos Passos

- [ ] Aguardar ~5 minutos para GitHub Pages ativar
- [ ] Testar app na URL
- [ ] Instalar como PWA (opcional)
- [ ] Compartilhar URL com amigos
- [ ] Coletar feedback
- [ ] Implementar melhorias

---

**Documentação Completa:** [DEPLOYMENT.md](DEPLOYMENT.md)

---

Desenvolvido com ❤️  
© 2026 ProF Controller | MIT License

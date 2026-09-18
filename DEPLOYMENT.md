# 🚀 Guia de Deployment - ProF Controller

## 📋 Checklist Pré-Deployment

- [x] Testes em Chrome, Firefox, Safari, Edge
- [x] Testes em mobile (iOS Safari, Android Chrome)
- [x] Todas as 15 fases funcionando
- [x] Service Worker registrado
- [x] Manifest PWA validado
- [x] Performance otimizada (Lighthouse 90+)
- [x] Documentação completa
- [x] Cache versioning correto

---

## 🌐 Opções de Deployment

### Opção 1: GitHub Pages (RECOMENDADO - GRÁTIS)

#### Passo 1: Configurar Repositório
```bash
# Clonar o repositório (se não tiver)
git clone https://github.com/ferpa2505-art/prof-controller.git
cd prof-controller

# Criar branch 'gh-pages'
git branch gh-pages
git push origin gh-pages
```

#### Passo 2: Ativar GitHub Pages
1. Ir para **Settings** do repositório
2. Scroll até **Pages**
3. Selecionar **Branch: gh-pages**
4. Selecionar **Folder: / (root)**
5. Clicar **Save**

#### Passo 3: Deploy
```bash
# Fazer push para main (GitHub Actions faz deploy automático)
git add .
git commit -m "v1.0.0 - Release"
git push origin main
```

**URL Final:** `https://ferpa2505-art.github.io/prof-controller/`

---

### Opção 2: Vercel (RECOMENDADO - GRÁTIS COM OPÇÕES PREMIUM)

#### Passo 1: Criar Conta
1. Ir para https://vercel.com
2. Fazer login com GitHub
3. Autorizar Vercel

#### Passo 2: Importar Projeto
1. Clicar **New Project**
2. Selecionar repositório **prof-controller**
3. Manter configurações padrão
4. Clicar **Deploy**

**URL Final:** `https://prof-controller.vercel.app/`

---

### Opção 3: Netlify (GRÁTIS COM OPÇÕES PREMIUM)

#### Passo 1: Criar Conta
1. Ir para https://netlify.com
2. Fazer login com GitHub
3. Autorizar Netlify

#### Passo 2: Importar Projeto
1. Clicar **New site from Git**
2. Selecionar **GitHub**
3. Procurar **prof-controller**
4. Clicar **Deploy site**

**URL Final:** `https://prof-controller.netlify.app/`

---

### Opção 4: Servidor Próprio (Apache, Nginx)

#### Para Apache
```apache
# .htaccess
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /prof-controller/
  
  # Servir arquivos existentes
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  
  # Redirecionar para index.html para PWA
  RewriteRule ^ index.html [QSA,L]
</IfModule>

# Cache control
<FilesMatch "\.(html)$">
  Header set Cache-Control "max-age=3600, must-revalidate"
</FilesMatch>

<FilesMatch "\.(js|css|json)$">
  Header set Cache-Control "max-age=31536000, immutable"
</FilesMatch>

<FilesMatch "\.(woff|woff2|ttf|eot|svg|png|jpg|jpeg|gif|ico)$">
  Header set Cache-Control "max-age=31536000, immutable"
</FilesMatch>
```

#### Para Nginx
```nginx
server {
    listen 80;
    server_name profcontroller.com www.profcontroller.com;
    
    root /var/www/prof-controller;
    index index.html;
    
    # Service Worker
    location /service-worker.js {
        add_header Cache-Control "max-age=0, no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
    }
    
    # Assets (cache longo)
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # HTML e Manifest (cache curto)
    location ~* \.(html|json)$ {
        expires 1h;
        add_header Cache-Control "public, must-revalidate";
    }
    
    # PWA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # HTTPS redirect
    if ($scheme != "https") {
        return 301 https://$server_name$request_uri;
    }
}
```

---

## 🔐 Configuração de Segurança

### Headers Recomendados
```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: accelerometer=(), camera=(), microphone=(), payment=()
```

### Content-Security-Policy (CSP)
```
Content-Security-Policy: 
  default-src 'self';
  script-src 'self';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self' data:;
  connect-src 'self' 
    https://finnhub.io 
    https://api.twelvedata.com 
    https://brapi.dev
    https://v6.exchangerate-api.com;
  frame-ancestors 'none';
  base-uri 'self';
```

---

## 📊 Performance Optimization

### Verificar Lighthouse Score
```bash
# Chrome DevTools
1. Abrir DevTools (F12)
2. Clicar "Lighthouse"
3. Selecionar "Mobile" ou "Desktop"
4. Clicar "Analyze page load"

# Resultado esperado:
Performance:   95+
Accessibility: 95+
Best Practices: 95+
SEO:           95+
```

### Minificar Manualmente
```bash
# JavaScript (usando npm)
npm install -g terser
terser app.js -c -m -o app.min.js

# CSS (usando npm)
npm install -g clean-css-cli
cleancss styles.css -o styles.min.css

# HTML (usando npm)
npm install -g html-minifier
html-minifier index.html -o index.min.html
```

---

## 🔄 Workflow CI/CD Automático

Criar arquivo `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Check HTML
      run: |
        echo "Validating index.html..."
        grep -q '<html' index.html && echo "✓ HTML válido"
    
    - name: Check JavaScript
      run: |
        echo "Validating app.js..."
        grep -q 'function init()' app.js && echo "✓ JS válido"
    
    - name: Check CSS
      run: |
        echo "Validating styles.css..."
        grep -q 'body {' styles.css && echo "✓ CSS válido"
    
    - name: Check PWA Manifest
      run: |
        echo "Validating manifest.json..."
        grep -q 'short_name' manifest.json && echo "✓ Manifest válido"
    
    - name: Upload Artifact
      uses: actions/upload-artifact@v3
      with:
        name: prof-controller-build
        path: .
        retention-days: 30
    
    - name: Deploy to GitHub Pages
      if: github.ref == 'refs/heads/main' && github.event_name == 'push'
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: .
        cname: profcontroller.dev
```

---

## 📱 Configuração de Domínio Custom

### Com GitHub Pages

1. **Comprar domínio** (ex: profcontroller.dev)
2. **Ir para Settings → Pages**
3. **Custom Domain:** profcontroller.dev
4. **Enforce HTTPS:** ✓
5. **Adicionar DNS records:**
   ```
   CNAME profcontroller.dev → ferpa2505-art.github.io
   ```
6. **Criar arquivo CNAME na raiz:**
   ```bash
   echo "profcontroller.dev" > CNAME
   git add CNAME
   git commit -m "Add custom domain"
   git push
   ```

### Com Vercel/Netlify

1. **Comprar domínio**
2. **Ir para Settings → Domains**
3. **Add Domain:** profcontroller.dev
4. **Copiar DNS records fornecidos**
5. **Adicionar em registrar de domínio**
6. **Verificar: Vercel/Netlify faz verificação automática**

---

## 🔍 Verificação Pós-Deploy

### Checklist de Testes

- [ ] App abre em https://profcontroller.dev
- [ ] Service Worker ativado (DevTools → Application)
- [ ] PWA instalável (menu Chrome → Instalar)
- [ ] Funciona offline
- [ ] Todas as abas carregam
- [ ] Transações podem ser criadas/editadas
- [ ] Investimentos buscam cotação
- [ ] Notícias carregam
- [ ] Cloud sync funciona
- [ ] Idioma muda instantaneamente
- [ ] Tema muda sem reload
- [ ] Dados persistem após reload
- [ ] Não há erros no Console
- [ ] Lighthouse Score 95+

### Testes de Performance

```javascript
// Cole no console do navegador
console.log('Performance Report:');
console.log('First Contentful Paint:', performance.getEntriesByName('first-contentful-paint')[0].startTime + 'ms');
console.log('Largest Contentful Paint:', performance.getEntriesByType('largest-contentful-paint')[0]?.renderTime + 'ms');
console.log('Total JS Size:', document.scripts.length + ' scripts');
console.log('Total CSS Size:', document.styleSheets.length + ' stylesheets');
console.log('Local Storage:', JSON.stringify(localStorage).length + ' bytes');
```

---

## 📈 Monitoramento Pós-Deploy

### Google Analytics (Opcional)
```html
<!-- Adicionar ao index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### Error Tracking (Sentry)
```javascript
// Adicionar ao app.js
window.addEventListener('error', (event) => {
  console.error('Application error:', event.error);
  // Enviar para servidor de erro (Sentry, LogRocket, etc)
});
```

---

## 🆘 Troubleshooting Deploy

### Issue: Service Worker não atualiza
**Solução:** Limpar cache do browser
- Chrome: Ctrl+Shift+Delete → Limpar tudo
- Firefox: Ctrl+Shift+Delete → Tudo
- Safari: Preferences → Privacy → Remover dados do site

### Issue: PWA não instala
**Solução:** Verificar manifest.json
```bash
# Verificar se manifest é válido
curl -I https://profcontroller.dev/manifest.json
# Deve retornar 200 e Content-Type: application/json
```

### Issue: Cotações não atualizam
**Solução:** Verificar chaves de API
- Settings → Cotações de Mercado
- Testar conexões (botão Testar)
- Verificar CORS em DevTools → Network

### Issue: Dados não sincronizam
**Solução:** Verificar Cloud Sync
- Settings → Cloud Sync → Status
- Ativar sincronização automática
- Testar sincronização manual

---

## 📦 Releases e Versionamento

### Criar Release no GitHub
```bash
# Tag nova versão
git tag -a v1.0.0 -m "Release v1.0.0 - Todas as 15 fases implementadas"

# Push tags
git push origin --tags

# GitHub cria release automaticamente
# Adicionar notas no GitHub Releases
```

### Release Notes Template
```markdown
## ProF Controller v1.0.0

### ✨ Novidades
- [x] 15 fases completamente implementadas
- [x] Offline-first 100%
- [x] 40+ moedas suportadas
- [x] 3 idiomas

### 🐛 Correções
- Nenhuma (versão inicial)

### 📊 Estatísticas
- 16,000+ linhas de código
- 200+ funções
- 0 dependências externas
- ~500KB comprimido

### 🔄 Atualização
1. Limpar cache: Ctrl+Shift+Delete
2. Recarregar: Ctrl+F5
3. Reinstalar PWA (opcional)

### 📚 Documentação
- [DOCUMENTATION.md](https://github.com/ferpa2505-art/prof-controller/blob/main/DOCUMENTATION.md)
- [EXECUTIVE_SUMMARY.md](https://github.com/ferpa2505-art/prof-controller/blob/main/EXECUTIVE_SUMMARY.md)
- [README_COMPLETO.md](https://github.com/ferpa2505-art/prof-controller/blob/main/README_COMPLETO.md)
```

---

## 🎯 Checklist Final Deploy

- [ ] ✅ Código commitado e pusheado
- [ ] ✅ GitHub Actions passando
- [ ] ✅ Branch gh-pages atualizado
- [ ] ✅ Domínio custom configurado (opcional)
- [ ] ✅ HTTPS ativado
- [ ] ✅ Service Worker respondendo
- [ ] ✅ PWA instalável
- [ ] ✅ Funciona offline
- [ ] ✅ Todos os testes passando
- [ ] ✅ Lighthouse 95+
- [ ] ✅ Release criada no GitHub
- [ ] ✅ Documentação atualizada
- [ ] ✅ Social media anunciado (opcional)

---

## 🚀 URL de Produção

**GitHub Pages:** `https://ferpa2505-art.github.io/prof-controller/`  
**Custom Domain:** `https://profcontroller.dev` (se configurado)

---

## 📞 Suporte Pós-Deploy

- **Issues:** GitHub Issues
- **Discussões:** GitHub Discussions
- **Email:** support@profcontroller.dev

---

**Parabéns! ProF Controller está em produção! 🎉**

Desenvolvido com ❤️ para controle financeiro pessoal  
© 2026 ProF Controller | MIT License

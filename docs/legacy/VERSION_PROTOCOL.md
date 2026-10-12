# 📦 ProF Controller - Versioning Protocol

## Versão Atual
**v1.0.0** - Notificações + Recorrência + Notícias

## Como Atualizar a Versão

Toda mudança **significativa** deve incrementar a versão seguindo **Semantic Versioning**:

```
MAJOR.MINOR.PATCH
1.0.0
```

### Regras:
- **PATCH** (1.0.**0** → 1.0.**1**): Bug fixes, melhorias pequenas
- **MINOR** (1.**0**.0 → 1.**1**.0): Novas features, mudanças compatíveis
- **MAJOR** (**1**.0.0 → **2**.0.0): Mudanças quebradoras, refactor grande

### Exemplo de Incremento:

Se vai fazer uma mudança:

1. **Edite `app.js` linha ~20:**
```javascript
const APP_VERSION = '1.0.1'; // Atualize aqui
```

2. **Edite `index.html` linha ~486:**
```html
<small id="appVersion">ProF Controller v1.0.1</small>
```

3. **Edite `index.html` linha ~485 (cache buster):**
```html
<script src="app.js?v=39"></script> <!-- Incremente aqui também -->
```

4. **Commit com a versão no título:**
```bash
git commit -m "v1.0.1: Fix notificações não funcionando

Descrição da mudança aqui..."
```

5. **Tag opcional (para releases importantes):**
```bash
git tag -a v1.0.1 -m "Release v1.0.1"
git push origin v1.0.1
```

### Histórico de Versões:
- **v1.0.0** (2026-09-18): Notificações, Recorrência, Notícias, UI improvements

---

**Dica:** A versão é exibida no canto inferior direito do app! ✨

# 📱 Breakpoints Responsivos - ProF Controller

## Visual Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                    RESPONSIVE DESIGN HIERARCHY                      │
└─────────────────────────────────────────────────────────────────────┘

    360px ────── 480px ────── 768px ────── 1024px ────── 1280px ────► ∞
      │            │            │            │             │
      │            │            │            │             │
      ▼            ▼            ▼            ▼             ▼
    ┌──┐        ┌──┐        ┌────┐      ┌────────┐    ┌──────────┐
    │  │        │  │        │    │      │        │    │          │
    │📱│        │📱│        │ 📊 │      │ 🖥️    │    │  🖥️ BIG  │
    │  │        │  │        │    │      │        │    │          │
    └──┘        └──┘        └────┘      └────────┘    └──────────┘
    
  Mobile      Mobile        Tablet      Desktop      Large Desktop
  Pequeno     Grande

  (iPhone SE) (iPhone 12)   (iPad)     (Notebook)   (Desktop 27")
  (Moto G)    (Galaxy)      (Galaxy)   (Notebook)   (TV)
                            Tab        15"          4K
```

---

## 🎯 Especificações por Breakpoint

### 📱 MOBILE PEQUENO (360px - 480px)

**Dispositivos:** iPhone SE, Moto G4, Galaxy S10
**Características:**
```
┌──────────────┐
│   TOPBAR     │  ← Comprimido, botões em coluna
├──────────────┤
│              │
│  Chart Tabs  │  ← Só emojis (📈 🎯 💰 🏆)
│              │
├──────────────┤
│              │
│   GRÁFICO    │  ← 200px altura
│              │
├──────────────┤
│ Card Card    │  ← 1 coluna
│ Card Card    │  
│ Card Card    │  
└──────────────┘

Font:     12-14px (responsivo)
Padding:  10-14px
Botões:   44x44px (touch-friendly)
```

---

### 📱 MOBILE GRANDE (481px - 768px)

**Dispositivos:** iPhone 12/13, Galaxy S20, Motorola
**Características:**
```
┌────────────────────┐
│      TOPBAR        │  ← Mais espaço
├────────────────────┤
│   Evolution Dist   │  ← Texto curto
│   Flow    Assets   │
├────────────────────┤
│                    │
│    GRÁFICO 280px   │
│                    │
├────────────────────┤
│  Card  │  Card     │  ← 2 colunas
├────────┼───────────┤
│  Card  │  Card     │
└────────┴───────────┘

Font:     13-14px
Padding:  14-16px
Buttons:  42x44px
Grid:     2 colunas
```

---

### 📊 TABLET (769px - 1023px)

**Dispositivos:** iPad, iPad Air, Galaxy Tab
**Características:**
```
┌──────────────────────────────────┐
│           TOPBAR                 │  ← Completo
├──────────────────────────────────┤
│                                  │
│  Evolution | Distribution        │  ← Abas lado a lado
│  Flow      | Assets              │
│                                  │
├──────────────────────────────────┤
│                                  │
│         GRÁFICO 320px            │
│                                  │
├──────────────────────────────────┤
│  Card     │  Card     │  Card    │  ← 2-3 colunas
├───────────┼───────────┼──────────┤
│  Card     │  Card     │  Card    │
└───────────┴───────────┴──────────┘

Font:     14-15px
Padding:  16-18px
Buttons:  42x44px
Grid:     2-3 colunas
```

---

### 🖥️ DESKTOP (1024px - 1279px)

**Dispositivos:** Notebook 11-13", Desktop 1366x768
**Características:**
```
┌────────────────────────────────────────────────┐
│               TOPBAR COMPLETO                  │
├────────────────────────────────────────────────┤
│                                                │
│  Evolution | Distribution | Flow | Assets     │  ← Abas em linha
│                                                │
├────────────────────────────────────────────────┤
│                                                │
│          GRÁFICO 360px                         │
│                                                │
├──────────────────┬────────────────────────────┤
│ Card │ Card │ Card │ Card │ Card │ Card │ ... │  ← 3+ colunas
└──────┴──────┴──────┴──────┴──────┴──────┘

Font:     14-16px
Padding:  18-20px
Buttons:  44x44px
Grid:     3+ colunas
Max-Width: 980px
```

---

### 🖥️ DESKTOP GRANDE (1280px+)

**Dispositivos:** Notebook 15"+, Desktop 27", TV
**Características:**
```
┌──────────────────────────────────────────────────────────────────┐
│                    TOPBAR COM ESPAÇO TOTAL                       │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Evolution | Distribution | Flow | Assets                       │  ← Abas com espaço
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│                 GRÁFICO 400px                                   │
│                                                                  │
├────────────────┬────────────────┬─────────────┬────────────────┤
│ Card │ Card │ Card │ Card │ Card │ Card │ Card │ Card │ Card  │
└──────┴──────┴──────┴──────┴──────┴──────┴──────┴──────┴────────┘

Font:     14-16px
Padding:  24-32px
Buttons:  44x44px
Grid:     4+ colunas auto
Max-Width: 1200px
```

---

## 🎨 Variáveis Responsivas (CSS)

```css
/* Fonts - Escalam com viewport */
--font-size-xs:   clamp(11px, 2.5vw, 13px);  /* Mínimo legível */
--font-size-sm:   clamp(13px, 2.8vw, 14px);  /* Labels */
--font-size-base: clamp(14px, 3vw, 16px);    /* Texto principal */
--font-size-lg:   clamp(16px, 3.5vw, 18px);  /* Subtítulos */
--font-size-xl:   clamp(18px, 4vw, 24px);    /* Títulos */

/* Spacing - Espaçamento fluido */
--spacing-xs: clamp(4px, 1vw, 8px);        /* Micro espaçamento */
--spacing-sm: clamp(8px, 2vw, 12px);       /* Pequeno */
--spacing-md: clamp(12px, 2.5vw, 16px);    /* Médio */
--spacing-lg: clamp(16px, 3vw, 20px);      /* Grande */
--spacing-xl: clamp(20px, 3.5vw, 24px);    /* Extra grande */

/* Padding por contexto */
--pad-mobile:   clamp(10px, 2.5vw, 14px);  /* Mobile */
--pad-tablet:   clamp(16px, 4vw, 20px);    /* Tablet */
--pad-desktop:  clamp(24px, 5vw, 32px);    /* Desktop */
```

---

## 📊 Altura dos Gráficos

```
Device           Canvas Height    Use Case
─────────────────────────────────────────────────────
Mobile (360px)      200px      ← Landscape mode
Mobile (480px)      250px      ← Retrato
Tablet (768px)      280px      ← Retrato
Tablet (1024px)     320px      ← Paisagem
Desktop (1366px)    360px      ← Padrão
Desktop (1920px)    400px      ← Tela grande
```

---

## 🎨 Tabs (Abas) Inteligentes

```
BREAKPOINT          EXIBIÇÃO                    ESPAÇO
────────────────────────────────────────────────────────
360px - 480px      📈 🎯 💰 🏆               ← Só emoji
481px - 768px      Evolution | Dist | Flow   ← Abreviado
769px - 1023px     Evolution | Distribution  ← Texto curto
1024px+            Evolution | Distribution | Flow | Assets ← Completo
```

---

## 🔄 Orientação (Landscape vs Portrait)

```
PORTRAIT (Retrato)          LANDSCAPE (Paisagem)
┌──────────────┐           ┌──────────────────────┐
│              │           │  CHART 300px         │
│ CHART 250px  │           │  (reduzido)          │
│              │           │                      │
├──────────────┤           ├──────────────────────┤
│ Card │ Card  │           │ Card │ Card │ Card   │
│ Card │ Card  │           │ Card │ Card │ Card   │
└──────────────┘           └──────────────────────┘
```

---

## ✅ Checklist de Testes

- [ ] Abrir em celular real (não apenas DevTools)
- [ ] Testar em modo paisagem
- [ ] Testar em tablet
- [ ] Testar em desktop (múltiplos tamanhos)
- [ ] Zoom in/out (50%, 100%, 200%)
- [ ] Rotação de tela
- [ ] Modo offline
- [ ] Navegação entre abas
- [ ] Clique em botões (touch)
- [ ] Scroll horizontal (tabs)

---

## 🚀 Como Ativar em Produção

Basta abrir em qualquer dispositivo:

```bash
# Celular conectado na mesma rede
http://<IP_PC>:3001

# Exemplo:
http://192.168.1.100:3001
```

O CSS responsivo é **automático** - nada a configurar! 🎉

---

**Criado em:** 2025-10-01
**Última atualização:** 2025-10-01
**Status:** ✅ Pronto para produção

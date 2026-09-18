# 🗺️ Roadmap - Fases Futuras (13-15+)

## 📊 Status Atual
✅ **Fases 1-5 e 9 Completas**: Notificações e Recorrências com 100% de funcionalidade
⏳ **Fases 6-8**: Não iniciadas
⏳ **Fases 13-15**: Aguardando priorização

---

## 🎯 Próximas Fases Confirmadas

### **Fase 13: Você x Mercado** 
*Smart portfolio insights com lembretes e perguntas sobre IR*

**Objetivo**: 
- Análise inteligente do portfólio
- Comparação com benchmarks de mercado
- Lembretes de eventos importantes (vencimentos, dividendos)
- Assistente de perguntas sobre Imposto de Renda

**Estimativa de Impacto**:
- Novo painel "Você x Mercado"
- Integração com dados de investimentos (positions, quotes)
- Notificações automáticas para eventos de IR
- API para dados de mercado (cotações, benchmarks)

**Implementação Proposta**:
```
renderYouVsMarket() {
  // Comparar portfólio vs índices (Ibovespa, B3, CDI, etc)
  // Mostrar alocação ideal vs real
  // Gráficos de performance
  // Alertas de IR (vencimento de prazos, eventos corporativos)
}

taxAssistant() {
  // Perguntas frequentes sobre IR
  // Cálculo de base de cálculo por ativo
  // Planejamento de realizações (tax loss harvesting)
}
```

---

### **Fase 14: Hub de Notícias (FinHub)**
*Notícias de mercado com alertas de preços localizados*

**Objetivo**:
- Agregador de notícias financeiras
- Alertas de preço para watchlist
- Notificações push customizadas
- Multi-idioma: PT-BR, EN, ES

**Características**:
- Notícias por categoria (mercado geral, seus ativos, watchlist)
- Filtros por idioma
- Atualização automática a cada 2 horas
- Clique abre em nova aba

**API necessária**:
- News API (NewsAPI.org ou similar)
- Cotações em tempo real (opcional)

**Implementação Proposta**:
```javascript
fetchNews() {
  // Buscar notícias via API externa
  // Filtrar por watchlist, portfólio, categorias
  // Armazenar com timestamp
  // Enviar push notifications para preços-alvo
}

renderNews() {
  // Lista de notícias organizadas por categoria
  // Botão "Leia no site original"
  // Filtros por idioma
}

newsAlert(symbol, targetPrice) {
  // Monitorar cotação
  // Disparar notificação quando atingir target
}
```

---

### **Fase 15: Autenticação & Backup Cloud**
*Login Google, Sincronização na Nuvem, Notificações em Português*

**Objetivo**:
- Autenticação via Google (simplificar login)
- Sincronização automática no Google Drive
- Notificações push em português
- Recuperação de conta perdida

**Características Principais**:
1. **Login Google**
   - Usar Google Sign-In SDK
   - OAuth2 para autorizar Drive
   - Salvar preferências por usuário

2. **Backup Automático no Google Drive**
   - Sincronizar a cada 12 horas
   - Versioning (manter últimas 30 dias)
   - Criptografia end-to-end (senha local)

3. **Notificações Push em Português**
   - Títulos e corpo em PT-BR (ou idioma do user)
   - Service Worker melhorado
   - Badge em português

4. **Multi-dispositivo**
   - Restaurar conta em novo celular
   - Sincronizar entre navegadores
   - Conflito resolution (último ganha)

**Implementação Proposta**:
```javascript
// Login Google
authenticateGoogle() {
  // Usar Google Sign-In
  // Obter authToken
  // Salvar em localStorage
}

// Backup no Drive
syncToDrive() {
  // Executar a cada 12h
  // Compactar JSON + arquivo ZIP
  // Upload para pasta /ProF Controller/
  // Manter histórico versionado
}

// Notificações em português
sendNotificationPT(type) {
  const messages = {
    recurring_upcoming: `Próximo lançamento: ${name} — ${value}`,
    budget_alert: `Atenção: categoria ${cat} ultrapassou limite`,
    tax_reminder: `Prazo para entrega de ITR: ${date}`,
    news_alert: `${ticker} atingiu R$ ${price}`
  };
  
  sendBrowserNotification(messages[type]);
}
```

**Fluxo de Setup**:
1. Usuário clica "Login com Google" na tela inicial
2. Google popup abre
3. App pede autorização para Drive
4. Cria pasta `/ProF Controller/` no Drive
5. Restaura backup mais recente (se houver)
6. Ativa sincronização automática
7. Lembra user a fazer backup inicial

---

## 📋 Fases Intermediárias (Recomendadas antes de 13-15)

### **Fase 6: Alertas de Orçamento**
- Notificação quando categoria ultrapassa limite
- Uso do sistema de notificações já implementado
- Fácil execução

### **Fase 7: Relatórios de Recorrência**
- Histórico de instâncias geradas
- Gráfico de impacto mensal/anual
- Análise "e se eu não tivesse essa recorrência?"

### **Fase 8: Edição Avançada de Recorrências**
- Mudar frequência sem deletar histórico
- Ajustar valor próximo (inflação anual)
- Merge de recorrências duplicadas
- Copiar recorrência para nova conta

---

## 🏗️ Arquitetura Proposta para Fases 13-15

```
ProF Controller
├── Dashboard (existente)
├── Contas & Saldos (existente)
├── Transações (existente)
├── Recorrências (✅ Nova - Fase 4)
├── Orçamentos (existente)
├── Câmbio (existente)
├── Portfólio (existente)
│   ├── Imóveis
│   ├── Veículos
│   └── Ativos (ações, FII, cripto)
├── Você x Mercado (📍 Fase 13 Novo)
│   ├── Benchmark vs Portfólio
│   ├── Alertas de IR
│   └── Análise de Alocação
├── Notícias (📍 Fase 14 Novo)
│   ├── Hub de Notícias
│   ├── Alertas de Preço
│   └── Watchlist
├── Notificações (✅ Nova - Fase 3)
│   ├── Recorrências Próximas
│   ├── Alertas de Orçamento (Fase 6)
│   ├── Alertas de Preço (Fase 14)
│   └── Alertas de IR (Fase 13)
├── Backup & Cloud (📍 Fase 15 Novo)
│   ├── Login Google
│   ├── Sincronização Drive
│   └── Multi-dispositivo
└── Configurações
    ├── Tema & Idioma
    ├── Segurança (Lock)
    └── API Keys & Backup
```

---

## 🔗 Dependências Entre Fases

```
Fases 1-5 (Notificações & Recorrências) ✅
    ↓
Fase 6 (Alertas de Orçamento)
    ↓
Fases 7-8 (Relatórios & Edição Avançada)
    ↓
Fase 13 (Você x Mercado) 📍
    ↓
Fase 14 (Hub de Notícias) 📍
    ↓
Fase 15 (Cloud & Autenticação) 📍
```

---

## 💾 Dados Necessários para Fase 13

**IndexedDB Stores necessários**:
- `positions` (ações, FII, cripto) - ✅ Existente
- `quotes` (cotações históricas) - ✅ Existente
- `dividends` (proventos recebidos) - ✅ Existente
- `benchmarks` (índices: Ibovespa, CDI, etc) - ❌ Novo

**APIs externas necessárias**:
- Alpha Vantage (ações internacionais)
- Dados B3 (ações BR, FII)
- CEI/CVM (dados de IR, IPOs)

---

## 📱 Notificações por Fase

### Fase 4 ✅
- ✅ Lançamentos recorrentes próximos (próximos 3 dias)
- ✅ Badge de contagem
- ✅ Painel de notificações

### Fase 6 (Novo)
- 📌 Categoria ultrapassa orçamento (semanal)
- 📌 Orçamento do mês acabando (final do mês)

### Fase 13 (Novo)
- 📌 Evento de IR próximo (30 dias antes)
- 📌 Dividendo distribuído
- 📌 Split/Desdobro de ação

### Fase 14 (Novo)
- 📌 Ativo da watchlist em alta/baixa
- 📌 Notícia importante sobre seu portfólio
- 📌 Alerta de preço-alvo atingido

---

## 🎓 Estimativas de Esforço

| Fase | Complexidade | Dias | Dependencies |
|------|-------------|------|--------------|
| 6 | Baixa | 1-2 | Nenhuma |
| 7 | Média | 3-4 | Fase 4 |
| 8 | Média | 2-3 | Fase 4 |
| 13 | Alta | 5-7 | Nenhuma (independente) |
| 14 | Alta | 5-7 | API externa |
| 15 | Muito Alta | 7-10 | Servidor backend |

---

## 🚀 Recomendação de Sequência

**Curto Prazo (Próximas 2 semanas)**:
1. Testar Fases 1-5 completamente ✅
2. Publicar versão estável
3. Coletar feedback de usuários

**Médio Prazo (2-4 semanas)**:
1. Fase 6 (Alertas de Orçamento) - Baixo esforço
2. Fase 7 (Relatórios) - Complementa Fase 4

**Longo Prazo (4-8 semanas)**:
1. Fase 13 (Você x Mercado) - Alto impacto
2. Fase 14 (Notícias) - Complementa Fase 13
3. Fase 15 (Cloud) - Maior esforço, máximo impacto

---

## 📝 Notas de Implementação

### Para Fase 13 (Você x Mercado)
- Usar biblioteca `Chart.js` ou `D3.js` para gráficos
- Cálculos de Sharpe Ratio, Beta, Sortino Ratio
- Base de cálculo de IR por ativo (PU médio)

### Para Fase 14 (Notícias)
- Considerar cache de notícias por 2 horas
- Implementar fallback quando API falha
- Sanitizar HTML de notícias (XSS)

### Para Fase 15 (Cloud)
- Usar Firebase Auth ou Auth0 (não Google direto)
- Bucket Cloud Storage para backups
- Implementar conflict resolution (timestamp)
- Testes de sincronização multi-dispositivo

---

## ✅ Conclusão

**Fases 1-5 e 9**: ✅ COMPLETAS - Pronto para produção
**Fases 6-8**: 🔄 Recomendado antes de 13-15
**Fases 13-15**: 📍 Próximas prioridades de produto

Recomenda-se publicar a versão atual, coletar feedback, e então iniciar Fase 13.

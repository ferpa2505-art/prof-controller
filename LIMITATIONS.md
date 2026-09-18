# Limitações da Fase 16 - ProF Controller

## 1. Verificação de Alertas de Preço

### ❌ Limitação
A verificação automática de alertas de preço **só funciona com o app aberto** no navegador.

### 📋 Detalhes Técnicos
- Um interval de 5 minutos (`checkPriceAlerts()`) roda apenas enquanto a aba está ativa
- Quando o navegador é fechado, o checker para
- Não há sincronização em background

### ✅ Workaround (Soluções Atuais)
1. **Manter a aba aberta**: deixar a aba em background ou em outra janela
2. **Usar o botão refresh**: clicar em 🔄 para verificar alertas manualmente
3. **Notificações do navegador**: se um alerta é disparado enquanto o app está aberto, você recebe notificação (mesmo com aba em background)

### 🚀 Solução Permanente
Ver **SERVER_SOLUTIONS.md** para implementar um servidor que faça verificação automática 24/7.

---

## 2. Limite de Alertas Ativos

### ℹ️ Restrição
Máximo de **3 alertas ativos** por conta/app.

### 🎯 Motivo
- Limitar requisições de API (custos e rate limits)
- Evitar overload de notificações
- Manter performance do app

### 📝 Detalhes
- Alertas disparados são marcados como "triggered" (não contam na cota)
- Você pode desabilitar alertas antigos para criar novos
- Alertas são armazenados localmente (IndexedDB) até serem deletados manualmente

---

## 3. APIs de Cotações

### 🌐 Fallback de Fornecedores
ProF usa até 4 APIs em cascata:

1. **Cache local** (IndexedDB)
2. **Finnhub** (requer chave de API)
3. **Twelve Data** (requer chave de API)
4. **brapi.dev** (gratuita, sem chave)

### ⚠️ Quando Pode Falhar
- Todas as 3 APIs externas estão offline
- Chaves de API expiradas ou revogadas
- Rate limits atingidos (se muitos alertas simultâneos)
- Asset não existe em nenhuma API

### 💾 Fallback Local
Se todas as APIs falharem:
- Usa o último preço armazenado em cache
- Mostra aviso "Usando preço em cache"
- Alertas não são disparados (para evitar false positives)

---

## 4. Notificações do Navegador

### 🔔 Requisitos
- Navegador deve ter **permissão de notificações** concedida
- Sistema operacional deve aceitar notificações
- Navegador deve estar rodando (não precisa estar em foco)

### ❌ Casos que NÃO Notificam
- Navegador foi fechado antes do alerta disparar
- Permissão de notificações foi negada
- App foi bloqueado (lock screen)

### 📱 Suporte por Navegador
- ✅ Chrome/Chromium
- ✅ Firefox
- ✅ Edge
- ✅ Safari (apenas em macOS 10.15+)
- ❌ Internet Explorer

---

## 5. Moedas e Ativos Suportados

### 📊 Ativos Disponíveis
Apenas ativos presentes nas APIs (Finnhub, Twelve Data, brapi):
- **Ações**: PETR4, VALE5, etc (B3)
- **Criptos**: BTC, ETH, XRP (maiúsculas)
- **ETFs/FIIs**: HASH11, XFIX11, etc
- **Moedas**: USD, EUR, GBP, etc

### 🚫 NÃO Suporta
- Ativos privados (Plim, Nuvemshop, etc)
- Derivativos (opções, futuros)
- Metais (Ouro, Prata) - parcialmente em Finnhub
- Commodities - apenas em Twelve Data

### 🔍 Como Verificar
1. Vá para a aba **Investimentos**
2. Clique em "+ Nova posição"
3. Digite o código do ativo
4. Sistema mostra se encontrou nos catálogos

---

## 6. Idiomas Suportados

### 🌍 Linguagens
- ✅ Português (Brasil)
- ✅ English (US/Global)
- ✅ Español (España/Latinoamérica)

### ⚠️ Conteúdo Dinâmico
Nomes de ativos, moedas e alguns valores técnicos permanecem em inglês.

---

## 7. Armazenamento Local

### 💾 Limite de Espaço
- IndexedDB: até ~50MB (varia por navegador)
- LocalStorage: até ~5MB
- Sessão: até ~10MB em memória

### ⚠️ Casos de Perda de Dados
- Limpar dados do navegador/cache
- Desinstalar extensões que limpam dados
- Usar incógnito/private mode
- Trocar navegador

### ✅ Proteção
- Backup automático (função "Exportar")
- Recomendação: Exportar dados regularmente

---

## 8. Performance

### ⚡ Otimizações Atuais
- Renderização assíncrona (não bloqueia UI)
- Debounce em buscas (max 500ms)
- Cache de cotações (5 min de TTL)
- Lazy loading em tabelas grandes

### 🐢 Pode Ficar Lento Se
- Mais de 500 posições ativas
- Mais de 200 transações por mês
- Mais de 10 contas simultâneas
- Histórico de 5+ anos de dados

---

## 9. Segurança

### 🔐 Dados Locais
- Todos os dados ficam no seu dispositivo
- Senha armazenada com bcrypt (99% offline)
- Chaves de API ficam em localStorage

### ⚠️ Riscos
- Se alguém tiver acesso físico → pode ver dados
- Se computador for hackeado → dados podem ser roubados
- Chaves de API armazenadas em plaintext (recomendação: use chaves com IP restrito)

### ✅ Recomendação
- Use um gerenciador de senhas (Bitwarden, 1Password)
- Não acesse em computadores públicos
- Habilite lock screen (biometria recomendada)

---

## 10. Compatibilidade

### 🖥️ Navegadores Testados
- Chrome 120+
- Firefox 121+
- Safari 17+
- Edge 120+

### 📱 Mobile
- iOS Safari: ✅ Funciona
- Android Chrome: ✅ Funciona
- Android Firefox: ✅ Funciona

### 🔌 Desktop Offline
- Funciona 100% offline (exceto cotações)
- Indicador "Offline" aparece quando sem internet

---

## 11. Exportação de Dados

### 📥 Formatos Suportados
- **JSON**: completo, importável
- **CSV**: apenas saldos diários

### ⚠️ Limitações
- Exportação não inclui: histórico de sessão, cache de cotações
- Importação não valida duplicatas
- CSV requer formato exato: `Data;Conta;Moeda;Saldo`

---

## 12. Sincronização Entre Abas

### ❌ Não Sincroniza
- Mudanças em uma aba não aparecem instantaneamente na outra
- Necessário F5 para recarregar em outra aba

### ⚠️ Risco
- Conflitos se editar mesma transação em 2 abas
- Última salva vence

### ✅ Workaround
- Use apenas uma aba aberta
- Recarregue antes de fazer alterações

---

## Roadmap para Remover Limitações

| Limitação | Prioridade | Versão Alvo | Status |
|-----------|-----------|-----------|--------|
| Alertas 24/7 (servidor) | 🔴 Alta | 2.0 | Planejado |
| Sincronização entre abas | 🟡 Média | 1.5 | Planejado |
| Suporte offline total | 🟡 Média | 1.5 | Em análise |
| PWA completa | 🟡 Média | 1.5 | Em análise |
| Mais de 3 alertas | 🟢 Baixa | 2.0 | Futuro |

---

**Última atualização**: 2026-09-18  
**Versão**: ProF Controller 1.0 (Fase 16)  
**Autor**: Copilot App

# Price Alerts (Alertas de Preço) - Guia Completo

## 📌 Visão Geral

Os **Price Alerts** permitem monitorar seus ativos e receber notificações quando o preço atinge um valor específico (acima ou abaixo).

### Recursos
- ✅ Limite de **3 alertas ativos** simultâneos
- ✅ Notificações do navegador em tempo real
- ✅ Verificação automática a cada **5 minutos**
- ✅ Suporte a ações, criptos, ETFs e FIIs
- ✅ Histórico de alertas disparados

---

## 🚀 Como Criar um Alerta

### Passo 1: Abrir a Aba de Investimentos
1. Clique na aba **"Investimentos"** no menu principal
2. Role para a seção **"Alertas de Preço"**

### Passo 2: Criar Novo Alerta
Clique no botão **"+ Novo Alerta"**

### Passo 3: Preencher o Formulário

```
┌─────────────────────────────────┐
│ Novo Alerta de Preço            │
├─────────────────────────────────┤
│ Ativo *                         │
│ [Digite: BTC, PETR4, etc]       │
│                                 │
│ Tipo de Alerta *                │
│ ○ Acima de (↑)                  │
│ ○ Abaixo de (↓)                 │
│                                 │
│ Preço-alvo *                    │
│ [Ex: 180.000 para BTC]          │
│                                 │
│ Moeda                           │
│ [USD, BRL, EUR, ...]            │
│                                 │
│ [ Criar Alerta ] [ Cancelar ]   │
└─────────────────────────────────┘
```

### Exemplo Prático
- **Ativo**: BTC
- **Tipo**: Acima de (↑)
- **Preço-alvo**: 100.000
- **Moeda**: USD
- **Resultado**: Notificação quando BTC > USD 100.000

---

## 📊 Tipos de Alertas

### 1. Alerta de Alta (↑ Acima de)
```
Quando preço ≥ valor-alvo
├─ Dispara UMA VEZ quando atinge
├─ Após disparar, muda para "triggered"
└─ Você pode deletá-lo ou reativá-lo
```

**Casos de Uso:**
- Ação em suporte: alerta quando voltar para o piso histórico
- Cripto em bullrun: alerta para pump esperado
- ETF em promoção: alerta para entrada de preço

---

### 2. Alerta de Baixa (↓ Abaixo de)
```
Quando preço ≤ valor-alvo
├─ Dispara UMA VEZ quando cai
├─ Após disparar, muda para "triggered"
└─ Você pode deletá-lo ou reativá-lo
```

**Casos de Uso:**
- Stop loss: alertar quando ação cai muito
- Oportunidade de compra: alerta em preço justo
- Crypto dip: avisar se houver crash

---

## 🔔 Notificações

### Como Funciona
1. **App aberto**: Notificação aparece no canto da tela
2. **App em background**: Notificação do navegador (se permissão concedida)
3. **App fechado**: **NÃO notifica** (limitação de plataforma)

### Pedir Permissão
Na primeira vez que criar um alerta:
```
┌─────────────────────────────┐
│ ? ProF Controller quer       │
│   enviar notificações       │
├─────────────────────────────┤
│ [ Permitir ]  [ Bloquear ]  │
└─────────────────────────────┘
```

Clique **Permitir** para ativar notificações.

### Conteúdo da Notificação
```
🔔 ProF Controller

BTC acima de USD 100.000

Preço atual: USD 101.500
Seu alerta: USD 100.000
```

---

## ⏱️ Verificação Automática

### Como Funciona
- Verificação a cada **5 minutos** (automática)
- Primeira verificação ao abrir o app
- Usa APIs: Finnhub → Twelve Data → brapi.dev
- Resultado armazenado em cache

### Status do Checker
```
Console do Navegador (F12 → Console):

✅ Price alert checker ativado
   Próxima verificação em 4m 32s

[Se alerta dispara]
🔔 Alert triggered: BTC > 100000
```

---

## 👁️ Gerenciamento de Alertas

### Status dos Alertas

| Status | Ícone | Significado |
|--------|-------|------------|
| Ativo | 🟢 | Monitorando, pode disparar |
| Disparado | 🟡 | Já acionou, não dispara novamente |
| Deletado | ❌ | Removido permanentemente |

### Ações Disponíveis

#### Ver Detalhes
Clique no card do alerta para expandir:
```
┌─────────────────────────────┐
│ 🟢 BTC ↑ 100.000 USD        │
├─────────────────────────────┤
│ Status: Ativo               │
│ Criado em: 18/09/26 14:30   │
│ Preço atual: USD 98.500     │
│ Diferença: -1.500 (-1,5%)   │
│ [ Deletar ]                 │
└─────────────────────────────┘
```

#### Deletar Alerta
1. Abra o card
2. Clique em **[Deletar]**
3. Confirme na caixa de diálogo
4. Alerta é removido permanentemente

---

## 🔧 Configurações

### Onde Está?
Engrenagem ⚙️ → **Configurações Avançadas** → (seção de alertas)

### Opções

#### 1. Habilitar/Desabilitar Alertas
```
☑ Ativar alertas de preço
└ Se desligado, nenhum alerta é verificado
```

#### 2. Som de Notificação
```
☑ Som ao disparar alerta
└ Toque/bip quando alerta é acionado
```

#### 3. Intervalo de Verificação
```
Verificar a cada [5] minutos
└ Padrão: 5 min | Mín: 1 | Máx: 60
```

---

## 📊 Dados Técnicos

### Armazenamento
- **Onde**: IndexedDB (dispositivo local)
- **Quanto**: até 50MB disponível
- **Backup**: via "Exportar dados" (JSON)

### Estrutura de um Alerta
```javascript
{
  id: "alert-uuid",
  assetCode: "BTC",
  type: "above",           // "above" | "below"
  targetPrice: 100000,
  currency: "USD",
  status: "active",        // "active" | "triggered"
  createdAt: "2026-09-18T14:30:00Z",
  lastCheckedAt: "2026-09-18T14:35:00Z",
  lastPrice: 98500
}
```

---

## 🌐 APIs de Cotações

### Qual API é Usada?
O app verifica nesta ordem:
```
1️⃣ Cache local (mais rápido, até 5 min de idade)
   ↓ [se vencido ou não existe]
2️⃣ Finnhub (melhor qualidade, paga)
   ↓ [se falhar]
3️⃣ Twelve Data (alternativa, paga)
   ↓ [se falhar]
4️⃣ brapi.dev (fallback gratuito)
   ↓ [se todas falharem]
5️⃣ Usar último preço em cache
```

### Adicionar Chaves de API (Opcional)
1. Abra **Configurações Avançadas**
2. Desça até **"Cotações de Mercado"**
3. Cole suas chaves:
   - **Finnhub**: Obtenha em https://finnhub.io (gratuito)
   - **Twelve Data**: Obtenha em https://twelvedata.com (freemium)

### Sem Chaves
O app funciona com **brapi.dev** (gratuita, mas com limites):
- 120 requisições/minuto
- Apenas ações brasileiras (B3)
- Apenas criptos populares

---

## 🚨 Troubleshooting

### "Alerta não dispara"

**Causa 1: App estava fechado**
- ❌ Alertas não funcionam com app fechado
- ✅ Mantenha a aba aberta ou use servidor (ver LIMITATIONS.md)

**Causa 2: Permissão de notificação negada**
- ❌ Navegador não pode enviar notificações
- ✅ Vá a Configurações do navegador → Notificações → Permitir ProF

**Causa 3: API fora do ar**
- ❌ Todas as APIs falharam
- ✅ Clique no botão 🔄 (refresh) para tentar novamente

**Causa 4: Asset não encontrado**
- ❌ Código do ativo inválido ou não existe
- ✅ Procure o código correto (ex: VALE5, não VALE)

---

### "Preço está errado"

**Causa 1: Cache desatualizado**
- ❌ Preço em cache tem até 5 minutos de idade
- ✅ Clique 🔄 ou aguarde próxima verificação

**Causa 2: Moeda diferente**
- ❌ Asset em USD mas alerta em BRL
- ✅ Verifique a moeda do alerta vs asset

**Causa 3: API com delay**
- ❌ Preço de delayed 15-20 min (dados gratuitos)
- ✅ Use Finnhub (realtime) para preços live

---

### "Mostrador diz 3 alertas, mas só vejo 2"

**Causa**: Um alerta foi "triggered" (disparado)
- Alertas disparados ainda contam na cota de 3
- Delete alertas antigos para criar novos
- ✅ Solução: Clique em [Deletar] no card

---

## 📱 Exemplo de Workflow Completo

### Cenário: Comprar BTC quando chegar em USD 90.000

**Passo 1**: Criar Alerta
```
Ativo: BTC
Tipo: Abaixo de (↓)
Preço: 90.000
Moeda: USD
[Criar Alerta]
```

**Passo 2**: Receber Notificação
```
Quando BTC cai para ≤ USD 90.000:

🔔 BTC abaixo de USD 90.000
   Preço atual: USD 89.500
```

**Passo 3**: Executar Compra
- Abra sua corretora
- Compre os BTC desejados
- Delete o alerta em Investimentos

---

## 🎯 Melhores Práticas

### ✅ DO
- Criar alertas com limite de 3 (não ultrapasse)
- Exportar dados regularmente
- Usar chaves de API para melhor precisão
- Manter app aberto para notificações
- Usar moeda consistente (USD ou BRL)

### ❌ DON'T
- Não criar 10+ alertas (impacta performance)
- Não fechar app e esperar alertas
- Não usar chaves de API em computador compartilhado
- Não confiar 100% em alertas (sempre verificar manualmente)
- Não ignorar erros de conexão

---

## 📞 Suporte

### Onde Reportar Bugs
- GitHub: https://github.com/ferpa2505-art/prof-controller/issues

### FAQs
- **P**: Posso ter +3 alertas?  
  **R**: Não (limitação técnica). Delete alertas disparados.

- **P**: Alertas funcionam offline?  
  **R**: Não. Precisa de internet para verificar preços.

- **P**: Posso receber alertas por email?  
  **R**: Não (planejado para v2.0 com servidor).

- **P**: Como exportar alertas?  
  **R**: Clique em Configurações → Exportar (inclui alertas em JSON).

---

**Última atualização**: 2026-09-18  
**Versão**: ProF Controller 1.0 (Fase 16)  
**Próxima versão**: 1.5 (servidor + email alerts)

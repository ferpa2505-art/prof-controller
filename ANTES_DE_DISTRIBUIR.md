# ✅ Checklist: Antes de Distribuir para os 10 Testadores

Use este documento como referência rápida antes de enviar o APK.

---

## 📋 Pré-Distribuição (Quando Build Terminar)

### 1. Verificar Build Status
- [ ] Dashboard mostra "FINISHED" (verde)
- [ ] Sem erros em logs
- [ ] Download button está disponível

**Se FAILED (vermelho)**:
```
Vários possíveis erros:
1. Dependency conflict → npm install novamente
2. TypeScript error → Check app/(tabs)/*.tsx
3. Memory issue → Esperar 30min e tentar novamente
```

### 2. Download APK
- [ ] Clique "Download"
- [ ] Arquivo baixa para ~/Downloads (aprox 70MB)
- [ ] Nome do arquivo: pesos-app-*.apk

### 3. Preparar Materiais para Testadores
- [ ] Link do build (copiar do dashboard)
- [ ] Imprimir ou salvar: `INSTRUÇÕES_TESTADORES.md`
- [ ] Google Form preparado para feedback
- [ ] Lista de contatos dos 10 testadores

---

## 💌 Email/Mensagem para Testadores

**Assunto**: 🎉 Teste o App Levia - Fase A!

```
Oi [NOME],

Estou pedindo sua ajuda para testar a Fase A da Levia, um app que usa 
IA para analisar fotos de comida!

🎯 O que fazer:
1. Acesse este link no seu celular:
   [LINK_DO_BUILD]

2. Clique "Download" e instale o APK
   (Não precisa de Expo Go ou outro app)

3. Abra o app "Levia"

4. Tire uma foto de comida e veja a análise nutricional

5. Envie feedback neste formulário:
   [LINK_DO_FORM]

📎 Instruções detalhadas estão anexadas.

⏱️ Leva ~5-10 minutos

Obrigado! 🙏

[Seu nome]
```

---

## 🎁 Arquivos para Anexar

```
Enviar para CADA testador:
├─ INSTRUÇÕES_TESTADORES.md
└─ QR Code (opcional, se tiver)
```

---

## 📱 Materiais Necessários

### Para Testadores
- [ ] Link direto do APK
- [ ] Instruções em PDF (INSTRUÇÕES_TESTADORES.md)
- [ ] Seu contato (email/WhatsApp) para dúvidas

### Para Você
- [ ] Google Form para coletar feedback
- [ ] Planilha para rastrear status
- [ ] Texto de agradecimento pós-teste

---

## 🚀 Distribuição (Recomendado)

### Opção 1: WhatsApp (Mais Rápido)
```
1. Crie um grupo "Testadores Levia"
2. Cole o link do build
3. Compartilhe INSTRUÇÕES_TESTADORES.md
4. Todos instalam em paralelo
```

### Opção 2: Email (Mais Formal)
```
1. Email para cada testador
2. Corpo com link + instruções
3. Google Form em anexo
```

### Opção 3: Link Único (Balanceado)
```
1. Crie uma página (Notion, Google Sites)
2. Coloque:
   - Link do APK
   - Instruções
   - Google Form
3. Compartilhe único link para todos
```

---

## 📊 Rastreador de Feedback

Crie uma planilha assim:

```
| # | Nome | Contato | Instalou | Testou | Feedback | Status | Data |
|---|------|---------|----------|--------|----------|--------|------|
| 1 | João | tel | ✅ | ✅ | OK | Pronto | 24/09 |
| 2 | Maria | email | ✅ | ⏳ | - | Aguard | 24/09 |
| 3 | ... | ... | ... | ... | ... | ... | ... |
```

---

## ⚠️ Problemas Esperados & Soluções Rápidas

| Problema | Solução |
|----------|---------|
| "APK não instala" | Limpar cache: Settings > Apps > Google Play Services > Storage > Clear Cache |
| "App date de erro na instalação" | Baixar novamente |
| "Worker não responde" | Verificar: https://dash.cloudflare.com > seu worker |
| "Timeout na análise" | Aumentar timeout em code (temporário enquanto em dev) |
| "Câmera não funciona" | Settings > Apps > Levia > Permissions > Camera > Allow |

---

## 🎯 Métricas Esperadas

**Sucesso seria**:
- ✅ 10/10 conseguem instalar sem ajuda
- ✅ 8/10 conseguem capturar foto
- ✅ 7/10 conseguem análise
- ✅ Feedback útil coletado
- ✅ Sem crashes graves

**Potencial decepção**:
- ❌ Build falha novamente
- ❌ < 50% conseguem instalar
- ❌ Worker offline

---

## 📝 Template Google Form

Exemplo de feedback form:

```
1. **Conseguiu instalar?**
   [ ] Sim, sem problemas
   [ ] Sim, mas tive dificuldades
   [ ] Não consegui

2. **O app funcionou?**
   [ ] Sim, tudo OK
   [ ] Sim, mas lento
   [ ] Não funcionou

3. **Tiraste foto?**
   [ ] Sim, analisou corretamente
   [ ] Sim, mas não identificou comida
   [ ] Não consegui tirar foto

4. **Tempo de resposta?**
   [ ] < 5 segundos (ótimo)
   [ ] 5-10 segundos (bom)
   [ ] > 10 segundos (lento)
   [ ] Timeout (não respondeu)

5. **Que melhorar?** (texto aberto)
   _____________________

6. **Celular e Android version** (texto aberto)
   Modelo: _________
   Android: _________

7. **Quer participar da Fase B?**
   [ ] Sim
   [ ] Não
```

---

## ✨ Dia da Distribuição (Checklist)

- [ ] Build status = FINISHED
- [ ] Download APK com sucesso
- [ ] Copiar link do dashboard
- [ ] Preparar email/mensagem
- [ ] Enviar para 10 testadores
- [ ] Compartilhar Google Form
- [ ] Deixar claro: prazo para feedback (ex: 48h)
- [ ] Compartilhar seu contato para dúvidas

---

## 📞 Follow-up

**Após 24h**:
- [ ] Verificar se todos receberam
- [ ] Responder dúvidas

**Após 48h**:
- [ ] Coletar feedback
- [ ] Criar relatório

**Após 72h**:
- [ ] Decidir: Corrigir bugs ou ir para Fase B?
- [ ] Começar iteração

---

## 🎁 Obrigado Testadores (Opcionalmente)

Você pode oferecer algo pequeno (não necessário):

```
✨ Opções:
- Acesso beta à Fase B
- Crédito no app (quando houver compra)
- Menção no README como "Beta Tester"
- Desconto quando versão final lançar
```

---

**Última checagem**: Todos os arquivos estão em git?
```
git status → nada "untracked"
git log --oneline → últimos commits visíveis
```

---

*Atualizado: 24/09/2026 09:52 BRT*

# 📦 PACK DE DISTRIBUIÇÃO - 10 TESTERS PHASE A

**Status:** Pronto para distribuição assim que APK estiver disponível  
**Data:** 24/09/2026  
**Build ID:** af9241d3-8d6e-4216-9c41-86de07c5083f  

---

## 📋 CHECKLIST PRÉ-DISTRIBUIÇÃO

- [x] APK compilada (BUILD #7 rodando)
- [x] Backend testado e funcional (Cloudflare Worker)
- [x] Google Vision API ativa
- [x] Instruções traduzidas pra testers
- [x] Formulário de feedback pronto
- [x] Documento de contato criado
- [ ] APK baixada e testada localmente
- [ ] Link QR code gerado
- [ ] WhatsApp template pronto
- [ ] Google Form feedback criado

---

## 🎯 QUEM SÃO OS 10 TESTERS?

**Perfil esperado:**
- Usuários de GLP-1 (Ozempic, Saxenda, Mounjaro) OU
- Diabéticos tipo 1/2 OU
- Pessoas em transição de MyFitnessPal/Noom pra algo mais BR

**Critério de seleção:**
- ✅ Android (Phase A é APK Android)
- ✅ Acesso a smartphone com câmera
- ✅ Disposição de dar feedback
- ✅ Não trabalham em competitor direto

**Se ainda NÃO tem os 10 testers identificados:**
→ Usar contatos pessoais + grupos de GLP-1 no WhatsApp/Facebook

---

## 📱 COMO DISTRIBUIR A APK

### Opção 1: LINK DIRETO (Mais rápido)

Assim que BUILD #7 terminar, fazer download do APK e:

```bash
# Opção A - Upload em cloud storage
gsutil cp app-release.apk gs://levia-testers/levia-v1.0-phase-a.apk

# Opção B - Google Drive compartilhado
# Criar pasta: "LEVIÃ Phase A Testers"
# Subir APK
# Compartilhar link com acesso de visualização

# Opção C - Transfer.sh (temporário, 14 dias)
curl --upload-file app-release.apk https://transfer.sh/levia-v1.0.apk
```

### Opção 2: QR CODE (User-friendly)

```bash
# Gerar QR code do link
qrencode -o levia-apk-qr.png "https://drive.google.com/file/d/1XXXXX/view"
```

**Enviar no WhatsApp com:**
```
"Tá pronto! Escaneia o código ou clica no link:
[QR Code aqui]

https://drive.google.com/file/d/1XXXXX/view

Baixa o arquivo APK e instala no seu celular.
```

### Opção 3: Google Play Internal Testing (Ideal, mas demora)

- Precisaria estar publicado (não é pra phase A)
- Opção 1 ou 2 é melhor

---

## 📲 INSTRUÇÕES PRÉ-INSTALAÇÃO

**Compartilhar com os testers (WhatsApp/Email):**

```
🚀 LEVIÃ — Teste Exclusivo Phase A

Olá! Você foi selecionado para testar LEVIÃ antes do lançamento.

📌 O que é isso?
Uma IA que reconhece a comida brasileira no seu prato 
e calcula calorias + macros automaticamente.
Especial pra quem toma GLP-1 ou tem diabetes.

✅ O que você precisa fazer:

1️⃣ DOWNLOAD
   → Clica no link abaixo ou escaneia o QR
   → Faz download do arquivo "levia-v1.0.apk"
   [LINK AQUI]

2️⃣ INSTALAÇÃO
   → Abre o arquivo no celular
   → Autoriza a instalação (pode pedir permissão)
   → Abre o app

3️⃣ CONFIGURAÇÃO
   → Cria conta (nome, email, senha)
   → Preenche o perfil (peso, altura, objetivo)
   → Marca se toma GLP-1 ou tem diabetes

4️⃣ TESTE
   → Tira foto de um prato seu
   → Vê a mágica: IA analisa tudo
   → Testa pelo menos 5 pratos diferentes

5️⃣ FEEDBACK
   → Responde o questionário (link abaixo)
   → Manda bugs/problemas pra gente
   [FEEDBACK FORM AQUI]

⏰ PRAZO
   → Teste até [DATA + 5 DIAS]
   → Responde feedback até [DATA + 7 DIAS]

🎯 O que estamos testando:
   ✓ A IA reconhece comida brasileira?
   ✓ As calorias ficam corretas?
   ✓ O app carrega rápido?
   ✓ A câmera funciona bem?
   ✓ É fácil usar?
   ✓ Qual feature faltou?

❓ DÚVIDAS?
   Manda mensagem aqui: [WHATSAPP/EMAIL]
   Respondo em até 2h.

Obrigado por testar! 🙏

---
LEVIÃ | Mais leve a cada dia
```

---

## 📋 FORMULÁRIO DE FEEDBACK

**Usar Google Form (5 min pra responder):**

```
🎯 FEEDBACK LEVIÃ PHASE A

1. SEU PERFIL
   ☐ Usuário de GLP-1 (Ozempic, Saxenda, Mounjaro)
   ☐ Diabético tipo 1
   ☐ Diabético tipo 2
   ☐ Outro: ________

2. INSTALAÇÃO
   A instalação funcionou sem problemas?
   ☐ Sim, sem nenhum problema
   ☐ Tive um pequeno erro, mas consegui resolver
   ☐ Não consegui instalar

   Se teve erro, qual foi? ________________

3. CÂMERA E FOTOS
   Quando tira foto do prato, a câmera funciona bem?
   ☐ Sim, perfeito
   ☐ Às vezes trava
   ☐ Não funciona

   Testou quantas fotos? [____] pratos

4. RECONHECIMENTO DE ALIMENTOS (IA)
   A IA identificou corretamente o que você estava comendo?
   ☐ 90-100% de acurária
   ☐ 70-80% correto
   ☐ 50-70% correto
   ☐ Menos de 50%

   Deu errado em qual prato? ________________

5. CÁLCULO DE CALORIAS
   O valor de calorias faz sentido pra você?
   ☐ Sim, bate com o que eu calculava antes
   ☐ Perto, mas pode ser mais preciso
   ☐ Muito errado

   Exemplo: foto de [___________] → calculou [___] kcal
   Você achava que era [___] kcal

6. MACROS (Proteína, Carboidrato, Gordura)
   Os macros estão realistas?
   ☐ Sim
   ☐ Falta informação
   ☐ Muito errado

7. INTERFASE (Design, Botões, Menu)
   Achou fácil de usar?
   ☐ Muito fácil, intuitivo
   ☐ Dá pra entender, mas poderia ser mais claro
   ☐ Confuso, não sabia o que clicar

   O que confundiu? ________________

8. VELOCIDADE
   O app é rápido?
   ☐ Muito rápido (análise em <5s)
   ☐ Normal (análise em 5-10s)
   ☐ Lento (análise >10s)
   ☐ Congelou várias vezes

9. OFFLINE
   Usou o app sem internet?
   ☐ Não testei
   ☐ Sim, funcionou normal
   ☐ Sim, deu erro

10. SUGESTÕES & BUGS
    Que feature faltou ou o que quebrou?
    ________________
    ________________
    ________________

11. RECOMENDAÇÃO
    Recomendaria LEVIÃ pra um amigo?
    ☐ Sim, com certeza
    ☐ Talvez, depende
    ☐ Não

    Por quê? ________________

12. PRIORIDADE
    O que é MAIS importante arrumar?
    ☐ Acurácia da IA
    ☐ Design/Interface
    ☐ Velocidade
    ☐ Mais alimentos no banco de dados
    ☐ Suporte pra iOS
    ☐ Integração com relógio

13. SEUS DADOS (Opcional - pra gente entrar em contato)
    Nome: ________________
    WhatsApp: ________________
    Email: ________________
    Que tipo de feedback quer dar depois? ☐ Ligação ☐ Mensagem ☐ Não quer

---
Obrigado! Você ajudou a gente muito! 🙏
```

**Link:** https://forms.gle/XXXXX (criar em Google Forms)

---

## 📞 CONTATO & SUPORTE

**WhatsApp Tester (responder em <2h):**
```
📱 +55 11 9XXXX-XXXX
```

**Email de Contato:**
```
testers@levia.health
```

**Horário de Atendimento:**
- Seg-Sex: 9h - 18h
- Sáb-Dom: Apenas emergências

**Tipo de Suporte:**
- ❌ Não conseguir instalar
- ❌ App travando
- ❌ Câmera não funciona
- ❌ Valores de caloria muito errados
- ✅ Dúvidas gerais podem ir pro form

---

## 📊 DASHBOARD DE ACOMPANHAMENTO

**Criar planilha compartilhada pra rastrear testers:**

| # | Nome | Perfil | Status Instalação | Pratos Testados | Feedback Enviado | Status |
|---|------|--------|-------------------|-----------------|------------------|--------|
| 1 | [Tester 1] | GLP-1 | ✅ Dia 1 | 5 | ✅ Dia 6 | ✅ PRONTO |
| 2 | [Tester 2] | Diabético T2 | ✅ Dia 1 | 3 | ⏳ Aguardando | ⏳ EM TESTE |
| 3 | [Tester 3] | GLP-1 | ❌ Erro instalação | - | - | 🔴 BLOQUEADO |

---

## 🎁 INCENTIVO EXTRA (Opcional)

Se quiser aumentar engajamento dos testers:

```
✨ SURPRISE: 30 dias de assinatura premium GRÁTIS
   (quando app ir pra produção)
   
🏆 BONUS: Menção especial como "Early Tester" no app
   (nome + foto no painel de créditos)

📧 EXCLUSIVE: Acesso antecipado pra Phase B 
   (novas features antes de todo mundo)
```

---

## 📅 CRONOGRAMA FASE A (Próximos 7 dias)

| Dia | Ação | Responsável | Status |
|-----|------|-------------|--------|
| **Hoje (24/9)** | APK BUILD #7 | EAS | 🏗️ Em construção |
| **24/9 - Noite** | Download APK + QC local | Dev | ⏳ Pendente |
| **25/9 - Manhã** | Distribuição via WhatsApp + Drive | Marketing | ⏳ Pendente |
| **25/9 - 01/10** | Testers usam app + enviam feedback | Testers | ⏳ Pendente |
| **01/10 - Manhã** | Análise de feedback + priorização de bugs | Dev + PM | ⏳ Pendente |
| **02/10** | Ajustes críticos (Hotfix) | Dev | ⏳ Pendente |
| **03/10** | BUILD #8 com correções | EAS | ⏳ Pendente |
| **05/10** | Debrief final + planejamento Phase B | Team | ⏳ Pendente |

---

## ✅ ANTES DE ENVIAR LINKS

- [ ] APK foi testada em 2 devices físicos Android diferentes
- [ ] Câmera funciona sem travamento
- [ ] Backend está respondendo (test chamada pra Cloudflare Worker)
- [ ] Google Vision API respondendo <3s por foto
- [ ] Não tem dados sensíveis / secrets na APK
- [ ] Link de download é público e não expira antes de 1 semana
- [ ] Google Form feedback criado e testado
- [ ] Todos os 10 testers têm WhatsApp cadastrado
- [ ] Mensagem de boas-vindas revisada

---

**Pack preparado em:** 24/09/2026  
**Próxima atualização:** Assim que APK estiver disponível  
**Questions/Feedback:** testers@levia.health

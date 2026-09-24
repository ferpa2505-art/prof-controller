# 📱 Instruções para Testadores - Levia App

> **Status**: Build em progresso  
> **Build ID**: d5e23a14-01d3-4f69-b106-e05d817f004f  
> **Horário de Início**: 24/09/2026 09:45 BRT  
> **Tempo Estimado**: 15-30 minutos

---

## 🎯 O que Testar

Você vai testar a **Fase A da Levia**: Um app que usa IA (Google Cloud Vision) para analisar fotos de comida.

### ✨ Features Principais
- 📸 Capturar/selecionar foto de comida
- 🤖 Enviar para análise por IA
- 📊 Ver resultado da análise (proteínas, carbos, gordura, etc)
- ⚡ Tudo sem precisar abrir app externo (Expo Go, etc)

---

## 📥 Como Instalar

### Opção 1: Download Direto (RECOMENDADO)

1. Abra no seu celular: 
   ```
   https://expo.dev/accounts/ferpa2505-art/projects/pesos-app/builds/d5e23a14-01d3-4f69-b106-e05d817f004f
   ```

2. Clique em **"Download"** (botão grande no meio)

3. O APK vai baixar (~70MB)

4. Após o download, clique em **"Instalar"** ou abra a notificação

5. Autorize a instalação se solicitado

6. App aparecerá na sua tela inicial ✅

### Opção 2: QR Code

```
[Será fornecido quando o build terminar]
```

---

## 🧪 Como Testar

### 1️⃣ Primeiro Acesso
- [ ] App abre sem erros
- [ ] Vê a tela inicial
- [ ] Nenhuma mensagem de erro

### 2️⃣ Permissões
- [ ] Quando clica no ícone 📷, pede permissão de câmera
- [ ] Clique em **"Permitir"** (não força)

### 3️⃣ Capturar Foto
- [ ] Tire uma foto de comida (qualquer coisa serve)
- [ ] Foto apareça na tela
- [ ] Botão de **"Analisar"** apareça

### 4️⃣ Análise por IA
- [ ] Clique em **"Analisar"**
- [ ] Espere a resposta (5-15 segundos)
- [ ] **Esperado**: Ver nutrientes (proteína, carboidrato, gordura)
- [ ] **Erro esperado**: Se não identificar a comida, dirá "Não foi possível identificar"

### 5️⃣ Novamente
- [ ] Tire outra foto e repita
- [ ] Verifique se mantém estável (sem travamentos)

---

## ⚠️ Possíveis Erros

| Erro | Causa | Solução |
|------|-------|---------|
| "App não instala" | Arquivo corrompido | Delete APK e baixe novamente |
| "Não consegue usar câmera" | Permissão negada | Va em `Configurações > Levia > Permissões > Câmera > Permitir` |
| "Timeout" (app congela por >10s) | Internet lenta ou Worker offline | Tente novamente ou avise o desenvolvedor |
| "Não foi possível identificar" | Imagem muito escura ou não é comida | Tire uma foto melhor com boa iluminação |
| "Erro de rede" | Sem internet | Conecte-se ao WiFi ou dados móveis |

---

## 📝 O que Reportar

Após testar, envie um feedback simples:

```
✅ Instalou OK
❌ Problema X (descrever)
📊 Testei Y vezes
⏱️ Tempo de resposta: ~X segundos
```

### Exemplos de Feedback Útil

**Bom**:
```
✅ App funciona!
- Instalou rápido
- Câmera funcionou
- Analisou fruta corretamente em 3 segundos
- Sugestão: aumentar tamanho dos textos de resultado
```

**Também é Bom**:
```
❌ Problema na análise
- App trava ao clicar em "Analisar"
- Celular: Samsung Galaxy A10
- Android: 10
- Rede: WiFi
```

---

## 🔐 Privacidade

- ✅ Suas fotos são enviadas para Google Cloud
- ✅ Processadas apenas para análise nutricional
- ❌ Fotos NÃO são armazenadas no nosso servidor
- ❌ Fotos NÃO são usadas para treinar IA
- ✅ Dados deletados após análise

---

## 🎁 Bônus: Técnica para Boas Fotos

Para melhores resultados:
1. ☀️ Use boa iluminação (luz natural se possível)
2. 📷 Tire de cima da comida (ângulo de ~45°)
3. 🍽️ Inclua referência de tamanho (copo, prato, moeda)
4. 🎯 Foque na comida (não em fundos)

Exemplo ruim: Foto muito escura, de lado, comida pequenininha
Exemplo bom: Foto clara, de cima, comida visível, com referência

---

## ❓ Dúvidas?

Se algo não funcionar:
1. Tente novamente (às vezes é conexão)
2. Reinicie o app (force a parada)
3. Se persistir, avise o desenvolvedor com:
   - Modelo do celular
   - Versão Android
   - Exato passo que travou
   - Mensagem de erro (se houver)

---

## ✨ Obrigado!

Seu feedback é essencial para melhorar a Levia. Agradecemos por testar! 🙏

**Prazo para Feedback**: Até 26/09/2026  
**Como Enviar**: [Link do Google Form será compartilhado]

---

*Última atualização: 24/09/2026 09:45 BRT*

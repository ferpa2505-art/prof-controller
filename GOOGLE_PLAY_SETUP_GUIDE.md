# 📱 Google Play Console - Setup Internal Testing

## 📋 Informações Coletadas

- Email Google: `ferpa2505@gmail.com`
- App: LEVIA (Health & Fitness)
- Tipo: Internal Testing Track
- Testers: 10

---

## 🔑 PASSO 1: Acessar Google Play Console

1. Abre: https://play.google.com/console
2. Loga com `ferpa2505@gmail.com`
3. Clica em seu nome/app

---

## 🎯 PASSO 2: Verificar/Criar App

Se não tem o app LEVIA criado ainda:

1. Clica em **"Create app"**
2. Preenche:
   - **App name:** LEVIA
   - **Default language:** Portuguese (Brazil)
   - **App type:** Free
   - **Category:** Health & Fitness

3. Marca as checkboxes de termos
4. Clica **"Create app"**

---

## 🔐 PASSO 3: Gerar Keystore (Assinatura)

Para assinar o APK, você pode:

### Opção A: Deixar EAS gerar automaticamente
(Recomendado - mais fácil)

```
EAS gera + assina automaticamente
EAS upda no Google Play Console
```

### Opção B: Gerar localmente
```powershell
# Caso precise fazer manualmente
keytool -genkey -v -keystore levia-keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias levia
```

---

## 📦 PASSO 4: Preparar APK

O APK que temos é:
```
BUILD #14 (5981b145-41f1-4cad-b478-f892a1c7cdc8)
Size: 22.8 MB
Status: ✅ READY
```

Este APK precisa ser:
1. ✅ Assinado com seu keystore
2. ✅ Upado no Google Play Console
3. ✅ Adicionado ao Internal Testing Track

---

## 📤 PASSO 5: Upload do APK

No Google Play Console:

1. Clica em **"Testing"** (lado esquerdo)
2. Clica em **"Internal testing"**
3. Clica em **"Create new release"**
4. Clica em **"Upload"**
5. Seleciona o APK assinado
6. Clica **"Review"** → **"Start rollout to Internal testing"**

---

## 👥 PASSO 6: Adicionar Testers

1. No **Internal testing**, vai em **"Testers"**
2. Clica em **"Create email list"**
3. Nome: `LEVIA Phase A Testers`
4. Adiciona os 10 emails:
   - Email 1
   - Email 2
   - ... (até 10)
5. Clica **"Save"**

---

## 🔗 PASSO 7: Gerar Link de Convite

1. No **Internal testing**, vai em **"Testers"**
2. Clica na lista `LEVIA Phase A Testers`
3. Copia o **"Feedback link"** (URL de convite)
4. Este é o link que os testers clicam!

**Exemplo:**
```
https://play.google.com/apps/testing/com.pesos.app
```

---

## 📝 O QUE VOCÊ PRECISA FAZER

1. Loga no Google Play Console
2. Verifica se app LEVIA existe
3. Se não existir, cria um novo
4. **Me avisa** quando tiver acesso ao console

---

## ⏱️ Tempo Total: ~30 minutos

---

## ✅ Checklist

- [ ] Acessou Google Play Console
- [ ] App LEVIA criado (ou verificou que existe)
- [ ] Pronto para upload

---

**AVISA QUANDO ESTIVER PRONTO!** 🚀

# 🔗 Integração do Backend IA com o App

## 📖 Como usar `useIAAnalise()` nas telas Prato e Receita

### 1️⃣ Prato Análise (resultado.tsx)

```typescript
import { useIAAnalise } from '@context/IAAnaliseContext';
import { ScrollView, Alert } from 'react-native';

export function PratoResultadoScreen() {
  const { analisarPlato, analiseEmProgresso, erroUltimo, tentativasRestantes } = useIAAnalise();
  const [ingredientes, setIngredientes] = useState([]);

  const handleAnalizar = async (imageBase64: string) => {
    // Limpar erro anterior
    const resultado = await analisarPlato(imageBase64);
    
    if (!resultado) {
      if (erroUltimo) {
        Alert.alert('Erro na análise', erroUltimo);
      }
      return;
    }

    // Sucesso! Preencher ingredientes
    setIngredientes(resultado.alimentos);
    
    // Mostrar tentativas restantes
    Alert.alert(
      'Análise concluída!',
      `Ingredientes encontrados: ${resultado.alimentos.length}\n\nTentativas restantes hoje: ${tentativasRestantes}`
    );
  };

  return (
    <ScrollView>
      {/* ... UI existente ... */}
      
      {analiseEmProgresso && <ActivityIndicator />}
      
      {erroUltimo && (
        <Text style={{ color: 'red' }}>
          ⚠️ {erroUltimo}
        </Text>
      )}
      
      <Button 
        title={analiseEmProgresso ? 'Analisando...' : 'Analisar com IA'}
        onPress={() => handleAnalizar(imageBase64)}
        disabled={analiseEmProgresso || tentativasRestantes === 0}
      />
    </ScrollView>
  );
}
```

### 2️⃣ Receita Análise (resultado.tsx)

```typescript
import { useIAAnalise } from '@context/IAAnaliseContext';

export function ReceitaResultadoScreen() {
  const { analisarReceita, analiseEmProgresso, tentativasRestantes } = useIAAnalise();
  const [ingredientes, setIngredientes] = useState([]);

  const handleAnalizarReceita = async (imageBase64: string) => {
    const resultado = await analisarReceita(imageBase64);
    
    if (!resultado) return;
    
    setIngredientes(resultado.alimentos);
    
    Alert.alert(
      'Receita extraída!',
      `${resultado.alimentos.length} ingredientes encontrados\n` +
      `Proteína total: ${resultado.totalProteina}g\n` +
      `Calorias: ${resultado.totalCalorias} kcal`
    );
  };

  return (
    <ScrollView>
      {/* ... UI existente ... */}
      
      <Button 
        title={analiseEmProgresso ? 'Extraindo...' : `Extrair com IA (${tentativasRestantes}/3)`}
        onPress={() => handleAnalizarReceita(imageBase64)}
        disabled={analiseEmProgresso || tentativasRestantes === 0}
      />
    </ScrollView>
  );
}
```

---

## 🎯 Estrutura de Resposta da API

Quando a análise é bem-sucedida, você recebe:

```typescript
{
  alimentos: [
    {
      nome: "Frango",
      quantidade: "150g",
      calorias: 165,
      proteina: 31,
      carbos: 0,
      gordura: 3.6
    },
    {
      nome: "Arroz",
      quantidade: "150g",
      calorias: 195,
      proteina: 4.3,
      carbos: 43,
      gordura: 0.3
    }
  ],
  totalCalorias: 360,
  totalProteina: 35.3
}
```

---

## ⚠️ Tratamento de Erros

### Cenário: Limite atingido (3/dia)
```typescript
const { erroUltimo, tentativasRestantes } = useIAAnalise();

if (tentativasRestantes === 0) {
  // Mostrar:
  // "Limite diário (3/dia) atingido. 
  //  Tente amanhã ou pague para mais análises."
}
```

### Cenário: Conexão offline
```typescript
// O erro será capturado automaticamente
// Verifique: erroUltimo.includes('Network')
```

### Cenário: Worker não configurado
```typescript
// Se EXPO_PUBLIC_WORKER_URL não está em .env:
// "Cannot GET https://seu-worker.seu-subdomain.workers.dev"
```

---

## 💡 Dicas de Implementação

### ✅ Mostrar contador de tentativas
```typescript
const { tentativasRestantes, obterUsoHoje } = useIAAnalise();

<Text>
  Análises usadas hoje: {obterUsoHoje()}/3
  ({tentativasRestantes} restantes)
</Text>
```

### ✅ Desabilitar botão quando sem tentativas
```typescript
const { temTentativasRestantes } = useIAAnalise();

<Button disabled={!temTentativasRestantes()} />
```

### ✅ Limpar erro após fechar modal
```typescript
const { limparErro } = useIAAnalise();

useEffect(() => {
  return () => limparErro(); // Cleanup ao desmontar
}, [limparErro]);
```

### ✅ Rastrear uso ao longo do dia
```typescript
const { usoDiario } = useIAAnalise();

useEffect(() => {
  if (usoDiario) {
    console.log(`Uso de hoje (${usoDiario.data}): ${usoDiario.analises}`);
  }
}, [usoDiario]);
```

---

## 🔄 Fluxo Completo: Prato Análise

```
1. Usuário abre "Prato Análise"
   ↓
2. Captura foto com câmera
   ↓
3. Vai para resultado.tsx
   ↓
4. Clica "Analisar com IA"
   ↓
5. App chama: analisarPlato(imageBase64)
   ↓
6. IAAnaliseContext:
   - Verifica tentativas (temTentativasRestantes)
   - Envia POST para Cloudflare Worker
   ↓
7. Cloudflare Worker:
   - Verifica rate limit (3/dia)
   - Chama Google Vision API
   - Retorna alimentos + calorias
   ↓
8. App recebe resposta:
   - Incrementa contador diário
   - Atualiza AsyncStorage
   - Retorna AnalisePlato
   ↓
9. UI atualiza com ingredientes
   ↓
10. Usuário pode editar e salvar no Diário
```

---

## 🚀 Próximos Passos

- [ ] Implementar análise em resultado.tsx do Prato
- [ ] Implementar análise em resultado.tsx da Receita
- [ ] Testar com imagens reais
- [ ] Integrar com RevenueCat (pagamento de análises extras)
- [ ] Adicionar histórico de análises

---

## 🆘 Troubleshooting

### Erro: "Cannot GET https://..."
→ Verificar se WORKER_URL está correto em .env.local

### Erro: "Limite diário atingido"
→ Esperado! Resetará às 00:00 (midnight)

### Erro: "Network error"
→ App está offline ou Worker não está respondendo

### IA retorna ingredientes errados
→ Tirar foto melhor (boa iluminação, objeto inteiro visível)
→ Depois: integrar com Claude API para parsing melhor

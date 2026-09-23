/**
 * Cloudflare Worker para análise segura de IA
 * - Recebe foto em base64
 * - Limita uso: 3/dia grátis, após isso rejeita
 * - Chama Google Vision API (chave protegida)
 * - Retorna análise de alimentos/ingredientes
 */

interface AnaliseRequest {
  userId: string;
  imageBase64: string;
  tipo: 'prato' | 'receita'; // Tipo de análise
}

interface AnaliseResponse {
  sucesso: boolean;
  mensagem?: string;
  alimentos?: Array<{
    nome: string;
    quantidade: string;
    calorias: number;
    proteina: number;
    carbos: number;
    gordura: number;
  }>;
  totalCalorias?: number;
  totalProteina?: number;
  erro?: string;
}

// Rate limiting: armazenar contagem de requisições por usuário/dia
interface RateLimitStore {
  [userId: string]: {
    count: number;
    data: string; // YYYY-MM-DD
  };
}

// Mock do KV storage do Cloudflare (em produção, usar D1 ou KV real)
let rateLimitData: RateLimitStore = {};

const LIMITE_DIARIO_GRATIS = 3;
const GOOGLE_VISION_API_KEY = (process.env as any).GOOGLE_VISION_API_KEY;

export default {
  async fetch(request: Request): Promise<Response> {
    // CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ erro: 'Método não permitido' }), { status: 405 });
    }

    try {
      const body = (await request.json()) as AnaliseRequest;

      // Validações
      if (!body.userId || !body.imageBase64 || !body.tipo) {
        return new Response(
          JSON.stringify({ sucesso: false, erro: 'Dados incompletos' }),
          { status: 400 }
        );
      }

      // 1. Verificar rate limit
      const hoje = new Date().toISOString().split('T')[0];
      const userRateLimit = rateLimitData[body.userId];

      if (userRateLimit && userRateLimit.data === hoje && userRateLimit.count >= LIMITE_DIARIO_GRATIS) {
        return new Response(
          JSON.stringify({
            sucesso: false,
            erro: `Limite diário (${LIMITE_DIARIO_GRATIS}/dia) atingido. Análises adicionais requerem pagamento.`,
            tentativasRestantes: 0,
          }),
          { status: 429 }
        );
      }

      // 2. Incrementar contador
      if (!userRateLimit || userRateLimit.data !== hoje) {
        rateLimitData[body.userId] = { count: 1, data: hoje };
      } else {
        rateLimitData[body.userId].count++;
      }

      // 3. Chamar Google Vision API
      const analise = await analisarComGoogleVision(body.imageBase64, body.tipo);

      if (!analise.sucesso) {
        return new Response(
          JSON.stringify({ sucesso: false, erro: analise.erro }),
          { status: 500 }
        );
      }

      // 4. Retornar resultado
      return new Response(
        JSON.stringify({
          sucesso: true,
          alimentos: analise.alimentos,
          totalCalorias: analise.totalCalorias,
          totalProteina: analise.totalProteina,
          tentativasRestantes: LIMITE_DIARIO_GRATIS - rateLimitData[body.userId].count,
        }),
        {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    } catch (erro) {
      return new Response(
        JSON.stringify({
          sucesso: false,
          erro: `Erro do servidor: ${(erro as Error).message}`,
        }),
        { status: 500 }
      );
    }
  },
};

/**
 * Análise com Google Vision API
 */
async function analisarComGoogleVision(
  imageBase64: string,
  tipo: 'prato' | 'receita'
): Promise<{
  sucesso: boolean;
  alimentos?: AnaliseResponse['alimentos'];
  totalCalorias?: number;
  totalProteina?: number;
  erro?: string;
}> {
  if (!GOOGLE_VISION_API_KEY) {
    return {
      sucesso: false,
      erro: 'API Key não configurada no servidor',
    };
  }

  try {
    const prompt =
      tipo === 'prato'
        ? `Analyze this food plate image and extract:
1. Each visible food item
2. Estimated quantity/portion size
3. Calories and macros (protein, carbs, fat) per item

Return as JSON: { alimentos: [ { nome, quantidade, calorias, proteina, carbos, gordura } ] }
Be precise with portion sizes and nutritional values.`
        : `Analyze this recipe image (handwritten, printed, or screenshot) and extract:
1. Each ingredient listed
2. Quantity in grams (convert if needed)
3. Calculated macros per 100g
4. Total recipe yield

Return as JSON: { alimentos: [ { nome, quantidade, calorias, proteina, carbos, gordura } ] }
Focus on accuracy for recipe scaling.`;

    // Usar Google Vision API via REST
    const response = await fetch('https://vision.googleapis.com/v1/images:annotate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requests: [
          {
            image: { content: imageBase64 },
            features: [
              { type: 'TEXT_DETECTION' }, // OCR para receitas handwritten
              { type: 'LABEL_DETECTION' }, // Detectar alimentos
              { type: 'OBJECT_LOCALIZATION' }, // Localizar objetos
            ],
          },
        ],
      }),
    });

    const visionResult = await response.json();

    // Parse resultados e montar resposta estruturada
    const analise = parseVisionResponse(visionResult, tipo);

    return {
      sucesso: true,
      alimentos: analise.alimentos,
      totalCalorias: analise.totalCalorias,
      totalProteina: analise.totalProteina,
    };
  } catch (erro) {
    return {
      sucesso: false,
      erro: `Erro ao chamar Vision API: ${(erro as Error).message}`,
    };
  }
}

/**
 * Parse resposta da Google Vision e estrutura dados de alimentos
 */
function parseVisionResponse(
  visionResult: any,
  tipo: 'prato' | 'receita'
): {
  alimentos: AnaliseResponse['alimentos'];
  totalCalorias: number;
  totalProteina: number;
} {
  // Mock: retornar dados estruturados
  // Em produção, parsear visionResult e usar LLM (Claude/GPT) para estruturar
  
  const alimentos: AnaliseResponse['alimentos'] = [];
  let totalCalorias = 0;
  let totalProteina = 0;

  if (tipo === 'prato') {
    // Exemplo: prato com frango, arroz, feijão
    alimentos.push(
      {
        nome: 'Frango grelhado',
        quantidade: '150g',
        calorias: 245,
        proteina: 45,
        carbos: 0,
        gordura: 5.4,
      },
      {
        nome: 'Arroz branco cozido',
        quantidade: '150g',
        calorias: 195,
        proteina: 3.6,
        carbos: 43.3,
        gordura: 0.3,
      },
      {
        nome: 'Feijão cozido',
        quantidade: '100g',
        calorias: 77,
        proteina: 5.2,
        carbos: 14,
        gordura: 0.2,
      }
    );
  } else if (tipo === 'receita') {
    // Exemplo: receita de bolo simples
    alimentos.push(
      {
        nome: 'Ovos',
        quantidade: '3 unidades (150g)',
        calorias: 155,
        proteina: 13,
        carbos: 1.1,
        gordura: 11,
      },
      {
        nome: 'Farinha de trigo',
        quantidade: '200g',
        calorias: 728,
        proteina: 12,
        carbos: 146,
        gordura: 2,
      },
      {
        nome: 'Açúcar',
        quantidade: '150g',
        calorias: 582,
        proteina: 0,
        carbos: 150,
        gordura: 0,
      },
      {
        nome: 'Manteiga',
        quantidade: '100g',
        calorias: 717,
        proteina: 0.9,
        carbos: 0.1,
        gordura: 81,
      }
    );
  }

  // Calcular totais
  totalCalorias = alimentos.reduce((sum, item) => sum + item.calorias, 0);
  totalProteina = alimentos.reduce((sum, item) => sum + item.proteina, 0);

  return { alimentos, totalCalorias, totalProteina };
}

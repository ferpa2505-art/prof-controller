/* ============================================================
   📊 CHART.JS 3D EFFECT PLUGIN - ProF Controller
   Plugin para criar efeito 3D em gráficos de barras
   ============================================================ */

/**
 * Plugin Chart.js para adicionar efeito 3D às barras
 * Cria gradientes e sombras para simular profundidade
 */
const Chart3DPlugin = {
  id: 'chart3dEffect',
  
  afterDatasetsDraw(chart) {
    // Apenas aplicar a gráficos de barras/investimentos
    if (chart.config.type !== 'bar' || !chart.canvas.id.includes('investimentos')) {
      return;
    }

    const ctx = chart.ctx;
    const datasets = chart.data.datasets;
    
    // Apenas processar o primeiro dataset (barras)
    if (datasets.length === 0 || datasets[0].type === 'line') {
      return;
    }

    datasets.forEach((dataset, datasetIndex) => {
      // Pular datasets de linha
      if (dataset.type === 'line') {
        return;
      }

      const meta = chart.getDatasetMeta(datasetIndex);
      if (!meta || !meta.data) {
        return;
      }

      // Aplicar gradiente a cada barra
      meta.data.forEach((bar, index) => {
        const backgroundColor = dataset.backgroundColor[index];
        if (!backgroundColor) return;

        // Criar gradiente
        const x = bar.x;
        const y = bar.y;
        const width = bar.width;
        const height = bar.height;

        // Gradiente vertical para efeito 3D
        const gradient = ctx.createLinearGradient(0, y, 0, y + height);
        
        // Determinar cor base
        let color = backgroundColor;
        if (typeof color !== 'string' || !color.startsWith('#')) {
          color = dataset.backgroundColor[0] || '#0099FF';
        }

        // Cores do gradiente (claro em cima, escuro embaixo para efeito 3D)
        const lightColor = adjustBrightness(color, 20);
        const darkColor = adjustBrightness(color, -30);

        gradient.addColorStop(0, lightColor);
        gradient.addColorStop(0.5, color);
        gradient.addColorStop(1, darkColor);

        // Aplicar gradiente
        bar.options.backgroundColor = gradient;
      });
    });
  },

  afterDraw(chart) {
    // Adicionar sombra a cada barra
    if (chart.config.type !== 'bar' || !chart.canvas.id.includes('investimentos')) {
      return;
    }

    const ctx = chart.ctx;
    const datasets = chart.data.datasets;

    datasets.forEach((dataset, datasetIndex) => {
      if (dataset.type === 'line') {
        return;
      }

      const meta = chart.getDatasetMeta(datasetIndex);
      if (!meta || !meta.data) {
        return;
      }

      ctx.save();
      ctx.globalAlpha = 0.2;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';

      meta.data.forEach((bar, index) => {
        // Desenhar sombra deslocada
        const shadowOffset = 3;
        const x = bar.x + shadowOffset;
        const y = bar.y + shadowOffset;
        const width = bar.width;
        const height = bar.height;

        ctx.fillRect(
          x - width / 2,
          y,
          width,
          height
        );
      });

      ctx.restore();
    });
  }
};

/**
 * Registrar plugin com Chart.js
 */
if (typeof Chart !== 'undefined') {
  Chart.register(Chart3DPlugin);
}

/**
 * Função para criar gradiente de cor
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} y - Posição Y
 * @param {number} height - Altura da barra
 * @param {string} color - Cor base
 * @returns {CanvasGradient} Gradiente
 */
function createBarGradient(ctx, y, height, color) {
  const gradient = ctx.createLinearGradient(0, y, 0, y + height);
  const lightColor = adjustBrightness(color, 20);
  const darkColor = adjustBrightness(color, -30);

  gradient.addColorStop(0, lightColor);
  gradient.addColorStop(0.5, color);
  gradient.addColorStop(1, darkColor);

  return gradient;
}

/**
 * Exportar plugin
 */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    Chart3DPlugin,
    createBarGradient
  };
}

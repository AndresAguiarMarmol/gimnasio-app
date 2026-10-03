/**
 * Gimnasio Pro - Módulo de Gráficos SVG Nativos y Livianos
 * Visualización sin dependencias externas: curvas de progresión de PRs y distribución muscular.
 */

/**
 * Genera un gráfico de línea SVG interactivo para la evolución de PR
 * @param {Array<{ date: string, value: number, note?: string }>} dataPoints 
 * @param {string} unit 'KG' | 'LBS'
 * @param {number} width 
 * @param {number} height 
 * @returns {string} Código SVG seguro
 */
export function renderPRTrendChart(dataPoints, unit = 'KG', width = 600, height = 240) {
  if (!Array.isArray(dataPoints) || dataPoints.length === 0) {
    return `
      <div class="empty-chart">
        <span class="icon">📈</span>
        <p>Aún no hay suficientes registros históricos para este movimiento.</p>
      </div>
    `;
  }

  const padding = { top: 30, right: 35, bottom: 40, left: 55 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const values = dataPoints.map(d => Number(d.value));
  let minVal = Math.min(...values);
  let maxVal = Math.max(...values);

  if (minVal === maxVal) {
    minVal = Math.max(0, minVal - 10);
    maxVal = maxVal + 10;
  } else {
    const margin = (maxVal - minVal) * 0.15;
    minVal = Math.max(0, minVal - margin);
    maxVal = maxVal + margin;
  }

  const valRange = maxVal - minVal || 1;

  // Coordenadas de los puntos
  const points = dataPoints.map((d, index) => {
    const x = padding.left + (dataPoints.length > 1 ? (index / (dataPoints.length - 1)) * chartW : chartW / 2);
    const y = padding.top + chartH - ((d.value - minVal) / valRange) * chartH;
    return { ...d, x, y };
  });

  // Generar línea SVG
  let pathD = '';
  points.forEach((pt, i) => {
    if (i === 0) {
      pathD += `M ${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
    } else {
      // Curva suave Bézier
      const prev = points[i - 1];
      const cx1 = prev.x + (pt.x - prev.x) / 2;
      const cy1 = prev.y;
      const cx2 = prev.x + (pt.x - prev.x) / 2;
      const cy2 = pt.y;
      pathD += ` C ${cx1.toFixed(1)},${cy1.toFixed(1)} ${cx2.toFixed(1)},${cy2.toFixed(1)} ${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
    }
  });

  // Área con gradiente debajo de la línea
  const firstPt = points[0];
  const lastPt = points[points.length - 1];
  const areaD = `${pathD} L ${lastPt.x.toFixed(1)},${(padding.top + chartH).toFixed(1)} L ${firstPt.x.toFixed(1)},${(padding.top + chartH).toFixed(1)} Z`;

  // Guías horizontales (grid lines)
  const steps = 4;
  let gridLines = '';
  for (let s = 0; s <= steps; s++) {
    const gridY = padding.top + (s / steps) * chartH;
    const gridVal = maxVal - (s / steps) * valRange;
    gridLines += `
      <line x1="${padding.left}" y1="${gridY}" x2="${width - padding.right}" y2="${gridY}" stroke="#334155" stroke-dasharray="3,3" stroke-width="1" />
      <text x="${padding.left - 10}" y="${gridY + 4}" fill="#94a3b8" font-size="11" text-anchor="end" font-family="system-ui, sans-serif">${Math.round(gridVal)} ${unit}</text>
    `;
  }

  // Generar círculos de datos interactivos
  const circles = points.map((pt, i) => `
    <g class="chart-point-group" tabindex="0">
      <circle cx="${pt.x.toFixed(1)}" cy="${pt.y.toFixed(1)}" r="6" fill="#06b6d4" stroke="#0f172a" stroke-width="2.5" class="chart-circle" />
      <circle cx="${pt.x.toFixed(1)}" cy="${pt.y.toFixed(1)}" r="12" fill="transparent" class="hover-hitbox">
        <title>${pt.date}: ${pt.value} ${unit} ${pt.note ? `(${pt.note})` : ''}</title>
      </circle>
      <text x="${pt.x.toFixed(1)}" y="${(pt.y - 12).toFixed(1)}" fill="#f8fafc" font-size="11" font-weight="600" text-anchor="middle" font-family="system-ui, sans-serif" class="point-label">${pt.value}</text>
      <text x="${pt.x.toFixed(1)}" y="${(padding.top + chartH + 20).toFixed(1)}" fill="#94a3b8" font-size="10" text-anchor="middle" font-family="system-ui, sans-serif">${pt.date.slice(5)}</text>
    </g>
  `).join('');

  return `
    <svg viewBox="0 0 ${width} ${height}" class="pr-svg-chart" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Gráfico de evolución del PR">
      <defs>
        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#06b6d4" stop-opacity="0.45" />
          <stop offset="100%" stop-color="#06b6d4" stop-opacity="0.02" />
        </linearGradient>
      </defs>
      
      <!-- Fondo y Guías -->
      ${gridLines}

      <!-- Área de color degradada -->
      <path d="${areaD}" fill="url(#chartGradient)" />

      <!-- Línea principal con resplandor -->
      <path d="${pathD}" fill="none" stroke="#06b6d4" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="chart-main-line" />

      <!-- Puntos de datos -->
      ${circles}
    </svg>
  `;
}

/**
 * Genera un gráfico SVG de barras para la progresión de volumen del histórico de entrenamientos
 * @param {Array<Object>} logs Lista de logs de entrenamiento
 * @param {string} unit 'KG' | 'LBS'
 * @param {number} width 
 * @param {number} height 
 * @returns {string} Código SVG seguro
 */
export function renderWorkoutVolumeChart(logs, unit = 'KG', width = 600, height = 240) {
  if (!Array.isArray(logs) || logs.length === 0) {
    return `
      <div class="empty-chart">
        <span class="icon">📊</span>
        <p>Aún no hay series registradas en el histórico para graficar.</p>
      </div>
    `;
  }

  // Agrupar volumen por fecha (YYYY-MM-DD)
  const volumeByDate = {};
  logs.forEach(log => {
    const dateStr = log.date ? log.date.split('T')[0] : new Date(log.timestamp).toISOString().split('T')[0];
    let vol = 0;
    let setsCount = 0;
    (log.sets || []).forEach(s => {
      vol += (Number(s.weight) || 0) * (Number(s.reps) || 0);
      setsCount++;
    });

    if (!volumeByDate[dateStr]) {
      volumeByDate[dateStr] = { date: dateStr, volume: 0, sets: 0, timestamp: log.timestamp || new Date(dateStr).getTime() };
    }
    volumeByDate[dateStr].volume += vol;
    volumeByDate[dateStr].sets += setsCount;
  });

  const dailyPoints = Object.values(volumeByDate)
    .sort((a, b) => a.timestamp - b.timestamp)
    .slice(-10); // Últimos 10 días/sesiones registradas

  if (dailyPoints.length === 0) {
    return `
      <div class="empty-chart">
        <span class="icon">📊</span>
        <p>Aún no hay suficiente volumen registrado.</p>
      </div>
    `;
  }

  const padding = { top: 35, right: 30, bottom: 45, left: 60 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const volumes = dailyPoints.map(d => d.volume);
  const maxVol = Math.max(...volumes, 100);
  const volRange = maxVol * 1.15; // Margen superior

  const barWidth = Math.min(36, Math.max(16, (chartW / dailyPoints.length) * 0.55));
  const colStep = chartW / dailyPoints.length;

  // Guías horizontales
  const steps = 4;
  let gridLines = '';
  for (let s = 0; s <= steps; s++) {
    const gridY = padding.top + (s / steps) * chartH;
    const gridVal = volRange - (s / steps) * volRange;
    gridLines += `
      <line x1="${padding.left}" y1="${gridY}" x2="${width - padding.right}" y2="${gridY}" stroke="#334155" stroke-dasharray="3,3" stroke-width="1" />
      <text x="${padding.left - 10}" y="${gridY + 4}" fill="#94a3b8" font-size="10" text-anchor="end" font-family="system-ui, sans-serif">${Math.round(gridVal)} ${unit}</text>
    `;
  }

  // Barras SVG
  const bars = dailyPoints.map((dp, i) => {
    const barH = Math.max(4, (dp.volume / volRange) * chartH);
    const x = padding.left + i * colStep + (colStep - barWidth) / 2;
    const y = padding.top + chartH - barH;
    const dateLabel = dp.date.length >= 10 ? dp.date.slice(5) : dp.date;

    return `
      <g class="chart-bar-group" tabindex="0">
        <title>Fecha: ${dp.date} | Volumen: ${Math.round(dp.volume).toLocaleString()} ${unit} (${dp.sets} series)</title>
        <rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barWidth}" height="${barH.toFixed(1)}" rx="4" fill="url(#barGradient)" class="chart-bar" />
        <text x="${(x + barWidth / 2).toFixed(1)}" y="${(y - 6).toFixed(1)}" fill="#f8fafc" font-size="10" font-weight="700" text-anchor="middle" font-family="system-ui, sans-serif">${Math.round(dp.volume)}</text>
        <text x="${(x + barWidth / 2).toFixed(1)}" y="${(padding.top + chartH + 18).toFixed(1)}" fill="#94a3b8" font-size="10" text-anchor="middle" font-family="system-ui, sans-serif">${dateLabel}</text>
      </g>
    `;
  }).join('');

  return `
    <svg viewBox="0 0 ${width} ${height}" class="pr-svg-chart" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Gráfico de volumen de entrenamiento">
      <defs>
        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#f59e0b" />
          <stop offset="100%" stop-color="#d97706" />
        </linearGradient>
      </defs>
      
      <!-- Fondo y Guías -->
      ${gridLines}

      <!-- Barras de Volumen -->
      ${bars}
    </svg>
  `;
}

/**
 * Genera un gráfico de barras comparativo de distribución por grupo muscular
 * @param {Array<{ category: string, count: number, prTotal: number }>} categoriesData 
 * @param {string} unit 
 * @returns {string} HTML / SVG
 */
export function renderMuscleDistributionBars(categoriesData, unit = 'KG') {
  if (!categoriesData || categoriesData.length === 0) return '';

  const maxTotal = Math.max(...categoriesData.map(c => c.prTotal), 1);

  return categoriesData.map(item => {
    const percent = Math.round((item.prTotal / maxTotal) * 100);
    return `
      <div class="distribution-row">
        <div class="dist-header">
          <span class="dist-name">${item.category}</span>
          <span class="dist-val">${item.prTotal} ${unit}</span>
        </div>
        <div class="dist-bar-track">
          <div class="dist-bar-fill" style="width: ${percent}%;"></div>
        </div>
      </div>
    `;
  }).join('');
}

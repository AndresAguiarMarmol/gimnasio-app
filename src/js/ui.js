/**
 * Gimnasio Pro - Módulo de Interfaz de Usuario (UI) y Controladores
 * Manejo de vistas, componentes interactivos, modales, toasts y ciclo de vida de la vista.
 */

import { AppState, convertWeight, BAR_TYPES, KG_TO_LBS_FACTOR } from './state.js';
import { GYM_MOVEMENTS, getMovementById } from './movements.js';
import { License, CONTACT_PHONE, WHATSAPP_URL } from './license.js';
import { renderPRTrendChart, renderWorkoutVolumeChart, renderMuscleDistributionBars } from './charts.js';

export class UIManager {
  constructor() {
    this.currentTab = 'athlete'; // 'athlete', 'reports', 'prs', 'license', 'settings'
    this.reportsHistoryFilter = 'all'; // 'all' o un movementId específico
    this.restTimerInterval = null;
    this.restTimerSeconds = 0;
  }

  init() {
    this.bindHeaderNav();
    this.bindGlobalKeyboard();
    this.renderCurrentView();
    this.checkLicenseEnforcement();

    // Suscribirse a cambios de estado reactivos
    AppState.subscribe((event) => {
      this.handleStateUpdate(event);
    });
  }

  // ===============================
  // NAVEGACIÓN Y TABS
  // ===============================
  bindHeaderNav() {
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        this.switchTab(tab);
      });
    });
  }

  switchTab(tabName) {
    if (!['athlete', 'reports', 'prs', 'license', 'settings'].includes(tabName)) return;
    this.currentTab = tabName;

    // Actualizar estilos de los botones del header
    document.querySelectorAll('.nav-btn').forEach(btn => {
      const isTarget = btn.getAttribute('data-tab') === tabName;
      btn.classList.toggle('active', isTarget);
      btn.setAttribute('aria-selected', isTarget ? 'true' : 'false');
    });

    // Actualizar visibilidad de paneles
    document.querySelectorAll('.view-panel').forEach(panel => {
      panel.classList.add('hidden');
    });

    const activePanel = document.getElementById(`view-${tabName}`);
    if (activePanel) {
      activePanel.classList.remove('hidden');
    }

    // Renderizar la vista correspondiente
    this.renderCurrentView();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  renderCurrentView() {
    // Actualizar chip del atleta y centro activo en el encabezado
    this.renderHeaderBadges();

    switch (this.currentTab) {
      case 'athlete':
        this.renderTrainingView();
        break;
      case 'reports':
        this.renderReportsView();
        break;
      case 'prs':
        this.renderPRsView();
        break;
      case 'license':
        this.renderLicenseView();
        break;
      case 'settings':
        this.renderSettingsView();
        break;
    }
  }

  renderHeaderBadges() {
    const athleteChip = document.getElementById('header-athlete-chip');
    const centerChip = document.getElementById('header-center-chip');
    const unitChip = document.getElementById('header-unit-chip');

    const athlete = AppState.getActiveAthlete();
    const center = AppState.getActiveCenter();
    const unit = AppState.settings.unit;

    if (athleteChip && athlete) {
      athleteChip.innerHTML = `<span class="chip-icon">👤</span> <span class="chip-text">${this.escapeHTML(athlete.name)}</span>`;
    }
    if (centerChip && center) {
      centerChip.innerHTML = `<span class="chip-icon">📍</span> <span class="chip-text">${this.escapeHTML(center.name)}</span>`;
    }
    if (unitChip) {
      unitChip.textContent = unit;
    }
  }

  handleStateUpdate(event) {
    this.renderHeaderBadges();
    // Renderizado optimizado según el evento
    if (this.currentTab === 'athlete') {
      this.renderTrainingView();
    } else if (this.currentTab === 'reports') {
      this.renderReportsView();
    } else if (this.currentTab === 'prs') {
      this.renderPRsView();
    } else if (this.currentTab === 'settings') {
      this.renderSettingsView();
    }
  }

  // ===============================
  // VISTA 1: ENTRENAMIENTO & ATLETA (PASO 1 Y PASO 2)
  // ===============================
  renderTrainingView() {
    const container = document.getElementById('view-athlete');
    if (!container) return;

    const athlete = AppState.getActiveAthlete();
    const center = AppState.getActiveCenter();
    const unit = AppState.settings.unit;
    const movement = AppState.getSelectedMovement();
    const currentPR = AppState.getPR(movement.id);

    // Calcular porcentajes estándar
    const percentages = [50, 60, 70, 75, 80, 85, 90, 95, 100];
    const percentageRows = percentages.map(pct => {
      const calculatedWeight = Math.round((currentPR * (pct / 100)) * 10) / 10;
      return `
        <button type="button" class="pct-btn" data-weight="${calculatedWeight}" title="Cargar ${calculatedWeight} ${unit} a la serie">
          <span class="pct-num">${pct}%</span>
          <span class="pct-val">${calculatedWeight} <small>${unit}</small></span>
        </button>
      `;
    }).join('');

    // Desglose de placas o discos
    const plateBreakdown = this.calculatePlateLoading(currentPR, unit, movement);

    container.innerHTML = `
      <div class="view-grid">
        <!-- PASO 1: CONFIGURACIÓN DE SESIÓN Y PARÁMETROS BASE -->
        <section class="card config-card" aria-labelledby="step1-title">
          <div class="card-header flex-between">
            <h2 id="step1-title" class="section-title"><span class="step-badge">Paso 1</span> Configuración de Sesión</h2>
            <button id="btn-quick-center" class="btn-subtle btn-xs" title="Administrar centros">+ Nuevo Centro</button>
          </div>
          <div class="session-bar-grid">
            <div class="form-group">
              <label for="session-center-select">Centro de Entrenamiento:</label>
              <select id="session-center-select" class="form-select">
                ${AppState.centers.map(c => `
                  <option value="${c.id}" ${c.id === center.id ? 'selected' : ''}>${this.escapeHTML(c.name)}</option>
                `).join('')}
              </select>
              <p class="field-hint">${this.escapeHTML(center.description || '')}</p>
            </div>

            <div class="form-group">
              <label>Unidad de Carga:</label>
              <div class="unit-toggle-group" role="radiogroup" aria-label="Unidad objetivo">
                <button type="button" class="btn-toggle ${unit === 'KG' ? 'active' : ''}" data-unit="KG">KG</button>
                <button type="button" class="btn-toggle ${unit === 'LBS' ? 'active' : ''}" data-unit="LBS">LBS</button>
              </div>
              <p class="field-hint">1 kg = ${KG_TO_LBS_FACTOR} lbs (conversión matemática exacta)</p>
            </div>
          </div>
        </section>

        <!-- PASO 2: ENTORNO DE ENTRENAMIENTO Y MOTOR HÍBRIDO -->
        <section class="card training-card" aria-labelledby="step2-title">
          <div class="card-header flex-between">
            <h2 id="step2-title" class="section-title"><span class="step-badge">Paso 2</span> Entorno de Entrenamiento</h2>
            <div class="header-actions">
              <button id="btn-edit-pr" class="btn-gold btn-sm">🏆 Modificar PR</button>
            </div>
          </div>

          <!-- SELECTOR DE MOVIMIENTOS Y DISCIPLINAS (LISTA DESPLEGABLE) -->
          <div class="movement-selector-box">
            <label class="movement-dropdown-label" for="movement-dropdown-select">
              🏋️ Seleccionar Disciplina / Máquina:
            </label>
            <div class="movement-selector-row">
              <button type="button" id="btn-prev-mov" class="btn-icon" aria-label="Disciplina anterior" title="Disciplina Anterior">◀</button>
              
              <select id="movement-dropdown-select" class="form-select movement-dropdown-select" aria-label="Seleccionar disciplina">
                ${GYM_MOVEMENTS.map(m => `
                  <option value="${m.id}" ${m.id === movement.id ? 'selected' : ''}>
                    ${m.icons} ${m.name} — (${m.muscles})
                  </option>
                `).join('')}
              </select>

              <button type="button" id="btn-next-mov" class="btn-icon" aria-label="Siguiente disciplina" title="Siguiente Disciplina">▶</button>
            </div>
          </div>

          <!-- FICHA BIOMECÁNICA & PR EN PANTALLA -->
          <div class="pr-hero-banner">
            <div class="pr-hero-left">
              <span class="pr-hero-tag">RÉCORD PERSONAL (PR) DEL ATLETA ACTIVO</span>
              <div class="pr-hero-value-wrap">
                <span class="pr-hero-value">${currentPR}</span>
                <span class="pr-hero-unit">${unit}</span>
              </div>
              <p class="pr-hero-sub">Atleta: <strong>${this.escapeHTML(athlete.name)}</strong> (${athlete.gender})</p>
            </div>
            <div class="pr-hero-right">
              <div class="machine-type-chip">⚙️ ${movement.machineType}</div>
              <p class="biomechanical-cue">💡 <strong>Clave de ejecución:</strong> ${movement.cues}</p>
            </div>
          </div>

          <!-- TABLA DE PORCENTAJES AUTOMÁTICOS -->
          <div class="pct-section">
            <h4 class="subheading">🎯 Tabla de Cargas por Porcentaje (% del PR)</h4>
            <div class="pct-grid">
              ${percentageRows}
            </div>
          </div>

          <!-- CALCULADORA DE DISCOS / PLACAS -->
          <div class="plate-calc-box">
            <h4 class="subheading">⚖️ Desglose de Carga Sugerida (${currentPR} ${unit})</h4>
            <div class="plate-results">
              ${plateBreakdown}
            </div>
          </div>

          <!-- REGISTRO DE SERIES EN VIVO & CRONÓMETRO -->
          <div class="workout-tracker-box">
            <div class="flex-between">
              <h4 class="subheading">⚡ Registrar Serie de Entrenamiento</h4>
              <!-- CRONÓMETRO DE DESCANSO -->
              <div class="rest-timer-widget">
                <span class="timer-display" id="rest-timer-display">⏱️ 00:00</span>
                <div class="timer-presets">
                  <button type="button" class="btn-timer-preset" data-seconds="60">60s</button>
                  <button type="button" class="btn-timer-preset" data-seconds="90">90s</button>
                  <button type="button" class="btn-timer-preset" data-seconds="120">2m</button>
                  <button type="button" class="btn-timer-preset" data-seconds="180">3m</button>
                  <button type="button" id="btn-timer-reset" class="btn-timer-preset btn-timer-stop">✕</button>
                </div>
              </div>
            </div>

            <form id="form-log-set" class="set-log-form">
              <div class="log-inputs-grid">
                <div class="form-group">
                  <label for="log-weight">Carga (${unit}):</label>
                  <input type="number" id="log-weight" step="0.5" min="1" value="${currentPR}" class="form-input" required />
                </div>
                <div class="form-group">
                  <label for="log-reps">Repeticiones:</label>
                  <input type="number" id="log-reps" step="1" min="1" max="100" value="10" class="form-input" required />
                </div>
                <div class="form-group form-group-btn">
                  <button type="submit" class="btn-primary btn-block">Guardar Serie</button>
                </div>
              </div>
            </form>

            <!-- Historial reciente del movimiento -->
            <div class="recent-sets-box">
              <h5 class="micro-heading">Series registradas hoy en este ejercicio:</h5>
              <div id="recent-sets-list" class="recent-sets-list">
                ${this.renderRecentSets(movement.id)}
              </div>
            </div>
          </div>
        </section>
      </div>
    `;

    // Conectar eventos de la vista de entrenamiento
    this.bindTrainingEvents();
  }

  bindTrainingEvents() {
    // 1. Selector de centros
    const centerSelect = document.getElementById('session-center-select');
    if (centerSelect) {
      centerSelect.addEventListener('change', (e) => {
        AppState.setActiveCenter(e.target.value);
        this.showToast('Centro de entrenamiento actualizado.', 'info');
      });
    }

    // Botón para crear centro rápido
    const btnQuickCenter = document.getElementById('btn-quick-center');
    if (btnQuickCenter) {
      btnQuickCenter.addEventListener('click', () => {
        this.openCenterModal();
      });
    }

    // 2. Selector de unidad (KG / LBS)
    document.querySelectorAll('.unit-toggle-group .btn-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        const newUnit = btn.getAttribute('data-unit');
        if (newUnit !== AppState.settings.unit) {
          AppState.setUnit(newUnit);
          this.showToast(`Unidad cambiada a ${newUnit}. PRs convertidos automáticamente con exactitud.`, 'success');
        }
      });
    });

    // 3. Selector de disciplinas en lista desplegable y botones rotativos
    const movSelect = document.getElementById('movement-dropdown-select');
    if (movSelect) {
      movSelect.addEventListener('change', (e) => {
        AppState.setSelectedMovement(e.target.value);
      });
    }

    const btnPrev = document.getElementById('btn-prev-mov');
    const btnNext = document.getElementById('btn-next-mov');
    
    if (btnPrev && btnNext) {
      btnPrev.addEventListener('click', () => {
        const curIdx = GYM_MOVEMENTS.findIndex(m => m.id === AppState.selectedMovementId);
        const prevIdx = (curIdx - 1 + GYM_MOVEMENTS.length) % GYM_MOVEMENTS.length;
        AppState.setSelectedMovement(GYM_MOVEMENTS[prevIdx].id);
      });

      btnNext.addEventListener('click', () => {
        const curIdx = GYM_MOVEMENTS.findIndex(m => m.id === AppState.selectedMovementId);
        const nextIdx = (curIdx + 1) % GYM_MOVEMENTS.length;
        AppState.setSelectedMovement(GYM_MOVEMENTS[nextIdx].id);
      });
    }

    // 4. Clic en porcentajes para rellenar carga
    document.querySelectorAll('.pct-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const w = btn.getAttribute('data-weight');
        const inputWeight = document.getElementById('log-weight');
        if (inputWeight) {
          inputWeight.value = w;
          inputWeight.focus();
          this.showToast(`Carga asignada: ${w} ${AppState.settings.unit}`, 'info');
        }
      });
    });

    // 5. Botón de modificar PR
    const btnEditPR = document.getElementById('btn-edit-pr');
    if (btnEditPR) {
      btnEditPR.addEventListener('click', () => {
        this.openEditPRModal(AppState.selectedMovementId);
      });
    }

    // 6. Registro de serie (sin RPE)
    const formLog = document.getElementById('form-log-set');
    if (formLog) {
      formLog.addEventListener('submit', (e) => {
        e.preventDefault();
        const weightInput = document.getElementById('log-weight');
        const repsInput = document.getElementById('log-reps');

        const weight = parseFloat(weightInput.value);
        const reps = parseInt(repsInput.value, 10);

        if (isNaN(weight) || weight <= 0) {
          this.showToast('Ingrese un peso válido.', 'error');
          return;
        }

        const res = AppState.logWorkoutSet(AppState.selectedMovementId, weight, reps);
        if (res.isPR) {
          this.showToast(`🔥 ¡NUEVO RÉCORD PERSONAL! ${weight} ${AppState.settings.unit}`, 'pr');
        } else {
          this.showToast('Serie guardada con éxito.', 'success');
        }

        // Iniciar cronómetro de descanso por defecto si no está corriendo
        this.startRestTimer(90);
        this.renderTrainingView();
      });
    }

    // 8. Controles del cronómetro de descanso
    document.querySelectorAll('.btn-timer-preset').forEach(btn => {
      btn.addEventListener('click', () => {
        const secs = parseInt(btn.getAttribute('data-seconds'), 10);
        if (secs) {
          this.startRestTimer(secs);
        }
      });
    });

    const btnTimerReset = document.getElementById('btn-timer-reset');
    if (btnTimerReset) {
      btnTimerReset.addEventListener('click', () => {
        this.stopRestTimer();
      });
    }
  }

  calculatePlateLoading(targetWeight, unit, movement) {
    if (movement.machineType.includes('Placas') || movement.machineType.includes('Torre')) {
      return `
        <div class="plate-diagram">
          <div class="plate-chip plate-stack">Torre de Placas: Pin magnético en ${targetWeight} ${unit}</div>
          <small class="text-muted">Ajuste de pasador magnético guiado en la columna de placas numeradas de la máquina.</small>
        </div>
      `;
    }

    // Para máquinas con carga de discos (Prensa de Piernas, Máquina Smith, etc.)
    const perSide = Math.max(0, targetWeight / 2);
    const plates = unit === 'KG' ? [25, 20, 15, 10, 5, 2.5, 1.25] : [45, 35, 25, 10, 5, 2.5];
    const platesUsed = [];
    let rem = perSide;

    for (const p of plates) {
      const count = Math.floor(rem / p);
      if (count > 0) {
        platesUsed.push(`${count}x${p}${unit}`);
        rem = rem % p;
      }
    }

    const platesText = platesUsed.length > 0 ? platesUsed.join(' + ') : 'Sin discos adicionales';

    return `
      <div class="plate-diagram">
        <div class="plate-row">
          <span class="plate-chip plate-side">Carga por cada lado: <strong>${platesText}</strong> (${perSide.toFixed(1)} ${unit})</span>
          <span class="plate-eq">=</span>
          <span class="plate-chip plate-total"><strong>${targetWeight} ${unit}</strong> total</span>
        </div>
      </div>
    `;
  }

  renderRecentSets(movementId) {
    const logs = AppState.getAthleteLogs(AppState.activeAthleteId, movementId);
    if (!logs || logs.length === 0) {
      return `<p class="empty-hint">Aún no hay series registradas hoy para este ejercicio.</p>`;
    }

    const recent = logs.slice(0, 5);
    return recent.map((log, idx) => {
      const set = log.sets[0] || {};
      const timeStr = new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return `
        <div class="recent-set-row ${set.isPR ? 'is-pr' : ''}">
          <span class="set-idx">#${idx + 1}</span>
          <span class="set-stat"><strong>${set.weight}</strong> ${AppState.settings.unit}</span>
          <span class="set-stat">× <strong>${set.reps}</strong> reps</span>
          <span class="set-time">${timeStr}</span>
          ${set.isPR ? '<span class="badge-gold">¡PR!</span>' : ''}
        </div>
      `;
    }).join('');
  }

  // ===============================
  // CRONÓMETRO DE DESCANSO
  // ===============================
  startRestTimer(seconds) {
    this.stopRestTimer();
    this.restTimerSeconds = seconds;
    this.updateTimerDisplay();

    this.restTimerInterval = setInterval(() => {
      this.restTimerSeconds--;
      this.updateTimerDisplay();

      if (this.restTimerSeconds <= 0) {
        this.stopRestTimer();
        this.showToast('🔔 ¡Tiempo de descanso completado! A por la siguiente serie.', 'info');
      }
    }, 1000);
  }

  stopRestTimer() {
    if (this.restTimerInterval) {
      clearInterval(this.restTimerInterval);
      this.restTimerInterval = null;
    }
    this.restTimerSeconds = 0;
    this.updateTimerDisplay();
  }

  updateTimerDisplay() {
    const el = document.getElementById('rest-timer-display');
    if (!el) return;
    const mins = Math.floor(this.restTimerSeconds / 60);
    const secs = this.restTimerSeconds % 60;
    el.textContent = `⏱️ ${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    if (this.restTimerSeconds > 0) {
      el.classList.add('timer-running');
    } else {
      el.classList.remove('timer-running');
    }
  }

  // ===============================
  // VISTA 2: REPORTES Y PROGRESIÓN
  // ===============================
  renderReportsView() {
    const container = document.getElementById('view-reports');
    if (!container) return;

    const athlete = AppState.getActiveAthlete();
    const unit = AppState.settings.unit;
    const movement = AppState.getSelectedMovement();

    // 1. Datos para avance en el tiempo de los PRs (movimiento seleccionado)
    const prHistory = (athlete.prHistory || [])
      .filter(h => h.movementId === movement.id)
      .sort((a, b) => a.timestamp - b.timestamp);

    const currentPR = AppState.getPR(movement.id);
    const initialPR = prHistory.length > 0 ? prHistory[0].value : currentPR;
    const netGain = Math.round((currentPR - initialPR) * 10) / 10;
    const pctGain = initialPR > 0 ? Math.round(((currentPR - initialPR) / initialPR) * 1000) / 10 : 0;
    const totalMilestones = prHistory.length;

    // Timeline de hitos de PR
    const prMilestonesHTML = prHistory.length > 0
      ? prHistory.map((h, i) => {
          const prevVal = i > 0 ? prHistory[i - 1].value : h.value;
          const diff = Math.round((h.value - prevVal) * 10) / 10;
          const pct = prevVal > 0 ? Math.round(((h.value - prevVal) / prevVal) * 1000) / 10 : 0;
          const diffBadge = i === 0 
            ? '<span class="badge-subtle">Marca Inicial</span>' 
            : (diff > 0 
                ? `<span class="badge-accent">+${diff} ${unit} (+${pct}%)</span>` 
                : `<span class="badge-subtle">${diff} ${unit}</span>`);

          return `
            <div class="pr-milestone-item">
              <div class="milestone-dot ${i === prHistory.length - 1 ? 'dot-active' : ''}"></div>
              <div class="milestone-content">
                <div class="milestone-header">
                  <span class="milestone-date">📅 ${h.date}</span>
                  <span class="milestone-val"><strong>${h.value}</strong> ${unit}</span>
                  ${diffBadge}
                </div>
                <p class="milestone-note">${this.escapeHTML(h.note || 'Superación de marca personal')}</p>
              </div>
            </div>
          `;
        }).reverse().join('')
      : `<p class="empty-hint">Sin registros históricos de PR aún para este movimiento.</p>`;

    // 2. Datos para el Histórico de Movimientos y Series (workoutLogs)
    const historyFilter = this.reportsHistoryFilter || 'all';
    const allAthleteLogs = AppState.getAthleteLogs(athlete.id);
    const filteredLogs = historyFilter === 'all'
      ? allAthleteLogs
      : allAthleteLogs.filter(l => l.movementId === historyFilter);

    // Métricas del Histórico
    let totalSeries = 0;
    let totalVolume = 0;
    let maxWeight = 0;
    let totalReps = 0;

    filteredLogs.forEach(log => {
      (log.sets || []).forEach(s => {
        totalSeries++;
        const w = Number(s.weight) || 0;
        const r = Number(s.reps) || 0;
        totalVolume += (w * r);
        totalReps += r;
        if (w > maxWeight) maxWeight = w;
      });
    });

    // Filas de la tabla del Histórico
    const historyRowsHTML = filteredLogs.length > 0
      ? filteredLogs.map((log, idx) => {
          const mov = getMovementById(log.movementId) || { name: log.movementId, icons: '🏋️' };
          const centerObj = AppState.centers.find(c => c.id === log.centerId);
          const centerName = centerObj ? centerObj.name : 'Sede Principal';
          const set = (log.sets && log.sets[0]) || {};
          const weight = set.weight || 0;
          const reps = set.reps || 0;
          const volume = weight * reps;
          const dateStr = log.date ? log.date.split('T')[0] : '';
          const timeStr = new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          return `
            <tr class="history-row ${set.isPR ? 'row-is-pr' : ''}">
              <td class="td-idx">#${filteredLogs.length - idx}</td>
              <td class="td-datetime">
                <span class="history-date">${dateStr}</span>
                <span class="history-time">${timeStr}</span>
              </td>
              <td class="td-movement">
                <span class="history-mov-icon">${mov.icons}</span>
                <span class="history-mov-name">${mov.name}</span>
              </td>
              <td class="td-weight"><strong>${weight}</strong> <small>${unit}</small></td>
              <td class="td-reps"><strong>${reps}</strong></td>
              <td class="td-volume"><strong>${Math.round(volume).toLocaleString()}</strong> <small>${unit}</small></td>
              <td class="td-center"><span class="badge-subtle">${this.escapeHTML(centerName)}</span></td>
              <td class="td-status">
                ${set.isPR ? '<span class="badge-gold">🔥 ¡Nuevo PR!</span>' : '<span class="badge-subtle">Serie Regular</span>'}
              </td>
              <td class="td-action">
                <button type="button" class="btn-icon-subtle btn-delete-log" data-log-id="${log.id}" title="Eliminar registro">🗑️</button>
              </td>
            </tr>
          `;
        }).join('')
      : `<tr><td colspan="9" class="text-center py-4 text-muted">No se registran series para la disciplina seleccionada.</td></tr>`;

    // 3. Métricas por grupo muscular
    const categoryTotals = {};
    GYM_MOVEMENTS.forEach(m => {
      const pr = AppState.getPR(m.id);
      categoryTotals[m.category] = (categoryTotals[m.category] || 0) + pr;
    });

    const muscleData = Object.keys(categoryTotals).map(cat => ({
      category: cat,
      prTotal: Math.round(categoryTotals[cat]),
      count: GYM_MOVEMENTS.filter(m => m.category === cat).length
    }));

    container.innerHTML = `
      <div class="view-grid">
        <section class="card reports-main-card">
          <div class="card-header flex-between">
            <div>
              <h2 class="section-title">📊 Reportes y Curvas de Rendimiento</h2>
              <p class="section-subtitle">Progreso biomecánico, evolución de marcas e histórico de entrenamiento de <strong>${this.escapeHTML(athlete.name)}</strong></p>
            </div>
            <div class="unit-badge-indicator">Unidad: <strong>${unit}</strong></div>
          </div>

          <!-- ========================================== -->
          <!-- BLOQUE 1: AVANCE EN EL TIEMPO DE LOS PRS  -->
          <!-- ========================================== -->
          <div class="report-section-container">
            <div class="report-section-header flex-between">
              <div>
                <h3 class="report-section-title">🏆 Avance en el Tiempo de los Récords Personales (PRs)</h3>
                <p class="field-hint">Visualiza la progresión histórica y los hitos de carga alcanzados en cada disciplina.</p>
              </div>
              <div class="report-filter-wrap">
                <label for="report-pr-mov-select" class="filter-label">Disciplina / Máquina:</label>
                <select id="report-pr-mov-select" class="form-select form-select-sm">
                  ${GYM_MOVEMENTS.map(m => `
                    <option value="${m.id}" ${m.id === movement.id ? 'selected' : ''}>
                      ${m.icons} ${m.name}
                    </option>
                  `).join('')}
                </select>
              </div>
            </div>

            <!-- TARJETAS KPI DE PROGRESIÓN DE PR -->
            <div class="report-kpi-grid">
              <div class="kpi-card">
                <span class="kpi-label">PR Inicial</span>
                <span class="kpi-val">${initialPR} <small>${unit}</small></span>
                <span class="kpi-sub">Primer hito registrado</span>
              </div>
              <div class="kpi-card kpi-card-gold">
                <span class="kpi-label">PR Vigente</span>
                <span class="kpi-val text-gold">${currentPR} <small>${unit}</small></span>
                <span class="kpi-sub">Récord actual en máquina</span>
              </div>
              <div class="kpi-card ${netGain >= 0 ? 'kpi-card-cyan' : ''}">
                <span class="kpi-label">Avance Neto</span>
                <span class="kpi-val text-cyan">${netGain >= 0 ? '+' : ''}${netGain} <small>${unit}</small></span>
                <span class="kpi-sub">Carga total ganada</span>
              </div>
              <div class="kpi-card">
                <span class="kpi-label">Mejora Porcentual</span>
                <span class="kpi-val text-accent">${pctGain >= 0 ? '+' : ''}${pctGain}%</span>
                <span class="kpi-sub">${totalMilestones} hitos registrados</span>
              </div>
            </div>

            <!-- GRÁFICO SVG DE EVOLUCIÓN HISTÓRICA DE PR -->
            <div class="chart-container-box">
              <div class="chart-header flex-between">
                <h4 class="chart-title">Curva de Progresión de PR: ${movement.name}</h4>
                <span class="badge-gold">Marca Actual: ${currentPR} ${unit}</span>
              </div>
              <div class="svg-chart-wrapper">
                ${renderPRTrendChart(prHistory, unit)}
              </div>
            </div>

            <!-- CRONOLOGÍA DE HITOS DE PR -->
            <div class="milestones-box">
              <h4 class="subheading">📈 Cronología de Hitos de Superación de PR</h4>
              <div class="pr-milestones-timeline">
                ${prMilestonesHTML}
              </div>
            </div>
          </div>

          <!-- ==================================================== -->
          <!-- BLOQUE 2: HISTÓRICO DE MOVIMIENTOS Y SESIONES       -->
          <!-- ==================================================== -->
          <div class="report-section-container">
            <div class="report-section-header flex-between">
              <div>
                <h3 class="report-section-title">📜 Histórico de Movimientos y Series de Entrenamiento</h3>
                <p class="field-hint">Registro cronológico de series, repeticiones, cargas y volumen acumulado a lo largo del tiempo.</p>
              </div>
              <div class="report-filter-wrap">
                <label for="report-history-mov-select" class="filter-label">Filtrar por Disciplina:</label>
                <select id="report-history-mov-select" class="form-select form-select-sm">
                  <option value="all" ${historyFilter === 'all' ? 'selected' : ''}>🌐 Todas las Disciplinas (Histórico Global)</option>
                  ${GYM_MOVEMENTS.map(m => `
                    <option value="${m.id}" ${m.id === historyFilter ? 'selected' : ''}>
                      ${m.icons} ${m.name}
                    </option>
                  `).join('')}
                </select>
              </div>
            </div>

            <!-- TARJETAS KPI DEL HISTÓRICO -->
            <div class="report-kpi-grid">
              <div class="kpi-card">
                <span class="kpi-label">Series Totales</span>
                <span class="kpi-val">${totalSeries}</span>
                <span class="kpi-sub">Series completadas</span>
              </div>
              <div class="kpi-card kpi-card-cyan">
                <span class="kpi-label">Volumen Acumulado</span>
                <span class="kpi-val text-cyan">${Math.round(totalVolume).toLocaleString()} <small>${unit}</small></span>
                <span class="kpi-sub">∑ (Carga × Repeticiones)</span>
              </div>
              <div class="kpi-card kpi-card-gold">
                <span class="kpi-label">Carga Máx. Entrenada</span>
                <span class="kpi-val text-gold">${maxWeight} <small>${unit}</small></span>
                <span class="kpi-sub">Carga pico en bitácora</span>
              </div>
              <div class="kpi-card">
                <span class="kpi-label">Repeticiones Totales</span>
                <span class="kpi-val">${totalReps.toLocaleString()}</span>
                <span class="kpi-sub">Repeticiones ejecutadas</span>
              </div>
            </div>

            <!-- GRÁFICO SVG DE VOLUMEN POR SESIÓN EN EL TIEMPO -->
            <div class="chart-container-box">
              <div class="chart-header flex-between">
                <h4 class="chart-title">Volumen de Trabajo por Sesión a lo Largo del Tiempo</h4>
                <span class="badge-accent">${historyFilter === 'all' ? 'Todas las Disciplinas' : (getMovementById(historyFilter)?.name || '')}</span>
              </div>
              <div class="svg-chart-wrapper">
                ${renderWorkoutVolumeChart(filteredLogs, unit)}
              </div>
            </div>

            <!-- TABLA DEL HISTÓRICO DE SERIES -->
            <div class="history-table-container">
              <h4 class="subheading">📋 Bitácora Detallada de Series en el Tiempo</h4>
              <div class="table-responsive">
                <table class="history-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Fecha y Hora</th>
                      <th>Disciplina / Máquina</th>
                      <th>Carga</th>
                      <th>Reps</th>
                      <th>Volumen</th>
                      <th>Centro / Sede</th>
                      <th>Estado</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${historyRowsHTML}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- ========================================== -->
          <!-- BLOQUE 3: DISTRIBUCIÓN MUSCULAR Y RESPALDO -->
          <!-- ========================================== -->
          <div class="muscle-dist-section">
            <h3 class="chart-title">Distribución de Capacidad de Carga por Grupo Muscular</h3>
            <div class="dist-bars-container">
              ${renderMuscleDistributionBars(muscleData, unit)}
            </div>
          </div>

          <div class="backup-actions-box">
            <h4 class="subheading">💾 Respaldo y Portabilidad de Base de Datos</h4>
            <p class="field-hint">Descarga tus datos completos en JSON o impórtalos en cualquier otro dispositivo sin conexión.</p>
            <div class="button-row">
              <button id="btn-export-json" class="btn-cyan btn-sm">📥 Descargar Respaldo JSON</button>
              <label class="btn-subtle btn-sm file-input-label">
                📤 Restaurar Respaldo JSON
                <input type="file" id="input-import-json" accept=".json" class="hidden-file-input" />
              </label>
            </div>
          </div>
        </section>
      </div>
    `;

    // Eventos de la vista de reportes
    // 1. Selector de PR
    const prSelect = document.getElementById('report-pr-mov-select');
    if (prSelect) {
      prSelect.addEventListener('change', (e) => {
        AppState.setSelectedMovement(e.target.value);
        this.renderReportsView();
      });
    }

    // 2. Selector de filtro del Histórico
    const historySelect = document.getElementById('report-history-mov-select');
    if (historySelect) {
      historySelect.addEventListener('change', (e) => {
        this.reportsHistoryFilter = e.target.value;
        this.renderReportsView();
      });
    }

    // 3. Eliminar series registradas
    document.querySelectorAll('.btn-delete-log').forEach(btn => {
      btn.addEventListener('click', () => {
        const logId = btn.getAttribute('data-log-id');
        if (confirm('¿Eliminar esta serie registrada del histórico?')) {
          AppState.deleteWorkoutLog(logId);
          this.showToast('Serie eliminada del histórico.', 'info');
          this.renderReportsView();
        }
      });
    });

    // 4. Respaldo JSON
    const btnExport = document.getElementById('btn-export-json');
    if (btnExport) {
      btnExport.addEventListener('click', () => this.exportDatabaseJSON());
    }

    const inputImport = document.getElementById('input-import-json');
    if (inputImport) {
      inputImport.addEventListener('change', (e) => this.importDatabaseJSON(e));
    }
  }

  // ===============================
  // VISTA 3: GESTOR INDEPENDIENTE DE PRs
  // ===============================
  renderPRsView() {
    const container = document.getElementById('view-prs');
    if (!container) return;

    const unit = AppState.settings.unit;
    const athlete = AppState.getActiveAthlete();

    container.innerHTML = `
      <div class="view-grid">
        <section class="card prs-dashboard-card">
          <div class="card-header flex-between">
            <div>
              <h2 class="section-title">🏆 Récords Personales (PRs)</h2>
              <p class="section-subtitle">Gestión centralizada de marcas para <strong>${this.escapeHTML(athlete.name)}</strong></p>
            </div>
            <div class="unit-badge-indicator">Unidad: <strong>${unit}</strong></div>
          </div>

          <div class="prs-cards-grid">
            ${GYM_MOVEMENTS.map(m => {
              const pr = AppState.getPR(m.id);
              return `
                <div class="pr-card" data-mov-id="${m.id}">
                  <div class="pr-card-header">
                    <span class="pr-card-icon">${m.icons}</span>
                    <span class="pr-card-category">${m.category}</span>
                  </div>
                  <h3 class="pr-card-title">${m.name}</h3>
                  <p class="pr-card-muscles">${m.muscles}</p>
                  
                  <div class="pr-card-value-box">
                    <span class="pr-card-number">${pr}</span>
                    <span class="pr-card-unit">${unit}</span>
                  </div>

                  <div class="pr-card-actions">
                    <button class="btn-primary btn-sm btn-update-single-pr" data-mov-id="${m.id}">
                      ✏️ Actualizar PR
                    </button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </section>
      </div>
    `;

    // Conectar botones de edición de PR
    container.querySelectorAll('.btn-update-single-pr').forEach(btn => {
      btn.addEventListener('click', () => {
        const movId = btn.getAttribute('data-mov-id');
        this.openEditPRModal(movId);
      });
    });
  }

  // ===============================
  // VISTA 4: SEGURIDAD Y LICENCIA
  // ===============================
  renderLicenseView() {
    const container = document.getElementById('view-license');
    if (!container) return;

    const status = License.getStatus();
    const athlete = AppState.getActiveAthlete();
    const emailSample = athlete.email || 'atleta@correo.com';
    const requestCode = License.getRequestCode(emailSample);
    const waLink = License.getWhatsAppLink(emailSample);

    container.innerHTML = `
      <div class="view-grid">
        <section class="card license-card">
          <div class="card-header">
            <h2 class="section-title">🔐 Módulo de Seguridad y Licenciamiento Offline</h2>
            <p class="section-subtitle">Activación criptográfica SHA-256 sin dependencia de internet</p>
          </div>

          <div class="license-status-banner ${status.isLicensed ? 'status-licensed' : (status.isTrialExpired ? 'status-expired' : 'status-trial')}">
            <div class="status-icon">${status.isLicensed ? '🛡️' : (status.isTrialExpired ? '⚠️' : '⏳')}</div>
            <div class="status-info">
              <h3>${status.isLicensed ? 'Licencia Pro Verificada' : (status.isTrialExpired ? 'Período de Prueba Expirado' : 'Período de Prueba Activo')}</h3>
              <p>
                ${status.isLicensed 
                  ? `Registrado para: <strong>${status.licenseData.email}</strong> (Dispositivo ${status.deviceId})`
                  : (status.isTrialExpired 
                      ? `El tiempo de prueba de 72 horas ha finalizado. Active su licencia para continuar.` 
                      : `Tiempo restante: <strong>${status.hoursLeft} horas</strong> (${status.daysLeft} días restantes de 72 horas).`)}
              </p>
            </div>
          </div>

          <!-- DETALLES DEL DISPOSITIVO Y SOLICITUD -->
          <div class="license-details-grid">
            <div class="license-box">
              <h3 class="box-title">1. Identificador de Dispositivo (Device ID)</h3>
              <div class="code-box">
                <code id="display-device-id">${status.deviceId}</code>
                <button type="button" class="btn-subtle btn-xs" id="btn-copy-device-id">Copiar</button>
              </div>
              <p class="field-hint">Identificador único del hardware generado localmente en el primer arranque.</p>
            </div>

            <div class="license-box">
              <h3 class="box-title">2. Código de Solicitud de Activación</h3>
              <div class="form-group">
                <label for="req-email-input">Correo electrónico del atleta / comprador:</label>
                <input type="email" id="req-email-input" value="${emailSample}" class="form-input form-input-sm" />
              </div>
              <div class="code-box">
                <code id="display-req-code">${requestCode}</code>
                <button type="button" class="btn-subtle btn-xs" id="btn-copy-req-code">Copiar</button>
              </div>
              <a href="${waLink}" target="_blank" rel="noopener noreferrer" class="btn-whatsapp btn-sm mt-2" id="btn-whatsapp-req">
                📲 Solicitar Clave por WhatsApp (+56933395447)
              </a>
            </div>
          </div>

          <!-- FORMULARIO DE INGRESO DE TOKEN -->
          <div class="license-activation-form-box">
            <h3 class="box-title">3. Validación y Activación de Token</h3>
            <p class="field-hint">Ingrese el token criptográfico Base64 entregado por el desarrollador para desbloquear el sistema de forma 100% offline:</p>
            
            <form id="form-activate-token" class="token-form">
              <div class="form-group">
                <label for="input-activation-token">Token Criptográfico Base64:</label>
                <textarea id="input-activation-token" class="form-textarea" rows="3" placeholder="Pegue aquí el token recibido..."></textarea>
              </div>
              <div class="button-row">
                <button type="submit" class="btn-primary">Validar y Activar Licencia</button>
                ${status.isLicensed ? '<button type="button" id="btn-deactivate-license" class="btn-red btn-sm">Desactivar Licencia</button>' : ''}
              </div>
            </form>
          </div>

          <!-- GENERADOR AUXILIAR DE LICENCIAS (ADMIN / DEMO TOOL) -->
          <div class="admin-license-generator">
            <details>
              <summary class="generator-summary">🛠️ Herramienta de Soporte y Generación de Claves (Uso Autorizado)</summary>
              <div class="generator-panel">
                <p class="field-hint">Genera instantáneamente un token válido para este Device ID usando la sal criptográfica autorizada.</p>
                <div class="button-row mt-2">
                  <button type="button" id="btn-gen-demo-token" class="btn-gold btn-sm">Generar y Pegar Token de 1 Año</button>
                  <button type="button" id="btn-gen-lifetime-token" class="btn-cyan btn-sm">Generar y Pegar Token Perpetuo</button>
                </div>
              </div>
            </details>
          </div>
        </section>
      </div>
    `;

    this.bindLicenseEvents();
  }

  bindLicenseEvents() {
    const emailInput = document.getElementById('req-email-input');
    const reqCodeDisplay = document.getElementById('display-req-code');
    const waBtn = document.getElementById('btn-whatsapp-req');

    if (emailInput && reqCodeDisplay && waBtn) {
      emailInput.addEventListener('input', () => {
        const email = emailInput.value.trim() || 'atleta@correo.com';
        const code = License.getRequestCode(email);
        reqCodeDisplay.textContent = code;
        waBtn.href = License.getWhatsAppLink(email);
      });
    }

    // Botones de copiar
    const btnCopyDev = document.getElementById('btn-copy-device-id');
    if (btnCopyDev) {
      btnCopyDev.addEventListener('click', () => {
        navigator.clipboard.writeText(License.deviceId);
        this.showToast('Device ID copiado al portapapeles.', 'info');
      });
    }

    const btnCopyReq = document.getElementById('btn-copy-req-code');
    if (btnCopyReq) {
      btnCopyReq.addEventListener('click', () => {
        const text = reqCodeDisplay ? reqCodeDisplay.textContent : '';
        navigator.clipboard.writeText(text);
        this.showToast('Código de solicitud copiado al portapapeles.', 'info');
      });
    }

    // Formulario de activación
    const formActivate = document.getElementById('form-activate-token');
    if (formActivate) {
      formActivate.addEventListener('submit', async (e) => {
        e.preventDefault();
        const tokenInput = document.getElementById('input-activation-token');
        const token = tokenInput ? tokenInput.value.trim() : '';

        const res = await License.activateWithToken(token);
        if (res.success) {
          this.showToast(res.message, 'success');
          this.checkLicenseEnforcement();
          this.renderLicenseView();
        } else {
          this.showToast(res.message, 'error');
        }
      });
    }

    // Botón de desactivar
    const btnDeactivate = document.getElementById('btn-deactivate-license');
    if (btnDeactivate) {
      btnDeactivate.addEventListener('click', () => {
        if (confirm('¿Desea remover la licencia activa de este dispositivo?')) {
          License.deactivate();
          this.showToast('Licencia desactivada.', 'info');
          this.renderLicenseView();
          this.checkLicenseEnforcement();
        }
      });
    }

    // Generador de clave demo de 1 año
    const btnGenDemo = document.getElementById('btn-gen-demo-token');
    if (btnGenDemo) {
      btnGenDemo.addEventListener('click', async () => {
        const email = (emailInput ? emailInput.value.trim() : '') || 'atleta@gimnasiopro.cl';
        const token = await License.generateTokenForDevice(License.deviceId, email, 365);
        const tokenArea = document.getElementById('input-activation-token');
        if (tokenArea) {
          tokenArea.value = token;
          this.showToast('Token de 1 año generado en el campo. Haga clic en Validar y Activar.', 'success');
        }
      });
    }

    // Generador perpetuo
    const btnGenLifetime = document.getElementById('btn-gen-lifetime-token');
    if (btnGenLifetime) {
      btnGenLifetime.addEventListener('click', async () => {
        const email = (emailInput ? emailInput.value.trim() : '') || 'pro@gimnasio.cl';
        const token = await License.generateTokenForDevice(License.deviceId, email, 0);
        const tokenArea = document.getElementById('input-activation-token');
        if (tokenArea) {
          tokenArea.value = token;
          this.showToast('Token perpetuo generado en el campo. Haga clic en Validar y Activar.', 'success');
        }
      });
    }
  }

  // ===============================
  // VISTA 5: PARÁMETROS Y GESTIÓN
  // ===============================
  renderSettingsView() {
    const container = document.getElementById('view-settings');
    if (!container) return;

    const unit = AppState.settings.unit;
    const barType = AppState.settings.barType;
    const athletes = AppState.athletes;
    const activeAthlete = AppState.getActiveAthlete();
    const centers = AppState.centers;
    const activeCenter = AppState.getActiveCenter();

    container.innerHTML = `
      <div class="view-grid">
        <!-- CENTROS DE ENTRENAMIENTO -->
        <section class="card settings-card">
          <div class="card-header flex-between">
            <div>
              <h2 class="section-title">📍 Centros de Entrenamiento</h2>
              <p class="section-subtitle">Segmentación local de bases de datos por sede o gimnasio</p>
            </div>
            <button id="btn-add-center-modal" class="btn-cyan btn-sm">+ Agregar Centro</button>
          </div>

          <div class="centers-list">
            ${centers.map(c => `
              <div class="center-item ${c.id === activeCenter.id ? 'active' : ''}">
                <div class="center-info">
                  <div class="center-title-row">
                    <span class="center-name">${this.escapeHTML(c.name)}</span>
                    ${c.id === activeCenter.id ? '<span class="badge-accent">Activo</span>' : ''}
                  </div>
                  <p class="center-desc">${this.escapeHTML(c.description || 'Sin descripción')}</p>
                </div>
                <div class="center-actions">
                  ${c.id !== activeCenter.id ? `<button class="btn-subtle btn-xs btn-set-active-center" data-id="${c.id}">Seleccionar</button>` : ''}
                  <button class="btn-subtle btn-xs btn-edit-center" data-id="${c.id}">Editar</button>
                  ${centers.length > 1 ? `<button class="btn-red btn-xs btn-delete-center" data-id="${c.id}">Eliminar</button>` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </section>

        <!-- GESTOR MULTI-PERFIL DE ATLETAS -->
        <section class="card settings-card">
          <div class="card-header flex-between">
            <div>
              <h2 class="section-title">👤 Perfiles de Atletas</h2>
              <p class="section-subtitle">Gestión multi-perfil e historial individualizado</p>
            </div>
            <button id="btn-add-athlete-modal" class="btn-cyan btn-sm">+ Nuevo Atleta</button>
          </div>

          <div class="athletes-list">
            ${athletes.map(a => `
              <div class="athlete-item ${a.id === activeAthlete.id ? 'active' : ''}">
                <div class="athlete-info">
                  <div class="athlete-title-row">
                    <span class="athlete-name">${this.escapeHTML(a.name)}</span>
                    <span class="badge-subtle">${a.gender}</span>
                    <span class="badge-subtle">${a.bodyweight} ${unit}</span>
                    ${a.id === activeAthlete.id ? '<span class="badge-accent">Activo</span>' : ''}
                  </div>
                  <p class="athlete-notes">${this.escapeHTML(a.notes || 'Sin notas adicionales')}</p>
                </div>
                <div class="athlete-actions">
                  ${a.id !== activeAthlete.id ? `<button class="btn-subtle btn-xs btn-set-active-athlete" data-id="${a.id}">Cambiar</button>` : ''}
                  <button class="btn-subtle btn-xs btn-edit-athlete" data-id="${a.id}">Editar</button>
                  ${athletes.length > 1 ? `<button class="btn-red btn-xs btn-delete-athlete" data-id="${a.id}">Eliminar</button>` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </section>

        <!-- PARÁMETROS GLOBALES -->
        <section class="card settings-card">
          <div class="card-header">
            <h2 class="section-title">⚙️ Parámetros Globales y Unidades</h2>
          </div>

          <div class="settings-form-grid">
            <div class="form-group">
              <label>Unidad de Medida del Sistema:</label>
              <div class="unit-toggle-group">
                <button type="button" class="btn-toggle ${unit === 'KG' ? 'active' : ''}" data-unit-set="KG">Kilogramos (KG)</button>
                <button type="button" class="btn-toggle ${unit === 'LBS' ? 'active' : ''}" data-unit-set="LBS">Libras (LBS)</button>
              </div>
              <p class="field-hint">Al cambiar la unidad, todos los PRs y el historial se convierten automáticamente respetando 1 kg = ${KG_TO_LBS_FACTOR} lbs.</p>
            </div>
          </div>
        </section>
      </div>
    `;

    this.bindSettingsEvents();
  }

  bindSettingsEvents() {
    // 1. Centros
    document.querySelectorAll('.btn-set-active-center').forEach(b => {
      b.addEventListener('click', () => {
        AppState.setActiveCenter(b.getAttribute('data-id'));
        this.showToast('Centro activo actualizado.', 'info');
        this.renderSettingsView();
      });
    });

    document.querySelectorAll('.btn-edit-center').forEach(b => {
      b.addEventListener('click', () => {
        const cId = b.getAttribute('data-id');
        this.openCenterModal(cId);
      });
    });

    document.querySelectorAll('.btn-delete-center').forEach(b => {
      b.addEventListener('click', () => {
        const cId = b.getAttribute('data-id');
        if (confirm('¿Eliminar este centro de entrenamiento?')) {
          try {
            AppState.deleteCenter(cId);
            this.showToast('Centro eliminado.', 'info');
            this.renderSettingsView();
          } catch (err) {
            this.showToast(err.message, 'error');
          }
        }
      });
    });

    const btnAddCenter = document.getElementById('btn-add-center-modal');
    if (btnAddCenter) {
      btnAddCenter.addEventListener('click', () => this.openCenterModal());
    }

    // 2. Atletas
    document.querySelectorAll('.btn-set-active-athlete').forEach(b => {
      b.addEventListener('click', () => {
        AppState.setActiveAthlete(b.getAttribute('data-id'));
        this.showToast('Atleta activo cambiado.', 'info');
        this.renderSettingsView();
      });
    });

    document.querySelectorAll('.btn-edit-athlete').forEach(b => {
      b.addEventListener('click', () => {
        const aId = b.getAttribute('data-id');
        this.openAthleteModal(aId);
      });
    });

    document.querySelectorAll('.btn-delete-athlete').forEach(b => {
      b.addEventListener('click', () => {
        const aId = b.getAttribute('data-id');
        if (confirm('¿Eliminar este perfil de atleta? Todos sus registros serán eliminados.')) {
          try {
            AppState.deleteAthlete(aId);
            this.showToast('Atleta eliminado.', 'info');
            this.renderSettingsView();
          } catch (err) {
            this.showToast(err.message, 'error');
          }
        }
      });
    });

    const btnAddAthlete = document.getElementById('btn-add-athlete-modal');
    if (btnAddAthlete) {
      btnAddAthlete.addEventListener('click', () => this.openAthleteModal());
    }

    // 3. Unidades del Sistema
    document.querySelectorAll('[data-unit-set]').forEach(b => {
      b.addEventListener('click', () => {
        const u = b.getAttribute('data-unit-set');
        AppState.setUnit(u);
        this.showToast(`Unidad cambiada a ${u}.`, 'success');
        this.renderSettingsView();
      });
    });
  }

  // ===============================
  // MODALES DINÁMICOS
  // ===============================
  openEditPRModal(movementId) {
    const movement = getMovementById(movementId);
    const athlete = AppState.getActiveAthlete();
    const currentVal = AppState.getPR(movement.id);
    const unit = AppState.settings.unit;

    const modal = document.getElementById('app-modal');
    const modalContent = document.getElementById('modal-content');
    if (!modal || !modalContent) return;

    modalContent.innerHTML = `
      <div class="modal-header">
        <h3 class="modal-title">🏆 Modificar Récord Personal (PR)</h3>
        <button type="button" class="btn-close-modal" id="btn-modal-close" aria-label="Cerrar">✕</button>
      </div>
      <form id="form-edit-pr" class="modal-form">
        <div class="modal-body">
          <div class="modal-mov-badge">
            <span class="mov-icons">${movement.icons}</span>
            <div>
              <strong>${movement.name}</strong>
              <p class="field-hint">${movement.muscles}</p>
            </div>
          </div>

          <div class="form-group mt-3">
            <label for="input-new-pr">Nuevo PR (${unit}):</label>
            <input type="number" id="input-new-pr" class="form-input form-input-lg" step="0.5" min="1" value="${currentVal}" required autofocus />
          </div>

          <div class="form-group">
            <label for="input-pr-note">Nota o motivo del récord (opcional):</label>
            <input type="text" id="input-pr-note" class="form-input" placeholder="Ej: Nuevo tope de fuerza en serie pesada" />
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn-subtle" id="btn-modal-cancel">Cancelar</button>
          <button type="submit" class="btn-primary">Guardar Récord</button>
        </div>
      </form>
    `;

    this.showModal();

    const form = document.getElementById('form-edit-pr');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const inputEl = document.getElementById('input-new-pr');
      const noteEl = document.getElementById('input-pr-note');
      const val = parseFloat(inputEl?.value);
      const note = noteEl?.value || '';

      if (isNaN(val) || val <= 0) {
        this.showToast('Por favor ingrese una carga válida mayor a 0.', 'error');
        return;
      }

      this.hideModal();

      try {
        AppState.updatePR(movement.id, val, note);
        this.showToast(`🏆 PR actualizado: ${movement.name} a ${val} ${unit}`, 'pr');
      } catch (err) {
        this.showToast(err.message, 'error');
      }
    });

    document.getElementById('btn-modal-close')?.addEventListener('click', () => this.hideModal());
    document.getElementById('btn-modal-cancel')?.addEventListener('click', () => this.hideModal());
  }

  openCenterModal(centerId = null) {
    const isEdit = Boolean(centerId);
    const center = isEdit ? AppState.centers.find(c => c.id === centerId) : { name: '', description: '' };
    if (isEdit && !center) return;

    const modal = document.getElementById('app-modal');
    const modalContent = document.getElementById('modal-content');
    if (!modal || !modalContent) return;

    modalContent.innerHTML = `
      <div class="modal-header">
        <h3 class="modal-title">${isEdit ? 'Editar Centro de Entrenamiento' : 'Agregar Nuevo Centro'}</h3>
        <button type="button" class="btn-close-modal" id="btn-modal-close" aria-label="Cerrar">✕</button>
      </div>
      <form id="form-center" class="modal-form">
        <div class="modal-body">
          <div class="form-group">
            <label for="input-center-name">Nombre del Centro:</label>
            <input type="text" id="input-center-name" class="form-input" value="${this.escapeHTML(center.name)}" placeholder="Ej: Elite Gym Oriente" required autofocus />
          </div>
          <div class="form-group">
            <label for="input-center-desc">Descripción o Ubicación:</label>
            <textarea id="input-center-desc" class="form-textarea" rows="2" placeholder="Ej: Sala de musculación y acondicionamiento">${this.escapeHTML(center.description || '')}</textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn-subtle" id="btn-modal-cancel">Cancelar</button>
          <button type="submit" class="btn-primary">${isEdit ? 'Guardar Cambios' : 'Crear Centro'}</button>
        </div>
      </form>
    `;

    this.showModal();

    const form = document.getElementById('form-center');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('input-center-name')?.value.trim();
      const desc = document.getElementById('input-center-desc')?.value.trim() || '';

      if (!name) {
        this.showToast('El nombre del centro es obligatorio.', 'error');
        return;
      }

      this.hideModal();

      if (isEdit) {
        AppState.editCenter(centerId, name, desc);
        this.showToast('Centro actualizado.', 'success');
      } else {
        AppState.addCenter(name, desc);
        this.showToast('Nuevo centro agregado y seleccionado.', 'success');
      }
    });

    document.getElementById('btn-modal-close')?.addEventListener('click', () => this.hideModal());
    document.getElementById('btn-modal-cancel')?.addEventListener('click', () => this.hideModal());
  }

  openAthleteModal(athleteId = null) {
    const isEdit = Boolean(athleteId);
    const athlete = isEdit 
      ? AppState.athletes.find(a => a.id === athleteId) 
      : { name: '', gender: 'Hombre', bodyweight: 75, notes: '', centerId: AppState.activeCenterId };
    if (isEdit && !athlete) return;

    const modal = document.getElementById('app-modal');
    const modalContent = document.getElementById('modal-content');
    if (!modal || !modalContent) return;

    modalContent.innerHTML = `
      <div class="modal-header">
        <h3 class="modal-title">${isEdit ? 'Editar Perfil de Atleta' : 'Registrar Nuevo Atleta'}</h3>
        <button type="button" class="btn-close-modal" id="btn-modal-close" aria-label="Cerrar">✕</button>
      </div>
      <form id="form-athlete" class="modal-form">
        <div class="modal-body">
          <div class="form-group">
            <label for="input-athlete-name">Nombre y Apellido:</label>
            <input type="text" id="input-athlete-name" class="form-input" value="${this.escapeHTML(athlete.name)}" placeholder="Ej: Carlos Silva" required autofocus />
          </div>
          <div class="form-row-2">
            <div class="form-group">
              <label for="input-athlete-gender">Género:</label>
              <select id="input-athlete-gender" class="form-select">
                <option value="Hombre" ${athlete.gender === 'Hombre' ? 'selected' : ''}>Hombre</option>
                <option value="Mujer" ${athlete.gender === 'Mujer' ? 'selected' : ''}>Mujer</option>
              </select>
            </div>
            <div class="form-group">
              <label for="input-athlete-bw">Peso Corporal (${AppState.settings.unit}):</label>
              <input type="number" id="input-athlete-bw" class="form-input" step="0.5" value="${athlete.bodyweight}" required />
            </div>
          </div>
          <div class="form-group">
            <label for="input-athlete-notes">Notas / Objetivos:</label>
            <textarea id="input-athlete-notes" class="form-textarea" rows="2" placeholder="Ej: Enfoque en hipertrofia y fuerza">${this.escapeHTML(athlete.notes || '')}</textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn-subtle" id="btn-modal-cancel">Cancelar</button>
          <button type="submit" class="btn-primary">${isEdit ? 'Guardar Cambios' : 'Crear Perfil'}</button>
        </div>
      </form>
    `;

    this.showModal();

    const form = document.getElementById('form-athlete');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('input-athlete-name')?.value.trim();
      const gender = document.getElementById('input-athlete-gender')?.value || 'Hombre';
      const bodyweight = parseFloat(document.getElementById('input-athlete-bw')?.value);
      const notes = document.getElementById('input-athlete-notes')?.value.trim() || '';

      if (!name) {
        this.showToast('El nombre del atleta es obligatorio.', 'error');
        return;
      }

      this.hideModal();

      if (isEdit) {
        AppState.editAthlete(athleteId, { name, gender, bodyweight, notes });
        this.showToast('Perfil de atleta actualizado.', 'success');
      } else {
        AppState.addAthlete({ name, gender, bodyweight, notes });
        this.showToast('Nuevo atleta creado con marcas iniciales.', 'success');
      }
    });

    document.getElementById('btn-modal-close')?.addEventListener('click', () => this.hideModal());
    document.getElementById('btn-modal-cancel')?.addEventListener('click', () => this.hideModal());
  }

  showModal() {
    const modal = document.getElementById('app-modal');
    if (modal) {
      modal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    }
  }

  hideModal() {
    const modal = document.getElementById('app-modal');
    if (modal) {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
      const content = document.getElementById('modal-content');
      if (content) content.innerHTML = '';
    }
  }

  // ===============================
  // ENFORCEMENT DE TRIAL Y SEGURIDAD
  // ===============================
  checkLicenseEnforcement() {
    const isExpired = License.checkTrialStatus();
    const overlay = document.getElementById('trial-expired-overlay');
    const mainApp = document.getElementById('main-app-shell');

    if (isExpired && !License.isLicensed) {
      if (overlay) {
        overlay.classList.remove('hidden');
      }
      if (mainApp) {
        mainApp.setAttribute('inert', '');
      }

      this.populateExpiredModal();
    } else {
      if (overlay) {
        overlay.classList.add('hidden');
      }
      if (mainApp) {
        mainApp.removeAttribute('inert');
      }
    }
  }

  populateExpiredModal() {
    const overlay = document.getElementById('trial-expired-overlay');
    if (!overlay) return;

    const athlete = AppState.getActiveAthlete();
    const emailSample = athlete.email || 'atleta@correo.com';
    const reqCode = License.getRequestCode(emailSample);
    const waLink = License.getWhatsAppLink(emailSample);

    overlay.innerHTML = `
      <div class="trial-block-card">
        <div class="trial-block-header">
          <div class="trial-block-icon">🚫</div>
          <h2 class="trial-block-title">Período de Prueba Expirado</h2>
          <p class="trial-block-subtitle">El período de evaluación de 72 horas (3 días) de Gimnasio Pro ha concluido.</p>
        </div>

        <div class="trial-block-body">
          <div class="trial-info-alert">
            <p>Para desbloquear el acceso ilimitado a sus entrenamientos, récords y reportes, comuníquese con el desarrollador:</p>
            <p class="trial-contact-highlight">
              📞 Contacto: <strong>${CONTACT_PHONE}</strong>
            </p>
          </div>

          <div class="form-group mt-3">
            <label for="expired-email-input">Su correo electrónico:</label>
            <input type="email" id="expired-email-input" value="${emailSample}" class="form-input form-input-sm" />
          </div>

          <div class="code-box">
            <code id="expired-req-code">${reqCode}</code>
            <button type="button" class="btn-subtle btn-xs" id="btn-copy-expired-req">Copiar</button>
          </div>

          <a href="${waLink}" target="_blank" rel="noopener noreferrer" class="btn-whatsapp btn-block mt-3" id="expired-wa-btn">
            📲 Contactar por WhatsApp al ${CONTACT_PHONE}
          </a>

          <hr class="divider-subtle" />

          <form id="form-unlock-expired" class="mt-3">
            <div class="form-group">
              <label for="expired-token-input">Ingresar Clave / Token de Activación:</label>
              <textarea id="expired-token-input" class="form-textarea" rows="2" placeholder="Pegue el token Base64 recibido..."></textarea>
            </div>
            <button type="submit" class="btn-primary btn-block">Desbloquear Aplicación</button>
          </form>
        </div>
      </div>
    `;

    // Conectar eventos del modal de bloqueo
    const expEmail = document.getElementById('expired-email-input');
    const expCode = document.getElementById('expired-req-code');
    const expWa = document.getElementById('expired-wa-btn');

    if (expEmail && expCode && expWa) {
      expEmail.addEventListener('input', () => {
        const mail = expEmail.value.trim() || 'atleta@correo.com';
        const code = License.getRequestCode(mail);
        expCode.textContent = code;
        expWa.href = License.getWhatsAppLink(mail);
      });
    }

    const btnCopy = document.getElementById('btn-copy-expired-req');
    if (btnCopy) {
      btnCopy.addEventListener('click', () => {
        navigator.clipboard.writeText(expCode.textContent);
        this.showToast('Código de solicitud copiado.', 'info');
      });
    }

    const formUnlock = document.getElementById('form-unlock-expired');
    if (formUnlock) {
      formUnlock.addEventListener('submit', async (e) => {
        e.preventDefault();
        const tokenVal = document.getElementById('expired-token-input').value.trim();
        const res = await License.activateWithToken(tokenVal);
        if (res.success) {
          this.showToast(res.message, 'success');
          this.checkLicenseEnforcement();
          this.renderCurrentView();
        } else {
          this.showToast(res.message, 'error');
        }
      });
    }
  }

  // ===============================
  // SISTEMA DE TOASTS Y FEEDBACK
  // ===============================
  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast-item toast-${type}`;
    
    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '⚠️';
    if (type === 'pr') icon = '🏆';

    toast.innerHTML = `
      <span class="toast-icon">${icon}</span>
      <span class="toast-msg">${this.escapeHTML(message)}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast-fadeout');
      setTimeout(() => toast.remove(), 400);
    }, 3500);
  }

  // ===============================
  // BACKUP Y RESTAURACIÓN JSON
  // ===============================
  exportDatabaseJSON() {
    const data = {
      version: '1.1',
      appName: 'Gimnasio Pro',
      exportDate: new Date().toISOString(),
      settings: AppState.settings,
      centers: AppState.centers,
      athletes: AppState.athletes,
      workoutLogs: AppState.workoutLogs
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GimnasioPro_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.showToast('Respaldo descargado exitosamente.', 'success');
  }

  importDatabaseJSON(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (!parsed.athletes || !parsed.centers) {
          throw new Error('El archivo no tiene el formato válido de Gimnasio Pro.');
        }

        if (confirm('¿Restaurar datos desde el archivo? Los datos actuales serán reemplazados.')) {
          AppState.centers = parsed.centers;
          AppState.athletes = parsed.athletes;
          if (parsed.settings) AppState.settings = parsed.settings;
          if (parsed.workoutLogs) AppState.workoutLogs = parsed.workoutLogs;

          // Guardar en Storage
          AppState.notify('data-restored');
          this.showToast('¡Base de datos restaurada correctamente!', 'success');
          this.renderCurrentView();
        }
      } catch (err) {
        this.showToast('Error al importar archivo: ' + err.message, 'error');
      }
    };
    reader.readAsText(file);
  }

  bindGlobalKeyboard() {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.hideModal();
      }
    });

    const modalOverlay = document.getElementById('app-modal');
    if (modalOverlay) {
      modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
          this.hideModal();
        }
      });
    }
  }

  escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

export const UI = new UIManager();

/**
 * Gimnasio Pro - Gestor de Estado Reactivo y Reglas de Negocio
 * Coherencia histórica de PRs, conversión matemática exacta y gestión multi-perfil.
 */

import { Storage, STORAGE_KEYS } from './storage.js';
import { GYM_MOVEMENTS } from './movements.js';

// Factor de conversión exacto exigido por reglas de negocio
export const KG_TO_LBS_FACTOR = 2.20462;

export function kgToLbs(kg, round = 1) {
  const val = Number(kg) * KG_TO_LBS_FACTOR;
  return Number(val.toFixed(round));
}

export function lbsToKg(lbs, round = 1) {
  const val = Number(lbs) / KG_TO_LBS_FACTOR;
  return Number(val.toFixed(round));
}

export function convertWeight(value, fromUnit, toUnit, round = 1) {
  if (fromUnit === toUnit) return Number(value);
  if (fromUnit === 'KG' && toUnit === 'LBS') return kgToLbs(value, round);
  if (fromUnit === 'LBS' && toUnit === 'KG') return lbsToKg(value, round);
  return Number(value);
}

// Centros preconfigurados por defecto
export const DEFAULT_CENTERS = [
  {
    id: 'center-1',
    name: 'Box Gym Central',
    description: 'Sede principal de musculación avanzada, potencia y alto rendimiento.'
  },
  {
    id: 'center-2',
    name: 'Garage Gym Pro',
    description: 'Área especializada en peso libre, barras olímpicas y fuerza pura.'
  },
  {
    id: 'center-3',
    name: 'Club Gimnasio',
    description: 'Espacio integral con máquinas guiadas, poleas y acondicionamiento físico.'
  }
];

// Barras olímpicas oficiales
export const BAR_TYPES = {
  men: {
    id: 'men',
    label: 'Hombre (20 kg / 45 lb)',
    weightKg: 20,
    weightLbs: 45
  },
  women: {
    id: 'women',
    label: 'Mujer (15 kg / 35 lb)',
    weightKg: 15,
    weightLbs: 35
  }
};

class StateManager {
  constructor() {
    this.listeners = new Set();
    this.centers = [];
    this.activeCenterId = null;
    this.athletes = [];
    this.activeAthleteId = null;
    this.settings = {
      unit: 'KG', // 'KG' o 'LBS'
      barType: 'men' // 'men' o 'women'
    };
    this.workoutLogs = [];
    this.selectedMovementId = GYM_MOVEMENTS[0].id;
  }

  init() {
    // 1. Cargar o inicializar Centros
    const savedCenters = Storage.get(STORAGE_KEYS.CENTERS);
    if (Array.isArray(savedCenters) && savedCenters.length > 0) {
      this.centers = savedCenters;
    } else {
      this.centers = [...DEFAULT_CENTERS];
      Storage.set(STORAGE_KEYS.CENTERS, this.centers);
    }

    const savedActiveCenter = Storage.get(STORAGE_KEYS.ACTIVE_CENTER_ID);
    this.activeCenterId = (savedActiveCenter && this.centers.some(c => c.id === savedActiveCenter))
      ? savedActiveCenter
      : this.centers[0].id;
    Storage.set(STORAGE_KEYS.ACTIVE_CENTER_ID, this.activeCenterId);

    // 2. Cargar o inicializar Parámetros Base
    const savedSettings = Storage.get(STORAGE_KEYS.SETTINGS);
    if (savedSettings) {
      this.settings = { ...this.settings, ...savedSettings };
    } else {
      Storage.set(STORAGE_KEYS.SETTINGS, this.settings);
    }

    // 3. Cargar o inicializar Atletas
    const savedAthletes = Storage.get(STORAGE_KEYS.ATHLETES);
    if (Array.isArray(savedAthletes) && savedAthletes.length > 0) {
      this.athletes = savedAthletes;
    } else {
      // Crear atleta inicial por defecto
      const defaultAthlete = this.createDefaultAthlete();
      this.athletes = [defaultAthlete];
      Storage.set(STORAGE_KEYS.ATHLETES, this.athletes);
    }

    const savedActiveAthlete = Storage.get(STORAGE_KEYS.ACTIVE_ATHLETE_ID);
    this.activeAthleteId = (savedActiveAthlete && this.athletes.some(a => a.id === savedActiveAthlete))
      ? savedActiveAthlete
      : this.athletes[0].id;
    Storage.set(STORAGE_KEYS.ACTIVE_ATHLETE_ID, this.activeAthleteId);

    // 4. Cargar bitácora de series
    const savedLogs = Storage.get(STORAGE_KEYS.WORKOUT_LOGS);
    if (Array.isArray(savedLogs) && savedLogs.length > 0) {
      this.workoutLogs = savedLogs;
    } else {
      this.workoutLogs = this.createDefaultWorkoutLogs();
      Storage.set(STORAGE_KEYS.WORKOUT_LOGS, this.workoutLogs);
    }
  }

  createDefaultAthlete() {
    const defaultPrs = {};
    const defaultHistory = [];
    const unit = this.settings.unit;
    const now = Date.now();
    const oneWeekAgo = now - (7 * 24 * 3600 * 1000);
    const twoWeeksAgo = now - (14 * 24 * 3600 * 1000);

    GYM_MOVEMENTS.forEach(m => {
      const baseKg = m.defaultPRKg;
      const currentVal = unit === 'LBS' ? kgToLbs(baseKg) : baseKg;
      defaultPrs[m.id] = currentVal;

      // Crear progresión histórica realista
      const val1 = unit === 'LBS' ? kgToLbs(baseKg * 0.88) : Math.round(baseKg * 0.88);
      const val2 = unit === 'LBS' ? kgToLbs(baseKg * 0.94) : Math.round(baseKg * 0.94);

      defaultHistory.push({
        movementId: m.id,
        value: val1,
        unit: unit,
        date: new Date(twoWeeksAgo).toISOString().split('T')[0],
        timestamp: twoWeeksAgo,
        note: 'Evaluación inicial'
      });
      defaultHistory.push({
        movementId: m.id,
        value: val2,
        unit: unit,
        date: new Date(oneWeekAgo).toISOString().split('T')[0],
        timestamp: oneWeekAgo,
        note: 'Progresión de fuerza'
      });
      defaultHistory.push({
        movementId: m.id,
        value: currentVal,
        unit: unit,
        date: new Date(now).toISOString().split('T')[0],
        timestamp: now,
        note: 'Nuevo Récord Personal'
      });
    });

    return {
      id: 'athlete-' + Date.now(),
      name: 'Atleta Pro',
      gender: 'Hombre',
      bodyweight: unit === 'LBS' ? 176 : 80,
      centerId: this.activeCenterId,
      notes: 'Perfil principal de musculación y alto rendimiento.',
      prs: defaultPrs,
      prHistory: defaultHistory
    };
  }

  createDefaultWorkoutLogs() {
    const athlete = this.getActiveAthlete() || (this.athletes && this.athletes[0]);
    const athleteId = athlete ? athlete.id : 'athlete-default';
    const centerId = this.activeCenterId || (this.centers[0] ? this.centers[0].id : 'center-1');
    const unit = this.settings.unit;
    const now = Date.now();
    const oneDay = 24 * 3600 * 1000;

    return [
      {
        id: 'log-sample-1',
        athleteId,
        centerId,
        movementId: 'prensa-piernas',
        date: new Date(now - 12 * oneDay).toISOString(),
        timestamp: now - 12 * oneDay,
        sets: [{ setNumber: 1, weight: unit === 'LBS' ? 310 : 140, reps: 10, isPR: false }],
        notes: 'Sesión de adaptación en prensa'
      },
      {
        id: 'log-sample-2',
        athleteId,
        centerId,
        movementId: 'jalon-pecho',
        date: new Date(now - 10 * oneDay).toISOString(),
        timestamp: now - 10 * oneDay,
        sets: [{ setNumber: 1, weight: unit === 'LBS' ? 135 : 60, reps: 10, isPR: false }],
        notes: 'Enfoque en dorsal ancho'
      },
      {
        id: 'log-sample-3',
        athleteId,
        centerId,
        movementId: 'press-pecho-maquina',
        date: new Date(now - 8 * oneDay).toISOString(),
        timestamp: now - 8 * oneDay,
        sets: [{ setNumber: 1, weight: unit === 'LBS' ? 155 : 70, reps: 10, isPR: false }],
        notes: 'Pectoral medio y tríceps'
      },
      {
        id: 'log-sample-4',
        athleteId,
        centerId,
        movementId: 'prensa-piernas',
        date: new Date(now - 6 * oneDay).toISOString(),
        timestamp: now - 6 * oneDay,
        sets: [{ setNumber: 1, weight: unit === 'LBS' ? 355 : 160, reps: 8, isPR: true }],
        notes: 'Progresión y nuevo récord'
      },
      {
        id: 'log-sample-5',
        athleteId,
        centerId,
        movementId: 'remo-sentado',
        date: new Date(now - 4 * oneDay).toISOString(),
        timestamp: now - 4 * oneDay,
        sets: [{ setNumber: 1, weight: unit === 'LBS' ? 145 : 65, reps: 10, isPR: false }],
        notes: 'Tracción horizontal y romboides'
      },
      {
        id: 'log-sample-6',
        athleteId,
        centerId,
        movementId: 'press-pecho-maquina',
        date: new Date(now - 2 * oneDay).toISOString(),
        timestamp: now - 2 * oneDay,
        sets: [{ setNumber: 1, weight: unit === 'LBS' ? 175 : 80, reps: 8, isPR: true }],
        notes: 'Récord personal superado'
      },
      {
        id: 'log-sample-7',
        athleteId,
        centerId,
        movementId: 'prensa-piernas',
        date: new Date(now - 1 * oneDay).toISOString(),
        timestamp: now - 1 * oneDay,
        sets: [{ setNumber: 1, weight: unit === 'LBS' ? 395 : 180, reps: 6, isPR: true }],
        notes: 'Intensidad máxima'
      }
    ];
  }

  getActiveAthlete() {
    return this.athletes.find(a => a.id === this.activeAthleteId) || this.athletes[0];
  }

  getActiveCenter() {
    return this.centers.find(c => c.id === this.activeCenterId) || this.centers[0];
  }

  getSelectedMovement() {
    return GYM_MOVEMENTS.find(m => m.id === this.selectedMovementId) || GYM_MOVEMENTS[0];
  }

  setSelectedMovement(id) {
    if (GYM_MOVEMENTS.some(m => m.id === id)) {
      this.selectedMovementId = id;
      this.notify('movement-changed', { movementId: id });
    }
  }

  // ===============================
  // GESTIÓN DE CENTROS
  // ===============================
  setActiveCenter(centerId) {
    if (this.centers.some(c => c.id === centerId)) {
      this.activeCenterId = centerId;
      Storage.set(STORAGE_KEYS.ACTIVE_CENTER_ID, centerId);
      this.notify('center-changed', { centerId });
    }
  }

  addCenter(name, description) {
    if (!name || !name.trim()) return null;
    const newCenter = {
      id: 'center-' + Date.now(),
      name: name.trim(),
      description: (description || '').trim()
    };
    this.centers.push(newCenter);
    Storage.set(STORAGE_KEYS.CENTERS, this.centers);
    this.setActiveCenter(newCenter.id);
    this.notify('center-added', { center: newCenter });
    return newCenter;
  }

  editCenter(centerId, name, description) {
    const center = this.centers.find(c => c.id === centerId);
    if (!center) return false;
    center.name = (name || center.name).trim();
    center.description = (description !== undefined ? description : center.description).trim();
    Storage.set(STORAGE_KEYS.CENTERS, this.centers);
    this.notify('center-updated', { center });
    return true;
  }

  deleteCenter(centerId) {
    if (this.centers.length <= 1) {
      throw new Error('Debe haber al menos un centro de entrenamiento configurado.');
    }
    this.centers = this.centers.filter(c => c.id !== centerId);
    Storage.set(STORAGE_KEYS.CENTERS, this.centers);
    if (this.activeCenterId === centerId) {
      this.setActiveCenter(this.centers[0].id);
    } else {
      this.notify('center-deleted', { centerId });
    }
    return true;
  }

  // ===============================
  // GESTIÓN DE ATLETAS Y PERFILES
  // ===============================
  setActiveAthlete(athleteId) {
    if (this.athletes.some(a => a.id === athleteId)) {
      this.activeAthleteId = athleteId;
      Storage.set(STORAGE_KEYS.ACTIVE_ATHLETE_ID, athleteId);
      this.notify('athlete-changed', { athleteId });
    }
  }

  addAthlete(data) {
    const { name, gender = 'Hombre', bodyweight = 75, notes = '', centerId } = data;
    if (!name || !name.trim()) throw new Error('El nombre del atleta es obligatorio.');

    const defaultPrs = {};
    const defaultHistory = [];
    const unit = this.settings.unit;
    const now = Date.now();

    GYM_MOVEMENTS.forEach(m => {
      const baseKg = m.defaultPRKg;
      const initialVal = unit === 'LBS' ? kgToLbs(baseKg) : baseKg;
      defaultPrs[m.id] = initialVal;
      defaultHistory.push({
        movementId: m.id,
        value: initialVal,
        unit: unit,
        date: new Date(now).toISOString().split('T')[0],
        timestamp: now,
        note: 'Registro de perfil'
      });
    });

    const newAthlete = {
      id: 'athlete-' + Date.now(),
      name: name.trim(),
      gender,
      bodyweight: Number(bodyweight) || 70,
      centerId: centerId || this.activeCenterId,
      notes: (notes || '').trim(),
      prs: defaultPrs,
      prHistory: defaultHistory
    };

    this.athletes.push(newAthlete);
    Storage.set(STORAGE_KEYS.ATHLETES, this.athletes);
    this.setActiveAthlete(newAthlete.id);
    this.notify('athlete-added', { athlete: newAthlete });
    return newAthlete;
  }

  editAthlete(athleteId, data) {
    const athlete = this.athletes.find(a => a.id === athleteId);
    if (!athlete) return false;
    if (data.name) athlete.name = data.name.trim();
    if (data.gender) athlete.gender = data.gender;
    if (data.bodyweight !== undefined) athlete.bodyweight = Number(data.bodyweight);
    if (data.notes !== undefined) athlete.notes = data.notes.trim();
    if (data.centerId) athlete.centerId = data.centerId;

    Storage.set(STORAGE_KEYS.ATHLETES, this.athletes);
    this.notify('athlete-updated', { athlete });
    return true;
  }

  deleteAthlete(athleteId) {
    if (this.athletes.length <= 1) {
      throw new Error('Debe haber al menos un perfil de atleta registrado.');
    }
    this.athletes = this.athletes.filter(a => a.id !== athleteId);
    Storage.set(STORAGE_KEYS.ATHLETES, this.athletes);
    if (this.activeAthleteId === athleteId) {
      this.setActiveAthlete(this.athletes[0].id);
    } else {
      this.notify('athlete-deleted', { athleteId });
    }
    return true;
  }

  // ===============================
  // GESTIÓN Y ACTUALIZACIÓN DE PRs
  // ===============================
  getPR(movementId) {
    const athlete = this.getActiveAthlete();
    if (!athlete || !athlete.prs) return 0;
    return Number(athlete.prs[movementId]) || 0;
  }

  updatePR(movementId, newValue, note = 'Actualización manual') {
    const athlete = this.getActiveAthlete();
    if (!athlete) return false;

    const val = Number(newValue);
    if (isNaN(val) || val <= 0) throw new Error('El valor del PR debe ser un número positivo.');

    if (!athlete.prs) athlete.prs = {};
    if (!athlete.prHistory) athlete.prHistory = [];

    const previousVal = athlete.prs[movementId] || 0;
    athlete.prs[movementId] = val;

    const now = Date.now();
    const historyEntry = {
      movementId,
      value: val,
      previousValue: previousVal,
      unit: this.settings.unit,
      date: new Date(now).toISOString().split('T')[0],
      timestamp: now,
      note: note.trim()
    };
    athlete.prHistory.push(historyEntry);

    Storage.set(STORAGE_KEYS.ATHLETES, this.athletes);
    this.notify('pr-updated', { athleteId: athlete.id, movementId, value: val, historyEntry });
    return true;
  }

  // ==========================================
  // CONVERSIÓN DE UNIDADES Y COHERENCIA HISTÓRICA
  // ==========================================
  setUnit(newUnit) {
    if (newUnit !== 'KG' && newUnit !== 'LBS') return;
    const oldUnit = this.settings.unit;
    if (oldUnit === newUnit) return;

    // Regla de Negocio 4.2 de AGENTS.md:
    // Al cambiar la unidad preferida del atleta (Kg <-> Lbs), se convierten automáticamente:
    // 1. Los PRs vigentes de todos los movimientos.
    // 2. El historial temporal de PRs (prHistory) para evitar saltos o inconsistencias en gráficos y reportes.

    this.athletes.forEach(athlete => {
      // 1. Convertir PRs vigentes
      if (athlete.prs) {
        Object.keys(athlete.prs).forEach(movId => {
          const current = athlete.prs[movId];
          if (current !== undefined && !isNaN(current)) {
            athlete.prs[movId] = convertWeight(current, oldUnit, newUnit, 1);
          }
        });
      }

      // 2. Convertir Historial temporal de PRs
      if (Array.isArray(athlete.prHistory)) {
        athlete.prHistory.forEach(record => {
          if (record.value !== undefined && !isNaN(record.value)) {
            record.value = convertWeight(record.value, oldUnit, newUnit, 1);
            record.unit = newUnit;
          }
          if (record.previousValue !== undefined && !isNaN(record.previousValue)) {
            record.previousValue = convertWeight(record.previousValue, oldUnit, newUnit, 1);
          }
        });
      }

      // Convertir peso corporal del atleta
      if (athlete.bodyweight) {
        athlete.bodyweight = convertWeight(athlete.bodyweight, oldUnit, newUnit, 1);
      }
    });

    // Convertir registros de series de entrenamiento
    this.workoutLogs.forEach(log => {
      if (Array.isArray(log.sets)) {
        log.sets.forEach(set => {
          if (set.weight !== undefined && !isNaN(set.weight)) {
            set.weight = convertWeight(set.weight, oldUnit, newUnit, 1);
          }
        });
      }
    });

    this.settings.unit = newUnit;
    Storage.set(STORAGE_KEYS.SETTINGS, this.settings);
    Storage.set(STORAGE_KEYS.ATHLETES, this.athletes);
    Storage.set(STORAGE_KEYS.WORKOUT_LOGS, this.workoutLogs);

    this.notify('unit-changed', { oldUnit, newUnit });
  }

  setBarType(barType) {
    if (!BAR_TYPES[barType]) return;
    this.settings.barType = barType;
    Storage.set(STORAGE_KEYS.SETTINGS, this.settings);
    this.notify('bar-type-changed', { barType });
  }

  // ===============================
  // BITÁCORA DE ENTRENAMIENTO (LOGS)
  // ===============================
  logWorkoutSet(movementId, weight, reps, notes = '') {
    const athlete = this.getActiveAthlete();
    const currentPR = this.getPR(movementId);
    const numWeight = Number(weight);
    const numReps = Number(reps);
    const isPR = numWeight > currentPR && numReps >= 1;

    const newLog = {
      id: 'log-' + Date.now(),
      athleteId: athlete.id,
      centerId: this.activeCenterId,
      movementId,
      date: new Date().toISOString(),
      timestamp: Date.now(),
      sets: [
        {
          setNumber: 1,
          weight: numWeight,
          reps: numReps,
          isPR
        }
      ],
      notes: notes.trim()
    };

    this.workoutLogs.unshift(newLog);
    // Limitar a los últimos 500 registros para optimización de almacenamiento
    if (this.workoutLogs.length > 500) {
      this.workoutLogs = this.workoutLogs.slice(0, 500);
    }
    Storage.set(STORAGE_KEYS.WORKOUT_LOGS, this.workoutLogs);

    // Si superó el PR, actualizarlo automáticamente
    if (isPR) {
      this.updatePR(movementId, numWeight, `Nuevo PR en serie: ${numWeight} ${this.settings.unit} x ${numReps} reps`);
    }

    this.notify('workout-logged', { log: newLog, isPR });
    return { log: newLog, isPR };
  }

  getAthleteLogs(athleteId = this.activeAthleteId, movementId = null) {
    return this.workoutLogs.filter(log => {
      const matchAthlete = log.athleteId === athleteId;
      const matchMovement = movementId ? log.movementId === movementId : true;
      return matchAthlete && matchMovement;
    });
  }

  deleteWorkoutLog(logId) {
    const idx = this.workoutLogs.findIndex(l => l.id === logId);
    if (idx !== -1) {
      this.workoutLogs.splice(idx, 1);
      Storage.set(STORAGE_KEYS.WORKOUT_LOGS, this.workoutLogs);
      this.notify('workout-deleted', { logId });
      return true;
    }
    return false;
  }

  // ===============================
  // SISTEMA DE SUSCRIPCIÓN REACTIVO
  // ===============================
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify(event, payload = {}) {
    this.listeners.forEach(listener => {
      try {
        listener(event, payload, this);
      } catch (err) {
        console.error('[StateManager] Error en listener reactivo:', err);
      }
    });
  }
}

export const AppState = new StateManager();

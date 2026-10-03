(() => {
  // src/js/storage.js
  var STORAGE_KEYS = {
    DEVICE_ID: "gimnasio_device_id",
    INSTALL_TIME: "gimnasio_install_timestamp",
    LICENSE_TOKEN: "gimnasio_license_token",
    LICENSE_DATA: "gimnasio_license_data",
    ATHLETES: "gimnasio_athletes",
    ACTIVE_ATHLETE_ID: "gimnasio_active_athlete_id",
    CENTERS: "gimnasio_centers",
    ACTIVE_CENTER_ID: "gimnasio_active_center_id",
    SETTINGS: "gimnasio_settings",
    WORKOUT_LOGS: "gimnasio_workout_logs"
  };
  var memoryFallback = /* @__PURE__ */ new Map();
  var Storage = {
    get(key, defaultValue = null) {
      try {
        if (typeof window !== "undefined" && window.localStorage) {
          const item = window.localStorage.getItem(key);
          if (item === null || item === void 0) return defaultValue;
          try {
            return JSON.parse(item);
          } catch {
            return item;
          }
        }
      } catch (e) {
        console.warn(`[Storage] Error al leer llave "${key}":`, e);
      }
      return memoryFallback.has(key) ? memoryFallback.get(key) : defaultValue;
    },
    set(key, value) {
      try {
        const serialized = typeof value === "string" ? value : JSON.stringify(value);
        if (typeof window !== "undefined" && window.localStorage) {
          window.localStorage.setItem(key, serialized);
        }
        memoryFallback.set(key, value);
        return true;
      } catch (e) {
        console.error(`[Storage] Error al persistir llave "${key}":`, e);
        memoryFallback.set(key, value);
        return false;
      }
    },
    remove(key) {
      try {
        if (typeof window !== "undefined" && window.localStorage) {
          window.localStorage.removeItem(key);
        }
        memoryFallback.delete(key);
      } catch (e) {
        console.warn(`[Storage] Error al eliminar llave "${key}":`, e);
      }
    },
    clearAll() {
      try {
        if (typeof window !== "undefined" && window.localStorage) {
          Object.values(STORAGE_KEYS).forEach((k) => {
            window.localStorage.removeItem(k);
          });
        }
        memoryFallback.clear();
      } catch (e) {
        console.error("[Storage] Error al limpiar datos:", e);
      }
    }
  };

  // src/js/movements.js
  var GYM_MOVEMENTS = [
    {
      id: "prensa-piernas",
      name: "Prensa de Piernas",
      muscles: "Cu\xE1driceps, Isquiotibiales, Gl\xFAteos",
      icons: "\u{1F9B5}\u{1F3CB}\uFE0F\u200D\u2642\uFE0F\u{1F4A5}",
      category: "Piernas",
      machineType: "Discos / Prensa 45\xB0",
      defaultPRKg: 180,
      tags: ["Piernas", "Gl\xFAteos", "Fuerza"],
      cues: "Apoyo lumbar firme en el respaldo, pies al ancho de hombros, descenso controlado sin bloquear rodillas al extender."
    },
    {
      id: "jalon-pecho",
      name: "Jal\xF3n al Pecho (Polea Alta)",
      muscles: "Dorsal Ancho, B\xEDceps, Hombros",
      icons: "\u{1F98D}\u{1F4AA}\u2B07\uFE0F",
      category: "Espalda",
      machineType: "Polea / Torre de Placas",
      defaultPRKg: 75,
      tags: ["Espalda", "Dorsales", "B\xEDceps"],
      cues: "Pecho erguido, tracci\xF3n guiada con los codos hacia abajo y atr\xE1s, sin balanceo excesivo del torso."
    },
    {
      id: "press-pecho",
      name: "Press de Pecho en M\xE1quina",
      muscles: "Pectorales, Tr\xEDceps, Deltoides Anterior",
      icons: "\u{1F9B8}\u200D\u2642\uFE0F\u{1F6E1}\uFE0F\u{1F4AA}",
      category: "Pectorales",
      machineType: "M\xE1quina Convergente / Placas",
      defaultPRKg: 85,
      tags: ["Pecho", "Pectorales", "Tr\xEDceps"],
      cues: "Ajuste del asiento a la altura del estern\xF3n, esc\xE1pulas retra\xEDdas, empuje potente manteniendo hombros abajo."
    },
    {
      id: "peck-deck",
      name: "Peck Deck (M\xE1quina Mariposa)",
      muscles: "Pectorales (zona central y externa)",
      icons: "\u{1F98B}\u{1F4AA}",
      category: "Pectorales",
      machineType: "Torre de Placas",
      defaultPRKg: 65,
      tags: ["Pecho", "Aislamiento"],
      cues: "Codos ligeramente flexionados, recorrido circular abrazando un barril imaginario, m\xE1xima contracci\xF3n isom\xE9trica."
    },
    {
      id: "extension-piernas",
      name: "Extensi\xF3n de Piernas",
      muscles: "Cu\xE1driceps",
      icons: "\u{1F9B5}\u26A1",
      category: "Piernas",
      machineType: "Torre de Placas",
      defaultPRKg: 70,
      tags: ["Piernas", "Cu\xE1driceps", "Aislamiento"],
      cues: "Alinear el eje de la m\xE1quina con la articulaci\xF3n de la rodilla, pausa de 1 segundo arriba, bajada lenta."
    },
    {
      id: "curl-piernas",
      name: "Curl de Piernas",
      muscles: "Isquiotibiales",
      icons: "\u{1F9B5}\u{1FA9D}",
      category: "Piernas",
      machineType: "Torre de Placas (Tumbado / Sentado)",
      defaultPRKg: 55,
      tags: ["Piernas", "Isquiotibiales"],
      cues: "Caderas pegadas al banco, flexi\xF3n explosiva contrayendo los femorales, fase exc\xE9ntrica controlada."
    },
    {
      id: "remo-sentado",
      name: "Remo Sentado en M\xE1quina",
      muscles: "Espalda Media (Romboides), Dorsales",
      icons: "\u{1F6F6}\u{1F4AA}\u{1F519}",
      category: "Espalda",
      machineType: "Polea Baja / Placas",
      defaultPRKg: 75,
      tags: ["Espalda", "Romboides", "Dorsales"],
      cues: "Columna neutra, tracci\xF3n de codos pegados al cuerpo, pellizco escapular firme al final del recorrido."
    },
    {
      id: "elevacion-talones",
      name: "Elevaci\xF3n de Talones",
      muscles: "Pantorrillas (Gemelos y S\xF3leo)",
      icons: "\u{1FA70}\u{1F9B5}\u{1F525}",
      category: "Pantorrillas",
      machineType: "M\xE1quina Sentado / De Pie",
      defaultPRKg: 90,
      tags: ["Piernas", "Pantorrillas"],
      cues: "Rango de movimiento completo, estiramiento profundo abajo y m\xE1xima elevaci\xF3n sobre el metatarso arriba."
    },
    {
      id: "extension-triceps",
      name: "Extensi\xF3n de Tr\xEDceps en Polea",
      muscles: "Tr\xEDceps",
      icons: "\u{1F9BE}\u26D3\uFE0F\u2B07\uFE0F",
      category: "Brazos",
      machineType: "Torre de Polea Alta",
      defaultPRKg: 40,
      tags: ["Brazos", "Tr\xEDceps"],
      cues: "Codos pegados a los costados sin desplazarse, apertura de cuerda o barra al final de la extensi\xF3n."
    },
    {
      id: "curl-biceps",
      name: "Curl de B\xEDceps en M\xE1quina",
      muscles: "B\xEDceps Braquial",
      icons: "\u{1F4AA}\u{1F60E}",
      category: "Brazos",
      machineType: "M\xE1quina Banco Scott / Placas",
      defaultPRKg: 45,
      tags: ["Brazos", "B\xEDceps"],
      cues: "Axilas bien calzadas en el acolchado, movimiento fluido sin despegar los codos de la almohadilla."
    },
    {
      id: "maquina-smith",
      name: "M\xE1quina Smith (Sentadillas)",
      muscles: "Cu\xE1driceps, Gl\xFAteos, Core",
      icons: "\u{1F351}\u{1F3CB}\uFE0F\u200D\u2640\uFE0F\u{1F3D7}\uFE0F",
      category: "Piernas",
      machineType: "Barra Smith Guiada",
      defaultPRKg: 120,
      tags: ["Piernas", "Fuerza", "Smith"],
      cues: "Barra sobre trapecios, pies ligeramente adelantados para \xE9nfasis en cu\xE1driceps, profundidad por debajo de 90\xB0."
    },
    {
      id: "maquina-abductora",
      name: "M\xE1quina Abductora / Aductora",
      muscles: "Gl\xFAteo Medio, Aductores (entrepierna)",
      icons: "\u{1F938}\u200D\u2640\uFE0F\u{1F9B5}\u2194\uFE0F",
      category: "Piernas",
      machineType: "Torre de Placas Doble Funci\xF3n",
      defaultPRKg: 60,
      tags: ["Piernas", "Gl\xFAteo Medio", "Aductores"],
      cues: "Espalda bien apoyada en el respaldo, apertura o cierre seg\xFAn modo con tensi\xF3n continua sin golpear las placas."
    }
  ];
  function getMovementById(id) {
    return GYM_MOVEMENTS.find((m) => m.id === id) || GYM_MOVEMENTS[0];
  }

  // src/js/state.js
  var KG_TO_LBS_FACTOR = 2.20462;
  function kgToLbs(kg, round = 1) {
    const val = Number(kg) * KG_TO_LBS_FACTOR;
    return Number(val.toFixed(round));
  }
  function lbsToKg(lbs, round = 1) {
    const val = Number(lbs) / KG_TO_LBS_FACTOR;
    return Number(val.toFixed(round));
  }
  function convertWeight(value, fromUnit, toUnit, round = 1) {
    if (fromUnit === toUnit) return Number(value);
    if (fromUnit === "KG" && toUnit === "LBS") return kgToLbs(value, round);
    if (fromUnit === "LBS" && toUnit === "KG") return lbsToKg(value, round);
    return Number(value);
  }
  var DEFAULT_CENTERS = [
    {
      id: "center-1",
      name: "Box Gym Central",
      description: "Sede principal de musculaci\xF3n avanzada, potencia y alto rendimiento."
    },
    {
      id: "center-2",
      name: "Garage Gym Pro",
      description: "\xC1rea especializada en peso libre, barras ol\xEDmpicas y fuerza pura."
    },
    {
      id: "center-3",
      name: "Club Gimnasio",
      description: "Espacio integral con m\xE1quinas guiadas, poleas y acondicionamiento f\xEDsico."
    }
  ];
  var BAR_TYPES = {
    men: {
      id: "men",
      label: "Hombre (20 kg / 45 lb)",
      weightKg: 20,
      weightLbs: 45
    },
    women: {
      id: "women",
      label: "Mujer (15 kg / 35 lb)",
      weightKg: 15,
      weightLbs: 35
    }
  };
  var StateManager = class {
    constructor() {
      this.listeners = /* @__PURE__ */ new Set();
      this.centers = [];
      this.activeCenterId = null;
      this.athletes = [];
      this.activeAthleteId = null;
      this.settings = {
        unit: "KG",
        // 'KG' o 'LBS'
        barType: "men"
        // 'men' o 'women'
      };
      this.workoutLogs = [];
      this.selectedMovementId = GYM_MOVEMENTS[0].id;
    }
    init() {
      const savedCenters = Storage.get(STORAGE_KEYS.CENTERS);
      if (Array.isArray(savedCenters) && savedCenters.length > 0) {
        this.centers = savedCenters;
      } else {
        this.centers = [...DEFAULT_CENTERS];
        Storage.set(STORAGE_KEYS.CENTERS, this.centers);
      }
      const savedActiveCenter = Storage.get(STORAGE_KEYS.ACTIVE_CENTER_ID);
      this.activeCenterId = savedActiveCenter && this.centers.some((c) => c.id === savedActiveCenter) ? savedActiveCenter : this.centers[0].id;
      Storage.set(STORAGE_KEYS.ACTIVE_CENTER_ID, this.activeCenterId);
      const savedSettings = Storage.get(STORAGE_KEYS.SETTINGS);
      if (savedSettings) {
        this.settings = { ...this.settings, ...savedSettings };
      } else {
        Storage.set(STORAGE_KEYS.SETTINGS, this.settings);
      }
      const savedAthletes = Storage.get(STORAGE_KEYS.ATHLETES);
      if (Array.isArray(savedAthletes) && savedAthletes.length > 0) {
        this.athletes = savedAthletes;
      } else {
        const defaultAthlete = this.createDefaultAthlete();
        this.athletes = [defaultAthlete];
        Storage.set(STORAGE_KEYS.ATHLETES, this.athletes);
      }
      const savedActiveAthlete = Storage.get(STORAGE_KEYS.ACTIVE_ATHLETE_ID);
      this.activeAthleteId = savedActiveAthlete && this.athletes.some((a) => a.id === savedActiveAthlete) ? savedActiveAthlete : this.athletes[0].id;
      Storage.set(STORAGE_KEYS.ACTIVE_ATHLETE_ID, this.activeAthleteId);
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
      const oneWeekAgo = now - 7 * 24 * 3600 * 1e3;
      const twoWeeksAgo = now - 14 * 24 * 3600 * 1e3;
      GYM_MOVEMENTS.forEach((m) => {
        const baseKg = m.defaultPRKg;
        const currentVal = unit === "LBS" ? kgToLbs(baseKg) : baseKg;
        defaultPrs[m.id] = currentVal;
        const val1 = unit === "LBS" ? kgToLbs(baseKg * 0.88) : Math.round(baseKg * 0.88);
        const val2 = unit === "LBS" ? kgToLbs(baseKg * 0.94) : Math.round(baseKg * 0.94);
        defaultHistory.push({
          movementId: m.id,
          value: val1,
          unit,
          date: new Date(twoWeeksAgo).toISOString().split("T")[0],
          timestamp: twoWeeksAgo,
          note: "Evaluaci\xF3n inicial"
        });
        defaultHistory.push({
          movementId: m.id,
          value: val2,
          unit,
          date: new Date(oneWeekAgo).toISOString().split("T")[0],
          timestamp: oneWeekAgo,
          note: "Progresi\xF3n de fuerza"
        });
        defaultHistory.push({
          movementId: m.id,
          value: currentVal,
          unit,
          date: new Date(now).toISOString().split("T")[0],
          timestamp: now,
          note: "Nuevo R\xE9cord Personal"
        });
      });
      return {
        id: "athlete-" + Date.now(),
        name: "Atleta Pro",
        gender: "Hombre",
        bodyweight: unit === "LBS" ? 176 : 80,
        centerId: this.activeCenterId,
        notes: "Perfil principal de musculaci\xF3n y alto rendimiento.",
        prs: defaultPrs,
        prHistory: defaultHistory
      };
    }
    createDefaultWorkoutLogs() {
      const athlete = this.getActiveAthlete() || this.athletes && this.athletes[0];
      const athleteId = athlete ? athlete.id : "athlete-default";
      const centerId = this.activeCenterId || (this.centers[0] ? this.centers[0].id : "center-1");
      const unit = this.settings.unit;
      const now = Date.now();
      const oneDay = 24 * 3600 * 1e3;
      return [
        {
          id: "log-sample-1",
          athleteId,
          centerId,
          movementId: "prensa-piernas",
          date: new Date(now - 12 * oneDay).toISOString(),
          timestamp: now - 12 * oneDay,
          sets: [{ setNumber: 1, weight: unit === "LBS" ? 310 : 140, reps: 10, isPR: false }],
          notes: "Sesi\xF3n de adaptaci\xF3n en prensa"
        },
        {
          id: "log-sample-2",
          athleteId,
          centerId,
          movementId: "jalon-pecho",
          date: new Date(now - 10 * oneDay).toISOString(),
          timestamp: now - 10 * oneDay,
          sets: [{ setNumber: 1, weight: unit === "LBS" ? 135 : 60, reps: 10, isPR: false }],
          notes: "Enfoque en dorsal ancho"
        },
        {
          id: "log-sample-3",
          athleteId,
          centerId,
          movementId: "press-pecho-maquina",
          date: new Date(now - 8 * oneDay).toISOString(),
          timestamp: now - 8 * oneDay,
          sets: [{ setNumber: 1, weight: unit === "LBS" ? 155 : 70, reps: 10, isPR: false }],
          notes: "Pectoral medio y tr\xEDceps"
        },
        {
          id: "log-sample-4",
          athleteId,
          centerId,
          movementId: "prensa-piernas",
          date: new Date(now - 6 * oneDay).toISOString(),
          timestamp: now - 6 * oneDay,
          sets: [{ setNumber: 1, weight: unit === "LBS" ? 355 : 160, reps: 8, isPR: true }],
          notes: "Progresi\xF3n y nuevo r\xE9cord"
        },
        {
          id: "log-sample-5",
          athleteId,
          centerId,
          movementId: "remo-sentado",
          date: new Date(now - 4 * oneDay).toISOString(),
          timestamp: now - 4 * oneDay,
          sets: [{ setNumber: 1, weight: unit === "LBS" ? 145 : 65, reps: 10, isPR: false }],
          notes: "Tracci\xF3n horizontal y romboides"
        },
        {
          id: "log-sample-6",
          athleteId,
          centerId,
          movementId: "press-pecho-maquina",
          date: new Date(now - 2 * oneDay).toISOString(),
          timestamp: now - 2 * oneDay,
          sets: [{ setNumber: 1, weight: unit === "LBS" ? 175 : 80, reps: 8, isPR: true }],
          notes: "R\xE9cord personal superado"
        },
        {
          id: "log-sample-7",
          athleteId,
          centerId,
          movementId: "prensa-piernas",
          date: new Date(now - 1 * oneDay).toISOString(),
          timestamp: now - 1 * oneDay,
          sets: [{ setNumber: 1, weight: unit === "LBS" ? 395 : 180, reps: 6, isPR: true }],
          notes: "Intensidad m\xE1xima"
        }
      ];
    }
    getActiveAthlete() {
      return this.athletes.find((a) => a.id === this.activeAthleteId) || this.athletes[0];
    }
    getActiveCenter() {
      return this.centers.find((c) => c.id === this.activeCenterId) || this.centers[0];
    }
    getSelectedMovement() {
      return GYM_MOVEMENTS.find((m) => m.id === this.selectedMovementId) || GYM_MOVEMENTS[0];
    }
    setSelectedMovement(id) {
      if (GYM_MOVEMENTS.some((m) => m.id === id)) {
        this.selectedMovementId = id;
        this.notify("movement-changed", { movementId: id });
      }
    }
    // ===============================
    // GESTIÓN DE CENTROS
    // ===============================
    setActiveCenter(centerId) {
      if (this.centers.some((c) => c.id === centerId)) {
        this.activeCenterId = centerId;
        Storage.set(STORAGE_KEYS.ACTIVE_CENTER_ID, centerId);
        this.notify("center-changed", { centerId });
      }
    }
    addCenter(name, description) {
      if (!name || !name.trim()) return null;
      const newCenter = {
        id: "center-" + Date.now(),
        name: name.trim(),
        description: (description || "").trim()
      };
      this.centers.push(newCenter);
      Storage.set(STORAGE_KEYS.CENTERS, this.centers);
      this.setActiveCenter(newCenter.id);
      this.notify("center-added", { center: newCenter });
      return newCenter;
    }
    editCenter(centerId, name, description) {
      const center = this.centers.find((c) => c.id === centerId);
      if (!center) return false;
      center.name = (name || center.name).trim();
      center.description = (description !== void 0 ? description : center.description).trim();
      Storage.set(STORAGE_KEYS.CENTERS, this.centers);
      this.notify("center-updated", { center });
      return true;
    }
    deleteCenter(centerId) {
      if (this.centers.length <= 1) {
        throw new Error("Debe haber al menos un centro de entrenamiento configurado.");
      }
      this.centers = this.centers.filter((c) => c.id !== centerId);
      Storage.set(STORAGE_KEYS.CENTERS, this.centers);
      if (this.activeCenterId === centerId) {
        this.setActiveCenter(this.centers[0].id);
      } else {
        this.notify("center-deleted", { centerId });
      }
      return true;
    }
    // ===============================
    // GESTIÓN DE ATLETAS Y PERFILES
    // ===============================
    setActiveAthlete(athleteId) {
      if (this.athletes.some((a) => a.id === athleteId)) {
        this.activeAthleteId = athleteId;
        Storage.set(STORAGE_KEYS.ACTIVE_ATHLETE_ID, athleteId);
        this.notify("athlete-changed", { athleteId });
      }
    }
    addAthlete(data) {
      const { name, gender = "Hombre", bodyweight = 75, notes = "", centerId } = data;
      if (!name || !name.trim()) throw new Error("El nombre del atleta es obligatorio.");
      const defaultPrs = {};
      const defaultHistory = [];
      const unit = this.settings.unit;
      const now = Date.now();
      GYM_MOVEMENTS.forEach((m) => {
        const baseKg = m.defaultPRKg;
        const initialVal = unit === "LBS" ? kgToLbs(baseKg) : baseKg;
        defaultPrs[m.id] = initialVal;
        defaultHistory.push({
          movementId: m.id,
          value: initialVal,
          unit,
          date: new Date(now).toISOString().split("T")[0],
          timestamp: now,
          note: "Registro de perfil"
        });
      });
      const newAthlete = {
        id: "athlete-" + Date.now(),
        name: name.trim(),
        gender,
        bodyweight: Number(bodyweight) || 70,
        centerId: centerId || this.activeCenterId,
        notes: (notes || "").trim(),
        prs: defaultPrs,
        prHistory: defaultHistory
      };
      this.athletes.push(newAthlete);
      Storage.set(STORAGE_KEYS.ATHLETES, this.athletes);
      this.setActiveAthlete(newAthlete.id);
      this.notify("athlete-added", { athlete: newAthlete });
      return newAthlete;
    }
    editAthlete(athleteId, data) {
      const athlete = this.athletes.find((a) => a.id === athleteId);
      if (!athlete) return false;
      if (data.name) athlete.name = data.name.trim();
      if (data.gender) athlete.gender = data.gender;
      if (data.bodyweight !== void 0) athlete.bodyweight = Number(data.bodyweight);
      if (data.notes !== void 0) athlete.notes = data.notes.trim();
      if (data.centerId) athlete.centerId = data.centerId;
      Storage.set(STORAGE_KEYS.ATHLETES, this.athletes);
      this.notify("athlete-updated", { athlete });
      return true;
    }
    deleteAthlete(athleteId) {
      if (this.athletes.length <= 1) {
        throw new Error("Debe haber al menos un perfil de atleta registrado.");
      }
      this.athletes = this.athletes.filter((a) => a.id !== athleteId);
      Storage.set(STORAGE_KEYS.ATHLETES, this.athletes);
      if (this.activeAthleteId === athleteId) {
        this.setActiveAthlete(this.athletes[0].id);
      } else {
        this.notify("athlete-deleted", { athleteId });
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
    updatePR(movementId, newValue, note = "Actualizaci\xF3n manual") {
      const athlete = this.getActiveAthlete();
      if (!athlete) return false;
      const val = Number(newValue);
      if (isNaN(val) || val <= 0) throw new Error("El valor del PR debe ser un n\xFAmero positivo.");
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
        date: new Date(now).toISOString().split("T")[0],
        timestamp: now,
        note: note.trim()
      };
      athlete.prHistory.push(historyEntry);
      Storage.set(STORAGE_KEYS.ATHLETES, this.athletes);
      this.notify("pr-updated", { athleteId: athlete.id, movementId, value: val, historyEntry });
      return true;
    }
    // ==========================================
    // CONVERSIÓN DE UNIDADES Y COHERENCIA HISTÓRICA
    // ==========================================
    setUnit(newUnit) {
      if (newUnit !== "KG" && newUnit !== "LBS") return;
      const oldUnit = this.settings.unit;
      if (oldUnit === newUnit) return;
      this.athletes.forEach((athlete) => {
        if (athlete.prs) {
          Object.keys(athlete.prs).forEach((movId) => {
            const current = athlete.prs[movId];
            if (current !== void 0 && !isNaN(current)) {
              athlete.prs[movId] = convertWeight(current, oldUnit, newUnit, 1);
            }
          });
        }
        if (Array.isArray(athlete.prHistory)) {
          athlete.prHistory.forEach((record) => {
            if (record.value !== void 0 && !isNaN(record.value)) {
              record.value = convertWeight(record.value, oldUnit, newUnit, 1);
              record.unit = newUnit;
            }
            if (record.previousValue !== void 0 && !isNaN(record.previousValue)) {
              record.previousValue = convertWeight(record.previousValue, oldUnit, newUnit, 1);
            }
          });
        }
        if (athlete.bodyweight) {
          athlete.bodyweight = convertWeight(athlete.bodyweight, oldUnit, newUnit, 1);
        }
      });
      this.workoutLogs.forEach((log) => {
        if (Array.isArray(log.sets)) {
          log.sets.forEach((set) => {
            if (set.weight !== void 0 && !isNaN(set.weight)) {
              set.weight = convertWeight(set.weight, oldUnit, newUnit, 1);
            }
          });
        }
      });
      this.settings.unit = newUnit;
      Storage.set(STORAGE_KEYS.SETTINGS, this.settings);
      Storage.set(STORAGE_KEYS.ATHLETES, this.athletes);
      Storage.set(STORAGE_KEYS.WORKOUT_LOGS, this.workoutLogs);
      this.notify("unit-changed", { oldUnit, newUnit });
    }
    setBarType(barType) {
      if (!BAR_TYPES[barType]) return;
      this.settings.barType = barType;
      Storage.set(STORAGE_KEYS.SETTINGS, this.settings);
      this.notify("bar-type-changed", { barType });
    }
    // ===============================
    // BITÁCORA DE ENTRENAMIENTO (LOGS)
    // ===============================
    logWorkoutSet(movementId, weight, reps, notes = "") {
      const athlete = this.getActiveAthlete();
      const currentPR = this.getPR(movementId);
      const numWeight = Number(weight);
      const numReps = Number(reps);
      const isPR = numWeight > currentPR && numReps >= 1;
      const newLog = {
        id: "log-" + Date.now(),
        athleteId: athlete.id,
        centerId: this.activeCenterId,
        movementId,
        date: (/* @__PURE__ */ new Date()).toISOString(),
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
      if (this.workoutLogs.length > 500) {
        this.workoutLogs = this.workoutLogs.slice(0, 500);
      }
      Storage.set(STORAGE_KEYS.WORKOUT_LOGS, this.workoutLogs);
      if (isPR) {
        this.updatePR(movementId, numWeight, `Nuevo PR en serie: ${numWeight} ${this.settings.unit} x ${numReps} reps`);
      }
      this.notify("workout-logged", { log: newLog, isPR });
      return { log: newLog, isPR };
    }
    getAthleteLogs(athleteId = this.activeAthleteId, movementId = null) {
      return this.workoutLogs.filter((log) => {
        const matchAthlete = log.athleteId === athleteId;
        const matchMovement = movementId ? log.movementId === movementId : true;
        return matchAthlete && matchMovement;
      });
    }
    deleteWorkoutLog(logId) {
      const idx = this.workoutLogs.findIndex((l) => l.id === logId);
      if (idx !== -1) {
        this.workoutLogs.splice(idx, 1);
        Storage.set(STORAGE_KEYS.WORKOUT_LOGS, this.workoutLogs);
        this.notify("workout-deleted", { logId });
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
      this.listeners.forEach((listener) => {
        try {
          listener(event, payload, this);
        } catch (err) {
          console.error("[StateManager] Error en listener reactivo:", err);
        }
      });
    }
  };
  var AppState = new StateManager();

  // src/js/crypto.js
  var CRYPTO_SALTS = [
    "Halterofilia-SuperSecret-Salt-2026",
    "Gimnasio-SuperSecret-Salt-2026"
  ];
  var PRIMARY_SALT = "Halterofilia-SuperSecret-Salt-2026";
  function generateDeviceId() {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      try {
        return crypto.randomUUID().replace(/-/g, "").slice(0, 16).toUpperCase();
      } catch {
      }
    }
    const arr = new Uint8Array(8);
    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
      crypto.getRandomValues(arr);
    } else {
      for (let i = 0; i < 8; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
    }
    return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
  }
  async function sha256(message) {
    const msgUint8 = new TextEncoder().encode(message);
    if (typeof crypto !== "undefined" && crypto.subtle && crypto.subtle.digest) {
      const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    }
    return fallbackSha256(message);
  }
  async function computeSignature(deviceId, email, exp, salt = PRIMARY_SALT) {
    const rawString = `${deviceId.trim().toUpperCase()}|${email.trim().toLowerCase()}|${exp}|${salt}`;
    return await sha256(rawString);
  }
  async function generateActivationToken(deviceId, email, exp, salt = PRIMARY_SALT) {
    const cleanDeviceId = deviceId.trim().toUpperCase();
    const cleanEmail = email.trim().toLowerCase();
    const expiration = Number(exp);
    const signature = await computeSignature(cleanDeviceId, cleanEmail, expiration, salt);
    const payload = {
      deviceId: cleanDeviceId,
      email: cleanEmail,
      exp: expiration,
      signature
    };
    const jsonStr = JSON.stringify(payload);
    return btoa(unescape(encodeURIComponent(jsonStr)));
  }
  async function verifyActivationToken(tokenBase64, currentDeviceId) {
    if (!tokenBase64 || typeof tokenBase64 !== "string") {
      return { valid: false, reason: "Token vac\xEDo o formato incorrecto." };
    }
    let payload;
    try {
      const decodedStr = decodeURIComponent(escape(atob(tokenBase64.trim())));
      payload = JSON.parse(decodedStr);
    } catch {
      return { valid: false, reason: "El token no es un Base64 o JSON v\xE1lido." };
    }
    const { deviceId, email, exp, signature } = payload;
    if (!deviceId || !email || exp === void 0 || !signature) {
      return { valid: false, reason: "Estructura del token incompleta." };
    }
    if (deviceId.toUpperCase() !== currentDeviceId.trim().toUpperCase()) {
      return {
        valid: false,
        reason: `El token pertenece al dispositivo ${deviceId}, pero este equipo es ${currentDeviceId}.`
      };
    }
    const now = Date.now();
    if (exp > 0 && exp < now) {
      const expiredDate = new Date(exp).toLocaleDateString("es-CL");
      return {
        valid: false,
        reason: `La licencia expir\xF3 el ${expiredDate}.`
      };
    }
    let signatureMatched = false;
    for (const salt of CRYPTO_SALTS) {
      const expectedSig = await computeSignature(deviceId, email, exp, salt);
      if (expectedSig.toLowerCase() === signature.toLowerCase()) {
        signatureMatched = true;
        break;
      }
    }
    if (!signatureMatched) {
      return { valid: false, reason: "Firma criptogr\xE1fica inv\xE1lida o alterada." };
    }
    return { valid: true, payload };
  }
  function fallbackSha256(ascii) {
    function rightRotate(value, amount) {
      return value >>> amount | value << 32 - amount;
    }
    const mathPow = Math.pow;
    const maxWord = mathPow(2, 32);
    let lengthProperty = "length";
    let i, j;
    let result = "";
    const words = [];
    const asciiBitLength = ascii[lengthProperty] * 8;
    let hash = [];
    let k = [];
    let primeCounter = 0;
    const isComposite = {};
    for (let candidate = 2; primeCounter < 64; candidate++) {
      if (!isComposite[candidate]) {
        for (i = 0; i < 300; i += candidate) {
          isComposite[i] = candidate;
        }
        hash[primeCounter] = mathPow(candidate, 0.5) * maxWord | 0;
        k[primeCounter++] = mathPow(candidate, 1 / 3) * maxWord | 0;
      }
    }
    ascii += "\x80";
    while (ascii[lengthProperty] % 64 - 56) ascii += "\0";
    for (i = 0; i < ascii[lengthProperty]; i++) {
      j = ascii.charCodeAt(i);
      if (j >> 8) return;
      words[i >> 2] |= j << (3 - i) % 4 * 8;
    }
    words[words[lengthProperty]] = asciiBitLength / maxWord | 0;
    words[words[lengthProperty]] = asciiBitLength;
    for (j = 0; j < words[lengthProperty]; ) {
      const w = words.slice(j, j += 16);
      const oldHash = hash;
      hash = hash.slice(0, 8);
      for (i = 0; i < 64; i++) {
        const w15 = w[i - 15], w2 = w[i - 2];
        const s0 = rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ w15 >>> 3;
        const s1 = rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ w2 >>> 10;
        const ch = hash[4] & hash[5] ^ ~hash[4] & hash[6];
        const maj = hash[0] & hash[1] ^ hash[0] & hash[2] ^ hash[1] & hash[2];
        const temp1 = hash[7] + (rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25)) + ch + k[i] + (w[i] = i < 16 ? w[i] : w[i - 16] + s0 + w[i - 7] + s1 | 0);
        const temp2 = (rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22)) + maj;
        hash = [temp1 + temp2 | 0].concat(hash);
        hash[4] = hash[4] + temp1 | 0;
      }
      for (i = 0; i < 8; i++) {
        hash[i] = hash[i] + oldHash[i] | 0;
      }
    }
    for (i = 0; i < 8; i++) {
      for (j = 3; j + 1; j--) {
        const b = hash[i] >> j * 8 & 255;
        result += (b < 16 ? "0" : "") + b.toString(16);
      }
    }
    return result;
  }

  // src/js/license.js
  var TRIAL_HOURS = 72;
  var TRIAL_DURATION_MS = TRIAL_HOURS * 60 * 60 * 1e3;
  var CONTACT_PHONE = "+56933395447";
  var WHATSAPP_URL = "https://wa.me/56933395447";
  var LicenseManager = class {
    constructor() {
      this.deviceId = null;
      this.installTimestamp = null;
      this.isLicensed = false;
      this.licenseData = null;
      this.isTrialExpired = false;
      this.remainingTrialMs = 0;
    }
    async init() {
      let deviceId = Storage.get(STORAGE_KEYS.DEVICE_ID);
      if (!deviceId) {
        deviceId = generateDeviceId();
        Storage.set(STORAGE_KEYS.DEVICE_ID, deviceId);
      }
      this.deviceId = deviceId;
      let installTime = Storage.get(STORAGE_KEYS.INSTALL_TIME);
      if (!installTime) {
        installTime = Date.now();
        Storage.set(STORAGE_KEYS.INSTALL_TIME, installTime);
      }
      this.installTimestamp = Number(installTime);
      const savedToken = Storage.get(STORAGE_KEYS.LICENSE_TOKEN);
      if (savedToken) {
        const verification = await verifyActivationToken(savedToken, this.deviceId);
        if (verification.valid) {
          this.isLicensed = true;
          this.licenseData = verification.payload;
          this.isTrialExpired = false;
          this.remainingTrialMs = Infinity;
          return this.getStatus();
        } else {
          this.isLicensed = false;
          this.licenseData = null;
          Storage.remove(STORAGE_KEYS.LICENSE_TOKEN);
          Storage.remove(STORAGE_KEYS.LICENSE_DATA);
        }
      }
      this.checkTrialStatus();
      return this.getStatus();
    }
    checkTrialStatus() {
      if (this.isLicensed) {
        this.isTrialExpired = false;
        this.remainingTrialMs = Infinity;
        return false;
      }
      const now = Date.now();
      const elapsed = now - this.installTimestamp;
      this.remainingTrialMs = Math.max(0, TRIAL_DURATION_MS - elapsed);
      this.isTrialExpired = elapsed > TRIAL_DURATION_MS;
      return this.isTrialExpired;
    }
    getRequestCode(email = "atleta@correo.com") {
      const cleanEmail = email.trim() || "atleta@correo.com";
      return `REQ|${this.deviceId}|${cleanEmail}`;
    }
    getWhatsAppLink(email = "") {
      const reqCode = this.getRequestCode(email);
      const message = encodeURIComponent(
        `Hola Andres, solicito la clave de activaci\xF3n para Gimnasio Pro.
C\xF3digo de Solicitud: ${reqCode}`
      );
      return `${WHATSAPP_URL}?text=${message}`;
    }
    async activateWithToken(tokenBase64) {
      if (!tokenBase64 || !tokenBase64.trim()) {
        return { success: false, message: "Debe ingresar un token de activaci\xF3n." };
      }
      const verification = await verifyActivationToken(tokenBase64.trim(), this.deviceId);
      if (!verification.valid) {
        return { success: false, message: verification.reason || "Token no v\xE1lido." };
      }
      this.isLicensed = true;
      this.licenseData = verification.payload;
      this.isTrialExpired = false;
      this.remainingTrialMs = Infinity;
      Storage.set(STORAGE_KEYS.LICENSE_TOKEN, tokenBase64.trim());
      Storage.set(STORAGE_KEYS.LICENSE_DATA, verification.payload);
      return {
        success: true,
        message: "\xA1Licencia activada con \xE9xito! Acceso ilimitado desbloqueado.",
        payload: verification.payload
      };
    }
    deactivate() {
      this.isLicensed = false;
      this.licenseData = null;
      Storage.remove(STORAGE_KEYS.LICENSE_TOKEN);
      Storage.remove(STORAGE_KEYS.LICENSE_DATA);
      this.checkTrialStatus();
    }
    getStatus() {
      this.checkTrialStatus();
      const hoursLeft = Math.floor(this.remainingTrialMs / (1e3 * 60 * 60));
      const daysLeft = (hoursLeft / 24).toFixed(1);
      return {
        deviceId: this.deviceId,
        isLicensed: this.isLicensed,
        licenseData: this.licenseData,
        isTrialExpired: this.isTrialExpired,
        remainingTrialMs: this.remainingTrialMs,
        hoursLeft,
        daysLeft,
        installDate: new Date(this.installTimestamp).toLocaleDateString("es-CL"),
        contactPhone: CONTACT_PHONE,
        whatsappUrl: WHATSAPP_URL
      };
    }
    // Generador de clave auxiliar (para uso administrativo o pruebas rápidas)
    async generateTokenForDevice(deviceId, email, daysValid = 365) {
      const exp = daysValid === 0 ? 0 : Date.now() + daysValid * 24 * 60 * 60 * 1e3;
      return await generateActivationToken(deviceId, email, exp);
    }
  };
  var License = new LicenseManager();

  // src/js/charts.js
  function renderPRTrendChart(dataPoints, unit = "KG", width = 600, height = 240) {
    if (!Array.isArray(dataPoints) || dataPoints.length === 0) {
      return `
      <div class="empty-chart">
        <span class="icon">\u{1F4C8}</span>
        <p>A\xFAn no hay suficientes registros hist\xF3ricos para este movimiento.</p>
      </div>
    `;
    }
    const padding = { top: 30, right: 35, bottom: 40, left: 55 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;
    const values = dataPoints.map((d) => Number(d.value));
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
    const points = dataPoints.map((d, index) => {
      const x = padding.left + (dataPoints.length > 1 ? index / (dataPoints.length - 1) * chartW : chartW / 2);
      const y = padding.top + chartH - (d.value - minVal) / valRange * chartH;
      return { ...d, x, y };
    });
    let pathD = "";
    points.forEach((pt, i) => {
      if (i === 0) {
        pathD += `M ${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
      } else {
        const prev = points[i - 1];
        const cx1 = prev.x + (pt.x - prev.x) / 2;
        const cy1 = prev.y;
        const cx2 = prev.x + (pt.x - prev.x) / 2;
        const cy2 = pt.y;
        pathD += ` C ${cx1.toFixed(1)},${cy1.toFixed(1)} ${cx2.toFixed(1)},${cy2.toFixed(1)} ${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
      }
    });
    const firstPt = points[0];
    const lastPt = points[points.length - 1];
    const areaD = `${pathD} L ${lastPt.x.toFixed(1)},${(padding.top + chartH).toFixed(1)} L ${firstPt.x.toFixed(1)},${(padding.top + chartH).toFixed(1)} Z`;
    const steps = 4;
    let gridLines = "";
    for (let s = 0; s <= steps; s++) {
      const gridY = padding.top + s / steps * chartH;
      const gridVal = maxVal - s / steps * valRange;
      gridLines += `
      <line x1="${padding.left}" y1="${gridY}" x2="${width - padding.right}" y2="${gridY}" stroke="#334155" stroke-dasharray="3,3" stroke-width="1" />
      <text x="${padding.left - 10}" y="${gridY + 4}" fill="#94a3b8" font-size="11" text-anchor="end" font-family="system-ui, sans-serif">${Math.round(gridVal)} ${unit}</text>
    `;
    }
    const circles = points.map((pt, i) => `
    <g class="chart-point-group" tabindex="0">
      <circle cx="${pt.x.toFixed(1)}" cy="${pt.y.toFixed(1)}" r="6" fill="#06b6d4" stroke="#0f172a" stroke-width="2.5" class="chart-circle" />
      <circle cx="${pt.x.toFixed(1)}" cy="${pt.y.toFixed(1)}" r="12" fill="transparent" class="hover-hitbox">
        <title>${pt.date}: ${pt.value} ${unit} ${pt.note ? `(${pt.note})` : ""}</title>
      </circle>
      <text x="${pt.x.toFixed(1)}" y="${(pt.y - 12).toFixed(1)}" fill="#f8fafc" font-size="11" font-weight="600" text-anchor="middle" font-family="system-ui, sans-serif" class="point-label">${pt.value}</text>
      <text x="${pt.x.toFixed(1)}" y="${(padding.top + chartH + 20).toFixed(1)}" fill="#94a3b8" font-size="10" text-anchor="middle" font-family="system-ui, sans-serif">${pt.date.slice(5)}</text>
    </g>
  `).join("");
    return `
    <svg viewBox="0 0 ${width} ${height}" class="pr-svg-chart" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Gr\xE1fico de evoluci\xF3n del PR">
      <defs>
        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#06b6d4" stop-opacity="0.45" />
          <stop offset="100%" stop-color="#06b6d4" stop-opacity="0.02" />
        </linearGradient>
      </defs>
      
      <!-- Fondo y Gu\xEDas -->
      ${gridLines}

      <!-- \xC1rea de color degradada -->
      <path d="${areaD}" fill="url(#chartGradient)" />

      <!-- L\xEDnea principal con resplandor -->
      <path d="${pathD}" fill="none" stroke="#06b6d4" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="chart-main-line" />

      <!-- Puntos de datos -->
      ${circles}
    </svg>
  `;
  }
  function renderWorkoutVolumeChart(logs, unit = "KG", width = 600, height = 240) {
    if (!Array.isArray(logs) || logs.length === 0) {
      return `
      <div class="empty-chart">
        <span class="icon">\u{1F4CA}</span>
        <p>A\xFAn no hay series registradas en el hist\xF3rico para graficar.</p>
      </div>
    `;
    }
    const volumeByDate = {};
    logs.forEach((log) => {
      const dateStr = log.date ? log.date.split("T")[0] : new Date(log.timestamp).toISOString().split("T")[0];
      let vol = 0;
      let setsCount = 0;
      (log.sets || []).forEach((s) => {
        vol += (Number(s.weight) || 0) * (Number(s.reps) || 0);
        setsCount++;
      });
      if (!volumeByDate[dateStr]) {
        volumeByDate[dateStr] = { date: dateStr, volume: 0, sets: 0, timestamp: log.timestamp || new Date(dateStr).getTime() };
      }
      volumeByDate[dateStr].volume += vol;
      volumeByDate[dateStr].sets += setsCount;
    });
    const dailyPoints = Object.values(volumeByDate).sort((a, b) => a.timestamp - b.timestamp).slice(-10);
    if (dailyPoints.length === 0) {
      return `
      <div class="empty-chart">
        <span class="icon">\u{1F4CA}</span>
        <p>A\xFAn no hay suficiente volumen registrado.</p>
      </div>
    `;
    }
    const padding = { top: 35, right: 30, bottom: 45, left: 60 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;
    const volumes = dailyPoints.map((d) => d.volume);
    const maxVol = Math.max(...volumes, 100);
    const volRange = maxVol * 1.15;
    const barWidth = Math.min(36, Math.max(16, chartW / dailyPoints.length * 0.55));
    const colStep = chartW / dailyPoints.length;
    const steps = 4;
    let gridLines = "";
    for (let s = 0; s <= steps; s++) {
      const gridY = padding.top + s / steps * chartH;
      const gridVal = volRange - s / steps * volRange;
      gridLines += `
      <line x1="${padding.left}" y1="${gridY}" x2="${width - padding.right}" y2="${gridY}" stroke="#334155" stroke-dasharray="3,3" stroke-width="1" />
      <text x="${padding.left - 10}" y="${gridY + 4}" fill="#94a3b8" font-size="10" text-anchor="end" font-family="system-ui, sans-serif">${Math.round(gridVal)} ${unit}</text>
    `;
    }
    const bars = dailyPoints.map((dp, i) => {
      const barH = Math.max(4, dp.volume / volRange * chartH);
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
    }).join("");
    return `
    <svg viewBox="0 0 ${width} ${height}" class="pr-svg-chart" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Gr\xE1fico de volumen de entrenamiento">
      <defs>
        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#f59e0b" />
          <stop offset="100%" stop-color="#d97706" />
        </linearGradient>
      </defs>
      
      <!-- Fondo y Gu\xEDas -->
      ${gridLines}

      <!-- Barras de Volumen -->
      ${bars}
    </svg>
  `;
  }
  function renderMuscleDistributionBars(categoriesData, unit = "KG") {
    if (!categoriesData || categoriesData.length === 0) return "";
    const maxTotal = Math.max(...categoriesData.map((c) => c.prTotal), 1);
    return categoriesData.map((item) => {
      const percent = Math.round(item.prTotal / maxTotal * 100);
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
    }).join("");
  }

  // src/js/ui.js
  var UIManager = class {
    constructor() {
      this.currentTab = "athlete";
      this.reportsHistoryFilter = "all";
      this.restTimerInterval = null;
      this.restTimerSeconds = 0;
    }
    init() {
      this.bindHeaderNav();
      this.bindGlobalKeyboard();
      this.renderCurrentView();
      this.checkLicenseEnforcement();
      AppState.subscribe((event) => {
        this.handleStateUpdate(event);
      });
    }
    // ===============================
    // NAVEGACIÓN Y TABS
    // ===============================
    bindHeaderNav() {
      const navButtons = document.querySelectorAll(".nav-btn");
      navButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
          const tab = btn.getAttribute("data-tab");
          this.switchTab(tab);
        });
      });
    }
    switchTab(tabName) {
      if (!["athlete", "reports", "prs", "license", "settings"].includes(tabName)) return;
      this.currentTab = tabName;
      document.querySelectorAll(".nav-btn").forEach((btn) => {
        const isTarget = btn.getAttribute("data-tab") === tabName;
        btn.classList.toggle("active", isTarget);
        btn.setAttribute("aria-selected", isTarget ? "true" : "false");
      });
      document.querySelectorAll(".view-panel").forEach((panel) => {
        panel.classList.add("hidden");
      });
      const activePanel = document.getElementById(`view-${tabName}`);
      if (activePanel) {
        activePanel.classList.remove("hidden");
      }
      this.renderCurrentView();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    renderCurrentView() {
      this.renderHeaderBadges();
      switch (this.currentTab) {
        case "athlete":
          this.renderTrainingView();
          break;
        case "reports":
          this.renderReportsView();
          break;
        case "prs":
          this.renderPRsView();
          break;
        case "license":
          this.renderLicenseView();
          break;
        case "settings":
          this.renderSettingsView();
          break;
      }
    }
    renderHeaderBadges() {
      const athleteChip = document.getElementById("header-athlete-chip");
      const centerChip = document.getElementById("header-center-chip");
      const unitChip = document.getElementById("header-unit-chip");
      const athlete = AppState.getActiveAthlete();
      const center = AppState.getActiveCenter();
      const unit = AppState.settings.unit;
      if (athleteChip && athlete) {
        athleteChip.innerHTML = `<span class="chip-icon">\u{1F464}</span> <span class="chip-text">${this.escapeHTML(athlete.name)}</span>`;
      }
      if (centerChip && center) {
        centerChip.innerHTML = `<span class="chip-icon">\u{1F4CD}</span> <span class="chip-text">${this.escapeHTML(center.name)}</span>`;
      }
      if (unitChip) {
        unitChip.textContent = unit;
      }
    }
    handleStateUpdate(event) {
      this.renderHeaderBadges();
      if (this.currentTab === "athlete") {
        this.renderTrainingView();
      } else if (this.currentTab === "reports") {
        this.renderReportsView();
      } else if (this.currentTab === "prs") {
        this.renderPRsView();
      } else if (this.currentTab === "settings") {
        this.renderSettingsView();
      }
    }
    // ===============================
    // VISTA 1: ENTRENAMIENTO & ATLETA (PASO 1 Y PASO 2)
    // ===============================
    renderTrainingView() {
      const container = document.getElementById("view-athlete");
      if (!container) return;
      const athlete = AppState.getActiveAthlete();
      const center = AppState.getActiveCenter();
      const unit = AppState.settings.unit;
      const movement = AppState.getSelectedMovement();
      const currentPR = AppState.getPR(movement.id);
      const percentages = [50, 60, 70, 75, 80, 85, 90, 95, 100];
      const percentageRows = percentages.map((pct) => {
        const calculatedWeight = Math.round(currentPR * (pct / 100) * 10) / 10;
        return `
        <button type="button" class="pct-btn" data-weight="${calculatedWeight}" title="Cargar ${calculatedWeight} ${unit} a la serie">
          <span class="pct-num">${pct}%</span>
          <span class="pct-val">${calculatedWeight} <small>${unit}</small></span>
        </button>
      `;
      }).join("");
      const plateBreakdown = this.calculatePlateLoading(currentPR, unit, movement);
      container.innerHTML = `
      <div class="view-grid">
        <!-- PASO 1: CONFIGURACI\xD3N DE SESI\xD3N Y PAR\xC1METROS BASE -->
        <section class="card config-card" aria-labelledby="step1-title">
          <div class="card-header flex-between">
            <h2 id="step1-title" class="section-title"><span class="step-badge">Paso 1</span> Configuraci\xF3n de Sesi\xF3n</h2>
            <button id="btn-quick-center" class="btn-subtle btn-xs" title="Administrar centros">+ Nuevo Centro</button>
          </div>
          <div class="session-bar-grid">
            <div class="form-group">
              <label for="session-center-select">Centro de Entrenamiento:</label>
              <select id="session-center-select" class="form-select">
                ${AppState.centers.map((c) => `
                  <option value="${c.id}" ${c.id === center.id ? "selected" : ""}>${this.escapeHTML(c.name)}</option>
                `).join("")}
              </select>
              <p class="field-hint">${this.escapeHTML(center.description || "")}</p>
            </div>

            <div class="form-group">
              <label>Unidad de Carga:</label>
              <div class="unit-toggle-group" role="radiogroup" aria-label="Unidad objetivo">
                <button type="button" class="btn-toggle ${unit === "KG" ? "active" : ""}" data-unit="KG">KG</button>
                <button type="button" class="btn-toggle ${unit === "LBS" ? "active" : ""}" data-unit="LBS">LBS</button>
              </div>
              <p class="field-hint">1 kg = ${KG_TO_LBS_FACTOR} lbs (conversi\xF3n matem\xE1tica exacta)</p>
            </div>
          </div>
        </section>

        <!-- PASO 2: ENTORNO DE ENTRENAMIENTO Y MOTOR H\xCDBRIDO -->
        <section class="card training-card" aria-labelledby="step2-title">
          <div class="card-header flex-between">
            <h2 id="step2-title" class="section-title"><span class="step-badge">Paso 2</span> Entorno de Entrenamiento</h2>
            <div class="header-actions">
              <button id="btn-edit-pr" class="btn-gold btn-sm">\u{1F3C6} Modificar PR</button>
            </div>
          </div>

          <!-- SELECTOR DE MOVIMIENTOS Y DISCIPLINAS (LISTA DESPLEGABLE) -->
          <div class="movement-selector-box">
            <label class="movement-dropdown-label" for="movement-dropdown-select">
              \u{1F3CB}\uFE0F Seleccionar Disciplina / M\xE1quina:
            </label>
            <div class="movement-selector-row">
              <button type="button" id="btn-prev-mov" class="btn-icon" aria-label="Disciplina anterior" title="Disciplina Anterior">\u25C0</button>
              
              <select id="movement-dropdown-select" class="form-select movement-dropdown-select" aria-label="Seleccionar disciplina">
                ${GYM_MOVEMENTS.map((m) => `
                  <option value="${m.id}" ${m.id === movement.id ? "selected" : ""}>
                    ${m.icons} ${m.name} \u2014 (${m.muscles})
                  </option>
                `).join("")}
              </select>

              <button type="button" id="btn-next-mov" class="btn-icon" aria-label="Siguiente disciplina" title="Siguiente Disciplina">\u25B6</button>
            </div>
          </div>

          <!-- FICHA BIOMEC\xC1NICA & PR EN PANTALLA -->
          <div class="pr-hero-banner">
            <div class="pr-hero-left">
              <span class="pr-hero-tag">R\xC9CORD PERSONAL (PR) DEL ATLETA ACTIVO</span>
              <div class="pr-hero-value-wrap">
                <span class="pr-hero-value">${currentPR}</span>
                <span class="pr-hero-unit">${unit}</span>
              </div>
              <p class="pr-hero-sub">Atleta: <strong>${this.escapeHTML(athlete.name)}</strong> (${athlete.gender})</p>
            </div>
            <div class="pr-hero-right">
              <div class="machine-type-chip">\u2699\uFE0F ${movement.machineType}</div>
              <p class="biomechanical-cue">\u{1F4A1} <strong>Clave de ejecuci\xF3n:</strong> ${movement.cues}</p>
            </div>
          </div>

          <!-- TABLA DE PORCENTAJES AUTOM\xC1TICOS -->
          <div class="pct-section">
            <h4 class="subheading">\u{1F3AF} Tabla de Cargas por Porcentaje (% del PR)</h4>
            <div class="pct-grid">
              ${percentageRows}
            </div>
          </div>

          <!-- CALCULADORA DE DISCOS / PLACAS -->
          <div class="plate-calc-box">
            <h4 class="subheading">\u2696\uFE0F Desglose de Carga Sugerida (${currentPR} ${unit})</h4>
            <div class="plate-results">
              ${plateBreakdown}
            </div>
          </div>

          <!-- REGISTRO DE SERIES EN VIVO & CRON\xD3METRO -->
          <div class="workout-tracker-box">
            <div class="flex-between">
              <h4 class="subheading">\u26A1 Registrar Serie de Entrenamiento</h4>
              <!-- CRON\xD3METRO DE DESCANSO -->
              <div class="rest-timer-widget">
                <span class="timer-display" id="rest-timer-display">\u23F1\uFE0F 00:00</span>
                <div class="timer-presets">
                  <button type="button" class="btn-timer-preset" data-seconds="60">60s</button>
                  <button type="button" class="btn-timer-preset" data-seconds="90">90s</button>
                  <button type="button" class="btn-timer-preset" data-seconds="120">2m</button>
                  <button type="button" class="btn-timer-preset" data-seconds="180">3m</button>
                  <button type="button" id="btn-timer-reset" class="btn-timer-preset btn-timer-stop">\u2715</button>
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
      this.bindTrainingEvents();
    }
    bindTrainingEvents() {
      const centerSelect = document.getElementById("session-center-select");
      if (centerSelect) {
        centerSelect.addEventListener("change", (e) => {
          AppState.setActiveCenter(e.target.value);
          this.showToast("Centro de entrenamiento actualizado.", "info");
        });
      }
      const btnQuickCenter = document.getElementById("btn-quick-center");
      if (btnQuickCenter) {
        btnQuickCenter.addEventListener("click", () => {
          this.openCenterModal();
        });
      }
      document.querySelectorAll(".unit-toggle-group .btn-toggle").forEach((btn) => {
        btn.addEventListener("click", () => {
          const newUnit = btn.getAttribute("data-unit");
          if (newUnit !== AppState.settings.unit) {
            AppState.setUnit(newUnit);
            this.showToast(`Unidad cambiada a ${newUnit}. PRs convertidos autom\xE1ticamente con exactitud.`, "success");
          }
        });
      });
      const movSelect = document.getElementById("movement-dropdown-select");
      if (movSelect) {
        movSelect.addEventListener("change", (e) => {
          AppState.setSelectedMovement(e.target.value);
        });
      }
      const btnPrev = document.getElementById("btn-prev-mov");
      const btnNext = document.getElementById("btn-next-mov");
      if (btnPrev && btnNext) {
        btnPrev.addEventListener("click", () => {
          const curIdx = GYM_MOVEMENTS.findIndex((m) => m.id === AppState.selectedMovementId);
          const prevIdx = (curIdx - 1 + GYM_MOVEMENTS.length) % GYM_MOVEMENTS.length;
          AppState.setSelectedMovement(GYM_MOVEMENTS[prevIdx].id);
        });
        btnNext.addEventListener("click", () => {
          const curIdx = GYM_MOVEMENTS.findIndex((m) => m.id === AppState.selectedMovementId);
          const nextIdx = (curIdx + 1) % GYM_MOVEMENTS.length;
          AppState.setSelectedMovement(GYM_MOVEMENTS[nextIdx].id);
        });
      }
      document.querySelectorAll(".pct-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          const w = btn.getAttribute("data-weight");
          const inputWeight = document.getElementById("log-weight");
          if (inputWeight) {
            inputWeight.value = w;
            inputWeight.focus();
            this.showToast(`Carga asignada: ${w} ${AppState.settings.unit}`, "info");
          }
        });
      });
      const btnEditPR = document.getElementById("btn-edit-pr");
      if (btnEditPR) {
        btnEditPR.addEventListener("click", () => {
          this.openEditPRModal(AppState.selectedMovementId);
        });
      }
      const formLog = document.getElementById("form-log-set");
      if (formLog) {
        formLog.addEventListener("submit", (e) => {
          e.preventDefault();
          const weightInput = document.getElementById("log-weight");
          const repsInput = document.getElementById("log-reps");
          const weight = parseFloat(weightInput.value);
          const reps = parseInt(repsInput.value, 10);
          if (isNaN(weight) || weight <= 0) {
            this.showToast("Ingrese un peso v\xE1lido.", "error");
            return;
          }
          const res = AppState.logWorkoutSet(AppState.selectedMovementId, weight, reps);
          if (res.isPR) {
            this.showToast(`\u{1F525} \xA1NUEVO R\xC9CORD PERSONAL! ${weight} ${AppState.settings.unit}`, "pr");
          } else {
            this.showToast("Serie guardada con \xE9xito.", "success");
          }
          this.startRestTimer(90);
          this.renderTrainingView();
        });
      }
      document.querySelectorAll(".btn-timer-preset").forEach((btn) => {
        btn.addEventListener("click", () => {
          const secs = parseInt(btn.getAttribute("data-seconds"), 10);
          if (secs) {
            this.startRestTimer(secs);
          }
        });
      });
      const btnTimerReset = document.getElementById("btn-timer-reset");
      if (btnTimerReset) {
        btnTimerReset.addEventListener("click", () => {
          this.stopRestTimer();
        });
      }
    }
    calculatePlateLoading(targetWeight, unit, movement) {
      if (movement.machineType.includes("Placas") || movement.machineType.includes("Torre")) {
        return `
        <div class="plate-diagram">
          <div class="plate-chip plate-stack">Torre de Placas: Pin magn\xE9tico en ${targetWeight} ${unit}</div>
          <small class="text-muted">Ajuste de pasador magn\xE9tico guiado en la columna de placas numeradas de la m\xE1quina.</small>
        </div>
      `;
      }
      const perSide = Math.max(0, targetWeight / 2);
      const plates = unit === "KG" ? [25, 20, 15, 10, 5, 2.5, 1.25] : [45, 35, 25, 10, 5, 2.5];
      const platesUsed = [];
      let rem = perSide;
      for (const p of plates) {
        const count = Math.floor(rem / p);
        if (count > 0) {
          platesUsed.push(`${count}x${p}${unit}`);
          rem = rem % p;
        }
      }
      const platesText = platesUsed.length > 0 ? platesUsed.join(" + ") : "Sin discos adicionales";
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
        return `<p class="empty-hint">A\xFAn no hay series registradas hoy para este ejercicio.</p>`;
      }
      const recent = logs.slice(0, 5);
      return recent.map((log, idx) => {
        const set = log.sets[0] || {};
        const timeStr = new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        return `
        <div class="recent-set-row ${set.isPR ? "is-pr" : ""}">
          <span class="set-idx">#${idx + 1}</span>
          <span class="set-stat"><strong>${set.weight}</strong> ${AppState.settings.unit}</span>
          <span class="set-stat">\xD7 <strong>${set.reps}</strong> reps</span>
          <span class="set-time">${timeStr}</span>
          ${set.isPR ? '<span class="badge-gold">\xA1PR!</span>' : ""}
        </div>
      `;
      }).join("");
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
          this.showToast("\u{1F514} \xA1Tiempo de descanso completado! A por la siguiente serie.", "info");
        }
      }, 1e3);
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
      const el = document.getElementById("rest-timer-display");
      if (!el) return;
      const mins = Math.floor(this.restTimerSeconds / 60);
      const secs = this.restTimerSeconds % 60;
      el.textContent = `\u23F1\uFE0F ${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
      if (this.restTimerSeconds > 0) {
        el.classList.add("timer-running");
      } else {
        el.classList.remove("timer-running");
      }
    }
    // ===============================
    // VISTA 2: REPORTES Y PROGRESIÓN
    // ===============================
    renderReportsView() {
      const container = document.getElementById("view-reports");
      if (!container) return;
      const athlete = AppState.getActiveAthlete();
      const unit = AppState.settings.unit;
      const movement = AppState.getSelectedMovement();
      const prHistory = (athlete.prHistory || []).filter((h) => h.movementId === movement.id).sort((a, b) => a.timestamp - b.timestamp);
      const currentPR = AppState.getPR(movement.id);
      const initialPR = prHistory.length > 0 ? prHistory[0].value : currentPR;
      const netGain = Math.round((currentPR - initialPR) * 10) / 10;
      const pctGain = initialPR > 0 ? Math.round((currentPR - initialPR) / initialPR * 1e3) / 10 : 0;
      const totalMilestones = prHistory.length;
      const prMilestonesHTML = prHistory.length > 0 ? prHistory.map((h, i) => {
        const prevVal = i > 0 ? prHistory[i - 1].value : h.value;
        const diff = Math.round((h.value - prevVal) * 10) / 10;
        const pct = prevVal > 0 ? Math.round((h.value - prevVal) / prevVal * 1e3) / 10 : 0;
        const diffBadge = i === 0 ? '<span class="badge-subtle">Marca Inicial</span>' : diff > 0 ? `<span class="badge-accent">+${diff} ${unit} (+${pct}%)</span>` : `<span class="badge-subtle">${diff} ${unit}</span>`;
        return `
            <div class="pr-milestone-item">
              <div class="milestone-dot ${i === prHistory.length - 1 ? "dot-active" : ""}"></div>
              <div class="milestone-content">
                <div class="milestone-header">
                  <span class="milestone-date">\u{1F4C5} ${h.date}</span>
                  <span class="milestone-val"><strong>${h.value}</strong> ${unit}</span>
                  ${diffBadge}
                </div>
                <p class="milestone-note">${this.escapeHTML(h.note || "Superaci\xF3n de marca personal")}</p>
              </div>
            </div>
          `;
      }).reverse().join("") : `<p class="empty-hint">Sin registros hist\xF3ricos de PR a\xFAn para este movimiento.</p>`;
      const historyFilter = this.reportsHistoryFilter || "all";
      const allAthleteLogs = AppState.getAthleteLogs(athlete.id);
      const filteredLogs = historyFilter === "all" ? allAthleteLogs : allAthleteLogs.filter((l) => l.movementId === historyFilter);
      let totalSeries = 0;
      let totalVolume = 0;
      let maxWeight = 0;
      let totalReps = 0;
      filteredLogs.forEach((log) => {
        (log.sets || []).forEach((s) => {
          totalSeries++;
          const w = Number(s.weight) || 0;
          const r = Number(s.reps) || 0;
          totalVolume += w * r;
          totalReps += r;
          if (w > maxWeight) maxWeight = w;
        });
      });
      const historyRowsHTML = filteredLogs.length > 0 ? filteredLogs.map((log, idx) => {
        const mov = getMovementById(log.movementId) || { name: log.movementId, icons: "\u{1F3CB}\uFE0F" };
        const centerObj = AppState.centers.find((c) => c.id === log.centerId);
        const centerName = centerObj ? centerObj.name : "Sede Principal";
        const set = log.sets && log.sets[0] || {};
        const weight = set.weight || 0;
        const reps = set.reps || 0;
        const volume = weight * reps;
        const dateStr = log.date ? log.date.split("T")[0] : "";
        const timeStr = new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        return `
            <tr class="history-row ${set.isPR ? "row-is-pr" : ""}">
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
                ${set.isPR ? '<span class="badge-gold">\u{1F525} \xA1Nuevo PR!</span>' : '<span class="badge-subtle">Serie Regular</span>'}
              </td>
              <td class="td-action">
                <button type="button" class="btn-icon-subtle btn-delete-log" data-log-id="${log.id}" title="Eliminar registro">\u{1F5D1}\uFE0F</button>
              </td>
            </tr>
          `;
      }).join("") : `<tr><td colspan="9" class="text-center py-4 text-muted">No se registran series para la disciplina seleccionada.</td></tr>`;
      const categoryTotals = {};
      GYM_MOVEMENTS.forEach((m) => {
        const pr = AppState.getPR(m.id);
        categoryTotals[m.category] = (categoryTotals[m.category] || 0) + pr;
      });
      const muscleData = Object.keys(categoryTotals).map((cat) => ({
        category: cat,
        prTotal: Math.round(categoryTotals[cat]),
        count: GYM_MOVEMENTS.filter((m) => m.category === cat).length
      }));
      container.innerHTML = `
      <div class="view-grid">
        <section class="card reports-main-card">
          <div class="card-header flex-between">
            <div>
              <h2 class="section-title">\u{1F4CA} Reportes y Curvas de Rendimiento</h2>
              <p class="section-subtitle">Progreso biomec\xE1nico, evoluci\xF3n de marcas e hist\xF3rico de entrenamiento de <strong>${this.escapeHTML(athlete.name)}</strong></p>
            </div>
            <div class="unit-badge-indicator">Unidad: <strong>${unit}</strong></div>
          </div>

          <!-- ========================================== -->
          <!-- BLOQUE 1: AVANCE EN EL TIEMPO DE LOS PRS  -->
          <!-- ========================================== -->
          <div class="report-section-container">
            <div class="report-section-header flex-between">
              <div>
                <h3 class="report-section-title">\u{1F3C6} Avance en el Tiempo de los R\xE9cords Personales (PRs)</h3>
                <p class="field-hint">Visualiza la progresi\xF3n hist\xF3rica y los hitos de carga alcanzados en cada disciplina.</p>
              </div>
              <div class="report-filter-wrap">
                <label for="report-pr-mov-select" class="filter-label">Disciplina / M\xE1quina:</label>
                <select id="report-pr-mov-select" class="form-select form-select-sm">
                  ${GYM_MOVEMENTS.map((m) => `
                    <option value="${m.id}" ${m.id === movement.id ? "selected" : ""}>
                      ${m.icons} ${m.name}
                    </option>
                  `).join("")}
                </select>
              </div>
            </div>

            <!-- TARJETAS KPI DE PROGRESI\xD3N DE PR -->
            <div class="report-kpi-grid">
              <div class="kpi-card">
                <span class="kpi-label">PR Inicial</span>
                <span class="kpi-val">${initialPR} <small>${unit}</small></span>
                <span class="kpi-sub">Primer hito registrado</span>
              </div>
              <div class="kpi-card kpi-card-gold">
                <span class="kpi-label">PR Vigente</span>
                <span class="kpi-val text-gold">${currentPR} <small>${unit}</small></span>
                <span class="kpi-sub">R\xE9cord actual en m\xE1quina</span>
              </div>
              <div class="kpi-card ${netGain >= 0 ? "kpi-card-cyan" : ""}">
                <span class="kpi-label">Avance Neto</span>
                <span class="kpi-val text-cyan">${netGain >= 0 ? "+" : ""}${netGain} <small>${unit}</small></span>
                <span class="kpi-sub">Carga total ganada</span>
              </div>
              <div class="kpi-card">
                <span class="kpi-label">Mejora Porcentual</span>
                <span class="kpi-val text-accent">${pctGain >= 0 ? "+" : ""}${pctGain}%</span>
                <span class="kpi-sub">${totalMilestones} hitos registrados</span>
              </div>
            </div>

            <!-- GR\xC1FICO SVG DE EVOLUCI\xD3N HIST\xD3RICA DE PR -->
            <div class="chart-container-box">
              <div class="chart-header flex-between">
                <h4 class="chart-title">Curva de Progresi\xF3n de PR: ${movement.name}</h4>
                <span class="badge-gold">Marca Actual: ${currentPR} ${unit}</span>
              </div>
              <div class="svg-chart-wrapper">
                ${renderPRTrendChart(prHistory, unit)}
              </div>
            </div>

            <!-- CRONOLOG\xCDA DE HITOS DE PR -->
            <div class="milestones-box">
              <h4 class="subheading">\u{1F4C8} Cronolog\xEDa de Hitos de Superaci\xF3n de PR</h4>
              <div class="pr-milestones-timeline">
                ${prMilestonesHTML}
              </div>
            </div>
          </div>

          <!-- ==================================================== -->
          <!-- BLOQUE 2: HIST\xD3RICO DE MOVIMIENTOS Y SESIONES       -->
          <!-- ==================================================== -->
          <div class="report-section-container">
            <div class="report-section-header flex-between">
              <div>
                <h3 class="report-section-title">\u{1F4DC} Hist\xF3rico de Movimientos y Series de Entrenamiento</h3>
                <p class="field-hint">Registro cronol\xF3gico de series, repeticiones, cargas y volumen acumulado a lo largo del tiempo.</p>
              </div>
              <div class="report-filter-wrap">
                <label for="report-history-mov-select" class="filter-label">Filtrar por Disciplina:</label>
                <select id="report-history-mov-select" class="form-select form-select-sm">
                  <option value="all" ${historyFilter === "all" ? "selected" : ""}>\u{1F310} Todas las Disciplinas (Hist\xF3rico Global)</option>
                  ${GYM_MOVEMENTS.map((m) => `
                    <option value="${m.id}" ${m.id === historyFilter ? "selected" : ""}>
                      ${m.icons} ${m.name}
                    </option>
                  `).join("")}
                </select>
              </div>
            </div>

            <!-- TARJETAS KPI DEL HIST\xD3RICO -->
            <div class="report-kpi-grid">
              <div class="kpi-card">
                <span class="kpi-label">Series Totales</span>
                <span class="kpi-val">${totalSeries}</span>
                <span class="kpi-sub">Series completadas</span>
              </div>
              <div class="kpi-card kpi-card-cyan">
                <span class="kpi-label">Volumen Acumulado</span>
                <span class="kpi-val text-cyan">${Math.round(totalVolume).toLocaleString()} <small>${unit}</small></span>
                <span class="kpi-sub">\u2211 (Carga \xD7 Repeticiones)</span>
              </div>
              <div class="kpi-card kpi-card-gold">
                <span class="kpi-label">Carga M\xE1x. Entrenada</span>
                <span class="kpi-val text-gold">${maxWeight} <small>${unit}</small></span>
                <span class="kpi-sub">Carga pico en bit\xE1cora</span>
              </div>
              <div class="kpi-card">
                <span class="kpi-label">Repeticiones Totales</span>
                <span class="kpi-val">${totalReps.toLocaleString()}</span>
                <span class="kpi-sub">Repeticiones ejecutadas</span>
              </div>
            </div>

            <!-- GR\xC1FICO SVG DE VOLUMEN POR SESI\xD3N EN EL TIEMPO -->
            <div class="chart-container-box">
              <div class="chart-header flex-between">
                <h4 class="chart-title">Volumen de Trabajo por Sesi\xF3n a lo Largo del Tiempo</h4>
                <span class="badge-accent">${historyFilter === "all" ? "Todas las Disciplinas" : getMovementById(historyFilter)?.name || ""}</span>
              </div>
              <div class="svg-chart-wrapper">
                ${renderWorkoutVolumeChart(filteredLogs, unit)}
              </div>
            </div>

            <!-- TABLA DEL HIST\xD3RICO DE SERIES -->
            <div class="history-table-container">
              <h4 class="subheading">\u{1F4CB} Bit\xE1cora Detallada de Series en el Tiempo</h4>
              <div class="table-responsive">
                <table class="history-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Fecha y Hora</th>
                      <th>Disciplina / M\xE1quina</th>
                      <th>Carga</th>
                      <th>Reps</th>
                      <th>Volumen</th>
                      <th>Centro / Sede</th>
                      <th>Estado</th>
                      <th>Acci\xF3n</th>
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
          <!-- BLOQUE 3: DISTRIBUCI\xD3N MUSCULAR Y RESPALDO -->
          <!-- ========================================== -->
          <div class="muscle-dist-section">
            <h3 class="chart-title">Distribuci\xF3n de Capacidad de Carga por Grupo Muscular</h3>
            <div class="dist-bars-container">
              ${renderMuscleDistributionBars(muscleData, unit)}
            </div>
          </div>

          <div class="backup-actions-box">
            <h4 class="subheading">\u{1F4BE} Respaldo y Portabilidad de Base de Datos</h4>
            <p class="field-hint">Descarga tus datos completos en JSON o imp\xF3rtalos en cualquier otro dispositivo sin conexi\xF3n.</p>
            <div class="button-row">
              <button id="btn-export-json" class="btn-cyan btn-sm">\u{1F4E5} Descargar Respaldo JSON</button>
              <label class="btn-subtle btn-sm file-input-label">
                \u{1F4E4} Restaurar Respaldo JSON
                <input type="file" id="input-import-json" accept=".json" class="hidden-file-input" />
              </label>
            </div>
          </div>
        </section>
      </div>
    `;
      const prSelect = document.getElementById("report-pr-mov-select");
      if (prSelect) {
        prSelect.addEventListener("change", (e) => {
          AppState.setSelectedMovement(e.target.value);
          this.renderReportsView();
        });
      }
      const historySelect = document.getElementById("report-history-mov-select");
      if (historySelect) {
        historySelect.addEventListener("change", (e) => {
          this.reportsHistoryFilter = e.target.value;
          this.renderReportsView();
        });
      }
      document.querySelectorAll(".btn-delete-log").forEach((btn) => {
        btn.addEventListener("click", () => {
          const logId = btn.getAttribute("data-log-id");
          if (confirm("\xBFEliminar esta serie registrada del hist\xF3rico?")) {
            AppState.deleteWorkoutLog(logId);
            this.showToast("Serie eliminada del hist\xF3rico.", "info");
            this.renderReportsView();
          }
        });
      });
      const btnExport = document.getElementById("btn-export-json");
      if (btnExport) {
        btnExport.addEventListener("click", () => this.exportDatabaseJSON());
      }
      const inputImport = document.getElementById("input-import-json");
      if (inputImport) {
        inputImport.addEventListener("change", (e) => this.importDatabaseJSON(e));
      }
    }
    // ===============================
    // VISTA 3: GESTOR INDEPENDIENTE DE PRs
    // ===============================
    renderPRsView() {
      const container = document.getElementById("view-prs");
      if (!container) return;
      const unit = AppState.settings.unit;
      const athlete = AppState.getActiveAthlete();
      container.innerHTML = `
      <div class="view-grid">
        <section class="card prs-dashboard-card">
          <div class="card-header flex-between">
            <div>
              <h2 class="section-title">\u{1F3C6} R\xE9cords Personales (PRs)</h2>
              <p class="section-subtitle">Gesti\xF3n centralizada de marcas para <strong>${this.escapeHTML(athlete.name)}</strong></p>
            </div>
            <div class="unit-badge-indicator">Unidad: <strong>${unit}</strong></div>
          </div>

          <div class="prs-cards-grid">
            ${GYM_MOVEMENTS.map((m) => {
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
                      \u270F\uFE0F Actualizar PR
                    </button>
                  </div>
                </div>
              `;
      }).join("")}
          </div>
        </section>
      </div>
    `;
      container.querySelectorAll(".btn-update-single-pr").forEach((btn) => {
        btn.addEventListener("click", () => {
          const movId = btn.getAttribute("data-mov-id");
          this.openEditPRModal(movId);
        });
      });
    }
    // ===============================
    // VISTA 4: SEGURIDAD Y LICENCIA
    // ===============================
    renderLicenseView() {
      const container = document.getElementById("view-license");
      if (!container) return;
      const status = License.getStatus();
      const athlete = AppState.getActiveAthlete();
      const emailSample = athlete.email || "atleta@correo.com";
      const requestCode = License.getRequestCode(emailSample);
      const waLink = License.getWhatsAppLink(emailSample);
      container.innerHTML = `
      <div class="view-grid">
        <section class="card license-card">
          <div class="card-header">
            <h2 class="section-title">\u{1F510} M\xF3dulo de Seguridad y Licenciamiento Offline</h2>
            <p class="section-subtitle">Activaci\xF3n criptogr\xE1fica SHA-256 sin dependencia de internet</p>
          </div>

          <div class="license-status-banner ${status.isLicensed ? "status-licensed" : status.isTrialExpired ? "status-expired" : "status-trial"}">
            <div class="status-icon">${status.isLicensed ? "\u{1F6E1}\uFE0F" : status.isTrialExpired ? "\u26A0\uFE0F" : "\u23F3"}</div>
            <div class="status-info">
              <h3>${status.isLicensed ? "Licencia Pro Verificada" : status.isTrialExpired ? "Per\xEDodo de Prueba Expirado" : "Per\xEDodo de Prueba Activo"}</h3>
              <p>
                ${status.isLicensed ? `Registrado para: <strong>${status.licenseData.email}</strong> (Dispositivo ${status.deviceId})` : status.isTrialExpired ? `El tiempo de prueba de 72 horas ha finalizado. Active su licencia para continuar.` : `Tiempo restante: <strong>${status.hoursLeft} horas</strong> (${status.daysLeft} d\xEDas restantes de 72 horas).`}
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
              <p class="field-hint">Identificador \xFAnico del hardware generado localmente en el primer arranque.</p>
            </div>

            <div class="license-box">
              <h3 class="box-title">2. C\xF3digo de Solicitud de Activaci\xF3n</h3>
              <div class="form-group">
                <label for="req-email-input">Correo electr\xF3nico del atleta / comprador:</label>
                <input type="email" id="req-email-input" value="${emailSample}" class="form-input form-input-sm" />
              </div>
              <div class="code-box">
                <code id="display-req-code">${requestCode}</code>
                <button type="button" class="btn-subtle btn-xs" id="btn-copy-req-code">Copiar</button>
              </div>
              <a href="${waLink}" target="_blank" rel="noopener noreferrer" class="btn-whatsapp btn-sm mt-2" id="btn-whatsapp-req">
                \u{1F4F2} Solicitar Clave por WhatsApp (+56933395447)
              </a>
            </div>
          </div>

          <!-- FORMULARIO DE INGRESO DE TOKEN -->
          <div class="license-activation-form-box">
            <h3 class="box-title">3. Validaci\xF3n y Activaci\xF3n de Token</h3>
            <p class="field-hint">Ingrese el token criptogr\xE1fico Base64 entregado por el desarrollador para desbloquear el sistema de forma 100% offline:</p>
            
            <form id="form-activate-token" class="token-form">
              <div class="form-group">
                <label for="input-activation-token">Token Criptogr\xE1fico Base64:</label>
                <textarea id="input-activation-token" class="form-textarea" rows="3" placeholder="Pegue aqu\xED el token recibido..."></textarea>
              </div>
              <div class="button-row">
                <button type="submit" class="btn-primary">Validar y Activar Licencia</button>
                ${status.isLicensed ? '<button type="button" id="btn-deactivate-license" class="btn-red btn-sm">Desactivar Licencia</button>' : ""}
              </div>
            </form>
          </div>

          <!-- GENERADOR AUXILIAR DE LICENCIAS (ADMIN / DEMO TOOL) -->
          <div class="admin-license-generator">
            <details>
              <summary class="generator-summary">\u{1F6E0}\uFE0F Herramienta de Soporte y Generaci\xF3n de Claves (Uso Autorizado)</summary>
              <div class="generator-panel">
                <p class="field-hint">Genera instant\xE1neamente un token v\xE1lido para este Device ID usando la sal criptogr\xE1fica autorizada.</p>
                <div class="button-row mt-2">
                  <button type="button" id="btn-gen-demo-token" class="btn-gold btn-sm">Generar y Pegar Token de 1 A\xF1o</button>
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
      const emailInput = document.getElementById("req-email-input");
      const reqCodeDisplay = document.getElementById("display-req-code");
      const waBtn = document.getElementById("btn-whatsapp-req");
      if (emailInput && reqCodeDisplay && waBtn) {
        emailInput.addEventListener("input", () => {
          const email = emailInput.value.trim() || "atleta@correo.com";
          const code = License.getRequestCode(email);
          reqCodeDisplay.textContent = code;
          waBtn.href = License.getWhatsAppLink(email);
        });
      }
      const btnCopyDev = document.getElementById("btn-copy-device-id");
      if (btnCopyDev) {
        btnCopyDev.addEventListener("click", () => {
          navigator.clipboard.writeText(License.deviceId);
          this.showToast("Device ID copiado al portapapeles.", "info");
        });
      }
      const btnCopyReq = document.getElementById("btn-copy-req-code");
      if (btnCopyReq) {
        btnCopyReq.addEventListener("click", () => {
          const text = reqCodeDisplay ? reqCodeDisplay.textContent : "";
          navigator.clipboard.writeText(text);
          this.showToast("C\xF3digo de solicitud copiado al portapapeles.", "info");
        });
      }
      const formActivate = document.getElementById("form-activate-token");
      if (formActivate) {
        formActivate.addEventListener("submit", async (e) => {
          e.preventDefault();
          const tokenInput = document.getElementById("input-activation-token");
          const token = tokenInput ? tokenInput.value.trim() : "";
          const res = await License.activateWithToken(token);
          if (res.success) {
            this.showToast(res.message, "success");
            this.checkLicenseEnforcement();
            this.renderLicenseView();
          } else {
            this.showToast(res.message, "error");
          }
        });
      }
      const btnDeactivate = document.getElementById("btn-deactivate-license");
      if (btnDeactivate) {
        btnDeactivate.addEventListener("click", () => {
          if (confirm("\xBFDesea remover la licencia activa de este dispositivo?")) {
            License.deactivate();
            this.showToast("Licencia desactivada.", "info");
            this.renderLicenseView();
            this.checkLicenseEnforcement();
          }
        });
      }
      const btnGenDemo = document.getElementById("btn-gen-demo-token");
      if (btnGenDemo) {
        btnGenDemo.addEventListener("click", async () => {
          const email = (emailInput ? emailInput.value.trim() : "") || "atleta@gimnasiopro.cl";
          const token = await License.generateTokenForDevice(License.deviceId, email, 365);
          const tokenArea = document.getElementById("input-activation-token");
          if (tokenArea) {
            tokenArea.value = token;
            this.showToast("Token de 1 a\xF1o generado en el campo. Haga clic en Validar y Activar.", "success");
          }
        });
      }
      const btnGenLifetime = document.getElementById("btn-gen-lifetime-token");
      if (btnGenLifetime) {
        btnGenLifetime.addEventListener("click", async () => {
          const email = (emailInput ? emailInput.value.trim() : "") || "pro@gimnasio.cl";
          const token = await License.generateTokenForDevice(License.deviceId, email, 0);
          const tokenArea = document.getElementById("input-activation-token");
          if (tokenArea) {
            tokenArea.value = token;
            this.showToast("Token perpetuo generado en el campo. Haga clic en Validar y Activar.", "success");
          }
        });
      }
    }
    // ===============================
    // VISTA 5: PARÁMETROS Y GESTIÓN
    // ===============================
    renderSettingsView() {
      const container = document.getElementById("view-settings");
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
              <h2 class="section-title">\u{1F4CD} Centros de Entrenamiento</h2>
              <p class="section-subtitle">Segmentaci\xF3n local de bases de datos por sede o gimnasio</p>
            </div>
            <button id="btn-add-center-modal" class="btn-cyan btn-sm">+ Agregar Centro</button>
          </div>

          <div class="centers-list">
            ${centers.map((c) => `
              <div class="center-item ${c.id === activeCenter.id ? "active" : ""}">
                <div class="center-info">
                  <div class="center-title-row">
                    <span class="center-name">${this.escapeHTML(c.name)}</span>
                    ${c.id === activeCenter.id ? '<span class="badge-accent">Activo</span>' : ""}
                  </div>
                  <p class="center-desc">${this.escapeHTML(c.description || "Sin descripci\xF3n")}</p>
                </div>
                <div class="center-actions">
                  ${c.id !== activeCenter.id ? `<button class="btn-subtle btn-xs btn-set-active-center" data-id="${c.id}">Seleccionar</button>` : ""}
                  <button class="btn-subtle btn-xs btn-edit-center" data-id="${c.id}">Editar</button>
                  ${centers.length > 1 ? `<button class="btn-red btn-xs btn-delete-center" data-id="${c.id}">Eliminar</button>` : ""}
                </div>
              </div>
            `).join("")}
          </div>
        </section>

        <!-- GESTOR MULTI-PERFIL DE ATLETAS -->
        <section class="card settings-card">
          <div class="card-header flex-between">
            <div>
              <h2 class="section-title">\u{1F464} Perfiles de Atletas</h2>
              <p class="section-subtitle">Gesti\xF3n multi-perfil e historial individualizado</p>
            </div>
            <button id="btn-add-athlete-modal" class="btn-cyan btn-sm">+ Nuevo Atleta</button>
          </div>

          <div class="athletes-list">
            ${athletes.map((a) => `
              <div class="athlete-item ${a.id === activeAthlete.id ? "active" : ""}">
                <div class="athlete-info">
                  <div class="athlete-title-row">
                    <span class="athlete-name">${this.escapeHTML(a.name)}</span>
                    <span class="badge-subtle">${a.gender}</span>
                    <span class="badge-subtle">${a.bodyweight} ${unit}</span>
                    ${a.id === activeAthlete.id ? '<span class="badge-accent">Activo</span>' : ""}
                  </div>
                  <p class="athlete-notes">${this.escapeHTML(a.notes || "Sin notas adicionales")}</p>
                </div>
                <div class="athlete-actions">
                  ${a.id !== activeAthlete.id ? `<button class="btn-subtle btn-xs btn-set-active-athlete" data-id="${a.id}">Cambiar</button>` : ""}
                  <button class="btn-subtle btn-xs btn-edit-athlete" data-id="${a.id}">Editar</button>
                  ${athletes.length > 1 ? `<button class="btn-red btn-xs btn-delete-athlete" data-id="${a.id}">Eliminar</button>` : ""}
                </div>
              </div>
            `).join("")}
          </div>
        </section>

        <!-- PAR\xC1METROS GLOBALES -->
        <section class="card settings-card">
          <div class="card-header">
            <h2 class="section-title">\u2699\uFE0F Par\xE1metros Globales y Unidades</h2>
          </div>

          <div class="settings-form-grid">
            <div class="form-group">
              <label>Unidad de Medida del Sistema:</label>
              <div class="unit-toggle-group">
                <button type="button" class="btn-toggle ${unit === "KG" ? "active" : ""}" data-unit-set="KG">Kilogramos (KG)</button>
                <button type="button" class="btn-toggle ${unit === "LBS" ? "active" : ""}" data-unit-set="LBS">Libras (LBS)</button>
              </div>
              <p class="field-hint">Al cambiar la unidad, todos los PRs y el historial se convierten autom\xE1ticamente respetando 1 kg = ${KG_TO_LBS_FACTOR} lbs.</p>
            </div>
          </div>
        </section>
      </div>
    `;
      this.bindSettingsEvents();
    }
    bindSettingsEvents() {
      document.querySelectorAll(".btn-set-active-center").forEach((b) => {
        b.addEventListener("click", () => {
          AppState.setActiveCenter(b.getAttribute("data-id"));
          this.showToast("Centro activo actualizado.", "info");
          this.renderSettingsView();
        });
      });
      document.querySelectorAll(".btn-edit-center").forEach((b) => {
        b.addEventListener("click", () => {
          const cId = b.getAttribute("data-id");
          this.openCenterModal(cId);
        });
      });
      document.querySelectorAll(".btn-delete-center").forEach((b) => {
        b.addEventListener("click", () => {
          const cId = b.getAttribute("data-id");
          if (confirm("\xBFEliminar este centro de entrenamiento?")) {
            try {
              AppState.deleteCenter(cId);
              this.showToast("Centro eliminado.", "info");
              this.renderSettingsView();
            } catch (err) {
              this.showToast(err.message, "error");
            }
          }
        });
      });
      const btnAddCenter = document.getElementById("btn-add-center-modal");
      if (btnAddCenter) {
        btnAddCenter.addEventListener("click", () => this.openCenterModal());
      }
      document.querySelectorAll(".btn-set-active-athlete").forEach((b) => {
        b.addEventListener("click", () => {
          AppState.setActiveAthlete(b.getAttribute("data-id"));
          this.showToast("Atleta activo cambiado.", "info");
          this.renderSettingsView();
        });
      });
      document.querySelectorAll(".btn-edit-athlete").forEach((b) => {
        b.addEventListener("click", () => {
          const aId = b.getAttribute("data-id");
          this.openAthleteModal(aId);
        });
      });
      document.querySelectorAll(".btn-delete-athlete").forEach((b) => {
        b.addEventListener("click", () => {
          const aId = b.getAttribute("data-id");
          if (confirm("\xBFEliminar este perfil de atleta? Todos sus registros ser\xE1n eliminados.")) {
            try {
              AppState.deleteAthlete(aId);
              this.showToast("Atleta eliminado.", "info");
              this.renderSettingsView();
            } catch (err) {
              this.showToast(err.message, "error");
            }
          }
        });
      });
      const btnAddAthlete = document.getElementById("btn-add-athlete-modal");
      if (btnAddAthlete) {
        btnAddAthlete.addEventListener("click", () => this.openAthleteModal());
      }
      document.querySelectorAll("[data-unit-set]").forEach((b) => {
        b.addEventListener("click", () => {
          const u = b.getAttribute("data-unit-set");
          AppState.setUnit(u);
          this.showToast(`Unidad cambiada a ${u}.`, "success");
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
      const modal = document.getElementById("app-modal");
      const modalContent = document.getElementById("modal-content");
      if (!modal || !modalContent) return;
      modalContent.innerHTML = `
      <div class="modal-header">
        <h3 class="modal-title">\u{1F3C6} Modificar R\xE9cord Personal (PR)</h3>
        <button type="button" class="btn-close-modal" id="btn-modal-close" aria-label="Cerrar">\u2715</button>
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
            <label for="input-pr-note">Nota o motivo del r\xE9cord (opcional):</label>
            <input type="text" id="input-pr-note" class="form-input" placeholder="Ej: Nuevo tope de fuerza en serie pesada" />
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn-subtle" id="btn-modal-cancel">Cancelar</button>
          <button type="submit" class="btn-primary">Guardar R\xE9cord</button>
        </div>
      </form>
    `;
      this.showModal();
      const form = document.getElementById("form-edit-pr");
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const inputEl = document.getElementById("input-new-pr");
        const noteEl = document.getElementById("input-pr-note");
        const val = parseFloat(inputEl?.value);
        const note = noteEl?.value || "";
        if (isNaN(val) || val <= 0) {
          this.showToast("Por favor ingrese una carga v\xE1lida mayor a 0.", "error");
          return;
        }
        this.hideModal();
        try {
          AppState.updatePR(movement.id, val, note);
          this.showToast(`\u{1F3C6} PR actualizado: ${movement.name} a ${val} ${unit}`, "pr");
        } catch (err) {
          this.showToast(err.message, "error");
        }
      });
      document.getElementById("btn-modal-close")?.addEventListener("click", () => this.hideModal());
      document.getElementById("btn-modal-cancel")?.addEventListener("click", () => this.hideModal());
    }
    openCenterModal(centerId = null) {
      const isEdit = Boolean(centerId);
      const center = isEdit ? AppState.centers.find((c) => c.id === centerId) : { name: "", description: "" };
      if (isEdit && !center) return;
      const modal = document.getElementById("app-modal");
      const modalContent = document.getElementById("modal-content");
      if (!modal || !modalContent) return;
      modalContent.innerHTML = `
      <div class="modal-header">
        <h3 class="modal-title">${isEdit ? "Editar Centro de Entrenamiento" : "Agregar Nuevo Centro"}</h3>
        <button type="button" class="btn-close-modal" id="btn-modal-close" aria-label="Cerrar">\u2715</button>
      </div>
      <form id="form-center" class="modal-form">
        <div class="modal-body">
          <div class="form-group">
            <label for="input-center-name">Nombre del Centro:</label>
            <input type="text" id="input-center-name" class="form-input" value="${this.escapeHTML(center.name)}" placeholder="Ej: Elite Gym Oriente" required autofocus />
          </div>
          <div class="form-group">
            <label for="input-center-desc">Descripci\xF3n o Ubicaci\xF3n:</label>
            <textarea id="input-center-desc" class="form-textarea" rows="2" placeholder="Ej: Sala de musculaci\xF3n y acondicionamiento">${this.escapeHTML(center.description || "")}</textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn-subtle" id="btn-modal-cancel">Cancelar</button>
          <button type="submit" class="btn-primary">${isEdit ? "Guardar Cambios" : "Crear Centro"}</button>
        </div>
      </form>
    `;
      this.showModal();
      const form = document.getElementById("form-center");
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = document.getElementById("input-center-name")?.value.trim();
        const desc = document.getElementById("input-center-desc")?.value.trim() || "";
        if (!name) {
          this.showToast("El nombre del centro es obligatorio.", "error");
          return;
        }
        this.hideModal();
        if (isEdit) {
          AppState.editCenter(centerId, name, desc);
          this.showToast("Centro actualizado.", "success");
        } else {
          AppState.addCenter(name, desc);
          this.showToast("Nuevo centro agregado y seleccionado.", "success");
        }
      });
      document.getElementById("btn-modal-close")?.addEventListener("click", () => this.hideModal());
      document.getElementById("btn-modal-cancel")?.addEventListener("click", () => this.hideModal());
    }
    openAthleteModal(athleteId = null) {
      const isEdit = Boolean(athleteId);
      const athlete = isEdit ? AppState.athletes.find((a) => a.id === athleteId) : { name: "", gender: "Hombre", bodyweight: 75, notes: "", centerId: AppState.activeCenterId };
      if (isEdit && !athlete) return;
      const modal = document.getElementById("app-modal");
      const modalContent = document.getElementById("modal-content");
      if (!modal || !modalContent) return;
      modalContent.innerHTML = `
      <div class="modal-header">
        <h3 class="modal-title">${isEdit ? "Editar Perfil de Atleta" : "Registrar Nuevo Atleta"}</h3>
        <button type="button" class="btn-close-modal" id="btn-modal-close" aria-label="Cerrar">\u2715</button>
      </div>
      <form id="form-athlete" class="modal-form">
        <div class="modal-body">
          <div class="form-group">
            <label for="input-athlete-name">Nombre y Apellido:</label>
            <input type="text" id="input-athlete-name" class="form-input" value="${this.escapeHTML(athlete.name)}" placeholder="Ej: Carlos Silva" required autofocus />
          </div>
          <div class="form-row-2">
            <div class="form-group">
              <label for="input-athlete-gender">G\xE9nero:</label>
              <select id="input-athlete-gender" class="form-select">
                <option value="Hombre" ${athlete.gender === "Hombre" ? "selected" : ""}>Hombre</option>
                <option value="Mujer" ${athlete.gender === "Mujer" ? "selected" : ""}>Mujer</option>
              </select>
            </div>
            <div class="form-group">
              <label for="input-athlete-bw">Peso Corporal (${AppState.settings.unit}):</label>
              <input type="number" id="input-athlete-bw" class="form-input" step="0.5" value="${athlete.bodyweight}" required />
            </div>
          </div>
          <div class="form-group">
            <label for="input-athlete-notes">Notas / Objetivos:</label>
            <textarea id="input-athlete-notes" class="form-textarea" rows="2" placeholder="Ej: Enfoque en hipertrofia y fuerza">${this.escapeHTML(athlete.notes || "")}</textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn-subtle" id="btn-modal-cancel">Cancelar</button>
          <button type="submit" class="btn-primary">${isEdit ? "Guardar Cambios" : "Crear Perfil"}</button>
        </div>
      </form>
    `;
      this.showModal();
      const form = document.getElementById("form-athlete");
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = document.getElementById("input-athlete-name")?.value.trim();
        const gender = document.getElementById("input-athlete-gender")?.value || "Hombre";
        const bodyweight = parseFloat(document.getElementById("input-athlete-bw")?.value);
        const notes = document.getElementById("input-athlete-notes")?.value.trim() || "";
        if (!name) {
          this.showToast("El nombre del atleta es obligatorio.", "error");
          return;
        }
        this.hideModal();
        if (isEdit) {
          AppState.editAthlete(athleteId, { name, gender, bodyweight, notes });
          this.showToast("Perfil de atleta actualizado.", "success");
        } else {
          AppState.addAthlete({ name, gender, bodyweight, notes });
          this.showToast("Nuevo atleta creado con marcas iniciales.", "success");
        }
      });
      document.getElementById("btn-modal-close")?.addEventListener("click", () => this.hideModal());
      document.getElementById("btn-modal-cancel")?.addEventListener("click", () => this.hideModal());
    }
    showModal() {
      const modal = document.getElementById("app-modal");
      if (modal) {
        modal.classList.remove("hidden");
        document.body.style.overflow = "hidden";
      }
    }
    hideModal() {
      const modal = document.getElementById("app-modal");
      if (modal) {
        modal.classList.add("hidden");
        document.body.style.overflow = "";
        const content = document.getElementById("modal-content");
        if (content) content.innerHTML = "";
      }
    }
    // ===============================
    // ENFORCEMENT DE TRIAL Y SEGURIDAD
    // ===============================
    checkLicenseEnforcement() {
      const isExpired = License.checkTrialStatus();
      const overlay = document.getElementById("trial-expired-overlay");
      const mainApp = document.getElementById("main-app-shell");
      if (isExpired && !License.isLicensed) {
        if (overlay) {
          overlay.classList.remove("hidden");
        }
        if (mainApp) {
          mainApp.setAttribute("inert", "");
        }
        this.populateExpiredModal();
      } else {
        if (overlay) {
          overlay.classList.add("hidden");
        }
        if (mainApp) {
          mainApp.removeAttribute("inert");
        }
      }
    }
    populateExpiredModal() {
      const overlay = document.getElementById("trial-expired-overlay");
      if (!overlay) return;
      const athlete = AppState.getActiveAthlete();
      const emailSample = athlete.email || "atleta@correo.com";
      const reqCode = License.getRequestCode(emailSample);
      const waLink = License.getWhatsAppLink(emailSample);
      overlay.innerHTML = `
      <div class="trial-block-card">
        <div class="trial-block-header">
          <div class="trial-block-icon">\u{1F6AB}</div>
          <h2 class="trial-block-title">Per\xEDodo de Prueba Expirado</h2>
          <p class="trial-block-subtitle">El per\xEDodo de evaluaci\xF3n de 72 horas (3 d\xEDas) de Gimnasio Pro ha concluido.</p>
        </div>

        <div class="trial-block-body">
          <div class="trial-info-alert">
            <p>Para desbloquear el acceso ilimitado a sus entrenamientos, r\xE9cords y reportes, comun\xEDquese con el desarrollador:</p>
            <p class="trial-contact-highlight">
              \u{1F4DE} Contacto: <strong>${CONTACT_PHONE}</strong>
            </p>
          </div>

          <div class="form-group mt-3">
            <label for="expired-email-input">Su correo electr\xF3nico:</label>
            <input type="email" id="expired-email-input" value="${emailSample}" class="form-input form-input-sm" />
          </div>

          <div class="code-box">
            <code id="expired-req-code">${reqCode}</code>
            <button type="button" class="btn-subtle btn-xs" id="btn-copy-expired-req">Copiar</button>
          </div>

          <a href="${waLink}" target="_blank" rel="noopener noreferrer" class="btn-whatsapp btn-block mt-3" id="expired-wa-btn">
            \u{1F4F2} Contactar por WhatsApp al ${CONTACT_PHONE}
          </a>

          <hr class="divider-subtle" />

          <form id="form-unlock-expired" class="mt-3">
            <div class="form-group">
              <label for="expired-token-input">Ingresar Clave / Token de Activaci\xF3n:</label>
              <textarea id="expired-token-input" class="form-textarea" rows="2" placeholder="Pegue el token Base64 recibido..."></textarea>
            </div>
            <button type="submit" class="btn-primary btn-block">Desbloquear Aplicaci\xF3n</button>
          </form>
        </div>
      </div>
    `;
      const expEmail = document.getElementById("expired-email-input");
      const expCode = document.getElementById("expired-req-code");
      const expWa = document.getElementById("expired-wa-btn");
      if (expEmail && expCode && expWa) {
        expEmail.addEventListener("input", () => {
          const mail = expEmail.value.trim() || "atleta@correo.com";
          const code = License.getRequestCode(mail);
          expCode.textContent = code;
          expWa.href = License.getWhatsAppLink(mail);
        });
      }
      const btnCopy = document.getElementById("btn-copy-expired-req");
      if (btnCopy) {
        btnCopy.addEventListener("click", () => {
          navigator.clipboard.writeText(expCode.textContent);
          this.showToast("C\xF3digo de solicitud copiado.", "info");
        });
      }
      const formUnlock = document.getElementById("form-unlock-expired");
      if (formUnlock) {
        formUnlock.addEventListener("submit", async (e) => {
          e.preventDefault();
          const tokenVal = document.getElementById("expired-token-input").value.trim();
          const res = await License.activateWithToken(tokenVal);
          if (res.success) {
            this.showToast(res.message, "success");
            this.checkLicenseEnforcement();
            this.renderCurrentView();
          } else {
            this.showToast(res.message, "error");
          }
        });
      }
    }
    // ===============================
    // SISTEMA DE TOASTS Y FEEDBACK
    // ===============================
    showToast(message, type = "info") {
      const container = document.getElementById("toast-container");
      if (!container) return;
      const toast = document.createElement("div");
      toast.className = `toast-item toast-${type}`;
      let icon = "\u2139\uFE0F";
      if (type === "success") icon = "\u2705";
      if (type === "error") icon = "\u26A0\uFE0F";
      if (type === "pr") icon = "\u{1F3C6}";
      toast.innerHTML = `
      <span class="toast-icon">${icon}</span>
      <span class="toast-msg">${this.escapeHTML(message)}</span>
    `;
      container.appendChild(toast);
      setTimeout(() => {
        toast.classList.add("toast-fadeout");
        setTimeout(() => toast.remove(), 400);
      }, 3500);
    }
    // ===============================
    // BACKUP Y RESTAURACIÓN JSON
    // ===============================
    exportDatabaseJSON() {
      const data = {
        version: "1.1",
        appName: "Gimnasio Pro",
        exportDate: (/* @__PURE__ */ new Date()).toISOString(),
        settings: AppState.settings,
        centers: AppState.centers,
        athletes: AppState.athletes,
        workoutLogs: AppState.workoutLogs
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `GimnasioPro_Backup_${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      this.showToast("Respaldo descargado exitosamente.", "success");
    }
    importDatabaseJSON(event) {
      const file = event.target.files && event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target.result);
          if (!parsed.athletes || !parsed.centers) {
            throw new Error("El archivo no tiene el formato v\xE1lido de Gimnasio Pro.");
          }
          if (confirm("\xBFRestaurar datos desde el archivo? Los datos actuales ser\xE1n reemplazados.")) {
            AppState.centers = parsed.centers;
            AppState.athletes = parsed.athletes;
            if (parsed.settings) AppState.settings = parsed.settings;
            if (parsed.workoutLogs) AppState.workoutLogs = parsed.workoutLogs;
            AppState.notify("data-restored");
            this.showToast("\xA1Base de datos restaurada correctamente!", "success");
            this.renderCurrentView();
          }
        } catch (err) {
          this.showToast("Error al importar archivo: " + err.message, "error");
        }
      };
      reader.readAsText(file);
    }
    bindGlobalKeyboard() {
      window.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          this.hideModal();
        }
      });
      const modalOverlay = document.getElementById("app-modal");
      if (modalOverlay) {
        modalOverlay.addEventListener("click", (e) => {
          if (e.target === modalOverlay) {
            this.hideModal();
          }
        });
      }
    }
    escapeHTML(str) {
      if (!str) return "";
      return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    }
  };
  var UI = new UIManager();

  // src/js/app.js
  var ApplicationLifecycle = class {
    constructor() {
      this.isInitialized = false;
    }
    /**
     * Ciclo de arranque asíncrono y defensivo
     * Distribuye el trabajo inicial en macrotareas para no saturar el UI thread.
     */
    async start() {
      if (this.isInitialized) return;
      const executeBoot = async () => {
        try {
          console.log("[Gimnasio Pro] Iniciando ciclo de arranque...");
          AppState.init();
          await License.init();
          UI.init();
          this.registerServiceWorker();
          this.isInitialized = true;
          console.log("[Gimnasio Pro] Aplicaci\xF3n iniciada correctamente.");
        } catch (criticalError) {
          console.error("[Gimnasio Pro] Error cr\xEDtico en el ciclo de arranque:", criticalError);
          this.displayEmergencyFallback(criticalError);
        } finally {
          this.removeSplashScreen();
        }
      };
      setTimeout(() => {
        this.removeSplashScreen();
      }, 1200);
      if (typeof window !== "undefined" && "requestIdleCallback" in window) {
        window.requestIdleCallback(() => executeBoot(), { timeout: 150 });
      } else {
        setTimeout(() => executeBoot(), 16);
      }
    }
    removeSplashScreen() {
      const splash = document.getElementById("app-splash-screen");
      if (splash) {
        splash.classList.add("splash-fade-out");
        setTimeout(() => {
          if (splash && splash.parentElement) {
            splash.remove();
          }
        }, 350);
      }
    }
    registerServiceWorker() {
      if (typeof window !== "undefined" && "serviceWorker" in navigator && window.location.protocol.startsWith("http")) {
        window.addEventListener("load", () => {
          navigator.serviceWorker.register("./sw.js").then((reg) => {
            console.log("[PWA] Service Worker registrado con scope:", reg.scope);
          }).catch((err) => {
            console.info("[PWA] Service Worker omitido en este entorno:", err.message);
          });
        });
      }
    }
    displayEmergencyFallback(error) {
      const main = document.getElementById("main-app-shell");
      if (main) {
        const errBox = document.createElement("div");
        errBox.style.cssText = "background: rgba(239, 68, 68, 0.15); border: 1px solid #ef4444; color: #fecaca; padding: 1.5rem; border-radius: 10px; margin: 1rem; text-align: center;";
        errBox.innerHTML = `
        <h3 style="color: #ef4444; margin-bottom: 0.5rem;">\u26A0\uFE0F Advertencia de Inicializaci\xF3n</h3>
        <p style="font-size: 0.9rem;">${error.message || "Se produjo una advertencia durante la carga de estado."}</p>
        <button onclick="localStorage.clear(); location.reload();" style="background:#ef4444; color:#fff; border:none; padding:8px 16px; border-radius:6px; margin-top:1rem; cursor:pointer; font-weight:bold;">
          Restablecer Almacenamiento Local
        </button>
      `;
        main.prepend(errBox);
      }
    }
  };
  var app = new ApplicationLifecycle();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => app.start());
  } else {
    app.start();
  }
})();

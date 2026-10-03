/**
 * Gimnasio Pro - Catálogo Maestro de Movimientos de Gimnasio
 * Definición estructurada con grupos musculares, iconos temáticos y metadatos biomecánicos.
 */

export const GYM_MOVEMENTS = [
  {
    id: 'prensa-piernas',
    name: 'Prensa de Piernas',
    muscles: 'Cuádriceps, Isquiotibiales, Glúteos',
    icons: '🦵🏋️‍♂️💥',
    category: 'Piernas',
    machineType: 'Discos / Prensa 45°',
    defaultPRKg: 180,
    tags: ['Piernas', 'Glúteos', 'Fuerza'],
    cues: 'Apoyo lumbar firme en el respaldo, pies al ancho de hombros, descenso controlado sin bloquear rodillas al extender.'
  },
  {
    id: 'jalon-pecho',
    name: 'Jalón al Pecho (Polea Alta)',
    muscles: 'Dorsal Ancho, Bíceps, Hombros',
    icons: '🦍💪⬇️',
    category: 'Espalda',
    machineType: 'Polea / Torre de Placas',
    defaultPRKg: 75,
    tags: ['Espalda', 'Dorsales', 'Bíceps'],
    cues: 'Pecho erguido, tracción guiada con los codos hacia abajo y atrás, sin balanceo excesivo del torso.'
  },
  {
    id: 'press-pecho',
    name: 'Press de Pecho en Máquina',
    muscles: 'Pectorales, Tríceps, Deltoides Anterior',
    icons: '🦸‍♂️🛡️💪',
    category: 'Pectorales',
    machineType: 'Máquina Convergente / Placas',
    defaultPRKg: 85,
    tags: ['Pecho', 'Pectorales', 'Tríceps'],
    cues: 'Ajuste del asiento a la altura del esternón, escápulas retraídas, empuje potente manteniendo hombros abajo.'
  },
  {
    id: 'peck-deck',
    name: 'Peck Deck (Máquina Mariposa)',
    muscles: 'Pectorales (zona central y externa)',
    icons: '🦋💪',
    category: 'Pectorales',
    machineType: 'Torre de Placas',
    defaultPRKg: 65,
    tags: ['Pecho', 'Aislamiento'],
    cues: 'Codos ligeramente flexionados, recorrido circular abrazando un barril imaginario, máxima contracción isométrica.'
  },
  {
    id: 'extension-piernas',
    name: 'Extensión de Piernas',
    muscles: 'Cuádriceps',
    icons: '🦵⚡',
    category: 'Piernas',
    machineType: 'Torre de Placas',
    defaultPRKg: 70,
    tags: ['Piernas', 'Cuádriceps', 'Aislamiento'],
    cues: 'Alinear el eje de la máquina con la articulación de la rodilla, pausa de 1 segundo arriba, bajada lenta.'
  },
  {
    id: 'curl-piernas',
    name: 'Curl de Piernas',
    muscles: 'Isquiotibiales',
    icons: '🦵🪝',
    category: 'Piernas',
    machineType: 'Torre de Placas (Tumbado / Sentado)',
    defaultPRKg: 55,
    tags: ['Piernas', 'Isquiotibiales'],
    cues: 'Caderas pegadas al banco, flexión explosiva contrayendo los femorales, fase excéntrica controlada.'
  },
  {
    id: 'remo-sentado',
    name: 'Remo Sentado en Máquina',
    muscles: 'Espalda Media (Romboides), Dorsales',
    icons: '🛶💪🔙',
    category: 'Espalda',
    machineType: 'Polea Baja / Placas',
    defaultPRKg: 75,
    tags: ['Espalda', 'Romboides', 'Dorsales'],
    cues: 'Columna neutra, tracción de codos pegados al cuerpo, pellizco escapular firme al final del recorrido.'
  },
  {
    id: 'elevacion-talones',
    name: 'Elevación de Talones',
    muscles: 'Pantorrillas (Gemelos y Sóleo)',
    icons: '🩰🦵🔥',
    category: 'Pantorrillas',
    machineType: 'Máquina Sentado / De Pie',
    defaultPRKg: 90,
    tags: ['Piernas', 'Pantorrillas'],
    cues: 'Rango de movimiento completo, estiramiento profundo abajo y máxima elevación sobre el metatarso arriba.'
  },
  {
    id: 'extension-triceps',
    name: 'Extensión de Tríceps en Polea',
    muscles: 'Tríceps',
    icons: '🦾⛓️⬇️',
    category: 'Brazos',
    machineType: 'Torre de Polea Alta',
    defaultPRKg: 40,
    tags: ['Brazos', 'Tríceps'],
    cues: 'Codos pegados a los costados sin desplazarse, apertura de cuerda o barra al final de la extensión.'
  },
  {
    id: 'curl-biceps',
    name: 'Curl de Bíceps en Máquina',
    muscles: 'Bíceps Braquial',
    icons: '💪😎',
    category: 'Brazos',
    machineType: 'Máquina Banco Scott / Placas',
    defaultPRKg: 45,
    tags: ['Brazos', 'Bíceps'],
    cues: 'Axilas bien calzadas en el acolchado, movimiento fluido sin despegar los codos de la almohadilla.'
  },
  {
    id: 'maquina-smith',
    name: 'Máquina Smith (Sentadillas)',
    muscles: 'Cuádriceps, Glúteos, Core',
    icons: '🍑🏋️‍♀️🏗️',
    category: 'Piernas',
    machineType: 'Barra Smith Guiada',
    defaultPRKg: 120,
    tags: ['Piernas', 'Fuerza', 'Smith'],
    cues: 'Barra sobre trapecios, pies ligeramente adelantados para énfasis en cuádriceps, profundidad por debajo de 90°.'
  },
  {
    id: 'maquina-abductora',
    name: 'Máquina Abductora / Aductora',
    muscles: 'Glúteo Medio, Aductores (entrepierna)',
    icons: '🤸‍♀️🦵↔️',
    category: 'Piernas',
    machineType: 'Torre de Placas Doble Función',
    defaultPRKg: 60,
    tags: ['Piernas', 'Glúteo Medio', 'Aductores'],
    cues: 'Espalda bien apoyada en el respaldo, apertura o cierre según modo con tensión continua sin golpear las placas.'
  }
];

export function getMovementById(id) {
  return GYM_MOVEMENTS.find(m => m.id === id) || GYM_MOVEMENTS[0];
}

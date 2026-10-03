# AGENTS.md — Gimnasio Pro

Instrucciones maestras, arquitectura y reglas operativas para agentes de IA que desarrollen o modifiquen esta base de código.

---

## 1. Visión General del Proyecto

- **Nombre:** Gimnasio Pro (Atleta & Maquinas / Gimnasio)
- **Tipo:** Progressive Web App (PWA) / Single Page Application (SPA) para atletas y entrenadores de Gimnasio
- **Filosofía Arquitectónica:**
  - **100% Offline-First y Portable:** No requiere servidores ni bases de datos remotas. Todo persiste en `localStorage`.
  - **Cero dependencias en runtime:** Ejecución nativa pura en navegador (`HTML5`, `CSS3`, `JavaScript ES6+`).
  - **Empaquetado PWA / Mobile:** Compatible con iOS Safari (Add to Home Screen), Android PWA y empaquetado para Google Play Store mediante PWABuilder.

---

## 2. Estructura de Archivos y Flujo de Trabajo CRÍTICO

> [!CAUTION]
> **REGLA DE ORO DE DESARROLLO:**
> **NUNCA** edites código JavaScript directamente en `index.html` ni en `V2/Index.html`. Todo el código modular reside en `src/js/` y `src/css/`.

```text
Gimnasio/
├── index.html              # Shell HTML5 semántico con navegación y modales accesibles
├── manifest.json           # Manifiesto de PWA para instalación multiplataforma
├── sw.js                   # Service Worker para ejecución 100% offline
├── package.json            # Scripts de empaquetado, pruebas y ejecución
├── Iniciar_Gimnasio_Pro.bat # Acceso directo para iniciar y abrir la app en Windows
├── src/
│   ├── css/
│   │   └── styles.css      # Sistema de diseño con tema oscuro estricto y acentos
│   └── js/
│       ├── app.bundle.js   # Bundle autónomo optimizado compatible con file:/// y HTTP
│       ├── app.js          # Arranque asíncrono y ciclo de vida de la aplicación
│       ├── crypto.js       # Hashing SHA-256, Device ID y tokens criptográficos Base64
│       ├── storage.js      # Persistencia defensiva en localStorage con fallback
│       ├── movements.js    # Catálogo maestro de 12 movimientos biomecánicos
│       ├── state.js        # Estado reactivo, conversión matemática exacta (1 kg = 2.20462 lbs)
│       ├── license.js      # Control de período de prueba (72h) y activación offline
│       ├── charts.js       # Gráficos SVG nativos sin dependencias externas
│       └── ui.js           # Renderizado de vistas, modales, cronómetro y eventos
├── tests/
│   └── verify.test.mjs     # Suite de 29 pruebas unitarias automatizadas
├── AGENTS.md               # Instrucciones maestras y arquitectura
└── Prompt Gimnasio.txt     # Especificación original del proyecto
```

---

## 3. Comandos de Construcción y Ejecución

- **Construir / Recompilar Bundle:**
  ```powershell
  npm run build
  ```
- **Modo Observador (Watch) durante desarrollo:**
  ```powershell
  npm run watch
  ```
- **Ejecutar Suite de Pruebas Unitarias:**
  ```powershell
  npm test
  # O bien:
  # node tests/verify.test.mjs
  ```
- **Iniciar Servidor de Desarrollo Local:**
  ```powershell
  npm start
  # O bien con Python:
  # python -m http.server 8085
  # O haciendo doble clic en Iniciar_Gimnasio_Pro.bat
  ```

---

## 4. Reglas de Negocio y Lógica Central

### 4.1. Sistema de Licenciamiento y Seguridad Offline
- **Período de Prueba:** 72 horas (3 días) continuas desde la primera apertura.
- **Bloqueo Trial:** Al expirar, se superpone un modal con `z-index: 99999` que bloquea toda la app mostrando "Período de Prueba Expirado" y el contacto `+56933395447`.
- **Criptografía:** Generación de `Device ID` único por dispositivo. Cadena de solicitud: `REQ|<DeviceID>|<correo>`.
- **Validación de Token:** Token en Base64 con payload `{ deviceId, email, exp, signature }`.
- **Firma:** SHA-256 con sales criptográficas autorizadas (`"Halterofilia-SuperSecret-Salt-2026"` y `"Gimnasio-SuperSecret-Salt-2026"`). Validable 100% offline.

### 4.2. Perfiles y Conversión de Unidades
- **Atleta por dispositivo:** Atleta inicial creado en el primer arranque, con gestor multi-perfil completo.
- **Factor de conversión exacto:** $1\text{ kg} = 2.20462\text{ lbs}$.
- **Coherencia histórica:** Al cambiar la unidad preferida del atleta (Kg $\leftrightarrow$ Lbs), se convierten automáticamente:
  1. Los PRs vigentes de todos los movimientos.
  2. El historial temporal de PRs (`prHistory`) para evitar saltos o inconsistencias en gráficos y reportes.
  3. Las cargas registradas en la bitácora de series (`workoutLogs`).
- **Cálculo de Cargas:** Máquinas guiadas y de discos (Prensa de Piernas, Smith) calculan carga por lado simétrica (`peso / 2`) sin deducción de barra olímpica; máquinas de placas indican ajuste guiado de pin magnético.

### 4.3. Selector de Disciplinas y Máquinas
Navegación directa mediante lista desplegable nativa (`<select id="movement-dropdown-select">`) y botones rotativos sincronizados (◀ y ▶) para los 12 ejercicios biomecánicos:
1. Prensa de Piernas (Cuádriceps, Isquiotibiales, Glúteos) 🦵🏋️‍♂️💥
2. Jalón al Pecho (Polea Alta) (Dorsal Ancho, Bíceps, Hombros) 🦍💪⬇️
3. Press de Pecho en Máquina (Pectorales, Tríceps, Deltoides Anterior) 🦸‍♂️🛡️💪
4. Peck Deck (Máquina Mariposa) (Pectorales (zona central y externa)) 🦋💪
5. Extensión de Piernas (Cuádriceps) 🦵⚡
6. Curl de Piernas (Isquiotibiales) 🦵🪝
7. Remo Sentado en Máquina (Espalda Media (Romboides), Dorsales) 🛶💪🔙
8. Elevación de Talones (Pantorrillas (Gemelos y Sóleo)) 🩰🦵🔥
9. Extensión de Tríceps en Polea (Tríceps) 🦾⛓️⬇️
10. Curl de Bíceps en Máquina (Bíceps Braquial) 💪😎
11. Máquina Smith (Sentadillas) (Cuádriceps, Glúteos, Core) 🍑🏋️‍♀️🏗️
12. Máquina Abductora / Aductora (Glúteo Medio, Aductores (entrepierna)) 🤸‍♀️🦵↔️

### 4.4. Registro Simplificado de Series
- Registro enfocado en Carga, Repeticiones y verificación instantánea de PR (sin selector de RPE).

### 4.5. Reportes y Curvas de Rendimiento
- **Avance en el tiempo de los PRs:** Selector por disciplina, 4 tarjetas KPI (PR Inicial, PR Vigente, Ganancia Neta, % Mejora), gráfico Bézier SVG con área degradada y cronología de hitos de PR.
- **Histórico de Movimientos:** Filtro global o por disciplina, 4 tarjetas KPI (Series, Volumen Acumulado $\sum \text{peso} \times \text{reps}$, Carga Máxima, Reps Totales), gráfico de barras SVG de volumen en el tiempo y tabla interactiva de series con opción para eliminar registros.
- **Distribución Muscular y Portabilidad:** Gráfico de capacidad de carga por grupo muscular y exportación/importación offline en formato JSON.

### 4.6. Estándar de Pie de Página
- **Formato:** `Análisis/Diseño de Andres Aguiar V 2026.10 Santiago deChile Octubre 2026 - Contacto +56933395447 - Whatsapp +56933395447`.

---

## 5. Llaves de Persistencia (`localStorage`)

- `gimnasio_device_id`: Identificador único de 16 caracteres hexadecimales del hardware.
- `gimnasio_install_timestamp`: Timestamp del momento de instalación/primer arranque.
- `gimnasio_license_token`: Token criptográfico Base64 guardado tras la activación.
- `gimnasio_license_data`: Datos decodificados de la licencia `{ deviceId, email, exp, signature }`.
- `gimnasio_athletes`: Colección de perfiles con sus PRs vigentes y array `prHistory`.
- `gimnasio_active_athlete_id`: ID del perfil activo en uso.
- `gimnasio_centers`: Colección de centros de entrenamiento configurados.
- `gimnasio_active_center_id`: ID de la sede o centro activo.
- `gimnasio_settings`: Ajustes globales `{ unit: 'KG'|'LBS' }`.
- `gimnasio_workout_logs`: Historial cronológico de series, repeticiones y volumen registradas.



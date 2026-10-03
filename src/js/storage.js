/**
 * Gimnasio Pro - Módulo de Almacenamiento Seguro y Defensivo
 * Abstracción sobre localStorage con validación, degradación elegante y gestión de errores.
 */

export const STORAGE_KEYS = {
  DEVICE_ID: 'gimnasio_device_id',
  INSTALL_TIME: 'gimnasio_install_timestamp',
  LICENSE_TOKEN: 'gimnasio_license_token',
  LICENSE_DATA: 'gimnasio_license_data',
  ATHLETES: 'gimnasio_athletes',
  ACTIVE_ATHLETE_ID: 'gimnasio_active_athlete_id',
  CENTERS: 'gimnasio_centers',
  ACTIVE_CENTER_ID: 'gimnasio_active_center_id',
  SETTINGS: 'gimnasio_settings',
  WORKOUT_LOGS: 'gimnasio_workout_logs',
};

// Memoria volátil en caso de bloqueo de cookies / localStorage en iframe
const memoryFallback = new Map();

export const Storage = {
  get(key, defaultValue = null) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const item = window.localStorage.getItem(key);
        if (item === null || item === undefined) return defaultValue;
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
      const serialized = typeof value === 'string' ? value : JSON.stringify(value);
      if (typeof window !== 'undefined' && window.localStorage) {
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
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
      memoryFallback.delete(key);
    } catch (e) {
      console.warn(`[Storage] Error al eliminar llave "${key}":`, e);
    }
  },

  clearAll() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        Object.values(STORAGE_KEYS).forEach(k => {
          window.localStorage.removeItem(k);
        });
      }
      memoryFallback.clear();
    } catch (e) {
      console.error('[Storage] Error al limpiar datos:', e);
    }
  }
};

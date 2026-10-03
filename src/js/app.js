/**
 * Gimnasio Pro - Arranque Asíncrono y Ciclo de Vida Modular
 * Arquitectura defensiva no bloqueante para Web, PWA, Móvil y Escritorio.
 */

import { AppState } from './state.js';
import { License } from './license.js';
import { UI } from './ui.js';

class ApplicationLifecycle {
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
        console.log('[Gimnasio Pro] Iniciando ciclo de arranque...');

        // 1. Inicialización del Estado y Persistencia
        AppState.init();

        // 2. Inicialización Criptográfica y Validación de Licencia
        await License.init();

        // 3. Montaje reactivo de la Interfaz de Usuario
        UI.init();

        // 4. Registro de Service Worker para capacidades Offline-First (PWA)
        this.registerServiceWorker();

        this.isInitialized = true;
        console.log('[Gimnasio Pro] Aplicación iniciada correctamente.');
      } catch (criticalError) {
        console.error('[Gimnasio Pro] Error crítico en el ciclo de arranque:', criticalError);
        this.displayEmergencyFallback(criticalError);
      } finally {
        this.removeSplashScreen();
      }
    };

    // Temporizador de seguridad: nunca dejar la pantalla bloqueada en splash
    setTimeout(() => {
      this.removeSplashScreen();
    }, 1200);

    // Arranque asíncrono no bloqueante
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      window.requestIdleCallback(() => executeBoot(), { timeout: 150 });
    } else {
      setTimeout(() => executeBoot(), 16);
    }
  }

  removeSplashScreen() {
    const splash = document.getElementById('app-splash-screen');
    if (splash) {
      splash.classList.add('splash-fade-out');
      setTimeout(() => {
        if (splash && splash.parentElement) {
          splash.remove();
        }
      }, 350);
    }
  }

  registerServiceWorker() {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
          .then(reg => {
            console.log('[PWA] Service Worker registrado con scope:', reg.scope);
          })
          .catch(err => {
            console.info('[PWA] Service Worker omitido en este entorno:', err.message);
          });
      });
    }
  }

  displayEmergencyFallback(error) {
    const main = document.getElementById('main-app-shell');
    if (main) {
      const errBox = document.createElement('div');
      errBox.style.cssText = 'background: rgba(239, 68, 68, 0.15); border: 1px solid #ef4444; color: #fecaca; padding: 1.5rem; border-radius: 10px; margin: 1rem; text-align: center;';
      errBox.innerHTML = `
        <h3 style="color: #ef4444; margin-bottom: 0.5rem;">⚠️ Advertencia de Inicialización</h3>
        <p style="font-size: 0.9rem;">${error.message || 'Se produjo una advertencia durante la carga de estado.'}</p>
        <button onclick="localStorage.clear(); location.reload();" style="background:#ef4444; color:#fff; border:none; padding:8px 16px; border-radius:6px; margin-top:1rem; cursor:pointer; font-weight:bold;">
          Restablecer Almacenamiento Local
        </button>
      `;
      main.prepend(errBox);
    }
  }
}

// Inicialización controlada cuando el DOM esté listo
const app = new ApplicationLifecycle();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => app.start());
} else {
  app.start();
}

export { app };

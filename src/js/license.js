/**
 * Gimnasio Pro - Módulo de Licenciamiento y Seguridad Offline
 * Control de período de prueba (3 días / 72 horas) y activación criptográfica SHA-256.
 */

import { Storage, STORAGE_KEYS } from './storage.js';
import { generateDeviceId, verifyActivationToken, generateActivationToken } from './crypto.js';

// Duración del período de prueba: 3 días (72 horas exactas)
export const TRIAL_HOURS = 72;
export const TRIAL_DURATION_MS = TRIAL_HOURS * 60 * 60 * 1000; // 259,200,000 ms

export const CONTACT_PHONE = '+56933395447';
export const WHATSAPP_URL = 'https://wa.me/56933395447';

class LicenseManager {
  constructor() {
    this.deviceId = null;
    this.installTimestamp = null;
    this.isLicensed = false;
    this.licenseData = null;
    this.isTrialExpired = false;
    this.remainingTrialMs = 0;
  }

  async init() {
    // 1. Obtener o generar Device ID único
    let deviceId = Storage.get(STORAGE_KEYS.DEVICE_ID);
    if (!deviceId) {
      deviceId = generateDeviceId();
      Storage.set(STORAGE_KEYS.DEVICE_ID, deviceId);
    }
    this.deviceId = deviceId;

    // 2. Obtener o registrar fecha de instalación
    let installTime = Storage.get(STORAGE_KEYS.INSTALL_TIME);
    if (!installTime) {
      installTime = Date.now();
      Storage.set(STORAGE_KEYS.INSTALL_TIME, installTime);
    }
    this.installTimestamp = Number(installTime);

    // 3. Verificar si existe licencia guardada
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
        // Licencia inválida o expirada
        this.isLicensed = false;
        this.licenseData = null;
        Storage.remove(STORAGE_KEYS.LICENSE_TOKEN);
        Storage.remove(STORAGE_KEYS.LICENSE_DATA);
      }
    }

    // 4. Evaluar período de prueba
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

  getRequestCode(email = 'atleta@correo.com') {
    const cleanEmail = email.trim() || 'atleta@correo.com';
    return `REQ|${this.deviceId}|${cleanEmail}`;
  }

  getWhatsAppLink(email = '') {
    const reqCode = this.getRequestCode(email);
    const message = encodeURIComponent(
      `Hola Andres, solicito la clave de activación para Gimnasio Pro.\nCódigo de Solicitud: ${reqCode}`
    );
    return `${WHATSAPP_URL}?text=${message}`;
  }

  async activateWithToken(tokenBase64) {
    if (!tokenBase64 || !tokenBase64.trim()) {
      return { success: false, message: 'Debe ingresar un token de activación.' };
    }

    const verification = await verifyActivationToken(tokenBase64.trim(), this.deviceId);
    if (!verification.valid) {
      return { success: false, message: verification.reason || 'Token no válido.' };
    }

    // Licencia válida
    this.isLicensed = true;
    this.licenseData = verification.payload;
    this.isTrialExpired = false;
    this.remainingTrialMs = Infinity;

    Storage.set(STORAGE_KEYS.LICENSE_TOKEN, tokenBase64.trim());
    Storage.set(STORAGE_KEYS.LICENSE_DATA, verification.payload);

    return { 
      success: true, 
      message: '¡Licencia activada con éxito! Acceso ilimitado desbloqueado.',
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

    const hoursLeft = Math.floor(this.remainingTrialMs / (1000 * 60 * 60));
    const daysLeft = (hoursLeft / 24).toFixed(1);

    return {
      deviceId: this.deviceId,
      isLicensed: this.isLicensed,
      licenseData: this.licenseData,
      isTrialExpired: this.isTrialExpired,
      remainingTrialMs: this.remainingTrialMs,
      hoursLeft,
      daysLeft,
      installDate: new Date(this.installTimestamp).toLocaleDateString('es-CL'),
      contactPhone: CONTACT_PHONE,
      whatsappUrl: WHATSAPP_URL
    };
  }

  // Generador de clave auxiliar (para uso administrativo o pruebas rápidas)
  async generateTokenForDevice(deviceId, email, daysValid = 365) {
    const exp = daysValid === 0 ? 0 : Date.now() + (daysValid * 24 * 60 * 60 * 1000);
    return await generateActivationToken(deviceId, email, exp);
  }
}

export const License = new LicenseManager();

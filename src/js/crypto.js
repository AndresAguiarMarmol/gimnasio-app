/**
 * Gimnasio Pro - Módulo Criptográfico y de Seguridad Offline
 * Manejo de Device ID único, hashing SHA-256 y validación/generación de tokens Base64.
 */

// Sales criptográficas soportadas (compatibilidad total)
export const CRYPTO_SALTS = [
  "Halterofilia-SuperSecret-Salt-2026",
  "Gimnasio-SuperSecret-Salt-2026"
];

const PRIMARY_SALT = "Halterofilia-SuperSecret-Salt-2026";

/**
 * Genera un Device ID único y persistente de 16 caracteres hexadecimales
 */
export function generateDeviceId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    try {
      return crypto.randomUUID().replace(/-/g, '').slice(0, 16).toUpperCase();
    } catch {
      // Fallback a randomValues
    }
  }

  const arr = new Uint8Array(8);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(arr);
  } else {
    for (let i = 0; i < 8; i++) {
      arr[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(arr, b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
}

/**
 * Calcula el hash SHA-256 en hexadecimal de un texto de entrada usando Web Crypto API
 * @param {string} message 
 * @returns {Promise<string>}
 */
export async function sha256(message) {
  const msgUint8 = new TextEncoder().encode(message);
  
  if (typeof crypto !== 'undefined' && crypto.subtle && crypto.subtle.digest) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Fallback JS puro de SHA-256 para entornos sin Web Crypto Subtle (por ejemplo HTTP inseguro o tests)
  return fallbackSha256(message);
}

/**
 * Genera la firma SHA-256 para un payload con una sal dada
 */
export async function computeSignature(deviceId, email, exp, salt = PRIMARY_SALT) {
  const rawString = `${deviceId.trim().toUpperCase()}|${email.trim().toLowerCase()}|${exp}|${salt}`;
  return await sha256(rawString);
}

/**
 * Genera un token de activación en Base64
 * @param {string} deviceId 
 * @param {string} email 
 * @param {number} exp Timestamp en ms de expiración (o 0 para perpetuo)
 * @param {string} salt 
 * @returns {Promise<string>} Token en Base64
 */
export async function generateActivationToken(deviceId, email, exp, salt = PRIMARY_SALT) {
  const cleanDeviceId = deviceId.trim().toUpperCase();
  const cleanEmail = email.trim().toLowerCase();
  const expiration = Number(exp);

  const signature = await computeSignature(cleanDeviceId, cleanEmail, expiration, salt);
  const payload = {
    deviceId: cleanDeviceId,
    email: cleanEmail,
    exp: expiration,
    signature: signature
  };

  const jsonStr = JSON.stringify(payload);
  return btoa(unescape(encodeURIComponent(jsonStr)));
}

/**
 * Valida un token Base64 offline
 * @param {string} tokenBase64 
 * @param {string} currentDeviceId 
 * @returns {Promise<{ valid: boolean, reason?: string, payload?: object }>}
 */
export async function verifyActivationToken(tokenBase64, currentDeviceId) {
  if (!tokenBase64 || typeof tokenBase64 !== 'string') {
    return { valid: false, reason: "Token vacío o formato incorrecto." };
  }

  let payload;
  try {
    const decodedStr = decodeURIComponent(escape(atob(tokenBase64.trim())));
    payload = JSON.parse(decodedStr);
  } catch {
    return { valid: false, reason: "El token no es un Base64 o JSON válido." };
  }

  const { deviceId, email, exp, signature } = payload;

  if (!deviceId || !email || exp === undefined || !signature) {
    return { valid: false, reason: "Estructura del token incompleta." };
  }

  // Verificar que el Device ID coincida con el de este dispositivo
  if (deviceId.toUpperCase() !== currentDeviceId.trim().toUpperCase()) {
    return { 
      valid: false, 
      reason: `El token pertenece al dispositivo ${deviceId}, pero este equipo es ${currentDeviceId}.` 
    };
  }

  // Verificar caducidad si exp > 0 (si exp === 0 o exp > 253402300799000 se considera perpetua)
  const now = Date.now();
  if (exp > 0 && exp < now) {
    const expiredDate = new Date(exp).toLocaleDateString('es-CL');
    return { 
      valid: false, 
      reason: `La licencia expiró el ${expiredDate}.` 
    };
  }

  // Verificar firma contra las sales criptográficas válidas
  let signatureMatched = false;
  for (const salt of CRYPTO_SALTS) {
    const expectedSig = await computeSignature(deviceId, email, exp, salt);
    if (expectedSig.toLowerCase() === signature.toLowerCase()) {
      signatureMatched = true;
      break;
    }
  }

  if (!signatureMatched) {
    return { valid: false, reason: "Firma criptográfica inválida o alterada." };
  }

  return { valid: true, payload };
}

/**
 * Fallback SHA-256 puro en JS si crypto.subtle no está disponible
 */
function fallbackSha256(ascii) {
  function rightRotate(value, amount) {
    return (value >>> amount) | (value << (32 - amount));
  }
  
  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  let lengthProperty = 'length';
  let i, j;
  let result = '';

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
      hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
      k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
    }
  }
  
  ascii += '\x80';
  while ((ascii[lengthProperty] % 64) - 56) ascii += '\x00';
  for (i = 0; i < ascii[lengthProperty]; i++) {
    j = ascii.charCodeAt(i);
    if (j >> 8) return;
    words[i >> 2] |= j << (((3 - i) % 4) * 8);
  }
  words[words[lengthProperty]] = (asciiBitLength / maxWord) | 0;
  words[words[lengthProperty]] = asciiBitLength;
  
  for (j = 0; j < words[lengthProperty];) {
    const w = words.slice(j, (j += 16));
    const oldHash = hash;
    hash = hash.slice(0, 8);
    
    for (i = 0; i < 64; i++) {
      const w15 = w[i - 15], w2 = w[i - 2];
      const s0 = rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3);
      const s1 = rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10);
      const ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6]);
      const maj = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);
      const temp1 = hash[7] + (rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25)) + ch + k[i] + (w[i] = (i < 16) ? w[i] : (w[i - 16] + s0 + w[i - 7] + s1) | 0);
      const temp2 = (rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22)) + maj;
      
      hash = [(temp1 + temp2) | 0].concat(hash);
      hash[4] = (hash[4] + temp1) | 0;
    }
    
    for (i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }
  
  for (i = 0; i < 8; i++) {
    for (j = 3; j + 1; j--) {
      const b = (hash[i] >> (j * 8)) & 255;
      result += ((b < 16) ? '0' : '') + b.toString(16);
    }
  }
  return result;
}

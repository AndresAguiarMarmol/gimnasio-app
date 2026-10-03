/**
 * Gimnasio Pro - Suite de Pruebas Automatizadas
 * Verificación matemática, criptográfica, offline y de estado.
 */

import { generateDeviceId, sha256, computeSignature, generateActivationToken, verifyActivationToken } from '../src/js/crypto.js';
import { GYM_MOVEMENTS, getMovementById } from '../src/js/movements.js';
import { KG_TO_LBS_FACTOR, kgToLbs, lbsToKg, convertWeight } from '../src/js/state.js';

let passed = 0;
let failed = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
    failed++;
  }
}

async function runTests() {
  console.log('\n--- 1. Pruebas Criptográficas y de Seguridad Offline ---');
  
  // Test Device ID
  const devId1 = generateDeviceId();
  const devId2 = generateDeviceId();
  assert(typeof devId1 === 'string' && devId1.length === 16, `Device ID tiene longitud 16: ${devId1}`);
  assert(devId1 !== devId2, `Device IDs son únicos (${devId1} vs ${devId2})`);

  // Test SHA-256
  const hash = await sha256('GimnasioPro2026');
  assert(hash && hash.length === 64, `SHA-256 genera digest de 64 hex: ${hash}`);

  // Test Generación y Verificación de Token Válido
  const email = 'andres@gimnasio.cl';
  const expFuture = Date.now() + 1000 * 60 * 60 * 24 * 365; // 1 año en el futuro
  const token = await generateActivationToken(devId1, email, expFuture);
  assert(token && typeof token === 'string', 'Token Base64 generado exitosamente');

  const verifyResult = await verifyActivationToken(token, devId1);
  assert(verifyResult.valid === true, 'Token verificado correctamente para el dispositivo');
  assert(verifyResult.payload.email === email, `Payload de correo coincide: ${verifyResult.payload.email}`);

  // Test Token Perpetuo (exp = 0)
  const perpetualToken = await generateActivationToken(devId1, email, 0);
  const verifyPerpetual = await verifyActivationToken(perpetualToken, devId1);
  assert(verifyPerpetual.valid === true, 'Token perpetuo (exp=0) validado correctamente');

  // Test Token Expirado
  const expPast = Date.now() - 10000;
  const expiredToken = await generateActivationToken(devId1, email, expPast);
  const verifyExpired = await verifyActivationToken(expiredToken, devId1);
  assert(verifyExpired.valid === false && verifyExpired.reason.includes('expiró'), 'Token expirado rechazado con mensaje descriptivo');

  // Test Token de otro Dispositivo
  const verifyWrongDev = await verifyActivationToken(token, devId2);
  assert(verifyWrongDev.valid === false && verifyWrongDev.reason.includes('pertenece al dispositivo'), 'Token rechazado al usarse en otro dispositivo');

  // Test Token Corrupto
  const verifyCorrupt = await verifyActivationToken('TokenInvalido!#', devId1);
  assert(verifyCorrupt.valid === false, 'Token corrupto rechazado');


  console.log('\n--- 2. Pruebas de Movimientos y Biomecánica ---');
  assert(GYM_MOVEMENTS.length === 12, `Se definieron exactamente los 12 movimientos de Gimnasio (total: ${GYM_MOVEMENTS.length})`);
  
  const expectedMovs = [
    'Prensa de Piernas',
    'Jalón al Pecho (Polea Alta)',
    'Press de Pecho en Máquina',
    'Peck Deck (Máquina Mariposa)',
    'Extensión de Piernas',
    'Curl de Piernas',
    'Remo Sentado en Máquina',
    'Elevación de Talones',
    'Extensión de Tríceps en Polea',
    'Curl de Bíceps en Máquina',
    'Máquina Smith (Sentadillas)',
    'Máquina Abductora / Aductora'
  ];

  expectedMovs.forEach(name => {
    const found = GYM_MOVEMENTS.find(m => m.name === name);
    assert(Boolean(found), `Movimiento presente en catálogo: ${name} (${found?.icons})`);
  });


  console.log('\n--- 3. Pruebas de Conversión Matemática Exacta ---');
  assert(KG_TO_LBS_FACTOR === 2.20462, `Factor de conversión exacto 1 kg = 2.20462 lbs`);
  
  // 100 kg en lbs
  const lbs100 = kgToLbs(100);
  assert(lbs100 === 220.5, `100 kg a LBS = 220.5 lbs (obtenido: ${lbs100})`);

  // 220.462 lbs a kg
  const kgBack = lbsToKg(220.462);
  assert(Math.round(kgBack) === 100, `220.462 lbs a KG = 100 kg (obtenido: ${kgBack})`);

  // Conversión bidireccional consistente
  const valConverted = convertWeight(80, 'KG', 'LBS');
  const valRestored = convertWeight(valConverted, 'LBS', 'KG');
  assert(Math.abs(valRestored - 80) < 0.1, `Conversión de ida y vuelta recupera el valor original (80 -> ${valConverted} -> ${valRestored})`);

  console.log('\n--- 4. Pruebas de Disciplinas para Lista Desplegable ---');
  assert(GYM_MOVEMENTS.every(m => m.id && m.name && m.muscles && m.icons), 'Todas las 12 disciplinas tienen estructura completa para la lista desplegable');
  const ids = GYM_MOVEMENTS.map(m => m.id);
  const uniqueIds = new Set(ids);
  assert(ids.length === uniqueIds.size, `Todas las 12 disciplinas tienen IDs únicos (${uniqueIds.size}/12)`);

  console.log(`\n========================================`);
  console.log(`Resumen de Pruebas: ${passed} exitosas, ${failed} fallidas.`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();

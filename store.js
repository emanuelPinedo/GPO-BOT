const { Redis } = require('@upstash/redis');

// Si no configuraste Upstash todavía (faltan las variables de entorno), el
// bot sigue funcionando pero usando el archivo local data.json como antes
// (con la limitación de que en Render Free se borra en cada deploy).
const USANDO_UPSTASH = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
);

const KEY = 'gpo-bot:data';

const DEFAULT_DATA = () => ({
  channelId: null,
  messageId: null,
  alertsEnabled: false,
  alertChannelId: null,
  alertRoleId: null,
  sentAlerts: {}, // { bossId: nextSpawnMsYaAvisado }
});

let redis = null;
if (USANDO_UPSTASH) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
  console.log('Persistencia: usando Upstash Redis (sobrevive a los deploys).');
} else {
  console.log(
    'Persistencia: usando data.json local (ojo: en Render Free se borra en cada deploy). ' +
      'Configurá UPSTASH_REDIS_REST_URL y UPSTASH_REDIS_REST_TOKEN para arreglar esto.',
  );
}

// --- Fallback a archivo local (solo si no hay Upstash configurado) ---
const fs = require('fs');
const path = require('path');
const FILE = path.join(__dirname, 'data.json');

function loadLocal() {
  try {
    const data = JSON.parse(fs.readFileSync(FILE, 'utf8'));
    if (typeof data.alertsEnabled !== 'boolean') data.alertsEnabled = false;
    return data;
  } catch {
    return DEFAULT_DATA();
  }
}

function saveLocal(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

// --- API pública: load/save, ahora asíncronas ---
async function load() {
  if (!USANDO_UPSTASH) return loadLocal();

  try {
    const raw = await redis.get(KEY);
    if (!raw) return DEFAULT_DATA();
    const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (typeof data.alertsEnabled !== 'boolean') data.alertsEnabled = false;
    return data;
  } catch (err) {
    console.error('No se pudo leer de Upstash, usando valores por defecto:', err.message);
    return DEFAULT_DATA();
  }
}

async function save(data) {
  if (!USANDO_UPSTASH) return saveLocal(data);

  try {
    await redis.set(KEY, JSON.stringify(data));
  } catch (err) {
    console.error('No se pudo guardar en Upstash:', err.message);
  }
}

module.exports = { load, save };
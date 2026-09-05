// GPO spawnea jefes en horarios fijos de reloj real (no random).
//
// Hawk Eye, Roger y Soul King ya tienen su horario REAL confirmado (ver
// schedule.js, tabla en hora Argentina). Radiant Admiral y el Travelling
// Merchant todavía no — para esos dos seguimos con una aproximación
// genérica de intervalo fijo (ANCHOR + intervalMinutes) hasta tener su
// tabla real también.
const { ROGER_TIMES, HAWKEYE_TIMES, SOULKING_TIMES } = require('./schedule');

// Ancla solo para los bosses que TODAVÍA usan el modo aproximado (intervalMinutes).
const ANCHOR = new Date('2024-01-01T00:00:00Z').getTime();

const BOSSES = [
  { id: 'hawkeye', name: 'Hawk Eye', emoji: '🦅', scheduleTimes: HAWKEYE_TIMES },
  { id: 'roger', name: 'Roger', emoji: '👑', scheduleTimes: ROGER_TIMES },
  { id: 'soulking', name: 'Soul King', emoji: '💀', scheduleTimes: SOULKING_TIMES },
  { id: 'radiantadmiral', name: 'Radiant Admiral', emoji: '⚡', intervalMinutes: 30 }, // aproximado, sin confirmar
];

const MERCHANT = { id: 'merchant', name: 'Travelling Merchant', emoji: '🛒', intervalMinutes: 30 }; // aproximado, sin confirmar

const ALERT_MINUTES_BEFORE = 5;
const CHECK_INTERVAL_MS = 10_000; // cada cuánto revisa el bot si hay que avisar o refrescar el embed

module.exports = { ANCHOR, BOSSES, MERCHANT, ALERT_MINUTES_BEFORE, CHECK_INTERVAL_MS };
// GPO spawnea jefes en horarios fijos de reloj real (no random), por ejemplo
// Soul King cada 1h en punto, Radiant Admiral cada 30 min, etc.
// ANCHOR es un punto de referencia UTC: el bot calcula los ciclos hacia
// adelante/atrás desde este instante. Con 2024-01-01T00:00:00Z (medianoche
// UTC) los ciclos de 120/90/60/30 min quedan alineados en horas "redondas".
//
// Si al probar el bot ves que el conteo NO coincide con el spawn real en el
// juego, es porque el servidor de GPO usa otro huso horario de referencia.
// Solución: anotá cuánto se adelanta o atrasa el bot respecto al spawn real
// y ajustá ANCHOR sumando/restando esa diferencia (en milisegundos).
const ANCHOR = new Date('2024-01-01T00:00:00Z').getTime();

const BOSSES = [
  { id: 'hawkeye', name: 'Hawk Eye', emoji: '🦅', intervalMinutes: 120 },
  { id: 'roger', name: 'Roger', emoji: '👑', intervalMinutes: 90 },
  { id: 'soulking', name: 'Soul King', emoji: '💀', intervalMinutes: 60 },
  { id: 'radiantadmiral', name: 'Radiant Admiral', emoji: '⚡', intervalMinutes: 30 },
];

const MERCHANT = { id: 'merchant', name: 'Travelling Merchant', emoji: '🛒', intervalMinutes: 30 };

const ALERT_MINUTES_BEFORE = 5;
const CHECK_INTERVAL_MS = 10_000; // cada cuánto revisa el bot si hay que avisar o refrescar el embed

// Canal donde el bot va a publicar y actualizar el mensaje de horarios
// automáticamente al arrancar, sin necesitar /gpo-setup.
const DEFAULT_CHANNEL_ID = '1545576032700989481';

module.exports = {
  ANCHOR,
  BOSSES,
  MERCHANT,
  ALERT_MINUTES_BEFORE,
  CHECK_INTERVAL_MS,
  DEFAULT_CHANNEL_ID,
};
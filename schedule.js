// Horarios reales de jefes, en hora de Argentina (UTC-3), confirmados por el usuario.
// Mihawk = "Hawk Eye" (su apodo) — Brook = "Soul King" (su apodo) — Roger = Roger.
const ARG_OFFSET_MIN = -180; // Argentina es UTC-3
const DAY_MIN = 24 * 60;

function every(intervalMin, startMin, count) {
  const times = [];
  for (let i = 0; i < count; i++) times.push((startMin + i * intervalMin) % DAY_MIN);
  return times.sort((a, b) => a - b);
}

// Roger: cada 90 min, empezando a las 00:00 (16 veces por día)
const ROGER_TIMES = every(90, 0, 16);

// Hawk Eye (Mihawk): cada 120 min, empezando a la 01:00 (12 veces por día)
const HAWKEYE_TIMES = every(120, 60, 12);

// Soul King (Brook): cada 60 min, de 01:00 a 23:00 — NO spawnea a las 00:00
// (confirmado por el usuario: hay un hueco de 2h entre las 23:00 y la 01:00).
const SOULKING_TIMES = [];
for (let h = 1; h <= 23; h++) SOULKING_TIMES.push(h * 60);

/**
 * Dado un array de horarios del día (en minutos, hora ARG) y el momento
 * actual, devuelve el último y el próximo spawn como timestamps UTC (ms).
 * Maneja correctamente el cruce de medianoche (y huecos como el de Soul King).
 */
function getScheduleCycle(timesOfDayMinutes, nowMs = Date.now()) {
  const nowMinTotal = Math.floor(nowMs / 60000) + ARG_OFFSET_MIN; // "minutos ARG" desde época
  const dayIndex = Math.floor(nowMinTotal / DAY_MIN);

  const candidatos = [];
  for (const offsetDia of [-1, 0, 1]) {
    for (const t of timesOfDayMinutes) {
      candidatos.push((dayIndex + offsetDia) * DAY_MIN + t);
    }
  }
  candidatos.sort((a, b) => a - b);

  let last = null;
  let next = null;
  for (const c of candidatos) {
    if (c <= nowMinTotal) last = c;
    if (c > nowMinTotal && next === null) next = c;
  }

  const toUtcMs = (argMinAbs) => (argMinAbs - ARG_OFFSET_MIN) * 60000;
  return { lastSpawn: toUtcMs(last), nextSpawn: toUtcMs(next) };
}

module.exports = { ROGER_TIMES, HAWKEYE_TIMES, SOULKING_TIMES, getScheduleCycle };
/**
 * Dado un ancla, un intervalo (en minutos) y el momento actual, devuelve
 * el timestamp (ms) del último spawn y del próximo spawn de ese ciclo.
 */
function getCycle(anchorMs, intervalMinutes, nowMs = Date.now()) {
  const intervalMs = intervalMinutes * 60_000;
  const elapsed = nowMs - anchorMs;
  const cyclesPassed = Math.floor(elapsed / intervalMs);
  const lastSpawn = anchorMs + cyclesPassed * intervalMs;
  const nextSpawn = lastSpawn + intervalMs;
  return { lastSpawn, nextSpawn };
}

module.exports = { getCycle };
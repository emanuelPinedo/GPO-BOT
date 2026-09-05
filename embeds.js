const { EmbedBuilder } = require('discord.js');
const { getCycle } = require('./time');
const { getScheduleCycle } = require('./schedule');
const { BOSSES, MERCHANT, ANCHOR } = require('./config');

// Un jefe puede tener horario real confirmado (scheduleTimes) o, si todavía
// no lo tenemos, usar el modo aproximado por intervalo (intervalMinutes).
function getBossCycle(boss) {
  if (boss.scheduleTimes) return getScheduleCycle(boss.scheduleTimes, Date.now());
  return getCycle(ANCHOR, boss.intervalMinutes, Date.now());
}

function buildBossEmbed() {
  const embed = new EmbedBuilder()
    .setTitle('Event Bosses 🏴‍☠️ Live Spawn Times')
    .setColor(0x8e44ad)
    .setFooter({ text: 'Se actualiza solo' })
    .setTimestamp();

  for (const boss of BOSSES) {
    const { lastSpawn, nextSpawn } = getBossCycle(boss);
    const nextTs = Math.floor(nextSpawn / 1000);
    const lastTs = Math.floor(lastSpawn / 1000);
    embed.addFields({
      name: `${boss.emoji} ${boss.name}`,
      value: `Próximo spawn: <t:${nextTs}:R>\nÚltimo spawn: <t:${lastTs}:R>`,
    });
  }

  return embed;
}

function buildMerchantEmbed() {
  const { lastSpawn, nextSpawn } = getBossCycle(MERCHANT);
  const nextTs = Math.floor(nextSpawn / 1000);
  const lastTs = Math.floor(lastSpawn / 1000);

  return new EmbedBuilder()
    .setTitle('Travelling Merchant 🛒 Stock Refresh')
    .setColor(0xf1c40f)
    .addFields({
      name: `${MERCHANT.emoji} ${MERCHANT.name}`,
      value: `Próximo refresh: <t:${nextTs}:R>\nÚltimo refresh: <t:${lastTs}:R>`,
    });
}

module.exports = { buildBossEmbed, buildMerchantEmbed, getBossCycle };
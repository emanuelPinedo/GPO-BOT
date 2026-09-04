require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const store = require('./store');
const { buildBossEmbed, buildMerchantEmbed } = require('./embeds');
const { getCycle } = require('./time');
const {
  BOSSES,
  MERCHANT,
  ANCHOR,
  ALERT_MINUTES_BEFORE,
  CHECK_INTERVAL_MS,
} = require('./config');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', () => {
  console.log(`Conectado como ${client.user.tag}`);
  tick();
  setInterval(tick, CHECK_INTERVAL_MS);
});

async function tick() {
  const data = store.load();

  // 1. Mantener el mensaje de horarios actualizado (por si el embed cambió de ciclo)
  if (data.channelId && data.messageId) {
    try {
      const channel = await client.channels.fetch(data.channelId);
      const message = await channel.messages.fetch(data.messageId);
      await message.edit({ embeds: [buildBossEmbed(), buildMerchantEmbed()] });
    } catch (err) {
      console.error('No se pudo editar el mensaje de horarios:', err.message);
    }
  }

  // 2. Revisar si hay que avisar 5 minutos antes de algún spawn
  const alertChannelId = data.alertChannelId || data.channelId;
  if (alertChannelId) {
    for (const boss of [...BOSSES, MERCHANT]) {
      const { nextSpawn } = getCycle(ANCHOR, boss.intervalMinutes, Date.now());
      const msLeft = nextSpawn - Date.now();
      const yaAvisado = data.sentAlerts[boss.id] === nextSpawn;

      if (!yaAvisado && msLeft > 0 && msLeft <= ALERT_MINUTES_BEFORE * 60_000) {
        try {
          const channel = await client.channels.fetch(alertChannelId);
          const mencion = data.alertRoleId ? `<@&${data.alertRoleId}> ` : '';
          const verbo = boss.id === 'merchant' ? 'refresca stock' : 'spawnea';
          await channel.send(
            `${mencion}⚠️ **${boss.name}** ${verbo} en ${ALERT_MINUTES_BEFORE} minutos!`,
          );
          data.sentAlerts[boss.id] = nextSpawn;
          store.save(data);
        } catch (err) {
          console.error('No se pudo enviar la alerta:', err.message);
        }
      }
    }
  }
}

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const data = store.load();

  if (interaction.commandName === 'gpo-setup') {
    const message = await interaction.channel.send({
      embeds: [buildBossEmbed(), buildMerchantEmbed()],
    });
    data.channelId = interaction.channel.id;
    data.messageId = message.id;
    store.save(data);
    await interaction.reply({
      content: '✅ Mensaje de horarios creado en este canal. Se va a mantener actualizado solo.',
      ephemeral: true,
    });
  }

  if (interaction.commandName === 'gpo-alertas') {
    const canal = interaction.options.getChannel('canal');
    const rol = interaction.options.getRole('rol');
    if (canal) data.alertChannelId = canal.id;
    if (rol) data.alertRoleId = rol.id;
    store.save(data);
    await interaction.reply({ content: '✅ Configuración de alertas guardada.', ephemeral: true });
  }
});

client.login(process.env.DISCORD_TOKEN);
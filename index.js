require('dotenv').config();
const http = require('http');
const { Client, GatewayIntentBits } = require('discord.js');
const store = require('./store');
const { buildBossEmbed, buildMerchantEmbed, getBossCycle } = require('./embeds');
const {
  BOSSES,
  MERCHANT,
  ALERT_MINUTES_BEFORE,
  CHECK_INTERVAL_MS,
} = require('./config');

// Render (como Web Service) necesita que el proceso escuche un puerto HTTP
// para considerarlo "vivo" y no marcarlo como caído. El bot no usa este
// servidor para nada más que responder "OK" a ese chequeo.
const PORT = process.env.PORT || 3000;
http
  .createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('GPO Boss Bot está corriendo.');
  })
  .listen(PORT, () => console.log(`Servidor HTTP de salud escuchando en el puerto ${PORT}`));

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', () => {
  console.log(`Conectado como ${client.user.tag}`);
  tick();
  setInterval(tick, CHECK_INTERVAL_MS);
});

async function tick() {
  const data = await store.load();

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

  // 2. Revisar si hay que avisar (SOLO si las alertas están activadas explícitamente)
  const alertChannelId = data.alertChannelId || data.channelId;
  if (data.alertsEnabled && alertChannelId) {
    for (const boss of [...BOSSES, MERCHANT]) {
      const { nextSpawn } = getBossCycle(boss);
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
          await store.save(data);
        } catch (err) {
          console.error('No se pudo enviar la alerta:', err.message);
        }
      }
    }
  }
}

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  try {
    const data = await store.load();

    if (interaction.commandName === 'gpo-setup') {
      const message = await interaction.channel.send({
        embeds: [buildBossEmbed(), buildMerchantEmbed()],
      });
      data.channelId = interaction.channel.id;
      data.messageId = message.id;
      await store.save(data);
      await interaction.reply({
        content: '✅ Mensaje de horarios creado en este canal. Se va a mantener actualizado solo.',
        ephemeral: true,
      });
    }

    if (interaction.commandName === 'gpo-alertas') {
      const canal = interaction.options.getChannel('canal');
      const rol = interaction.options.getRole('rol');
      const activar = interaction.options.getBoolean('activar');
      if (canal) data.alertChannelId = canal.id;
      if (rol) data.alertRoleId = rol.id;
      if (activar !== null) data.alertsEnabled = activar;
      await store.save(data);

      const estado = data.alertsEnabled ? 'activadas ✅' : 'desactivadas ⛔';
      await interaction.reply({
        content: `Alertas: **${estado}**${data.alertChannelId ? `\nCanal: <#${data.alertChannelId}>` : ''}${data.alertRoleId ? `\nRol a mencionar: <@&${data.alertRoleId}>` : ''}`,
        ephemeral: true,
      });
    }
  } catch (err) {
    console.error(`Error al procesar /${interaction.commandName}:`, err);
    const mensajeError = `❌ Algo falló: ${err.message}`;
    try {
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply({ content: mensajeError });
      } else {
        await interaction.reply({ content: mensajeError, ephemeral: true });
      }
    } catch (errReply) {
      console.error('Encima no se pudo avisar del error por Discord:', errReply.message);
    }
  }
});

// Evita que un error suelto tumbe todo el proceso del bot.
process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
});

client.login(process.env.DISCORD_TOKEN);
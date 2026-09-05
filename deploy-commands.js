require('dotenv').config();
const { REST, Routes, SlashCommandBuilder, ChannelType } = require('discord.js');

const commands = [
  new SlashCommandBuilder()
    .setName('gpo-setup')
    .setDescription('Crea el mensaje de horarios de jefes de GPO en este canal (se actualiza solo)'),
  new SlashCommandBuilder()
    .setName('gpo-alertas')
    .setDescription('Configura dónde y a quién avisar 5 minutos antes de que spawnee un jefe')
    .addBooleanOption((opt) =>
      opt.setName('activar').setDescription('Prender o apagar las alertas'),
    )
    .addChannelOption((opt) =>
      opt
        .setName('canal')
        .setDescription('Canal donde enviar las alertas')
        .addChannelTypes(ChannelType.GuildText),
    )
    .addRoleOption((opt) => opt.setName('rol').setDescription('Rol a mencionar en las alertas')),
].map((c) => c.toJSON());

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    if (process.env.GUILD_ID) {
      await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), {
        body: commands,
      });
      console.log('Comandos registrados en el servidor (aparecen al instante).');
    } else {
      await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
      console.log('Comandos registrados globalmente (pueden tardar ~1h en aparecer).');
    }
  } catch (err) {
    console.error(err);
  }
})();
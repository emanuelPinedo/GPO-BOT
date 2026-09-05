const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'data.json');

function load() {
  try {
    const data = JSON.parse(fs.readFileSync(FILE, 'utf8'));
    // Por si el archivo es de una versión vieja y no tiene este campo todavía
    if (typeof data.alertsEnabled !== 'boolean') data.alertsEnabled = false;
    return data;
  } catch {
    return {
      channelId: null,
      messageId: null,
      alertsEnabled: false, // las alertas empiezan APAGADAS hasta que uses /gpo-alertas activar:true
      alertChannelId: null,
      alertRoleId: null,
      sentAlerts: {}, // { bossId: nextSpawnMsYaAvisado }
    };
  }
}

function save(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

module.exports = { load, save };
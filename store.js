const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'data.json');

function load() {
  try {
    return JSON.parse(fs.readFileSync(FILE, 'utf8'));
  } catch {
    return {
      channelId: null,
      messageId: null,
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
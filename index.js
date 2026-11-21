const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/【entity-baileys¦canonical_name=Baileys】');
const pino = require('pino');
const config = require('./config');
const fs = require('fs');
const path = require('path');

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('session');
  const sock = makeWASocket({
    logger: pino({ level: 'silent' }),
    printQRInTerminal: true,
    auth: state,
    browser: ['CYBER NEXUS MD', 'Chrome', '1.0.0']
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log('Connection closed, reconnecting...', shouldReconnect);
      if (shouldReconnect) startBot();
    } else if (connection === 'open') {
      console.log('✅ CYBER NEXUS MD CONNECTED!');
    }
  });

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;
    const from = msg.key.remoteJid;
    const body = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
    if (!body.startsWith(config.PREFIX)) return;

    const args = body.slice(1).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    try {
      const cmdPath = path.join(__dirname, 'commands', command + '.js');
      if (fs.existsSync(cmdPath)) {
        const cmd = require(cmdPath);
        await cmd(sock, msg, from, args);
      }
    } catch (e) {
      console.log('Command error:', e);
    }
  });

  // Pairing Code - for Panel
  if (!sock.authState.creds.registered) {
    setTimeout(async () => {
      try {
        const code = await sock.requestPairingCode(config.OWNER_NUMBER);
        console.log('YOUR PAIRING CODE:', code);
      } catch (e) { console.log(e); }
    }, 3000);
  }
}

startBot();

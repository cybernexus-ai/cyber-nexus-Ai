const express = require('express');
const app = express();
let currentPairCode = "Starting... wait 30 sec then Refresh";

app.get('/', (req, res) => {
  res.send(`<div style="font-family:Arial;text-align:center;padding:40px;background:#111;color:white"><h1>🤖 CYBER NEXUS MD</h1><h2 style="color:#00ff88;font-size:32px">CODE: ${currentPairCode}</h2><p>Top: Kenya +254 | Box: 701083135</p><button onclick="location.reload()" style="padding:12px 24px;font-size:18px">Refresh</button></div>`);
});
app.listen(process.env.PORT || 3000, () => console.log("Pairing site running"));

const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/【entity-baileys¦canonical_name=baileys】');
const pino = require('pino');
const config = require('./config');

let codeAsked = false;

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState(config.sessionName);
  const sock = makeWASocket({
    logger: pino({ level: 'silent' }),
    auth: state,
    printQRInTerminal: false,
    browser: ["CYBER NEXUS MD", "Chrome", "1.0.0"]
  });
  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === 'connecting' && !sock.authState.creds.registered && !codeAsked) {
      codeAsked = true;
      try {
        await new Promise(r => setTimeout(r, 2000));
        const code = await sock.requestPairingCode(config.pairingNumber);
        currentPairCode = code;
        console.log("PAIRING CODE: " + code);
      } catch(e) {
        console.log("Pairing error:", e.message);
        codeAsked = false;
      }
    }

    if (connection === 'open') {
      console.log("CYBER NEXUS MD CONNECTED!");
      currentPairCode = "CONNECTED ✅";
    }

    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log("Connection closed, retry in 20 sec...");
      if (shouldReconnect) setTimeout(() => { codeAsked = false; startBot(); }, 20000);
    }
  });

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;
    const from = msg.key.remoteJid;
    const text = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
    if (!text.startsWith(config.prefix)) return;
    const cmd = text.slice(1).trim().split(" ")[0].toLowerCase();
    const reply = (t) => sock.sendMessage(from, { text: t }, { quoted: msg });
    if (cmd === "ping") return reply("🏓 PONG! CYBER NEXUS MD online!");
    if (cmd === "menu") return reply("🤖 MENU\n.ping\n.menu\n.alive\n.owner");
    if (cmd === "alive") return reply("✅ I'M ALIVE! CYBER NEXUS MD");
    if (cmd === "owner") return reply("👑 Owner: CYBER NEXUS");
  });
}
startBot();

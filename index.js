// ===== PAIRING LINK WEBSITE =====
const express = require('express');
const app = express();
let currentPairCode = "Waiting... Bot starting, refresh in 10 seconds";

app.get('/', (req, res) => {
  res.send(`
    <div style="font-family:Arial;text-align:center;padding:40px;background:#111;color:white;min-height:100vh">
      <h1>🤖 CYBER NEXUS MD</h1>
      <h2 style="color:#00ff88">PAIRING CODE: ${currentPairCode}</h2>
      <p>【entity-WhatsApp¦canonical_name=Whatsapp】 > Linked Devices > Link with phone number</p>
      <p>Enter number: 254701083135</p>
      <p>Enter code above</p>
      <button onclick="location.reload()" style="padding:10px 20px;font-size:18px">Refresh Code</button>
      <p><a href="/pair" style="color:#00ff88">/pair link</a></p>
    </div>
  `);
});

app.get('/pair', (req, res) => {
  res.send(`<h1 style="text-align:center;font-family:Arial">Pairing Code: ${currentPairCode}</h1>`);
});

app.listen(process.env.PORT || 3000, () => console.log("Pairing site running"));

// ===== WHATSAPP BOT =====
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const pino = require('pino');
const config = require('./config');

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState(config.sessionName);

  const sock = makeWASocket({
    logger: pino({ level: 'silent' }),
    auth: state,
    printQRInTerminal: false,
    browser: ["CYBER NEXUS MD", "Chrome", "1.0.0"]
  });

  sock.ev.on('creds.update', saveCreds);

  if (!sock.authState.creds.registered) {
    setTimeout(async () => {
      try {
        const code = await sock.requestPairingCode(config.pairingNumber);
        currentPairCode = code;
        console.log("=================================");
        console.log("PAIRING CODE: " + code);
        console.log("=================================");
      } catch (e) {
        console.log("Pairing error:", e.message);
      }
    }, 3000);
  }

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'open') {
      console.log("CYBER NEXUS MD CONNECTED!");
      currentPairCode = "CONNECTED ✅";
    }
    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log("Connection closed, reconnecting:", shouldReconnect);
      if (shouldReconnect) startBot();
    }
  });

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;
    const from = msg.key.remoteJid;
    const text = msg.message.conversation || msg.message.extendedTextMessage?.text || msg.message.imageMessage?.caption || "";
    if (!text.startsWith(config.prefix)) return;

    const args = text.slice(1).trim().split(" ");
    const cmd = args[0].toLowerCase();
    const reply = (t) => sock.sendMessage(from, { text: t }, { quoted: msg });

    // ===== COMMANDS TO TEST =====
    if (cmd === "ping") return reply("🏓 *PONG!*\nCYBER NEXUS MD is online!\nSpeed: Fast 🔥");
    if (cmd === "alive") return reply("✅ *I'M ALIVE!*\n\nBot: CYBER NEXUS MD\nOwner: CYBER NEXUS\nPrefix: .");
    if (cmd === "menu" || cmd === "help") return reply(`🤖 *CYBER NEXUS MD MENU*\n\n.ping - Check bot\n.alive - Is bot alive?\n.menu - This menu\n.owner - Owner info\n.time - Current time\n.say hello - Bot repeats\n\nMore coming soon...`);
    if (cmd === "owner") return reply(`👑 *OWNER*\n\nName: CYBER NEXUS\nNumber: 254701083135\nBot: CYBER NEXUS MD`);
    if (cmd === "time") return reply(`🕐 *TIME*\n${new Date().toLocaleString()}`);
    if (cmd === "say") {
      const sayText = args.slice(1).join(" ") || "You didn't say anything!";
      return reply(`🗣️ ${sayText}`);
    }
  });
}

startBot();

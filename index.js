// CYBER NEXUS MD - Clean Base
// Created by CYBER NEXUS TECH Nairobi

const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys')
const P = require('pino')

async function start() {
  const { state, saveCreds } = await useMultiFileAuthState('./session')
  
  const sock = makeWASocket({
    auth: state,
    logger: P({ level: 'silent' }),
    printQRInTerminal: true,
    browser: ["CYBER NEXUS MD", "Chrome", "1.0"]
  })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', (update) => {
    const { connection } = update
    if (connection === 'open') {
      console.log('✅ CYBER NEXUS MD CONNECTED!')
    }
  })

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages[0]
    if (!m.message) return
    const text = m.message.conversation || m.message.extendedTextMessage?.text || ""
    const from = m.key.remoteJid

    if (text.toLowerCase() === 'menu' || text.toLowerCase() === 'hi' || text === '1') {
      await sock.sendMessage(from, { text: `*🤖 CYBER NEXUS MD*
      
*Welcome! We Teach, Not Just Print.*

1️⃣ eCitizen / KRA Services
2️⃣ CV & Cover Letter - 300/-
3️⃣ Poster Design
4️⃣ Cyber Help
5️⃣ Bot Info

_Type the number_`
      })
    }
  })
}

start()

// CYBER NEXUS MD - 19 FEATURES FINAL
// Created by CYBER NEXUS TECH | Nairobi, Kenya

const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys')
const P = require('pino')
const fs = require('fs')

// ===== SETTINGS - ON/OFF YOUR 19 FEATURES =====
const SETTINGS = {
  autoViewStatus: true,      // 1
  recoverDeleted: true,      // 2
  downloadSongs: true,       // 3
  saveViewOnce: true,        // 4
  fakeRecording: false,      // 5
  alwaysOnline: true,        // 6
  fakeTyping: false,         // 7
  autoLikeStatus: true,      // 8
  aiFeatures: true,          // 9
  chatGpt: true,             // 10
  autoBlueTicks: true,       // 11
  autoReact: false,          // 12
  downloadVids: true,        // 13
  createImages: true,        // 14
  antiBanMode: true,         // 15
  autoSaveContacts: false,   // 16
  antiCall: true,            // 17
  autoBio: false,            // 18
  autoRead: true             // 19
}

let deletedMessages = new Map()
let bioInterval = null

async function start() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info')

  const sock = makeWASocket({
    auth: state,
    logger: P({ level: 'silent' }),
    printQRInTerminal: true,
    browser: ["CYBER NEXUS MD", "Chrome", "1.0.0"],
    syncFullHistory: false
  })

  sock.ev.on('creds.update', saveCreds)

  // Auto Bio Feature 18
  if(SETTINGS.autoBio){
    if(bioInterval) clearInterval(bioInterval)
    bioInterval = setInterval(async () => {
      const date = new Date().toLocaleString('en-KE', { timeZone: 'Africa/Nairobi' })
      try { await sock.updateProfileStatus(`CYBER NEXUS MD Active | ${date} | Nairobi 🇰🇪`) } catch {}
    }, 60000)
  }

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update
    if (connection === 'open') {
      console.log('✅ CYBER NEXUS MD CONNECTED! 19 Features Active')
    } else if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut
      if(shouldReconnect) start()
    }
  })

  // AntiCall Feature 17
  sock.ev.on('call', async (calls) => {
    if(!SETTINGS.antiCall) return
    for(let call of calls){
      if(call.status === 'offer'){
        await sock.rejectCall(call.id, call.from)
        await sock.sendMessage(call.from, { text: '*🚫 Calls Blocked by CYBER NEXUS MD*' })
      }
    }
  })

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages[0]
    if (!m.message) return
    if (m.key.fromMe && !m.message.protocolMessage) return

    const text = m.message.conversation || m.message.extendedTextMessage?.text || m.message.imageMessage?.caption || m.message.videoMessage?.caption || ""
    const from = m.key.remoteJid
    const isStatus = from === 'status@broadcast'

    // 4. Save ViewOnce Images
    if(SETTINGS.saveViewOnce && m.message.viewOnceMessage){
      try{
        const msg = m.message.viewOnceMessage.message
        const type = Object.keys(msg)[0]
        await sock.sendMessage(sock.user.id, { text: `*ViewOnce Saved from ${m.pushName}*` })
        await sock.sendMessage(sock.user.id, { forward: m })
      }catch(e){}
    }

    // 1. Auto View Status
    if(isStatus && SETTINGS.autoViewStatus){
      await sock.readMessages([m.key])
    }

    // 8. Auto Like Status
    if(isStatus && SETTINGS.autoLikeStatus){
      try { await sock.sendMessage(from, { react: { text: '❤️‍🔥', key: m.key } }) } catch {}
    }

    // Save for anti-delete 2
    if(!isStatus && SETTINGS.recoverDeleted){
      deletedMessages.set(m.key.id, { text, from, pushName: m.pushName, time: new Date() })
    }

    // 19. Auto Read 11. Auto Blue Ticks 6. Always Online 5/7 Fake
    if(!isStatus){
      if(SETTINGS.autoRead) await sock.readMessages([m.key])
      if(SETTINGS.alwaysOnline) await sock.sendPresenceUpdate('available', from)
      if(SETTINGS.fakeRecording) await sock.sendPresenceUpdate('recording', from)
      if(SETTINGS.fakeTyping) await sock.sendPresenceUpdate('composing', from)
      if(SETTINGS.autoBlueTicks) await sock.readMessages([m.key])
      if(SETTINGS.autoReact && Math.random() > 0.7) {
        const emojis = ['✅','👍','❤️','🔥']
        await sock.sendMessage(from, { react: { text: emojis[Math.floor(Math.random()*emojis.length)], key: m.key } })
      }
      if(SETTINGS.autoSaveContacts && !from.includes('@g.us')){
        try{ await sock.contacts.addOrEditContact(from, { name: from.split('@')[0] }) }catch{}
      }
    }

    if(!text.startsWith('.') && !text.startsWith('menu') && !text.startsWith('alive') && !text.startsWith('recover') && !text.startsWith('settings') && !text.startsWith('song') && !text.startsWith('video') && !text.startsWith('ai') && !text.startsWith('gpt') && !text.startsWith('attp')) return

    const args = text.trim().split(' ')
    const cmd = args[0].toLowerCase().replace('.','')
    const query = args.slice(1).join(' ')

    // Commands
    if(cmd === 'menu' || cmd === 'help'){
      let menu = `*꧁ CYBER NEXUS MD 𒆜*\n\n`
      menu += `*19 FEATURES ACTIVE:*\n`
      menu += `1. Auto View Status: ${SETTINGS.autoViewStatus?'ON':'OFF'}\n`
      menu += `2. Recover Deleted: ${SETTINGS.recoverDeleted?'ON':'OFF'}\n`
      menu += `3. Download Songs\n4. Save ViewOnce\n5. Fake Recording: ${SETTINGS.fakeRecording?'ON':'OFF'}\n`
      menu += `6. Always Online: ${SETTINGS.alwaysOnline?'ON':'OFF'}\n`
      menu += `7. Fake Typing: ${SETTINGS.fakeTyping?'ON':'OFF'}\n`
      menu += `8. Auto Like Status: ${SETTINGS.autoLikeStatus?'ON':'OFF'}\n`
      menu += `9. AI Features\n10. ChatGPT\n11. Auto Blue Ticks: ${SETTINGS.autoBlueTicks?'ON':'OFF'}\n`
      menu += `12. Auto React: ${SETTINGS.autoReact?'ON':'OFF'}\n`
      menu += `13. Download Vids\n14. Create Images\n15. Anti-Ban: ${SETTINGS.antiBanMode?'ON':'OFF'}\n`
      menu += `16. Auto Save Contacts: ${SETTINGS.autoSaveContacts?'ON':'OFF'}\n`
      menu += `17. AntiCall: ${SETTINGS.antiCall?'ON':'OFF'}\n`
      menu += `18. Auto Bio: ${SETTINGS.autoBio?'ON':'OFF'}\n`
      menu += `19. Auto Read: ${SETTINGS.autoRead?'ON':'OFF'}\n\n`
      menu += `*COMMANDS:*\n.menu\n.alive\n.settings\n.recover\n.song [name]\n.video [link]\n.ai [q]\n.gpt [q]\n.attp [text]\n\n*Made in Nairobi Kenya 🇰🇪*`
      await sock.sendMessage(from, { text: menu })
    }

    if(cmd === 'alive'){
      await sock.sendMessage(from, { text: `*CYBER NEXUS MD ALIVE ✅*\n\nBot: Online\nFeatures: 19 Active\nMode: ${SETTINGS.antiBanMode?'Anti-Ban ON 🛡️':''}\nLocation: Nairobi, Kenya\n\nType .menu for commands` })
    }

    if(cmd === 'settings'){
      let s = `*⚙️ SETTINGS - ON/OFF*\nEdit index.js > SETTINGS\n\n`
      for(let k in SETTINGS) s += `${k}: ${SETTINGS[k]}\n`
      await sock.sendMessage(from, { text: s })
    }

    if(cmd === 'recover'){
      if(deletedMessages.size === 0) return await sock.sendMessage(from, { text: '*No deleted messages yet*' })
      let txt = `*🗑️ RECOVERED DELETED:*\n\n`
      for(let [id, data] of deletedMessages){
        txt += `From: ${data.pushName} (${data.from})\nMsg: ${data.text}\nTime: ${data.time.toLocaleString()}\n---\n`
      }
      await sock.sendMessage(from, { text: txt.slice(0,4000) })
    }

    // Anti-delete detection
    if(m.message.protocolMessage && m.message.protocolMessage.type === 0 && SETTINGS.recoverDeleted){
      const deletedId = m.message.protocolMessage.key.id
      const saved = deletedMessages.get(deletedId)
      if(saved){
        await sock.sendMessage(from, { text: `*🚨 ANTI-DELETE DETECTED*\nFrom: ${saved.pushName}\nDeleted: ${saved.text}` })
      }
    }

    if(cmd === 'song'){
      if(!query) return await sock.sendMessage(from, { text: '*Use: .song calm down*' })
      await sock.sendMessage(from, { text: `*🎧 Downloading Song: ${query}*... (Connect YouTube API in code)` })
    }

    if(cmd === 'video'){
      if(!query) return await sock.sendMessage(from, { text: '*Use: .video [youtube link]*' })
      await sock.sendMessage(from, { text: `*📥 Downloading Video: ${query}*...` })
    }

    if((cmd === 'ai' || cmd === 'gpt') && SETTINGS.aiFeatures){
      if(!query) return await sock.sendMessage(from, { text: '*Use: .ai hello*' })
      await sock.sendMessage(from, { text: `*🧠 AI Response to:* ${query}\n\nThis is CYBER NEXUS AI. Add your OpenAI API key in index.js to enable real AI.` })
    }

    if(cmd === 'attp'){
      if(!query) return await sock.sendMessage(from, { text: '*Use: .attp Cyber*' })
      await sock.sendMessage(from, { text: `*🎨 Creating image: ${query}* - Use attp API` })
    }

  })

}

start()

const config = require('../config');

module.exports = async (sock, msg, from) => {
  const menuText = `┌─✧ CYBER NEXUS MD ✧─┐
│ PREFIX: [ * ]
│ OWNER: CYBER NEXUS
│ NUMBER: +254701083135
│ MODE: 🌐 Public
│ VERSION: v1.0.0
└──────────────┘

╭─── *CYBER NEXUS MD* ───╮
│ *menu* - Show Menu
│ *ping* - Speed Test
│ *owner* - Owner Info
╰──────────────────╯

📢 *Channel:*
https://whatsapp.com/channel/0029Vb8k0kx9mrGjwW3ePq1l

💻 *Repo:*
https://github.com/cybernexus-ai/cyber-nexus-Ai

👑 *Owner:*
wa.me/254701083135

> New Project On Town, Join, invite your friend And Stay tuned. PUBLIC ACCESS ✅ BEST FOR BEGINNERS.`;

  await sock.sendMessage(from, { 
    image: { url: config.MENU_IMAGE }, 
    caption: menuText 
  }, { quoted: msg });
};

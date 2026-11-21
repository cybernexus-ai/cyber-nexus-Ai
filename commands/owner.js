module.exports = async (sock, msg, from) => {
  const ownerText = `👑 *CYBER NEXUS MD OWNER*

*Name:* CYBER NEXUS
*Number:* +254701083135
*WhatsApp:* wa.me/254701083135

📢 *Channel:*
https://whatsapp.com/channel/0029Vb8k0kx9mrGjwW3ePq1l

💻 *Repo:*
https://github.com/cybernexus-ai/cyber-nexus-Ai

> New Project On Town, Join, invite your friend And Stay tuned.`;

  await sock.sendMessage(from, { text: ownerText }, { quoted: msg });
};

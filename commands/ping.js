module.exports = async (sock, msg, from) => {
  const start = Date.now();
  await sock.sendMessage(from, { text: '🏓 *Pinging...*' }, { quoted: msg });
  const speed = Date.now() - start;
  await sock.sendMessage(from, { text: `✅ *CYBER NEXUS MD is Online!*\n\n⚡ Speed: ${speed}ms\n👑 Owner: CYBER NEXUS\n📢 Channel: https://whatsapp.com/channel/0029Vb8k0kx9mrGjwW3ePq1l` }, { quoted: msg });
};

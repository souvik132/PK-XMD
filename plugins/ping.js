const { cmd } = require('../command');
const moment = require('moment-timezone');
const { performance } = require('perf_hooks');

function runtime() {
  let sec = process.uptime();
  let hrs = Math.floor(sec / 3600);
  let mins = Math.floor((sec % 3600) / 60);
  let secs = Math.floor(sec % 60);
  return `${hrs}h ${mins}m ${secs}s`;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

cmd({
  pattern: "ping",
  alias: ["speed", "pong"],
  desc: "Public ping command visible to everyone",
  category: "system",
  filename: __filename
}, async (Void, m) => {
  const start = performance.now();
  const jtime = moment.tz('Africa/Nairobi').format("HH:mm:ss");
  const jdate = moment.tz('Africa/Nairobi').format("DD/MM/YY");
  const uptime = runtime();

  // 📢 Public Context Info
  const contextInfo = {
    externalAdReply: {
      title: "⚡ PK-XMD • Public Ping",
      body: `🕒 ${jtime} | 📅 ${jdate}`,
      thumbnailUrl: 'https://files.catbox.moe/fgiecg.jpg',
      sourceUrl: 'https://github.com/mejjar00254/PK-XMD',
      mediaType: 1,
      renderLargerThumbnail: true
    },
    forwardingScore: 999,
    isForwarded: true
  };

  const end = performance.now();
  const speed = (end - start).toFixed(2);

  // ⚡ Public Ping Message (visible to all)
  const pingMsg = await Void.sendMessage(m.chat, {
    text: `*⚡ PUBLIC PING RESULT ⚡*\n\n` +
          `⏱️ *Response Time:* ${speed}ms\n` +
          `🕰️ *Uptime:* ${uptime}\n` +
          `🌍 *Server Location:* Africa/Nairobi\n\n` +
          `_Testing connection stability..._`,
    contextInfo
  });

  // 💓 Public Heartbeat Animation (visible to all)
  const emojis = ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍'];
  for (let i = 0; i < emojis.length; i++) {
    await sleep(800);
    await Void.sendMessage(m.chat, {
      text: `*HEARTBEAT TEST*\n${emojis[i]}`,
      edit: pingMsg.key,
      contextInfo
    });
  }

  // ✅ Final Public Result
  await Void.sendMessage(m.chat, {
    text: `*✅ PUBLIC PING COMPLETE ✅*\n\n` +
          `All systems operational!\n` +
          `⚡ Speed: ${speed}ms | 📅 ${jdate}`,
    contextInfo
  });
});

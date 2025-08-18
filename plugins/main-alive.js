const { cmd } = require('../command');
const moment = require('moment-timezone');
const { runtime } = require('../lib/functions');

cmd({
  pattern: "alive",
  alias: ["status", "botstatus"],
  desc: "Show bot status with beautiful design",
  category: "system",
  react: "⚡",
  filename: __filename
}, async (Void, m) => {
  try {
    const time = moment.tz('Africa/Nairobi').format('HH:mm:ss');
    const date = moment.tz('Africa/Nairobi').format('DD/MM/YYYY');
    const uptime = runtime(process.uptime());

    // 🌟 Beautiful ASCII Art Design
    const message = `
╔══════════════════════╗
║   🚀 *PK-XMD STATUS* 🚀   ║
╠══════════════════════╣
║                                     
║  🌍 *Server Time:* ${time}
║  📅 *Date:* ${date}
║  ⏱️ *Uptime:* ${uptime}
║                                     
╠══════════════════════╣
║  🔧 *Powered by Pkdriller* 🔧
╚══════════════════════╝
`.trim();

    // 📇 Verified Contact Card
    const vcard = {
      key: {
        fromMe: false,
        participant: "0@s.whatsapp.net",
        ...(m.chat ? { remoteJid: "status@broadcast" } : {})
      },
      message: {
        contactMessage: {
          displayName: "PK-XMD OFFICIAL",
          vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:PK-XMD\nORG:Verified WhatsApp Bot;\nTEL;type=CELL;type=VOICE;waid=254700000000:+254 700 000000\nEMAIL:contact@pkxmdofficial.com\nURL:https://github.com/mejjar00254/PK-XMD\nEND:VCARD`,
          jpegThumbnail: Buffer.alloc(0)
        }
      }
    };

    // 📢 Newsletter Context Info
    const contextInfo = {
      externalAdReply: {
        title: "PK-XMD • BOT STATUS",
        body: `Online since ${uptime}`,
        thumbnailUrl: 'https://files.catbox.moe/fgiecg.jpg',
        sourceUrl: 'https://github.com/mejjar00254/PK-XMD',
        mediaType: 1,
        renderLargerThumbnail: true,
        showAdAttribution: true
      },
      forwardingScore: 999,
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: "120363288304618280@newsletter",
        newsletterName: "PK-XMD Official",
        serverMessageId: 789
      }
    };

    await Void.sendMessage(m.chat, { 
      text: message,
      contextInfo: contextInfo
    }, { 
      quoted: vcard 
    });

  } catch (error) {
    console.error('Alive command error:', error);
    await Void.sendMessage(m.chat, { 
      text: '⚠️ Error showing status. Bot is still running!',
      contextInfo: {
        externalAdReply: {
          title: "PK-XMD • Error",
          body: "Status check failed",
          thumbnailUrl: 'https://files.catbox.moe/fgiecg.jpg'
        }
      }
    });
  }
});

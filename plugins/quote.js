const { cmd } = require('../command');
const axios = require('axios');
const moment = require('moment-timezone');

cmd({
  pattern: "quote",
  alias: ["inspire", "wisdom"],
  desc: "Get inspirational quotes from ZenQuotes API",
  category: "fun",
  react: "💬",
  filename: __filename
}, async (Void, mek, m) => {
  try {
    const startTime = performance.now();
    const time = moment.tz('Africa/Nairobi').format('HH:mm:ss');
    const date = moment.tz('Africa/Nairobi').format('DD/MM/YYYY');
    
    // Fetch from ZenQuotes API :cite[5]
    const { data } = await axios.get('https://zenquotes.io/api/random', {
      timeout: 5000
    });
    
    if (!data || !data[0]?.q) throw new Error("Invalid API response");
    
    const { q: quote, a: author } = data[0];
    const endTime = performance.now();
    const speed = (endTime - startTime).toFixed(2);
    
    // Beautiful formatting
    const message = `
✨ *INSPIRATIONAL QUOTE* ✨

${quote}

— *${author || "Unknown"}*

⏱️ Fetched in ${speed}ms
📅 ${date} | 🕒 ${time}

_Powered by ZenQuotes.io_
`.trim();

    await Void.sendMessage(
      m.chat,
      {
        text: message,
        contextInfo: {
          externalAdReply: {
            title: "PK-XMD • Daily Wisdom",
            body: quote.length > 30 ? quote.substring(0, 30) + "..." : quote,
            thumbnailUrl: 'https://i.imgur.com/9E7JV7l.jpg',
            sourceUrl: 'https://zenquotes.io/',
            mediaType: 1
          },
          forwardedNewsletterMessageInfo: {
            newsletterJid: "120363288304618280@newsletter",
            newsletterName: "PK-XMD Official"
          }
        }
      },
      { quoted: mek }
    );
    
  } catch (error) {
    console.error('Quote command error:', error);
    await Void.sendMessage(
      m.chat,
      { 
        text: "⚠️ Failed to fetch quote. Please try again later.",
        contextInfo: {
          externalAdReply: {
            title: "PK-XMD • Service Error",
            body: "Quote service temporarily unavailable",
            thumbnailUrl: 'https://i.imgur.com/9E7JV7l.jpg'
          }
        }
      },
      { quoted: mek }
    );
  }
});

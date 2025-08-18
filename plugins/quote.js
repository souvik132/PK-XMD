const { cmd } = require('../command');
const axios = require('axios');
const moment = require('moment-timezone');

cmd({
  pattern: "quote",
  alias: ["inspire"],
  desc: "Get inspirational quotes from Quotable API",
  category: "fun",
  react: "💬",
  filename: __filename
}, async (Void, mek, m) => {
  try {
    const start = Date.now();
    const time = moment.tz('Africa/Nairobi').format('HH:mm:ss');
    const date = moment.tz('Africa/Nairobi').format('DD/MM/YYYY');

    // Using Quotable API (more reliable free API)
    const { data } = await axios.get('https://api.quotable.io/random', {
      timeout: 4000 // 4 second timeout
    });

    if (!data || !data.content) throw new Error("Invalid API response");

    const fetchTime = Date.now() - start;

    // Beautiful message formatting
    const message = `
🪄 *DAILY INSPIRATION* 🪄

"${data.content}"

— *${data.author}*

📚 Tags: ${data.tags?.join(', ') || 'wisdom'}
⏱️ Fetched in ${fetchTime}ms
📅 ${date} | 🕒 ${time}

_Powered by Quotable API_
`.trim();

    await Void.sendMessage(
      m.chat,
      {
        text: message,
        contextInfo: {
          externalAdReply: {
            title: "PK-XMD • Words of Wisdom",
            body: data.content.length > 30 
              ? `${data.content.substring(0, 30)}...` 
              : data.content,
            thumbnailUrl: 'https://i.imgur.com/9E7JV7l.jpg',
            sourceUrl: 'https://api.quotable.io',
            mediaType: 1
          },
          forwardedNewsletterMessageInfo: {
            newsletterJid: "120363288304618280@newsletter",
            newsletterName: "PK-XMD Official",
            serverMessageId: 456
          }
        }
      },
      { quoted: mek }
    );

  } catch (error) {
    console.error('Quote Error:', error.message);
    await Void.sendMessage(
      m.chat,
      {
        text: `⚠️ Couldn't fetch quote right now. Please try again later.\n\nError: ${error.message}`,
        contextInfo: {
          externalAdReply: {
            title: "PK-XMD • Service Notice",
            body: "Quote service temporarily unavailable",
            thumbnailUrl: 'https://i.imgur.com/9E7JV7l.jpg'
          }
        }
      },
      { quoted: mek }
    );
  }
});

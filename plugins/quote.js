const { cmd } = require('../command');
const axios = require('axios');
const moment = require('moment-timezone');

// List of free quote APIs (fallback if one fails)
const QUOTE_APIS = [
  {
    name: "ZenQuotes",
    url: "https://zenquotes.io/api/random",
    parser: (data) => ({ quote: data[0].q, author: data[0].a })
  },
  {
    name: "Quotable",
    url: "https://api.quotable.io/random",
    parser: (data) => ({ quote: data.content, author: data.author })
  },
  {
    name: "DummyJSON",
    url: "https://dummyjson.com/quotes/random",
    parser: (data) => ({ quote: data.quote, author: data.author })
  }
];

cmd({
  pattern: "quote",
  alias: ["inspire", "wisdom"],
  desc: "Get inspirational quotes",
  category: "fun",
  react: "💬",
  filename: __filename
}, async (Void, mek, m) => {
  try {
    const time = moment.tz('Africa/Nairobi').format('HH:mm:ss');
    const date = moment.tz('Africa/Nairobi').format('DD/MM/YYYY');
    
    // Try APIs in sequence until one works
    for (const api of QUOTE_APIS) {
      try {
        const { data } = await axios.get(api.url, { timeout: 5000 });
        const { quote, author } = api.parser(data);

        // Beautiful quote formatting
        const message = `
✨ *INSPIRATIONAL QUOTE* ✨

${quote}

— *${author}*

📅 ${date} | 🕒 ${time}
`.trim();

        await Void.sendMessage(
          m.chat,
          {
            text: message,
            contextInfo: {
              externalAdReply: {
                title: "PK-XMD • Daily Wisdom",
                body: `"${quote.substring(0, 30)}..."`,
                thumbnailUrl: 'https://files.catbox.moe/fgiecg.jpg',
                sourceUrl: 'https://github.com/mejjar00254/PK-XMD',
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
        return; // Success - exit the function
        
      } catch (e) {
        console.log(`Failed ${api.name}, trying next...`);
      }
    }
    
    // If all APIs failed
    await Void.sendMessage(
      m.chat,
      { text: "⚠️ Couldn't fetch quotes. Please try again later." },
      { quoted: mek }
    );
    
  } catch (error) {
    console.error('Quote command error:', error);
    await Void.sendMessage(
      m.chat,
      { text: "❌ Error fetching quotes!" },
      { quoted: mek }
    );
  }
});

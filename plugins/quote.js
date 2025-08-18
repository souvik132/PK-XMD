const { cmd } = require('../command');
const axios = require('axios');
const moment = require('moment-timezone');

// More reliable quote APIs with better error handling
const QUOTE_APIS = [
  {
    name: "Quotable",
    url: "https://api.quotable.io/random",
    parser: (data) => ({ 
      quote: data.content,
      author: data.author,
      tags: data.tags.join(', ') || "inspiration"
    })
  },
  {
    name: "They Said So",
    url: "https://quotes.rest/qod?language=en",
    headers: { "Accept": "application/json" },
    parser: (data) => ({
      quote: data.contents.quotes[0].quote,
      author: data.contents.quotes[0].author,
      tags: data.contents.quotes[0].tags.join(', ') || "wisdom"
    })
  },
  {
    name: "Stoic Quotes",
    url: "https://stoic-quotes.com/api/random",
    parser: (data) => ({
      quote: data.text,
      author: data.author,
      tags: "stoicism"
    })
  }
];

cmd({
  pattern: "quote",
  alias: ["inspire", "wisdom"],
  desc: "Get inspirational quotes from multiple APIs",
  category: "fun",
  react: "💬",
  filename: __filename
}, async (Void, mek, m) => {
  try {
    const time = moment.tz('Africa/Nairobi').format('HH:mm:ss');
    const date = moment.tz('Africa/Nairobi').format('DD/MM/YYYY');
    
    let lastError = null;
    
    for (const api of QUOTE_APIS) {
      try {
        const config = {
          timeout: 4000,
          headers: api.headers || {}
        };
        
        const { data } = await axios.get(api.url, config);
        const { quote, author, tags } = api.parser(data);

        // Enhanced formatting
        const message = `
🪄 *${api.name.toUpperCase()} QUOTE* 🪄

${quote}

— *${author}*  
🔖 Tags: ${tags}

📅 ${date} | 🕒 ${time}
Powered by PK-XMD
`.trim();

        await Void.sendMessage(
          m.chat,
          {
            text: message,
            contextInfo: {
              externalAdReply: {
                title: `💬 ${api.name} Wisdom`,
                body: quote.length > 30 ? quote.substring(0, 30) + "..." : quote,
                thumbnailUrl: 'https://i.imgur.com/9E7JV7l.jpg',
                sourceUrl: 'https://github.com/mejjar00254/PK-XMD',
                mediaType: 1
              }
            }
          },
          { quoted: mek }
        );
        return;
        
      } catch (error) {
        console.error(`[${api.name} Failed]:`, error.message);
        lastError = error;
        continue; // Try next API
      }
    }
    
    // If all APIs failed
    await Void.sendMessage(
      m.chat,
      { 
        text: "⚠️ All quote services are currently unavailable.\nPlease try again later.",
        contextInfo: {
          externalAdReply: {
            title: "PK-XMD Quote Service",
            body: "Temporary outage - we're working on it!",
            thumbnailUrl: 'https://i.imgur.com/9E7JV7l.jpg'
          }
        }
      },
      { quoted: mek }
    );
    
  } catch (error) {
    console.error('[Quote Command Error]:', error);
    await Void.sendMessage(
      m.chat,
      { 
        text: "❌ Unexpected error in quote command!\nOur team has been notified.",
        contextInfo: {
          externalAdReply: {
            title: "PK-XMD Error Report",
            body: "Technical issue detected",
            thumbnailUrl: 'https://i.imgur.com/9E7JV7l.jpg'
          }
        }
      },
      { quoted: mek }
    );
  }
});

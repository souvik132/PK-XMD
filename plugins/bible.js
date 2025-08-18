const { cmd } = require('../command');
const axios = require('axios');

cmd({
  pattern: "bible",
  alias: ["verse"],
  react: "✝️",
  desc: "Get Bible verses and passages",
  category: "main",
  filename: __filename
}, async (conn, mek, m, { from, quoted, args, reply }) => {
  try {
    if (!args[0]) return reply('Please specify a passage (e.g. .bible John 3:16 or .bible Genesis 1:1-5)');

    // Clean and format the input
    const passage = args.join(' ')
      .replace(/[^a-zA-Z0-9\s:-]/g, '') // Remove special chars
      .trim();
    
    // Supported translations
    const translations = {
      'kjv': 'King James Version',
      'niv': 'New International Version',
      'esv': 'English Standard Version',
      'nasb': 'New American Standard Bible'
    };
    
    // Try multiple translations if first fails
    for (const [translation, name] of Object.entries(translations)) {
      try {
        const apiUrl = `https://bible-api.com/${encodeURIComponent(passage)}?translation=${translation}`;
        const res = await axios.get(apiUrl, { timeout: 5000 });
        
        if (res.data.verses && res.data.verses.length > 0) {
          const json = res.data;
          
          let bibleText = `✝️ *Holy Bible (${name})* ✝️\n\n`;
          bibleText += `📖 *${json.reference}*\n\n`;
          
          json.verses.forEach(verse => {
            bibleText += `🔮 ${verse.verse}. ${verse.text}\n\n`;
          });
          
          await conn.sendMessage(
            from,
            {
              image: { url: 'https://i.imgur.com/9E7JV7l.jpg' }, // Bible image
              caption: bibleText,
              contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true
              }
            },
            { quoted: mek }
          );
          return; // Success - exit the function
        }
      } catch (err) {
        console.log(`Attempt with ${translation} failed, trying next...`);
      }
    }
    
    // If all attempts failed
    reply(`Could not find the passage "${passage}". Try formats like:\n- John 3:16\n- Genesis 1\n- Psalms 23:1-4`);

  } catch (error) {
    console.error('Bible command error:', error);
    reply('Error fetching Bible passage. Please try again later.');
  }
});

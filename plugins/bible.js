const { cmd, commands } = require('../command');
const { fetchJson } = require('../lib/functions');
const axios = require('axios');

cmd({
  pattern: "bible",
  alias: ["verse"],
  react: "✝️",
  desc: "Get Bible verses and passages.",
  category: "main",
  filename: __filename
}, async (conn, mek, m, { from, quoted, args, reply }) => {
  try {
    let [book, chapter, verse] = args.join(' ').split(/[\s:]/);
    if (!book) return reply('Please specify a book, chapter and verse (e.g. .bible John 3:16)');

    // Fetch book list to validate input
    let booksRes = await axios.get('https://bible-api.com/books');
    let books = booksRes.data;
    
    // Find matching book (case insensitive)
    let matchedBook = books.find(b => 
      b.name.toLowerCase().includes(book.toLowerCase()) || 
      b.abbreviation.toLowerCase() === book.toLowerCase()
    );
    
    if (!matchedBook) return reply(`Couldn't find book "${book}"`);

    let passage = `${matchedBook.name} ${chapter}${verse ? `:${verse}` : ''}`;
    let apiUrl = `https://bible-api.com/${encodeURIComponent(passage)}?translation=kjv`;
    
    let res = await axios.get(apiUrl);
    if (res.status !== 200) return reply(`API error ${res.status}: ${res.statusText}`);

    let json = res.data;

    let bibleText = `
✝️ *Holy Bible* ✝️

📖 *${json.reference} (KJV)*
${json.verses.map(v => `🔮 ${v.verse}. ${v.text}`).join('\n')}

📜 *${json.translation_name} (${json.translation})*
${json.text}`;

    await conn.sendMessage(
      from,
      {
        image: { url: `https://files.catbox.moe/example.jpg` }, // Replace with Bible image
        caption: bibleText,
        contextInfo: {
          mentionedJid: [m.sender],
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363288304618280@newsletter',
            newsletterName: 'PK-XMD',
            serverMessageId: 143
          }
        }
      },
      { quoted: mek }
    );

  } catch (error) {
    console.error(error);
    reply(`Error: ${error.message}`);
  }
});

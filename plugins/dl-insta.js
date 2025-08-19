const axios = require("axios");
const { cmd } = require('../command');

cmd({
  pattern: "ig",
  alias: ["insta", "igdl", "instagram"],
  desc: "Download Instagram videos/reels",
  react: "🎥",
  category: "download",
  filename: __filename
}, async (conn, m, store, { from, q, reply }) => {
  try {
    if (!q || !q.startsWith("http")) {
      return reply("❌ Please provide a valid Instagram URL\nExample: .ig https://www.instagram.com/reel/...");
    }

    // Show processing indicator
    await conn.sendMessage(from, { react: { text: "⏳", key: m.key } });

    // New reliable API endpoint
    const apiUrl = `https://api.irvyn.xyz/igdl?url=${encodeURIComponent(q)}`;
    
    // Fetch data from API
    const { data } = await axios.get(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36'
      }
    });

    // Validate response
    if (!data || !data.data || !data.data.length) {
      return reply("⚠️ Failed to fetch media. Please check the link or try again later.");
    }

    const mediaData = data.data[0];
    const mediaUrl = mediaData.url;
    const mediaType = mediaUrl.includes('.mp4') ? 'video' : 'image';
    const caption = `📸 *Instagram Download*\n\n` +
                   `> *Powerd By Pkdriller*\n` +
                   `🔗 *Original URL:* ${q}`;

    // Fake contact for context
    const fakeContact = {
      key: {
        fromMe: false,
        participant: '0@s.whatsapp.net',
        remoteJid: 'status@broadcast'
      },
      message: {
        contactMessage: {
          displayName: 'INSTA DL ✅',
          vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:PK-XMD BOT\nORG:PK-XMD;\nTEL;type=CELL;type=VOICE;waid=254700000000:+254 700 000000\nEND:VCARD`,
          jpegThumbnail: null
        }
      }
    };

    // Send the media with enhanced context
    await conn.sendMessage(
      from,
      {
        [mediaType]: { url: mediaUrl },
        caption: caption,
        contextInfo: {
          externalAdReply: {
            title: "INSTAGRAM DOWNLOADER",
            body: "Powered by PK-XMD",
            thumbnailUrl: "https://files.catbox.moe/fgiecg.jpg",
            sourceUrl: "https://github.com/pkdriller",
            mediaType: 1,
            renderLargerThumbnail: true,
            showAdAttribution: true
          },
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: "120363288304618280@newsletter",
            newsletterName: "PK-XMD Bot Updates",
            serverMessageId: Math.floor(Math.random() * 1000000).toString(),
          }
        }
      },
      { quoted: fakeContact }
    );

  } catch (error) {
    console.error("Instagram Download Error:", error);
    reply(`❌ Error: ${error.message || "Failed to download media"}`);
  }
});

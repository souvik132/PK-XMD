const { cmd } = require("../command");
const axios = require("axios");

cmd({
  pattern: "lyrics",
  alias: ["lyric", "songlyrics"],
  use: ".lyrics <song name>",
  desc: "Fetch song lyrics by title.",
  category: "search",
  react: "🎶",
  filename: __filename,
}, async (conn, mek, m, { from, q }) => {
  try {
    if (!q) {
      return conn.sendMessage(from, { 
        text: "🔍 Please enter the song name to get the lyrics! Usage: *.lyrics <song name>*"
      }, { quoted: mek });
    }

    let lyricsData = null;

    // First API - some-random-api
    try {
      const res = await axios.get(`https://some-random-api.com/lyrics?title=${encodeURIComponent(q)}`);
      if (res.data?.lyrics) lyricsData = res.data;
    } catch {}

    // Fallback API - lyrics.ovh
    if (!lyricsData) {
      try {
        const res = await axios.get(`https://api.lyrics.ovh/v1/${encodeURIComponent(q)}`);
        if (res.data?.lyrics) {
          lyricsData = {
            title: q,
            author: "Unknown",
            lyrics: res.data.lyrics
          };
        }
      } catch {}
    }

    if (!lyricsData) {
      return conn.sendMessage(from, { 
        text: `❌ Sorry, I couldn't find any lyrics for "${q}".`
      }, { quoted: mek });
    }

    const caption = `🎵 *Song Lyrics* 🎶\n\n▢ *Title:* ${lyricsData.title || q}\n▢ *Artist:* ${lyricsData.author || "Unknown"}\n\n📜 *Lyrics:*\n${lyricsData.lyrics}\n\n✨ Hope you enjoy the music! 🎧`;

    await conn.sendMessage(from, {
      text: caption,
      contextInfo: {
        externalAdReply: {
          title: "Lyrics Finder",
          body: "Powered by PK-XMD",
          sourceUrl: "https://github.com/pkdriller",
          mediaType: 1
        },
        forwardedNewsletterMessageInfo: {
          newsletterJid: "120363288304618280@newsletter",
          newsletterName: "PK-XMD Official",
          serverMessageId: 103,
        },
      },
    }, { quoted: mek });

  } catch (err) {
    console.error("Lyrics Command Error:", err);
    return conn.sendMessage(from, { 
      text: `❌ An error occurred while fetching the lyrics for "${q}".`
    }, { quoted: mek });
  }
});

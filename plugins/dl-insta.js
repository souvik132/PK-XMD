const { cmd } = require("../command");
const { igdl } = require("ruhend-scraper");
const axios = require("axios");

// Prevent duplicate processing
const processedMessages = new Set();

cmd({
  pattern: "ig",
  alias: ["instagram", "igdl"],
  use: ".ig <instagram link>",
  desc: "Download Instagram reels, posts or videos.",
  category: "download",
  react: "📸",
  filename: __filename,
}, async (conn, mek, m, { from, q }) => {
  try {
    if (!q) {
      return conn.sendMessage(from, { text: "❌ Please provide an Instagram link." }, { quoted: mek });
    }

    // Avoid duplicate processing
    if (processedMessages.has(mek.key.id)) return;
    processedMessages.add(mek.key.id);
    setTimeout(() => processedMessages.delete(mek.key.id), 5 * 60 * 1000);

    // Validate Instagram link
    const instaRegex = /(https?:\/\/(?:www\.)?(instagram\.com|instagr\.am)\/[^\s]+)/i;
    if (!instaRegex.test(q)) {
      return conn.sendMessage(from, { text: "⚠️ That’s not a valid Instagram link. Try again with a reel, post, or video link." }, { quoted: mek });
    }

    // React
    await conn.sendMessage(from, { react: { text: "🔄", key: mek.key } });

    let mediaData = [];

    // ========== Fallback APIs ==========
    try {
      const dl1 = await igdl(q); // ruhend-scraper
      if (dl1?.data?.length) mediaData = dl1.data;
    } catch {}

    if (mediaData.length === 0) {
      try {
        const { data } = await axios.get(`https://apis.davidcyriltech.my.id/dl/ig?url=${encodeURIComponent(q)}`);
        if (data?.result) mediaData = data.result;
      } catch {}
    }

    if (mediaData.length === 0) {
      try {
        const { data } = await axios.get(`https://dreaded.site/api/igdl?url=${encodeURIComponent(q)}`);
        if (data?.result) mediaData = data.result;
      } catch {}
    }

    if (mediaData.length === 0) {
      return conn.sendMessage(from, { text: "⚠️ Failed to fetch Instagram media." }, { quoted: mek });
    }

    // Send up to 10 media files
    for (let i = 0; i < Math.min(10, mediaData.length); i++) {
      const media = mediaData[i];
      const mediaUrl = media.url || media;

      const isVideo =
        /\.(mp4|mov|avi|mkv|webm)$/i.test(mediaUrl) ||
        media.type === "video" ||
        q.includes("/reel/") ||
        q.includes("/tv/");

      if (isVideo) {
        await conn.sendMessage(from, {
          video: { url: mediaUrl },
          mimetype: "video/mp4",
          caption: "📸 Downloaded by *PK-XMD*",
          contextInfo: {
            externalAdReply: {
              title: "Instagram Downloader",
              body: "Powered by Pkdriller",
              sourceUrl: q,
              mediaType: 1
            },
            forwardedNewsletterMessageInfo: {
              newsletterJid: "120363288304618280@newsletter",
              newsletterName: "PK-XMD Official",
              serverMessageId: 101,
            },
          },
        }, { quoted: mek });
      } else {
        await conn.sendMessage(from, {
          image: { url: mediaUrl },
          caption: "📸 Downloaded by *PK-XMD*",
          contextInfo: {
            externalAdReply: {
              title: "Instagram Downloader",
              body: "Powered by Pkdriller",
              sourceUrl: q,
              mediaType: 1
            },
            forwardedNewsletterMessageInfo: {
              newsletterJid: "120363288304618280@newsletter",
              newsletterName: "PK-XMD Official",
              serverMessageId: 102,
            },
          },
        }, { quoted: mek });
      }
    }
  } catch (err) {
    console.error("IG Command Error:", err);
    return conn.sendMessage(from, { text: "❌ Error: " + err.message }, { quoted: mek });
  }
});
  

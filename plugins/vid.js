const axios = require("axios");
const yts = require("yt-search");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const util = require("util");
const { cmd } = require("../command");
const { generateWAMessageFromContent, proto } = require("@whiskeysockets/baileys");

const execPromise = util.promisify(exec);

const princeVideoApi = {
  base: "https://api.princetechn.com/api/download/ytmp4",
  apikey: process.env.PRINCE_API_KEY || "prince",
  async fetchMeta(videoUrl) {
    const params = new URLSearchParams({ apikey: this.apikey, url: videoUrl });
    const url = `${this.base}?${params.toString()}`;
    const { data } = await axios.get(url, {
      timeout: 20000,
      headers: {
        "user-agent": "Mozilla/5.0",
        accept: "application/json",
      },
    });
    return data;
  },
};

cmd({
  pattern: "vide",
  alias: ["yt", "mp"],
  use: ".video <query/link>",
  desc: "Download YouTube video using Prince API.",
  category: "download",
  react: "🎬",
  filename: __filename,
}, async (conn, mek, m, { from, q }) => {
  try {
    if (!q) {
      return conn.sendMessage(from, { text: "❌ What video do you want to download?" }, { quoted: mek });
    }

    // Detect if input is a link or a search query
    let videoUrl = "";
    let videoTitle = "";
    let videoThumbnail = "";
    if (q.startsWith("http://") || q.startsWith("https://")) {
      videoUrl = q;
    } else {
      const { videos } = await yts(q);
      if (!videos || videos.length === 0) {
        return conn.sendMessage(from, { text: "⚠️ No videos found!" }, { quoted: mek });
      }
      videoUrl = videos[0].url;
      videoTitle = videos[0].title;
      videoThumbnail = videos[0].thumbnail;
    }

    // Send searching thumbnail
    try {
      const ytId = (videoUrl.match(/(?:youtu\.be\/|v=)([a-zA-Z0-9_-]{11})/) || [])[1];
      const thumb = videoThumbnail || (ytId ? `https://i.ytimg.com/vi/${ytId}/sddefault.jpg` : undefined);
      if (thumb) {
        await conn.sendMessage(from, {
          image: { url: thumb },
          caption: `🔎 Searching video...\n\n*${videoTitle || q}*`,
          contextInfo: {
            externalAdReply: {
              title: "🎬 PK-XMD Video Downloader",
              body: "Powered by Pkdriller",
              thumbnailUrl: thumb,
              sourceUrl: videoUrl,
              mediaType: 1,
              renderLargerThumbnail: true,
            },
            mentionedJid: [m.sender],
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: "120363322466963620@newsletter",
              newsletterName: "PK-XMD Official",
              serverMessageId: 143,
            },
          },
        }, { quoted: mek });
      }
    } catch (e) { }

    // Validate YouTube URL
    let urls = videoUrl.match(/(?:https?:\/\/)?(?:youtu\.be\/|(?:www\.|m\.)?youtube\.com\/(?:watch\?v=|v\/|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/gi);
    if (!urls) {
      return conn.sendMessage(from, { text: "❌ This is not a valid YouTube link!" }, { quoted: mek });
    }

    // Prince API fetch
    let videoDownloadUrl = "";
    let title = "";
    try {
      const meta = await princeVideoApi.fetchMeta(videoUrl);
      if (meta?.success && meta?.result?.download_url) {
        videoDownloadUrl = meta.result.download_url;
        title = meta.result.title || "video";
      } else {
        return conn.sendMessage(from, { text: "⚠️ Failed to fetch video from API." }, { quoted: mek });
      }
    } catch (e) {
      return conn.sendMessage(from, { text: "⚠️ API request failed." }, { quoted: mek });
    }

    // Try sending directly
    try {
      return await conn.sendMessage(from, {
        video: { url: videoDownloadUrl },
        mimetype: "video/mp4",
        fileName: `${title}.mp4`,
        caption: `🎬 *${title}*\n\n> _Downloaded by PK-XMD_`,
        contextInfo: {
          externalAdReply: {
            title: "🎬 PK-XMD Video Downloader",
            body: "Powered by Pkdriller",
            thumbnailUrl: videoThumbnail || "https://telegra.ph/file/7f82f0f543a55.png",
            sourceUrl: videoUrl,
            mediaType: 1,
            renderLargerThumbnail: true,
          },
          mentionedJid: [m.sender],
          forwardedNewsletterMessageInfo: {
            newsletterJid: "120363322466963620@newsletter",
            newsletterName: "PK-XMD Official",
            serverMessageId: 144,
          },
        },
      }, { quoted: mek });
    } catch (err) {
      return conn.sendMessage(from, { text: "⚠️ Sending video failed." }, { quoted: mek });
    }
  } catch (e) {
    console.error("[VIDEO CMD ERROR]", e);
    return conn.sendMessage(from, { text: `❌ Error: ${e.message}` }, { quoted: mek });
  }
});

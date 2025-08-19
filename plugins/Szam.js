const { cmd } = require("../command");
const axios = require("axios");
const ytSearch = require("yt-search");
const ytdl = require("ytdl-core");
const conf = require("../set");

// Fake verification vCard for quoted messages
const fakeQuoted = {
  key: {
    fromMe: false,
    participant: "0@s.whatsapp.net",
    remoteJid: "status@broadcast",
  },
  message: {
    contactMessage: {
      displayName: "PK-XMD",
      vcard: "BEGIN:VCARD\nVERSION:3.0\nN:PK-XMD;;;\nFN:PK-XMD\nORG:PKDRILLER\nEND:VCARD",
    },
  },
};

// =============== MOVIE COMMAND ==================
cmd({
  pattern: "movie1",
  alias: ["gtmovie", "mvdl"],
  desc: "Search movie info + trailer",
  category: "search",
  react: "🎬"
}, async (conn, mek, { args, reply }) => {

  const contextInfo = {
    forwardingScore: 999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: "120363295141350550@newsletter",
      newsletterName: "PK-XMD",
      serverMessageId: 143,
    },
    externalAdReply: {
      title: "🎬 Movie Finder",
      body: "Powered by Pkdriller",
      thumbnailUrl: "https://telegra.ph/file/94f5c37a2b1d6c93a97ae.jpg",
      sourceUrl: "https://github.com/pkdriller/PK-XMD",
      mediaType: 1,
      renderLargerThumbnail: false,
    },
  };

  if (!args[0]) return reply("❌ Please provide a movie title.");

  const query = args.join(" ");
  reply("🔍 Searching for movie and trailer...");

  const apiKey = "38f19ae1";

  try {
    const searchRes = await axios.get(`http://www.omdbapi.com/?s=${encodeURIComponent(query)}&apikey=${apiKey}`);
    if (searchRes.data.Response === "False") return reply(`❌ Movie not found: ${searchRes.data.Error}`);

    const movieID = searchRes.data.Search[0].imdbID;
    const detailsRes = await axios.get(`http://www.omdbapi.com/?i=${movieID}&apikey=${apiKey}`);
    const movie = detailsRes.data;
    if (movie.Response === "False") return reply(`❌ Error fetching details: ${movie.Error}`);

    const ytResult = await ytSearch(`${movie.Title} trailer`);
    const trailer = ytResult.videos.find((v) => v.seconds <= 240);
    if (!trailer) return reply("❌ No trailer found on YouTube.");

    const trailerInfo = await ytdl.getInfo(trailer.url);
    const format = ytdl.chooseFormat(trailerInfo.formats, { quality: "18" });
    if (!format || !format.contentLength) return reply("❌ No downloadable format available.");

    const sizeMB = parseInt(format.contentLength, 10) / (1024 * 1024);
    if (sizeMB > 100) return reply("❌ Trailer too large (100MB+).");

    await conn.sendMessage(mek.chat, {
      video: { stream: ytdl(trailer.url, { quality: "18" }) },
      caption: `🎬 *${movie.Title}* (${movie.Year})\n⭐ *IMDb:* ${movie.imdbRating}/10\n\n📖 *Plot:* ${movie.Plot}`,
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        externalAdReply: {
          title: movie.Title,
          body: "Watch Trailer",
          thumbnailUrl: movie.Poster !== "N/A" ? movie.Poster : "https://telegra.ph/file/94f5c37a2b1d6c93a97ae.jpg",
          sourceUrl: `https://www.imdb.com/title/${movie.imdbID}`,
          mediaType: 1,
          renderLargerThumbnail: true,
        },
      },
    }, { quoted: fakeQuoted });

  } catch (err) {
    console.error("Movie Error:", err);
    reply("❌ Error occurred. Try again.");
  }
});

// ================= PLAY (YT Audio) ===================
cmd({
  pattern: "playpk",
  alias: ["song", "ytmp3", "audio", "mp3"],
  desc: "Download audio from YouTube",
  category: "search",
  react: "⬇️"
}, async (conn, mek, { args, reply }) => {
  if (!args[0]) return reply("❌ Provide a song name.");
  const query = args.join(" ");

  try {
    const results = await ytSearch(query);
    if (!results.videos.length) return reply("❌ No results found.");

    const video = results.videos[0];
    const videoUrl = video.url;

    await reply("⬇️ Downloading audio...");

    const res = await axios.get(`https://apis.davidcyriltech.my.id/download/ytmp3?url=${encodeURIComponent(videoUrl)}&apikey=gifted-md`);
    const dl = res.data.result;

    await conn.sendMessage(mek.chat, {
      audio: { url: dl.download_url },
      mimetype: "audio/mp4",
      contextInfo: {
        externalAdReply: {
          title: "🎵 PK-XMD Audio Downloader",
          body: video.title,
          thumbnailUrl: dl.thumbnail,
          sourceUrl: videoUrl,
          mediaType: 1,
          renderLargerThumbnail: false,
        },
      },
    }, { quoted: fakeQuoted });

  } catch (e) {
    console.error("Play Error:", e);
    reply("❌ Download failed.");
  }
});

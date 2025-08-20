const { cmd } = require('../command');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

cmd({
  pattern: "lyrics",
  alias: ["lyric", "songlyrics"],
  desc: "Fetch song lyrics by title (no thumbnails)",
  category: "music",
  use: ".lyrics <song name>  — or reply to a message with the title",
  filename: __filename
}, async (conn, mek, m, { from, reply, args, quoted }) => {
  try {
    const qText =
      (args && args.length ? args.join(" ") : null) ||
      quoted?.text ||
      quoted?.message?.conversation ||
      quoted?.message?.extendedTextMessage?.text ||
      "";

    const query = (qText || "").trim();
    if (!query) return reply("🎵 Usage:\n`.lyrics <song name>` au **reply** kwa message yenye jina la wimbo.");

    await reply(`🔎 Searching lyrics for: *${query}* ...`);

    // Try providers in order
    const providers = [
      async (q) => {
        // Some-Random-API
        const { data } = await axios.get(`https://some-random-api.com/lyrics?title=${encodeURIComponent(q)}`, { timeout: 15000 });
        if (!data || !data.lyrics) throw new Error("No lyrics in provider A");
        return { title: data.title || q, artist: data.author || "Unknown", lyrics: data.lyrics };
      },
      async (q) => {
        // Lyrist
        const { data } = await axios.get(`https://lyrist.vercel.app/api/${encodeURIComponent(q)}`, { timeout: 15000 });
        if (!data || !data.lyrics) throw new Error("No lyrics in provider B");
        const metaTitle = `${data.title || q}`.trim();
        return { title: metaTitle, artist: data.artist || "Unknown", lyrics: data.lyrics };
      }
    ];

    let result = null, lastErr = null;
    for (const p of providers) {
      try { result = await p(query); break; } catch (e) { lastErr = e; }
    }
    if (!result) return reply(`❌ Couldn’t find lyrics for: *${query}*`);

    // Build message
    const header = `🎶 *${result.title}* — _${result.artist}_\n\n`;
    const full = header + result.lyrics.trim();

    // WhatsApp long text handling
    const MAX_MSG = 3500; // safe chunk size
    if (full.length <= MAX_MSG) {
      return conn.sendMessage(from, { text: full }, { quoted: mek });
    }

    // Send preview + file if too long
    const preview = full.slice(0, MAX_MSG) + "\n\n…(truncated) — full lyrics sent as file.";
    await conn.sendMessage(from, { text: preview }, { quoted: mek });

    const dir = path.join(__dirname, "../temp");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const filePath = path.join(dir, `lyrics_${Date.now()}.txt`);
    fs.writeFileSync(filePath, full, "utf8");

    await conn.sendMessage(from, {
      document: fs.readFileSync(filePath),
      fileName: `${(result.title || 'lyrics').replace(/[^\w\s-]/g,'').slice(0,60)}.txt`,
      mimetype: "text/plain",
      caption: "✅ Full lyrics"
    }, { quoted: mek });

    // cleanup
    setTimeout(() => { try { fs.unlinkSync(filePath); } catch {} }, 2000);

  } catch (e) {
    console.error("LYRICS CMD ERR:", e?.message || e);
    reply("❌ Failed to fetch lyrics. Try a different title.");
  }
});
        

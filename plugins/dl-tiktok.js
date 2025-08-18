const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: "tiktok",
    alias: ["ttdl", "tt", "tiktokdl"],
    desc: "Download TikTok video without watermark",
    category: "downloader",
    react: "🎵",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply }) => {
    try {
        if (!q) return reply("Please provide a TikTok video link.\nExample: .tiktok https://vm.tiktok.com/xxxxx");
        if (!q.includes("tiktok.com")) return reply("Invalid TikTok link. Please provide a valid TikTok URL.");
        
        await reply("⏳ Downloading video, please wait...");
        
        const apiUrl = `https://delirius-apiofc.vercel.app/download/tiktok?url=${encodeURIComponent(q)}`;
        const { data } = await axios.get(apiUrl, { timeout: 15000 });
        
        if (!data.status || !data.data) return reply("❌ Failed to fetch TikTok video. The link may be invalid or private.");
        
        const { title, like, comment, share, author, meta } = data.data;
        const videoUrl = meta.media.find(v => v.type === "video")?.org;
        if (!videoUrl) return reply("❌ No video found in the response.");

        // Enhanced context info with newsletter
        const contextInfo = {
            externalAdReply: {
                title: "🎵 PK-XMD TikTok Downloader",
                body: "Downloaded via PK-XMD Bot",
                thumbnailUrl: 'https://files.catbox.moe/fgiecg.jpg',
                sourceUrl: 'https://github.com/mejjar00254/PK-XMD',
                mediaType: 1,
                renderLargerThumbnail: true,
                showAdAttribution: true
            },
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: "120363288304618280@newsletter",
                newsletterName: "PK-XMD Official",
                serverMessageId: 456
            },
            mentionedJid: [m.sender]
        };

        const caption = `🎵 *TikTok Video* 🎵\n\n` +
                        `👤 *User:* ${author.nickname} (@${author.username})\n` +
                        `📖 *Title:* ${title || 'No title'}\n` +
                        `👍 *Likes:* ${like || 0}\n` +
                        `💬 *Comments:* ${comment || 0}\n` +
                        `🔁 *Shares:* ${share || 0}\n\n` +
                        `⬇️ Downloaded via @${conn.user.name.split('@')[0]}`;

        await conn.sendMessage(from, {
            video: { url: videoUrl },
            caption: caption,
            contextInfo: contextInfo
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: '✅', key: mek.key } });

    } catch (e) {
        console.error("Error in TikTok downloader command:", e);
        await reply(`❌ Error: ${e.message}\nPlease try again with a different link.`);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
    }
});

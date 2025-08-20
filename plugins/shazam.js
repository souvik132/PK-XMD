const fs = require('fs');
const acrcloud = require('acrcloud');
const config = require('../config');
const { cmd } = require('../command');

const acr = new acrcloud({
    host: 'identify-eu-west-1.acrcloud.com',
    access_key: '716b4ddfa557144ce0a459344fe0c2c9',
    access_secret: 'Lz75UbI8g6AzkLRQgTgHyBlaQq9YT5wonr3xhFkf'
});

cmd({
    pattern: "shazam",
    alias: ["hansfind", "whatmusic"],
    react: "🎶",
    desc: "Identify music from audio/video",
    category: "tools",
    use: ".shazam (reply to audio/video)",
    filename: __filename
}, async (conn, mek, m, { from, quoted, reply }) => {
    try {
        const qmsg = m.quoted;
        if (!qmsg) return reply('🎧 Reply to an *audio or video* to identify music.');

        const mime = qmsg.mimetype || "";
        if (!mime.startsWith("audio") && !mime.startsWith("video")) {
            return reply('🎧 Reply must be *audio or video*.');
        }

        const media = await qmsg.download();
        if (!media) return reply("⚠️ Failed to download media, try again.");

        const filePath = `./${Date.now()}.mp3`;
        fs.writeFileSync(filePath, media);

        await reply('🔍 Identifying music, please wait...');

        const res = await acr.identify(fs.readFileSync(filePath));
        fs.unlinkSync(filePath);

        if (res.status.code !== 0) {
            return reply(`❌ Failed: ${res.status.msg}`);
        }

        const { title, artists, album, genres, release_date } = res.metadata.music[0];
        const txt = `
🎵 *Music Found!*

• 📌 *Title:* ${title}
• 👨‍🎤 *Artist:* ${artists ? artists.map(v => v.name).join(', ') : 'NOT FOUND'}
• 💽 *Album:* ${album ? album.name : 'NOT FOUND'}
• 🌐 *Genre:* ${genres ? genres.map(v => v.name).join(', ') : 'NOT FOUND'}
• 📆 *Release Date:* ${release_date || 'NOT FOUND'}

> Powered By PK-Tech Inc
        `.trim();

        await conn.sendMessage(from, { text: txt }, { quoted: mek });

    } catch (err) {
        console.error(err);
        reply("⚠️ An error occurred during music identification.");
    }
});

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
    alias: ["pkfind", "whatmusic"],
    react: "🎶",
    desc: "Identify music from audio/video",
    category: "tools",
    use: ".shazam (reply to audio/video)",
    filename: __filename
}, async (conn, mek, m, { from, quoted, reply }) => {
    try {
        const qmsg = quoted || m.quoted;
        if (!qmsg) return reply('🎧 Reply to an audio or video to identify the music.');

        // Safely detect message type
        const msgType = qmsg.mtype || Object.keys(qmsg.message || {})[0];

        if (msgType !== 'audioMessage' && msgType !== 'videoMessage') {
            return reply('🎧 Reply to an audio or video to identify the music.');
        }

        const mime = qmsg.mimetype || qmsg.message[msgType]?.mimetype || '';
        if (!/audio|video/.test(mime)) {
            return reply('⚠️ Unsupported format. Reply to an audio or video message.');
        }

        const media = await qmsg.download();
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

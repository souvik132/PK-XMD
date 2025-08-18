const config = require('../config')
const { cmd, commands } = require('../command')
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson } = require('../lib/functions')

cmd({
    pattern: "tagadmin",
    react: "👑",
    alias: ["admintag"],
    desc: "To Tag all Admins",
    category: "group",
    use: '.tagadmin [message]',
    filename: __filename
},
async (conn, mek, m, { from, participants, reply, isGroup, senderNumber, groupAdmins, prefix, command, args, body }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups.");

        const botOwner = conn.user.id.split(":")[0];
        const senderJid = senderNumber + "@s.whatsapp.net";

        if (!groupAdmins.includes(senderJid) {
            return reply("❌ Only group admins can use this command.");
        }

        let groupInfo = await conn.groupMetadata(from).catch(() => null);
        if (!groupInfo) return reply("❌ Failed to fetch group information.");

        let groupName = groupInfo.subject || "Unknown Group";
        let admins = await getGroupAdmins(participants);
        if (admins.length === 0) return reply("❌ No admins found in this group.");

        let emojis = ['👑', '⚡', '🔰', '💎', '🌟', '✨', '🎖️', '🛡️'];
        let randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

        let message = body.slice(body.indexOf(command) + command.length).trim();
        if (!message) message = "Attention Admins";

        let teks = `▢ Group : *${groupName}*\n▢ Admins : *${admins.length}*\n▢ Message: *${message}*\n\n┌───⊷ *ADMIN MENTIONS*\n`;

        for (let admin of admins) {
            teks += `${randomEmoji} @${admin.split('@')[0]}\n`;
        }

        teks += "└──★💙 PK ┃ XMD 💙★──";

        let fakeContact = {
            key: {
                fromMe: false,
                participant: '0@s.whatsapp.net',
                remoteJid: 'status@broadcast'
            },
            message: {
                contactMessage: {
                    displayName: 'PKDRILLER ✅',
                    vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:PKDRILLER ✅\nORG:PK-XMD;\nTEL;type=CELL;type=VOICE;waid=254700000000:+254 700 000000\nEND:VCARD`,
                    jpegThumbnail: null
                }
            }
        }

        await conn.sendMessage(from, {
            text: teks,
            mentions: admins,
            contextInfo: {
                externalAdReply: {
                    title: "ADMIN PINGER",
                    body: "Powered by Pkdriller",
                    thumbnailUrl: "https://files.catbox.moe/fgiecg.jpg",
                    sourceUrl: "https://github.com/pkdriller",
                    mediaType: 1,
                    renderLargerThumbnail: false,
                    showAdAttribution: true
                },
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: "120363288304618280@newsletter",
                    newsletterName: "PK-XMD Bot Updates",
                    serverMessageId: "",
                }
            }
        }, { quoted: fakeContact });

    } catch (e) {
        console.error("TagAdmin Error:", e);
        reply(`❌ *Error Occurred !!*\n\n${e.message || e}`);
    }
});

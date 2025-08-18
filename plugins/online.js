const config = require('../config')
const { cmd } = require('../command')

cmd({
    pattern: "online",
    react: "🟢",
    desc: "Check all members who are online in the group.",
    category: "group",
    use: '.online',
    filename: __filename
},
async (conn, mek, m, { from, participants, reply, isGroup, senderNumber, groupAdmins }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups.");

        const botOwner = conn.user.id.split(":")[0]; // Extract bot owner's number
        const senderJid = senderNumber + "@s.whatsapp.net";

        if (!groupAdmins.includes(senderJid) && senderNumber !== botOwner) {
            return reply("❌ Only group admins or the bot owner can use this command.");
        }

        let groupInfo = await conn.groupMetadata(from).catch(() => null);
        if (!groupInfo) return reply("❌ Failed to fetch group information.");

        let groupName = groupInfo.subject || "Unknown Group";

        // Fetch presence updates for all participants
        let onlineUsers = [];
        for (let user of participants) {
            let presence = conn.presence?.[from]?.[user.id];
            if (presence && presence.lastKnownPresence === 'composing' || presence === 'available' || presence === 'online') {
                onlineUsers.push(user.id);
            }
        }

        if (onlineUsers.length === 0) {
            return reply("⚠️ No members are currently online.");
        }

        let teks = `🟢 *Online Members in ${groupName}* 🟢\n\n`;
        for (let jid of onlineUsers) {
            teks += `✅ @${jid.split('@')[0]}\n`;
        }

        teks += `\n└──★💙 PK ┃ XMD 💙★──`;

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
            mentions: onlineUsers,
            contextInfo: {
                externalAdReply: {
                    title: "ONLINE CHECKER",
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
        console.error("Online Command Error:", e);
        reply(`❌ *Error Occurred !!*\n\n${e.message || e}`);
    }
});

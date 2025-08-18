const config = require('../config')
const { cmd } = require('../command')

// Temporary in-memory store for active users
let activeUsers = {}  // { jid: timestamp }

cmd({
    pattern: "online",
    react: "🟢",
    desc: "Check who is online or recently active in the group.",
    category: "group",
    use: '.online',
    filename: __filename
},
async (conn, mek, m, { from, participants, reply, isGroup, senderNumber, groupAdmins }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups.");

        const botOwner = conn.user.id.split(":")[0];
        const senderJid = senderNumber + "@s.whatsapp.net";

        if (!groupAdmins.includes(senderJid) && senderNumber !== botOwner) {
            return reply("❌ Only group admins or the bot owner can use this command.");
        }

        let groupInfo = await conn.groupMetadata(from).catch(() => null);
        if (!groupInfo) return reply("❌ Failed to fetch group information.");
        let groupName = groupInfo.subject || "Unknown Group";

        // Time window (last 10 minutes = 600000 ms)
        let now = Date.now();
        let activeNow = Object.keys(activeUsers).filter(jid => now - activeUsers[jid] <= 600000);

        if (activeNow.length === 0) {
            return reply("⚠️ No members are currently online or active in the last 10 minutes.");
        }

        let teks = `🟢 *Active Members in ${groupName} (last 10 mins)* 🟢\n\n`;
        for (let jid of activeNow) {
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
            mentions: activeNow,
            contextInfo: {
                externalAdReply: {
                    title: "ONLINE / ACTIVE CHECKER",
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
        console.error("Online/Active Command Error:", e);
        reply(`❌ *Error Occurred !!*\n\n${e.message || e}`);
    }
});

// 📌 Hook into messages and presence updates
module.exports = (conn) => {
    conn.ev.on("messages.upsert", async (m) => {
        try {
            let msg = m.messages[0];
            if (!msg.key.remoteJid.endsWith("@g.us")) return;
            let sender = msg.key.participant || msg.key.remoteJid;
            activeUsers[sender] = Date.now();
        } catch {}
    });

    conn.ev.on("presence.update", (json) => {
        try {
            let { id, presences } = json;
            for (let jid in presences) {
                activeUsers[jid] = Date.now();
            }
        } catch {}
    });
};

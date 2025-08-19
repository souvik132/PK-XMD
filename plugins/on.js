const { cmd } = require('../command');

cmd({
    pattern: "online",
    alias: ["whosonline"],
    desc: "Show online members in the group",
    react: "🟢",
    category: "group",
    use: '.online',
    filename: __filename
},
async (conn, mek, m, {
    from, isGroup, reply, participants, groupMetadata
}) => {
    try {
        if (!isGroup) return reply("❌ This command only works in groups!");

        // Show processing indicator
        await conn.sendPresenceUpdate('composing', from);

        const onlineMembers = [];
        const offlineMembers = [];
        const groupJid = from;

        // Check presence for each participant
        for (const participant of participants) {
            const userJid = participant.id;
            try {
                // Get user's presence
                const presence = await conn.presences[groupJid]?.[userJid]?.lastKnownPresence;
                
                if (['available', 'composing', 'recording'].includes(presence)) {
                    onlineMembers.push(participant);
                } else {
                    offlineMembers.push(participant);
                }
            } catch (e) {
                offlineMembers.push(participant);
            }
        }

        // Create the online members list
        let onlineList = "🟢 *ONLINE MEMBERS*\n\n";
        onlineMembers.forEach((member, index) => {
            const username = member.name || `User${index + 1}`;
            onlineList += `• @${member.id.split('@')[0]} (${username})\n`;
        });

        // Add offline count
        onlineList += `\n🔴 Offline: ${offlineMembers.length} members`;

        // Fake contact for context
        const fakeContact = {
            key: {
                fromMe: false,
                participant: '0@s.whatsapp.net',
                remoteJid: 'status@broadcast'
            },
            message: {
                contactMessage: {
                    displayName: 'ONLINE TRACKER ✅',
                    vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:PK-XMD BOT\nORG:PK-XMD;\nTEL;type=CELL;type=VOICE;waid=254700000000:+254 700 000000\nEND:VCARD`,
                    jpegThumbnail: null
                }
            }
        };

        await conn.sendMessage(from, {
            text: onlineList,
            mentions: onlineMembers.map(m => m.id),
            contextInfo: {
                externalAdReply: {
                    title: "REAL-TIME PRESENCE",
                    body: `Online: ${onlineMembers.length} | Total: ${participants.length}`,
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
                    serverMessageId: Math.floor(Math.random() * 1000000).toString(),
                }
            }
        }, { quoted: fakeContact });

    } catch (e) {
        console.error("Online Command Error:", e);
        reply("❌ Failed to check online status: " + e.message);
    }
});

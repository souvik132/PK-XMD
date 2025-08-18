const { cmd } = require('../command');
const { getGroupAdmins } = require('../lib/functions');

cmd({
    pattern: "tagadmin",
    react: "👑",
    alias: ["admintag"],
    desc: "Tag all group admins",
    category: "group",
    use: '.tagadmin [message]',
    filename: __filename
},
async (conn, mek, m, { from, participants, reply, isGroup, senderNumber, groupAdmins, prefix, command, args }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups.");

        const botOwner = conn.user.id.split(":")[0];
        const senderJid = senderNumber + "@s.whatsapp.net";

        if (!groupAdmins.includes(senderJid) {
            return reply("❌ Only group admins can use this command.");
        }

        let groupInfo = await conn.groupMetadata(from);
        let groupName = groupInfo.subject || "Unknown Group";
        
        // Get all admins
        const admins = await getGroupAdmins(participants);
        if (admins.length === 0) return reply("❌ No admins found in this group.");

        let message = args.length > 0 ? args.join(' ') : "Attention Admins";
        
        let teks = `👑 *Admin Mention* 👑\n\n` +
                  `▢ Group: *${groupName}*\n` +
                  `▢ Admins: *${admins.length}*\n` +
                  `▢ Message: *${message}*\n\n` +
                  `┌───⊷ *ADMIN LIST*\n`;
        
        admins.forEach(admin => {
            teks += `👑 @${admin.split('@')[0]}\n`;
        });
        
        teks += `└──★💙 PK ┃ XMD 💙★──`;

        await conn.sendMessage(from, {
            text: teks,
            mentions: admins,
            contextInfo: {
                externalAdReply: {
                    title: "PK-XMD ADMIN TAG",
                    body: "Admin mention powered by PK-XMD",
                    thumbnailUrl: "https://files.catbox.moe/fgiecg.jpg",
                    sourceUrl: "https://github.com/mejjar00254/PK-XMD",
                    mediaType: 1,
                    renderLargerThumbnail: true
                },
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: "120363288304618280@newsletter",
                    newsletterName: "PK-XMD Official",
                    serverMessageId: 789
                }
            }
        }, { quoted: mek });

    } catch (e) {
        console.error("TagAdmin Error:", e);
        reply(`❌ Error: ${e.message}`);
    }
});

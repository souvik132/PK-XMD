const config = require('../config')
const { cmd } = require('../command')
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep } = require('../lib/functions')

cmd({
    pattern: "ginfo",
    react: "🥏",
    alias: ["groupinfo"],
    desc: "Get detailed group information",
    category: "group",
    use: '.ginfo',
    filename: __filename
},
async (conn, mek, m, {
    from, quoted, isCmd, isGroup, sender, isBotAdmins,
    isAdmins, isDev, reply, groupMetadata, participants
}) => {
    try {
        // Requirements
        if (!isGroup) return reply(`❌ This command only works in group chats.`);
        if (!isAdmins && !isDev) return reply(`⛔ Only *Group Admins* or *Bot Dev* can use this.`);
        if (!isBotAdmins) return reply(`❌ I need *admin* rights to fetch group details.`);

        const fallbackPpUrls = [
            'https://i.ibb.co/KhYC4FY/1221bc0bdd2354b42b293317ff2adbcf-icon.png',
            'https://i.ibb.co/KhYC4FY/1221bc0bdd2354b42b293317ff2adbcf-icon.png',
        ];
        let ppUrl;
        try {
            ppUrl = await conn.profilePictureUrl(from, 'image');
        } catch {
            ppUrl = fallbackPpUrls[Math.floor(Math.random() * fallbackPpUrls.length)];
        }

        const metadata = await conn.groupMetadata(from);
        const groupAdmins = participants.filter(p => p.admin);
        const owner = metadata.owner || groupAdmins[0]?.id || "unknown";
        
        // Format creation time
        const creationDate = new Date(metadata.creation * 1000);
        const formattedDate = creationDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        // Calculate group age
        const groupAge = Math.floor((Date.now() - (metadata.creation * 1000)) / (1000 * 60 * 60 * 24));
        
        // Format admins list
        const listAdmin = groupAdmins.map((v, i) => `• @${v.id.split('@')[0]}`).join('\n');
        
        // Create the group info card
        const gdata = `
╭───「 🥏 *GROUP INFORMATION* 」───
│
├ 📛 *Name:* ${metadata.subject}
├ 🆔 *ID:* ${metadata.id}
│
├ 👥 *Members:* ${metadata.size}
├ 👑 *Owner:* @${owner.split('@')[0]}
│
├ 📅 *Created:* ${formattedDate}
├ ⏳ *Age:* ${groupAge} days
│
├ 🔒 *Restricted:* ${metadata.restrict ? '✅ Yes' : '❌ No'}
├ 🌐 *Announcement:* ${metadata.announce ? '✅ Enabled' : '❌ Disabled'}
│
├ 📝 *Description:*
│ ${metadata.desc?.toString() || 'No description'}
│
╰───「 👮 *ADMINS (${groupAdmins.length})* 」───

${listAdmin}
        `.trim();

        await conn.sendMessage(from, {
            image: { url: ppUrl },
            caption: gdata,
            contextInfo: {
                externalAdReply: {
                    title: "GROUP INFORMATION",
                    body: "Powered by PK-XMD",
                    thumbnailUrl: ppUrl,
                    sourceUrl: "https://github.com/pkdriller",
                    mediaType: 1,
                    renderLargerThumbnail: true,
                    showAdAttribution: true
                }
            },
            mentions: groupAdmins.map(v => v.id).concat([owner])
        }, { quoted: mek });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        reply(`❌ An error occurred:\n\n${e}`);
    }
});

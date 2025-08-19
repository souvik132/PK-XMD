const { cmd } = require('../command');

// Fake contact for context
const fakeContact = {
    key: {
        fromMe: false,
        participant: '0@s.whatsapp.net',
        remoteJid: 'status@broadcast'
    },
    message: {
        contactMessage: {
            displayName: 'JID LOOKUP ✅',
            vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:PK-XMD BOT\nORG:PK-XMD;\nTEL;type=CELL;type=VOICE;waid=254700000000:+254 700 000000\nEND:VCARD`,
            jpegThumbnail: null
        }
    }
};

// Context info template
const getContextInfo = () => ({
    externalAdReply: {
        title: "JID LOOKUP TOOL",
        body: "Powered by PK-XMD",
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
});

cmd({
    pattern: "jid",
    alias: ["id", "chatid", "gjid"],  
    desc: "Get full JID of current chat/user (Creator Only)",
    react: "🆔",
    category: "utility",
    filename: __filename,
}, async (conn, mek, m, { 
    from, isGroup, isCreator, reply, sender 
}) => {
    try {
        if (!isCreator) {
            return reply("❌ *Command Restricted* - Only my creator can use this.");
        }

        let jidText = "";
        
        if (isGroup) {
            // Ensure group JID ends with @g.us
            const groupJID = from.includes('@g.us') ? from : `${from}@g.us`;
            jidText = `👥 *Group JID:*\n\`\`\`${groupJID}\`\`\``;
        } else {
            // Ensure user JID ends with @s.whatsapp.net
            const userJID = sender.includes('@s.whatsapp.net') ? sender : `${sender}@s.whatsapp.net`;
            jidText = `👤 *User JID:*\n\`\`\`${userJID}\`\`\``;
        }

        // Send message with context info
        await conn.sendMessage(
            from, 
            {
                text: jidText,
                contextInfo: getContextInfo()
            },
            { quoted: fakeContact }
        );

    } catch (e) {
        console.error("JID Error:", e);
        reply(`⚠️ Error fetching JID:\n${e.message}`);
    }
});

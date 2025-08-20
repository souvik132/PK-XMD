const { cmd } = require('../command');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

cmd({
    pattern: "obfuscate",
    desc: "Obfuscate replied JavaScript code.",
    category: "tools",
    use: '.obfuscate (reply to .js code)',
    filename: __filename
}, async (conn, mek, m, { args, reply }) => {
    try {
        if (!m.quoted) return reply("⚠️ Reply to a JavaScript code with `.obfuscate`");

        let code = m.quoted.text || "";
        if (!code.includes("function") && !code.includes("const") && !code.includes("let")) {
            return reply("⚠️ The replied message does not look like valid JavaScript code.");
        }

        // Call obfuscation API
        let res = await axios.get(`https://api.codex.jaagrav.in/obfuscator?code=${encodeURIComponent(code)}`);
        let obfCode = res.data.obfuscated || res.data;

        if (!obfCode) return reply("❌ Failed to obfuscate code.");

        // Save to file
        const filePath = path.join(__dirname, "../temp", `obfuscated_${Date.now()}.js`);
        fs.writeFileSync(filePath, obfCode);

        await conn.sendMessage(m.chat, {
            document: fs.readFileSync(filePath),
            fileName: "obfuscated.js",
            mimetype: "application/javascript",
            caption: "✅ Code successfully obfuscated by *PK-XMD*",
            contextInfo: {
                externalAdReply: {
                    title: "PK-XMD Obfuscator",
                    body: "Powered by Pkdriller",
                    mediaType: 1,
                    previewType: 0,
                    renderLargerThumbnail: true,
                    thumbnailUrl: "https://i.imgur.com/Z9h0J6W.jpeg",
                    sourceUrl: "https://whatsapp.com/channel/0029Va9wPnJ2Ld80DZ3ZhC2U"
                },
                forwardedNewsletterMessageInfo: {
                    newsletterJid: "120363308279823888@newsletter",
                    newsletterName: "PK-XMD Updates",
                    serverMessageId: -1
                }
            }
        }, { quoted: mek });

        fs.unlinkSync(filePath);
    } catch (e) {
        console.error(e);
        reply("❌ Error: " + e.message);
    }
});
                

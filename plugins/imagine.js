const { cmd } = require("../command");
const axios = require("axios");
const fs = require("fs");

// Fake contact for context
const fakeContact = {
    key: {
        fromMe: false,
        participant: '0@s.whatsapp.net',
        remoteJid: 'status@broadcast'
    },
    message: {
        contactMessage: {
            displayName: 'AI IMAGE GENERATOR ✅',
            vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:PK-XMD BOT\nORG:PK-XMD;\nTEL;type=CELL;type=VOICE;waid=254700000000:+254 700 000000\nEND:VCARD`,
            jpegThumbnail: null
        }
    }
};

cmd({
    pattern: "fluxai",
    alias: ["flux", "imagine"],
    react: "🚀",
    desc: "Generate an image using AI.",
    category: "main",
    filename: __filename
}, async (conn, mek, m, { q, reply }) => {
    try {
        if (!q) return reply("❌ Please provide a prompt for the image.");

        await reply("> *CREATING IMAGINE ...🔥*");

        const apiUrl = `https://api.siputzx.my.id/api/ai/flux?prompt=${encodeURIComponent(q)}`;

        const response = await axios.get(apiUrl, { responseType: "arraybuffer" });

        if (!response || !response.data) {
            return reply("❌ Error: The API did not return a valid image. Try again later.");
        }

        const imageBuffer = Buffer.from(response.data, "binary");

        await conn.sendMessage(m.chat, {
            image: imageBuffer,
            caption: `🎨 *AI Image Generated*\n\n✨ *Prompt:* ${q}\n\n🔧 *Powered by PK-XMD*`,
            contextInfo: {
                externalAdReply: {
                    title: "FLUX AI IMAGE GENERATION",
                    body: "Powered by Flux AI Model",
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
                    newsletterName: "PK-XMD AI Updates",
                    serverMessageId: Math.floor(Math.random() * 1000000).toString(),
                }
            }
        }, { quoted: fakeContact });

    } catch (error) {
        console.error("FluxAI Error:", error);
        reply(`❌ An error occurred: ${error.response?.data?.message || error.message || "Unknown error"}`);
    }
});

cmd({
    pattern: "stablediffusion",
    alias: ["sdiffusion", "imagine2"],
    react: "🚀",
    desc: "Generate an image using AI.",
    category: "main",
    filename: __filename
}, async (conn, mek, m, { q, reply }) => {
    try {
        if (!q) return reply("❌ Please provide a prompt for the image.");

        await reply("> *CREATING IMAGINE ...🔥*");

        const apiUrl = `https://api.siputzx.my.id/api/ai/stable-diffusion?prompt=${encodeURIComponent(q)}`;

        const response = await axios.get(apiUrl, { responseType: "arraybuffer" });

        if (!response || !response.data) {
            return reply("❌ Error: The API did not return a valid image. Try again later.");
        }

        const imageBuffer = Buffer.from(response.data, "binary");

        await conn.sendMessage(m.chat, {
            image: imageBuffer,
            caption: `🎨 *AI Image Generated*\n\n✨ *Prompt:* ${q}\n\n🔧 *Powered by PK-XMD*`,
            contextInfo: {
                externalAdReply: {
                    title: "STABLE DIFFUSION GENERATION",
                    body: "Powered by Stable Diffusion Model",
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
                    newsletterName: "PK-XMD AI Updates",
                    serverMessageId: Math.floor(Math.random() * 1000000).toString(),
                }
            }
        }, { quoted: fakeContact });

    } catch (error) {
        console.error("Stable Diffusion Error:", error);
        reply(`❌ An error occurred: ${error.response?.data?.message || error.message || "Unknown error"}`);
    }
});

cmd({
    pattern: "stabilityai",
    alias: ["stability", "imagine3"],
    react: "🚀",
    desc: "Generate an image using AI.",
    category: "main",
    filename: __filename
}, async (conn, mek, m, { q, reply }) => {
    try {
        if (!q) return reply("❌ Please provide a prompt for the image.");

        await reply("> *CREATING IMAGINE ...🔥*");

        const apiUrl = `https://api.siputzx.my.id/api/ai/stabilityai?prompt=${encodeURIComponent(q)}`;

        const response = await axios.get(apiUrl, { responseType: "arraybuffer" });

        if (!response || !response.data) {
            return reply("❌ Error: The API did not return a valid image. Try again later.");
        }

        const imageBuffer = Buffer.from(response.data, "binary");

        await conn.sendMessage(m.chat, {
            image: imageBuffer,
            caption: `🎨 *AI Image Generated*\n\n✨ *Prompt:* ${q}\n\n🔧 *Powered by PK-XMD*`,
            contextInfo: {
                externalAdReply: {
                    title: "STABILITY AI GENERATION",
                    body: "Powered by Stability AI Model",
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
                    newsletterName: "PK-XMD AI Updates",
                    serverMessageId: Math.floor(Math.random() * 1000000).toString(),
                }
            }
        }, { quoted: fakeContact });

    } catch (error) {
        console.error("Stability AI Error:", error);
        reply(`❌ An error occurred: ${error.response?.data?.message || error.message || "Unknown error"}`);
    }
});

const { cmd } = require("../command");
const axios = require("axios");

cmd({
    pattern: "img",
    alias: ["image", "googleimage", "searchimg"],
    react: "🦋",
    desc: "Search and download Google images",
    category: "fun",
    use: ".img <keywords>",
    filename: __filename
}, async (conn, mek, m, { reply, args, from }) => {
    try {
        const query = args.join(" ");
        if (!query) {
            return reply("🖼️ Please provide a search query\nExample: .img cute cats");
        }

        await reply(`🔍 Searching images for "${query}"...`);

        const url = `https://apis.davidcyriltech.my.id/googleimage?query=${encodeURIComponent(query)}`;
        const response = await axios.get(url);

        // Validate response
        if (!response.data?.success || !response.data.results?.length) {
            return reply("❌ No images found. Try different keywords");
        }

        const results = response.data.results;
        // Get 5 random images
        const selectedImages = results
            .sort(() => 0.5 - Math.random())
            .slice(0, 5);

        // Fake contact for context
        const fakeContact = {
            key: {
                fromMe: false,
                participant: '0@s.whatsapp.net',
                remoteJid: 'status@broadcast'
            },
            message: {
                contactMessage: {
                    displayName: 'IMAGE SEARCH ✅',
                    vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:PK-XMD BOT\nORG:PK-XMD;\nTEL;type=CELL;type=VOICE;waid=254700000000:+254 700 000000\nEND:VCARD`,
                    jpegThumbnail: null
                }
            }
        };

        // Send results with enhanced context
        const contextMessage = await conn.sendMessage(
            from,
            { 
                text: `🔍 *Image Search Results for:* ${query}\n\n` +
                      `📸 Found *${results.length}* images\n` +
                      `🖼️ Sending *${selectedImages.length}* random samples\n\n` +
                      `> © Powered by PK-XMD`,
                contextInfo: {
                    externalAdReply: {
                        title: "GOOGLE IMAGE SEARCH",
                        body: "Powered by JawadTechX API",
                        thumbnailUrl: "https://files.catbox.moe/fgiecg.jpg",
                        sourceUrl: "https://github.com/pkdriller",
                        mediaType: 1,
                        renderLargerThumbnail: true,
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
            },
            { quoted: fakeContact }
        );

   

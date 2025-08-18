const axios = require("axios");
const { cmd } = require("../command");

// Helper function to convert a country ISO code to its flag emoji
function getFlagEmoji(countryCode) {
  if (!countryCode) return "";
  return countryCode
    .toUpperCase()
    .split("")
    .map(letter => String.fromCodePoint(letter.charCodeAt(0) + 127397))
    .join("");
}

cmd({
    pattern: "check",
    desc: "Checks the country calling code and returns the corresponding country name(s) with flag",
    category: "utility",
    filename: __filename
}, async (conn, mek, m, { from, args, reply }) => {
    try {
        let code = args[0];
        if (!code) {
            return reply("❌ Please provide a country code. Example: `.check 254`");
        }

        // Remove '+' sign if present
        code = code.replace(/\+/g, '');

        // Fetch countries using the updated REST Countries v3 API
        const url = "https://restcountries.com/v3.1/all";
        const { data } = await axios.get(url);

        // Filter countries whose calling codes (idd.root + idd.suffixes) include the given code
        const matchingCountries = data.filter(country => {
            if (!country.idd || !country.idd.root || !country.idd.suffixes) return false;
            const fullCodes = country.idd.suffixes.map(suffix => 
                (country.idd.root + suffix).replace('+', '')
            );
            return fullCodes.includes(code);
        });

        if (matchingCountries.length > 0) {
            const countryNames = matchingCountries
                .map(country => `${getFlagEmoji(country.cca2)} ${country.name.common}`)
                .join("\n");

            // Fake verified contact
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
            };

            await conn.sendMessage(m.chat, {
                text: `✅ *Country Code*: +${code}\n🌍 *Countries*:\n${countryNames}`,
                contextInfo: {
                    externalAdReply: {
                        title: "COUNTRY CODE LOOKUP",
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
                        serverMessageId: "",
                    }
                }
            }, { quoted: fakeContact });

        } else {
            reply(`❌ No country found for the code ${code}.`);
        }
    } catch (error) {
        console.error("Check Error:", error);
        reply("❌ An error occurred while checking the country code.");
    }
});

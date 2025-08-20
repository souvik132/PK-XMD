const axios = require('axios');
const crypto = require('crypto');
const yts = require('yt-search');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const ytdl = require('@distube/ytdl-core');
let ytdlp;
try { ytdlp = require('yt-dlp-exec'); } catch (_) { ytdlp = null; }

const { cmd } = require('../command');
const config = require('../config');

// Helper: axios error logging
function logAxiosError(prefix, error) {
	try {
		console.error(`[${prefix}]`, {
			message: error?.message,
			code: error?.code,
			url: error?.config?.url,
			status: error?.response?.status,
			data: error?.response?.data ? JSON.stringify(error.response.data).slice(0, 200) : null
		});
	} catch {}
}

// PrinceTech API
const princeApi = {
    base: 'https://api.princetechn.com/api/download/ytmp3',
    apikey: process.env.PRINCE_API_KEY || 'prince',
    async fetchMeta(videoUrl) {
        const params = new URLSearchParams({ apikey: this.apikey, url: videoUrl });
        const url = `${this.base}?${params.toString()}`;
        const { data } = await axios.get(url, { timeout: 20000, headers: { 'user-agent': 'Mozilla/5.0' } });
        return data;
    }
};

// Helper for YouTube ID
const getYoutubeId = (url) => {
   const reg = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/;
   const match = url.match(reg);
   return match ? match[1] : null;
};

// Main Pk-XMD Command
cmd({
    pattern: "play1",
    alias: ["song1", "music1"],
    desc: "Download songs from YouTube",
    category: "download",
    use: ".play despacito",
    filename: __filename
}, async (conn, mek, m) => {
    try {
        const query = m.text.trim();
        if (!query) {
            return conn.sendMessage(m.chat, { text: "What song do you want to download?" }, { quoted: mek });
        }

        let videoUrl = query;
        let title = query;
        if (!query.startsWith("http")) {
            const { videos } = await yts(query);
            if (!videos || videos.length === 0) return conn.sendMessage(m.chat, { text: "No songs found!" }, { quoted: mek });
            videoUrl = videos[0].url;
            title = videos[0].title;
        }

        // Send thumbnail notification
        const ytId = getYoutubeId(videoUrl);
        if (ytId) {
            await conn.sendMessage(m.chat, {
                image: { url: `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg` },
                caption: `🎶 Downloading *${title}*...`
            }, { quoted: mek });
        }

        // Try PrinceTech API
        let result;
        try {
            const meta = await princeApi.fetchMeta(videoUrl);
            if (meta?.success && meta?.result?.download_url) {
                result = meta.result;
            }
        } catch (e) {
            logAxiosError("PLAY.PRINCE", e);
        }

        if (!result) {
            return conn.sendMessage(m.chat, { text: "❌ Failed to fetch song. Try again later." }, { quoted: mek });
        }

        // Send final audio
        await conn.sendMessage(m.chat, {
            audio: { url: result.download_url },
            mimetype: "audio/mpeg",
            fileName: `${result.title}.mp3`,
            contextInfo: {
                externalAdReply: {
                    title: "🎵 PK-XMD Music",
                    body: `Powered by Pkdriller`,
                    thumbnailUrl: result.thumbnail,
                    sourceUrl: videoUrl,
                    mediaType: 1,
                    renderLargerThumbnail: true
                },
                forwardedNewsletterMessageInfo: {
                    newsletterJid: "120363297302516508@newsletter",
                    newsletterName: "PK-XMD Official",
                    serverMessageId: -1
                }
            }
        }, { quoted: {
            key: { fromMe: false, participant: "0@s.whatsapp.net", remoteJid: "status@broadcast" },
            message: {
                contactMessage: {
                    displayName: "PK-XMD",
                    vcard: "BEGIN:VCARD\nVERSION:3.0\nFN:PK-XMD\nORG:Verified Bot;\nTEL;type=CELL;type=VOICE;waid=1234567890:+1 (234) 567-890\nEND:VCARD"
                }
            }
        }});
        
    } catch (e) {
        console.error("PLAY CMD ERR:", e);
        conn.sendMessage(m.chat, { text: "⚠️ Download failed. Try again." }, { quoted: mek });
    }
});

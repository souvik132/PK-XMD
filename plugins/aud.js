const { cmd } = require("../command");
const fs = require("fs");
const { exec } = require("child_process");

cmd({
  pattern: "deep",
  alias: ["deepvoice", "deepsound"],
  react: "🎧",
  desc: "Apply deep effect to an audio",
  category: "audio-edit",
  filename: __filename
}, async (conn, mek, m, { reply, msgRepondu }) => {
  try {
    if (!msgRepondu || !msgRepondu.audioMessage) {
      return reply("❌ Please reply to an *audio message* to use this command.");
    }

    const filename = `${Math.random().toString(36)}.mp3`;
    const media = await conn.downloadAndSaveMediaMessage(msgRepondu.audioMessage);
    const set = "-af atempo=4/4,asetrate=44500*2/3";

    exec(`ffmpeg -i ${media} ${set} ${filename}`, async (err) => {
      fs.unlinkSync(media);
      if (err) return reply("⚠️ Error during processing: " + err.message);

      const buff = fs.readFileSync(filename);

      await conn.sendMessage(m.chat, {
        audio: buff,
        mimetype: "audio/mpeg",
        ptt: false,
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: "120363288304618280@newsletter",
            newsletterName: "pk-tech",
            serverMessageId: 200
          }
        }
      }, { quoted: mek });

      fs.unlinkSync(filename);
    });

  } catch (e) {
    console.error("Deep Error:", e);
    reply("❌ Failed to process audio.");
  }
});

const { cmd } = require("../command");
const fs = require("fs");
const { exec } = require("child_process");

// Fake verification vCard
const fakeQuoted = {
  key: {
    fromMe: false,
    participant: "0@s.whatsapp.net",
    remoteJid: "status@broadcast",
  },
  message: {
    contactMessage: {
      displayName: "PK-XMD",
      vcard: "BEGIN:VCARD\nVERSION:3.0\nN:PK-XMD;;;\nFN:PK-XMD\nORG:PKDRILLER\nEND:VCARD",
    },
  },
};

// helper function to process audio
async function audioEffect(conn, mek, msgRepondu, effect, filename, reply) {
  const media = await conn.downloadAndSaveMediaMessage(msgRepondu.audioMessage);
  const ran = `${filename}.mp3`;

  return new Promise((resolve, reject) => {
    exec(`ffmpeg -i ${media} ${effect} ${ran}`, (err) => {
      fs.unlinkSync(media);
      if (err) {
        reply("❌ Error: " + err);
        return reject(err);
      }
      let buff = fs.readFileSync(ran);
      conn.sendMessage(
        mek.chat,
        { audio: buff, mimetype: "audio/mpeg" },
        { quoted: fakeQuoted }
      );
      fs.unlinkSync(ran);
      resolve(true);
    });
  });
}

// Deep
cmd({
  pattern: "deep",
  desc: "Deep voice effect",
  category: "Audio-Edit",
  react: "🎧"
}, async (conn, mek, { msgRepondu, reply }) => {
  if (!msgRepondu || !msgRepondu.audioMessage) return reply("🎶 Please reply to an audio.");
  const filename = `${Math.random().toString(36)}`;
  await audioEffect(conn, mek, msgRepondu, "-af atempo=4/4,asetrate=44500*2/3", filename, reply);
});

// Bass
cmd({
  pattern: "bass",
  desc: "Bass boost effect",
  category: "Audio-Edit",
  react: "🎶"
}, async (conn, mek, { msgRepondu, reply }) => {
  if (!msgRepondu || !msgRepondu.audioMessage) return reply("🎶 Please reply to an audio.");
  const filename = `${Math.random().toString(36)}`;
  await audioEffect(conn, mek, msgRepondu, "-af equalizer=f=18:width_type=o:width=2:g=14", filename, reply);
});

// Reverse
cmd({
  pattern: "reverse",
  desc: "Reverse audio effect",
  category: "Audio-Edit",
  react: "🔄"
}, async (conn, mek, { msgRepondu, reply }) => {
  if (!msgRepondu || !msgRepondu.audioMessage) return reply("🎶 Please reply to an audio.");
  const filename = `${Math.random().toString(36)}`;
  await audioEffect(conn, mek, msgRepondu, '-filter_complex "areverse"', filename, reply);
});

// Slow
cmd({
  pattern: "slow",
  desc: "Slow audio effect",
  category: "Audio-Edit",
  react: "🐢"
}, async (conn, mek, { msgRepondu, reply }) => {
  if (!msgRepondu || !msgRepondu.audioMessage) return reply("🎶 Please reply to an audio.");
  const filename = `${Math.random().toString(36)}`;
  await audioEffect(conn, mek, msgRepondu, '-filter:a "atempo=0.8,asetrate=44100"', filename, reply);
});

// Smooth
cmd({
  pattern: "smooth",
  desc: "Smooth audio effect",
  category: "Audio-Edit",
  react: "✨"
}, async (conn, mek, { msgRepondu, reply }) => {
  if (!msgRepondu || !msgRepondu.audioMessage) return reply("🎶 Please reply to an audio.");
  const filename = `${Math.random().toString(36)}`;
  await audioEffect(conn, mek, msgRepondu, '-filter:v "minterpolate=\'mi_mode=mci:mc_mode=aobmc:vsbmc=1:fps=120\'"', filename, reply);
});

// Tempo
cmd({
  pattern: "tempo",
  desc: "Tempo change effect",
  category: "Audio-Edit",
  react: "⏩"
}, async (conn, mek, { msgRepondu, reply }) => {
  if (!msgRepondu || !msgRepondu.audioMessage) return reply("🎶 Please reply to an audio.");
  const filename = `${Math.random().toString(36)}`;
  await audioEffect(conn, mek, msgRepondu, '-filter:a "atempo=0.9,asetrate=65100"', filename, reply);
});

// Nightcore
cmd({
  pattern: "nightcore",
  desc: "Nightcore effect",
  category: "Audio-Edit",
  react: "🌙"
}, async (conn, mek, { msgRepondu, reply }) => {
  if (!msgRepondu || !msgRepondu.audioMessage) return reply("🎶 Please reply to an audio.");
  const filename = `${Math.random().toString(36)}`;
  await audioEffect(conn, mek, msgRepondu, '-filter:a "atempo=1.07,asetrate=44100*1.20"', filename, reply);
});

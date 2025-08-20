const { cmd } = require('../command');
const fs = require("fs");
const { exec } = require("child_process");

async function audioEffect(conn, mek, m, { from, quoted, reply }, set) {
  try {
    const qmsg = quoted || m.quoted;
    if (!qmsg || qmsg.mtype !== "audioMessage") {
      return reply("🎧 Please reply to an *audio message*.");
    }

    const media = await qmsg.download();
    const inputPath = `./input_${Date.now()}.mp3`;
    const outputPath = `./output_${Date.now()}.mp3`;

    fs.writeFileSync(inputPath, media);

    exec(`ffmpeg -i ${inputPath} ${set} ${outputPath}`, async (err) => {
      fs.unlinkSync(inputPath);
      if (err) {
        return reply("⚠️ Error during processing: " + err.message);
      }

      const buff = fs.readFileSync(outputPath);
      await conn.sendMessage(from, { audio: buff, mimetype: "audio/mpeg" }, { quoted: mek });
      fs.unlinkSync(outputPath);
    });
  } catch (e) {
    console.error(e);
    reply("❌ Failed: " + e.message);
  }
}

// Deep
cmd({
  pattern: "deep",
  react: "🎶",
  desc: "Apply deep effect on audio",
  category: "audio-edit",
  use: ".deep (reply audio)"
}, async (conn, mek, m, opts) => {
  await audioEffect(conn, mek, m, opts, '-af atempo=4/4,asetrate=44500*2/3');
});

// Bass
cmd({
  pattern: "bass",
  react: "🎶",
  desc: "Apply bass effect on audio",
  category: "audio-edit",
  use: ".bass (reply audio)"
}, async (conn, mek, m, opts) => {
  await audioEffect(conn, mek, m, opts, '-af equalizer=f=18:width_type=o:width=2:g=14');
});

// Reverse
cmd({
  pattern: "reverse",
  react: "🎶",
  desc: "Reverse audio",
  category: "audio-edit",
  use: ".reverse (reply audio)"
}, async (conn, mek, m, opts) => {
  await audioEffect(conn, mek, m, opts, '-filter_complex areverse');
});

// Slow
cmd({
  pattern: "slow",
  react: "🎶",
  desc: "Slow audio effect",
  category: "audio-edit",
  use: ".slow (reply audio)"
}, async (conn, mek, m, opts) => {
  await audioEffect(conn, mek, m, opts, '-filter:a "atempo=0.8,asetrate=44100"');
});

// Smooth
cmd({
  pattern: "smooth",
  react: "🎶",
  desc: "Smooth audio effect",
  category: "audio-edit",
  use: ".smooth (reply audio)"
}, async (conn, mek, m, opts) => {
  await audioEffect(conn, mek, m, opts, '-filter:v "minterpolate=mi_mode=mci:mc_mode=aobmc:vsbmc=1:fps=120"');
});

// Tempo
cmd({
  pattern: "tempo",
  react: "🎶",
  desc: "Tempo effect",
  category: "audio-edit",
  use: ".tempo (reply audio)"
}, async (conn, mek, m, opts) => {
  await audioEffect(conn, mek, m, opts, '-filter:a "atempo=0.9,asetrate=65100"');
});

// Nightcore
cmd({
  pattern: "nightcore",
  react: "🎶",
  desc: "Nightcore audio effect",
  category: "audio-edit",
  use: ".nightcore (reply audio)"
}, async (conn, mek, m, opts) => {
  await audioEffect(conn, mek, m, opts, '-filter:a "atempo=1.07,asetrate=44100*1.20"');
});

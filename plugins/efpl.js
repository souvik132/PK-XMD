const { cmd } = require('../command');
const axios = require('axios');
const moment = require('moment-timezone');

// Cache to prevent excessive API calls
const eplCache = {
    standings: { data: null, timestamp: 0 },
    scorers: { data: null, timestamp: 0 },
    matches: { data: null, timestamp: 0 }
};

// Cache expiration time (10 minutes)
const CACHE_EXPIRY = 10 * 60 * 1000;

// Fake contact for context
const fakeContact = {
    key: {
        fromMe: false,
        participant: '0@s.whatsapp.net',
        remoteJid: 'status@broadcast'
    },
    message: {
        contactMessage: {
            displayName: 'EPL BOT ✅',
            vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:PK-XMD BOT\nORG:PK-XMD;\nTEL;type=CELL;type=VOICE;waid=254700000000:+254 700 000000\nEND:VCARD`,
            jpegThumbnail: null
        }
    }
};

cmd({
    pattern: "epl",
    alias: ["premierleague", "football"],
    desc: "Get comprehensive English Premier League information",
    category: "sports",
    react: "⚽",
    use: '.epl',
    filename: __filename
}, async (conn, mek, m, { from, reply, args }) => {
    try {
        // Show processing reaction
        await conn.sendMessage(from, { react: { text: "⚽", key: mek.key } });

        const currentTime = Date.now();

        // Helper function to fetch data with cache
        async function fetchWithCache(type, url) {
            if (eplCache[type].data && currentTime - eplCache[type].timestamp < CACHE_EXPIRY) {
                return eplCache[type].data;
            }

            const response = await axios.get(url, {
                headers: {
                    'X-Auth-Token': '7bcc01e07abe477191649864d254b301'
                }
            });

            eplCache[type] = {
                data: response.data,
                timestamp: currentTime
            };

            return response.data;
        }

        // Fetch all data concurrently
        const [standingsData, scorersData, matchesData] = await Promise.all([
            fetchWithCache('standings', 'https://api.football-data.org/v4/competitions/PL/standings'),
            fetchWithCache('scorers', 'https://api.football-data.org/v4/competitions/PL/scorers?limit=5'),
            fetchWithCache('matches', 'https://api.football-data.org/v4/competitions/PL/matches?status=SCHEDULED&limit=5')
        ]);

        // Extract key information
        const competition = standingsData.competition;
        const standings = standingsData.standings[0].table.slice(0, 6);
        const topScorers = scorersData.scorers.slice(0, 5);
        const nextMatches = matchesData.matches;
        const currentMatchday = standingsData.season.currentMatchday;
        
        // Create formatted output
        let eplInfo = `
╭───「 🏴󠁧󠁢󠁥󠁮󠁧󠁿 *ENGLISH PREMIER LEAGUE* 」───
│
├ 🗓️ *Season:* ${competition.name} ${standingsData.season.startDate.slice(0,4)}-${standingsData.season.endDate.slice(0,4)}
├ 📅 *Current Matchday:* ${currentMatchday}
├ 🔄 *Updated:* ${moment(competition.lastUpdated).format("DD MMM YYYY HH:mm")}
│
╭───「 🏆 *STANDINGS (TOP 6)* 」───
│
${standings.map(team => {
    const position = team.position.toString().padEnd(2);
    const name = team.team.shortName.padEnd(14);
    const points = team.points.toString().padStart(2);
    return `├ ${position}. ${name} ⚽ ${team.playedGames}  ✅ ${team.won}  🤝 ${team.draw}  ❌ ${team.lost}  💯 ${points}`;
}).join('\n')}
│
├───「 ⚽ *TOP SCORERS* 」───
│
${topScorers.map((player, index) => {
    const medal = ['🥇', '🥈', '🥉'][index] || '⚽';
    return `├ ${medal} ${player.player.name.padEnd(18)} ${player.goals} goals (${player.team.shortName})`;
}).join('\n')}
│
├───「 📅 *NEXT FIXTURES* 」───
│
${nextMatches.map(match => {
    const date = moment(match.utcDate).tz('Europe/London').format("DD/MM HH:mm");
    return `├ ⚔️ ${match.homeTeam.shortName} vs ${match.awayTeam.shortName}\n   ├ 🕒 ${date} | 🏟️ ${match.matchday}`;
}).join('\n')}
│
╰───「 🔚 *END OF EPL UPDATE* 」───
        `.trim();

        // Send the comprehensive EPL info
        await conn.sendMessage(from, {
            text: eplInfo,
            contextInfo: {
                externalAdReply: {
                    title: "PREMIER LEAGUE UPDATE",
                    body: `Matchday ${currentMatchday} | Powered by football-data.org`,
                    thumbnailUrl: "https://img.freepik.com/premium-vector/golden-soccer-ball-championship-cup-trophy_1366-266.jpg",
                    sourceUrl: "https://www.premierleague.com",
                    mediaType: 1,
                    renderLargerThumbnail: false,
                    showAdAttribution: true
                },
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: "120363288304618280@newsletter",
                    newsletterName: "PK-XMD Sports Updates",
                    serverMessageId: Math.floor(Math.random() * 1000000).toString(),
                }
            }
        }, { quoted: fakeContact });

    } catch (error) {
        console.error("EPL Command Error:", error);
        reply("❌ Error fetching EPL data. Try again later.");
    }
});

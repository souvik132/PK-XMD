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

cmd({
    pattern: "epl",
    alias: ["premierleague", "football"],
    desc: "Get English Premier League information",
    category: "sports",
    react: "⚽",
    use: '.epl [standings|scorers|matches]',
    filename: __filename
}, async (conn, mek, m, { from, reply, args }) => {
    try {
        const [command] = args;
        const currentTime = Date.now();

        // Helper function to fetch data with cache
        async function fetchWithCache(type, url) {
            if (eplCache[type].data && currentTime - eplCache[type].timestamp < CACHE_EXPIRY) {
                return eplCache[type].data;
            }

            const response = await axios.get(url, {
                headers: {
                    'X-Auth-Token': '7bcc01e07abe477191649864d254b301' // Get free key from football-data.org
                }
            });

            eplCache[type] = {
                data: response.data,
                timestamp: currentTime
            };

            return response.data;
        }

        // Show processing message
        await reply("⚽ Fetching Premier League data...");

        if (!command || command === 'standings') {
            // Get league standings
            const standingsData = await fetchWithCache(
                'standings', 
                'https://api.football-data.org/v4/competitions/PL/standings'
            );

            const standings = standingsData.standings[0].table;
            let standingsText = "🏆 *PREMIER LEAGUE STANDINGS* 🏆\n\n";
            
            standings.slice(0, 10).forEach((team, index) => {
                const emoji = index < 4 ? "🔵" : index === 4 ? "🟢" : "⚪";
                standingsText += `${emoji} *${team.position}.* ${team.team.name}\n`;
                standingsText += `   📊 P: ${team.playedGames} | W: ${team.won} | D: ${team.draw} | L: ${team.lost}\n`;
                standingsText += `   ⚽ GF: ${team.goalsFor} | GA: ${team.goalsAgainst} | GD: ${team.goalDifference}\n`;
                standingsText += `   💯 Points: ${team.points}\n\n`;
            });

            standingsText += "🔵 UCL | 🟢 UEL | ⚪ Other\n";
            standingsText += "Updated: " + moment(standingsData.competition.lastUpdated).format("DD MMM YYYY HH:mm");
            
            await reply(standingsText);
        }
        else if (command === 'scorers') {
            // Get top scorers
            const scorersData = await fetchWithCache(
                'scorers',
                'https://api.football-data.org/v4/competitions/PL/scorers'
            );

            let scorersText = "👑 *TOP EPL GOAL SCORERS* 👑\n\n";
            
            scorersData.scorers.slice(0, 10).forEach((player, index) => {
                const emoji = index < 3 ? "🥇" : "⚽";
                scorersText += `${emoji} *${player.player.name}* (${player.team.name})\n`;
                scorersText += `   🎯 Goals: ${player.goals} | 🎭 Assists: ${player.assists || 'N/A'}\n`;
                scorersText += `   ⏱️ Minutes: ${player.playedMinutes}\n\n`;
            });

            await reply(scorersText);
        }
        else if (command === 'matches') {
            // Get recent/fixtures
            const matchesData = await fetchWithCache(
                'matches',
                'https://api.football-data.org/v4/competitions/PL/matches?status=SCHEDULED'
            );

            const now = new Date();
            const nextMatches = matchesData.matches
                .filter(match => new Date(match.utcDate) > now)
                .slice(0, 5);

            let matchesText = "📅 *UPCOMING EPL FIXTURES* 📅\n\n";
            
            nextMatches.forEach(match => {
                const matchDate = moment(match.utcDate).tz('Europe/London').format("ddd, DD MMM HH:mm");
                matchesText += `⚔️ ${match.homeTeam.name} vs ${match.awayTeam.name}\n`;
                matchesText += `   🕒 ${matchDate} (BST)\n`;
                matchesText += `   🏟️ ${match.venue || 'Unknown Stadium'}\n\n`;
            });

            await reply(matchesText);
        }
        else {
            reply("⚽ *Available EPL Commands:*\n" +
                "• `.epl standings` - Current league table\n" +
                "• `.epl scorers` - Top goal scorers\n" +
                "• `.epl matches` - Upcoming fixtures");
        }

    } catch (error) {
        console.error("EPL Command Error:", error);
        reply("❌ Error fetching EPL data. Try again later.");
    }
});

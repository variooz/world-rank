const SUPABASE_URL = "https://hxdxwcwdumuwmupxdsov.supabase.co";

const SUPABASE_ANON_KEY =
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4ZHh3Y3dkdW11d211cHhkc292Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwOTQyNDMsImV4cCI6MjA5ODY3MDI0M30.beuNWaXvqSbuUU6JewZFGhSssZAN3flJrRH128qtoxY";

function formatTime(timeSeconds) {
    const value = Number(timeSeconds);

    if (!Number.isFinite(value) || value <= 0) {
        return "—";
    }

    const minutes = Math.floor(value / 60);
    const seconds = Math.floor(value % 60);

    return (
        minutes.toString().padStart(2, "0") +
        ":" +
        seconds.toString().padStart(2, "0")
    );
}

async function loadLeaderboard() {
    const response = await fetch(
        `${SUPABASE_URL}/rest/v1/leaderboard?select=player_name,raid_number,bosses_completed,score,time_seconds,created_at&order=created_at.desc&limit=1000`,
        {
            headers: {
                apikey: SUPABASE_ANON_KEY,
                Authorization: `Bearer ${SUPABASE_ANON_KEY}`
            }
        }
    );

    if (!response.ok) {
        console.error(
            "Erreur Supabase :",
            response.status,
            await response.text()
        );

        return;
    }

    const data = await response.json();

    const players = {};

    data.forEach((row) => {
        const playerName = String(row.player_name || "").trim();
        const raidNumber = Number(row.raid_number);
        const bossesCompleted = Number(row.bosses_completed) || 0;
        const score = Number(row.score) || 0;
        const timeSeconds = Number(row.time_seconds) || 0;

        if (!playerName) {
            return;
        }

        if (raidNumber !== 1 && raidNumber !== 2) {
            return;
        }

        const playerKey = playerName.toLowerCase();

        if (!players[playerKey]) {
            players[playerKey] = {
                playerName: playerName,

                raid1: {
                    bossesCompleted: 0,
                    score: 0,
                    timeSeconds: 0
                },

                raid2: {
                    bossesCompleted: 0,
                    score: 0,
                    timeSeconds: 0
                }
            };
        }

        const raid = raidNumber === 1
            ? players[playerKey].raid1
            : players[playerKey].raid2;

        const betterScore = score > raid.score;

        const sameScoreButBetterTime =
            score === raid.score &&
            timeSeconds > 0 &&
            (
                raid.timeSeconds === 0 ||
                timeSeconds < raid.timeSeconds
            );

        if (betterScore || sameScoreButBetterTime) {
            raid.bossesCompleted = bossesCompleted;
            raid.score = score;
            raid.timeSeconds = timeSeconds;
        }
    });

    const leaderboard = Object.values(players);

    leaderboard.forEach((player) => {
        player.totalScore =
            player.raid1.score +
            player.raid2.score;
    });

    leaderboard.sort((a, b) => {
        if (b.totalScore !== a.totalScore) {
            return b.totalScore - a.totalScore;
        }

        const bossesA =
            a.raid1.bossesCompleted +
            a.raid2.bossesCompleted;

        const bossesB =
            b.raid1.bossesCompleted +
            b.raid2.bossesCompleted;

        if (bossesB !== bossesA) {
            return bossesB - bossesA;
        }

        const timeA =
            a.raid1.timeSeconds +
            a.raid2.timeSeconds;

        const timeB =
            b.raid1.timeSeconds +
            b.raid2.timeSeconds;

        return timeA - timeB;
    });

    const tbody = document.getElementById("leaderboard");

    tbody.innerHTML = "";

    leaderboard.forEach((player, index) => {
        const medal =
            index === 0
                ? "🥇"
                : index === 1
                ? "🥈"
                : index === 2
                ? "🥉"
                : index + 1;

        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${medal}</td>

            <td>${player.playerName}</td>

            <td>${player.raid1.bossesCompleted}/3</td>

            <td>${player.raid1.score}</td>

            <td>${formatTime(player.raid1.timeSeconds)}</td>

            <td>${player.raid2.bossesCompleted}/3</td>

            <td>${player.raid2.score}</td>

            <td>${formatTime(player.raid2.timeSeconds)}</td>

            <td><strong>${player.totalScore}</strong></td>
        `;

        tbody.appendChild(tr);
    });

    if (leaderboard.length > 0) {
        const champion = leaderboard[0];

        document.getElementById("championName").innerText =
            champion.playerName;

        document.getElementById("championTime").innerText =
            "Total score : " + champion.totalScore;
    } else {
        document.getElementById("championName").innerText =
            "No champion yet";

        document.getElementById("championTime").innerText = "";
    }
}

loadLeaderboard();

setInterval(loadLeaderboard, 15000);
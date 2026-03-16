var Football = (function() {
    'use strict';

    // football-data.org v4 API (free tier: 10 req/min)
    // Register at https://www.football-data.org/client/register for a free token
    // In browser mode, proxy through dev server to avoid CORS
    var API_BASE = (window.__BROWSER_MODE__) ? '/football-api/v4' : 'https://api.football-data.org/v4';
    var API_TOKEN = '23bcec11f9a240e1a9292c7eca18c4ea';

    // Competition codes (free tier)
    var COMPETITIONS = {
        PL:  { code: 'PL',  name: 'Premier League', flag: 'ENG' },
        PD:  { code: 'PD',  name: 'La Liga',        flag: 'ESP' },
        SA:  { code: 'SA',  name: 'Serie A',         flag: 'ITA' },
        CL:  { code: 'CL',  name: 'Champions League', flag: 'EUR' }
    };

    var COMP_CODES = 'PL,PD,SA,CL';

    // Match statuses
    var STATUS_LIVE = ['IN_PLAY', 'PAUSED', 'LIVE'];
    var STATUS_DONE = ['FINISHED'];
    var STATUS_UPCOMING = ['TIMED', 'SCHEDULED'];

    var cachedMatches = null;
    var cacheTime = 0;
    var CACHE_TTL = 5 * 60 * 1000; // 5 minute cache — scores don't change that fast
    var CACHE_TTL_LIVE = 60 * 1000; // 1 minute when live matches exist
    var refreshTimer = null;
    var pendingCallbacks = null; // coalesce concurrent requests

    // Goal detection — track previous scores per match ID
    var previousScores = {};   // { matchId: { home: N, away: N } }
    var recentGoals = {};      // { matchId: { home: bool, away: bool, ts: timestamp } }
    var GOAL_HIGHLIGHT_DURATION = 60 * 1000; // keep goal highlight for 60 seconds

    function isLive(status) {
        return STATUS_LIVE.indexOf(status) !== -1;
    }

    function isDone(status) {
        return STATUS_DONE.indexOf(status) !== -1;
    }

    function isUpcoming(status) {
        return STATUS_UPCOMING.indexOf(status) !== -1;
    }

    function formatTime(utcDate) {
        var d = new Date(utcDate);
        var hh = String(d.getHours()).padStart(2, '0');
        var mm = String(d.getMinutes()).padStart(2, '0');
        return hh + ':' + mm;
    }

    function formatStatus(match) {
        var s = match.status;
        if (isLive(s)) {
            var min = match.minute;
            if (s === 'PAUSED') return 'HT';
            if (min) return min + "'";
            return 'LIVE';
        }
        if (isDone(s)) return 'FT';
        if (isUpcoming(s)) return formatTime(match.utcDate);
        if (s === 'HALFTIME') return 'HT';
        if (s === 'POSTPONED') return 'PST';
        if (s === 'CANCELLED') return 'CAN';
        if (s === 'SUSPENDED') return 'SUS';
        return s || '?';
    }

    function hasLiveMatches() {
        if (!cachedMatches) return false;
        for (var g = 0; g < cachedMatches.length; g++) {
            for (var m = 0; m < cachedMatches[g].matches.length; m++) {
                if (cachedMatches[g].matches[m].isLive) return true;
            }
        }
        return false;
    }

    function fetchMatches(callback) {
        // Smart cache: shorter TTL when live matches are happening
        var ttl = hasLiveMatches() ? CACHE_TTL_LIVE : CACHE_TTL;
        if (cachedMatches && (Date.now() - cacheTime < ttl)) {
            callback(null, cachedMatches);
            return;
        }

        // Coalesce concurrent requests — if a fetch is already in flight, queue up
        if (pendingCallbacks) {
            pendingCallbacks.push(callback);
            return;
        }
        pendingCallbacks = [callback];

        doFetch(0);
    }

    function doFetch(attempt) {
        var url = API_BASE + '/matches?competitions=' + COMP_CODES;

        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.setRequestHeader('X-Auth-Token', API_TOKEN);
        xhr.timeout = 15000; // 15s — more forgiving for Samsung TV

        function resolve(err, data) {
            var cbs = pendingCallbacks;
            pendingCallbacks = null;
            for (var i = 0; i < cbs.length; i++) {
                cbs[i](err, data);
            }
        }

        function retry() {
            if (attempt < 2) {
                // Wait 2s then retry
                setTimeout(function() { doFetch(attempt + 1); }, 2000);
            } else {
                // After 3 attempts, give up — but serve stale cache if we have one
                if (cachedMatches) {
                    resolve(null, cachedMatches);
                } else {
                    resolve('Failed after 3 attempts', null);
                }
            }
        }

        xhr.ontimeout = function() { retry(); };
        xhr.onerror = function() { retry(); };
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    try {
                        var data = JSON.parse(xhr.responseText);
                        var matches = parseMatches(data);
                        cachedMatches = matches;
                        cacheTime = Date.now();
                        resolve(null, matches);
                    } catch (e) {
                        resolve('Parse error: ' + e.message, null);
                    }
                } else if (xhr.status === 429) {
                    // Rate limited — serve stale cache if available
                    if (cachedMatches) {
                        resolve(null, cachedMatches);
                    } else {
                        resolve('Rate limited — try again in a minute', null);
                    }
                } else {
                    retry();
                }
            }
        };
        xhr.send();
    }

    function parseMatches(apiData) {
        var result = {};
        var matches = apiData.matches || [];

        for (var i = 0; i < matches.length; i++) {
            var m = matches[i];
            var compCode = m.competition ? m.competition.code : 'OTHER';
            var comp = COMPETITIONS[compCode];
            if (!comp) continue;

            if (!result[compCode]) {
                result[compCode] = {
                    name: comp.name,
                    flag: comp.flag,
                    code: compCode,
                    matches: []
                };
            }

            var homeScore = (m.score && m.score.fullTime && m.score.fullTime.home !== null)
                ? m.score.fullTime.home : null;
            var awayScore = (m.score && m.score.fullTime && m.score.fullTime.away !== null)
                ? m.score.fullTime.away : null;

            // For live matches, use the current score if fullTime not yet set
            if (homeScore === null && m.score && m.score.halfTime) {
                // During first half or just started
            }
            // The API puts current score in fullTime even during live matches
            // But let's also check for halftime scores
            var htHome = (m.score && m.score.halfTime && m.score.halfTime.home !== null)
                ? m.score.halfTime.home : null;
            var htAway = (m.score && m.score.halfTime && m.score.halfTime.away !== null)
                ? m.score.halfTime.away : null;

            result[compCode].matches.push({
                id: m.id,
                status: m.status,
                minute: m.minute || null,
                utcDate: m.utcDate,
                homeTeam: m.homeTeam ? m.homeTeam.shortName || m.homeTeam.name : '?',
                homeTeamFull: m.homeTeam ? m.homeTeam.name : '?',
                awayTeam: m.awayTeam ? m.awayTeam.shortName || m.awayTeam.name : '?',
                awayTeamFull: m.awayTeam ? m.awayTeam.name : '?',
                homeScore: homeScore,
                awayScore: awayScore,
                htHome: htHome,
                htAway: htAway,
                competition: compCode,
                isLive: isLive(m.status),
                isDone: isDone(m.status),
                isUpcoming: isUpcoming(m.status)
            });
        }

        // Sort competitions in display order
        var ordered = [];
        var order = ['CL', 'PL', 'PD', 'SA'];
        for (var o = 0; o < order.length; o++) {
            if (result[order[o]]) {
                // Sort matches: live first, then upcoming by time, then finished
                result[order[o]].matches.sort(function(a, b) {
                    var wa = a.isLive ? 0 : (a.isUpcoming ? 1 : 2);
                    var wb = b.isLive ? 0 : (b.isUpcoming ? 1 : 2);
                    if (wa !== wb) return wa - wb;
                    return new Date(a.utcDate) - new Date(b.utcDate);
                });
                ordered.push(result[order[o]]);
            }
        }
        return ordered;
    }

    // Detect score changes compared to previous poll
    function detectGoals(grouped) {
        var goals = [];
        var now = Date.now();

        // Clean up expired goal highlights
        for (var key in recentGoals) {
            if (now - recentGoals[key].ts > GOAL_HIGHLIGHT_DURATION) {
                delete recentGoals[key];
            }
        }

        for (var g = 0; g < grouped.length; g++) {
            for (var m = 0; m < grouped[g].matches.length; m++) {
                var match = grouped[g].matches[m];
                var id = match.id;
                var prev = previousScores[id];
                var curHome = match.homeScore;
                var curAway = match.awayScore;

                if (prev && match.isLive) {
                    var homeGoal = (curHome !== null && prev.home !== null && curHome > prev.home);
                    var awayGoal = (curAway !== null && prev.away !== null && curAway > prev.away);
                    if (homeGoal || awayGoal) {
                        recentGoals[id] = { home: homeGoal, away: awayGoal, ts: now };
                        goals.push({
                            match: match,
                            comp: grouped[g].name,
                            homeGoal: homeGoal,
                            awayGoal: awayGoal
                        });
                    }
                }

                // Store current scores for next comparison
                if (curHome !== null || curAway !== null) {
                    previousScores[id] = { home: curHome, away: curAway };
                }

                // Tag match with active goal highlight
                match.goalHome = !!(recentGoals[id] && recentGoals[id].home);
                match.goalAway = !!(recentGoals[id] && recentGoals[id].away);
                match.hasGoal = match.goalHome || match.goalAway;
            }
        }
        return goals;
    }

    // Build a flat list of all matches (for navigation)
    function flattenMatches(grouped) {
        var flat = [];
        for (var g = 0; g < grouped.length; g++) {
            for (var m = 0; m < grouped[g].matches.length; m++) {
                flat.push(grouped[g].matches[m]);
            }
        }
        return flat;
    }

    // Start auto-refresh (for live scores)
    function startAutoRefresh(intervalMs, onUpdate, onGoal) {
        stopAutoRefresh();
        refreshTimer = setInterval(function() {
            // Force cache expiry so fetchMatches makes a real request
            cacheTime = 0;
            fetchMatches(function(err, data) {
                if (!err && data) {
                    var goals = detectGoals(data);
                    onUpdate(data);
                    if (goals.length > 0 && onGoal) {
                        for (var i = 0; i < goals.length; i++) {
                            onGoal(goals[i]);
                        }
                    }
                }
            });
        }, intervalMs || 60000);
    }

    function stopAutoRefresh() {
        if (refreshTimer) {
            clearInterval(refreshTimer);
            refreshTimer = null;
        }
    }

    // ── Standings ──
    var cachedStandings = {};  // { compCode: { data: [...], time: timestamp } }
    var STANDINGS_CACHE_TTL = 30 * 60 * 1000; // 30 minutes

    function fetchStandings(compCode, callback) {
        // Check cache
        var cached = cachedStandings[compCode];
        if (cached && (Date.now() - cached.time < STANDINGS_CACHE_TTL)) {
            callback(null, cached.data);
            return;
        }

        var url = API_BASE + '/competitions/' + compCode + '/standings';
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.setRequestHeader('X-Auth-Token', API_TOKEN);
        xhr.timeout = 15000;

        xhr.ontimeout = function() {
            if (cached) { callback(null, cached.data); }
            else { callback('Timeout loading standings', null); }
        };
        xhr.onerror = function() {
            if (cached) { callback(null, cached.data); }
            else { callback('Network error', null); }
        };
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    try {
                        var data = JSON.parse(xhr.responseText);
                        var standings = parseStandings(data, compCode);
                        cachedStandings[compCode] = { data: standings, time: Date.now() };
                        callback(null, standings);
                    } catch (e) {
                        callback('Parse error: ' + e.message, null);
                    }
                } else if (xhr.status === 429) {
                    if (cached) { callback(null, cached.data); }
                    else { callback('Rate limited', null); }
                } else {
                    if (cached) { callback(null, cached.data); }
                    else { callback('HTTP ' + xhr.status, null); }
                }
            }
        };
        xhr.send();
    }

    function parseStandings(apiData, compCode) {
        var standings = apiData.standings || [];
        // Find the TOTAL standing (not HOME or AWAY)
        var total = null;
        for (var i = 0; i < standings.length; i++) {
            if (standings[i].type === 'TOTAL') {
                total = standings[i];
                break;
            }
        }
        if (!total && standings.length > 0) total = standings[0];
        if (!total) return [];

        var table = total.table || [];
        var result = [];
        for (var j = 0; j < table.length; j++) {
            var row = table[j];
            var team = row.team || {};
            result.push({
                position: row.position,
                teamName: team.shortName || team.name || '?',
                teamNameFull: team.name || '?',
                played: row.playedGames || 0,
                won: row.won || 0,
                draw: row.draw || 0,
                lost: row.lost || 0,
                goalsFor: row.goalsFor || 0,
                goalsAgainst: row.goalsAgainst || 0,
                goalDiff: row.goalDifference || 0,
                points: row.points || 0,
                form: row.form || ''
            });
        }
        return result;
    }

    // ── Match Details ──
    var cachedMatchDetails = {};  // { matchId: { data: {...}, time: timestamp } }
    var MATCH_DETAIL_CACHE_TTL = 2 * 60 * 1000; // 2 minutes (live matches change fast)

    function fetchMatchDetails(matchId, callback) {
        var cached = cachedMatchDetails[matchId];
        if (cached && (Date.now() - cached.time < MATCH_DETAIL_CACHE_TTL)) {
            callback(null, cached.data);
            return;
        }

        var url = API_BASE + '/matches/' + matchId;
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.setRequestHeader('X-Auth-Token', API_TOKEN);
        xhr.timeout = 15000;

        xhr.ontimeout = function() {
            if (cached) { callback(null, cached.data); }
            else { callback('Timeout', null); }
        };
        xhr.onerror = function() {
            if (cached) { callback(null, cached.data); }
            else { callback('Network error', null); }
        };
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    try {
                        var raw = JSON.parse(xhr.responseText);
                        var detail = parseMatchDetails(raw);
                        cachedMatchDetails[matchId] = { data: detail, time: Date.now() };
                        callback(null, detail);
                    } catch (e) {
                        callback('Parse error: ' + e.message, null);
                    }
                } else if (xhr.status === 429) {
                    if (cached) { callback(null, cached.data); }
                    else { callback('Rate limited', null); }
                } else {
                    if (cached) { callback(null, cached.data); }
                    else { callback('HTTP ' + xhr.status, null); }
                }
            }
        };
        xhr.send();
    }

    function parseMatchDetails(raw) {
        var detail = {
            id: raw.id,
            status: raw.status,
            minute: raw.minute || null,
            injuryTime: raw.injuryTime || null,
            utcDate: raw.utcDate,
            venue: raw.venue || '',
            attendance: raw.attendance || null,
            matchday: raw.matchday || null,
            stage: raw.stage || '',
            homeTeam: raw.homeTeam ? raw.homeTeam.shortName || raw.homeTeam.name : '?',
            homeTeamFull: raw.homeTeam ? raw.homeTeam.name : '?',
            awayTeam: raw.awayTeam ? raw.awayTeam.shortName || raw.awayTeam.name : '?',
            awayTeamFull: raw.awayTeam ? raw.awayTeam.name : '?',
            score: {
                home: null,
                away: null,
                htHome: null,
                htAway: null
            },
            homeCoach: '',
            awayCoach: '',
            homeFormation: '',
            awayFormation: '',
            homeLineup: [],
            awayLineup: [],
            homeBench: [],
            awayBench: [],
            goals: [],
            bookings: [],
            substitutions: [],
            referees: []
        };

        // Score
        if (raw.score) {
            if (raw.score.fullTime) {
                detail.score.home = raw.score.fullTime.home;
                detail.score.away = raw.score.fullTime.away;
            }
            if (raw.score.halfTime) {
                detail.score.htHome = raw.score.halfTime.home;
                detail.score.htAway = raw.score.halfTime.away;
            }
        }

        // Home team details
        if (raw.homeTeam) {
            if (raw.homeTeam.coach) {
                detail.homeCoach = raw.homeTeam.coach.name || '';
            }
            detail.homeFormation = raw.homeTeam.formation || '';
            if (raw.homeTeam.lineup) {
                for (var i = 0; i < raw.homeTeam.lineup.length; i++) {
                    var p = raw.homeTeam.lineup[i];
                    detail.homeLineup.push({
                        name: p.name || '?',
                        position: p.position || '',
                        shirtNumber: p.shirtNumber || ''
                    });
                }
            }
            if (raw.homeTeam.bench) {
                for (var ib = 0; ib < raw.homeTeam.bench.length; ib++) {
                    var pb = raw.homeTeam.bench[ib];
                    detail.homeBench.push({
                        name: pb.name || '?',
                        position: pb.position || '',
                        shirtNumber: pb.shirtNumber || ''
                    });
                }
            }
        }

        // Away team details
        if (raw.awayTeam) {
            if (raw.awayTeam.coach) {
                detail.awayCoach = raw.awayTeam.coach.name || '';
            }
            detail.awayFormation = raw.awayTeam.formation || '';
            if (raw.awayTeam.lineup) {
                for (var j = 0; j < raw.awayTeam.lineup.length; j++) {
                    var q = raw.awayTeam.lineup[j];
                    detail.awayLineup.push({
                        name: q.name || '?',
                        position: q.position || '',
                        shirtNumber: q.shirtNumber || ''
                    });
                }
            }
            if (raw.awayTeam.bench) {
                for (var jb = 0; jb < raw.awayTeam.bench.length; jb++) {
                    var qb = raw.awayTeam.bench[jb];
                    detail.awayBench.push({
                        name: qb.name || '?',
                        position: qb.position || '',
                        shirtNumber: qb.shirtNumber || ''
                    });
                }
            }
        }

        // Goals
        if (raw.goals) {
            for (var g = 0; g < raw.goals.length; g++) {
                var gl = raw.goals[g];
                detail.goals.push({
                    minute: gl.minute || '',
                    injuryTime: gl.injuryTime || null,
                    team: gl.team ? (gl.team.shortName || gl.team.name || '') : '',
                    scorer: gl.scorer ? gl.scorer.name : '?',
                    assist: gl.assist ? gl.assist.name : null,
                    type: gl.type || 'REGULAR',
                    scoreHome: gl.score ? gl.score.home : null,
                    scoreAway: gl.score ? gl.score.away : null
                });
            }
        }

        // Bookings
        if (raw.bookings) {
            for (var b = 0; b < raw.bookings.length; b++) {
                var bk = raw.bookings[b];
                detail.bookings.push({
                    minute: bk.minute || '',
                    team: bk.team ? (bk.team.shortName || bk.team.name || '') : '',
                    player: bk.player ? bk.player.name : '?',
                    card: bk.card || '?'
                });
            }
        }

        // Substitutions
        if (raw.substitutions) {
            for (var s = 0; s < raw.substitutions.length; s++) {
                var sub = raw.substitutions[s];
                detail.substitutions.push({
                    minute: sub.minute || '',
                    team: sub.team ? (sub.team.shortName || sub.team.name || '') : '',
                    playerIn: sub.playerIn ? sub.playerIn.name : '?',
                    playerOut: sub.playerOut ? sub.playerOut.name : '?'
                });
            }
        }

        // Referees
        if (raw.referees) {
            for (var r = 0; r < raw.referees.length; r++) {
                var ref = raw.referees[r];
                if (ref.type === 'REFEREE') {
                    detail.referees.push({
                        name: ref.name || '?',
                        nationality: ref.nationality || ''
                    });
                }
            }
        }

        return detail;
    }

    // Check if API token is configured
    function isConfigured() {
        return API_TOKEN && API_TOKEN !== 'YOUR_API_TOKEN_HERE';
    }

    // Set API token at runtime
    function setToken(token) {
        API_TOKEN = token;
    }

    return {
        fetchMatches: fetchMatches,
        flattenMatches: flattenMatches,
        formatStatus: formatStatus,
        detectGoals: detectGoals,
        isLive: isLive,
        isDone: isDone,
        isUpcoming: isUpcoming,
        startAutoRefresh: startAutoRefresh,
        stopAutoRefresh: stopAutoRefresh,
        fetchStandings: fetchStandings,
        fetchMatchDetails: fetchMatchDetails,
        isConfigured: isConfigured,
        setToken: setToken,
        COMPETITIONS: COMPETITIONS
    };
})();

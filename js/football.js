var Football = (function() {
    'use strict';

    // ── Primary API: football-data.org v4 (free tier: 10 req/min) ──
    // Leagues + Champions League
    var API_BASE = (window.__BROWSER_MODE__) ? '/football-api/v4' : 'https://api.football-data.org/v4';
    var API_TOKEN = '23bcec11f9a240e1a9292c7eca18c4ea';

    // ── Secondary API: api-football (free tier: 100 req/day) ──
    // Domestic cups not available on football-data.org free tier
    var CUPS_API_BASE = (window.__BROWSER_MODE__) ? '/cups-api/v3' : 'https://v3.football.api-sports.io';
    var CUPS_API_TOKEN = '205de6f0c19ebbfd7ef16235e3a53f10';

    // Competition codes — football-data.org (leagues + CL)
    var COMPETITIONS = {
        PL:  { code: 'PL',  name: 'Premier League', flag: 'ENG' },
        PD:  { code: 'PD',  name: 'La Liga',        flag: 'ESP' },
        SA:  { code: 'SA',  name: 'Serie A',         flag: 'ITA' },
        BL1: { code: 'BL1', name: 'Bundesliga',      flag: 'GER' },
        FL1: { code: 'FL1', name: 'Ligue 1',         flag: 'FRA' },
        CL:  { code: 'CL',  name: 'Champions League', flag: 'EUR' }
    };

    var COMP_CODES = 'PL,PD,SA,BL1,FL1,CL';

    // Cup competitions — api-football (league IDs)
    var CUP_COMPETITIONS = {
        143:  { id: 143,  name: 'Copa del Rey',     flag: 'ESP', code: 'CDR' },
        45:   { id: 45,   name: 'FA Cup',           flag: 'ENG', code: 'FAC' },
        48:   { id: 48,   name: 'League Cup',       flag: 'ENG', code: 'LC'  },
        137:  { id: 137,  name: 'Coppa Italia',     flag: 'ITA', code: 'CI'  },
        81:   { id: 81,   name: 'DFB Pokal',        flag: 'GER', code: 'DFB' },
        66:   { id: 66,   name: 'Coupe de France',  flag: 'FRA', code: 'CDF' },
        3:    { id: 3,    name: 'Europa League',    flag: 'EUR', code: 'EL'  },
        848:  { id: 848,  name: 'Conference League', flag: 'EUR', code: 'ECL' }
    };

    var CUP_IDS = '143-45-48-137-81-66-3-848';

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

    // Separate cache for cup matches (api-football has tight daily limit)
    var cachedCupMatches = null;
    var cupCacheTime = 0;
    var CUP_CACHE_TTL = 15 * 60 * 1000; // 15 min — conserve the 100 req/day limit
    var CUP_CACHE_TTL_LIVE = 2 * 60 * 1000; // 2 min when live cup matches

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
        var leaguesFresh = cachedMatches && (Date.now() - cacheTime < ttl);

        var cupTtl = hasLiveCupMatches() ? CUP_CACHE_TTL_LIVE : CUP_CACHE_TTL;
        var cupsFresh = cachedCupMatches && (Date.now() - cupCacheTime < cupTtl);

        if (leaguesFresh && cupsFresh) {
            callback(null, mergeResults(cachedMatches, cachedCupMatches));
            return;
        }

        // Coalesce concurrent requests — if a fetch is already in flight, queue up
        if (pendingCallbacks) {
            pendingCallbacks.push(callback);
            return;
        }
        pendingCallbacks = [callback];

        var leaguesResult = leaguesFresh ? cachedMatches : null;
        var cupsResult = cupsFresh ? cachedCupMatches : null;
        var done = 0;
        var needed = (leaguesFresh ? 0 : 1) + (cupsFresh ? 0 : 1);

        function checkDone() {
            done++;
            if (done < needed) return;
            var leagues = leaguesResult || cachedMatches || [];
            var cups = cupsResult || cachedCupMatches || [];
            var merged = mergeResults(leagues, cups);
            resolvePending(null, merged);
        }

        if (!leaguesFresh) {
            doFetchLeagues(0, function(err, data) {
                if (!err && data) leaguesResult = data;
                checkDone();
            });
        }

        if (!cupsFresh) {
            doFetchCups(function(err, data) {
                if (!err && data) cupsResult = data;
                checkDone();
            });
        }
    }

    function resolvePending(err, data) {
        var cbs = pendingCallbacks;
        pendingCallbacks = null;
        for (var i = 0; i < cbs.length; i++) {
            cbs[i](err, data);
        }
    }

    function doFetchLeagues(attempt, done) {
        var url = API_BASE + '/matches?competitions=' + COMP_CODES;

        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.setRequestHeader('X-Auth-Token', API_TOKEN);
        xhr.timeout = 15000; // 15s — more forgiving for Samsung TV

        function retry() {
            if (attempt < 2) {
                setTimeout(function() { doFetchLeagues(attempt + 1, done); }, 2000);
            } else {
                done(cachedMatches ? null : 'Failed after 3 attempts', cachedMatches);
            }
        }

        xhr.ontimeout = function() { retry(); };
        xhr.onerror = function() { retry(); };
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    try {
                        var data = JSON.parse(xhr.responseText);
                        var matches = parseLeagueMatches(data);
                        cachedMatches = matches;
                        cacheTime = Date.now();
                        done(null, matches);
                    } catch (e) {
                        done('Parse error: ' + e.message, null);
                    }
                } else if (xhr.status === 429) {
                    done(null, cachedMatches);
                } else {
                    retry();
                }
            }
        };
        xhr.send();
    }

    function doFetchCups(done) {
        // api-football: get today's fixtures for cup competitions
        var today = new Date();
        var dateStr = today.getFullYear() + '-' +
            String(today.getMonth() + 1).padStart(2, '0') + '-' +
            String(today.getDate()).padStart(2, '0');

        var url = CUPS_API_BASE + '/fixtures?date=' + dateStr;

        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.setRequestHeader('x-apisports-key', CUPS_API_TOKEN);
        xhr.timeout = 15000;

        xhr.ontimeout = function() { done(null, cachedCupMatches); };
        xhr.onerror = function() { done(null, cachedCupMatches); };
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    try {
                        var data = JSON.parse(xhr.responseText);
                        var cups = parseCupMatches(data);
                        cachedCupMatches = cups;
                        cupCacheTime = Date.now();
                        done(null, cups);
                    } catch (e) {
                        done('Cup parse error: ' + e.message, null);
                    }
                } else {
                    done(null, cachedCupMatches);
                }
            }
        };
        xhr.send();
    }

    function hasLiveCupMatches() {
        if (!cachedCupMatches) return false;
        for (var g = 0; g < cachedCupMatches.length; g++) {
            for (var m = 0; m < cachedCupMatches[g].matches.length; m++) {
                if (cachedCupMatches[g].matches[m].isLive) return true;
            }
        }
        return false;
    }

    function parseLeagueMatches(apiData) {
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

        return sortByCompetition(result, ['CL', 'PL', 'PD', 'SA', 'BL1', 'FL1']);
    }

    // Parse api-football response into same format as league matches
    function parseCupMatches(apiData) {
        var result = {};
        var fixtures = apiData.response || [];

        for (var i = 0; i < fixtures.length; i++) {
            var f = fixtures[i];
            var leagueId = f.league ? f.league.id : 0;
            var cup = CUP_COMPETITIONS[leagueId];
            if (!cup) continue; // skip competitions we don't care about

            var code = cup.code;
            if (!result[code]) {
                result[code] = {
                    name: cup.name,
                    flag: cup.flag,
                    code: code,
                    matches: []
                };
            }

            // Map api-football status to football-data.org style
            var status = mapCupStatus(f.fixture.status.short);
            var minute = f.fixture.status.elapsed;

            var homeScore = (f.goals && f.goals.home !== null) ? f.goals.home : null;
            var awayScore = (f.goals && f.goals.away !== null) ? f.goals.away : null;
            var htHome = (f.score && f.score.halftime && f.score.halftime.home !== null)
                ? f.score.halftime.home : null;
            var htAway = (f.score && f.score.halftime && f.score.halftime.away !== null)
                ? f.score.halftime.away : null;

            result[code].matches.push({
                id: 'cup_' + f.fixture.id,  // prefix to avoid ID collisions
                status: status,
                minute: minute || null,
                utcDate: f.fixture.date,
                homeTeam: f.teams.home ? f.teams.home.name : '?',
                homeTeamFull: f.teams.home ? f.teams.home.name : '?',
                awayTeam: f.teams.away ? f.teams.away.name : '?',
                awayTeamFull: f.teams.away ? f.teams.away.name : '?',
                homeScore: homeScore,
                awayScore: awayScore,
                htHome: htHome,
                htAway: htAway,
                competition: code,
                isLive: isLive(status),
                isDone: isDone(status),
                isUpcoming: isUpcoming(status),
                isCup: true  // flag for match detail handling
            });
        }

        return sortByCompetition(result, ['CDR', 'FAC', 'LC', 'CI', 'DFB', 'CDF', 'EL', 'ECL']);
    }

    // Map api-football status codes to football-data.org style
    function mapCupStatus(shortStatus) {
        var map = {
            'TBD': 'TIMED', 'NS': 'SCHEDULED',
            '1H': 'IN_PLAY', '2H': 'IN_PLAY', 'ET': 'IN_PLAY', 'P': 'IN_PLAY', 'LIVE': 'LIVE',
            'HT': 'HALFTIME', 'BT': 'PAUSED',
            'FT': 'FINISHED', 'AET': 'FINISHED', 'PEN': 'FINISHED',
            'PST': 'POSTPONED', 'CANC': 'CANCELLED', 'SUSP': 'SUSPENDED',
            'INT': 'SUSPENDED', 'ABD': 'CANCELLED', 'AWD': 'FINISHED', 'WO': 'FINISHED'
        };
        return map[shortStatus] || shortStatus;
    }

    // Sort grouped matches by competition display order
    function sortByCompetition(result, order) {
        var ordered = [];
        for (var o = 0; o < order.length; o++) {
            if (result[order[o]]) {
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

    // Unified display order across leagues and cups
    var DISPLAY_ORDER = ['CL', 'EL', 'ECL', 'PD', 'CDR', 'PL', 'FAC', 'LC', 'SA', 'CI', 'BL1', 'DFB', 'FL1', 'CDF'];

    // Merge league and cup results, sorted by unified display order
    function mergeResults(leagues, cups) {
        var byCode = {};
        var sources = [leagues, cups];
        for (var s = 0; s < sources.length; s++) {
            if (!sources[s]) continue;
            for (var i = 0; i < sources[s].length; i++) {
                byCode[sources[s][i].code] = sources[s][i];
            }
        }
        var merged = [];
        for (var o = 0; o < DISPLAY_ORDER.length; o++) {
            if (byCode[DISPLAY_ORDER[o]]) {
                merged.push(byCode[DISPLAY_ORDER[o]]);
            }
        }
        return merged;
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
            cupCacheTime = 0;
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
        COMPETITIONS: COMPETITIONS,
        CUP_COMPETITIONS: CUP_COMPETITIONS
    };
})();

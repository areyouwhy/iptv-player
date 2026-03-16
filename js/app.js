(function() {
    'use strict';

    // ── Config ──
    var HOSTS = [
        'my8k.site',
        'm3u.best-smarter.me',
        'cf.hi-max.me',
        'cf.ok4k.me',
        'cf.scma.me',
        'hi-ott.me',
        'pro.business-cdn.me',
        'very50610.cdn-mx.me'
    ];
    var DEFAULT_CREDENTIALS = { username: '9b1f6b5188', password: '36690c9df5' };

    // ── Accounts (IPTV credentials) ──
    // Each account is a separate IPTV subscription login.
    // The user picks an account before choosing a profile.
    var ACCOUNTS = [
        { name: 'ruy',     username: '9b1f6b5188', password: '36690c9df5' },
        { name: 'mama',    username: 'eb47f5e8c5', password: '454b464362' },
        { name: 'mattias', username: 'a9de3d71b8', password: '78600dc309' }
    ];
    var activeAccount = null;

    // ── Shared exclude list (reusable across profiles) ──
    var EXCLUDES_ALL = [
        // Arabic / Middle East
        'ar ', 'ar:', 'ar|', 'ar-', 'arab', 'iraq', 'iq ', 'iq:', 'iq|',
        'sa ', 'sa:', 'sa|', 'saudi', 'ksa',
        'ae ', 'ae:', 'ae|', 'emirates', 'uae',
        'kw ', 'kw:', 'kuwait', 'qa ', 'qa:', 'qatar',
        'om ', 'om:', 'oman', 'bh ', 'bh:', 'bahrain',
        'lb ', 'lb:', 'leban', 'jo ', 'jo:', 'jordan',
        'sy ', 'sy:', 'syria', 'ps ', 'ps:', 'palest',
        'ye ', 'ye:', 'yemen',
        // Africa
        'af ', 'af:', 'af|', 'af-', 'afri', 'africa',
        'ng ', 'ng:', 'niger', 'za ', 'za:', 'south afri',
        'ke ', 'ke:', 'kenya', 'gh ', 'gh:', 'ghana',
        'eg ', 'eg:', 'egypt', 'ma ', 'ma:', 'morocc',
        'tn ', 'tn:', 'tunis', 'dz ', 'dz:', 'alger',
        'ly ', 'ly:', 'libya', 'sd ', 'sd:', 'sudan',
        'et ', 'et:', 'ethiop',
        // South / Southeast Asia
        'in ', 'in:', 'in|', 'in-', 'india', 'hindi', 'tamil', 'telugu', 'punjab', 'bangla',
        'pk ', 'pk:', 'pk|', 'pakist', 'bd ', 'bd:', 'bangladesh',
        'lk ', 'lk:', 'sri lanka', 'np ', 'np:', 'nepal',
        'ph ', 'ph:', 'philipp', 'pinoy', 'filipino',
        'th ', 'th:', 'th|', 'thai', 'vn ', 'vn:', 'viet',
        'my ', 'my:', 'malay', 'id ', 'id:', 'indo',
        'mm ', 'mm:', 'myanmar', 'kh ', 'kh:', 'cambod',
        // East Asia
        'cn ', 'cn:', 'china', 'chinese', 'jp ', 'jp:', 'japan',
        'kr ', 'kr:', 'korea', 'tw ', 'tw:', 'taiwan',
        'hk ', 'hk:', 'hong kong',
        // Turkey / Iran / Central Asia
        'tr ', 'tr:', 'tr|', 'tr-', 'turk',
        'ir ', 'ir:', 'ir|', 'iran', 'persi',
        'afghan', 'uz ', 'uz:', 'uzbek', 'kz ', 'kz:', 'kazakh',
        // Eastern Europe
        'ru ', 'ru:', 'ru|', 'ru-', 'russ', 'ua ', 'ua:', 'ukrain',
        'pl ', 'pl:', 'pl|', 'pl-', 'poli', 'polish',
        'ro ', 'ro:', 'ro|', 'roman', 'bg ', 'bg:', 'bulgar',
        'hu ', 'hu:', 'hungar', 'cz ', 'cz:', 'czech',
        'sk ', 'sk:', 'slovak', 'hr ', 'hr:', 'croat',
        'rs ', 'rs:', 'serb', 'ba ', 'ba:', 'bosn',
        'si ', 'si:', 'sloven', 'mk ', 'mk:', 'macedon',
        'al ', 'al:', 'al|', 'al-', 'alban', 'me ', 'me:', 'monteneg',
        'ex ', 'ex-', 'ex:', 'ex|', 'ex yu', 'balkan',
        'lt ', 'lt:', 'lithuan', 'lv ', 'lv:', 'latvi',
        'ee ', 'ee:', 'eston', 'by ', 'by:', 'belarus',
        'md ', 'md:', 'moldov',
        // Other European
        'gr ', 'gr:', 'greek', 'greece',
        'pt ', 'pt:', 'pt|', 'portug',
        'nl ', 'nl:', 'nl|', 'dutch', 'nether',
        'be ', 'be:', 'belgi', 'at ', 'at:', 'austri',
        'ch ', 'ch:', 'swiss',
        // Latin America
        'br ', 'br:', 'br|', 'brazil', 'mx ', 'mx:', 'mexic',
        'co ', 'co:', 'colomb', 'cl ', 'cl:', 'chile',
        'pe ', 'pe:', 'peru', 've ', 've:', 'venezu',
        'ar:', 'argent', 'cu ', 'cu:', 'cuba',
        'latam', 'latino',
        'jm ', 'jm:', 'jamaica', 'ht ', 'ht:', 'haiti',
        // Misc
        'fr ', 'fr:', 'fr|', 'fr-', 'french', 'france',
        'de ', 'de:', 'de|', 'de-', 'german', 'deutsch',
        'it ', 'it:', 'it|', 'it-', 'ital',
        'kurdish', 'kurd', 'somali',
        'azerba', 'az ', 'az:', 'georgia', 'armen'
    ];

    // ── Profiles ──
    var PROFILES = [
        {
            id: 'football',
            label: 'Fotball',
            keywords: [
                'champion', 'ucl', 'premier league', 'la liga', 'liga',
                'europa league', 'conference league', 'copa del rey',
                'fa cup', 'carabao', 'serie a', 'bundesliga', 'ligue 1',
                'world cup', 'euro 202', 'nations league',
                'barcelona', 'barca', 'real madrid', 'atletico',
                'manchester', 'man utd', 'man city', 'liverpool',
                'arsenal', 'chelsea', 'tottenham', 'spurs',
                'bayern', 'dortmund', 'juventus', 'inter', 'ac milan',
                'psg', 'napoli',
                'bein sport', 'bt sport', 'sky sport', 'dazn',
                'sport 1', 'sport 2', 'sport 3', 'sport 4', 'sport 5',
                'espn', 'fox sport', 'tnt sport',
                'supersport', 'eleven sport',
                'football', 'fotboll', 'soccer', 'futbol',
                'viaplay sport', 'cmore sport', 'tv4 sport',
                'c more sport', 'sportkanalen'
            ]
        },
        {
            id: 'swedish',
            label: 'Sweden',
            keywords: [
                'svt', 'tv3', 'tv4', 'tv6', 'tv8', 'tv10', 'tv12',
                'kanal 5', 'kanal 9', 'kanal 11',
                'viaplay', 'c more', 'cmore', 'comhem',
                'discovery', 'dplay',
                'barnkanalen', 'kunskapskanalen', 'svt barn',
                'tv4 film', 'tv4 fakta', 'tv4 guld',
                'sjuan', 'nyhetskanalen',
                'swedish', 'sweden', 'sverige'
            ],
            country: 'Sweden'
        },
        {
            id: 'favorites',
            label: 'Favorites',
            special: 'favorites'
        }
    ];

    // ── User Profiles ──
    // Hardcoded profiles: displayName = screen label, username/password = API credentials
    var HARDCODED_PROFILES = [
        {
            displayName: 'fotball',
            searches: ['viaplay', 'tv4', 'csb', 'dazn', 'movistar'],
            categoryFilters: ['es ', 'es|', 'es:', 'es-', 'se ', 'se|', 'se:', 'se-', 'uk ', 'uk|', 'uk:', 'uk-'],
            categoryFilterMode: 'startsWith',
            categoryExcludes: [],
            footballScores: true,
            languagePriority: ['Swedish', 'English', 'Spanish'],
            profileType: 'football'
        },
        {
            displayName: 'movies',
            searches: [],
            categoryFilters: [
                'se ', 'se|', 'se:', 'se-',
                'sweden', 'swedish', 'sverige', 'nordic', 'scandinavia',
                'uk ', 'uk|', 'uk:', 'uk-',
                'us ', 'us|', 'us:', 'us-'
            ],
            categoryFilterMode: 'startsWith',
            categoryExcludes: [],
            footballScores: false,
            languagePriority: ['Swedish', 'English'],
            profileType: 'movies',
            moviesEnabled: true
        },
        {
            displayName: 'tv',
            searches: ['svt', 'tv4', 'kanal'],
            categoryFilters: [
                'se ', 'se|', 'se:', 'se-',
                'sweden', 'swedish', 'sverige', 'nordic', 'scandinavia',
                'uk ', 'uk|', 'uk:', 'uk-',
                'us ', 'us|', 'us:', 'us-'
            ],
            categoryFilterMode: 'startsWith',
            categoryExcludes: [],
            footballScores: false,
            languagePriority: ['Swedish', 'English'],
            profileType: 'tv',
            seriesEnabled: true
        }
    ];
    var userProfiles = HARDCODED_PROFILES;
    var activeProfile = null;
    var profilePickerOpen = false;

    // ── State ──
    var channels = [];
    var groups = [];
    var favorites = {};
    var profileChannels = {};
    var savedSearches = [];

    // ── Series (VOD) state ──
    var seriesCategories = [];
    var seriesList = [];          // series in current category
    var seriesInfo = null;        // current series detail (seasons/episodes)
    var seriesView = 'none';      // 'none' | 'categories' | 'list' | 'seasons' | 'episodes'
    var currentSeriesCategory = null;
    var currentSeries = null;
    var currentSeason = null;

    var view = 'loading';   // 'loading' | 'home' | 'channels' | 'groups' | 'fullscreen'
    var currentProfile = null;
    var currentGroup = null;
    var currentSearch = null;
    var items = [];
    var focusedIndex = 0;
    var filterFocused = false;
    var playingChannel = null;
    var playingVod = false;      // true when playing a movie or series episode
    var playingVodTitle = '';     // display name of current VOD content
    var filterText = '';
    var sortMode = 'none';
    var workingHost = '';
    var addSearchMode = false;
    var overlayTimer = null;
    var FS_OVERLAY_TIMEOUT = 4000;
    var debugVisible = false;
    var profileDialogOpen = false;
    var pdFocusIndex = 0;  // 0=name, 1=username, 2=password, 3=keywords, 4=back, 5=save
    var qrOverlayOpen = false;
    var codeEntryOpen = false;
    var categoryLogOpen = false;
    var lastCategoryStats = null;

    // ── DOM ──
    var loadingEl     = document.getElementById('loading');
    var loadingHello  = document.getElementById('loading-hello');
    var loadingCat    = document.getElementById('loading-cat');
    var loadingCh     = document.getElementById('loading-ch');
    var homeScreen    = document.getElementById('home-screen');
    var homeList      = document.getElementById('home-list');
    var channelScreen = document.getElementById('channel-screen');
    var panelTitle    = document.getElementById('panel-title');
    var channelList   = document.getElementById('channel-list');
    var filterBar     = document.getElementById('filter-bar');
    var filterInput   = document.getElementById('filter-input');
    var npTitle       = document.getElementById('np-title');
    var npInfo        = document.getElementById('np-info');
    var fsOverlay     = document.getElementById('fs-overlay');
    var fsChInfo      = document.getElementById('fs-channel-info');
    var footerEl      = document.getElementById('footer');
    var bufferingEl   = document.getElementById('buffering');
    var clockEl       = document.getElementById('clock');
    var debugLogEl    = document.getElementById('debug-log');
    var profileDialog = document.getElementById('profile-dialog');
    var pdName       = document.getElementById('pd-name');
    var pdUsername    = document.getElementById('pd-username');
    var pdPassword   = document.getElementById('pd-password');
    var pdKeywords   = document.getElementById('pd-keywords');
    var pdBtnBack    = document.getElementById('pd-btn-back');
    var pdBtnSave    = document.getElementById('pd-btn-save');
    var qrOverlay    = document.getElementById('qr-overlay');
    var qrContainer  = document.getElementById('qr-container');
    var codeOverlay  = document.getElementById('code-overlay');
    var codeInput    = document.getElementById('code-input');
    var accountPicker = document.getElementById('account-picker');
    var accountPickerList = document.getElementById('account-picker-list');
    var accountPickerOpen = false;
    var accountFocusIndex = 0;
    var profilePicker = document.getElementById('profile-picker');
    var profilePickerList = document.getElementById('profile-picker-list');
    var pickerFocusIndex = 0;
    var channelCounter = document.getElementById('channel-counter');
    var categoryLogOverlay = document.getElementById('category-log-overlay');
    var categoryLogList = document.getElementById('category-log-list');
    var catTabLoaded = document.getElementById('cat-tab-loaded');
    var catTabSkipped = document.getElementById('cat-tab-skipped');
    var categoryLogTab = 0; // 0=loaded, 1=skipped
    var unsupportedScreen = document.getElementById('unsupported-screen');
    var unsupportedTitle = document.getElementById('unsupported-title');

    // ── Football scores ──
    var scoresPanel = document.getElementById('scores-panel');
    var scoresScroll = document.getElementById('scores-scroll');
    var scoresHint = document.getElementById('scores-hint');
    var welcomeImg = document.getElementById('welcome-img');
    var footballData = null;       // grouped match data from Football.fetchMatches
    var flatMatches = [];          // flat list for navigation
    var scoresFocusIndex = -1;     // -1 = not focused on scores
    var homePanelFocus = 'left';   // 'left' | 'right'
    var scoresEnabled = false;     // true if active profile is football profile
    var scoresOverlay = document.getElementById('scores-overlay');
    var soScroll = document.getElementById('so-scroll');
    var scoresOverlayOpen = false;
    var soFocusIndex = 0;          // focused match index in overlay
    var standingsView = false;     // true when showing league standings table
    var standingsData = [];        // parsed standings rows
    var standingsCompCode = '';    // current competition code
    var standingsCompName = '';    // current competition name
    var standingsFocusIndex = 0;   // focused row in standings
    var matchDetailView = false;   // true when showing match detail
    var matchDetailData = null;    // parsed match detail object

    // ── PiP (Picture-in-Picture) ──
    var pipContainer = document.getElementById('pip-container');
    var pipPlayerEl = document.getElementById('pip-player');
    var pipAudioIndicator = document.getElementById('pip-audio-indicator');
    var pipAudioText = document.getElementById('pip-audio-text');
    var pipChannel = null;         // channel object in PiP window
    var pipIndicatorTimer = null;

    // ── Subtitles ──
    var subtitleDisplay = document.getElementById('subtitle-display');
    var subtitleText = document.getElementById('subtitle-text');
    var subtitleIndicator = document.getElementById('subtitle-indicator');
    var subtitleIndicatorText = document.getElementById('subtitle-indicator-text');
    var subtitleIndicatorTimer = null;

    // ── Playback controls ──
    var playbackControls = document.getElementById('playback-controls');
    var playbackState = document.getElementById('playback-state');
    var playbackBarFill = document.getElementById('playback-bar-fill');
    var playbackTimeCurrent = document.getElementById('playback-time-current');
    var playbackTimeTotal = document.getElementById('playback-time-total');
    var playbackControlsTimer = null;
    var PLAYBACK_CONTROLS_TIMEOUT = 3000;
    var SEEK_STEP_MS = 15000; // 15 seconds

    // ── Left overlay (fullscreen menu panel) ──
    var leftOverlay = document.getElementById('left-overlay');
    var loHeader = document.getElementById('lo-header');
    var loScroll = document.getElementById('lo-scroll');
    var loHint = document.getElementById('lo-hint');
    var leftOverlayOpen = false;
    var loItems = [];              // current items in left overlay
    var loFocusIndex = 0;
    var loView = 'menu';           // 'menu' | 'channels'
    var loSearchKeyword = '';      // current search keyword if in channels view

    // ── Debug ──
    function debugLog(msg, type) {
        type = type || 'info';
        var line = document.createElement('div');
        line.className = 'debug-' + type;
        line.textContent = '[' + new Date().toLocaleTimeString() + '] ' + msg;
        debugLogEl.appendChild(line);
        debugLogEl.scrollTop = debugLogEl.scrollHeight;
    }

    // ── Clock ──
    function updateClock() {
        var d = new Date();
        var dd = String(d.getDate()).padStart(2, '0');
        var mm = String(d.getMonth() + 1).padStart(2, '0');
        var yy = d.getFullYear();
        var hh = String(d.getHours()).padStart(2, '0');
        var mi = String(d.getMinutes()).padStart(2, '0');
        clockEl.textContent = dd + '.' + mm + '.' + yy + ' - ' + hh + ':' + mi;
    }

    // ══════════════════════════════════════
    // INIT
    // ══════════════════════════════════════

    function init() {
        registerKeys();
        setupFilter();
        setupProfileDialog();
        loadFavorites();
        loadUserProfiles();
        Player.initPip(pipPlayerEl);
        updateClock();
        setInterval(updateClock, 30000);
        debugLogEl.style.display = 'none'; // hidden by default
        debugLog('starting', 'ok');

        // Restore last account
        try {
            var lastAcct = localStorage.getItem('iptv_active_account');
            if (lastAcct) {
                for (var a = 0; a < ACCOUNTS.length; a++) {
                    if (ACCOUNTS[a].name === lastAcct) { activeAccount = ACCOUNTS[a]; break; }
                }
            }
        } catch(e) {}

        // First launch — show account picker (or profile picker if account already set)
        if (!activeProfile) {
            loadingEl.classList.add('hidden');
            if (!activeAccount) {
                openAccountPicker();
            } else {
                openProfilePicker();
            }
            return;
        }

        // Returning user
        if (activeProfile.profileType === 'unsupported') {
            loadingEl.classList.add('hidden');
            showUnsupported(activeProfile.displayName);
            return;
        }
        var helloName = activeAccount ? activeAccount.name : activeProfile.displayName;
        loadingHello.textContent = 'hello ' + helloName + '...';
        startLoading();
    }

    function startLoading() {
        // Try cache first for instant startup
        var cached = Xtream.loadCache();
        if (cached && cached.channels && cached.channels.length > 0) {
            debugLog('cache hit: ' + cached.channels.length + ' ch', 'ok');
            channels = cached.channels;
            groups = Playlist.getGroups(channels);
            Tagger.tagChannels(channels);
            sortByLanguagePriority(channels);
            buildProfiles();
            loadingEl.classList.add('hidden');
            showHome();
            refreshInBackground();
            startPeriodicRefresh();
        } else {
            debugLog('no cache, loading fresh', 'info');
            tryXtreamHost(0);
        }
    }

    // ── Filter input ──
    function setupFilter() {
        var timer = null;
        filterInput.addEventListener('input', function() {
            clearTimeout(timer);
            timer = setTimeout(function() {
                filterText = filterInput.value.trim().toLowerCase();
                focusedIndex = 0;
                rebuildChannelList();
            }, 200);
        });
        filterInput.addEventListener('keydown', function(e) {
            if (e.keyCode === 13 || e.keyCode === 65376) { // Enter or Samsung Done
                filterInput.blur();
                filterFocused = false;
                filterBar.classList.remove('nav-focused');
                if (items.length > 0) focusedIndex = 0;
                renderChannels();
                e.preventDefault();
                e.stopPropagation();
            }
            if (e.keyCode === 40) { // Down
                filterInput.blur();
                filterFocused = false;
                filterBar.classList.remove('nav-focused');
                if (items.length > 0) focusedIndex = 0;
                renderChannels();
                e.preventDefault();
                e.stopPropagation();
            }
            if (e.keyCode === 27) { // Escape
                filterInput.value = '';
                filterText = '';
                filterInput.blur();
                filterFocused = false;
                filterBar.classList.remove('nav-focused');
                rebuildChannelList();
                e.preventDefault();
                e.stopPropagation();
            }
            if (e.keyCode >= 37 && e.keyCode <= 40) e.stopPropagation();
        });
        filterInput.addEventListener('focus', function() {
            filterFocused = true;
            filterBar.classList.add('nav-focused');
            renderChannels();
        });

        // Add-search mode: capture phase
        filterInput.addEventListener('keydown', function(e) {
            if (!addSearchMode) return;
            if (e.keyCode === 13 || e.keyCode === 65376) {
                confirmAddSearch();
                e.preventDefault();
                e.stopPropagation();
            }
            if (e.keyCode === 27 || e.keyCode === 10009 || e.keyCode === 8) {
                if (filterInput.value === '') {
                    cancelAddSearch();
                    e.preventDefault();
                    e.stopPropagation();
                }
            }
        }, true);

        // Samsung TV Done blurs the input
        filterInput.addEventListener('blur', function() {
            if (!addSearchMode) return;
            setTimeout(function() {
                if (addSearchMode && filterInput.value.trim()) {
                    confirmAddSearch();
                }
            }, 100);
        });
    }

    function showFilterBar() {
        filterBar.classList.remove('hidden');
    }
    function hideFilterBar() {
        filterBar.classList.add('hidden');
        filterInput.value = '';
        filterText = '';
        filterFocused = false;
        filterBar.classList.remove('nav-focused');
    }
    function focusFilterBar() {
        filterFocused = true;
        filterBar.classList.add('nav-focused');
        filterInput.focus();
        renderChannels();
    }

    // ══════════════════════════════════════
    // LOADING
    // ══════════════════════════════════════

    function updateLoadingStatus(text) {
        // Intercept category stats message
        if (text.indexOf('__CATEGORY_STATS__') === 0) {
            try {
                var stats = JSON.parse(text.substring(18));
                lastCategoryStats = stats;
                loadingCat.textContent = 'categories: ' + stats.added + ' loaded, ' + stats.skipped + ' skipped';
            } catch(e) {}
            return;
        }

        // Parse status to show on the multi-line loading screen
        var t = text.toLowerCase();
        if (t.indexOf('/') !== -1 && t.indexOf('categor') !== -1) {
            loadingCat.textContent = 'loading categories... ' + text;
        } else if (t.indexOf('ch') !== -1 || t.indexOf('channel') !== -1 || t.indexOf('stream') !== -1) {
            loadingCh.textContent = 'loading channels.... ' + text;
        } else {
            loadingCat.textContent = text;
        }
    }

    function getHostOrder() {
        var lastHost = Xtream.getWorkingHost();
        if (!lastHost) return HOSTS.slice();
        var order = [lastHost];
        for (var i = 0; i < HOSTS.length; i++) {
            if (HOSTS[i] !== lastHost) order.push(HOSTS[i]);
        }
        return order;
    }

    function tryXtreamHost(index, hostOrder) {
        hostOrder = hostOrder || getHostOrder();
        if (index >= hostOrder.length) {
            debugLog('all hosts failed', 'fail');
            loadingCat.textContent = 'all hosts failed...';
            return;
        }
        var host = hostOrder[index];
        var cred = getActiveCredentials();
        debugLog('trying ' + host + ' (' + (index+1) + '/' + hostOrder.length + ')', 'try');

        Xtream.loadAll(host, cred.username, cred.password,
            function(status) {
                debugLog(status, 'info');
                updateLoadingStatus(status);
            },
            function(err, result) {
                if (err) {
                    debugLog(host + ' failed: ' + err, 'fail');
                    tryXtreamHost(index + 1, hostOrder);
                    return;
                }
                workingHost = host;
                onChannelsLoaded(result);
            },
            getActiveFilters(),
            getActiveExcludes(),
            getActiveFilterMode()
        );
    }

    function sortByLanguagePriority(channelList) {
        var priority = (activeProfile && activeProfile.languagePriority) ? activeProfile.languagePriority : null;
        if (!priority || priority.length === 0) return channelList;

        // Build a rank map: Swedish=0, English=1, Spanish=2, unlisted=999
        var rankMap = {};
        for (var p = 0; p < priority.length; p++) {
            rankMap[priority[p]] = p;
        }

        channelList.sort(function(a, b) {
            var la = (a.tags && a.tags.language) ? a.tags.language : null;
            var lb = (b.tags && b.tags.language) ? b.tags.language : null;
            var ra = (la && rankMap[la] !== undefined) ? rankMap[la] : 999;
            var rb = (lb && rankMap[lb] !== undefined) ? rankMap[lb] : 999;
            return ra - rb;
        });
        return channelList;
    }

    function onChannelsLoaded(result) {
        channels = result;
        groups = Playlist.getGroups(channels);
        Tagger.tagChannels(channels);
        sortByLanguagePriority(channels);
        buildProfiles();
        debugLog(channels.length + ' channels via ' + workingHost, 'ok');
        loadingEl.classList.add('hidden');
        showHome();
        startPeriodicRefresh();
    }

    var bgRefreshTimer = null;
    var BG_REFRESH_INTERVAL = 5 * 60 * 1000; // refresh channel names every 5 minutes

    function refreshInBackground() {
        var hostOrder = getHostOrder();
        tryBackgroundHost(0, hostOrder);
    }

    function reloadChannels() {
        debugLog('manual reload triggered', 'info');
        resetLeftOverlayState();
        // Stop any playing video
        if (Player.isPipActive()) closePip();
        if (playingChannel) {
            Player.stop();
            playingChannel = null;
        }
        homeScreen.classList.remove('video-behind');
        try { localStorage.removeItem('iptv_cache'); } catch(e) {}
        loadingEl.classList.remove('hidden');
        loadingHello.textContent = 'reloading...';
        loadingCat.textContent = '';
        loadingCh.textContent = '';
        switchScreen('home'); // keep home visible behind loading
        loadingEl.classList.remove('hidden');
        tryXtreamHost(0);
    }

    function startPeriodicRefresh() {
        if (bgRefreshTimer) clearInterval(bgRefreshTimer);
        bgRefreshTimer = setInterval(function() {
            debugLog('periodic refresh...', 'info');
            refreshInBackground();
        }, BG_REFRESH_INTERVAL);
    }

    function tryBackgroundHost(index, hostOrder) {
        if (index >= hostOrder.length) {
            debugLog('bg refresh: all hosts failed', 'fail');
            return;
        }
        var host = hostOrder[index];
        var cred = getActiveCredentials();
        debugLog('bg refresh: ' + host, 'info');

        Xtream.loadAll(host, cred.username, cred.password,
            function() {},
            function(err, result) {
                if (err) {
                    tryBackgroundHost(index + 1, hostOrder);
                    return;
                }
                workingHost = host;
                channels = result;
                groups = Playlist.getGroups(channels);
                Tagger.tagChannels(channels);
                sortByLanguagePriority(channels);
                buildProfiles();
                debugLog('bg refresh: ' + channels.length + ' ch via ' + host, 'ok');
                if (view === 'home') renderHome();
                else if (view === 'channels' || view === 'groups') rebuildChannelList();
            },
            getActiveFilters(),
            getActiveExcludes(),
            getActiveFilterMode()
        );
    }

    // ══════════════════════════════════════
    // PROFILES & MATCHING
    // ══════════════════════════════════════

    function buildProfiles() {
        profileChannels = {};
        for (var p = 0; p < PROFILES.length; p++) {
            var pr = PROFILES[p];
            if (pr.special) continue;
            profileChannels[pr.id] = matchChannels(pr);
            debugLog('[' + pr.id + '] ' + profileChannels[pr.id].length + ' ch', 'ok');
        }
    }

    function matchChannels(profile) {
        var matched = [], seen = {};
        for (var i = 0; i < channels.length; i++) {
            var ch = channels[i];
            if (seen[ch.url]) continue;
            var nl = ch.name.toLowerCase();
            var gl = (ch.group || '').toLowerCase();
            var hit = false;
            if (profile.keywords) {
                for (var k = 0; k < profile.keywords.length; k++) {
                    if (nl.indexOf(profile.keywords[k]) !== -1 || gl.indexOf(profile.keywords[k]) !== -1) {
                        hit = true; break;
                    }
                }
            }
            if (!hit && profile.country && ch.tags && ch.tags.country === profile.country) hit = true;
            if (hit) { seen[ch.url] = true; matched.push(ch); }
        }
        return matched;
    }

    function getProfileChannels(profile) {
        if (profile.special === 'favorites') {
            return channels.filter(function(ch) { return !!favorites[ch.name]; });
        }
        return profileChannels[profile.id] || [];
    }

    function searchChannels(keyword) {
        var kw = keyword.toLowerCase();
        var matched = [], seen = {};
        for (var i = 0; i < channels.length; i++) {
            var ch = channels[i];
            if (seen[ch.url]) continue;
            var nl = ch.name.toLowerCase();
            var gl = (ch.group || '').toLowerCase();
            if (nl.indexOf(kw) !== -1 || gl.indexOf(kw) !== -1) {
                seen[ch.url] = true;
                matched.push(ch);
            }
        }
        return matched;
    }

    // ══════════════════════════════════════
    // FAVORITES
    // ══════════════════════════════════════

    function toggleFavorite() {
        if (view !== 'channels' || filterFocused) return;
        var it = items[focusedIndex];
        if (!it || it.type !== 'channel') return;
        var name = it.ch.name;
        if (favorites[name]) delete favorites[name];
        else favorites[name] = true;
        saveFavorites();
        renderChannels();
    }

    function loadFavorites() {
        try { var s = localStorage.getItem('iptv_favorites'); if (s) favorites = JSON.parse(s); } catch(e) {}
    }
    function saveFavorites() {
        try { localStorage.setItem('iptv_favorites', JSON.stringify(favorites)); } catch(e) {}
    }

    // ══════════════════════════════════════
    // USER PROFILES
    // ══════════════════════════════════════

    function loadUserProfiles() {
        userProfiles = HARDCODED_PROFILES;

        // Load saved searches per profile from localStorage
        try {
            var s = localStorage.getItem('iptv_profile_searches');
            if (s) {
                var saved = JSON.parse(s);
                for (var p = 0; p < userProfiles.length; p++) {
                    if (saved[userProfiles[p].displayName]) {
                        userProfiles[p].searches = saved[userProfiles[p].displayName];
                    }
                }
            }
        } catch(e) {}

        // Check if a profile was previously selected
        var activeName = null;
        try { activeName = localStorage.getItem('iptv_active_profile'); } catch(e) {}
        activeProfile = null;
        if (activeName) {
            for (var i = 0; i < userProfiles.length; i++) {
                if (userProfiles[i].displayName === activeName) { activeProfile = userProfiles[i]; break; }
            }
        }

        if (activeProfile) {
            // Returning user — sync searches
            savedSearches = activeProfile.searches;
        }
        // If no activeProfile, first launch — will show picker
    }

    function saveUserProfiles() {
        // Only persist searches per profile (profiles themselves are hardcoded)
        var searches = {};
        for (var i = 0; i < userProfiles.length; i++) {
            searches[userProfiles[i].displayName] = userProfiles[i].searches;
        }
        try { localStorage.setItem('iptv_profile_searches', JSON.stringify(searches)); } catch(e) {}
    }

    function setActiveProfile(profile) {
        activeProfile = profile;
        savedSearches = profile.searches;
        try { localStorage.setItem('iptv_active_profile', profile.displayName); } catch(e) {}
    }

    function getActiveCredentials() {
        if (activeAccount) {
            return { username: activeAccount.username, password: activeAccount.password };
        }
        return DEFAULT_CREDENTIALS;
    }

    function getActiveFilters() {
        if (activeProfile && activeProfile.categoryFilters) {
            return activeProfile.categoryFilters;
        }
        return [];
    }

    function getActiveExcludes() {
        if (activeProfile && activeProfile.categoryExcludes) {
            return activeProfile.categoryExcludes;
        }
        return EXCLUDES_ALL;
    }

    function getActiveFilterMode() {
        if (activeProfile && activeProfile.categoryFilterMode) {
            return activeProfile.categoryFilterMode;
        }
        return 'contains';
    }

    function addSavedSearch(keyword) {
        keyword = keyword.trim().toLowerCase();
        if (!keyword) return false;
        for (var i = 0; i < savedSearches.length; i++) {
            if (savedSearches[i].toLowerCase() === keyword) return false;
        }
        savedSearches.push(keyword);
        activeProfile.searches = savedSearches;
        saveUserProfiles();
        return true;
    }

    function removeSavedSearch(keyword) {
        var idx = -1;
        for (var i = 0; i < savedSearches.length; i++) {
            if (savedSearches[i] === keyword) { idx = i; break; }
        }
        if (idx >= 0) {
            savedSearches.splice(idx, 1);
            activeProfile.searches = savedSearches;
            saveUserProfiles();
            return true;
        }
        return false;
    }

    // deleteUserProfile removed — profiles are hardcoded

    // ══════════════════════════════════════
    // VIEWS
    // ══════════════════════════════════════

    function switchScreen(name) {
        homeScreen.classList.add('hidden');
        channelScreen.classList.add('hidden');
        unsupportedScreen.classList.add('hidden');
        if (name === 'home') homeScreen.classList.remove('hidden');
        else if (name === 'channels') channelScreen.classList.remove('hidden');
        else if (name === 'unsupported') unsupportedScreen.classList.remove('hidden');
    }

    function showHome() {
        view = 'home';
        currentProfile = null;
        currentGroup = null;
        currentSearch = null;
        seriesView = 'none';
        movieView = 'none';
        focusedIndex = 0;
        filterFocused = false;
        addSearchMode = false;
        sortMode = 'none';
        homePanelFocus = 'left';
        scoresFocusIndex = -1;
        hideFilterBar();
        // Close PiP if active
        if (Player.isPipActive()) closePip();
        // Keep video playing in background — just overlay home on top
        if (playingChannel) {
            homeScreen.classList.add('video-behind');
        } else {
            homeScreen.classList.remove('video-behind');
        }
        switchScreen('home');
        buildHomeItems();
        // Skip non-selectable items
        focusedIndex = 0;
        while (focusedIndex < items.length && !isSelectableHomeItem(focusedIndex)) focusedIndex++;
        renderHome();
        initScoresPanel();
    }

    function showChannelView(title, src) {
        view = 'channels';
        focusedIndex = 0;
        filterFocused = false;
        sortMode = 'none';
        filterText = '';
        filterInput.value = '';
        panelTitle.textContent = title;
        switchScreen('channels');
        showFilterBar();
        rebuildChannelList();
    }

    function showSearchResults(keyword, autoplay) {
        currentProfile = null;
        currentGroup = null;
        currentSearch = keyword;
        showChannelView(keyword);
        // Auto-play first result if requested
        if (autoplay && items.length > 0 && items[0].type === 'channel') {
            playChannel(items[0].ch);
        }
    }

    function showProfileChannels(profile) {
        currentProfile = profile;
        currentGroup = null;
        currentSearch = null;
        showChannelView(profile.label);
    }

    function showUnsupported(profileName) {
        view = 'unsupported';
        unsupportedTitle.textContent = profileName;
        // Stop any playing video
        if (playingChannel) {
            Player.stop();
            playingChannel = null;
        }
        switchScreen('unsupported');
        footerEl.style.display = '';
    }

    function showGroups() {
        view = 'groups';
        currentProfile = null;
        currentGroup = null;
        currentSearch = null;
        focusedIndex = 0;
        filterFocused = false;
        sortMode = 'none';
        filterText = '';
        filterInput.value = '';
        panelTitle.textContent = 'Browse all';
        switchScreen('channels');
        showFilterBar();
        rebuildChannelList();
    }

    function showGroupChannels(group) {
        currentProfile = null;
        currentGroup = group;
        currentSearch = null;
        showChannelView(group);
    }

    // ══════════════════════════════════════
    // SERIES (VOD) BROWSING
    // ══════════════════════════════════════

    function isSeriesProfile() {
        return activeProfile && activeProfile.seriesEnabled;
    }

    function showSeriesCategories() {
        seriesView = 'categories';
        view = 'channels'; // reuse channel screen
        focusedIndex = 0;
        filterFocused = false;
        filterText = '';
        filterInput.value = '';
        panelTitle.textContent = 'Series';
        switchScreen('channels');
        showFilterBar();

        if (seriesCategories.length > 0) {
            buildSeriesCategoryItems();
            renderChannels();
            return;
        }

        // Load series categories from API
        items = [];
        channelList.innerHTML = '<div class="chi empty">loading categories...</div>';
        channelCounter.textContent = '';

        var creds = getActiveCredentials();
        Xtream.getSeriesCategories(function(err, cats) {
            if (err) {
                channelList.innerHTML = '<div class="chi empty">error: ' + err + '</div>';
                return;
            }
            seriesCategories = cats || [];
            // Filter categories using profile filters
            if (activeProfile && activeProfile.categoryFilters && activeProfile.categoryFilters.length > 0) {
                seriesCategories = Xtream.filterCategories(seriesCategories, activeProfile.categoryFilters, activeProfile.categoryExcludes, activeProfile.categoryFilterMode);
            }
            buildSeriesCategoryItems();
            renderChannels();
        });
    }

    function buildSeriesCategoryItems() {
        items = [];
        var kw = filterText.toLowerCase();
        for (var i = 0; i < seriesCategories.length; i++) {
            var cat = seriesCategories[i];
            if (kw && (cat.category_name || '').toLowerCase().indexOf(kw) === -1) continue;
            items.push({ type: 'group', label: cat.category_name, group: cat.category_id, _catName: cat.category_name });
        }
    }

    function showSeriesList(categoryId, categoryName) {
        seriesView = 'list';
        currentSeriesCategory = { id: categoryId, name: categoryName };
        focusedIndex = 0;
        filterText = '';
        filterInput.value = '';
        panelTitle.textContent = categoryName;

        items = [];
        channelList.innerHTML = '<div class="chi empty">loading series...</div>';
        channelCounter.textContent = '';

        Xtream.getSeriesByCategory(categoryId, function(err, list) {
            if (err) {
                channelList.innerHTML = '<div class="chi empty">error: ' + err + '</div>';
                return;
            }
            seriesList = list || [];
            buildSeriesListItems();
            renderChannels();
        });
    }

    function buildSeriesListItems() {
        items = [];
        var kw = filterText.toLowerCase();
        for (var i = 0; i < seriesList.length; i++) {
            var s = seriesList[i];
            var name = s.name || 'Unknown';
            if (kw && name.toLowerCase().indexOf(kw) === -1) continue;
            items.push({
                type: 'series',
                label: name,
                seriesId: s.series_id,
                year: s.year || '',
                rating: s.rating || ''
            });
        }
    }

    function showSeriesSeasons(seriesId, seriesName) {
        seriesView = 'seasons';
        currentSeries = { id: seriesId, name: seriesName };
        focusedIndex = 0;
        filterText = '';
        filterInput.value = '';
        panelTitle.textContent = seriesName;

        items = [];
        channelList.innerHTML = '<div class="chi empty">loading...</div>';
        channelCounter.textContent = '';

        Xtream.getSeriesInfo(seriesId, function(err, info) {
            if (err) {
                channelList.innerHTML = '<div class="chi empty">error: ' + err + '</div>';
                return;
            }
            seriesInfo = info;
            buildSeasonsItems();
            renderChannels();
        });
    }

    function buildSeasonsItems() {
        items = [];
        if (!seriesInfo || !seriesInfo.episodes) return;
        var seasons = Object.keys(seriesInfo.episodes);
        seasons.sort(function(a, b) { return parseInt(a) - parseInt(b); });
        for (var i = 0; i < seasons.length; i++) {
            var num = seasons[i];
            var eps = seriesInfo.episodes[num];
            items.push({
                type: 'season',
                label: 'Season ' + num + ' (' + eps.length + ' ep)',
                seasonNum: num
            });
        }
    }

    function showSeriesEpisodes(seasonNum) {
        seriesView = 'episodes';
        currentSeason = seasonNum;
        focusedIndex = 0;
        panelTitle.textContent = currentSeries.name + ' — S' + seasonNum;

        buildEpisodesItems();
        renderChannels();
    }

    function buildEpisodesItems() {
        items = [];
        if (!seriesInfo || !seriesInfo.episodes || !seriesInfo.episodes[currentSeason]) return;
        var eps = seriesInfo.episodes[currentSeason];
        for (var i = 0; i < eps.length; i++) {
            var ep = eps[i];
            var ext = ep.container_extension || 'mkv';
            items.push({
                type: 'episode',
                label: 'E' + (ep.episode_num || (i + 1)) + '. ' + (ep.title || 'Episode ' + (i + 1)),
                url: Xtream.seriesStreamUrl(ep.id, ext),
                episodeId: ep.id,
                info: ep.info || ''
            });
        }
    }

    function playEpisode(item) {
        var ch = {
            name: item.label,
            url: item.url,
            group: currentSeries ? currentSeries.name : ''
        };
        playChannel(ch);
        playingVod = true;
        playingVodTitle = (currentSeries ? currentSeries.name + ' — ' : '') + item.label;
    }

    // ══════════════════════════════════════
    // MOVIES (VOD) BROWSING
    // ══════════════════════════════════════

    var movieCategories = [];
    var movieList = [];
    var movieView = 'none'; // 'none' | 'categories' | 'list'
    var currentMovieCategory = null;

    function isMoviesProfile() {
        return activeProfile && activeProfile.moviesEnabled;
    }

    function showMovieCategories() {
        movieView = 'categories';
        view = 'channels'; // reuse channel screen
        focusedIndex = 0;
        filterFocused = false;
        filterText = '';
        filterInput.value = '';
        panelTitle.textContent = 'Movies';
        switchScreen('channels');
        showFilterBar();

        if (movieCategories.length > 0) {
            buildMovieCategoryItems();
            renderChannels();
            return;
        }

        items = [];
        channelList.innerHTML = '<div class="chi empty">loading categories...</div>';
        channelCounter.textContent = '';

        Xtream.getVodCategories(function(err, cats) {
            if (err) {
                channelList.innerHTML = '<div class="chi empty">error: ' + err + '</div>';
                return;
            }
            movieCategories = cats || [];
            if (activeProfile && activeProfile.categoryFilters && activeProfile.categoryFilters.length > 0) {
                movieCategories = Xtream.filterCategories(movieCategories, activeProfile.categoryFilters, activeProfile.categoryExcludes, activeProfile.categoryFilterMode);
            }
            buildMovieCategoryItems();
            renderChannels();
        });
    }

    function buildMovieCategoryItems() {
        items = [];
        var kw = filterText.toLowerCase();
        for (var i = 0; i < movieCategories.length; i++) {
            var cat = movieCategories[i];
            if (kw && (cat.category_name || '').toLowerCase().indexOf(kw) === -1) continue;
            items.push({ type: 'group', label: cat.category_name, group: cat.category_id, _catName: cat.category_name });
        }
    }

    function showMovieList(categoryId, categoryName) {
        movieView = 'list';
        currentMovieCategory = { id: categoryId, name: categoryName };
        focusedIndex = 0;
        filterText = '';
        filterInput.value = '';
        panelTitle.textContent = categoryName;

        items = [];
        channelList.innerHTML = '<div class="chi empty">loading movies...</div>';
        channelCounter.textContent = '';

        Xtream.getVodByCategory(categoryId, function(err, list) {
            if (err) {
                channelList.innerHTML = '<div class="chi empty">error: ' + err + '</div>';
                return;
            }
            movieList = list || [];
            buildMovieListItems();
            renderChannels();
        });
    }

    function buildMovieListItems() {
        items = [];
        var kw = filterText.toLowerCase();
        for (var i = 0; i < movieList.length; i++) {
            var m = movieList[i];
            var name = m.name || 'Unknown';
            if (kw && name.toLowerCase().indexOf(kw) === -1) continue;
            var ext = m.container_extension || 'mkv';
            items.push({
                type: 'movie',
                label: name,
                url: Xtream.vodStreamUrl(m.stream_id, ext),
                year: m.year || '',
                rating: m.rating || '',
                streamId: m.stream_id
            });
        }
    }

    function playMovie(item) {
        var ch = {
            name: item.label,
            url: item.url,
            group: currentMovieCategory ? currentMovieCategory.name : ''
        };
        playChannel(ch);
        playingVod = true;
        playingVodTitle = item.label;
    }

    // ══════════════════════════════════════
    // HOME — build & render
    // ══════════════════════════════════════

    function buildHomeItems() {
        items = [];

        // Active profile indicator
        var accountLabel = activeAccount ? activeAccount.name : '?';
        var profileLabel = activeProfile ? activeProfile.displayName : '—';
        items.push({ type: 'profile-header', label: accountLabel + ' - ' + profileLabel });

        // Saved searches (channel groups for fotball)
        for (var j = 0; j < savedSearches.length; j++) {
            items.push({ type: 'search', label: savedSearches[j], keyword: savedSearches[j] });
        }
        // + Add search
        items.push({ type: 'addsearch', label: '+ add search' });

        // Separator
        items.push({ type: 'separator' });

        // Series browsing (for tv profiles)
        if (isSeriesProfile()) {
            items.push({ type: 'series-browse', label: 'series' });
        }

        // Movies browsing (for movies profiles)
        if (isMoviesProfile()) {
            items.push({ type: 'movies-browse', label: 'movies' });
        }

        // Browse all channels
        items.push({ type: 'browse', label: 'all' });

        // Separator before actions
        items.push({ type: 'separator' });

        // Reload channels
        items.push({ type: 'reload', label: '- reload' });

        // Switch profile
        items.push({ type: 'switch-action', label: '- switch' });
    }

    function renderHome() {
        var html = '';
        for (var i = 0; i < items.length; i++) {
            var it = items[i];
            // Don't highlight items when scores panel is focused
            var f = (homePanelFocus === 'left' && i === focusedIndex) ? ' focused' : '';

            if (it.type === 'profile-header') {
                html += '<div class="hmi dim" data-i="' + i + '" style="font-size:16px;margin-bottom:8px;pointer-events:none;">' +
                        esc(it.label) + '</div>';
            }
            else if (it.type === 'separator') {
                html += '<div class="hmi sep-line" data-i="' + i + '"></div>';
            }
            else if (it.type === 'search' || it.type === 'browse' || it.type === 'series-browse' || it.type === 'movies-browse') {
                html += '<div class="hmi' + f + '" data-i="' + i + '">' +
                        '<span class="prefix">&gt;</span>' + esc(it.label) + '</div>';
            }
            else if (it.type === 'addsearch' || it.type === 'reload' ||
                     it.type === 'switch-action') {
                html += '<div class="hmi dim' + f + '" data-i="' + i + '">' + esc(it.label) + '</div>';
            }
        }
        homeList.innerHTML = html;
        scrollToFocused(homeList, 'hmi');
    }

    // ══════════════════════════════════════
    // CHANNELS / GROUPS — build & render
    // ══════════════════════════════════════

    function rebuildChannelList() {
        if (seriesView === 'categories') {
            buildSeriesCategoryItems();
        } else if (seriesView === 'list') {
            buildSeriesListItems();
        } else if (movieView === 'categories') {
            buildMovieCategoryItems();
        } else if (movieView === 'list') {
            buildMovieListItems();
        } else if (view === 'groups') {
            items = buildGroupItems();
        } else {
            items = buildChannelItems();
        }
        renderChannels();
    }

    function buildChannelItems() {
        var src;
        if (currentSearch) {
            src = searchChannels(currentSearch);
        } else if (currentProfile) {
            src = getProfileChannels(currentProfile);
        } else if (currentGroup) {
            src = Playlist.filterByGroup(channels, currentGroup);
        } else {
            src = channels;
        }
        if (filterText) {
            src = src.filter(function(ch) { return ch.name.toLowerCase().indexOf(filterText) !== -1; });
        }
        if (sortMode === 'az') src = sortChannels(src, false);
        else if (sortMode === 'za') src = sortChannels(src, true);

        var list = [];
        for (var i = 0; i < src.length; i++) {
            list.push({ type: 'channel', ch: src[i] });
        }
        return list;
    }

    function buildGroupItems() {
        var list = [];
        var src = groups;
        if (filterText) {
            src = src.filter(function(g) { return g.toLowerCase().indexOf(filterText) !== -1; });
        }
        if (sortMode === 'az') src = sortStrings(src, false);
        else if (sortMode === 'za') src = sortStrings(src, true);
        for (var i = 0; i < src.length; i++) {
            list.push({ type: 'group', label: src[i], group: src[i] });
        }
        return list;
    }

    function renderChannels() {
        var html = '';
        for (var i = 0; i < items.length; i++) {
            var it = items[i];
            var f = (!filterFocused && i === focusedIndex) ? ' focused' : '';

            if (it.type === 'channel') {
                var ch = it.ch;
                var playing = isPlaying(ch) ? ' playing' : '';
                var fav = favorites[ch.name] ? '<span class="ch-fav">*</span>' : '';
                var tag = (ch.tags && ch.tags.quality) ? '<span class="ch-tag">' + esc(ch.tags.quality) + '</span>' : '';

                html += '<div class="chi' + f + playing + '" data-i="' + i + '">' +
                        '<span class="prefix">&gt;</span>' + esc(ch.name) + tag + fav +
                        '</div>';
            }
            else if (it.type === 'group') {
                html += '<div class="chi' + f + '" data-i="' + i + '">' +
                        '<span class="prefix">&gt;</span>' + esc(it.label) + '</div>';
            }
            else if (it.type === 'series') {
                var meta = '';
                if (it.year) meta += it.year;
                if (it.rating) meta += (meta ? ' · ' : '') + '★' + it.rating;
                var metaHtml = meta ? '<span class="ch-tag">' + esc(meta) + '</span>' : '';
                html += '<div class="chi' + f + '" data-i="' + i + '">' +
                        '<span class="prefix">&gt;</span>' + esc(it.label) + metaHtml + '</div>';
            }
            else if (it.type === 'season') {
                html += '<div class="chi' + f + '" data-i="' + i + '">' +
                        '<span class="prefix">&gt;</span>' + esc(it.label) + '</div>';
            }
            else if (it.type === 'episode') {
                html += '<div class="chi' + f + '" data-i="' + i + '">' +
                        '<span class="prefix">&gt;</span>' + esc(it.label) + '</div>';
            }
            else if (it.type === 'movie') {
                var meta = '';
                if (it.year) meta += it.year;
                if (it.rating) meta += (meta ? ' · ' : '') + '★' + it.rating;
                var metaHtml = meta ? '<span class="ch-tag">' + esc(meta) + '</span>' : '';
                html += '<div class="chi' + f + '" data-i="' + i + '">' +
                        '<span class="prefix">&gt;</span>' + esc(it.label) + metaHtml + '</div>';
            }
        }
        if (items.length === 0) {
            html = '<div class="chi empty">no results...</div>';
        }
        channelList.innerHTML = html;
        scrollToFocused(channelList, 'chi');
        // Update channel counter
        var counterLabel = ' channels';
        if (seriesView === 'categories' || movieView === 'categories') counterLabel = ' categories';
        else if (seriesView === 'list') counterLabel = ' series';
        else if (seriesView === 'seasons') counterLabel = ' seasons';
        else if (seriesView === 'episodes') counterLabel = ' episodes';
        else if (movieView === 'list') counterLabel = ' movies';
        channelCounter.textContent = items.length + counterLabel;
    }

    function scrollToFocused(container, cls) {
        if (filterFocused) return;
        var els = container.getElementsByClassName(cls);
        if (els[focusedIndex]) {
            els[focusedIndex].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
    }

    function sortStrings(arr, reverse) {
        var copy = arr.slice();
        var hasAll = copy[0] === 'All Channels';
        var toSort = hasAll ? copy.slice(1) : copy;
        toSort.sort(function(a, b) {
            var c = a.toLowerCase().localeCompare(b.toLowerCase());
            return reverse ? -c : c;
        });
        return hasAll ? ['All Channels'].concat(toSort) : toSort;
    }

    function sortChannels(arr, reverse) {
        var copy = arr.slice();
        copy.sort(function(a, b) {
            var c = a.name.toLowerCase().localeCompare(b.name.toLowerCase());
            return reverse ? -c : c;
        });
        return copy;
    }

    function isPlaying(ch) {
        return playingChannel && playingChannel.url === ch.url;
    }

    function esc(str) {
        var d = document.createElement('div');
        d.appendChild(document.createTextNode(str));
        return d.innerHTML;
    }

    // ══════════════════════════════════════
    // PLAYBACK
    // ══════════════════════════════════════

    function playChannel(ch) {
        // Close PiP when switching main channel from browser
        if (Player.isPipActive()) closePip();
        // Reset subtitles for new stream
        hideSubtitles();
        playingChannel = ch;
        playingVod = false;
        playingVodTitle = '';
        npTitle.textContent = 'Watching: ' + ch.name;
        npInfo.textContent = ch.group || '';
        Player.open(ch.url);
        renderChannels();
    }

    var preFullscreenView = 'channels'; // track where user came from before fullscreen

    function enterFullscreen() {
        if (!playingChannel) return;
        preFullscreenView = view; // remember where we came from
        view = 'fullscreen';
        // Hide everything — AVPlay is always rendering fullscreen at z-index 1
        channelScreen.classList.add('hidden');
        homeScreen.classList.add('hidden');
        footerEl.style.display = 'none';
        fsOverlay.classList.remove('hidden');
        showFsOverlay(playingChannel.name);
    }

    function exitFullscreen() {
        // Close overlays
        closePip();
        if (leftOverlayOpen) closeLeftOverlay();
        if (scoresOverlayOpen) closeScoresOverlay();
        if (vodOverlayOpen) closeVodOverlay();
        fsOverlay.classList.add('hidden');
        fsOverlay.classList.remove('visible');
        fsOverlay.classList.remove('pip-active');
        footerEl.style.display = '';
        // Return to where user came from
        if (preFullscreenView === 'home') {
            view = 'home';
            homeScreen.classList.remove('hidden');
        } else {
            view = 'channels';
            channelScreen.classList.remove('hidden');
        }
    }

    function showFsOverlay(text) {
        fsChInfo.textContent = text;
        fsOverlay.classList.add('visible');
        clearTimeout(overlayTimer);
        overlayTimer = setTimeout(function() { fsOverlay.classList.remove('visible'); }, FS_OVERLAY_TIMEOUT);
    }

    // ══════════════════════════════════════
    // PIP (Picture-in-Picture)
    // ══════════════════════════════════════
    // BLUE button in fullscreen → opens channel browser to pick PiP stream
    // Once PiP is active:
    //   BLUE → swap audio between main and PiP
    //   BACK → close PiP, return to normal fullscreen
    // PiP uses HTML5 <video> (muted), AVPlay keeps audio.

    // PiP selection state — reuses scores overlay
    var pipSelectMode = false;         // true when scores overlay is in PiP-pick mode
    var pipSearchResults = [];         // channel results after picking a match
    var pipSearchFocusIndex = 0;       // focused channel in PiP search results
    var pipShowingResults = false;     // true when showing channel list inside overlay

    // ══════════════════════════════════════
    // SUBTITLES
    // ══════════════════════════════════════

    function toggleSubtitles() {
        var tracks = Player.getSubtitleTracks();
        if (tracks.length === 0) {
            showSubtitleIndicator('no subtitles available');
            return;
        }
        var result = Player.cycleSubtitle();
        if (result.active) {
            showSubtitleIndicator('subtitle: ' + result.track.label);
            subtitleDisplay.classList.remove('hidden');
        } else {
            showSubtitleIndicator('subtitles off');
            subtitleDisplay.classList.add('hidden');
            subtitleText.innerHTML = '';
        }
    }

    function showSubtitleIndicator(msg) {
        subtitleIndicatorText.textContent = msg;
        subtitleIndicator.classList.remove('hidden');
        subtitleIndicator.classList.add('visible');
        clearTimeout(subtitleIndicatorTimer);
        subtitleIndicatorTimer = setTimeout(function() {
            subtitleIndicator.classList.remove('visible');
        }, 2500);
    }

    function hideSubtitles() {
        Player.disableSubtitle();
        subtitleDisplay.classList.add('hidden');
        subtitleText.innerHTML = '';
    }

    // ══════════════════════════════════════
    // PLAYBACK CONTROLS (seek, play/pause indicator)
    // ══════════════════════════════════════

    function formatTime(ms) {
        var totalSec = Math.floor(ms / 1000);
        var h = Math.floor(totalSec / 3600);
        var m = Math.floor((totalSec % 3600) / 60);
        var s = totalSec % 60;
        if (h > 0) {
            return h + ':' + (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
        }
        return m + ':' + (s < 10 ? '0' : '') + s;
    }

    function showPlaybackControls(stateText) {
        var pos = Player.getCurrentPosition();
        var dur = Player.getDuration();

        playbackState.textContent = stateText || '';

        if (dur > 0) {
            playbackTimeCurrent.textContent = formatTime(pos);
            playbackTimeTotal.textContent = formatTime(dur);
            var pct = Math.min((pos / dur) * 100, 100);
            playbackBarFill.style.width = pct + '%';
            playbackTimeCurrent.parentElement.style.display = 'flex';
        } else {
            // Live stream — no duration, hide progress bar
            playbackTimeCurrent.parentElement.style.display = 'none';
        }

        playbackControls.classList.remove('hidden');
        clearTimeout(playbackControlsTimer);
        playbackControlsTimer = setTimeout(function() {
            playbackControls.classList.add('hidden');
        }, PLAYBACK_CONTROLS_TIMEOUT);
    }

    function hidePlaybackControls() {
        playbackControls.classList.add('hidden');
        clearTimeout(playbackControlsTimer);
    }

    function handlePlayPause() {
        var state = Player.togglePlayPause();
        showPlaybackControls(state === 'paused' ? '⏸  paused' : '▶  playing');
    }

    function handleSeekForward() {
        var result = Player.seekForward(SEEK_STEP_MS);
        if (result) {
            showPlaybackControls('▶▶  +' + (SEEK_STEP_MS / 1000) + 's');
        }
    }

    function handleSeekBackward() {
        var result = Player.seekBackward(SEEK_STEP_MS);
        if (result) {
            showPlaybackControls('◀◀  -' + (SEEK_STEP_MS / 1000) + 's');
        }
    }

    // ══════════════════════════════════════
    // VOD CONTROLS OVERLAY (right panel for movies/series)
    // ══════════════════════════════════════

    var vodOverlay = document.getElementById('vod-overlay');
    var voScroll = document.getElementById('vo-scroll');
    var voHeader = document.getElementById('vo-header');
    var vodOverlayOpen = false;
    var voItems = [];       // selectable items in the overlay
    var voFocusIndex = 0;

    function openVodOverlay() {
        if (!playingVod) return;
        vodOverlayOpen = true;
        voFocusIndex = 0;
        renderVodOverlay();
        vodOverlay.classList.remove('hidden');
        setTimeout(function() { vodOverlay.classList.add('visible'); }, 10);
    }

    function closeVodOverlay() {
        vodOverlayOpen = false;
        vodOverlay.classList.remove('visible');
        setTimeout(function() { vodOverlay.classList.add('hidden'); }, 260);
    }

    function renderVodOverlay() {
        voItems = [];
        var html = '';
        var pos = Player.getCurrentPosition();
        var dur = Player.getDuration();

        // ── Progress bar ──
        if (dur > 0) {
            var pct = Math.min((pos / dur) * 100, 100);
            html += '<div class="vo-progress-wrap">' +
                    '<span class="vo-progress-time">' + formatTime(pos) + '</span>' +
                    '<div class="vo-progress-bar"><div class="vo-progress-fill" style="width:' + pct + '%"></div></div>' +
                    '<span class="vo-progress-time">' + formatTime(dur) + '</span>' +
                    '</div>';
        }

        // ── Actions section ──
        html += '<div class="vo-section">actions</div>';

        voItems.push({ type: 'action', action: 'seekback' });
        html += '<div class="vo-item" data-i="' + (voItems.length - 1) + '"><span class="prefix">&gt;</span>rewind 15s</div>';

        voItems.push({ type: 'action', action: 'seekfwd' });
        html += '<div class="vo-item" data-i="' + (voItems.length - 1) + '"><span class="prefix">&gt;</span>fast forward 15s</div>';

        voItems.push({ type: 'action', action: 'playpause' });
        var ppLabel = Player.getState() === 'PAUSED' ? 'play' : 'pause';
        html += '<div class="vo-item" data-i="' + (voItems.length - 1) + '"><span class="prefix">&gt;</span>' + ppLabel + '</div>';

        // ── Subtitles section ──
        var tracks = Player.getSubtitleTracks();
        if (tracks && tracks.length > 0) {
            html += '<div class="vo-section">subtitles</div>';

            var activeIdx = Player.getActiveSubtitleIndex();

            voItems.push({ type: 'subtitle', trackIndex: -1 });
            var offActive = (activeIdx === -1 || !Player.isSubtitleVisible()) ? ' active' : '';
            html += '<div class="vo-item' + offActive + '" data-i="' + (voItems.length - 1) + '"><span class="prefix">&gt;</span>off</div>';

            for (var i = 0; i < tracks.length; i++) {
                voItems.push({ type: 'subtitle', trackIndex: i });
                var lang = tracks[i].language || ('track ' + (i + 1));
                var isActive = (activeIdx === i && Player.isSubtitleVisible()) ? ' active' : '';
                html += '<div class="vo-item' + isActive + '" data-i="' + (voItems.length - 1) + '"><span class="prefix">&gt;</span>' + esc(lang) + '</div>';
            }
        }

        // ── Information section ──
        html += '<div class="vo-section">information</div>';
        html += '<div class="vo-info">';
        html += '<div class="vo-info-label">title</div>';
        html += '<div class="vo-info-value">' + esc(playingVodTitle || (playingChannel ? playingChannel.name : '—')) + '</div>';

        if (dur > 0) {
            var mins = Math.round(dur / 60000);
            html += '<div class="vo-info-label">length</div>';
            html += '<div class="vo-info-value">' + mins + ' mins</div>';
        }

        if (tracks && tracks.length > 0) {
            html += '<div class="vo-info-label">subtitle tracks</div>';
            html += '<div class="vo-info-value">' + tracks.length + '</div>';
        }

        html += '</div>';

        voScroll.innerHTML = html;
        updateVodOverlayFocus();
    }

    function updateVodOverlayFocus() {
        var els = voScroll.querySelectorAll('.vo-item');
        for (var i = 0; i < els.length; i++) {
            if (i === voFocusIndex) {
                els[i].classList.add('focused');
            } else {
                els[i].classList.remove('focused');
            }
        }
        // Scroll focused into view
        if (els[voFocusIndex]) {
            els[voFocusIndex].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
    }

    function handleVodOverlayKey(k) {
        if (!vodOverlayOpen) return false;

        if (k === 38) { // UP
            if (voFocusIndex > 0) voFocusIndex--;
            updateVodOverlayFocus();
            return true;
        }
        if (k === 40) { // DOWN
            if (voFocusIndex < voItems.length - 1) voFocusIndex++;
            updateVodOverlayFocus();
            return true;
        }
        if (k === 13) { // OK
            var item = voItems[voFocusIndex];
            if (!item) return true;

            if (item.type === 'action') {
                if (item.action === 'seekfwd') {
                    handleSeekForward();
                    renderVodOverlay(); // refresh progress
                } else if (item.action === 'seekback') {
                    handleSeekBackward();
                    renderVodOverlay(); // refresh progress
                } else if (item.action === 'playpause') {
                    handlePlayPause();
                    renderVodOverlay(); // refresh label
                }
            } else if (item.type === 'subtitle') {
                if (item.trackIndex === -1) {
                    // Turn off subtitles
                    hideSubtitles();
                    showSubtitleIndicator('subtitles off');
                } else {
                    Player.enableSubtitle(item.trackIndex);
                    var tracks = Player.getSubtitleTracks();
                    var lang = tracks[item.trackIndex] ? tracks[item.trackIndex].language : 'Track ' + (item.trackIndex + 1);
                    showSubtitleIndicator('subtitle: ' + lang);
                }
                renderVodOverlay(); // refresh active state
            }
            return true;
        }
        if (k === 37 || k === 10009 || k === 8 || k === 27) { // LEFT or BACK
            closeVodOverlay();
            return true;
        }
        return true; // consume all keys while open
    }

    function activatePip() {
        // If PiP already active, BLUE swaps audio
        if (Player.isPipActive()) {
            swapPipAudio();
            return;
        }
        // Open scores overlay in PiP selection mode
        pipSelectMode = true;
        pipShowingResults = false;
        pipSearchResults = [];
        openScoresOverlay();
    }

    function openPipWithChannel(ch) {
        if (!ch || !ch.url) return;
        // Don't PiP the same channel that's already playing
        if (playingChannel && ch.url === playingChannel.url) return;

        pipChannel = ch;
        Player.openPip(ch.url);
        pipContainer.classList.remove('hidden');
        pipContainer.classList.remove('audio-active');
        fsOverlay.classList.add('pip-active');

        // Close overlay and return to fullscreen
        closeScoresOverlay();
        pipSelectMode = false;
        pipShowingResults = false;

        // Show brief info
        showFsOverlay(playingChannel.name + '  ·  PiP: ' + ch.name);
        debugLog('PiP opened: ' + ch.name, 'ok');
    }

    function pipSearchForLeague(leagueName) {
        debugLog('PiP league search: ' + leagueName, 'info');
        var results = [];
        for (var i = 0; i < channels.length; i++) {
            if (channels[i].name.toLowerCase().indexOf(leagueName) !== -1) {
                results.push(channels[i]);
            }
        }
        pipSearchResults = results;
        pipSearchFocusIndex = 0;
        pipShowingResults = true;
        renderPipSearchResults();
    }

    function pipSearchForMatch(match) {
        // Search channels for this match's home team using smart matching
        var found = searchChannelsForMatch(match);
        debugLog('PiP search: ' + found.term, 'info');
        pipSearchResults = found.results;
        pipSearchFocusIndex = 0;
        pipShowingResults = true;
        renderPipSearchResults();
    }

    function renderPipSearchResults() {
        if (pipSearchResults.length === 0) {
            soScroll.innerHTML = '<div class="scores-empty">no channels found</div>';
            return;
        }
        var html = '<div class="scores-comp">pick channel for pip</div>';
        for (var i = 0; i < pipSearchResults.length; i++) {
            var ch = pipSearchResults[i];
            var f = (i === pipSearchFocusIndex) ? ' focused' : '';
            html += '<div class="match-row pip-ch-row' + f + '" data-pi="' + i + '">';
            html += '<div class="match-status">▶</div>';
            html += '<div class="match-teams"><div class="match-team"><span class="team-name">' + esc(ch.name) + '</span></div></div>';
            html += '</div>';
        }
        soScroll.innerHTML = html;

        // Scroll focused into view
        var rows = soScroll.getElementsByClassName('match-row');
        if (rows[pipSearchFocusIndex]) {
            rows[pipSearchFocusIndex].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
    }

    function swapPipAudio() {
        if (!Player.isPipActive()) return;

        var swapped = Player.swapPipAudio();
        if (!swapped) return;

        // Swap channel references too
        var tmpCh = playingChannel;
        playingChannel = pipChannel;
        pipChannel = tmpCh;

        // Update PiP container style
        if (Player.isPipAudioOnMain()) {
            pipContainer.classList.remove('audio-active');
        } else {
            pipContainer.classList.add('audio-active');
        }

        // Show audio indicator
        var label = Player.isPipAudioOnMain()
            ? '♪ ' + playingChannel.name
            : '♪ ' + pipChannel.name + ' (pip)';
        showPipAudioIndicator(label);

        debugLog('PiP audio swapped → ' + label, 'ok');
    }

    function closePip() {
        if (!Player.isPipActive()) return;
        Player.stopPip();
        pipChannel = null;
        pipContainer.classList.add('hidden');
        pipContainer.classList.remove('audio-active');
        fsOverlay.classList.remove('pip-active');
        hidePipAudioIndicator();
        debugLog('PiP closed', 'ok');
    }

    function showPipAudioIndicator(text) {
        pipAudioText.textContent = text;
        pipAudioIndicator.classList.remove('hidden');
        pipAudioIndicator.classList.add('visible');
        clearTimeout(pipIndicatorTimer);
        pipIndicatorTimer = setTimeout(function() {
            pipAudioIndicator.classList.remove('visible');
            setTimeout(function() { pipAudioIndicator.classList.add('hidden'); }, 300);
        }, 2500);
    }

    function hidePipAudioIndicator() {
        clearTimeout(pipIndicatorTimer);
        pipAudioIndicator.classList.remove('visible');
        pipAudioIndicator.classList.add('hidden');
    }

    Player.onError(function(err) { npTitle.textContent = 'error: ' + err; });
    Player.onBuffering(function(b) {
        if (b) bufferingEl.classList.add('visible');
        else bufferingEl.classList.remove('visible');
    });

    // Subtitle text display callback
    Player.onSubtitle(function(text) {
        if (subtitleText) {
            subtitleText.innerHTML = text;
            if (text) {
                subtitleDisplay.classList.remove('hidden');
            } else {
                subtitleDisplay.classList.add('hidden');
            }
        }
    });

    // Subtitle tracks detected callback
    Player.onSubtitleTracks(function(tracks) {
        debugLog('Subtitle tracks: ' + tracks.length, tracks.length > 0 ? 'ok' : 'info');
    });

    // ══════════════════════════════════════
    // ADD SEARCH
    // ══════════════════════════════════════

    function promptAddSearch() {
        addSearchMode = true;
        // Show filter bar on home screen for input
        switchScreen('channels');
        panelTitle.textContent = 'Add search';
        showFilterBar();
        filterInput.placeholder = 'type keyword to save...';
        filterInput.value = '';
        filterText = '';
        items = [];
        renderChannels();
        focusFilterBar();
    }

    function confirmAddSearch() {
        var keyword = filterInput.value.trim().toLowerCase();
        if (keyword && addSavedSearch(keyword)) {
            debugLog('saved search: ' + keyword, 'ok');
        }
        addSearchMode = false;
        filterInput.placeholder = '';
        showHome();
    }

    function cancelAddSearch() {
        addSearchMode = false;
        filterInput.placeholder = '';
        showHome();
    }

    // ══════════════════════════════════════
    // MOUSE SUPPORT
    // ══════════════════════════════════════

    homeList.addEventListener('click', function(e) {
        var el = e.target.closest('.hmi');
        if (!el) return;
        focusedIndex = parseInt(el.getAttribute('data-i'), 10);
        selectItem();
    });

    homeList.addEventListener('mouseover', function(e) {
        var el = e.target.closest('.hmi');
        if (!el) return;
        focusedIndex = parseInt(el.getAttribute('data-i'), 10);
        renderHome();
    });

    channelList.addEventListener('click', function(e) {
        var el = e.target.closest('.chi');
        if (!el) return;
        focusedIndex = parseInt(el.getAttribute('data-i'), 10);
        filterFocused = false;
        selectItem();
    });

    channelList.addEventListener('mouseover', function(e) {
        var el = e.target.closest('.chi');
        if (!el) return;
        var idx = parseInt(el.getAttribute('data-i'), 10);
        focusedIndex = idx;
        filterFocused = false;
        var all = channelList.getElementsByClassName('chi');
        for (var i = 0; i < all.length; i++) {
            all[i].classList.toggle('focused', i === idx);
        }
    });

    // ══════════════════════════════════════
    // KEY HANDLING
    // ══════════════════════════════════════

    function registerKeys() {
        try {
            tizen.tvinputdevice.registerKey('ColorF0Red');
            tizen.tvinputdevice.registerKey('ColorF1Green');
            tizen.tvinputdevice.registerKey('ColorF2Yellow');
            tizen.tvinputdevice.registerKey('ColorF3Blue');
            tizen.tvinputdevice.registerKey('MediaPlayPause');
            tizen.tvinputdevice.registerKey('MediaPlay');
            tizen.tvinputdevice.registerKey('MediaPause');
            tizen.tvinputdevice.registerKey('MediaStop');
            tizen.tvinputdevice.registerKey('MediaRewind');
            tizen.tvinputdevice.registerKey('MediaFastForward');
            tizen.tvinputdevice.registerKey('ChannelUp');
            tizen.tvinputdevice.registerKey('ChannelDown');
        } catch(e) {}
    }

    document.addEventListener('keydown', function(e) {
        // Account picker intercept
        if (accountPickerOpen) {
            if (handleAccountPickerKey(e.keyCode)) e.preventDefault();
            return;
        }
        // Profile picker intercept
        if (profilePickerOpen) {
            if (handlePickerKey(e.keyCode)) e.preventDefault();
            return;
        }
        // Category log intercept
        if (categoryLogOpen) {
            if (handleCategoryLogKey(e.keyCode)) e.preventDefault();
            return;
        }
        // Overlay key intercepts
        if (qrOverlayOpen) {
            if (handleQrKey(e.keyCode)) e.preventDefault();
            return;
        }
        if (codeEntryOpen) {
            if (handleCodeEntryKey(e.keyCode)) e.preventDefault();
            return;
        }
        if (profileDialogOpen) {
            if (handleProfileDialogKey(e.keyCode)) e.preventDefault();
            return;
        }

        if (document.activeElement === filterInput) return;

        var k = e.keyCode;

        // Left overlay intercept (while watching)
        if (leftOverlayOpen) {
            if (handleLeftOverlayKey(k)) e.preventDefault();
            return;
        }

        // Scores overlay intercept (while watching)
        if (scoresOverlayOpen) {
            if (handleScoresOverlayKey(k)) e.preventDefault();
            return;
        }

        // VOD controls overlay intercept (while watching)
        if (vodOverlayOpen) {
            if (handleVodOverlayKey(k)) e.preventDefault();
            return;
        }

        // Fullscreen view — LEFT/RIGHT open panels, BACK exits
        if (view === 'fullscreen') {
            if (k === 405) { // YELLOW — toggle/cycle subtitles
                toggleSubtitles();
                e.preventDefault();
                return;
            }
            if (k === 406) { // BLUE — activate PiP or swap audio
                activatePip();
                e.preventDefault();
                return;
            }
            if (k === 37) { // LEFT — open left panel (menu/searches)
                openLeftOverlay();
                e.preventDefault();
                return;
            }
            if (k === 39) { // RIGHT — open VOD controls or scores overlay
                if (playingVod) {
                    openVodOverlay();
                    e.preventDefault();
                } else if (isFootballProfile() && Football.isConfigured()) {
                    openScoresOverlay();
                    e.preventDefault();
                }
                return;
            }
            if (k === 10009 || k === 8 || k === 27) { // Back/Escape
                // If PiP is active, close PiP first instead of exiting fullscreen
                if (Player.isPipActive()) {
                    closePip();
                    e.preventDefault();
                    return;
                }
                exitFullscreen();
                e.preventDefault();
                return;
            }
            if (k === 13) { // OK — show overlay
                var infoText = playingChannel ? playingChannel.name : '';
                if (Player.isPipActive() && pipChannel) {
                    infoText += '  ·  PiP: ' + pipChannel.name;
                }
                showFsOverlay(infoText);
                return;
            }
            if (k === 415 || k === 10252) { handlePlayPause(); return; }  // Play/PlayPause
            if (k === 19) { handlePlayPause(); return; }                  // Pause
            if (k === 413) { Player.stop(); hidePlaybackControls(); return; } // Stop
            if (k === 412 || k === 428) { handleSeekBackward(); return; }   // Rewind / CH DOWN
            if (k === 417 || k === 427) { handleSeekForward(); return; }   // Fast Forward / CH UP
            return;
        }

        switch (k) {
            case 38: // UP
                e.preventDefault();
                navUp();
                break;
            case 40: // DOWN
                e.preventDefault();
                navDown();
                break;
            case 13: // OK
                selectItem();
                break;
            case 10009: // BACK (Tizen)
            case 8:     // Backspace
                goBack();
                break;
            case 403: // RED
                if (view === 'home') handleDeleteSearch();
                else toggleFavorite();
                break;
            case 404: // GREEN — sort
                cycleSortMode();
                break;
            case 39: // RIGHT — expand scores / focus scores / enter fullscreen
                if (view === 'home' && scoresEnabled && flatMatches.length > 0) {
                    if (!scoresPanelExpanded) {
                        // First RIGHT: expand the scores panel
                        expandScoresPanel();
                        renderScores();
                    } else if (homePanelFocus === 'left') {
                        // Second RIGHT: focus into scores list
                        homePanelFocus = 'right';
                        scoresFocusIndex = Math.max(0, scoresFocusIndex);
                        scoresHint.classList.add('active');
                        scoresHint.textContent = 'OK to search · RIGHT details · LEFT to go back';
                        renderHome();
                        renderScores();
                    } else if (homePanelFocus === 'right') {
                        // Third RIGHT on a comp: open standings table
                        var nav = homeScoreNavItems[scoresFocusIndex];
                        if (nav && nav.type === 'comp') {
                            var compCode = '';
                            for (var g = 0; g < footballData.length; g++) {
                                if (footballData[g].name === nav.name) {
                                    compCode = footballData[g].code;
                                    break;
                                }
                            }
                            if (compCode) {
                                openScoresOverlay();
                                openStandings(compCode, nav.name);
                            }
                        }
                    }
                } else if (view === 'home' && playingChannel) {
                    // No scores available but video playing — go fullscreen
                    enterFullscreen();
                } else if (view === 'channels' && playingChannel) {
                    enterFullscreen();
                }
                break;
            case 37: // LEFT — from scores back to menu, or collapse panel
                if (view === 'home' && homePanelFocus === 'right') {
                    homePanelFocus = 'left';
                    scoresFocusIndex = -1;
                    scoresHint.classList.remove('active');
                    scoresHint.textContent = 'press RIGHT to browse matches';
                    renderHome();
                    renderScores();
                    e.preventDefault();
                } else if (view === 'home' && scoresPanelExpanded && homePanelFocus === 'left') {
                    // Collapse scores panel
                    collapseScoresPanel();
                    e.preventDefault();
                }
                break;
            case 415: case 10252: handlePlayPause(); break;
            case 19: handlePlayPause(); break;
            case 413: Player.stop(); hidePlaybackControls(); break;
            case 412: case 428: handleSeekBackward(); break;
            case 417: case 427: handleSeekForward(); break;
            default: break;
        }
    });

    function isSelectableHomeItem(idx) {
        if (idx < 0 || idx >= items.length) return false;
        var t = items[idx].type;
        return t !== 'profile-header' && t !== 'separator';
    }

    function navUp() {
        if (view === 'home') {
            if (homePanelFocus === 'right') {
                // Navigate scores
                if (scoresFocusIndex > 0) {
                    scoresFocusIndex--;
                    renderScores();
                }
                return;
            }
            var next = focusedIndex - 1;
            while (next >= 0 && !isSelectableHomeItem(next)) next--;
            if (next >= 0) {
                focusedIndex = next;
                renderHome();
            }
        } else if (view === 'channels' || view === 'groups') {
            if (filterFocused) return; // already at filter
            if (focusedIndex > 0) {
                focusedIndex--;
                renderChannels();
            } else if (!filterBar.classList.contains('hidden')) {
                focusFilterBar();
            }
        }
    }

    function navDown() {
        if (view === 'home') {
            if (homePanelFocus === 'right') {
                // Navigate scores
                if (scoresFocusIndex < homeScoreNavItems.length - 1) {
                    scoresFocusIndex++;
                    renderScores();
                }
                return;
            }
            var next = focusedIndex + 1;
            while (next < items.length && !isSelectableHomeItem(next)) next++;
            if (next < items.length) {
                focusedIndex = next;
                renderHome();
            }
        } else if (view === 'channels' || view === 'groups') {
            if (filterFocused) {
                filterInput.blur();
                filterFocused = false;
                filterBar.classList.remove('nav-focused');
                focusedIndex = 0;
                renderChannels();
                return;
            }
            if (focusedIndex < items.length - 1) {
                focusedIndex++;
                renderChannels();
            }
        }
    }

    function selectItem() {
        // If scores panel is focused, select the match
        if (view === 'home' && homePanelFocus === 'right') {
            selectMatch();
            return;
        }

        if (addSearchMode && filterFocused) {
            confirmAddSearch();
            return;
        }
        if (filterFocused) {
            filterInput.blur();
            filterFocused = false;
            filterBar.classList.remove('nav-focused');
            focusedIndex = 0;
            if (view === 'channels' || view === 'groups') renderChannels();
            return;
        }

        var it = items[focusedIndex];
        if (!it) return;

        if (it.type === 'search') {
            showSearchResults(it.keyword);
        } else if (it.type === 'addsearch') {
            promptAddSearch();
        } else if (it.type === 'browse') {
            showGroups();
        } else if (it.type === 'reload') {
            reloadChannels();
        } else if (it.type === 'switch-action') {
            openProfilePicker();
        } else if (it.type === 'series-browse') {
            showSeriesCategories();
        } else if (it.type === 'movies-browse') {
            showMovieCategories();
        } else if (it.type === 'channel') {
            playChannel(it.ch);
        } else if (it.type === 'group') {
            // Could be a channel group, series category, or movie category
            if (seriesView === 'categories') {
                showSeriesList(it.group, it.label);
            } else if (movieView === 'categories') {
                showMovieList(it.group, it.label);
            } else {
                showGroupChannels(it.group);
            }
        } else if (it.type === 'movie') {
            playMovie(it);
        } else if (it.type === 'series') {
            showSeriesSeasons(it.seriesId, it.label);
        } else if (it.type === 'season') {
            showSeriesEpisodes(it.seasonNum);
        } else if (it.type === 'episode') {
            playEpisode(it);
        }
    }

    function goBack() {
        // If scores panel is focused, go back to left menu
        if (view === 'home' && homePanelFocus === 'right') {
            homePanelFocus = 'left';
            scoresFocusIndex = -1;
            scoresHint.classList.remove('active');
            scoresHint.textContent = 'press RIGHT to browse matches';
            renderHome();
            renderScores();
            return;
        }

        if (addSearchMode) {
            cancelAddSearch();
            return;
        }

        if (filterFocused) {
            filterInput.blur();
            filterInput.value = '';
            filterText = '';
            filterFocused = false;
            filterBar.classList.remove('nav-focused');
            rebuildChannelList();
            return;
        }

        if (view === 'unsupported') {
            unsupportedScreen.classList.add('hidden');
            openProfilePicker();
            return;
        }

        if (view === 'channels' && seriesView !== 'none') {
            // Navigate back through series hierarchy
            if (seriesView === 'episodes') {
                showSeriesSeasons(currentSeries.id, currentSeries.name);
            } else if (seriesView === 'seasons') {
                if (currentSeriesCategory) {
                    showSeriesList(currentSeriesCategory.id, currentSeriesCategory.name);
                } else {
                    showSeriesCategories();
                }
            } else if (seriesView === 'list') {
                showSeriesCategories();
            } else if (seriesView === 'categories') {
                seriesView = 'none';
                showHome();
            } else {
                seriesView = 'none';
                showHome();
            }
            return;
        }

        if (view === 'channels' && movieView !== 'none') {
            // Navigate back through movie hierarchy
            if (movieView === 'list') {
                showMovieCategories();
            } else if (movieView === 'categories') {
                movieView = 'none';
                showHome();
            } else {
                movieView = 'none';
                showHome();
            }
            return;
        }

        if (view === 'channels') {
            showHome();
        } else if (view === 'groups') {
            showHome();
        } else if (view === 'fullscreen') {
            exitFullscreen();
        } else if (view === 'home') {
            // If video is playing behind home, stop it first
            if (playingChannel) {
                Player.stop();
                playingChannel = null;
                npTitle.textContent = '';
                npInfo.textContent = '';
                homeScreen.classList.remove('video-behind');
                return;
            }
            // No video — open profile picker
            openProfilePicker();
        }
    }

    function cycleSortMode() {
        if (view === 'home') return;
        if (sortMode === 'none') sortMode = 'az';
        else if (sortMode === 'az') sortMode = 'za';
        else sortMode = 'none';
        focusedIndex = 0;
        rebuildChannelList();
    }

    function handleDeleteSearch() {
        if (view !== 'home') return;
        var it = items[focusedIndex];
        if (!it) return;
        if (it.type === 'search') {
            if (removeSavedSearch(it.keyword)) {
                debugLog('removed search: ' + it.keyword, 'ok');
                buildHomeItems();
                if (focusedIndex >= items.length) focusedIndex = Math.max(0, items.length - 1);
                while (focusedIndex < items.length && !isSelectableHomeItem(focusedIndex)) focusedIndex++;
                renderHome();
            }
        }
    }

    // ══════════════════════════════════════
    // PROFILE DIALOG
    // ══════════════════════════════════════

    var pdFields = [];  // set in setupProfileDialog

    function setupProfileDialog() {
        pdFields = [pdName, pdUsername, pdPassword, pdKeywords]; // indices 0,1,2,3; 4=back, 5=save

        // Handle keydown in profile dialog inputs
        for (var i = 0; i < pdFields.length; i++) {
            (function(idx) {
                pdFields[idx].addEventListener('keydown', function(e) {
                    if (!profileDialogOpen) return;
                    if (e.keyCode === 40) { // DOWN
                        pdFields[idx].blur();
                        pdFocusIndex = idx + 1;
                        renderProfileDialog();
                        if (pdFocusIndex < 4) pdFields[pdFocusIndex].focus();
                        e.preventDefault();
                        e.stopPropagation();
                    }
                    if (e.keyCode === 38) { // UP
                        if (idx > 0) {
                            pdFields[idx].blur();
                            pdFocusIndex = idx - 1;
                            renderProfileDialog();
                            pdFields[pdFocusIndex].focus();
                            e.preventDefault();
                            e.stopPropagation();
                        }
                    }
                    if (e.keyCode === 13 || e.keyCode === 65376) { // Enter / Samsung Done
                        pdFields[idx].blur();
                        pdFocusIndex = idx + 1;
                        renderProfileDialog();
                        if (pdFocusIndex < 4) pdFields[pdFocusIndex].focus();
                        e.preventDefault();
                        e.stopPropagation();
                    }
                });
                pdFields[idx].addEventListener('focus', function() {
                    if (!profileDialogOpen) return;
                    pdFocusIndex = idx;
                    renderProfileDialog();
                });
            })(i);
        }

        // Button clicks
        pdBtnBack.addEventListener('click', function() { closeProfileDialog(); });
        pdBtnSave.addEventListener('click', function() { saveProfileDialog(); });

        // Code entry input
        codeInput.addEventListener('keydown', function(e) {
            if (!codeEntryOpen) return;
            if (e.keyCode === 13 || e.keyCode === 65376) {
                importProfileFromCode();
                e.preventDefault();
                e.stopPropagation();
            }
            if (e.keyCode === 10009 || e.keyCode === 27) {
                closeCodeEntry();
                e.preventDefault();
                e.stopPropagation();
            }
        });
        codeInput.addEventListener('blur', function() {
            if (!codeEntryOpen) return;
            setTimeout(function() {
                if (codeEntryOpen && codeInput.value.trim()) {
                    importProfileFromCode();
                }
            }, 100);
        });
    }

    function openProfileDialog() {
        profileDialogOpen = true;
        pdFocusIndex = 0;
        pdName.value = '';
        pdUsername.value = '';
        pdPassword.value = '';
        pdKeywords.value = '';
        profileDialog.classList.remove('hidden');
        renderProfileDialog();
        pdName.focus();
    }

    function closeProfileDialog() {
        profileDialogOpen = false;
        profileDialog.classList.add('hidden');
        pdName.blur();
        pdUsername.blur();
        pdPassword.blur();
        pdKeywords.blur();
    }

    function saveProfileDialog() {
        var dName = pdName.value.trim();
        var uName = pdUsername.value.trim();
        var pass = pdPassword.value.trim();
        var kwStr = pdKeywords.value.trim();

        if (!dName) {
            debugLog('profile: name required', 'fail');
            pdFocusIndex = 0;
            renderProfileDialog();
            pdName.focus();
            return;
        }

        // Parse keywords
        var keywords = [];
        if (kwStr) {
            var parts = kwStr.split(',');
            for (var i = 0; i < parts.length; i++) {
                var kw = parts[i].trim().toLowerCase();
                if (kw) keywords.push(kw);
            }
        }

        // Check if profile display name already exists
        for (var j = 0; j < userProfiles.length; j++) {
            if (userProfiles[j].displayName.toLowerCase() === dName.toLowerCase()) {
                debugLog('profile "' + dName + '" already exists', 'fail');
                return;
            }
        }

        var newProfile = {
            displayName: dName,
            username: uName || dName,
            password: pass,
            searches: keywords
        };
        userProfiles.push(newProfile);
        saveUserProfiles();
        debugLog('profile created: ' + dName + ' (' + keywords.length + ' keywords)', 'ok');

        closeProfileDialog();
        setActiveProfile(newProfile);
        showHome();
        // Reload for new credentials
        try { localStorage.removeItem('iptv_cache'); } catch(e) {}
        tryXtreamHost(0);
    }

    function renderProfileDialog() {
        for (var i = 0; i < pdFields.length; i++) {
            pdFields[i].classList.toggle('nav-focused', pdFocusIndex === i);
        }
        pdBtnBack.classList.toggle('focused', pdFocusIndex === 4);
        pdBtnSave.classList.toggle('focused', pdFocusIndex === 5);
    }

    function switchToProfile(profile) {
        setActiveProfile(profile);
        debugLog('switched to profile: ' + profile.displayName, 'ok');

        // Handle unsupported profile types
        if (profile.profileType === 'unsupported') {
            showUnsupported(profile.displayName);
            return;
        }

        var swName = activeAccount ? activeAccount.name : profile.displayName;
        loadingHello.textContent = 'hello ' + swName + '...';
        showHome();
        try { localStorage.removeItem('iptv_cache'); } catch(e) {}
        tryXtreamHost(0);
    }

    // Profile dialog key handling
    function handleProfileDialogKey(k) {
        if (!profileDialogOpen) return false;

        // If an input field is focused, let the input handle it
        var activeIsField = false;
        for (var f = 0; f < pdFields.length; f++) {
            if (document.activeElement === pdFields[f]) { activeIsField = true; break; }
        }
        if (activeIsField) {
            if (k === 10009 || k === 27) { closeProfileDialog(); return true; }
            return false;
        }

        if (k === 38) { // UP
            if (pdFocusIndex > 0) pdFocusIndex--;
            renderProfileDialog();
            if (pdFocusIndex < 4) pdFields[pdFocusIndex].focus();
            return true;
        }
        if (k === 40) { // DOWN
            if (pdFocusIndex < 5) pdFocusIndex++;
            renderProfileDialog();
            if (pdFocusIndex < 4) pdFields[pdFocusIndex].focus();
            return true;
        }
        if (k === 37) { // LEFT
            if (pdFocusIndex >= 4) { pdFocusIndex = 4; renderProfileDialog(); }
            return true;
        }
        if (k === 39) { // RIGHT
            if (pdFocusIndex >= 4) { pdFocusIndex = 5; renderProfileDialog(); }
            return true;
        }
        if (k === 13) { // OK
            if (pdFocusIndex < 4) pdFields[pdFocusIndex].focus();
            else if (pdFocusIndex === 4) closeProfileDialog();
            else if (pdFocusIndex === 5) saveProfileDialog();
            return true;
        }
        if (k === 10009 || k === 27 || k === 8) {
            closeProfileDialog();
            return true;
        }
        return true;
    }

    // ══════════════════════════════════════
    // CATEGORY LOG
    // ══════════════════════════════════════

    function openCategoryLog() {
        if (!lastCategoryStats) return;
        categoryLogOpen = true;
        categoryLogTab = 0;
        renderCategoryLog();
        categoryLogOverlay.classList.remove('hidden');
    }

    function closeCategoryLog() {
        categoryLogOpen = false;
        categoryLogOverlay.classList.add('hidden');
    }

    function renderCategoryLog() {
        // Update tabs
        catTabLoaded.className = 'cat-tab' + (categoryLogTab === 0 ? ' active' : '');
        catTabSkipped.className = 'cat-tab' + (categoryLogTab === 1 ? ' active' : '');
        catTabLoaded.textContent = 'Loaded (' + lastCategoryStats.names.length + ')';
        catTabSkipped.textContent = 'Skipped (' + lastCategoryStats.skippedNames.length + ')';

        // Build list
        var names = categoryLogTab === 0 ? lastCategoryStats.names : lastCategoryStats.skippedNames;
        var cls = categoryLogTab === 0 ? 'cat-item-loaded' : 'cat-item-skipped';
        var html = '';
        for (var i = 0; i < names.length; i++) {
            html += '<div class="cat-item ' + cls + '">' + esc(names[i]) + '</div>';
        }
        if (names.length === 0) {
            html = '<div class="cat-item cat-item-empty">none</div>';
        }
        categoryLogList.innerHTML = html;
        document.getElementById('category-log-scroll').scrollTop = 0;
    }

    function handleCategoryLogKey(k) {
        if (!categoryLogOpen) return false;
        if (k === 10009 || k === 27 || k === 8) {
            closeCategoryLog();
            return true;
        }
        // LEFT/RIGHT switch tabs
        if (k === 37 || k === 39) {
            categoryLogTab = categoryLogTab === 0 ? 1 : 0;
            renderCategoryLog();
            return true;
        }
        // UP/DOWN scroll
        var logScroll = document.getElementById('category-log-scroll');
        if (k === 40) { logScroll.scrollTop += 60; return true; }
        if (k === 38) { logScroll.scrollTop -= 60; return true; }
        return true;
    }

    // ══════════════════════════════════════
    // FOOTBALL SCORES
    // ══════════════════════════════════════

    function isFootballProfile() {
        return activeProfile && activeProfile.footballScores;
    }

    var scoresPanelExpanded = false; // collapsed by default on app start

    function initScoresPanel() {
        var homeRight = document.getElementById('home-right');
        if (isFootballProfile()) {
            if (Football.isConfigured()) {
                scoresEnabled = true;
                loadScores();
                // Auto-refresh every 60 seconds
                Football.startAutoRefresh(60000, function(data) {
                    footballData = data;
                    flatMatches = Football.flattenMatches(data);
                    renderScores();
                    if (scoresOverlayOpen) renderScoresOverlay();
                }, function(goalInfo) {
                    showGoalToast(goalInfo);
                });
            } else {
                scoresEnabled = false;
                scoresScroll.innerHTML = '<div class="scores-error">API token not set<br><span style="font-size:13px;color:var(--gdd);">Edit js/football.js and set your football-data.org token</span></div>';
                scoresHint.textContent = 'free token at football-data.org';
            }

            // Show/hide panel based on expanded state
            if (scoresPanelExpanded) {
                welcomeImg.classList.add('hidden');
                scoresPanel.classList.remove('hidden');
                homeRight.classList.add('scores-active');
            } else {
                // Collapsed — show welcome image (or video shows through)
                scoresPanel.classList.add('hidden');
                homeRight.classList.remove('scores-active');
                if (playingChannel) {
                    welcomeImg.classList.add('hidden');
                } else {
                    welcomeImg.classList.remove('hidden');
                }
            }
        } else {
            scoresEnabled = false;
            welcomeImg.classList.remove('hidden');
            scoresPanel.classList.add('hidden');
            homeRight.classList.remove('scores-active');
            Football.stopAutoRefresh();
        }
    }

    function expandScoresPanel() {
        var homeRight = document.getElementById('home-right');
        scoresPanelExpanded = true;
        welcomeImg.classList.add('hidden');
        scoresPanel.classList.remove('hidden');
        homeRight.classList.add('scores-active');
    }

    function collapseScoresPanel() {
        var homeRight = document.getElementById('home-right');
        scoresPanelExpanded = false;
        scoresPanel.classList.add('hidden');
        homeRight.classList.remove('scores-active');
        if (playingChannel) {
            welcomeImg.classList.add('hidden');
        } else {
            welcomeImg.classList.remove('hidden');
        }
    }

    function loadScores() {
        scoresScroll.innerHTML = '<div class="scores-loading">loading scores...</div>';
        Football.fetchMatches(function(err, data) {
            if (err) {
                scoresScroll.innerHTML = '<div class="scores-error">' + esc(err) + '</div>';
                debugLog('football: ' + err, 'fail');
                return;
            }
            footballData = data;
            flatMatches = Football.flattenMatches(data);
            // Seed goal detection with current scores (no false goals on first load)
            Football.detectGoals(data);
            renderScores();
            debugLog('football: ' + flatMatches.length + ' matches loaded', 'ok');
        });
    }

    // Home scores also uses a navigable list with competitions
    var homeScoreNavItems = [];

    function buildHomeScoreNavItems() {
        homeScoreNavItems = [];
        if (!footballData) return;
        var flatIdx = 0;
        for (var g = 0; g < footballData.length; g++) {
            var comp = footballData[g];
            homeScoreNavItems.push({ type: 'comp', name: comp.name, flag: comp.flag });
            for (var m = 0; m < comp.matches.length; m++) {
                homeScoreNavItems.push({ type: 'match', match: comp.matches[m], flatIdx: flatIdx });
                flatIdx++;
            }
        }
    }

    function renderScores() {
        if (!footballData || footballData.length === 0) {
            scoresScroll.innerHTML = '<div class="scores-empty">no games today</div>';
            return;
        }
        buildHomeScoreNavItems();

        var html = '';
        for (var i = 0; i < homeScoreNavItems.length; i++) {
            var nav = homeScoreNavItems[i];
            var f = (homePanelFocus === 'right' && i === scoresFocusIndex) ? ' focused' : '';

            if (nav.type === 'comp') {
                html += '<div class="scores-comp selectable' + f + '">' + esc(nav.flag) + ' ' + esc(nav.name) + '</div>';
            } else {
                var match = nav.match;
                var statusText = Football.formatStatus(match);
                var liveCls = match.isLive ? ' live' : '';
                var homeScore = (match.homeScore !== null) ? match.homeScore : '';
                var awayScore = (match.awayScore !== null) ? match.awayScore : '';
                var goalRowCls = match.hasGoal ? ' goal-row' : '';
                var goalHomeCls = match.goalHome ? ' goal' : '';
                var goalAwayCls = match.goalAway ? ' goal' : '';

                html += '<div class="match-row' + f + goalRowCls + '" data-match="' + nav.flatIdx + '">';
                html += '<div class="match-status' + liveCls + '">' + esc(statusText) + '</div>';
                html += '<div class="match-teams">';
                html += '<div class="match-team"><span class="team-name">' + esc(match.homeTeam) + '</span><span class="team-score' + liveCls + goalHomeCls + '">' + homeScore + '</span></div>';
                html += '<div class="match-team"><span class="team-name">' + esc(match.awayTeam) + '</span><span class="team-score' + liveCls + goalAwayCls + '">' + awayScore + '</span></div>';
                html += '</div></div>';
            }
        }

        scoresScroll.innerHTML = html;

        // Scroll focused into view
        if (homePanelFocus === 'right' && scoresFocusIndex >= 0) {
            var all = scoresScroll.children;
            if (all[scoresFocusIndex]) {
                all[scoresFocusIndex].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
        }
    }

    function selectMatch() {
        if (scoresFocusIndex < 0 || scoresFocusIndex >= homeScoreNavItems.length) return;
        var nav = homeScoreNavItems[scoresFocusIndex];
        if (nav.type === 'comp') {
            // Competition selected — search for league name
            var searchTerm = nav.name.toLowerCase();
            debugLog('league search: ' + searchTerm, 'info');
            showSearchResults(searchTerm, false);
        } else if (nav.type === 'match') {
            var found = searchChannelsForMatch(nav.match);
            debugLog('match search: ' + found.term, 'info');
            showSearchResults(found.bestTerm, true);
        }
    }

    // ══════════════════════════════════════
    // LEFT OVERLAY (menu/channels while watching fullscreen)
    // ══════════════════════════════════════

    var loHasState = false; // true if overlay has been navigated (don't reset on reopen)

    function openLeftOverlay() {
        leftOverlayOpen = true;

        // If we have previous state, just re-show it
        if (loHasState && loItems.length > 0) {
            renderLeftOverlay();
            leftOverlay.classList.remove('hidden');
            setTimeout(function() { leftOverlay.classList.add('visible'); }, 10);
            return;
        }

        // First open or after reset — start at menu
        loView = 'menu';
        loFocusIndex = 0;
        loHasState = true;
        buildLoMenu();
        renderLeftOverlay();
        loHint.textContent = 'OK select · RED delete · BACK close';
        leftOverlay.classList.remove('hidden');
        setTimeout(function() { leftOverlay.classList.add('visible'); }, 10);
    }

    function closeLeftOverlay() {
        leftOverlayOpen = false;
        leftOverlay.classList.remove('visible');
        setTimeout(function() { leftOverlay.classList.add('hidden'); }, 260);
        // Don't reset loView/loItems/loFocusIndex — preserve state for reopen
    }

    function resetLeftOverlayState() {
        loHasState = false;
        loView = 'menu';
        loFocusIndex = 0;
        loItems = [];
    }

    function buildLoMenu() {
        loItems = [];
        for (var j = 0; j < savedSearches.length; j++) {
            loItems.push({ type: 'search', label: savedSearches[j], keyword: savedSearches[j] });
        }
        loItems.push({ type: 'addsearch', label: '+ add search' });
        loItems.push({ type: 'separator' });
        if (isSeriesProfile()) {
            loItems.push({ type: 'series-browse', label: 'series' });
        }
        if (isMoviesProfile()) {
            loItems.push({ type: 'movies-browse', label: 'movies' });
        }
        loItems.push({ type: 'browse', label: 'all' });
        loItems.push({ type: 'separator' });
        loItems.push({ type: 'reload', label: '- reload' });
        loItems.push({ type: 'switch-action', label: '- switch' });
        var accName = activeAccount ? activeAccount.name : '';
        var profName = activeProfile ? activeProfile.displayName : 'menu';
        loHeader.textContent = accName ? (accName + ' - ' + profName) : profName;
    }

    function buildLoChannels(keyword) {
        loSearchKeyword = keyword;
        var kw = keyword.toLowerCase();
        loItems = [];
        for (var i = 0; i < channels.length; i++) {
            if (channels[i].name.toLowerCase().indexOf(kw) !== -1) {
                loItems.push({ type: 'channel', ch: channels[i] });
            }
        }
        loHeader.textContent = keyword + ' (' + loItems.length + ')';
        loHint.textContent = 'OK play · BACK menu';
    }

    function buildLoBrowseAll() {
        loSearchKeyword = '';
        loItems = [];
        // Show groups
        var sortedGroups = groups.slice();
        for (var i = 0; i < sortedGroups.length; i++) {
            loItems.push({ type: 'group', label: sortedGroups[i], group: sortedGroups[i] });
        }
        loHeader.textContent = 'browse all (' + sortedGroups.length + ')';
        loHint.textContent = 'OK open · BACK menu';
    }

    function buildLoGroupChannels(group) {
        loSearchKeyword = group;
        loItems = [];
        for (var i = 0; i < channels.length; i++) {
            if (channels[i].group === group) {
                loItems.push({ type: 'channel', ch: channels[i] });
            }
        }
        loHeader.textContent = group + ' (' + loItems.length + ')';
        loHint.textContent = 'OK play · BACK groups';
    }

    function buildLoSeriesCategories() {
        loItems = [];
        var cats = seriesCategories;
        if (cats.length === 0) {
            // Need to load them first
            loHeader.textContent = 'loading...';
            var creds = getActiveCredentials();
            Xtream.getSeriesCategories(function(err, allCats) {
                if (err) {
                    loItems = [];
                    loHeader.textContent = 'error: ' + err;
                    renderLeftOverlay();
                    return;
                }
                seriesCategories = allCats || [];
                if (activeProfile && activeProfile.categoryFilters && activeProfile.categoryFilters.length > 0) {
                    seriesCategories = Xtream.filterCategories(seriesCategories, activeProfile.categoryFilters, activeProfile.categoryExcludes, activeProfile.categoryFilterMode);
                }
                buildLoSeriesCategoriesFromCache();
                renderLeftOverlay();
            });
            return;
        }
        buildLoSeriesCategoriesFromCache();
    }

    function buildLoSeriesCategoriesFromCache() {
        loItems = [];
        for (var i = 0; i < seriesCategories.length; i++) {
            var cat = seriesCategories[i];
            loItems.push({ type: 'group', label: cat.category_name, group: cat.category_id, _catName: cat.category_name });
        }
        loHeader.textContent = 'series (' + loItems.length + ')';
        loHint.textContent = 'OK open · BACK menu';
    }

    function buildLoSeriesList(categoryId, categoryName) {
        loItems = [];
        loHeader.textContent = 'loading...';
        Xtream.getSeriesByCategory(categoryId, function(err, list) {
            if (err) {
                loHeader.textContent = 'error: ' + err;
                renderLeftOverlay();
                return;
            }
            var seriesArr = list || [];
            loItems = [];
            for (var i = 0; i < seriesArr.length; i++) {
                var s = seriesArr[i];
                loItems.push({
                    type: 'series',
                    label: s.name || 'Unknown',
                    seriesId: s.series_id,
                    year: s.year || '',
                    rating: s.rating || ''
                });
            }
            loHeader.textContent = categoryName + ' (' + loItems.length + ')';
            loHint.textContent = 'OK open · BACK categories';
            renderLeftOverlay();
        });
    }

    function buildLoSeriesSeasons(seriesId, seriesName) {
        loItems = [];
        loHeader.textContent = 'loading...';
        Xtream.getSeriesInfo(seriesId, function(err, info) {
            if (err) {
                loHeader.textContent = 'error: ' + err;
                renderLeftOverlay();
                return;
            }
            seriesInfo = info;
            loItems = [];
            if (info && info.episodes) {
                var seasons = Object.keys(info.episodes);
                seasons.sort(function(a, b) { return parseInt(a) - parseInt(b); });
                for (var i = 0; i < seasons.length; i++) {
                    var num = seasons[i];
                    var eps = info.episodes[num];
                    loItems.push({
                        type: 'season',
                        label: 'Season ' + num + ' (' + eps.length + ' ep)',
                        seasonNum: num
                    });
                }
            }
            loHeader.textContent = seriesName;
            loHint.textContent = 'OK open · BACK series';
            renderLeftOverlay();
        });
    }

    function buildLoSeriesEpisodes(seasonNum, seriesName) {
        loItems = [];
        if (!seriesInfo || !seriesInfo.episodes || !seriesInfo.episodes[seasonNum]) return;
        var eps = seriesInfo.episodes[seasonNum];
        for (var i = 0; i < eps.length; i++) {
            var ep = eps[i];
            var ext = ep.container_extension || 'mkv';
            loItems.push({
                type: 'episode',
                label: 'E' + (ep.episode_num || (i + 1)) + '. ' + (ep.title || 'Episode ' + (i + 1)),
                url: Xtream.seriesStreamUrl(ep.id, ext),
                episodeId: ep.id
            });
        }
        loHeader.textContent = seriesName + ' — S' + seasonNum;
        loHint.textContent = 'OK play · BACK seasons';
    }

    // ── Left overlay movie builders ──

    function buildLoMovieCategories() {
        loItems = [];
        if (movieCategories.length === 0) {
            loHeader.textContent = 'loading...';
            Xtream.getVodCategories(function(err, allCats) {
                if (err) {
                    loHeader.textContent = 'error: ' + err;
                    renderLeftOverlay();
                    return;
                }
                movieCategories = allCats || [];
                if (activeProfile && activeProfile.categoryFilters && activeProfile.categoryFilters.length > 0) {
                    movieCategories = Xtream.filterCategories(movieCategories, activeProfile.categoryFilters, activeProfile.categoryExcludes, activeProfile.categoryFilterMode);
                }
                buildLoMovieCategoriesFromCache();
                renderLeftOverlay();
            });
            return;
        }
        buildLoMovieCategoriesFromCache();
    }

    function buildLoMovieCategoriesFromCache() {
        loItems = [];
        for (var i = 0; i < movieCategories.length; i++) {
            var cat = movieCategories[i];
            loItems.push({ type: 'group', label: cat.category_name, group: cat.category_id, _catName: cat.category_name });
        }
        loHeader.textContent = 'movies (' + loItems.length + ')';
        loHint.textContent = 'OK open · BACK menu';
    }

    function buildLoMovieList(categoryId, categoryName) {
        loItems = [];
        loHeader.textContent = 'loading...';
        Xtream.getVodByCategory(categoryId, function(err, list) {
            if (err) {
                loHeader.textContent = 'error: ' + err;
                renderLeftOverlay();
                return;
            }
            var movies = list || [];
            loItems = [];
            for (var i = 0; i < movies.length; i++) {
                var m = movies[i];
                var ext = m.container_extension || 'mkv';
                loItems.push({
                    type: 'movie',
                    label: m.name || 'Unknown',
                    url: Xtream.vodStreamUrl(m.stream_id, ext),
                    year: m.year || '',
                    rating: m.rating || '',
                    streamId: m.stream_id
                });
            }
            loHeader.textContent = categoryName + ' (' + loItems.length + ')';
            loHint.textContent = 'OK play · BACK categories';
            renderLeftOverlay();
        });
    }

    function isSelectableLoItem(idx) {
        if (idx < 0 || idx >= loItems.length) return false;
        return loItems[idx].type !== 'separator';
    }

    function renderLeftOverlay() {
        var html = '';
        for (var i = 0; i < loItems.length; i++) {
            var it = loItems[i];
            var f = (i === loFocusIndex) ? ' focused' : '';

            if (it.type === 'separator') {
                html += '<div class="lo-sep"></div>';
            } else if (it.type === 'channel') {
                var playing = (playingChannel && playingChannel.url === it.ch.url) ? ' playing' : '';
                html += '<div class="lo-item' + f + playing + '" data-i="' + i + '"><span class="prefix">&gt;</span>' + esc(it.ch.name) + '</div>';
            } else if (it.type === 'group') {
                html += '<div class="lo-item' + f + '" data-i="' + i + '"><span class="prefix">&gt;</span>' + esc(it.label) + '</div>';
            } else if (it.type === 'search' || it.type === 'series-browse' || it.type === 'movies-browse') {
                html += '<div class="lo-item' + f + '" data-i="' + i + '"><span class="prefix">&gt;</span>' + esc(it.label) + '</div>';
            } else if (it.type === 'series' || it.type === 'season' || it.type === 'episode' || it.type === 'movie') {
                var meta = '';
                if (it.year) meta += it.year;
                if (it.rating) meta += (meta ? ' · ' : '') + '★' + it.rating;
                var metaHtml = meta ? ' <span style="opacity:0.5;font-size:14px">' + esc(meta) + '</span>' : '';
                html += '<div class="lo-item' + f + '" data-i="' + i + '"><span class="prefix">&gt;</span>' + esc(it.label) + metaHtml + '</div>';
            } else if (it.type === 'addsearch') {
                html += '<div class="lo-item dim' + f + '" data-i="' + i + '">' + esc(it.label) + '</div>';
            } else if (it.type === 'reload' || it.type === 'switch-action') {
                html += '<div class="lo-item dim' + f + '" data-i="' + i + '">' + esc(it.label) + '</div>';
            }
        }
        if (loItems.length === 0) {
            html = '<div class="lo-item dim">no results</div>';
        }
        loScroll.innerHTML = html;

        // Scroll focused into view
        var els = loScroll.getElementsByClassName('lo-item');
        if (els[loFocusIndex]) {
            els[loFocusIndex].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
    }

    function handleLeftOverlayKey(k) {
        if (!leftOverlayOpen) return false;

        if (k === 38) { // UP
            var next = loFocusIndex - 1;
            while (next >= 0 && !isSelectableLoItem(next)) next--;
            if (next >= 0) { loFocusIndex = next; renderLeftOverlay(); }
            return true;
        }
        if (k === 40) { // DOWN
            var next = loFocusIndex + 1;
            while (next < loItems.length && !isSelectableLoItem(next)) next++;
            if (next < loItems.length) { loFocusIndex = next; renderLeftOverlay(); }
            return true;
        }
        if (k === 13) { // OK
            var it = loItems[loFocusIndex];
            if (!it) return true;

            if (it.type === 'search') {
                loView = 'channels';
                loFocusIndex = 0;
                buildLoChannels(it.keyword);
                renderLeftOverlay();
            } else if (it.type === 'series-browse') {
                loView = 'series-categories';
                loFocusIndex = 0;
                buildLoSeriesCategories();
                renderLeftOverlay();
            } else if (it.type === 'movies-browse') {
                loView = 'movie-categories';
                loFocusIndex = 0;
                buildLoMovieCategories();
                renderLeftOverlay();
            } else if (it.type === 'browse') {
                loView = 'groups';
                loFocusIndex = 0;
                buildLoBrowseAll();
                renderLeftOverlay();
            } else if (it.type === 'group') {
                if (loView === 'series-categories') {
                    loView = 'series-list';
                    loFocusIndex = 0;
                    loSearchKeyword = it.label;
                    buildLoSeriesList(it.group, it.label);
                    renderLeftOverlay();
                } else if (loView === 'movie-categories') {
                    loView = 'movie-list';
                    loFocusIndex = 0;
                    loSearchKeyword = it.label;
                    buildLoMovieList(it.group, it.label);
                    renderLeftOverlay();
                } else {
                    loView = 'group-channels';
                    loFocusIndex = 0;
                    buildLoGroupChannels(it.group);
                    renderLeftOverlay();
                }
            } else if (it.type === 'movie') {
                var ch = {
                    name: it.label,
                    url: it.url,
                    group: currentMovieCategory ? currentMovieCategory.name : ''
                };
                playChannelFromOverlay(ch);
                playingVod = true;
                playingVodTitle = it.label;
                renderLeftOverlay();
            } else if (it.type === 'series') {
                loView = 'series-seasons';
                loFocusIndex = 0;
                currentSeries = { id: it.seriesId, name: it.label };
                buildLoSeriesSeasons(it.seriesId, it.label);
                renderLeftOverlay();
            } else if (it.type === 'season') {
                loView = 'series-episodes';
                loFocusIndex = 0;
                currentSeason = it.seasonNum;
                buildLoSeriesEpisodes(it.seasonNum, currentSeries ? currentSeries.name : 'Series');
                renderLeftOverlay();
            } else if (it.type === 'episode') {
                // Play episode from overlay
                var ch = {
                    name: it.label,
                    url: it.url,
                    group: currentSeries ? currentSeries.name : ''
                };
                playChannelFromOverlay(ch);
                playingVod = true;
                playingVodTitle = (currentSeries ? currentSeries.name + ' — ' : '') + it.label;
                renderLeftOverlay();
            } else if (it.type === 'channel') {
                // Play this channel — keep overlay open
                playChannelFromOverlay(it.ch);
                renderLeftOverlay(); // re-render to show playing state
            } else if (it.type === 'addsearch') {
                // Can't easily do text input in overlay — close and go to add search
                closeLeftOverlay();
                exitFullscreen();
                promptAddSearch();
            } else if (it.type === 'reload') {
                closeLeftOverlay();
                reloadChannels();
            } else if (it.type === 'switch-action') {
                closeLeftOverlay();
                if (playingChannel) { Player.stop(); playingChannel = null; }
                openProfilePicker();
            }
            return true;
        }
        if (k === 403) { // RED — delete search
            if (loView === 'menu') {
                var it = loItems[loFocusIndex];
                if (it && it.type === 'search') {
                    if (removeSavedSearch(it.keyword)) {
                        debugLog('removed search: ' + it.keyword, 'ok');
                        buildLoMenu();
                        if (loFocusIndex >= loItems.length) loFocusIndex = Math.max(0, loItems.length - 1);
                        while (loFocusIndex < loItems.length && !isSelectableLoItem(loFocusIndex)) loFocusIndex++;
                        renderLeftOverlay();
                    }
                }
            }
            return true;
        }
        if (k === 10009 || k === 8 || k === 27 || k === 39) { // BACK/Right/Escape — navigate up or close
            if (loView === 'channels') {
                loView = 'menu';
                loFocusIndex = 0;
                buildLoMenu();
                loHint.textContent = 'OK select · RED delete · BACK close';
                renderLeftOverlay();
            } else if (loView === 'group-channels') {
                loView = 'groups';
                loFocusIndex = 0;
                buildLoBrowseAll();
                renderLeftOverlay();
            } else if (loView === 'groups') {
                loView = 'menu';
                loFocusIndex = 0;
                buildLoMenu();
                loHint.textContent = 'OK select · RED delete · BACK close';
                renderLeftOverlay();
            } else if (loView === 'series-episodes') {
                loView = 'series-seasons';
                loFocusIndex = 0;
                if (currentSeries) {
                    buildLoSeriesSeasons(currentSeries.id, currentSeries.name);
                }
                renderLeftOverlay();
            } else if (loView === 'series-seasons') {
                loView = 'series-categories';
                loFocusIndex = 0;
                buildLoSeriesCategoriesFromCache();
                renderLeftOverlay();
            } else if (loView === 'series-list') {
                loView = 'series-categories';
                loFocusIndex = 0;
                buildLoSeriesCategoriesFromCache();
                renderLeftOverlay();
            } else if (loView === 'series-categories') {
                loView = 'menu';
                loFocusIndex = 0;
                buildLoMenu();
                loHint.textContent = 'OK select · RED delete · BACK close';
                renderLeftOverlay();
            } else if (loView === 'movie-list') {
                loView = 'movie-categories';
                loFocusIndex = 0;
                buildLoMovieCategoriesFromCache();
                renderLeftOverlay();
            } else if (loView === 'movie-categories') {
                loView = 'menu';
                loFocusIndex = 0;
                buildLoMenu();
                loHint.textContent = 'OK select · RED delete · BACK close';
                renderLeftOverlay();
            } else {
                closeLeftOverlay();
            }
            return true;
        }
        return true; // consume all keys while open
    }

    function openLeftOverlayWithSearch(keyword) {
        leftOverlayOpen = true;
        loView = 'channels';
        loFocusIndex = 0;
        loHasState = true;
        buildLoChannels(keyword);
        renderLeftOverlay();
        leftOverlay.classList.remove('hidden');
        setTimeout(function() { leftOverlay.classList.add('visible'); }, 10);
    }

    function playChannelFromOverlay(ch) {
        if (Player.isPipActive()) closePip();
        hideSubtitles();
        playingChannel = ch;
        npTitle.textContent = 'Watching: ' + ch.name;
        npInfo.textContent = ch.group || '';
        Player.open(ch.url);
        showFsOverlay(ch.name);
    }

    // ── Team name search logic ──
    // Maps shortName / fullName fragments to preferred IPTV search terms.
    // Keys are lowercase. Values are arrays of search terms to try (first match wins).
    var TEAM_ALIASES = {
        // ── Premier League ──
        'arsenal':          ['arsenal'],
        'aston villa':      ['aston villa', 'villa'],
        'bournemouth':      ['bournemouth'],
        'brentford':        ['brentford'],
        'brighton':         ['brighton'],
        'chelsea':          ['chelsea'],
        'crystal palace':   ['crystal palace', 'palace'],
        'everton':          ['everton'],
        'fulham':           ['fulham'],
        'ipswich':          ['ipswich'],
        'ipswich town':     ['ipswich'],
        'leicester':        ['leicester'],
        'leicester city':   ['leicester'],
        'liverpool':        ['liverpool'],
        'man city':         ['manchester city', 'man city'],
        'manchester city':  ['manchester city', 'man city'],
        'man united':       ['manchester united', 'man united', 'man utd'],
        'manchester united':['manchester united', 'man united', 'man utd'],
        'newcastle':        ['newcastle'],
        'newcastle utd':    ['newcastle'],
        "nott'm forest":    ['nottingham', 'forest'],
        'nottingham':       ['nottingham', 'forest'],
        'southampton':      ['southampton'],
        'tottenham':        ['tottenham', 'spurs'],
        'spurs':            ['tottenham', 'spurs'],
        'west ham':         ['west ham'],
        'wolves':           ['wolverhampton', 'wolves'],
        'wolverhampton':    ['wolverhampton', 'wolves'],

        // ── La Liga ──
        'barcelona':        ['barcelona', 'barca'],
        'barça':            ['barcelona', 'barca'],
        'fc barcelona':     ['barcelona', 'barca'],
        'real madrid':      ['real madrid', 'madrid'],
        'atlético':         ['atletico', 'atletico madrid'],
        'atletico':         ['atletico', 'atletico madrid'],
        'atl. madrid':      ['atletico', 'atletico madrid'],
        'athletic':         ['athletic bilbao', 'athletic club', 'bilbao'],
        'athletic club':    ['athletic bilbao', 'athletic club', 'bilbao'],
        'real sociedad':    ['sociedad'],
        'real betis':       ['betis'],
        'villarreal':       ['villarreal'],
        'sevilla':          ['sevilla'],
        'valencia':         ['valencia'],
        'celta vigo':       ['celta'],
        'celta':            ['celta'],
        'rayo vallecano':   ['rayo'],
        'rayo':             ['rayo'],
        'girona':           ['girona'],
        'getafe':           ['getafe'],
        'alavés':           ['alaves'],
        'osasuna':          ['osasuna'],
        'mallorca':         ['mallorca'],
        'las palmas':       ['las palmas'],
        'espanyol':         ['espanyol'],
        'leganés':          ['leganes'],
        'real valladolid':  ['valladolid'],

        // ── Serie A ──
        'juventus':         ['juventus', 'juve'],
        'inter':            ['inter milan', 'inter'],
        'inter milan':      ['inter milan', 'inter'],
        'ac milan':         ['ac milan', 'milan'],
        'napoli':           ['napoli'],
        'roma':             ['roma'],
        'as roma':          ['roma'],
        'lazio':            ['lazio'],
        'atalanta':         ['atalanta'],
        'fiorentina':       ['fiorentina'],
        'bologna':          ['bologna'],
        'torino':           ['torino'],
        'monza':            ['monza'],
        'genoa':            ['genoa'],
        'cagliari':         ['cagliari'],
        'udinese':          ['udinese'],
        'empoli':           ['empoli'],
        'parma':            ['parma'],
        'como':             ['como 1907', 'como'],
        'como 1907':        ['como'],
        'hellas verona':    ['verona'],
        'verona':           ['verona'],
        'lecce':            ['lecce'],
        'venezia':          ['venezia'],
        'ac pisa':          ['pisa'],
        'pisa':             ['pisa'],
        'ac pisa 1909':     ['pisa'],
        'sassuolo':         ['sassuolo'],
        'sampdoria':        ['sampdoria'],
        'cremonese':        ['cremonese'],
        'spezia':           ['spezia'],

        // ── Champions League extras ──
        'bayern':           ['bayern'],
        'bayern munich':    ['bayern'],
        'dortmund':         ['dortmund'],
        'b. dortmund':      ['dortmund'],
        'leverkusen':       ['leverkusen'],
        'rb leipzig':       ['leipzig'],
        'leipzig':          ['leipzig'],
        'psg':              ['paris', 'psg'],
        'paris sg':         ['paris', 'psg'],
        'paris saint-germain': ['paris', 'psg'],
        'marseille':        ['marseille'],
        'lyon':             ['lyon'],
        'benfica':          ['benfica'],
        'porto':            ['porto'],
        'sporting cp':      ['sporting'],
        'ajax':             ['ajax'],
        'psv':              ['psv'],
        'feyenoord':        ['feyenoord'],
        'celtic':           ['celtic'],
        'rangers':          ['rangers'],
        'club brugge':      ['brugge'],
        'salzburg':         ['salzburg'],
        'galatasaray':      ['galatasaray'],
        'shakhtar':         ['shakhtar'],
        'dynamo kyiv':      ['dynamo kyiv', 'kyiv'],
        'red star':         ['red star'],
        'young boys':       ['young boys']
    };

    /**
     * Get search terms for a team name. Returns an array of terms to try.
     * Uses alias map first, then smart fallback:
     *  1. Full shortName
     *  2. Full name (if different)
     *  3. Stripped of common prefixes (FC, AC, AS, etc.)
     *  4. Each word that is 4+ characters (catches "Pisa" from "AC Pisa")
     */
    function getTeamSearchTerms(shortName, fullName) {
        var short = (shortName || '').toLowerCase().trim();
        var full = (fullName || '').toLowerCase().trim();

        // Normalize special characters for lookup
        var normalized = short
            .replace(/ç/g, 'c').replace(/é/g, 'e').replace(/è/g, 'e')
            .replace(/á/g, 'a').replace(/à/g, 'a').replace(/ñ/g, 'n')
            .replace(/ó/g, 'o').replace(/ú/g, 'u').replace(/ü/g, 'u')
            .replace(/í/g, 'i').replace(/ö/g, 'o').replace(/ä/g, 'a')
            .replace(/å/g, 'a');

        // Check alias map (try original, then normalized, then full name)
        if (TEAM_ALIASES[short]) return TEAM_ALIASES[short];
        if (TEAM_ALIASES[normalized]) return TEAM_ALIASES[normalized];
        if (full && TEAM_ALIASES[full]) return TEAM_ALIASES[full];

        // Smart fallback: build candidate search terms
        var terms = [];
        terms.push(short);
        if (full && full !== short) terms.push(full);

        // Strip common prefixes
        var stripped = short
            .replace(/^(fc |cf |ac |as |ss |us |sc |rc |cd |ud |rcd |ssc |afc )/i, '')
            .trim();
        if (stripped && stripped !== short) terms.push(stripped);

        // Also try stripping from full name
        var strippedFull = full
            .replace(/^(fc |cf |ac |as |ss |us |sc |rc |cd |ud |rcd |ssc |afc )/i, '')
            .replace(/ fc$| cf$| sc$| ac$/i, '')
            .trim();
        if (strippedFull && terms.indexOf(strippedFull) === -1) terms.push(strippedFull);

        // Individual significant words (4+ chars)
        var words = short.split(/[\s\-\.]+/);
        for (var i = 0; i < words.length; i++) {
            var w = words[i].replace(/[^a-z]/g, '');
            if (w.length >= 4 && terms.indexOf(w) === -1) terms.push(w);
        }

        return terms;
    }

    /**
     * Search channels using smart team name matching.
     * Tries each search term in order, returns results from first term that has matches.
     * If no term matches, returns combined results from all terms.
     */
    function searchChannelsForTeam(shortName, fullName) {
        var terms = getTeamSearchTerms(shortName, fullName);
        debugLog('team search terms: [' + terms.join(', ') + ']', 'info');

        for (var t = 0; t < terms.length; t++) {
            var term = terms[t];
            var results = [];
            for (var i = 0; i < channels.length; i++) {
                if (channels[i].name.toLowerCase().indexOf(term) !== -1) {
                    results.push(channels[i]);
                }
            }
            if (results.length > 0) {
                debugLog('team search hit on "' + term + '": ' + results.length + ' channels', 'ok');
                return { results: results, term: term };
            }
        }
        debugLog('team search: no results for any term', 'warn');
        return { results: [], term: terms[0] || shortName };
    }

    /**
     * Search channels for a match — tries home team first, then away team,
     * and combines deduplicated results from both.
     */
    function searchChannelsForMatch(match) {
        var home = searchChannelsForTeam(match.homeTeam, match.homeTeamFull);
        var away = searchChannelsForTeam(match.awayTeam, match.awayTeamFull);

        // Combine and deduplicate (by url)
        var seen = {};
        var combined = [];
        var all = home.results.concat(away.results);
        for (var i = 0; i < all.length; i++) {
            var key = all[i].url || all[i].name;
            if (!seen[key]) {
                seen[key] = true;
                combined.push(all[i]);
            }
        }

        // Best single keyword for filter-based searches: whichever found more
        var bestTerm = home.results.length >= away.results.length ? home.term : away.term;
        var displayTerm = home.results.length > 0 ? home.term : away.term;
        if (home.results.length > 0 && away.results.length > 0) {
            displayTerm = home.term + ' + ' + away.term;
        }

        debugLog('match search: ' + combined.length + ' channels (' + displayTerm + ')', 'info');
        return { results: combined, term: displayTerm, bestTerm: bestTerm };
    }

    // ── Scores overlay (while watching) ──

    function openScoresOverlay() {
        if (!isFootballProfile() || !Football.isConfigured()) return;
        scoresOverlayOpen = true;
        soFocusIndex = 0;
        // Update hint based on mode
        var soHint = document.getElementById('so-hint');
        if (pipSelectMode) {
            soHint.textContent = 'OK pick match for PiP · BACK close';
        } else {
            soHint.textContent = 'UP/DOWN browse · OK search · RIGHT details · LEFT close';
        }
        // Use cached data or fetch fresh
        if (footballData && flatMatches.length > 0) {
            renderScoresOverlay();
        } else {
            soScroll.innerHTML = '<div class="scores-loading">loading...</div>';
            Football.fetchMatches(function(err, data) {
                if (err) {
                    soScroll.innerHTML = '<div class="scores-error">' + esc(err) + '</div>';
                    return;
                }
                footballData = data;
                flatMatches = Football.flattenMatches(data);
                renderScoresOverlay();
            });
        }
        scoresOverlay.classList.remove('hidden');
        // Trigger slide-in animation after display
        setTimeout(function() { scoresOverlay.classList.add('visible'); }, 10);
    }

    function closeScoresOverlay() {
        scoresOverlayOpen = false;
        pipSelectMode = false;
        pipShowingResults = false;
        pipSearchResults = [];
        standingsView = false;
        standingsData = [];
        matchDetailView = false;
        matchDetailData = null;
        scoresOverlay.classList.remove('visible');
        setTimeout(function() { scoresOverlay.classList.add('hidden'); }, 260);
    }

    // Build a flat navigable list for scores overlay that includes competitions
    var soNavItems = []; // { type: 'comp', name: '...' } or { type: 'match', match: {...}, flatIdx: N }

    function buildSoNavItems() {
        soNavItems = [];
        if (!footballData) return;
        var flatIdx = 0;
        for (var g = 0; g < footballData.length; g++) {
            var comp = footballData[g];
            soNavItems.push({ type: 'comp', name: comp.name, flag: comp.flag });
            for (var m = 0; m < comp.matches.length; m++) {
                soNavItems.push({ type: 'match', match: comp.matches[m], flatIdx: flatIdx });
                flatIdx++;
            }
        }
    }

    function renderScoresOverlay() {
        if (!footballData || footballData.length === 0) {
            soScroll.innerHTML = '<div class="scores-empty">no games today</div>';
            return;
        }
        buildSoNavItems();
        var html = '';
        for (var i = 0; i < soNavItems.length; i++) {
            var nav = soNavItems[i];
            var f = (i === soFocusIndex) ? ' focused' : '';

            if (nav.type === 'comp') {
                html += '<div class="scores-comp selectable' + f + '" data-nav="' + i + '">' + esc(nav.flag) + ' ' + esc(nav.name) + '</div>';
            } else {
                var match = nav.match;
                var statusText = Football.formatStatus(match);
                var liveCls = match.isLive ? ' live' : '';
                var homeScore = (match.homeScore !== null) ? match.homeScore : '';
                var awayScore = (match.awayScore !== null) ? match.awayScore : '';
                var goalRowCls = match.hasGoal ? ' goal-row' : '';
                var goalHomeCls = match.goalHome ? ' goal' : '';
                var goalAwayCls = match.goalAway ? ' goal' : '';

                html += '<div class="match-row' + f + goalRowCls + '" data-nav="' + i + '">';
                html += '<div class="match-status' + liveCls + '">' + esc(statusText) + '</div>';
                html += '<div class="match-teams">';
                html += '<div class="match-team"><span class="team-name">' + esc(match.homeTeam) + '</span><span class="team-score' + liveCls + goalHomeCls + '">' + homeScore + '</span></div>';
                html += '<div class="match-team"><span class="team-name">' + esc(match.awayTeam) + '</span><span class="team-score' + liveCls + goalAwayCls + '">' + awayScore + '</span></div>';
                html += '</div></div>';
            }
        }
        soScroll.innerHTML = html;

        // Scroll focused into view
        var focusedEl = soScroll.querySelector('[data-nav="' + soFocusIndex + '"]');
        if (focusedEl) {
            focusedEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
    }

    // ── Standings table view ──

    function openStandings(compCode, compName) {
        standingsView = true;
        standingsCompCode = compCode;
        standingsCompName = compName;
        standingsData = [];
        standingsFocusIndex = 0;

        soScroll.innerHTML = '<div class="scores-loading">loading table...</div>';
        var soHeader = document.getElementById('so-header');
        soHeader.textContent = compName;
        var soHint = document.getElementById('so-hint');
        soHint.textContent = 'OK search team · LEFT back';

        Football.fetchStandings(compCode, function(err, data) {
            if (err) {
                soScroll.innerHTML = '<div class="scores-error">' + esc(err) + '</div>';
                return;
            }
            standingsData = data || [];
            renderStandings();
        });
    }

    function closeStandings() {
        standingsView = false;
        standingsData = [];
        standingsCompCode = '';
        standingsCompName = '';
        standingsFocusIndex = 0;

        var soHeader = document.getElementById('so-header');
        soHeader.textContent = 'live scores';
        var soHint = document.getElementById('so-hint');
        soHint.textContent = 'UP/DOWN browse · OK search · RIGHT details · LEFT close';
        renderScoresOverlay();
    }

    function renderStandings() {
        if (!standingsData || standingsData.length === 0) {
            soScroll.innerHTML = '<div class="scores-empty">no standings available</div>';
            return;
        }

        var html = '';
        // Column header
        html += '<div class="st-header-row">';
        html += '<span class="st-pos">#</span>';
        html += '<span class="st-team">Team</span>';
        html += '<span class="st-stat">P</span>';
        html += '<span class="st-stat">W</span>';
        html += '<span class="st-stat">D</span>';
        html += '<span class="st-stat">L</span>';
        html += '<span class="st-stat">GD</span>';
        html += '<span class="st-pts">Pts</span>';
        html += '</div>';

        for (var i = 0; i < standingsData.length; i++) {
            var row = standingsData[i];
            var f = (i === standingsFocusIndex) ? ' focused' : '';
            html += '<div class="st-row' + f + '" data-i="' + i + '">';
            html += '<span class="st-pos">' + row.position + '</span>';
            html += '<span class="st-team">' + esc(row.teamName) + '</span>';
            html += '<span class="st-stat">' + row.played + '</span>';
            html += '<span class="st-stat">' + row.won + '</span>';
            html += '<span class="st-stat">' + row.draw + '</span>';
            html += '<span class="st-stat">' + row.lost + '</span>';
            html += '<span class="st-stat">' + (row.goalDiff > 0 ? '+' : '') + row.goalDiff + '</span>';
            html += '<span class="st-pts">' + row.points + '</span>';
            html += '</div>';
        }

        soScroll.innerHTML = html;
        scrollStandingsFocus();
    }

    function scrollStandingsFocus() {
        var el = soScroll.querySelector('.st-row[data-i="' + standingsFocusIndex + '"]');
        if (el) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }

    // ── Match detail view ──

    function openMatchDetail(matchId, matchLabel) {
        matchDetailView = true;
        matchDetailData = null;

        var soHeader = document.getElementById('so-header');
        soHeader.textContent = matchLabel;
        var soHint = document.getElementById('so-hint');
        soHint.textContent = 'UP/DOWN scroll · LEFT back';

        soScroll.innerHTML = '<div class="scores-loading">loading details...</div>';

        Football.fetchMatchDetails(matchId, function(err, data) {
            if (err) {
                soScroll.innerHTML = '<div class="scores-error">' + esc(err) + '</div>';
                return;
            }
            matchDetailData = data;
            renderMatchDetail();
        });
    }

    function closeMatchDetail() {
        matchDetailView = false;
        matchDetailData = null;

        var soHeader = document.getElementById('so-header');
        soHeader.textContent = 'live scores';
        var soHint = document.getElementById('so-hint');
        soHint.textContent = 'UP/DOWN browse · OK search · RIGHT details · LEFT close';
        renderScoresOverlay();
    }

    function renderMatchDetail() {
        if (!matchDetailData) return;
        var d = matchDetailData;
        var html = '';

        // ── Score header ──
        var homeScore = d.score.home !== null ? d.score.home : '-';
        var awayScore = d.score.away !== null ? d.score.away : '-';
        html += '<div class="md-score-block">';
        html += '<div class="md-team-name">' + esc(d.homeTeam) + '</div>';
        html += '<div class="md-score">' + homeScore + ' - ' + awayScore + '</div>';
        html += '<div class="md-team-name">' + esc(d.awayTeam) + '</div>';
        html += '</div>';

        // Half-time score
        if (d.score.htHome !== null) {
            html += '<div class="md-sub-score">HT: ' + d.score.htHome + ' - ' + d.score.htAway + '</div>';
        }

        // Venue + attendance
        if (d.venue || d.attendance) {
            var info = '';
            if (d.venue) info += d.venue;
            if (d.attendance) info += (info ? ' · ' : '') + d.attendance.toLocaleString() + ' fans';
            html += '<div class="md-info-line">' + esc(info) + '</div>';
        }

        // Referee
        if (d.referees.length > 0) {
            html += '<div class="md-info-line">Ref: ' + esc(d.referees[0].name) + '</div>';
        }

        // ── Debug: data availability ──
        html += '<div class="md-info-line" style="margin-top:10px">';
        html += 'data: ' + d.goals.length + ' goals · ' + d.bookings.length + ' cards · ';
        html += d.homeLineup.length + '+' + d.awayLineup.length + ' lineup · ';
        html += d.substitutions.length + ' subs';
        html += '</div>';

        // ── Goals ──
        if (d.goals.length > 0) {
            html += '<div class="md-section">goals</div>';
            for (var g = 0; g < d.goals.length; g++) {
                var goal = d.goals[g];
                var minStr = goal.minute + "'";
                if (goal.injuryTime) minStr = goal.minute + "+" + goal.injuryTime + "'";
                var typeStr = '';
                if (goal.type === 'OWN_GOAL') typeStr = ' (OG)';
                else if (goal.type === 'PENALTY') typeStr = ' (pen)';
                var assistStr = goal.assist ? ' · ' + esc(goal.assist) : '';
                var scoreStr = (goal.scoreHome !== null) ? ' [' + goal.scoreHome + '-' + goal.scoreAway + ']' : '';
                html += '<div class="md-event">';
                html += '<span class="md-minute">' + esc(minStr) + '</span>';
                html += '<span class="md-event-text">' + esc(goal.scorer) + typeStr + assistStr + '<span class="md-event-dim">' + scoreStr + '</span></span>';
                html += '</div>';
            }
        }

        // ── Bookings ──
        if (d.bookings.length > 0) {
            html += '<div class="md-section">cards</div>';
            for (var b = 0; b < d.bookings.length; b++) {
                var bk = d.bookings[b];
                var cardCls = bk.card === 'RED' ? 'md-card-red' : 'md-card-yellow';
                html += '<div class="md-event">';
                html += '<span class="md-minute">' + bk.minute + "'</span>";
                html += '<span class="md-event-text"><span class="' + cardCls + '">■</span> ' + esc(bk.player) + ' <span class="md-event-dim">(' + esc(bk.team) + ')</span></span>';
                html += '</div>';
            }
        }

        // ── Lineups ──
        if (d.homeLineup.length > 0 || d.awayLineup.length > 0) {
            // Home lineup
            var homeLabel = esc(d.homeTeam);
            if (d.homeFormation) homeLabel += ' (' + esc(d.homeFormation) + ')';
            if (d.homeCoach) homeLabel += ' · ' + esc(d.homeCoach);
            html += '<div class="md-section">' + homeLabel + '</div>';

            for (var h = 0; h < d.homeLineup.length; h++) {
                var hp = d.homeLineup[h];
                var posAbbr = abbreviatePosition(hp.position);
                html += '<div class="md-lineup-row">';
                html += '<span class="md-shirt">' + (hp.shirtNumber || '') + '</span>';
                html += '<span class="md-player-name">' + esc(hp.name) + '</span>';
                html += '<span class="md-position">' + esc(posAbbr) + '</span>';
                html += '</div>';
            }

            // Home bench
            if (d.homeBench.length > 0) {
                html += '<div class="md-bench-label">bench</div>';
                for (var hb = 0; hb < d.homeBench.length; hb++) {
                    var hbp = d.homeBench[hb];
                    html += '<div class="md-lineup-row md-bench">';
                    html += '<span class="md-shirt">' + (hbp.shirtNumber || '') + '</span>';
                    html += '<span class="md-player-name">' + esc(hbp.name) + '</span>';
                    html += '</div>';
                }
            }

            // Away lineup
            var awayLabel = esc(d.awayTeam);
            if (d.awayFormation) awayLabel += ' (' + esc(d.awayFormation) + ')';
            if (d.awayCoach) awayLabel += ' · ' + esc(d.awayCoach);
            html += '<div class="md-section">' + awayLabel + '</div>';

            for (var a = 0; a < d.awayLineup.length; a++) {
                var ap = d.awayLineup[a];
                var aPosAbbr = abbreviatePosition(ap.position);
                html += '<div class="md-lineup-row">';
                html += '<span class="md-shirt">' + (ap.shirtNumber || '') + '</span>';
                html += '<span class="md-player-name">' + esc(ap.name) + '</span>';
                html += '<span class="md-position">' + esc(aPosAbbr) + '</span>';
                html += '</div>';
            }

            // Away bench
            if (d.awayBench.length > 0) {
                html += '<div class="md-bench-label">bench</div>';
                for (var ab = 0; ab < d.awayBench.length; ab++) {
                    var abp = d.awayBench[ab];
                    html += '<div class="md-lineup-row md-bench">';
                    html += '<span class="md-shirt">' + (abp.shirtNumber || '') + '</span>';
                    html += '<span class="md-player-name">' + esc(abp.name) + '</span>';
                    html += '</div>';
                }
            }
        }

        // ── Substitutions ──
        if (d.substitutions.length > 0) {
            html += '<div class="md-section">substitutions</div>';
            for (var s = 0; s < d.substitutions.length; s++) {
                var sub = d.substitutions[s];
                html += '<div class="md-event">';
                html += '<span class="md-minute">' + sub.minute + "'</span>";
                html += '<span class="md-event-text md-sub-in">↑ ' + esc(sub.playerIn) + '</span>';
                html += '<span class="md-event-text md-sub-out">↓ ' + esc(sub.playerOut) + '</span>';
                html += '</div>';
            }
        }

        // ── Fallback if no detailed data ──
        if (d.goals.length === 0 && d.bookings.length === 0 &&
            d.homeLineup.length === 0 && d.awayLineup.length === 0 &&
            d.substitutions.length === 0) {
            html += '<div class="md-info-line" style="margin-top:20px;text-align:center">';
            html += 'detailed match data not available for this match';
            html += '</div>';
        }

        soScroll.innerHTML = html;
    }

    function abbreviatePosition(pos) {
        if (!pos) return '';
        var map = {
            'Goalkeeper': 'GK',
            'Centre-Back': 'CB',
            'Left-Back': 'LB',
            'Right-Back': 'RB',
            'Defensive Midfield': 'DM',
            'Central Midfield': 'CM',
            'Attacking Midfield': 'AM',
            'Left Midfield': 'LM',
            'Right Midfield': 'RM',
            'Left Winger': 'LW',
            'Right Winger': 'RW',
            'Centre-Forward': 'CF',
            'Offence': 'FW',
            'Defence': 'DF',
            'Midfield': 'MF'
        };
        return map[pos] || pos.substring(0, 3).toUpperCase();
    }

    function handleScoresOverlayKey(k) {
        if (!scoresOverlayOpen) return false;

        // ── Match detail view ──
        if (matchDetailView) {
            if (k === 37 || k === 10009 || k === 27 || k === 8) { // LEFT/BACK
                closeMatchDetail();
                return true;
            }
            if (k === 38) { // UP — scroll up
                soScroll.scrollTop = Math.max(0, soScroll.scrollTop - 60);
                return true;
            }
            if (k === 40) { // DOWN — scroll down
                soScroll.scrollTop += 60;
                return true;
            }
            return true; // consume all keys
        }

        // ── Standings table view ──
        if (standingsView) {
            if (k === 37 || k === 10009 || k === 27 || k === 8) { // LEFT/BACK
                closeStandings();
                return true;
            }
            if (k === 38) { // UP
                if (standingsFocusIndex > 0) { standingsFocusIndex--; renderStandings(); }
                return true;
            }
            if (k === 40) { // DOWN
                if (standingsFocusIndex < standingsData.length - 1) { standingsFocusIndex++; renderStandings(); }
                return true;
            }
            if (k === 13) { // OK — search for this team
                var row = standingsData[standingsFocusIndex];
                if (row) {
                    var found = searchChannelsForTeam(row.teamName, row.teamNameFull);
                    closeScoresOverlay();
                    standingsView = false;
                    if (view === 'fullscreen') {
                        openLeftOverlayWithSearch(found.term);
                    } else {
                        if (view === 'fullscreen') exitFullscreen();
                        showSearchResults(found.term, true);
                    }
                }
                return true;
            }
            return true;
        }

        // ── PiP mode: showing channel search results ──
        if (pipSelectMode && pipShowingResults) {
            if (k === 37 || k === 10009 || k === 27 || k === 8) { // BACK — go back to match list
                pipShowingResults = false;
                pipSearchResults = [];
                renderScoresOverlay();
                return true;
            }
            if (k === 38) { // UP
                if (pipSearchFocusIndex > 0) { pipSearchFocusIndex--; renderPipSearchResults(); }
                return true;
            }
            if (k === 40) { // DOWN
                if (pipSearchFocusIndex < pipSearchResults.length - 1) { pipSearchFocusIndex++; renderPipSearchResults(); }
                return true;
            }
            if (k === 13) { // OK — open this channel as PiP
                if (pipSearchFocusIndex >= 0 && pipSearchFocusIndex < pipSearchResults.length) {
                    openPipWithChannel(pipSearchResults[pipSearchFocusIndex]);
                }
                return true;
            }
            return true;
        }

        // ── Normal or PiP match/competition selection ──
        if (k === 37 || k === 10009 || k === 27 || k === 8) { // LEFT/Back/Escape
            closeScoresOverlay();
            pipSelectMode = false;
            pipShowingResults = false;
            return true;
        }
        if (k === 38) { // UP
            if (soFocusIndex > 0) { soFocusIndex--; renderScoresOverlay(); }
            return true;
        }
        if (k === 40) { // DOWN
            if (soFocusIndex < soNavItems.length - 1) { soFocusIndex++; renderScoresOverlay(); }
            return true;
        }
        if (k === 39) { // RIGHT — open standings for comp, or match detail for match
            if (soFocusIndex >= 0 && soFocusIndex < soNavItems.length) {
                var nav = soNavItems[soFocusIndex];
                if (nav.type === 'comp') {
                    // Find competition code from name
                    var compCode = '';
                    for (var g = 0; g < footballData.length; g++) {
                        if (footballData[g].name === nav.name) {
                            compCode = footballData[g].code;
                            break;
                        }
                    }
                    if (compCode) {
                        openStandings(compCode, nav.name);
                    }
                } else if (nav.type === 'match') {
                    var m = nav.match;
                    var label = m.homeTeam + ' vs ' + m.awayTeam;
                    openMatchDetail(m.id, label);
                }
            }
            return true;
        }
        if (k === 13) { // OK — select match or competition
            if (soFocusIndex >= 0 && soFocusIndex < soNavItems.length) {
                var nav = soNavItems[soFocusIndex];

                if (nav.type === 'comp') {
                    // Competition header selected — search for league name
                    var searchTerm = nav.name.toLowerCase();
                    if (pipSelectMode) {
                        // In PiP mode, search channels for this league
                        pipSearchForLeague(searchTerm);
                    } else if (view === 'fullscreen' && leftOverlayOpen === false) {
                        // From fullscreen scores overlay — open left panel with results
                        closeScoresOverlay();
                        openLeftOverlayWithSearch(searchTerm);
                    } else {
                        closeScoresOverlay();
                        if (view === 'fullscreen') exitFullscreen();
                        debugLog('league search: ' + searchTerm, 'info');
                        showSearchResults(searchTerm, false);
                    }
                } else if (nav.type === 'match') {
                    var match = nav.match;
                    if (pipSelectMode) {
                        pipSearchForMatch(match);
                    } else if (view === 'fullscreen') {
                        // From fullscreen — open left panel with search results
                        var found = searchChannelsForMatch(match);
                        closeScoresOverlay();
                        openLeftOverlayWithSearch(found.bestTerm);
                    } else {
                        var found = searchChannelsForMatch(match);
                        closeScoresOverlay();
                        if (view === 'fullscreen') exitFullscreen();
                        debugLog('overlay search: ' + found.bestTerm, 'info');
                        showSearchResults(found.bestTerm, true);
                    }
                }
            }
            return true;
        }
        return true; // consume all keys while overlay is open
    }

    // ── Goal toast notification ──
    var goalToast = document.getElementById('goal-toast');
    var goalToastBody = goalToast.querySelector('.goal-toast-body');
    var goalToastScore = goalToast.querySelector('.goal-toast-score');
    var goalToastTimer = null;
    var goalToastQueue = [];
    var goalToastShowing = false;

    function showGoalToast(goalInfo) {
        goalToastQueue.push(goalInfo);
        if (!goalToastShowing) processGoalQueue();
    }

    function processGoalQueue() {
        if (goalToastQueue.length === 0) {
            goalToastShowing = false;
            return;
        }
        goalToastShowing = true;
        var info = goalToastQueue.shift();
        var m = info.match;
        var scorer = info.homeGoal ? m.homeTeam : m.awayTeam;
        goalToastBody.textContent = scorer + ' scores!';
        goalToastScore.textContent = m.homeTeam + ' ' + (m.homeScore || 0) + ' - ' + (m.awayScore || 0) + ' ' + m.awayTeam;
        goalToast.classList.add('visible');
        debugLog('GOAL: ' + m.homeTeam + ' ' + m.homeScore + '-' + m.awayScore + ' ' + m.awayTeam, 'ok');

        clearTimeout(goalToastTimer);
        goalToastTimer = setTimeout(function() {
            goalToast.classList.remove('visible');
            setTimeout(function() { processGoalQueue(); }, 400);
        }, 6000);
    }

    // Click support for overlay matches
    soScroll.addEventListener('click', function(e) {
        var el = e.target.closest('.match-row');
        if (!el) return;
        soFocusIndex = parseInt(el.getAttribute('data-match'), 10);
        renderScoresOverlay();
        // Trigger search
        if (soFocusIndex >= 0 && soFocusIndex < flatMatches.length) {
            var match = flatMatches[soFocusIndex];
            closeScoresOverlay();
            if (view === 'fullscreen') exitFullscreen();
            var found = searchChannelsForMatch(match);
            showSearchResults(found.bestTerm, true);
        }
    });

    // Click support for scores
    scoresScroll.addEventListener('click', function(e) {
        var el = e.target.closest('.match-row');
        if (!el) return;
        scoresFocusIndex = parseInt(el.getAttribute('data-match'), 10);
        homePanelFocus = 'right';
        renderScores();
        renderHome();
        selectMatch();
    });

    // ══════════════════════════════════════
    // ACCOUNT PICKER (who is watching?)
    // ══════════════════════════════════════

    function openAccountPicker() {
        accountPickerOpen = true;
        accountFocusIndex = 0;
        renderAccountPicker();
        accountPicker.classList.remove('hidden');
    }

    function closeAccountPicker() {
        accountPickerOpen = false;
        accountPicker.classList.add('hidden');
    }

    function renderAccountPicker() {
        var html = '';
        for (var i = 0; i < ACCOUNTS.length; i++) {
            var f = (i === accountFocusIndex) ? ' focused' : '';
            html += '<div class="account-item' + f + '" data-i="' + i + '">' +
                    '<span class="picker-prefix">&gt;</span>' + esc(ACCOUNTS[i].name) + '</div>';
        }
        accountPickerList.innerHTML = html;
    }

    function selectAccount() {
        var account = ACCOUNTS[accountFocusIndex];
        if (!account) return;
        activeAccount = account;
        debugLog('account selected: ' + account.name, 'ok');
        try { localStorage.setItem('iptv_active_account', account.name); } catch(e) {}
        closeAccountPicker();
        openProfilePicker();
    }

    function handleAccountPickerKey(k) {
        if (!accountPickerOpen) return false;
        if (k === 38) { // UP
            if (accountFocusIndex > 0) { accountFocusIndex--; renderAccountPicker(); }
            return true;
        }
        if (k === 40) { // DOWN
            if (accountFocusIndex < ACCOUNTS.length - 1) { accountFocusIndex++; renderAccountPicker(); }
            return true;
        }
        if (k === 13) { // OK
            selectAccount();
            return true;
        }
        if (k === 10009 || k === 8 || k === 27) { // BACK — quit from account picker
            try { tizen.application.getCurrentApplication().exit(); } catch(e) {
                debugLog('quit not available in browser', 'info');
            }
            return true;
        }
        return true; // consume all keys
    }

    // ══════════════════════════════════════
    // PROFILE PICKER (what to watch?)
    // ══════════════════════════════════════

    function openProfilePicker() {
        profilePickerOpen = true;
        pickerFocusIndex = 0;
        renderProfilePicker();
        profilePicker.classList.remove('hidden');
    }

    function closeProfilePicker() {
        profilePickerOpen = false;
        profilePicker.classList.add('hidden');
    }

    var pickerQuitEl = document.getElementById('picker-quit');
    // Total picker items = profiles + 1 (quit). quit is at index userProfiles.length.

    function renderProfilePicker() {
        var html = '';
        for (var i = 0; i < userProfiles.length; i++) {
            var f = (i === pickerFocusIndex) ? ' focused' : '';
            html += '<div class="picker-item' + f + '" data-i="' + i + '">' +
                    '<span class="picker-prefix">&gt;</span>' + esc(userProfiles[i].displayName) + '</div>';
        }
        profilePickerList.innerHTML = html;
        // Quit button focus
        var isQuit = (pickerFocusIndex === userProfiles.length);
        pickerQuitEl.classList.toggle('focused', isQuit);
    }

    function selectPickerProfile() {
        // Check if quit is selected
        if (pickerFocusIndex === userProfiles.length) {
            // Quit the app
            try { tizen.application.getCurrentApplication().exit(); } catch(e) {
                debugLog('quit not available in browser', 'info');
            }
            return;
        }

        var profile = userProfiles[pickerFocusIndex];
        if (!profile) return;
        setActiveProfile(profile);
        resetLeftOverlayState();
        closeProfilePicker();
        debugLog('selected profile: ' + profile.displayName, 'ok');

        // Handle unsupported profile types
        if (profile.profileType === 'unsupported') {
            showUnsupported(profile.displayName);
            return;
        }

        loadingEl.classList.remove('hidden');
        var pickName = activeAccount ? activeAccount.name : profile.displayName;
        loadingHello.textContent = 'hello ' + pickName + '...';
        startLoading();
    }

    function handlePickerKey(k) {
        if (!profilePickerOpen) return false;
        var totalItems = userProfiles.length + 1; // profiles + quit
        if (k === 38) { // UP
            if (pickerFocusIndex > 0) { pickerFocusIndex--; renderProfilePicker(); }
            return true;
        }
        if (k === 40) { // DOWN
            if (pickerFocusIndex < totalItems - 1) { pickerFocusIndex++; renderProfilePicker(); }
            return true;
        }
        if (k === 13) { // OK
            selectPickerProfile();
            return true;
        }
        if (k === 10009 || k === 8 || k === 27) { // BACK — go back to account picker
            closeProfilePicker();
            openAccountPicker();
            return true;
        }
        return true; // consume all keys while picker is open
    }

    // Mouse support for picker
    profilePickerList.addEventListener('click', function(e) {
        var el = e.target.closest('.picker-item');
        if (!el) return;
        pickerFocusIndex = parseInt(el.getAttribute('data-i'), 10);
        selectPickerProfile();
    });
    profilePickerList.addEventListener('mouseover', function(e) {
        var el = e.target.closest('.picker-item');
        if (!el) return;
        pickerFocusIndex = parseInt(el.getAttribute('data-i'), 10);
        renderProfilePicker();
    });

    // ══════════════════════════════════════
    // QR CODE + CODE ENTRY
    // ══════════════════════════════════════

    function openQrOverlay() {
        qrOverlayOpen = true;
        qrContainer.innerHTML = '';
        try {
            var qr = qrcode(0, 'M');
            qr.addData(PROFILE_FORM_URL);
            qr.make();
            qrContainer.innerHTML = qr.createSvgTag(8, 0);
        } catch(e) {
            qrContainer.textContent = 'QR error';
            debugLog('QR error: ' + e, 'fail');
        }
        qrOverlay.classList.remove('hidden');
    }

    function closeQrOverlay() {
        qrOverlayOpen = false;
        qrOverlay.classList.add('hidden');
    }

    function openCodeEntry() {
        closeQrOverlay();
        codeEntryOpen = true;
        codeInput.value = '';
        codeOverlay.classList.remove('hidden');
        codeInput.focus();
    }

    function closeCodeEntry() {
        codeEntryOpen = false;
        codeOverlay.classList.add('hidden');
        codeInput.blur();
    }

    function importProfileFromCode() {
        var code = codeInput.value.trim();
        if (!code) return;
        try {
            var json = atob(code);
            var data = JSON.parse(json);
            if (!data.n) { debugLog('import: missing name', 'fail'); return; }

            // Check duplicate
            for (var j = 0; j < userProfiles.length; j++) {
                if (userProfiles[j].displayName.toLowerCase() === data.n.toLowerCase()) {
                    debugLog('profile "' + data.n + '" already exists', 'fail');
                    closeCodeEntry();
                    return;
                }
            }

            var keywords = [];
            if (data.k) {
                var parts = data.k.split(',');
                for (var i = 0; i < parts.length; i++) {
                    var kw = parts[i].trim().toLowerCase();
                    if (kw) keywords.push(kw);
                }
            }

            var newProfile = {
                displayName: data.n,
                username: data.u || data.n,
                password: data.p || '',
                searches: keywords
            };
            userProfiles.push(newProfile);
            saveUserProfiles();
            debugLog('imported profile: ' + data.n, 'ok');

            closeCodeEntry();
            setActiveProfile(newProfile);
            showHome();
            try { localStorage.removeItem('iptv_cache'); } catch(e) {}
            tryXtreamHost(0);
        } catch(e) {
            debugLog('import failed: ' + e, 'fail');
        }
    }

    function handleQrKey(k) {
        if (k === 13) { // OK — proceed to code entry
            openCodeEntry();
            return true;
        }
        if (k === 10009 || k === 27 || k === 8) {
            closeQrOverlay();
            return true;
        }
        return true;
    }

    function handleCodeEntryKey(k) {
        // If input is focused, let it handle typing
        if (document.activeElement === codeInput) {
            if (k === 10009 || k === 27) { closeCodeEntry(); return true; }
            return false;
        }
        if (k === 13) { codeInput.focus(); return true; }
        if (k === 10009 || k === 27 || k === 8) { closeCodeEntry(); return true; }
        return true;
    }

    // ══════════════════════════════════════
    // APP VISIBILITY / LIFECYCLE
    // ══════════════════════════════════════

    var BG_MUTE_STOP_DELAY = 5 * 60 * 1000;   // stop video after 5 min in background
    var BG_RELOAD_DELAY = 10 * 60 * 1000;     // force channel reload after 10 min
    var bgStopTimer = null;
    var bgReloadTimer = null;
    var wasMutedByApp = false;
    var wasStoppedByBg = false;
    var needsReload = false;

    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            // App went to background (user pressed HOME)
            debugLog('app hidden — muting', 'info');
            // Close PiP immediately when backgrounded
            if (Player.isPipActive()) closePip();
            if (playingChannel) {
                Player.mute();
                wasMutedByApp = true;
            }
            // After 5 minutes, stop the video
            bgStopTimer = setTimeout(function() {
                if (document.hidden && playingChannel) {
                    debugLog('bg 5min — stopping video', 'info');
                    Player.stop();
                    playingChannel = null;
                    wasStoppedByBg = true;
                    wasMutedByApp = false;
                }
            }, BG_MUTE_STOP_DELAY);
            // After 10 minutes, mark for full reload
            bgReloadTimer = setTimeout(function() {
                if (document.hidden) {
                    debugLog('bg 10min — will reload on return', 'info');
                    needsReload = true;
                }
            }, BG_RELOAD_DELAY);
        } else {
            // App came back to foreground
            clearTimeout(bgStopTimer);
            clearTimeout(bgReloadTimer);
            bgStopTimer = null;
            bgReloadTimer = null;

            if (needsReload) {
                // Gone for 10+ min — force full reload
                debugLog('returning after 10min — full reload', 'info');
                needsReload = false;
                wasStoppedByBg = false;
                wasMutedByApp = false;
                npTitle.textContent = '';
                npInfo.textContent = '';
                try { localStorage.removeItem('iptv_cache'); } catch(e) {}
                showHome();
                tryXtreamHost(0);
            } else if (wasStoppedByBg) {
                // Video stopped but channels still fresh — just go home
                debugLog('returning after 5min — video stopped', 'info');
                wasStoppedByBg = false;
                wasMutedByApp = false;
                npTitle.textContent = '';
                npInfo.textContent = '';
                showHome();
            } else if (wasMutedByApp) {
                // Quick return — just unmute
                debugLog('returning — unmuting', 'info');
                Player.unmute();
                wasMutedByApp = false;
            }
        }
    });

    // ── Start ──
    init();
})();

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
            displayName: 'ruy',
            username: '9b1f6b5188',
            password: '36690c9df5',
            searches: ['barca', 'madrid', 'champions league', 'la liga', 'premier league'],
            categoryFilters: [
                'sport', 'football', 'fotboll', 'soccer', 'futbol',
                'premier league', 'champions league', 'la liga', 'serie a',
                'bein', 'dazn', 'espn'
            ],
            categoryExcludes: EXCLUDES_ALL
        },
        {
            displayName: 'mama',
            username: 'a9de3d71b8',
            password: '78600dc309',
            searches: [],
            categoryFilters: [
                'sweden', 'swedish', 'sverige', 'nordic', 'scandinavia',
                'se ', 'se:', 'se|', 'se-'
            ],
            categoryExcludes: EXCLUDES_ALL
        },
        {
            displayName: 'mattias',
            username: 'eb47f5e8c5',
            password: '454b464362',
            searches: [],
            categoryFilters: [
                'sweden', 'swedish', 'sverige', 'nordic', 'scandinavia',
                'se ', 'se:', 'se|', 'se-',
                'sport', 'football', 'fotboll', 'soccer',
                'uk', 'united kingdom', 'england', 'english',
                'usa', 'us ', 'us:', 'us|', 'us-',
                'bein', 'dazn', 'espn',
                'premium', 'vip'
            ],
            categoryExcludes: EXCLUDES_ALL
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

    var view = 'loading';   // 'loading' | 'home' | 'channels' | 'groups' | 'fullscreen'
    var currentProfile = null;
    var currentGroup = null;
    var currentSearch = null;
    var items = [];
    var focusedIndex = 0;
    var filterFocused = false;
    var playingChannel = null;
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
    var profilePicker = document.getElementById('profile-picker');
    var profilePickerList = document.getElementById('profile-picker-list');
    var pickerFocusIndex = 0;
    var categoryLogOverlay = document.getElementById('category-log-overlay');
    var categoryLogList = document.getElementById('category-log-list');
    var catTabLoaded = document.getElementById('cat-tab-loaded');
    var catTabSkipped = document.getElementById('cat-tab-skipped');
    var categoryLogTab = 0; // 0=loaded, 1=skipped

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
        updateClock();
        setInterval(updateClock, 30000);
        debugLogEl.style.display = 'none'; // hidden by default
        debugLog('starting', 'ok');

        // First launch — show profile picker
        if (!activeProfile) {
            loadingEl.classList.add('hidden');
            openProfilePicker();
            return;
        }

        // Returning user — personalize and load channels
        loadingHello.textContent = 'hello ' + activeProfile.displayName + '...';
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
            buildProfiles();
            loadingEl.classList.add('hidden');
            showHome();
            refreshInBackground();
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
            getActiveExcludes()
        );
    }

    function onChannelsLoaded(result) {
        channels = result;
        groups = Playlist.getGroups(channels);
        Tagger.tagChannels(channels);
        buildProfiles();
        debugLog(channels.length + ' channels via ' + workingHost, 'ok');
        loadingEl.classList.add('hidden');
        showHome();
    }

    function refreshInBackground() {
        var hostOrder = getHostOrder();
        tryBackgroundHost(0, hostOrder);
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
                buildProfiles();
                debugLog('bg refresh: ' + channels.length + ' ch via ' + host, 'ok');
                if (view === 'home') renderHome();
                else if (view === 'channels' || view === 'groups') rebuildChannelList();
            },
            getActiveFilters(),
            getActiveExcludes()
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
        if (activeProfile) {
            return { username: activeProfile.username, password: activeProfile.password };
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
        if (name === 'home') homeScreen.classList.remove('hidden');
        else if (name === 'channels') channelScreen.classList.remove('hidden');
    }

    function showHome() {
        view = 'home';
        currentProfile = null;
        currentGroup = null;
        currentSearch = null;
        focusedIndex = 0;
        filterFocused = false;
        addSearchMode = false;
        sortMode = 'none';
        hideFilterBar();
        // Stop any playing video
        if (playingChannel) {
            Player.stop();
            playingChannel = null;
            npTitle.textContent = '';
            npInfo.textContent = '';
        }
        switchScreen('home');
        buildHomeItems();
        // Skip non-selectable items
        focusedIndex = 0;
        while (focusedIndex < items.length && !isSelectableHomeItem(focusedIndex)) focusedIndex++;
        renderHome();
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

    function showSearchResults(keyword) {
        currentProfile = null;
        currentGroup = null;
        currentSearch = keyword;
        showChannelView(keyword);
    }

    function showProfileChannels(profile) {
        currentProfile = profile;
        currentGroup = null;
        currentSearch = null;
        showChannelView(profile.label);
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
    // HOME — build & render
    // ══════════════════════════════════════

    function buildHomeItems() {
        items = [];

        // Active profile indicator
        items.push({ type: 'profile-header', label: activeProfile ? activeProfile.displayName : 'no profile' });

        // Saved searches from active profile
        for (var j = 0; j < savedSearches.length; j++) {
            items.push({ type: 'search', label: savedSearches[j], keyword: savedSearches[j] });
        }
        // + Add search
        items.push({ type: 'addsearch', label: '+ Add search' });

        // Category profiles (with separator on first)
        for (var i = 0; i < PROFILES.length; i++) {
            var p = PROFILES[i];
            items.push({
                type: 'profile',
                label: p.label,
                profile: p,
                separator: i === 0
            });
        }
        // Browse all
        items.push({ type: 'browse', label: 'Browse all' });

        // Profile management section
        var profileSectionStarted = false;
        if (userProfiles.length > 1) {
            for (var k = 0; k < userProfiles.length; k++) {
                var up = userProfiles[k];
                if (up === activeProfile) continue;
                items.push({
                    type: 'switch-profile',
                    label: 'Switch to ' + up.displayName,
                    userProfile: up,
                    separator: !profileSectionStarted
                });
                profileSectionStarted = true;
            }
        }
        // Add-profile actions hidden (profiles are hardcoded)

        // Show category log
        if (lastCategoryStats) {
            items.push({ type: 'show-category-log', label: 'Show category log (' + lastCategoryStats.added + ' loaded, ' + lastCategoryStats.skipped + ' skipped)', separator: !profileSectionStarted });
        }

        // Show/hide logs
        items.push({ type: 'toggle-logs', label: debugVisible ? 'Hide logs' : 'Show logs' });
    }

    function renderHome() {
        var html = '';
        for (var i = 0; i < items.length; i++) {
            var it = items[i];
            var f = (i === focusedIndex) ? ' focused' : '';
            var sep = it.separator ? ' separator' : '';

            if (it.type === 'profile-header') {
                html += '<div class="hmi dim" data-i="' + i + '" style="font-size:16px;margin-bottom:8px;pointer-events:none;">' +
                        'profile: ' + esc(it.label) + '</div>';
            }
            else if (it.type === 'search') {
                html += '<div class="hmi' + f + '" data-i="' + i + '">' +
                        '<span class="prefix">&gt;</span>' + esc(it.label) + '</div>';
            }
            else if (it.type === 'addsearch') {
                html += '<div class="hmi dim' + f + '" data-i="' + i + '">' + esc(it.label) + '</div>';
            }
            else if (it.type === 'profile') {
                html += '<div class="hmi profile-item' + sep + f + '" data-i="' + i + '">' + esc(it.label) + '</div>';
            }
            else if (it.type === 'browse') {
                html += '<div class="hmi dim' + f + '" data-i="' + i + '">' + esc(it.label) + '</div>';
            }
            else if (it.type === 'switch-profile') {
                html += '<div class="hmi dim' + sep + f + '" data-i="' + i + '">' + esc(it.label) + '</div>';
            }
            else if (it.type === 'add-profile-qr') {
                html += '<div class="hmi dim' + sep + f + '" data-i="' + i + '">' + esc(it.label) + '</div>';
            }
            else if (it.type === 'add-profile') {
                html += '<div class="hmi dim' + f + '" data-i="' + i + '">' + esc(it.label) + '</div>';
            }
            else if (it.type === 'show-category-log') {
                html += '<div class="hmi dim' + sep + f + '" data-i="' + i + '">' + esc(it.label) + '</div>';
            }
            else if (it.type === 'toggle-logs') {
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
        if (view === 'groups') {
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
        }
        if (items.length === 0) {
            html = '<div class="chi empty">no results...</div>';
        }
        channelList.innerHTML = html;
        scrollToFocused(channelList, 'chi');
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
        playingChannel = ch;
        npTitle.textContent = 'Watching: ' + ch.name;
        npInfo.textContent = ch.group || '';
        Player.open(ch.url);
        renderChannels();
    }

    function enterFullscreen() {
        if (!playingChannel) return;
        view = 'fullscreen';
        // Hide everything — AVPlay is always rendering fullscreen at z-index 1
        channelScreen.classList.add('hidden');
        homeScreen.classList.add('hidden');
        footerEl.style.display = 'none';
        fsOverlay.classList.remove('hidden');
        showFsOverlay(playingChannel.name);
    }

    function exitFullscreen() {
        fsOverlay.classList.add('hidden');
        fsOverlay.classList.remove('visible');
        footerEl.style.display = '';
        // Return to channel screen
        view = 'channels';
        channelScreen.classList.remove('hidden');
    }

    function showFsOverlay(text) {
        fsChInfo.textContent = text;
        fsOverlay.classList.add('visible');
        clearTimeout(overlayTimer);
        overlayTimer = setTimeout(function() { fsOverlay.classList.remove('visible'); }, FS_OVERLAY_TIMEOUT);
    }

    Player.onError(function(err) { npTitle.textContent = 'error: ' + err; });
    Player.onBuffering(function(b) {
        if (b) bufferingEl.classList.add('visible');
        else bufferingEl.classList.remove('visible');
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
        } catch(e) {}
    }

    document.addEventListener('keydown', function(e) {
        // Profile picker intercept (first launch)
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

        // Fullscreen view — any key exits except media keys
        if (view === 'fullscreen') {
            if (k === 10009 || k === 8 || k === 37 || k === 27) { // Back/Left/Escape
                exitFullscreen();
                e.preventDefault();
                return;
            }
            if (k === 13) { // OK — show overlay
                showFsOverlay(playingChannel ? playingChannel.name : '');
                return;
            }
            if (k === 415 || k === 10252) { Player.resume(); return; }
            if (k === 19) { Player.pause(); return; }
            if (k === 413) { Player.stop(); return; }
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
            case 39: // RIGHT — enter fullscreen from channel view
                if (view === 'channels' && playingChannel) enterFullscreen();
                break;
            case 415: case 10252: Player.resume(); break;
            case 19: Player.pause(); break;
            case 413: Player.stop(); break;
            default: break;
        }
    });

    function isSelectableHomeItem(idx) {
        if (idx < 0 || idx >= items.length) return false;
        return items[idx].type !== 'profile-header';
    }

    function navUp() {
        if (view === 'home') {
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
        } else if (it.type === 'profile') {
            if (it.profile.special === 'favorites') {
                currentProfile = it.profile;
                currentGroup = null;
                currentSearch = null;
                showChannelView(it.profile.label);
            } else {
                showProfileChannels(it.profile);
            }
        } else if (it.type === 'browse') {
            showGroups();
        } else if (it.type === 'switch-profile') {
            switchToProfile(it.userProfile);
        } else if (it.type === 'add-profile-qr') {
            openQrOverlay();
        } else if (it.type === 'add-profile') {
            openProfileDialog();
        } else if (it.type === 'show-category-log') {
            openCategoryLog();
        } else if (it.type === 'toggle-logs') {
            debugVisible = !debugVisible;
            debugLogEl.style.display = debugVisible ? 'block' : 'none';
            buildHomeItems();
            renderHome();
        } else if (it.type === 'channel') {
            playChannel(it.ch);
        } else if (it.type === 'group') {
            showGroupChannels(it.group);
        }
    }

    function goBack() {
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

        if (view === 'channels') {
            showHome();
        } else if (view === 'groups') {
            showHome();
        } else if (view === 'fullscreen') {
            exitFullscreen();
        }
        // On home — do nothing (or could exit app)
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
        loadingHello.textContent = 'hello ' + profile.displayName + '...';
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
    // PROFILE PICKER (first launch)
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

    function renderProfilePicker() {
        var html = '';
        for (var i = 0; i < userProfiles.length; i++) {
            var f = (i === pickerFocusIndex) ? ' focused' : '';
            html += '<div class="picker-item' + f + '" data-i="' + i + '">' + esc(userProfiles[i].displayName) + '</div>';
        }
        profilePickerList.innerHTML = html;
    }

    function selectPickerProfile() {
        var profile = userProfiles[pickerFocusIndex];
        if (!profile) return;
        setActiveProfile(profile);
        closeProfilePicker();
        debugLog('selected profile: ' + profile.displayName, 'ok');
        loadingEl.classList.remove('hidden');
        loadingHello.textContent = 'hello ' + profile.displayName + '...';
        startLoading();
    }

    function handlePickerKey(k) {
        if (!profilePickerOpen) return false;
        if (k === 38) { // UP
            if (pickerFocusIndex > 0) { pickerFocusIndex--; renderProfilePicker(); }
            return true;
        }
        if (k === 40) { // DOWN
            if (pickerFocusIndex < userProfiles.length - 1) { pickerFocusIndex++; renderProfilePicker(); }
            return true;
        }
        if (k === 13) { // OK
            selectPickerProfile();
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

    // ── Start ──
    init();
})();

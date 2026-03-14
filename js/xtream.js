var Xtream = (function() {
    'use strict';

    var baseUrl = '';
    var username = '';
    var password = '';

    function init(host, user, pass) {
        baseUrl = 'http://' + host;
        username = user;
        password = pass;
    }

    function apiUrl(action, params) {
        var url = baseUrl + '/player_api.php?username=' + username + '&password=' + password;
        if (action) url += '&action=' + action;
        if (params) url += params;
        return url;
    }

    function streamUrl(streamId, extension) {
        extension = extension || 'ts';
        return baseUrl + '/live/' + username + '/' + password + '/' + streamId + '.' + extension;
    }

    function request(url, timeout, callback) {
        var done = false;
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.timeout = timeout || 15000;

        function finish(err, data) {
            if (done) return;
            done = true;
            callback(err, data);
        }

        xhr.ontimeout = function() { finish('Timeout', null); };
        xhr.onerror = function() { finish('Network error', null); };
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    try {
                        var data = JSON.parse(xhr.responseText);
                        finish(null, data);
                    } catch (e) {
                        finish('Invalid JSON: ' + e.message, null);
                    }
                } else {
                    finish('HTTP ' + xhr.status, null);
                }
            }
        };
        xhr.send();
    }

    function authenticate(callback) {
        request(apiUrl(), 8000, function(err, data) {
            if (err) return callback(err);
            if (!data || !data.user_info) return callback('No user info in response');
            if (data.user_info.auth !== 1) return callback('Auth failed: ' + (data.user_info.message || 'unknown'));
            callback(null, data);
        });
    }

    function getCategories(callback) {
        request(apiUrl('get_live_categories'), 10000, function(err, data) {
            if (err) return callback(err);
            callback(null, data || []);
        });
    }

    // Load streams for a single category
    function getStreamsByCategory(categoryId, callback) {
        request(apiUrl('get_live_streams', '&category_id=' + categoryId), 15000, function(err, data) {
            if (err) return callback(err);
            callback(null, data || []);
        });
    }

    function buildChannelList(categories, streams) {
        var catMap = {};
        for (var i = 0; i < categories.length; i++) {
            catMap[categories[i].category_id] = categories[i].category_name;
        }

        var channels = [];
        for (var j = 0; j < streams.length; j++) {
            var s = streams[j];
            channels.push({
                name: s.name || 'Unknown',
                url: streamUrl(s.stream_id, s.container_extension || 'ts'),
                logo: s.stream_icon || '',
                group: catMap[s.category_id] || 'Uncategorized',
                tvgId: s.epg_channel_id || '',
                tvgName: s.name || '',
                streamId: s.stream_id
            });
        }
        return channels;
    }

    // ── Filter categories by include keywords + exclude prefixes ──
    function filterCategories(allCategories, rules, excludes) {
        if (!rules || rules.length === 0) return allCategories;

        var matched = [];
        for (var i = 0; i < allCategories.length; i++) {
            var catName = (allCategories[i].category_name || '').toLowerCase();

            // Check excludes first — if category starts with an excluded prefix, skip it
            var excluded = false;
            if (excludes && excludes.length > 0) {
                for (var e = 0; e < excludes.length; e++) {
                    if (catName.indexOf(excludes[e].toLowerCase()) === 0) {
                        excluded = true;
                        break;
                    }
                }
            }
            if (excluded) continue;

            // Check includes
            for (var r = 0; r < rules.length; r++) {
                if (catName.indexOf(rules[r].toLowerCase()) !== -1) {
                    matched.push(allCategories[i]);
                    break;
                }
            }
        }
        return matched;
    }

    // ── Load streams category-by-category (batched) ──
    function loadStreamsBatched(categoryIds, onProgress, callback) {
        var allStreams = [];
        var loaded = 0;
        var total = categoryIds.length;
        var failed = 0;
        var BATCH_SIZE = 6;

        if (total === 0) {
            callback(null, []);
            return;
        }

        var nextIdx = 0;

        function loadNext() {
            if (nextIdx >= total && loaded + failed >= total) {
                callback(null, allStreams);
                return;
            }

            while (nextIdx < total && (nextIdx - loaded - failed) < BATCH_SIZE) {
                startLoad(nextIdx);
                nextIdx++;
            }
        }

        function startLoad(idx) {
            var catId = categoryIds[idx];
            getStreamsByCategory(catId, function(err, streams) {
                if (err) {
                    failed++;
                } else {
                    for (var i = 0; i < streams.length; i++) {
                        allStreams.push(streams[i]);
                    }
                    loaded++;
                }
                onProgress(loaded, failed, total, allStreams.length);
                loadNext();
            });
        }

        loadNext();
    }

    // ══════════════════════════════════════════════
    // CACHE
    // ══════════════════════════════════════════════

    var CACHE_KEY = 'iptv_cache';
    var HOST_KEY = 'iptv_host';
    var CACHE_MAX_AGE = 4 * 60 * 60 * 1000; // 4 hours

    function saveCache(channels, categories) {
        try {
            var data = {
                ts: Date.now(),
                channels: channels,
                categories: categories
            };
            localStorage.setItem(CACHE_KEY, JSON.stringify(data));
        } catch(e) { /* quota exceeded — ignore */ }
    }

    function loadCache() {
        try {
            var raw = localStorage.getItem(CACHE_KEY);
            if (!raw) return null;
            var data = JSON.parse(raw);
            if (!data.ts || !data.channels) return null;
            if (Date.now() - data.ts > CACHE_MAX_AGE) return null;
            return data;
        } catch(e) { return null; }
    }

    function saveWorkingHost(host) {
        try { localStorage.setItem(HOST_KEY, host); } catch(e) {}
    }

    function getWorkingHost() {
        try { return localStorage.getItem(HOST_KEY) || null; } catch(e) { return null; }
    }

    // ══════════════════════════════════════════════
    // MAIN LOAD — cache-first, background refresh
    // ══════════════════════════════════════════════

    function loadAll(host, user, pass, onStatus, callback, categoryFilters, categoryExcludes) {
        init(host, user, pass);

        onStatus('Authenticating...');
        authenticate(function(err, authData) {
            if (err) return callback('Auth failed: ' + err);

            var info = authData.user_info;
            onStatus('Logged in');

            onStatus('Loading categories...');
            getCategories(function(err, allCategories) {
                if (err) return callback('Categories failed: ' + err);

                var categories;
                if (categoryFilters && categoryFilters.length > 0) {
                    categories = filterCategories(allCategories, categoryFilters, categoryExcludes);
                    var addedNames = [];
                    var skippedNames = [];
                    var addedSet = {};
                    for (var c = 0; c < categories.length; c++) {
                        addedNames.push(categories[c].category_name);
                        addedSet[categories[c].category_id] = true;
                    }
                    for (var s = 0; s < allCategories.length; s++) {
                        if (!addedSet[allCategories[s].category_id]) {
                            skippedNames.push(allCategories[s].category_name);
                        }
                    }
                    onStatus('__CATEGORY_STATS__' + JSON.stringify({
                        total: allCategories.length,
                        added: categories.length,
                        skipped: allCategories.length - categories.length,
                        names: addedNames,
                        skippedNames: skippedNames
                    }));
                } else {
                    categories = allCategories;
                }

                if (categories.length === 0) {
                    return callback('No categories matched filters');
                }

                var catIds = [];
                for (var i = 0; i < categories.length; i++) {
                    catIds.push(categories[i].category_id);
                }

                onStatus('Loading ' + categories.length + ' categories...');
                loadStreamsBatched(catIds,
                    function(loaded, failed, total, streamCount) {
                        onStatus(loaded + '/' + total + ' | ' + streamCount + ' ch');
                    },
                    function(err, streams) {
                        if (err) return callback('Streams failed: ' + err);
                        var channels = buildChannelList(categories, streams);
                        // Save to cache
                        saveCache(channels, categories);
                        saveWorkingHost(host);
                        callback(null, channels);
                    }
                );
            });
        });
    }

    return {
        init: init,
        authenticate: authenticate,
        getCategories: getCategories,
        getStreamsByCategory: getStreamsByCategory,
        loadAll: loadAll,
        streamUrl: streamUrl,
        filterCategories: filterCategories,
        loadCache: loadCache,
        saveWorkingHost: saveWorkingHost,
        getWorkingHost: getWorkingHost
    };
})();

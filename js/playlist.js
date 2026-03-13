var Playlist = (function() {
    function parseM3U(text) {
        var lines = text.split('\n');
        var channels = [];
        var current = null;

        for (var i = 0; i < lines.length; i++) {
            var line = lines[i].trim();

            if (line.indexOf('#EXTINF:') === 0) {
                current = {
                    name: '',
                    url: '',
                    logo: '',
                    group: 'Uncategorized',
                    tvgId: '',
                    tvgName: ''
                };

                // Parse tvg-logo
                var logoMatch = line.match(/tvg-logo="([^"]*)"/);
                if (logoMatch) current.logo = logoMatch[1];

                // Parse group-title
                var groupMatch = line.match(/group-title="([^"]*)"/);
                if (groupMatch && groupMatch[1]) current.group = groupMatch[1];

                // Parse tvg-id
                var idMatch = line.match(/tvg-id="([^"]*)"/);
                if (idMatch) current.tvgId = idMatch[1];

                // Parse tvg-name
                var nameMatch = line.match(/tvg-name="([^"]*)"/);
                if (nameMatch) current.tvgName = nameMatch[1];

                // Parse channel name (after the last comma)
                var commaIndex = line.lastIndexOf(',');
                if (commaIndex !== -1) {
                    current.name = line.substring(commaIndex + 1).trim();
                }
            } else if (line && line.indexOf('#') !== 0 && current) {
                current.url = line;
                channels.push(current);
                current = null;
            }
        }

        return channels;
    }

    function getGroups(channels) {
        var groupMap = {};
        for (var i = 0; i < channels.length; i++) {
            groupMap[channels[i].group] = true;
        }
        var groups = Object.keys(groupMap).sort();
        groups.unshift('All Channels');
        return groups;
    }

    function filterByGroup(channels, group) {
        if (group === 'All Channels') return channels;
        return channels.filter(function(ch) {
            return ch.group === group;
        });
    }

    function search(channels, query) {
        var q = query.toLowerCase();
        return channels.filter(function(ch) {
            return ch.name.toLowerCase().indexOf(q) !== -1;
        });
    }

    function isBrowser() {
        return !!window.__BROWSER_MODE__;
    }

    function loadFromUrl(url, callback) {
        // In browser, route through local proxy for remote URLs
        var fetchUrl = url;
        if (isBrowser() && url.indexOf('http') === 0) {
            fetchUrl = '/proxy?url=' + encodeURIComponent(url);
        }

        var xhr = new XMLHttpRequest();
        xhr.open('GET', fetchUrl, true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    var channels = parseM3U(xhr.responseText);
                    if (channels.length === 0) {
                        if (isBrowser() && url.indexOf('data/') !== 0) {
                            console.log('[Playlist] No channels in remote playlist, trying local fallback...');
                            loadFromUrl('data/test.m3u', callback);
                            return;
                        }
                        callback('Playlist loaded but no channels found', null);
                    } else {
                        callback(null, channels);
                    }
                } else {
                    // In browser, try local fallback playlist
                    if (isBrowser()) {
                        console.log('[Playlist] Remote failed, trying local fallback...');
                        loadFromUrl('data/test.m3u', callback);
                        return;
                    }
                    callback('Failed to load playlist: HTTP ' + xhr.status, null);
                }
            }
        };
        xhr.onerror = function() {
            if (isBrowser() && url.indexOf('data/') !== 0) {
                console.log('[Playlist] Network error, trying local fallback...');
                loadFromUrl('data/test.m3u', callback);
                return;
            }
            callback('Network error loading playlist', null);
        };
        xhr.send();
    }

    function loadFromUrlWithTimeout(url, timeout, callback) {
        var fetchUrl = url;
        if (isBrowser() && url.indexOf('http') === 0) {
            fetchUrl = '/proxy?url=' + encodeURIComponent(url);
        }

        var done = false;
        var xhr = new XMLHttpRequest();
        xhr.open('GET', fetchUrl, true);
        xhr.timeout = timeout;

        xhr.ontimeout = function() {
            if (done) return;
            done = true;
            callback('Timeout after ' + (timeout / 1000) + 's', null);
        };
        xhr.onreadystatechange = function() {
            if (done) return;
            if (xhr.readyState === 4) {
                done = true;
                if (xhr.status === 200) {
                    var channels = parseM3U(xhr.responseText);
                    if (channels.length === 0) {
                        callback('No channels found', null);
                    } else {
                        callback(null, channels);
                    }
                } else {
                    callback('HTTP ' + xhr.status, null);
                }
            }
        };
        xhr.onerror = function() {
            if (done) return;
            done = true;
            callback('Network error', null);
        };
        xhr.send();
    }

    function loadFromUrlWithDebug(url, timeout, callback) {
        var fetchUrl = url;
        if (isBrowser() && url.indexOf('http') === 0) {
            fetchUrl = '/proxy?url=' + encodeURIComponent(url);
        }

        var done = false;
        var startTime = Date.now();
        var xhr = new XMLHttpRequest();
        xhr.open('GET', fetchUrl, true);
        xhr.timeout = timeout;

        function finish(err, result, status) {
            if (done) return;
            done = true;
            var elapsed = Date.now() - startTime;
            var responseText = xhr.responseText || '';
            var info = {
                status: status || xhr.status || 0,
                size: responseText.length,
                time: elapsed,
                preview: responseText.substring(0, 120).replace(/[\n\r]/g, ' ')
            };
            callback(err, result, info);
        }

        xhr.ontimeout = function() {
            finish('Timeout after ' + (timeout / 1000) + 's', null, 0);
        };
        xhr.onreadystatechange = function() {
            if (done) return;
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    var channels = parseM3U(xhr.responseText);
                    if (channels.length === 0) {
                        finish('HTTP 200 but no channels parsed', null, 200);
                    } else {
                        finish(null, channels, 200);
                    }
                } else {
                    finish('HTTP ' + xhr.status, null, xhr.status);
                }
            }
        };
        xhr.onerror = function() {
            finish('Network error (DNS/connection failed)', null, 0);
        };
        xhr.send();
    }

    return {
        parseM3U: parseM3U,
        getGroups: getGroups,
        filterByGroup: filterByGroup,
        search: search,
        loadFromUrl: loadFromUrl,
        loadFromUrlWithTimeout: loadFromUrlWithTimeout,
        loadFromUrlWithDebug: loadFromUrlWithDebug
    };
})();

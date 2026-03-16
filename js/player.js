var Player = (function() {
    var currentUrl = '';
    var isPlaying = false;
    var onErrorCallback = null;
    var onBufferingCallback = null;

    // Subtitle state
    var subtitleTracks = [];     // [{index, lang, label}]
    var activeSubtitleIndex = -1; // -1 = off
    var subtitlesVisible = false;
    var onSubtitleCallback = null;   // called with (text) when subtitle changes
    var onSubtitleTracksCallback = null; // called when tracks are detected

    // PiP state
    var pipUrl = '';
    var pipVideoEl = null;
    var pipActive = false;
    var pipAudioOnMain = true; // true = AVPlay has audio, pip <video> is muted

    var listener = {
        onbufferingstart: function() {
            console.log('[Player] Buffering started');
            if (onBufferingCallback) onBufferingCallback(true);
        },
        onbufferingprogress: function(percent) {
            console.log('[Player] Buffering: ' + percent + '%');
        },
        onbufferingcomplete: function() {
            console.log('[Player] Buffering complete');
            if (onBufferingCallback) onBufferingCallback(false);
        },
        oncurrentplaytime: function(time) {
            // Silent — plays continuously
        },
        onevent: function(eventType, eventData) {
            console.log('[Player] Event: ' + eventType + ', data: ' + eventData);
        },
        onerror: function(eventType) {
            console.log('[Player] Error: ' + eventType);
            isPlaying = false;
            if (onErrorCallback) onErrorCallback(eventType);
        },
        onsubtitlechange: function(duration, text, data3, data4) {
            if (subtitlesVisible && onSubtitleCallback) {
                onSubtitleCallback(text || '');
            }
        },
        ondrmevent: function(drmEvent, drmData) {
            console.log('[Player] DRM Event: ' + drmEvent);
        },
        onstreamcompleted: function() {
            console.log('[Player] Stream completed');
            isPlaying = false;
        }
    };

    function open(url) {
        try {
            stop();
            currentUrl = url;
            webapis.avplay.open(url);
            webapis.avplay.setDisplayRect(0, 0, 1920, 1080);
            webapis.avplay.setListener(listener);

            // Set buffering size for live streams
            webapis.avplay.setStreamingProperty('ADAPTIVE_INFO', 'BUFFER_SIZE=3000');

            webapis.avplay.prepareAsync(function() {
                console.log('[Player] Prepared, starting playback');
                webapis.avplay.play();
                isPlaying = true;
                detectSubtitleTracks();
            }, function(error) {
                console.log('[Player] Prepare failed: ' + error.message);
                if (onErrorCallback) onErrorCallback(error.message);
            });
        } catch (e) {
            console.log('[Player] Open error: ' + e.message);
            if (onErrorCallback) onErrorCallback(e.message);
        }
    }

    function stop() {
        try {
            var state = webapis.avplay.getState();
            if (state !== 'NONE' && state !== 'IDLE') {
                webapis.avplay.stop();
            }
            webapis.avplay.close();
        } catch (e) {
            // Ignore errors when nothing is playing
        }
        isPlaying = false;
        subtitleTracks = [];
        activeSubtitleIndex = -1;
        subtitlesVisible = false;
    }

    function pause() {
        try {
            if (isPlaying) {
                webapis.avplay.pause();
                isPlaying = false;
            }
        } catch (e) {
            console.log('[Player] Pause error: ' + e.message);
        }
    }

    function resume() {
        try {
            if (!isPlaying) {
                webapis.avplay.play();
                isPlaying = true;
            }
        } catch (e) {
            console.log('[Player] Resume error: ' + e.message);
        }
    }

    function togglePlayPause() {
        if (isPlaying) {
            pause();
            return 'paused';
        } else {
            resume();
            return 'playing';
        }
    }

    function getCurrentPosition() {
        try {
            return webapis.avplay.getCurrentTime();
        } catch (e) {
            return 0;
        }
    }

    function getDuration() {
        try {
            return webapis.avplay.getDuration();
        } catch (e) {
            return 0;
        }
    }

    function seekTo(positionMs) {
        try {
            webapis.avplay.seekTo(positionMs,
                function() { console.log('[Player] Seek success to ' + positionMs); },
                function(e) { console.log('[Player] Seek error: ' + e.message); }
            );
        } catch (e) {
            console.log('[Player] seekTo error: ' + e.message);
        }
    }

    function seekForward(ms) {
        ms = ms || 15000;
        var pos = getCurrentPosition();
        var dur = getDuration();
        if (dur > 0) {
            var target = Math.min(pos + ms, dur - 1000);
            seekTo(target);
            return { position: target, duration: dur };
        }
        return null;
    }

    function seekBackward(ms) {
        ms = ms || 15000;
        var pos = getCurrentPosition();
        var dur = getDuration();
        var target = Math.max(pos - ms, 0);
        seekTo(target);
        return { position: target, duration: dur };
    }

    function mute() {
        try {
            tizen.tvaudiocontrol.setMute(true);
            console.log('[Player] Muted');
        } catch (e) {
            console.log('[Player] Mute error: ' + e.message);
        }
    }

    function unmute() {
        try {
            tizen.tvaudiocontrol.setMute(false);
            console.log('[Player] Unmuted');
        } catch (e) {
            console.log('[Player] Unmute error: ' + e.message);
        }
    }

    function getState() {
        return isPlaying;
    }

    function onError(cb) {
        onErrorCallback = cb;
    }

    function onBuffering(cb) {
        onBufferingCallback = cb;
    }

    // ── Subtitles ──

    function detectSubtitleTracks() {
        subtitleTracks = [];
        activeSubtitleIndex = -1;
        subtitlesVisible = false;
        try {
            var tracks = webapis.avplay.getTotalTrackInfo();
            for (var i = 0; i < tracks.length; i++) {
                var t = tracks[i];
                if (t.type === 'TEXT') {
                    var lang = t.extra_info || '';
                    // Try to parse language from extra_info (often JSON-like)
                    try {
                        if (lang.indexOf('language') !== -1) {
                            var parsed = JSON.parse('{' + lang + '}');
                            lang = parsed.language || parsed.fourCC || '';
                        }
                    } catch (e2) { /* keep raw */ }
                    subtitleTracks.push({
                        index: t.index,
                        lang: lang || 'Track ' + (subtitleTracks.length + 1),
                        label: lang || 'Track ' + (subtitleTracks.length + 1)
                    });
                }
            }
            console.log('[Player] Subtitle tracks found: ' + subtitleTracks.length);
            if (onSubtitleTracksCallback) onSubtitleTracksCallback(subtitleTracks);
        } catch (e) {
            console.log('[Player] detectSubtitleTracks error: ' + e.message);
        }
    }

    function enableSubtitle(trackIdx) {
        if (trackIdx < 0 || trackIdx >= subtitleTracks.length) return false;
        try {
            var track = subtitleTracks[trackIdx];
            webapis.avplay.setSelectTrack('TEXT', track.index);
            activeSubtitleIndex = trackIdx;
            subtitlesVisible = true;
            console.log('[Player] Subtitle enabled: ' + track.label + ' (index ' + track.index + ')');
            return true;
        } catch (e) {
            console.log('[Player] enableSubtitle error: ' + e.message);
            return false;
        }
    }

    function disableSubtitle() {
        subtitlesVisible = false;
        activeSubtitleIndex = -1;
        if (onSubtitleCallback) onSubtitleCallback(''); // clear display
        console.log('[Player] Subtitles disabled');
    }

    function cycleSubtitle() {
        // Off → Track 0 → Track 1 → ... → Off
        if (subtitleTracks.length === 0) return { active: false, track: null };

        if (!subtitlesVisible || activeSubtitleIndex === -1) {
            // Turn on first track
            enableSubtitle(0);
            return { active: true, track: subtitleTracks[0] };
        }

        var next = activeSubtitleIndex + 1;
        if (next >= subtitleTracks.length) {
            // Wrap around to off
            disableSubtitle();
            return { active: false, track: null };
        }

        enableSubtitle(next);
        return { active: true, track: subtitleTracks[next] };
    }

    function getSubtitleTracks() {
        return subtitleTracks;
    }

    function getActiveSubtitleIndex() {
        return activeSubtitleIndex;
    }

    function isSubtitleVisible() {
        return subtitlesVisible;
    }

    function onSubtitle(cb) {
        onSubtitleCallback = cb;
    }

    function onSubtitleTracks(cb) {
        onSubtitleTracksCallback = cb;
    }

    // ── PiP (Picture-in-Picture) ──
    // Uses an HTML5 <video> element for the secondary stream (always muted).
    // AVPlay remains the primary player with audio.
    // Swapping audio = swapping which URL is on AVPlay vs <video>.

    function initPip(videoElement) {
        pipVideoEl = videoElement;
        pipVideoEl.muted = true;
        pipVideoEl.autoplay = true;
        pipVideoEl.setAttribute('playsinline', '');
    }

    function openPip(url) {
        if (!pipVideoEl) return;
        pipUrl = url;
        pipActive = true;
        pipAudioOnMain = true;
        pipVideoEl.src = url;
        pipVideoEl.play().catch(function(e) {
            console.log('[Player] PiP play error: ' + e.message);
        });
        console.log('[Player] PiP opened: ' + url);
    }

    function stopPip() {
        if (!pipVideoEl) return;
        pipActive = false;
        pipUrl = '';
        pipVideoEl.pause();
        pipVideoEl.removeAttribute('src');
        pipVideoEl.load(); // reset
        console.log('[Player] PiP stopped');
    }

    // Swap audio: move the "audio" stream to AVPlay, the other to <video>
    // This causes a brief rebuffer on both players.
    function swapPipAudio() {
        if (!pipActive || !pipVideoEl) return false;

        var mainUrl = currentUrl;
        var secUrl = pipUrl;

        if (!mainUrl || !secUrl) return false;

        console.log('[Player] Swapping PiP audio');

        // Stop both
        stop();
        pipVideoEl.pause();

        // Swap URLs
        currentUrl = secUrl;
        pipUrl = mainUrl;

        // Reopen AVPlay with the new "audio" stream
        try {
            webapis.avplay.open(currentUrl);
            webapis.avplay.setDisplayRect(0, 0, 1920, 1080);
            webapis.avplay.setListener(listener);
            webapis.avplay.setStreamingProperty('ADAPTIVE_INFO', 'BUFFER_SIZE=3000');
            webapis.avplay.prepareAsync(function() {
                webapis.avplay.play();
                isPlaying = true;
                console.log('[Player] Main swapped to: ' + currentUrl);
            }, function(error) {
                console.log('[Player] Swap main prepare failed: ' + error.message);
            });
        } catch (e) {
            console.log('[Player] Swap main error: ' + e.message);
        }

        // Reopen <video> with the other stream (muted)
        pipVideoEl.src = pipUrl;
        pipVideoEl.muted = true;
        pipVideoEl.play().catch(function(e) {
            console.log('[Player] Swap pip play error: ' + e.message);
        });

        pipAudioOnMain = !pipAudioOnMain;
        return true;
    }

    // Resize AVPlay display rect (for PiP layout)
    function setDisplayRect(x, y, w, h) {
        try {
            webapis.avplay.setDisplayRect(x, y, w, h);
        } catch (e) {
            console.log('[Player] setDisplayRect error: ' + e.message);
        }
    }

    function isPipActive() {
        return pipActive;
    }

    function isPipAudioOnMain() {
        return pipAudioOnMain;
    }

    function getPipUrl() {
        return pipUrl;
    }

    function getMainUrl() {
        return currentUrl;
    }

    return {
        open: open,
        stop: stop,
        pause: pause,
        resume: resume,
        mute: mute,
        unmute: unmute,
        getState: getState,
        onError: onError,
        onBuffering: onBuffering,
        // Subtitles
        cycleSubtitle: cycleSubtitle,
        enableSubtitle: enableSubtitle,
        disableSubtitle: disableSubtitle,
        getSubtitleTracks: getSubtitleTracks,
        getActiveSubtitleIndex: getActiveSubtitleIndex,
        isSubtitleVisible: isSubtitleVisible,
        onSubtitle: onSubtitle,
        onSubtitleTracks: onSubtitleTracks,
        // PiP
        initPip: initPip,
        openPip: openPip,
        stopPip: stopPip,
        swapPipAudio: swapPipAudio,
        setDisplayRect: setDisplayRect,
        isPipActive: isPipActive,
        isPipAudioOnMain: isPipAudioOnMain,
        getPipUrl: getPipUrl,
        getMainUrl: getMainUrl,
        // Playback controls
        togglePlayPause: togglePlayPause,
        getCurrentPosition: getCurrentPosition,
        getDuration: getDuration,
        seekTo: seekTo,
        seekForward: seekForward,
        seekBackward: seekBackward
    };
})();

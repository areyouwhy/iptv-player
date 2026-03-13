var Player = (function() {
    var currentUrl = '';
    var isPlaying = false;
    var onErrorCallback = null;
    var onBufferingCallback = null;

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
            // Not used
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

    function getState() {
        return isPlaying;
    }

    function onError(cb) {
        onErrorCallback = cb;
    }

    function onBuffering(cb) {
        onBufferingCallback = cb;
    }

    return {
        open: open,
        stop: stop,
        pause: pause,
        resume: resume,
        getState: getState,
        onError: onError,
        onBuffering: onBuffering
    };
})();

(function () {
    function bindPlayer(shell) {
        var video = shell.querySelector('video');
        var button = shell.querySelector('.play-cover');
        var url = shell.getAttribute('data-video');
        var initialized = false;
        var hls = null;

        if (!video || !button || !url) {
            return;
        }

        function attach() {
            if (initialized) {
                return;
            }

            initialized = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = url;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    lowLatencyMode: false,
                    backBufferLength: 90
                });
                hls.loadSource(url);
                hls.attachMedia(video);
            } else {
                video.src = url;
            }
        }

        function play() {
            attach();
            button.classList.add('hidden');
            video.play().catch(function () {
                button.classList.remove('hidden');
            });
        }

        button.addEventListener('click', play);
        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener('play', function () {
            button.classList.add('hidden');
        });
        video.addEventListener('pause', function () {
            if (!video.ended) {
                button.classList.remove('hidden');
            }
        });
        video.addEventListener('ended', function () {
            button.classList.remove('hidden');
        });
        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-video]')).forEach(bindPlayer);
})();

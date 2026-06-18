(function () {
    var body = document.body;
    var menuButton = document.querySelector('[data-menu-button]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            var open = mobilePanel.classList.toggle('is-open');
            menuButton.classList.toggle('is-active', open);
            body.classList.toggle('menu-open', open);
        });
    }

    document.querySelectorAll('[data-search-form]').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            var input = form.querySelector('input[name="q"]');
            if (!input || !input.value.trim()) {
                event.preventDefault();
                input && input.focus();
            }
        });
    });

    document.querySelectorAll('[data-hero]').forEach(function (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function play() {
            clearInterval(timer);
            timer = setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                play();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                play();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                play();
            });
        }

        show(0);
        play();
    });

    document.querySelectorAll('[data-filter-input]').forEach(function (input) {
        var scope = input.closest('[data-filter-scope]') || document;
        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
        var empty = scope.querySelector('[data-empty]');

        function applyFilter() {
            var query = input.value.trim().toLowerCase();
            var visible = 0;
            cards.forEach(function (card) {
                var text = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
                var match = !query || text.indexOf(query) !== -1;
                card.style.display = match ? '' : 'none';
                if (match) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }

        input.addEventListener('input', applyFilter);
        applyFilter();
    });

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');
    if (query) {
        document.querySelectorAll('[data-autofill-query]').forEach(function (input) {
            input.value = query;
            input.dispatchEvent(new Event('input'));
        });
    }

    document.querySelectorAll('[data-player]').forEach(function (player) {
        var video = player.querySelector('video');
        var cover = player.querySelector('[data-play-button]');
        var stream = player.getAttribute('data-stream');
        var ready = false;
        var hls = null;

        function bindStream() {
            if (!video || !stream || ready) {
                return;
            }
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
                player.hlsInstance = hls;
            } else {
                video.src = stream;
            }
            ready = true;
        }

        function start() {
            bindStream();
            if (cover) {
                cover.classList.add('is-hidden');
            }
            if (video) {
                video.controls = true;
                var attempt = video.play();
                if (attempt && typeof attempt.catch === 'function') {
                    attempt.catch(function () {});
                }
            }
        }

        if (cover) {
            cover.addEventListener('click', start);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (!ready || video.paused) {
                    start();
                }
            });
        }

        window.addEventListener('pagehide', function () {
            if (hls && typeof hls.destroy === 'function') {
                hls.destroy();
            }
        });
    });
})();

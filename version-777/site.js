(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var thumbs = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-thumb]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function setHero(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });

            thumbs.forEach(function (thumb, thumbIndex) {
                thumb.classList.toggle('active', thumbIndex === current);
            });
        }

        function startHero() {
            stopHero();
            timer = window.setInterval(function () {
                setHero(current + 1);
            }, 5600);
        }

        function stopHero() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                setHero(Number(dot.getAttribute('data-hero-dot')) || 0);
                startHero();
            });
        });

        thumbs.forEach(function (thumb) {
            thumb.addEventListener('mouseenter', function () {
                setHero(Number(thumb.getAttribute('data-hero-thumb')) || 0);
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                setHero(current - 1);
                startHero();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                setHero(current + 1);
                startHero();
            });
        }

        hero.addEventListener('mouseenter', stopHero);
        hero.addEventListener('mouseleave', startHero);
        startHero();
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-card-filter]')).forEach(function (toolbar) {
        var input = toolbar.querySelector('[data-filter-input]');
        var grid = toolbar.nextElementSibling;
        var activeValue = '';
        var buttons = Array.prototype.slice.call(toolbar.querySelectorAll('[data-filter-value]'));
        var params = new URLSearchParams(window.location.search);
        var urlQuery = params.get('q') || '';

        if (!grid) {
            return;
        }

        if (toolbar.getAttribute('data-url-query') === 'true' && input && urlQuery) {
            input.value = urlQuery;
            var largeInput = document.querySelector('[data-large-search-input]');
            if (largeInput) {
                largeInput.value = urlQuery;
            }
        }

        function matchCard(card, query) {
            var text = [
                card.getAttribute('data-title') || '',
                card.getAttribute('data-genre') || '',
                card.getAttribute('data-region') || '',
                card.getAttribute('data-year') || '',
                card.getAttribute('data-category') || '',
                card.textContent || ''
            ].join(' ').toLowerCase();

            var normalizedQuery = (query || '').trim().toLowerCase();
            var normalizedActive = (activeValue || '').trim().toLowerCase();
            var queryMatched = !normalizedQuery || text.indexOf(normalizedQuery) !== -1;
            var activeMatched = !normalizedActive || text.indexOf(normalizedActive) !== -1;

            return queryMatched && activeMatched;
        }

        function applyFilter() {
            var query = input ? input.value : '';
            var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));

            cards.forEach(function (card) {
                card.hidden = !matchCard(card, query);
            });
        }

        if (input) {
            input.addEventListener('input', applyFilter);
            applyFilter();
        }

        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                activeValue = button.getAttribute('data-filter-value') || '';
                buttons.forEach(function (item) {
                    item.classList.toggle('active', item === button);
                });
                applyFilter();
            });
        });
    });
})();

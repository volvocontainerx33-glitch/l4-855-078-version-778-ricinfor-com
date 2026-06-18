(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function normalize(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, '');
  }

  function initMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!button || !nav) return;
    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) return;
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    if (!slides.length) return;
    var index = 0;
    var timer;

    function activate(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function play() {
      timer = window.setInterval(function () {
        activate(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        activate(i);
        play();
      });
    });

    activate(0);
    play();
  }

  function initSearch() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-input]'));
    inputs.forEach(function (input) {
      var selector = input.getAttribute('data-search-input');
      var scope = selector ? document.querySelector(selector) : document;
      if (!scope) return;
      var cards = Array.prototype.slice.call(scope.querySelectorAll('.searchable-card'));
      var empty = scope.parentElement ? scope.parentElement.querySelector('[data-empty-state]') : null;

      function apply() {
        var query = normalize(input.value);
        var visible = 0;
        cards.forEach(function (card) {
          var text = normalize(card.getAttribute('data-search') || card.textContent);
          var match = !query || text.indexOf(query) !== -1;
          card.classList.toggle('is-hidden-by-search', !match);
          if (match) visible += 1;
        });
        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }

      input.addEventListener('input', apply);
      apply();
    });
  }

  function attachHls(video, url) {
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(url);
      hls.attachMedia(video);
      video._hlsInstance = hls;
      return;
    }
    video.src = url;
  }

  function setupMoviePlayer(url) {
    ready(function () {
      var video = document.getElementById('movie-video');
      var button = document.getElementById('movie-play-button');
      var frame = document.getElementById('movie-player');
      if (!video || !button || !frame || !url) return;
      var loaded = false;

      function load() {
        if (loaded) return;
        loaded = true;
        attachHls(video, url);
      }

      function start() {
        load();
        button.classList.add('is-hidden');
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {
            button.classList.remove('is-hidden');
          });
        }
      }

      button.addEventListener('click', function (event) {
        event.preventDefault();
        start();
      });

      frame.addEventListener('click', function (event) {
        if (event.target === frame) {
          start();
        }
      });

      video.addEventListener('play', function () {
        button.classList.add('is-hidden');
      });

      video.addEventListener('pause', function () {
        if (video.currentTime === 0 || video.ended) {
          button.classList.remove('is-hidden');
        }
      });
    });
  }

  window.setupMoviePlayer = setupMoviePlayer;

  ready(function () {
    initMenu();
    initHero();
    initSearch();
  });
})();

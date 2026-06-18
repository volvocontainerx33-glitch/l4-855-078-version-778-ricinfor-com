(function() {
  var header = document.querySelector('[data-header]');
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  function syncHeader() {
    if (!header) {
      return;
    }
    if (window.scrollY > 36) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }

  if (header) {
    syncHeader();
    window.addEventListener('scroll', syncHeader, { passive: true });
  }

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function() {
      mobileMenu.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var heroIndex = 0;
  var heroTimer = null;

  function setHeroSlide(nextIndex) {
    if (!slides.length) {
      return;
    }
    heroIndex = (nextIndex + slides.length) % slides.length;
    slides.forEach(function(slide, index) {
      slide.classList.toggle('is-active', index === heroIndex);
    });
    dots.forEach(function(dot, index) {
      dot.classList.toggle('is-active', index === heroIndex);
    });
  }

  function startHeroTimer() {
    if (heroTimer || slides.length < 2) {
      return;
    }
    heroTimer = window.setInterval(function() {
      setHeroSlide(heroIndex + 1);
    }, 5200);
  }

  dots.forEach(function(dot, index) {
    dot.addEventListener('click', function() {
      setHeroSlide(index);
      window.clearInterval(heroTimer);
      heroTimer = null;
      startHeroTimer();
    });
  });

  startHeroTimer();

  function filterRoot(root) {
    var keywordInput = root.querySelector('[data-filter-keyword]');
    var yearSelect = root.querySelector('[data-filter-year]');
    var regionSelect = root.querySelector('[data-filter-region]');
    var cards = Array.prototype.slice.call(root.querySelectorAll('[data-movie-card]'));

    function applyFilter() {
      var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : '';
      var year = yearSelect ? yearSelect.value : '';
      var region = regionSelect ? regionSelect.value : '';
      cards.forEach(function(card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' ').toLowerCase();
        var yearMatched = !year || card.getAttribute('data-year') === year;
        var regionMatched = !region || card.getAttribute('data-region') === region;
        var keywordMatched = !keyword || haystack.indexOf(keyword) !== -1;
        card.classList.toggle('is-hidden', !(yearMatched && regionMatched && keywordMatched));
      });
    }

    if (root.hasAttribute('data-search-page')) {
      var params = new URLSearchParams(window.location.search);
      var query = params.get('q');
      if (query && keywordInput) {
        keywordInput.value = query;
      }
    }

    [keywordInput, yearSelect, regionSelect].forEach(function(control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });

    applyFilter();
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-filter-root]')).forEach(filterRoot);

  window.initMoviePlayer = function(videoUrl) {
    var player = document.getElementById('moviePlayer');
    var video = document.getElementById('movieVideo');
    if (!player || !video || !videoUrl) {
      return;
    }

    var cover = player.querySelector('[data-player-cover]');
    var button = player.querySelector('[data-player-button]');
    var hls = null;
    var attached = false;
    var message = null;

    function showMessage(text) {
      if (!message) {
        message = document.createElement('div');
        message.className = 'player-message';
        player.appendChild(message);
      }
      message.textContent = text;
    }

    function attachSource() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = videoUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(videoUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function(event, data) {
          if (data && data.fatal) {
            showMessage('视频加载失败，请稍后再试');
          }
        });
      } else {
        video.src = videoUrl;
      }
      video.setAttribute('controls', 'controls');
    }

    function playVideo() {
      attachSource();
      if (cover) {
        cover.classList.add('is-hidden');
      }
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function() {
          if (cover) {
            cover.classList.remove('is-hidden');
          }
        });
      }
    }

    function toggleVideo() {
      if (!attached || video.paused) {
        playVideo();
      } else {
        video.pause();
      }
    }

    if (cover) {
      cover.addEventListener('click', playVideo);
    }
    if (button) {
      button.addEventListener('click', function(event) {
        event.stopPropagation();
        playVideo();
      });
    }
    video.addEventListener('click', toggleVideo);
    window.addEventListener('beforeunload', function() {
      if (hls) {
        hls.destroy();
      }
    });
  };
})();

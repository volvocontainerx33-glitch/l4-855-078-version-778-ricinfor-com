(function () {
  function setupPlayer(box) {
    var frame = box.querySelector('.player-frame');
    var video = box.querySelector('video');
    var button = box.querySelector('[data-play]');
    var loading = box.querySelector('[data-loading]');
    var message = box.querySelector('[data-message]');
    var url = box.getAttribute('data-video');
    var hls = null;
    var ready = false;

    function setLoading(value) {
      if (loading) {
        loading.hidden = !value;
      }
    }

    function setMessage(value) {
      if (message) {
        message.textContent = value || '';
      }
    }

    function prepare() {
      if (ready || !video || !url) {
        return;
      }
      ready = true;
      setMessage('');

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setLoading(false);
            setMessage('视频加载失败，请稍后重试');
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      } else {
        setLoading(false);
        setMessage('视频加载失败，请稍后重试');
      }
    }

    function play() {
      prepare();
      setLoading(true);
      setMessage('');
      var action = video.play();
      if (action && typeof action.then === 'function') {
        action.then(function () {
          setLoading(false);
          box.classList.add('is-playing');
        }).catch(function () {
          setLoading(false);
          setMessage('点击视频区域继续播放');
        });
      }
    }

    function toggle() {
      if (!video) {
        return;
      }
      if (video.paused) {
        play();
      } else {
        video.pause();
      }
    }

    if (button) {
      button.addEventListener('click', play);
    }
    if (frame) {
      frame.addEventListener('click', function (event) {
        if (event.target === button || button && button.contains(event.target)) {
          return;
        }
        toggle();
      });
    }
    if (video) {
      video.addEventListener('play', function () {
        setLoading(false);
        box.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        box.classList.remove('is-playing');
      });
      video.addEventListener('waiting', function () {
        setLoading(true);
      });
      video.addEventListener('playing', function () {
        setLoading(false);
      });
      video.addEventListener('error', function () {
        setLoading(false);
        setMessage('视频加载失败，请稍后重试');
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  document.querySelectorAll('[data-player]').forEach(setupPlayer);
})();

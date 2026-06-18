var SitePlayer = (function () {
  function safePlay(video) {
    var result = video.play();
    if (result && typeof result.catch === "function") {
      result.catch(function () {});
    }
  }

  function init(src) {
    var box = document.querySelector("[data-player-box]");
    if (!box) return;
    var video = box.querySelector("video");
    var cover = box.querySelector("[data-player-cover]");
    if (!video || !cover) return;
    var loaded = false;
    var hls = null;

    function load() {
      if (!loaded) {
        loaded = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = src;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(src);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            safePlay(video);
          });
        } else {
          video.src = src;
        }
      }
      cover.classList.add("is-hidden");
      safePlay(video);
    }

    cover.addEventListener("click", load);
    video.addEventListener("click", function () {
      if (!loaded || video.paused) {
        load();
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hls) hls.destroy();
    });
  }

  return { init: init };
})();

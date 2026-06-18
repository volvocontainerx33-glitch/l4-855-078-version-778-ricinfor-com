(function () {
  window.setupMoviePlayer = function (videoId, buttonId, url) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var prepared = false;
    var hls = null;
    if (!video) {
      return;
    }
    function attach() {
      if (prepared) {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(url);
        hls.attachMedia(video);
      } else {
        video.src = url;
      }
      prepared = true;
    }
    function begin() {
      attach();
      if (button) {
        button.classList.add("is-hidden");
      }
      video.controls = true;
      var play = video.play();
      if (play && typeof play.catch === "function") {
        play.catch(function () {
          if (button) {
            button.classList.remove("is-hidden");
          }
        });
      }
    }
    if (button) {
      button.addEventListener("click", begin);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        begin();
      }
    });
    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
      }
    });
  };
})();

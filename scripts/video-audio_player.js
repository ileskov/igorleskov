 // Функция обновления заливки прогресс-бара
  function updateSeekBarBackground(seekBar, value, max) {
    const percent = (value / max) * 100;
    seekBar.style.background = `linear-gradient(to right, #00336a 0%, #00336a ${percent}%, #c7c7c7 ${percent}%, #c7c7c7 100%)`;
  }

document.addEventListener('DOMContentLoaded', function() {
  // Блок для единственного аудио с id="audio" (если он есть)
  const audio = document.getElementById('audio');
  const seekBar = document.getElementById('seekBar');

  if (audio && seekBar) {
    audio.addEventListener('loadedmetadata', () => {
      seekBar.max = audio.duration || 0;
      const saved = localStorage.getItem("audioPosition");
      if (saved && !isNaN(saved)) {
        audio.currentTime = parseFloat(saved);
        seekBar.value = saved;
      } else {
        seekBar.value = 0;
      }
      updateSeekBarBackground(seekBar, seekBar.value, seekBar.max);
    });

    audio.addEventListener("timeupdate", () => {
      seekBar.value = audio.currentTime;
      localStorage.setItem("audioPosition", audio.currentTime);
      updateSeekBarBackground(seekBar, seekBar.value, seekBar.max);
    });

    seekBar.addEventListener("input", () => {
      updateSeekBarBackground(seekBar, seekBar.value, seekBar.max);
    });

    seekBar.addEventListener("change", () => {
      audio.currentTime = parseFloat(seekBar.value);
    });
  }

  // Блок для видео (если есть)
  var videos = document.querySelectorAll('.video');
  var currentVideo = null;
  videos.forEach(function(video) {
    video.addEventListener('loadeddata', function() {
      var videoKey = video.dataset.key;
      var savedTime = localStorage.getItem(videoKey);
      if (savedTime) {
        video.currentTime = parseFloat(savedTime);
      }
    });

    video.addEventListener('play', function(event) {
      currentVideo = event.target;
      videos.forEach(function(v) {
        if (v !== currentVideo) v.pause();
      });
      if (currentAudioPlayer && !currentAudioPlayer.paused) {
        currentAudioPlayer.pause();
        const prevButton = document.querySelector(".play-button.playing");
        if (prevButton) {
          prevButton.innerHTML = "&#9658;";
          prevButton.classList.remove("playing");
        }
      }
    });

    video.addEventListener('pause', function() {
      localStorage.setItem(video.dataset.key, video.currentTime);
    });

    video.addEventListener('ended', function() {
      localStorage.removeItem(video.dataset.key);
    });
  });

  // Блок для музыкальных треков
  var musicItems = document.querySelectorAll(".music-item");
  var currentAudioPlayer = null;

  musicItems.forEach(function(item, index) {
    var playButton = item.querySelector(".play-button");
    var audioPlayer = item.querySelector("audio");
    var seekBar = item.querySelector(".seek-bar");

    if (!audioPlayer || !seekBar || !playButton) return;

    // Используем id аудио как ключ для сохранения позиции
    var storageKey = audioPlayer.id;

    audioPlayer.addEventListener("loadedmetadata", function() {
      seekBar.max = audioPlayer.duration || 0;
      var savedTime = localStorage.getItem(storageKey);
      if (savedTime && !isNaN(savedTime)) {
        audioPlayer.currentTime = parseFloat(savedTime);
        seekBar.value = parseFloat(savedTime);
      } else {
        seekBar.value = 0;
      }
      updateSeekBarBackground(seekBar, seekBar.value, seekBar.max);
    });

    audioPlayer.addEventListener("timeupdate", function() {
      seekBar.value = audioPlayer.currentTime;
      updateSeekBarBackground(seekBar, seekBar.value, seekBar.max);
    });

    seekBar.addEventListener("input", function() {
      updateSeekBarBackground(seekBar, seekBar.value, seekBar.max);
    });

    seekBar.addEventListener("change", function() {
      audioPlayer.currentTime = parseFloat(seekBar.value);
      localStorage.setItem(storageKey, seekBar.value);
    });

    playButton.addEventListener("click", function() {
      if (currentAudioPlayer && currentAudioPlayer !== audioPlayer) {
        currentAudioPlayer.pause();
        var prevButton = document.querySelector(".play-button.playing");
        if (prevButton) {
          prevButton.innerHTML = "&#9658;";
          prevButton.classList.remove("playing");
        }
      }

      currentAudioPlayer = audioPlayer;

      if (audioPlayer.paused) {
        audioPlayer.play();
        playButton.innerHTML = "&#10074;&#10074;"; // Пауза
        playButton.classList.add("playing");

        if (currentVideo && !currentVideo.paused) {
          currentVideo.pause();
        }
      } else {
        audioPlayer.pause();
        localStorage.setItem(storageKey, audioPlayer.currentTime);
        playButton.innerHTML = "&#9658;"; // Воспроизведение
        playButton.classList.remove("playing");
      }
    });

    audioPlayer.addEventListener("ended", function() {
      playButton.innerHTML = "&#9658;";
      seekBar.value = 0;
      updateSeekBarBackground(seekBar, 0, seekBar.max);
      localStorage.removeItem(storageKey);
      // Автопереход к следующему треку
      if (index < musicItems.length - 1) {
        var nextButton = musicItems[index + 1].querySelector(".play-button");
        if (nextButton) nextButton.click();
      }
    });

    audioPlayer.addEventListener('play', function() {
      if (currentVideo && !currentVideo.paused) {
        currentVideo.pause();
      }
    });
  });

  // Чтобы при клике на play-button видео ставилось на паузу
  musicItems.forEach(function(item) {
    var playButton = item.querySelector(".play-button");

    playButton.addEventListener("click", function() {
      if (currentVideo) {
        currentVideo.pause();
      }
    });
  });
});

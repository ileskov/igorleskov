// Функция обновления заливки прогресс-бара
function updateSeekBarBackground(seekBar, value, max) {
  const percent = max > 0 ? (value / max) * 100 : 0;
  seekBar.style.background = `linear-gradient(to right, #00336a 0%, #00336a ${percent}%, #c7c7c7 ${percent}%, #c7c7c7 100%)`;
}

document.addEventListener('DOMContentLoaded', function() {
  const videos = document.querySelectorAll('.video');
  const musicItems = document.querySelectorAll(".music-item");

  let currentVideo = null;
  let currentAudioPlayer = null;
  let currentPlayButton = null;

  // Обработка видео
  videos.forEach(function(video) {
    video.addEventListener('loadeddata', function() {
      const savedTime = localStorage.getItem(video.dataset.key);
      if (savedTime && !isNaN(savedTime)) {
        video.currentTime = parseFloat(savedTime);
      }
    });

    video.addEventListener('play', function(event) {
      currentVideo = event.target;

      videos.forEach(v => {
        if (v !== currentVideo) v.pause();
      });

      if (currentAudioPlayer && !currentAudioPlayer.paused) {
        currentAudioPlayer.pause();
        if (currentPlayButton) {
          const playIcon = currentPlayButton.querySelector(".play-icon");
          const pauseIcon = currentPlayButton.querySelector(".pause-icon");
          playIcon.style.display = 'block';
          pauseIcon.style.display = 'none';
          currentPlayButton.classList.remove("playing");
        }
        currentAudioPlayer = null;
        currentPlayButton = null;
      }
    });

    video.addEventListener('pause', function() {
      localStorage.setItem(video.dataset.key, video.currentTime);
    });

    video.addEventListener('ended', function() {
      localStorage.removeItem(video.dataset.key);
    });
  });

  // Обработка музыкальных треков
  musicItems.forEach(function(item, index) {
    const playButton = item.querySelector(".play-button");
    const playIcon = playButton.querySelector(".play-icon");
    const pauseIcon = playButton.querySelector(".pause-icon");
    const seekBar = item.querySelector(".seek-bar");
    const audioSrc = playButton.dataset.src;
    const audioPlayer = new Audio(audioSrc);

    // Загружаем метаданные
    audioPlayer.addEventListener("loadedmetadata", function() {
      seekBar.max = audioPlayer.duration || 0;

      const savedTime = localStorage.getItem(audioSrc);
      if (savedTime && !isNaN(savedTime)) {
        audioPlayer.currentTime = parseFloat(savedTime);
        seekBar.value = parseFloat(savedTime);
      } else {
        seekBar.value = 0;
      }

      updateSeekBarBackground(seekBar, seekBar.value, seekBar.max);
    });

    // Обновление прогресс-бара
    audioPlayer.addEventListener("timeupdate", function() {
      seekBar.value = audioPlayer.currentTime;
      updateSeekBarBackground(seekBar, seekBar.value, seekBar.max);
    });

    // Перемотка
    seekBar.addEventListener("input", function() {
      updateSeekBarBackground(seekBar, seekBar.value, seekBar.max);
    });

    seekBar.addEventListener("change", function() {
      audioPlayer.currentTime = parseFloat(seekBar.value);
      localStorage.setItem(audioSrc, seekBar.value);
    });

    // Кнопка воспроизведения
    playButton.addEventListener("click", function() {
      if (currentAudioPlayer && currentAudioPlayer !== audioPlayer) {
        currentAudioPlayer.pause();
        if (currentPlayButton) {
          const prevPlayIcon = currentPlayButton.querySelector(".play-icon");
          const prevPauseIcon = currentPlayButton.querySelector(".pause-icon");
          prevPlayIcon.style.display = 'block';
          prevPauseIcon.style.display = 'none';
          currentPlayButton.classList.remove("playing");
        }
      }

      currentAudioPlayer = audioPlayer;
      currentPlayButton = playButton;

      if (audioPlayer.paused) {
        audioPlayer.play();
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'block';
        playButton.classList.add("playing");

        if (currentVideo && !currentVideo.paused) {
          currentVideo.pause();
        }
      } else {
        audioPlayer.pause();
        localStorage.setItem(audioSrc, audioPlayer.currentTime);
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
        playButton.classList.remove("playing");
      }
    });

    // При окончании воспроизведения
    audioPlayer.addEventListener("ended", function() {
      playIcon.style.display = 'block';
      pauseIcon.style.display = 'none';
      seekBar.value = 0;
      updateSeekBarBackground(seekBar, 0, seekBar.max);
      localStorage.removeItem(audioSrc);
      playButton.classList.remove("playing");

      // Авто-воспроизведение следующего трека
      if (index < musicItems.length - 1) {
        const nextButton = musicItems[index + 1].querySelector(".play-button");
        if (nextButton) setTimeout(() => nextButton.click(), 100);
      }
    });

    // Остановка видео при запуске аудио
    audioPlayer.addEventListener('play', function() {
      if (currentVideo && !currentVideo.paused) {
        currentVideo.pause();
      }
    });
  });
});

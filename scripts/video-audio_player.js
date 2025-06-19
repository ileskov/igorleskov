// Функция обновления заливки прогресс-бара
function updateSeekBarBackground(seekBar, value, max) {
  const percent = (value / max) * 100;
  seekBar.style.background = `linear-gradient(to right, #00336a 0%, #00336a ${percent}%, #c7c7c7 ${percent}%, #c7c7c7 100%)`;
}

document.addEventListener('DOMContentLoaded', function() {
  // Переменные для отслеживания текущего аудио и видео
  let currentAudioPlayer = null;
  let currentPlayButton = null;
  let currentVideo = null;

  // --- Блок для единственного аудио с id="audio" (если нужен)
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

  // --- Блок для видео (если есть)
  const videos = document.querySelectorAll('.video');
  videos.forEach(video => {
    video.addEventListener('loadeddata', () => {
      const videoKey = video.dataset.key;
      const savedTime = localStorage.getItem(videoKey);
      if (savedTime && !isNaN(savedTime)) {
        video.currentTime = parseFloat(savedTime);
      }
    });

    video.addEventListener('play', event => {
      currentVideo = event.target;
      videos.forEach(v => {
        if (v !== currentVideo) v.pause();
      });
      if (currentAudioPlayer && !currentAudioPlayer.paused) {
        currentAudioPlayer.pause();
        if (currentPlayButton) {
          currentPlayButton.innerHTML = "&#9658;";
          currentPlayButton.classList.remove("playing");
        }
      }
    });

    video.addEventListener('pause', () => {
      localStorage.setItem(video.dataset.key, video.currentTime);
    });

    video.addEventListener('ended', () => {
      localStorage.removeItem(video.dataset.key);
    });
  });

  // --- Блок для музыкальных треков с кастомным управлением
  const musicItems = document.querySelectorAll(".music-item");

  musicItems.forEach((item, index) => {
    const playButton = item.querySelector(".play-button");
    const audioPlayer = item.querySelector("audio");
    const seekBar = item.querySelector(".seek-bar");

    if (!audioPlayer || !seekBar || !playButton) return;

    // Ключ для localStorage по id аудио
    const storageKey = `audio-position-${audioPlayer.id}`;

    audioPlayer.addEventListener("loadedmetadata", () => {
      seekBar.max = audioPlayer.duration || 0;
      const savedTime = localStorage.getItem(storageKey);
      if (savedTime && !isNaN(savedTime) && savedTime < audioPlayer.duration) {
        audioPlayer.currentTime = parseFloat(savedTime);
        seekBar.value = parseFloat(savedTime);
      } else {
        seekBar.value = 0;
      }
      updateSeekBarBackground(seekBar, seekBar.value, seekBar.max);
    });

    audioPlayer.addEventListener("timeupdate", () => {
      seekBar.value = audioPlayer.currentTime;
      updateSeekBarBackground(seekBar, seekBar.value, seekBar.max);
    });

    seekBar.addEventListener("input", () => {
      updateSeekBarBackground(seekBar, seekBar.value, seekBar.max);
    });

    seekBar.addEventListener("change", () => {
      audioPlayer.currentTime = parseFloat(seekBar.value);
      localStorage.setItem(storageKey, seekBar.value);
    });

    playButton.addEventListener("click", () => {
      // Пауза предыдущего трека, если другой играет
      if (currentAudioPlayer && currentAudioPlayer !== audioPlayer) {
        currentAudioPlayer.pause();
        if (currentPlayButton) {
          currentPlayButton.innerHTML = "&#9658;";
          currentPlayButton.classList.remove("playing");
        }
      }

      if (audioPlayer.paused) {
        audioPlayer.play();
        playButton.innerHTML = "&#10074;&#10074;"; // Пауза
        playButton.classList.add("playing");
        currentAudioPlayer = audioPlayer;
        currentPlayButton = playButton;

        if (currentVideo && !currentVideo.paused) {
          currentVideo.pause();
        }
      } else {
        audioPlayer.pause();
        localStorage.setItem(storageKey, audioPlayer.currentTime);
        playButton.innerHTML = "&#9658;"; // Воспроизведение
        playButton.classList.remove("playing");
        currentAudioPlayer = null;
        currentPlayButton = null;
      }
    });

    audioPlayer.addEventListener("ended", () => {
      playButton.innerHTML = "&#9658;";
      seekBar.value = 0;
      updateSeekBarBackground(seekBar, 0, seekBar.max);
      localStorage.removeItem(storageKey);

      // Автопереход к следующему треку
      if (index < musicItems.length - 1) {
        const nextPlayButton = musicItems[index + 1].querySelector(".play-button");
        if (nextPlayButton) {
          nextPlayButton.click();
        }
      }
      currentAudioPlayer = null;
      currentPlayButton = null;
    });
  });

  // При клике на play-button видео ставится на паузу
  musicItems.forEach(item => {
    const playButton = item.querySelector(".play-button");
    playButton.addEventListener("click", () => {
      if (currentVideo && !currentVideo.paused) {
        currentVideo.pause();
      }
    });
  });
});


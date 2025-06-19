// Функция обновления заливки прогресс-бара
function updateSeekBarBackground(seekBar, value, max) {
  const percent = max ? Math.min((value / max) * 100, 100) : 0;
  seekBar.style.background = `linear-gradient(to right, #00336a 0%, #00336a ${percent}%, #c7c7c7 ${percent}%, #c7c7c7 100%)`;
}

document.addEventListener('DOMContentLoaded', function () {
  // --- Блок для единственного аудио с id="audio" ---
  const audio = document.getElementById('audio');
  const seekBar = document.getElementById('seekBar');

  if (audio && seekBar) {
    const audioKey = "audioPosition";

    audio.addEventListener('loadedmetadata', () => {
      seekBar.max = audio.duration;
      const saved = localStorage.getItem(audioKey);
      const savedTime = saved && !isNaN(saved) ? parseFloat(saved) : 0;
      audio.currentTime = savedTime;
      seekBar.value = savedTime;
      updateSeekBarBackground(seekBar, savedTime, audio.duration);
    });

    audio.addEventListener("timeupdate", () => {
      seekBar.value = audio.currentTime;
      updateSeekBarBackground(seekBar, seekBar.value, seekBar.max);
      localStorage.setItem(audioKey, audio.currentTime);
    });

    seekBar.addEventListener("input", () => {
      updateSeekBarBackground(seekBar, seekBar.value, seekBar.max);
    });

    seekBar.addEventListener("change", () => {
      audio.currentTime = parseFloat(seekBar.value);
      localStorage.setItem(audioKey, seekBar.value);
    });
  }

  // --- Блок для видео и музыки из списков ---
  const videos = document.querySelectorAll('.video');
  const musicItems = document.querySelectorAll(".music-item");
  let currentVideo = null;
  let currentAudioPlayer = null;

  // Флаг блокировки обновления прогресса во время перемотки пользователем
  let isSeeking = false;

  // Обработка видео
  videos.forEach(video => {
    video.addEventListener('loadeddata', () => {
      const savedTime = localStorage.getItem(video.dataset.key);
      if (savedTime && !isNaN(savedTime)) {
        video.currentTime = parseFloat(savedTime);
      }
    });

    video.addEventListener('play', e => {
      currentVideo = e.target;
      videos.forEach(v => v !== currentVideo && v.pause());

      if (currentAudioPlayer && !currentAudioPlayer.paused) {
        currentAudioPlayer.pause();
        const btn = document.querySelector(".playing");
        if (btn) {
          btn.innerHTML = "&#9658;";
          btn.classList.remove("playing");
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

  // Обработка музыкальных элементов
  musicItems.forEach((item, index) => {
    const playButton = item.querySelector(".play-button");
    const audioPlayer = item.querySelector("audio");
    const seekBar = item.querySelector(".seek-bar");

    if (!audioPlayer || !seekBar || !playButton) return;

    const audioKey = audioPlayer.dataset.key || audioPlayer.src;

    audioPlayer.addEventListener("loadedmetadata", () => {
      seekBar.max = audioPlayer.duration;

      const savedTime = localStorage.getItem(audioKey);
      const time = savedTime && !isNaN(savedTime) ? parseFloat(savedTime) : 0;

      if (time > 0 && time < audioPlayer.duration) {
        audioPlayer.currentTime = time;
      }

      seekBar.value = audioPlayer.currentTime;
      updateSeekBarBackground(seekBar, audioPlayer.currentTime, audioPlayer.duration);
    });

    audioPlayer.addEventListener('seeked', () => {
      // Снимаем блокировку после перемотки и обновляем заливку
      isSeeking = false;
      seekBar.value = audioPlayer.currentTime;
      updateSeekBarBackground(seekBar, audioPlayer.currentTime, audioPlayer.duration);
      localStorage.setItem(audioKey, audioPlayer.currentTime);
    });

    audioPlayer.addEventListener("timeupdate", () => {
      if (isSeeking) return; // не обновлять прогресс при активной перемотке пользователем

      const current = audioPlayer.currentTime;
      seekBar.value = current;
      updateSeekBarBackground(seekBar, current, audioPlayer.duration);
      localStorage.setItem(audioKey, current);

      // Если почти конец трека — остановить и обновить UI
      if (audioPlayer.duration - current < 0.2) {
        audioPlayer.pause();
        seekBar.value = audioPlayer.duration;
        updateSeekBarBackground(seekBar, audioPlayer.duration, audioPlayer.duration);
      }
    });

    seekBar.addEventListener("input", () => {
      isSeeking = true; // блокируем обновление из timeupdate во время перемотки
      const val = parseFloat(seekBar.value);
      updateSeekBarBackground(seekBar, val, parseFloat(seekBar.max));
    });

    seekBar.addEventListener("change", () => {
      const time = parseFloat(seekBar.value);
      audioPlayer.currentTime = time;
      localStorage.setItem(audioKey, time);
      // isSeeking сбрасывается в событии 'seeked'
    });

    playButton.addEventListener("click", () => {
      if (currentAudioPlayer && currentAudioPlayer !== audioPlayer) {
        currentAudioPlayer.pause();
        const prev = document.querySelector(".playing");
        if (prev) {
          prev.innerHTML = "&#9658;";
          prev.classList.remove("playing");
        }
      }

      currentAudioPlayer = audioPlayer;
      if (audioPlayer.paused) {
        audioPlayer.play();
        playButton.innerHTML = "&#10074;&#10074;";
        playButton.classList.add("playing");
        if (currentVideo && !currentVideo.paused) currentVideo.pause();
      } else {
        audioPlayer.pause();
        playButton.innerHTML = "&#9658;";
        playButton.classList.remove("playing");
        localStorage.setItem(audioKey, audioPlayer.currentTime);
      }
    });

    audioPlayer.addEventListener("ended", () => {
      playButton.innerHTML = "&#9658;";
      seekBar.value = 0;
      updateSeekBarBackground(seekBar, 0, audioPlayer.duration);
      localStorage.removeItem(audioKey);

      // Автовоспроизведение следующего трека с небольшой задержкой
      if (index < musicItems.length - 1) {
        setTimeout(() => {
          const nextBtn = musicItems[index + 1].querySelector(".play-button");
          if (nextBtn) nextBtn.click();
        }, 100);
      }
    });

    audioPlayer.addEventListener('play', () => {
      if (currentVideo && !currentVideo.paused) {
        currentVideo.pause();
      }
    });
  });

  // При клике на кнопку воспроизведения любого трека — ставим на паузу видео
  musicItems.forEach(item => {
    const playButton = item.querySelector(".play-button");
    playButton.addEventListener("click", () => {
      if (currentVideo) currentVideo.pause();
    });
  });

  // При уходе со страницы — сохраняем позицию текущего аудио
  window.addEventListener("beforeunload", () => {
    if (currentAudioPlayer) {
      const key = currentAudioPlayer.dataset.key || currentAudioPlayer.src;
      localStorage.setItem(key, currentAudioPlayer.currentTime);
    }
  });
});

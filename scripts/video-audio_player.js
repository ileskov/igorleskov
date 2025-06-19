// Функция обновления заливки прогресс-бара
function updateSeekBarBackground(seekBar, value, max) {
  const percent = max ? Math.min((value / max) * 100, 100) : 0;
  seekBar.style.background = `linear-gradient(to right, #00336a 0%, #00336a ${percent}%, #c7c7c7 ${percent}%, #c7c7c7 100%)`;
}

document.addEventListener('DOMContentLoaded', function () {
  const videos = document.querySelectorAll('.video');
  const musicItems = document.querySelectorAll(".music-item");
  let currentVideo = null;
  let currentAudioPlayer = null;

  // Видео: загрузка сохранённой позиции и пауза других
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

  // Музыка: обработка каждого элемента
  musicItems.forEach((item, index) => {
    const playButton = item.querySelector(".play-button");
    const audioPlayer = item.querySelector("audio");
    const seekBar = item.querySelector(".seek-bar");

    if (!audioPlayer || !seekBar || !playButton) return;

    const audioKey = audioPlayer.dataset.key || audioPlayer.src;

    // При загрузке метаданных аудио
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

    // После завершения перемотки (установка текущего времени)
    audioPlayer.addEventListener('seeked', () => {
      updateSeekBarBackground(seekBar, audioPlayer.currentTime, audioPlayer.duration);
      seekBar.value = audioPlayer.currentTime;
    });

    // Обновление прогресса при воспроизведении
    audioPlayer.addEventListener("timeupdate", () => {
      const current = audioPlayer.currentTime;
      seekBar.value = current;
      updateSeekBarBackground(seekBar, current, audioPlayer.duration);
      localStorage.setItem(audioKey, current);

      if (audioPlayer.duration - current < 0.2) {
        audioPlayer.pause();
        seekBar.value = audioPlayer.duration;
        updateSeekBarBackground(seekBar, audioPlayer.duration, audioPlayer.duration);
      }
    });

    // Обновление заливки при движении ползунка (input)
    seekBar.addEventListener("input", () => {
      const val = parseFloat(seekBar.value);
      updateSeekBarBackground(seekBar, val, parseFloat(seekBar.max));
    });

    // При отпускании ползунка (change) меняем текущую позицию аудио
    seekBar.addEventListener("change", () => {
      const time = parseFloat(seekBar.value);
      audioPlayer.currentTime = time;
      localStorage.setItem(audioKey, time);
    });

    // Кнопка воспроизведения/паузы
    playButton.addEventListener("click", () => {
      // Пауза предыдущего аудио, если нужно
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
        playButton.innerHTML = "&#10074;&#10074;"; // пауза
        playButton.classList.add("playing");
        if (currentVideo && !currentVideo.paused) currentVideo.pause();
      } else {
        audioPlayer.pause();
        playButton.innerHTML = "&#9658;"; // воспроизведение
        playButton.classList.remove("playing");
        localStorage.setItem(audioKey, audioPlayer.currentTime);
      }
    });

    // При окончании трека
    audioPlayer.addEventListener("ended", () => {
      playButton.innerHTML = "&#9658;";
      seekBar.value = 0;
      updateSeekBarBackground(seekBar, 0, audioPlayer.duration);
      localStorage.removeItem(audioKey);

      // Автоматическое воспроизведение следующего трека, если есть
      if (index < musicItems.length - 1) {
        const nextBtn = musicItems[index + 1].querySelector(".play-button");
        if (nextBtn) nextBtn.click();
      }
    });

    // При старте аудио — пауза видео
    audioPlayer.addEventListener('play', () => {
      if (currentVideo && !currentVideo.paused) {
        currentVideo.pause();
      }
    });
  });

  // Если кликаем на кнопку в любом элементе музыки — пауза видео
  musicItems.forEach(item => {
    const playButton = item.querySelector(".play-button");
    playButton.addEventListener("click", () => {
      if (currentVideo) currentVideo.pause();
    });
  });

  // Сохраняем позицию аудио при выходе со страницы
  window.addEventListener("beforeunload", () => {
    if (currentAudioPlayer) {
      const key = currentAudioPlayer.dataset.key || currentAudioPlayer.src;
      localStorage.setItem(key, currentAudioPlayer.currentTime);
    }
  });
});

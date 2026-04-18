/**
 * Single active audio, click-to-play on tiles, playing state on cards.
 */
(() => {
  const grid = document.querySelector("[data-instrument-grid]");
  const statusRegion = document.getElementById("audio-status");

  if (!grid || !statusRegion) return;

  function announce(message) {
    statusRegion.textContent = "";
    window.requestAnimationFrame(() => {
      statusRegion.textContent = message;
    });
  }

  /**
   * @param {HTMLAudioElement | null} except
   */
  function pauseOthers(except) {
    const audios = /** @type {NodeListOf<HTMLAudioElement>} */ (grid.querySelectorAll("audio"));
    audios.forEach((audio) => {
      if (audio !== except && !audio.paused) {
        audio.pause();
        try {
          audio.currentTime = 0;
        } catch {
          /* ignore */
        }
      }
    });
  }

  grid.querySelectorAll("[data-instrument]").forEach((row) => {
    if (!(row instanceof HTMLElement)) return;
    const article = row.querySelector("article.instrument-card");
    if (!(article instanceof HTMLElement)) return;
    const audio = row.querySelector("audio");
    if (!(audio instanceof HTMLAudioElement)) return;

    const setPlaying = (playing) => {
      article.classList.toggle("is-playing", playing);
    };

    audio.addEventListener("play", () => setPlaying(true));
    audio.addEventListener("pause", () => setPlaying(false));
    audio.addEventListener("ended", () => setPlaying(false));
  });

  grid.addEventListener(
    "play",
    (event) => {
      const target = event.target;
      if (!(target instanceof HTMLAudioElement)) return;
      pauseOthers(target);
      const card = target.closest("[data-instrument]");
      const name = card?.getAttribute("data-name-en") ?? "Instrument";
      announce(`${name} audio is playing.`);
    },
    true
  );

  grid.addEventListener(
    "ended",
    (event) => {
      const target = event.target;
      if (!(target instanceof HTMLAudioElement)) return;
      const card = target.closest("[data-instrument]");
      const name = card?.getAttribute("data-name-en") ?? "Instrument";
      announce(`${name} audio finished.`);
    },
    true
  );

  /**
   * @param {HTMLElement} card
   */
  function playCardAudio(card) {
    const audio = card.querySelector("audio");
    if (!(audio instanceof HTMLAudioElement)) return;

    if (!audio.paused) {
      audio.pause();
      try {
        audio.currentTime = 0;
      } catch {
        /* ignore */
      }
      announce("Audio stopped.");
      return;
    }

    pauseOthers(audio);
    const playPromise = audio.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {
        announce("Audio could not start. Try clicking the tile again.");
      });
    }
  }

  grid.addEventListener("click", (event) => {
    const tile = event.target.closest(".instrument-tile");
    if (!(tile instanceof HTMLElement)) return;
    const card = tile.closest("[data-instrument]");
    if (!card) return;
    playCardAudio(card);
  });

  grid.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const el = event.target;
    if (!(el instanceof HTMLElement)) return;
    if (!el.classList.contains("instrument-tile")) return;
    event.preventDefault();
    const card = el.closest("[data-instrument]");
    if (!card) return;
    playCardAudio(card);
  });
})();

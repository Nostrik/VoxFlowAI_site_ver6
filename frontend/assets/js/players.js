  (() => {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  const sharedAudioContext = AudioContextClass ? new AudioContextClass() : null;
  let activePlayer = null;

  function formatTime(seconds) {
    if (!Number.isFinite(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();
  }

  class VoicePlayer {
    constructor(root) {
      this.root = root;
      this.audio = root.querySelector("audio");
      this.playBtn = root.querySelector(".play-btn");
      this.playIcon = root.querySelector(".play-icon");
      this.pause1 = root.querySelector(".pause-icon-1");
      this.pause2 = root.querySelector(".pause-icon-2");
      this.canvas = root.querySelector(".waveform");
      this.progress = root.querySelector(".progress");
      this.progressFill = root.querySelector(".progress-fill");
      this.progressThumb = root.querySelector(".progress-thumb");
      this.time = root.querySelector(".time");
      this.ctx = this.canvas.getContext("2d");

      this.connected = false;
      this.analyser = null;
      this.source = null;
      this.freqData = null;
      this.animationFrame = null;
      this.isDragging = false;

      this.waveBars = this.generateBars(72);

      this.init();
    }

    init() {
      this.resizeCanvas();
      window.addEventListener("resize", () => this.resizeCanvas());

      this.playBtn.addEventListener("click", () => this.toggle());

      this.audio.addEventListener("loadedmetadata", () => {
        this.updateTime();
        this.updateProgress();
        this.draw();
      });

      this.audio.addEventListener("timeupdate", () => {
        if (!this.isDragging) this.updateProgress();
        this.updateTime();
      });

      this.audio.addEventListener("play", () => {
        this.root.classList.add("is-playing");
        this.playBtn.classList.add("is-playing");
        this.playIcon.classList.add("hidden");
        this.pause1.classList.remove("hidden");
        this.pause2.classList.remove("hidden");
        this.startLoop();
      });

      this.audio.addEventListener("pause", () => {
        this.root.classList.remove("is-playing");
        this.playBtn.classList.remove("is-playing");
        this.playIcon.classList.remove("hidden");
        this.pause1.classList.add("hidden");
        this.pause2.classList.add("hidden");
      });

      this.audio.addEventListener("ended", () => {
        this.audio.currentTime = 0;
        this.updateProgress();
        this.updateTime();
        this.draw();
        if (activePlayer === this) activePlayer = null;
      });

      this.progress.addEventListener("click", (e) => this.seek(e));

      this.progress.addEventListener("pointerdown", (e) => {
        this.isDragging = true;
        this.seek(e);
      });

      window.addEventListener("pointermove", (e) => {
        if (!this.isDragging) return;
        this.seek(e);
      });

      window.addEventListener("pointerup", () => {
        this.isDragging = false;
      });

      this.draw();
    }

    resizeCanvas() {
      const rect = this.canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      this.canvas.width = Math.max(320, Math.floor(rect.width * dpr));
      this.canvas.height = Math.max(92, Math.floor(rect.height * dpr));

      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.ctx.scale(dpr, dpr);
      this.draw();
    }

    generateBars(count) {
      const center = (count - 1) / 2;
      const bars = [];

      for (let i = 0; i < count; i++) {
        const distance = Math.abs(i - center) / center;
        const envelope = 1 - distance * 0.78;
        const variance = 0.45 + Math.random() * 0.55;
        bars.push(clamp(envelope * variance, 0.18, 1));
      }

      return bars;
    }

    async setupAudio() {
      if (!sharedAudioContext || this.connected) return;

      if (sharedAudioContext.state === "suspended") {
        await sharedAudioContext.resume();
      }

      this.source = sharedAudioContext.createMediaElementSource(this.audio);
      this.analyser = sharedAudioContext.createAnalyser();

      // Было 256, из-за этого данных было мало и реагировал в основном только левый край.
      this.analyser.fftSize = 2048;
      this.analyser.smoothingTimeConstant = 0.85;
      this.freqData = new Uint8Array(this.analyser.frequencyBinCount);

      this.source.connect(this.analyser);
      this.analyser.connect(sharedAudioContext.destination);

      this.connected = true;
    }

    async toggle() {
      if (this.audio.paused) {
        if (activePlayer && activePlayer !== this) {
          activePlayer.pause();
        }

        await this.setupAudio();

        if (sharedAudioContext && sharedAudioContext.state === "suspended") {
          await sharedAudioContext.resume();
        }

        try {
          await this.audio.play();
          activePlayer = this;
        } catch (error) {
          console.error(error);
        }
      } else {
        this.pause();
      }
    }

    pause() {
      this.audio.pause();
    }

    seek(event) {
      const rect = this.progress.getBoundingClientRect();
      const ratio = clamp((event.clientX - rect.left) / rect.width, 0, 1);

      if (Number.isFinite(this.audio.duration)) {
        this.audio.currentTime = ratio * this.audio.duration;
        this.updateProgress();
        this.updateTime();
      }
    }

    updateProgress() {
      const duration = this.audio.duration || 0;
      const current = this.audio.currentTime || 0;
      const ratio = duration ? current / duration : 0;
      const percent = ratio * 100;

      this.progressFill.style.width = `${percent}%`;
      this.progressThumb.style.left = `${percent}%`;
    }

    updateTime() {
      this.time.textContent = `${formatTime(this.audio.currentTime || 0)} / ${formatTime(this.audio.duration || 0)}`;
    }

    getLevels() {
      if (!this.analyser || !this.freqData || this.audio.paused) {
        return new Array(this.waveBars.length).fill(0.12);
      }

      this.analyser.getByteFrequencyData(this.freqData);

      const barsCount = this.waveBars.length;
      const levels = [];
      const minIndex = 1;
      const maxIndex = this.freqData.length - 1;

      for (let i = 0; i < barsCount; i++) {
        const startNorm = i / barsCount;
        const endNorm = (i + 1) / barsCount;

        // Логарифмическое распределение — больше внимания низким частотам,
        // но весь waveform получает данные, а не только левая часть.
        const startIndex = Math.floor(minIndex + Math.pow(startNorm, 2.2) * (maxIndex - minIndex));
        const endIndex = Math.floor(minIndex + Math.pow(endNorm, 2.2) * (maxIndex - minIndex));

        let sum = 0;
        let weightSum = 0;

        for (let j = startIndex; j <= endIndex; j++) {
          const weight = 1 + j / this.freqData.length * 0.35;
          sum += this.freqData[j] * weight;
          weightSum += weight;
        }

        const avg = weightSum > 0 ? sum / weightSum : 0;
        levels.push(avg / 255);
      }

      // Легкое сглаживание между соседними барами
      const smoothed = [];
      for (let i = 0; i < levels.length; i++) {
        const prev = levels[i - 1] ?? levels[i];
        const curr = levels[i];
        const next = levels[i + 1] ?? levels[i];
        smoothed.push((prev * 0.25 + curr * 0.5 + next * 0.25));
      }

      return smoothed;
    }

    draw() {
      const ctx = this.ctx;
      const rect = this.canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      ctx.clearRect(0, 0, width, height);

      const bars = this.waveBars;
      const levels = this.getLevels();
      const count = bars.length;
      const gap = 3;
      const barWidth = Math.max(3, (width - gap * (count - 1)) / count);
      const centerY = height / 2;

      const playedRatio = this.audio.duration ? this.audio.currentTime / this.audio.duration : 0;
      const playedX = width * playedRatio;

      const gradientPlayed = ctx.createLinearGradient(0, 0, width, 0);
      gradientPlayed.addColorStop(0, "rgba(38,124,255,0.55)");
      gradientPlayed.addColorStop(0.45, "rgba(78,190,255,1)");
      gradientPlayed.addColorStop(1, "rgba(38,124,255,0.55)");

      const gradientIdle = ctx.createLinearGradient(0, 0, width, 0);
      gradientIdle.addColorStop(0, "rgba(54,112,212,0.30)");
      gradientIdle.addColorStop(0.5, "rgba(71,136,255,0.42)");
      gradientIdle.addColorStop(1, "rgba(54,112,212,0.28)");

      for (let i = 0; i < count; i++) {
        const x = i * (barWidth + gap);
        const baseAmp = bars[i];
        const reactiveAmp = this.audio.paused ? 0.16 : clamp(levels[i] * 1.8, 0.08, 1);
        const amp = clamp(baseAmp * 0.45 + reactiveAmp * 0.95, 0.08, 1.15);

        const barHeight = Math.max(8, amp * height * 0.72);
        const y = centerY - barHeight / 2;
        const radius = Math.min(999, barWidth / 2);

        ctx.fillStyle = x + barWidth / 2 <= playedX ? gradientPlayed : gradientIdle;
        roundRect(ctx, x, y, barWidth, barHeight, radius);
        ctx.fill();
      }
    }

    startLoop() {
      if (this.animationFrame) return;

      const loop = () => {
        this.draw();
        this.animationFrame = requestAnimationFrame(loop);
      };

      loop();
    }
  }

  document.querySelectorAll("[data-player]").forEach((el) => new VoicePlayer(el));
})();

// (() => {
//   const AudioContextClass = window.AudioContext || window.webkitAudioContext;
//   const sharedAudioContext = AudioContextClass ? new AudioContextClass() : null;
//   let activePlayer = null;

//   function formatTime(seconds) {
//     if (!Number.isFinite(seconds)) return "00:00";
//     const mins = Math.floor(seconds / 60);
//     const secs = Math.floor(seconds % 60);
//     return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
//   }

//   function clamp(value, min, max) {
//     return Math.min(Math.max(value, min), max);
//   }

//   function roundRect(ctx, x, y, width, height, radius) {
//     ctx.beginPath();
//     ctx.moveTo(x + radius, y);
//     ctx.arcTo(x + width, y, x + width, y + height, radius);
//     ctx.arcTo(x + width, y + height, x, y + height, radius);
//     ctx.arcTo(x, y + height, x, y, radius);
//     ctx.arcTo(x, y, x + width, y, radius);
//     ctx.closePath();
//   }

//   class VoicePlayer {
//     constructor(root) {
//       this.root = root;
//       this.audio = root.querySelector("audio");
//       this.playBtn = root.querySelector(".play-btn");
//       this.playIcon = root.querySelector(".play-icon");
//       this.pause1 = root.querySelector(".pause-icon-1");
//       this.pause2 = root.querySelector(".pause-icon-2");
//       this.canvas = root.querySelector(".waveform");
//       this.progress = root.querySelector(".progress");
//       this.progressFill = root.querySelector(".progress-fill");
//       this.progressThumb = root.querySelector(".progress-thumb");
//       this.time = root.querySelector(".time");
//       this.ctx = this.canvas.getContext("2d");

//       this.connected = false;
//       this.analyser = null;
//       this.source = null;
//       this.timeData = null;
//       this.animationFrame = null;
//       this.isDragging = false;

//       this.barsCount = 72;
//       this.idleBars = this.generateIdleBars(this.barsCount);
//       this.smoothedLevels = new Array(this.barsCount).fill(0.12);

//       this.init();
//     }

//     init() {
//       this.resizeCanvas();
//       window.addEventListener("resize", () => this.resizeCanvas());

//       this.playBtn.addEventListener("click", () => this.toggle());

//       this.audio.addEventListener("loadedmetadata", () => {
//         this.updateTime();
//         this.updateProgress();
//         this.draw();
//       });

//       this.audio.addEventListener("timeupdate", () => {
//         if (!this.isDragging) this.updateProgress();
//         this.updateTime();
//       });

//       this.audio.addEventListener("play", () => {
//         this.root.classList.add("is-playing");
//         this.playBtn.classList.add("is-playing");
//         this.playIcon.classList.add("hidden");
//         this.pause1.classList.remove("hidden");
//         this.pause2.classList.remove("hidden");
//         this.startLoop();
//       });

//       this.audio.addEventListener("pause", () => {
//         this.root.classList.remove("is-playing");
//         this.playBtn.classList.remove("is-playing");
//         this.playIcon.classList.remove("hidden");
//         this.pause1.classList.add("hidden");
//         this.pause2.classList.add("hidden");
//       });

//       this.audio.addEventListener("ended", () => {
//         this.audio.currentTime = 0;
//         this.updateProgress();
//         this.updateTime();
//         this.draw();
//         if (activePlayer === this) activePlayer = null;
//       });

//       this.progress.addEventListener("click", (e) => this.seek(e));

//       this.progress.addEventListener("pointerdown", (e) => {
//         this.isDragging = true;
//         this.seek(e);
//       });

//       window.addEventListener("pointermove", (e) => {
//         if (!this.isDragging) return;
//         this.seek(e);
//       });

//       window.addEventListener("pointerup", () => {
//         this.isDragging = false;
//       });

//       this.draw();
//     }

//     resizeCanvas() {
//       const rect = this.canvas.getBoundingClientRect();
//       const dpr = window.devicePixelRatio || 1;

//       this.canvas.width = Math.max(320, Math.floor(rect.width * dpr));
//       this.canvas.height = Math.max(92, Math.floor(rect.height * dpr));

//       this.ctx.setTransform(1, 0, 0, 1, 0, 0);
//       this.ctx.scale(dpr, dpr);
//       this.draw();
//     }

//     generateIdleBars(count) {
//       const center = (count - 1) / 2;
//       const bars = [];

//       for (let i = 0; i < count; i++) {
//         const distance = Math.abs(i - center) / center;
//         const envelope = 1 - distance * 0.55;
//         const variance = 0.65 + Math.random() * 0.35;
//         bars.push(clamp(envelope * variance, 0.35, 1));
//       }

//       return bars;
//     }

//     async setupAudio() {
//       if (!sharedAudioContext || this.connected) return;

//       if (sharedAudioContext.state === "suspended") {
//         await sharedAudioContext.resume();
//       }

//       this.source = sharedAudioContext.createMediaElementSource(this.audio);
//       this.analyser = sharedAudioContext.createAnalyser();

//       this.analyser.fftSize = 2048;
//       this.analyser.smoothingTimeConstant = 0.72;

//       this.timeData = new Uint8Array(this.analyser.fftSize);

//       this.source.connect(this.analyser);
//       this.analyser.connect(sharedAudioContext.destination);

//       this.connected = true;
//     }

//     async toggle() {
//       if (this.audio.paused) {
//         if (activePlayer && activePlayer !== this) {
//           activePlayer.pause();
//         }

//         await this.setupAudio();

//         if (sharedAudioContext && sharedAudioContext.state === "suspended") {
//           await sharedAudioContext.resume();
//         }

//         try {
//           await this.audio.play();
//           activePlayer = this;
//         } catch (error) {
//           console.error(error);
//         }
//       } else {
//         this.pause();
//       }
//     }

//     pause() {
//       this.audio.pause();
//     }

//     seek(event) {
//       const rect = this.progress.getBoundingClientRect();
//       const ratio = clamp((event.clientX - rect.left) / rect.width, 0, 1);

//       if (Number.isFinite(this.audio.duration)) {
//         this.audio.currentTime = ratio * this.audio.duration;
//         this.updateProgress();
//         this.updateTime();
//       }
//     }

//     updateProgress() {
//       const duration = this.audio.duration || 0;
//       const current = this.audio.currentTime || 0;
//       const ratio = duration ? current / duration : 0;
//       const percent = ratio * 100;

//       this.progressFill.style.width = `${percent}%`;
//       this.progressThumb.style.left = `${percent}%`;
//     }

//     updateTime() {
//       this.time.textContent = `${formatTime(this.audio.currentTime || 0)} / ${formatTime(this.audio.duration || 0)}`;
//     }

//     getLevels() {
//       if (!this.analyser || !this.timeData || this.audio.paused) {
//         return this.idleBars.map((v, i) => {
//           this.smoothedLevels[i] = this.smoothedLevels[i] * 0.92 + v * 0.08;
//           return this.smoothedLevels[i];
//         });
//       }

//       this.analyser.getByteTimeDomainData(this.timeData);

//       const levels = [];
//       const samplesPerBar = Math.floor(this.timeData.length / this.barsCount);

//       for (let i = 0; i < this.barsCount; i++) {
//         const start = i * samplesPerBar;
//         const end = i === this.barsCount - 1
//           ? this.timeData.length
//           : start + samplesPerBar;

//         let sumSquares = 0;
//         let peak = 0;

//         for (let j = start; j < end; j++) {
//           const normalized = (this.timeData[j] - 128) / 128;
//           const abs = Math.abs(normalized);
//           sumSquares += normalized * normalized;
//           if (abs > peak) peak = abs;
//         }

//         const length = Math.max(1, end - start);
//         const rms = Math.sqrt(sumSquares / length);

//         // Смесь RMS и peak дает более "живой" waveform
//         let level = rms * 0.75 + peak * 0.25;

//         // Немного усиливаем, чтобы весь waveform был заметнее
//         level = clamp(level * 3.2, 0.04, 1);

//         levels.push(level);
//       }

//       // Сглаживание по соседям, чтобы bars не рвались
//       const spreadLevels = levels.map((level, i) => {
//         const prev = levels[i - 1] ?? level;
//         const next = levels[i + 1] ?? level;
//         return prev * 0.2 + level * 0.6 + next * 0.2;
//       });

//       // Временное сглаживание между кадрами
//       return spreadLevels.map((level, i) => {
//         this.smoothedLevels[i] = this.smoothedLevels[i] * 0.72 + level * 0.28;
//         return this.smoothedLevels[i];
//       });
//     }

//     draw() {
//       const ctx = this.ctx;
//       const rect = this.canvas.getBoundingClientRect();
//       const width = rect.width;
//       const height = rect.height;

//       ctx.clearRect(0, 0, width, height);

//       const levels = this.getLevels();
//       const count = levels.length;
//       const gap = 3;
//       const barWidth = Math.max(3, (width - gap * (count - 1)) / count);
//       const centerY = height / 2;

//       const playedRatio = this.audio.duration ? this.audio.currentTime / this.audio.duration : 0;
//       const playedX = width * playedRatio;

//       const gradientPlayed = ctx.createLinearGradient(0, 0, width, 0);
//       gradientPlayed.addColorStop(0, "rgba(38,124,255,0.60)");
//       gradientPlayed.addColorStop(0.45, "rgba(78,190,255,1)");
//       gradientPlayed.addColorStop(1, "rgba(38,124,255,0.60)");

//       const gradientIdle = ctx.createLinearGradient(0, 0, width, 0);
//       gradientIdle.addColorStop(0, "rgba(54,112,212,0.34)");
//       gradientIdle.addColorStop(0.5, "rgba(71,136,255,0.48)");
//       gradientIdle.addColorStop(1, "rgba(54,112,212,0.32)");

//       for (let i = 0; i < count; i++) {
//         const x = i * (barWidth + gap);

//         // idle shape + real signal
//         const baseAmp = this.idleBars[i] * 0.18;
//         const reactiveAmp = levels[i] * 0.95;
//         const amp = clamp(baseAmp + reactiveAmp, 0.08, 1.15);

//         const barHeight = Math.max(8, amp * height * 0.62);
//         const y = centerY - barHeight / 2;
//         const radius = Math.min(999, barWidth / 2);

//         ctx.fillStyle = x + barWidth / 2 <= playedX ? gradientPlayed : gradientIdle;
//         roundRect(ctx, x, y, barWidth, barHeight, radius);
//         ctx.fill();
//       }
//     }

//     startLoop() {
//       if (this.animationFrame) return;

//       const loop = () => {
//         this.draw();
//         this.animationFrame = requestAnimationFrame(loop);
//       };

//       loop();
//     }
//   }

//   document.querySelectorAll("[data-player]").forEach((el) => new VoicePlayer(el));
// })();
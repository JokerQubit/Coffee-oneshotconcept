/* ==========================================================================
   MAISON PUR & — MASTER ACOUSTIC TELEMETRY & STRINGS MINOR JUKEBOX
   Integrated YouTube Classical Audio Prospecting & Custom Physical SFX
   ========================================================================== */

const CLASSICAL_PLAYLIST = [
  {
    id: 'strings-minor',
    title: 'Vivaldi / Winter & Concerto in G Minor',
    artist: 'Classical Solo Violin & Strings Ensemble',
    src: 'assets/audio/classical_strings_minor.mp3',
    key: 'G Minor / D Minor'
  },
  {
    id: 'violin-bach',
    title: 'J.S. Bach — Solo Violin Partita in D Minor',
    artist: 'Maison Roastery Acoustics (Solo Violin)',
    src: 'assets/audio/classical_violin.mp3',
    key: 'D Minor'
  },
  {
    id: 'viola-nocturne',
    title: 'Chamber Viola & String Orchestra Nocturne',
    artist: 'Deep Minor Strings & Atelier Resonance',
    src: 'assets/audio/viola_strings_nocturne.mp3',
    key: 'C Minor / D Minor'
  }
];

class MaisonMasterAudioEngine {
  constructor() {
    this.ctx = null;
    this.audioElement = null;
    this.currentTrackIndex = 0;
    this.isPlaying = false;
    this.volume = 0.75;
    this.hasAutoStarted = false;
    
    // SFX Audio Elements with Instant Preload
    this.sfxPool = {
      espresso: new Audio('assets/audio/espresso_stream.mp3'),
      pourover: new Audio('assets/audio/pourover_drip.mp3'),
      beans: new Audio('assets/audio/coffee_beans.mp3'),
      grinder: new Audio('assets/audio/coffee_grinder.mp3'),
      cup_clink: new Audio('assets/audio/cup_clink.mp3'),
      steam_wand: new Audio('assets/audio/steam_wand.mp3')
    };

    Object.values(this.sfxPool).forEach(audio => {
      audio.preload = 'auto';
      audio.volume = 0.5;
    });

    window.addEventListener('DOMContentLoaded', () => {
      this.initPlayer();
      this.bindAutoPlayTriggers();
    });
  }

  initPlayer() {
    this.audioElement = document.getElementById('violinAudioElement');
    if (!this.audioElement) {
      this.audioElement = document.createElement('audio');
      this.audioElement.id = 'violinAudioElement';
      document.body.appendChild(this.audioElement);
    }
    
    this.loadTrack(0, false);

    this.audioElement.addEventListener('play', () => {
      this.isPlaying = true;
      this.updateUI();
      this.startVisualizer();
    });

    this.audioElement.addEventListener('pause', () => {
      this.isPlaying = false;
      this.updateUI();
    });

    this.audioElement.addEventListener('ended', () => {
      this.nextTrack();
    });

    this.audioElement.addEventListener('timeupdate', () => {
      this.updateProgress();
    });

    this.bindDOMControls();

    // Attempt direct autoplay if permitted by browser
    this.playSilentlyIfAllowed();
  }

  playSilentlyIfAllowed() {
    if (this.audioElement) {
      const p = this.audioElement.play();
      if (p !== undefined) {
        p.then(() => {
          this.isPlaying = true;
          this.hasAutoStarted = true;
          this.updateUI();
        }).catch(() => {
          // Autoplay policy waiting for user gesture
        });
      }
    }
  }

  bindAutoPlayTriggers() {
    const triggerEvents = ['pointerdown', 'keydown', 'scroll', 'touchstart'];
    const autoPlayHandler = () => {
      if (!this.hasAutoStarted && !this.isPlaying) {
        this.hasAutoStarted = true;
        this.play();
      }
      triggerEvents.forEach(evt => window.removeEventListener(evt, autoPlayHandler));
    };

    triggerEvents.forEach(evt => window.addEventListener(evt, autoPlayHandler, { once: true }));
  }

  initContext() {
    try {
      if (!this.ctx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    } catch (e) {}
  }

  loadTrack(index, autoPlay = true) {
    this.currentTrackIndex = (index + CLASSICAL_PLAYLIST.length) % CLASSICAL_PLAYLIST.length;
    const track = CLASSICAL_PLAYLIST[this.currentTrackIndex];
    
    if (this.audioElement) {
      this.audioElement.src = track.src;
      this.audioElement.volume = this.volume;
      this.audioElement.load();
      
      if (autoPlay) {
        this.play();
      }
    }
    this.updateTrackInfo();
  }

  togglePlay() {
    this.initContext();
    if (!this.audioElement) return;

    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  play() {
    this.initContext();
    if (!this.audioElement) return;

    const playPromise = this.audioElement.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        this.isPlaying = true;
        this.hasAutoStarted = true;
        this.updateUI();
        if (window.MaisonApp) {
          const track = CLASSICAL_PLAYLIST[this.currentTrackIndex];
          window.MaisonApp.showToast(`Tocando: ${track.title}`);
        }
      }).catch(err => {
        console.warn('Playback gesture required:', err);
      });
    }
  }

  pause() {
    if (this.audioElement) {
      this.audioElement.pause();
      this.isPlaying = false;
      this.updateUI();
      if (window.MaisonApp) window.MaisonApp.showToast('Música Clássica Pausada');
    }
  }

  nextTrack() {
    this.loadTrack(this.currentTrackIndex + 1, true);
  }

  prevTrack() {
    this.loadTrack(this.currentTrackIndex - 1, true);
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, parseFloat(val)));
    if (this.audioElement) {
      this.audioElement.volume = this.volume;
    }
    const valReadout = document.getElementById('violinVolumeReadout');
    if (valReadout) {
      valReadout.textContent = `${Math.round(this.volume * 100)}%`;
    }
  }

  seek(percent) {
    if (this.audioElement && this.audioElement.duration) {
      this.audioElement.currentTime = this.audioElement.duration * (percent / 100);
    }
  }

  // Custom Sound Effects Playback
  playSFX(type) {
    try {
      if (this.sfxPool[type]) {
        const audio = this.sfxPool[type].cloneNode();
        audio.volume = this.volume * 0.75;
        audio.play().catch(() => {});
      }
    } catch (e) {}
  }

  playTactileClick() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(220, this.ctx.currentTime + 0.04);
      
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch (e) {}
  }

  playHarmonicChime() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const frequencies = [528, 792, 1056];
      
      frequencies.forEach((freq, index) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        
        const startTime = this.ctx.currentTime + (index * 0.03);
        const duration = 1.2;
        
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.06 / (index + 1), startTime + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start(startTime);
        osc.stop(startTime + duration);
      });
    } catch (e) {}
  }

  playTimerTick() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, this.ctx.currentTime + 0.02);
      
      gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.02);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start();
      osc.stop(this.ctx.currentTime + 0.025);
    } catch (e) {}
  }

  bindDOMControls() {
    const headerBtn = document.getElementById('btnToggleAudio');
    if (headerBtn) {
      headerBtn.addEventListener('click', () => this.togglePlay());
    }

    const playBtn = document.getElementById('btnPlayViolinFloating');
    if (playBtn) {
      playBtn.addEventListener('click', () => this.togglePlay());
    }

    const nextBtn = document.getElementById('btnNextTrack');
    const prevBtn = document.getElementById('btnPrevTrack');
    if (nextBtn) nextBtn.addEventListener('click', () => this.nextTrack());
    if (prevBtn) prevBtn.addEventListener('click', () => this.prevTrack());

    document.querySelectorAll('.track-select-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.trackIndex, 10);
        this.loadTrack(idx, true);
      });
    });

    const volumeSlider = document.getElementById('violinVolumeSlider');
    if (volumeSlider) {
      volumeSlider.addEventListener('input', (e) => this.setVolume(e.target.value));
    }

    const progressBar = document.getElementById('audioProgressBarContainer');
    if (progressBar) {
      progressBar.addEventListener('click', (e) => {
        const rect = progressBar.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        this.seek(pos * 100);
      });
    }
  }

  updateTrackInfo() {
    const track = CLASSICAL_PLAYLIST[this.currentTrackIndex];
    const titleEl = document.getElementById('violinStatusLabel');
    const artistEl = document.getElementById('violinArtistLabel');
    
    if (titleEl) titleEl.textContent = track.title;
    if (artistEl) artistEl.textContent = `${track.artist} • [${track.key}]`;

    document.querySelectorAll('.track-select-pill').forEach((btn, idx) => {
      if (idx === this.currentTrackIndex) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  updateUI() {
    const btns = document.querySelectorAll('.audio-toggle-btn, #btnPlayViolinFloating');
    btns.forEach(btn => {
      if (this.isPlaying) {
        btn.classList.add('playing');
      } else {
        btn.classList.remove('playing');
      }
    });

    const playText = document.getElementById('violinPlayBtnText');
    const playIcon = document.getElementById('violinPlayIcon');

    if (playText) playText.textContent = this.isPlaying ? 'PAUSAR' : 'TOCAR';
    if (playIcon) {
      playIcon.innerHTML = this.isPlaying
        ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>'
        : '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
    }
  }

  updateProgress() {
    if (!this.audioElement || !this.audioElement.duration) return;
    const current = this.audioElement.currentTime;
    const total = this.audioElement.duration;
    const percent = (current / total) * 100;

    const fillEl = document.getElementById('audioProgressFill');
    if (fillEl) fillEl.style.width = `${percent}%`;

    const timeEl = document.getElementById('audioTimeDisplay');
    if (timeEl) {
      const curM = Math.floor(current / 60);
      const curS = Math.floor(current % 60).toString().padStart(2, '0');
      const totM = Math.floor(total / 60);
      const totS = Math.floor(total % 60).toString().padStart(2, '0');
      timeEl.textContent = `${curM}:${curS} / ${totM}:${totS}`;
    }
  }

  startVisualizer() {
    const canvas = document.getElementById('audioWaveCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const render = () => {
      if (!this.isPlaying) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }
      requestAnimationFrame(render);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const bars = 10;
      const barWidth = canvas.width / bars;
      const t = Date.now() * 0.007;

      for (let i = 0; i < bars; i++) {
        const h = Math.abs(Math.sin(t + i * 0.7)) * (canvas.height * 0.85) + 3;
        ctx.fillStyle = 'rgba(198, 156, 109, 0.9)';
        ctx.fillRect(i * barWidth + 1, canvas.height - h, barWidth - 2, h);
      }
    };
    render();
  }
}

window.MaisonAudio = new MaisonMasterAudioEngine();

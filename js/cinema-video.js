/* ==========================================================================
   MAISON PUR & — PROCEDURAL CINEMATIC VIDEO & FILM MASTERCLASS ENGINE
   High-performance GPU Canvas-driven 60fps video loop simulation
   ========================================================================== */

class MaisonCinematicEngine {
  constructor() {
    this.canvas = document.getElementById('cinematicVideoCanvas');
    this.isPlaying = true;
    this.currentChapter = 1;
    this.ctx = null;
    this.animationId = null;
    this.time = 0;
  }

  init() {
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.bindControls();
    this.animate();
  }

  resize() {
    if (!this.canvas) return;
    this.canvas.width = this.canvas.parentElement.clientWidth || 1200;
    this.canvas.height = this.canvas.parentElement.clientHeight || 550;
  }

  bindControls() {
    const playBtn = document.getElementById('btnCinemaPlay');
    if (playBtn) {
      playBtn.addEventListener('click', () => {
        if (window.MaisonAudio) window.MaisonAudio.playTactileClick();
        this.isPlaying = !this.isPlaying;
        playBtn.innerHTML = this.isPlaying
          ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>'
          : '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
      });
    }

    // Chapter buttons
    document.querySelectorAll('.cinema-chapter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (window.MaisonAudio) window.MaisonAudio.playTactileClick();
        document.querySelectorAll('.cinema-chapter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentChapter = parseInt(btn.dataset.chapter, 10);
        const titleEl = document.getElementById('cinemaCurrentTitle');
        if (titleEl) titleEl.textContent = btn.dataset.title;
      });
    });
  }

  animate() {
    this.animationId = requestAnimationFrame(() => this.animate());
    if (!this.isPlaying || !this.ctx) return;

    this.time += 0.016;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const ctx = this.ctx;

    // Base background dark gradient
    const bgGrad = ctx.createLinearGradient(0, 0, w, h);
    bgGrad.addColorStop(0, '#0c0a09');
    bgGrad.addColorStop(0.5, '#191411');
    bgGrad.addColorStop(1, '#0c0a09');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    if (this.currentChapter === 1) {
      // Chapter 1: The Mountain Harvest & Mist
      this.renderMountainMist(ctx, w, h);
    } else if (this.currentChapter === 2) {
      // Chapter 2: Bioreactor Microbes & Thermal Shock
      this.renderBioreactor(ctx, w, h);
    } else if (this.currentChapter === 3) {
      // Chapter 3: Convective Roasting & Floating Agtron Core
      this.renderRoastingGlow(ctx, w, h);
    } else {
      // Chapter 4: Naked Portafilter Golden Crema Extraction
      this.renderCremaExtraction(ctx, w, h);
    }

    // Anamorphic Lens Flare & Dust Overlay
    this.renderAnamorphicStreak(ctx, w, h);
  }

  renderMountainMist(ctx, w, h) {
    // Soft shifting mist layers
    for (let i = 0; i < 4; i++) {
      const yBase = h * (0.4 + i * 0.15);
      ctx.beginPath();
      ctx.moveTo(0, h);
      for (let x = 0; x <= w; x += 30) {
        const y = yBase + Math.sin(x * 0.005 + this.time * (0.8 + i * 0.3) + i) * 35;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fillStyle = `rgba(198, 156, 109, ${0.04 + i * 0.025})`;
      ctx.fill();
    }
  }

  renderBioreactor(ctx, w, h) {
    const cx = w / 2;
    const cy = h / 2;
    // Glowing fluid fermentation ring
    for (let i = 0; i < 30; i++) {
      const angle = (i / 30) * Math.PI * 2 + this.time * 0.6;
      const dist = 120 + Math.sin(this.time * 2 + i) * 20;
      const x = cx + Math.cos(angle) * dist;
      const y = cy + Math.sin(angle) * dist;
      ctx.beginPath();
      ctx.arc(x, y, 4 + Math.sin(i + this.time) * 3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(223, 190, 153, 0.6)`;
      ctx.shadowColor = '#c69c6d';
      ctx.shadowBlur = 15;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  renderRoastingGlow(ctx, w, h) {
    const cx = w / 2;
    const cy = h / 2;
    // Thermal core radiant burst
    const radGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, 250);
    radGrad.addColorStop(0, 'rgba(236, 180, 110, 0.45)');
    radGrad.addColorStop(0.4, 'rgba(198, 110, 50, 0.25)');
    radGrad.addColorStop(1, 'rgba(12, 10, 9, 0)');
    ctx.fillStyle = radGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, 250, 0, Math.PI * 2);
    ctx.fill();

    // Tumbling roasted bean particles
    for (let i = 0; i < 20; i++) {
      const angle = this.time * 1.2 + i;
      const r = 80 + (i * 7);
      const bx = cx + Math.cos(angle) * r;
      const by = cy + Math.sin(angle * 1.5) * (r * 0.4);
      ctx.save();
      ctx.translate(bx, by);
      ctx.rotate(angle * 2);
      ctx.fillStyle = '#3a2b22';
      ctx.beginPath();
      ctx.ellipse(0, 0, 12, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  renderCremaExtraction(ctx, w, h) {
    const cx = w / 2;
    // Golden central stream flowing down
    ctx.beginPath();
    ctx.moveTo(cx - 8, 0);
    ctx.bezierCurveTo(
      cx - 15 + Math.sin(this.time * 3) * 6, h * 0.4,
      cx + 12 + Math.cos(this.time * 2.5) * 6, h * 0.7,
      cx, h
    );
    ctx.lineTo(cx + 8, 0);
    ctx.fillStyle = 'rgba(212, 163, 115, 0.75)';
    ctx.shadowColor = '#ecd5b8';
    ctx.shadowBlur = 20;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Expanding golden ripples at the bottom
    const rippleRadius = (this.time * 60) % 180;
    ctx.beginPath();
    ctx.ellipse(cx, h - 30, rippleRadius, rippleRadius * 0.35, 0, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(198, 156, 109, ${1 - (rippleRadius / 180)})`;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  renderAnamorphicStreak(ctx, w, h) {
    // Subtle cinematic blue/amber horizontal optical flare
    const flareY = h * 0.45 + Math.sin(this.time * 0.5) * 20;
    const flareGrad = ctx.createLinearGradient(0, flareY, w, flareY);
    flareGrad.addColorStop(0, 'rgba(198, 156, 109, 0)');
    flareGrad.addColorStop(0.5, 'rgba(236, 213, 184, 0.15)');
    flareGrad.addColorStop(1, 'rgba(198, 156, 109, 0)');
    ctx.fillStyle = flareGrad;
    ctx.fillRect(0, flareY - 1, w, 2);
  }
}

window.MaisonCinematic = new MaisonCinematicEngine();

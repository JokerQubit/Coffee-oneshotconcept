/* ==========================================================================
   MAISON PUR & — INTERACTIVE SENSORY LAB & BREWING CALCULATOR
   Precision Refractometric & Thermodynamic Extraction Engine
   ========================================================================== */

const BREW_METHODS = {
  v60: {
    name: 'Hario V60 (Conical 60°)',
    defaultDose: 18,
    defaultRatio: 16,
    temp: 93,
    grindRange: '500 - 650 μm (Medium-Fine)',
    bloomRatio: 3,
    targetTimeSec: 195,
    stages: ['0:00 - Bloom with 54g water', '0:45 - First continuous center spiral to 160g', '1:30 - Second spiral pour to 288g', '2:15 - Final drawdown']
  },
  chemex: {
    name: 'Chemex Ottomatic Glass',
    defaultDose: 30,
    defaultRatio: 16.5,
    temp: 94,
    grindRange: '700 - 850 μm (Medium-Coarse)',
    bloomRatio: 3,
    targetTimeSec: 270,
    stages: ['0:00 - Bloom with 90g water', '1:00 - Gentle steady pour to 250g', '2:15 - Main body pour to 495g', '3:30 - Final slow drawdown']
  },
  aeropress: {
    name: 'Aeropress Inverted Method',
    defaultDose: 16,
    defaultRatio: 14,
    temp: 89,
    grindRange: '400 - 550 μm (Fine-Medium)',
    bloomRatio: 2.5,
    targetTimeSec: 120,
    stages: ['0:00 - Add 224g water at 89°C', '0:20 - Gentle paddle stir for 10s', '1:00 - Attach cap & invert', '1:30 - Gentle steady 30s plunge']
  },
  espresso: {
    name: 'Naked Portafilter 9 Bar',
    defaultDose: 19.5,
    defaultRatio: 2.2,
    temp: 93.5,
    grindRange: '200 - 280 μm (Fine Micronized)',
    bloomRatio: 1,
    targetTimeSec: 28,
    stages: ['0:00 - Pre-infusion 2.5 bar for 6s', '0:06 - Full pressure 9.0 bar ramp', '0:18 - Golden crema stream', '0:28 - Cut extraction at 43.0g yield']
  },
  frenchpress: {
    name: 'Atelier French Immersion',
    defaultDose: 25,
    defaultRatio: 15,
    temp: 95,
    grindRange: '850 - 1000 μm (Coarse)',
    bloomRatio: 3,
    targetTimeSec: 300,
    stages: ['0:00 - Saturate with 375g water', '4:00 - Crust break & skim foam', '4:30 - Insert plunger without pressing', '5:00 - Gentle decant']
  }
};

class MaisonBrewCalculator {
  constructor() {
    this.currentMethod = 'v60';
    this.dose = 18;
    this.ratio = 16;
    this.temp = 93;
    
    this.timerInterval = null;
    this.timerSeconds = 0;
    this.isTimerRunning = false;
  }

  init() {
    this.bindEvents();
    this.updateCalculations();
  }

  bindEvents() {
    const methodBtns = document.querySelectorAll('.method-tab-btn');
    methodBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        if (window.MaisonAudio) {
          window.MaisonAudio.playTactileClick();
          if (btn.dataset.method === 'espresso') {
            window.MaisonAudio.playSFX('espresso');
          } else {
            window.MaisonAudio.playSFX('pourover');
          }
        }
        methodBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.selectMethod(btn.dataset.method);
      });
    });

    const doseSlider = document.getElementById('doseSlider');
    const ratioSlider = document.getElementById('ratioSlider');
    const tempSlider = document.getElementById('tempSlider');

    if (doseSlider) {
      doseSlider.addEventListener('input', (e) => {
        this.dose = parseFloat(e.target.value);
        this.updateCalculations();
      });
    }

    if (ratioSlider) {
      ratioSlider.addEventListener('input', (e) => {
        this.ratio = parseFloat(e.target.value);
        this.updateCalculations();
      });
    }

    if (tempSlider) {
      tempSlider.addEventListener('input', (e) => {
        this.temp = parseFloat(e.target.value);
        this.updateCalculations();
      });
    }

    const startBtn = document.getElementById('btnStartTimer');
    const resetBtn = document.getElementById('btnResetTimer');

    if (startBtn) {
      startBtn.addEventListener('click', () => this.toggleTimer());
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.resetTimer());
    }
  }

  selectMethod(methodKey) {
    if (!BREW_METHODS[methodKey]) return;
    this.currentMethod = methodKey;
    const config = BREW_METHODS[methodKey];
    
    this.dose = config.defaultDose;
    this.ratio = config.defaultRatio;
    this.temp = config.temp;

    const doseSlider = document.getElementById('doseSlider');
    const ratioSlider = document.getElementById('ratioSlider');
    const tempSlider = document.getElementById('tempSlider');

    if (doseSlider) {
      doseSlider.value = this.dose;
      if (methodKey === 'espresso') {
        doseSlider.min = 14;
        doseSlider.max = 24;
        doseSlider.step = 0.5;
      } else {
        doseSlider.min = 12;
        doseSlider.max = 45;
        doseSlider.step = 1;
      }
    }

    if (ratioSlider) {
      ratioSlider.value = this.ratio;
      if (methodKey === 'espresso') {
        ratioSlider.min = 1.5;
        ratioSlider.max = 3.0;
        ratioSlider.step = 0.1;
      } else {
        ratioSlider.min = 13;
        ratioSlider.max = 19;
        ratioSlider.step = 0.5;
      }
    }

    if (tempSlider) {
      tempSlider.value = this.temp;
    }

    this.updateCalculations();
  }

  updateCalculations() {
    const config = BREW_METHODS[this.currentMethod];
    const totalWater = (this.dose * this.ratio).toFixed(1);
    const bloomWater = (this.dose * (config.bloomRatio || 3)).toFixed(0);

    const doseVal = document.getElementById('doseVal');
    const ratioVal = document.getElementById('ratioVal');
    const tempVal = document.getElementById('tempVal');

    if (doseVal) doseVal.textContent = `${this.dose} g`;
    if (ratioVal) ratioVal.textContent = `1:${this.ratio}`;
    if (tempVal) tempVal.textContent = `${this.temp} °C`;

    const targetWaterEl = document.getElementById('targetWaterYield');
    const grindMicronEl = document.getElementById('grindMicronReadout');
    const bloomYieldEl = document.getElementById('bloomWaterYield');
    const estTdsEl = document.getElementById('estTdsYield');
    const estExtractionYieldEl = document.getElementById('estExtractionYield');

    if (targetWaterEl) targetWaterEl.textContent = `${totalWater} g`;
    if (grindMicronEl) grindMicronEl.textContent = config.grindRange;
    if (bloomYieldEl) bloomYieldEl.textContent = `${bloomWater} g`;

    if (this.currentMethod === 'espresso') {
      if (estTdsEl) estTdsEl.textContent = '9.20% TDS';
      if (estExtractionYieldEl) estExtractionYieldEl.textContent = '20.4% Yield';
    } else {
      const estimatedTds = (1.36 + (16 - this.ratio) * 0.04).toFixed(2);
      const estimatedYield = (estimatedTds * (totalWater / this.dose) * 0.9).toFixed(1);
      if (estTdsEl) estTdsEl.textContent = `${estimatedTds}% TDS`;
      if (estExtractionYieldEl) estExtractionYieldEl.textContent = `${estimatedYield}% Yield`;
    }

    const stagesList = document.getElementById('brewStagesList');
    if (stagesList) {
      stagesList.innerHTML = config.stages.map(step => `
        <li style="margin-bottom: 6px; font-size: 13px; color: var(--color-text-subtle); display: flex; align-items: center; gap: 8px;">
          <span style="color: var(--color-gold); font-size: 8px;">◆</span>
          ${step}
        </li>
      `).join('');
    }
  }

  toggleTimer() {
    const startBtn = document.getElementById('btnStartTimer');
    if (this.isTimerRunning) {
      clearInterval(this.timerInterval);
      this.isTimerRunning = false;
      if (startBtn) startBtn.textContent = 'Resume Timer';
      if (window.MaisonAudio) window.MaisonAudio.playTactileClick();
    } else {
      this.isTimerRunning = true;
      if (startBtn) startBtn.textContent = 'Pause Timer';
      
      if (window.MaisonAudio) {
        window.MaisonAudio.playTactileClick();
        if (this.currentMethod === 'espresso') {
          window.MaisonAudio.playSFX('espresso');
        } else {
          window.MaisonAudio.playSFX('pourover');
        }
      }

      this.timerInterval = setInterval(() => {
        this.timerSeconds++;
        this.renderTimer();
        if (window.MaisonAudio) window.MaisonAudio.playTimerTick();

        const config = BREW_METHODS[this.currentMethod];
        if (this.timerSeconds === config.targetTimeSec) {
          if (window.MaisonAudio) window.MaisonAudio.playHarmonicChime();
          if (window.MaisonApp) window.MaisonApp.showToast('Extraction complete! Enjoy your terroir cup.');
        }
      }, 1000);
    }
  }

  resetTimer() {
    clearInterval(this.timerInterval);
    this.isTimerRunning = false;
    this.timerSeconds = 0;
    this.renderTimer();
    const startBtn = document.getElementById('btnStartTimer');
    if (startBtn) startBtn.textContent = 'Start Timer';
    if (window.MaisonAudio) window.MaisonAudio.playTactileClick();
  }

  renderTimer() {
    const mins = Math.floor(this.timerSeconds / 60).toString().padStart(2, '0');
    const secs = (this.timerSeconds % 60).toString().padStart(2, '0');
    const display = document.getElementById('stopwatchDisplay');
    if (display) {
      display.textContent = `${mins}:${secs}`;
    }
  }
}

window.MaisonBrewLab = new MaisonBrewCalculator();

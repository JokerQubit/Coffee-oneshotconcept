/* ==========================================================================
   MAISON PUR & — TERROIR PALATE MATCH QUIZ
   Interactive recommendation engine based on sensory preferences
   ========================================================================== */

class MaisonPalateQuiz {
  constructor() {
    this.currentStep = 1;
    this.answers = {
      note: 'floral',
      roast: 'light',
      method: 'filter',
      caffeine: 'regular'
    };
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    document.querySelectorAll('.quiz-option-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        if (window.MaisonAudio) window.MaisonAudio.playTactileClick();
        const parent = btn.closest('.quiz-step');
        parent.querySelectorAll('.quiz-option-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');

        const key = btn.dataset.key;
        const val = btn.dataset.val;
        this.answers[key] = val;

        setTimeout(() => this.nextStep(), 250);
      });
    });

    const resetBtn = document.getElementById('btnResetQuiz');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.resetQuiz());
    }
  }

  nextStep() {
    const currentEl = document.querySelector(`.quiz-step[data-step="${this.currentStep}"]`);
    if (currentEl) currentEl.style.display = 'none';

    this.currentStep++;
    const nextEl = document.querySelector(`.quiz-step[data-step="${this.currentStep}"]`);

    if (nextEl) {
      nextEl.style.display = 'block';
    } else {
      this.calculateRecommendation();
    }
  }

  resetQuiz() {
    if (window.MaisonAudio) window.MaisonAudio.playTactileClick();
    this.currentStep = 1;
    document.querySelectorAll('.quiz-step').forEach(step => {
      step.style.display = step.dataset.step === '1' ? 'block' : 'none';
      step.querySelectorAll('.quiz-option-btn').forEach(b => b.classList.remove('selected'));
    });
    const resultEl = document.getElementById('quizResultContainer');
    if (resultEl) resultEl.style.display = 'none';
  }

  calculateRecommendation() {
    if (window.MaisonAudio) window.MaisonAudio.playHarmonicChime();
    let matchId = 'lot-001-geisha';

    if (this.answers.caffeine === 'low' || this.answers.note === 'sweet') {
      matchId = 'lot-003-eugenioides';
    } else if (this.answers.note === 'spicy' || this.answers.note === 'cacao') {
      matchId = 'lot-002-sudan-rume';
    } else if (this.answers.note === 'fruity' || this.answers.note === 'citrus') {
      matchId = 'lot-004-pink-bourbon';
    }

    const matchedProduct = COFFEE_CATALOG.find(p => p.id === matchId);
    const resultEl = document.getElementById('quizResultContainer');
    const contentEl = document.getElementById('quizResultContent');

    if (resultEl && contentEl && matchedProduct) {
      contentEl.innerHTML = `
        <div style="background: rgba(31, 26, 23, 0.9); border: 1px solid var(--color-gold); border-radius: var(--radius-lg); padding: var(--space-2xl); text-align: center;">
          <div style="font-family: var(--font-mono); font-size: 11px; color: var(--color-gold); letter-spacing: 0.15em; margin-bottom: 4px;">
            [ YOUR SENSORY ARCHETYPE MATCH ]
          </div>
          <h3 style="font-family: var(--font-display); font-size: 2rem; color: #ffffff; margin-bottom: 6px;">
            ${matchedProduct.name}
          </h3>
          <p style="font-family: var(--font-mono); font-size: 12px; color: var(--color-gold-bright); margin-bottom: var(--space-md);">
            ${matchedProduct.lotNumber} • ${matchedProduct.altitude} • SCA ${matchedProduct.scaScore}
          </p>
          <p style="font-size: 14px; color: var(--color-text-subtle); max-width: 500px; margin: 0 auto var(--space-lg); line-height: 1.6;">
            ${matchedProduct.description}
          </p>
          <div style="display: flex; gap: 12px; justify-content: center;">
            <button class="btn-glass-primary" onclick="window.MaisonCart.addItem(COFFEE_CATALOG.find(p=>p.id==='${matchedProduct.id}'))">
              Add to Atelier Box ($${matchedProduct.price.toFixed(2)})
            </button>
            <button class="btn-glass-secondary" onclick="window.MaisonCatalog.openSensoryModal(COFFEE_CATALOG.find(p=>p.id==='${matchedProduct.id}'))">
              Inspect Sensory Radar
            </button>
          </div>
        </div>
      `;
      resultEl.style.display = 'block';
    }
  }
}

window.MaisonQuiz = new MaisonPalateQuiz();

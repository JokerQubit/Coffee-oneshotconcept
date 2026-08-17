/* ==========================================================================
   MAISON PUR & — PRIVATE TASTING ATELIER & SENSORY OMAKASE BOOKING
   ========================================================================== */

const TASTING_EXPERIENCES = {
  geisha_trilogy: {
    title: 'The Geisha Trilogy',
    duration: '90 Minutes',
    pricePerPerson: 120,
    description: 'A vertical comparative flight of 3 rare Geisha harvests: Washed, Honey Anaerobic, and 120h Carbonic Maceration.'
  },
  thermal_odyssey: {
    title: 'Thermal Shock & Anaerobic Odyssey',
    duration: '75 Minutes',
    pricePerPerson: 95,
    description: 'Exploration of bio-reactor microbial fermentation dynamics across high-altitude Colombian and Panamanian terroirs.'
  },
  ancestor_masterclass: {
    title: 'Rare Ancestor Eugenioides Masterclass',
    duration: '105 Minutes',
    pricePerPerson: 140,
    description: 'An intimate multi-course sensory cupping featuring Coffea Eugenioides, wild Sudan Rume, and bespoke water mineral profiles.'
  }
};

class MaisonBookingEngine {
  constructor() {
    this.form = document.getElementById('tastingBookingForm');
  }

  init() {
    if (!this.form) return;
    this.bindEvents();
    this.updatePriceEstimate();
  }

  bindEvents() {
    const tierSelect = document.getElementById('bookingTier');
    const guestsSelect = document.getElementById('bookingGuests');

    if (tierSelect) {
      tierSelect.addEventListener('change', () => this.updatePriceEstimate());
    }

    if (guestsSelect) {
      guestsSelect.addEventListener('change', () => this.updatePriceEstimate());
    }

    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleBookingSubmit();
    });
  }

  updatePriceEstimate() {
    const tierKey = document.getElementById('bookingTier')?.value || 'geisha_trilogy';
    const guests = parseInt(document.getElementById('bookingGuests')?.value || '2', 10);
    const tier = TASTING_EXPERIENCES[tierKey];

    const total = tier.pricePerPerson * guests;
    const priceDisplay = document.getElementById('bookingEstimatedTotal');
    if (priceDisplay) {
      priceDisplay.textContent = `$${total.toFixed(2)}`;
    }
  }

  handleBookingSubmit() {
    const name = document.getElementById('bookingName')?.value;
    const email = document.getElementById('bookingEmail')?.value;
    const date = document.getElementById('bookingDate')?.value;
    const time = document.getElementById('bookingTime')?.value;
    const tierKey = document.getElementById('bookingTier')?.value;
    const guests = document.getElementById('bookingGuests')?.value;
    const notes = document.getElementById('bookingNotes')?.value;

    const tier = TASTING_EXPERIENCES[tierKey];
    const total = tier.pricePerPerson * parseInt(guests, 10);
    const bookingRef = 'MP-' + Math.floor(100000 + Math.random() * 900000);

    if (window.MaisonAudio) window.MaisonAudio.playHarmonicChime();

    // Show Confirmation Modal
    const modal = document.getElementById('bookingConfirmationModal');
    const content = document.getElementById('bookingConfirmationContent');

    if (modal && content) {
      content.innerHTML = `
        <div style="text-align: center;">
          <div style="font-family: var(--font-mono); font-size: var(--text-xs); color: var(--color-gold); letter-spacing: 0.2em; margin-bottom: var(--space-xs);">
            [ PRIVATE ATELIER CONFIRMATION ]
          </div>
          <h2 style="font-family: var(--font-display); font-size: 2.2rem; margin-bottom: var(--space-sm);">
            Your Reservation is Confirmed
          </h2>
          <p style="font-size: var(--text-sm); color: var(--color-text-subtle); margin-bottom: var(--space-xl);">
            A bespoke confirmation and preparatory palate guide have been dispatched to <strong>${email}</strong>.
          </p>

          <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(198, 156, 109, 0.3); border-radius: var(--radius-lg); padding: var(--space-xl); text-align: left; margin-bottom: var(--space-xl);">
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: var(--space-xs); margin-bottom: var(--space-sm);">
              <span style="font-family: var(--font-mono); font-size: 11px; color: var(--color-text-subtle);">BOOKING REF:</span>
              <span style="font-family: var(--font-mono); font-size: 12px; color: var(--color-gold-bright); font-weight: 700;">${bookingRef}</span>
            </div>
            <div style="font-family: var(--font-display); font-size: 1.25rem; font-weight: 700; color: #ffffff; margin-bottom: 4px;">
              ${tier.title}
            </div>
            <div style="font-size: 13px; color: var(--color-text-subtle); margin-bottom: var(--space-md);">
              ${tier.duration} • ${guests} Guest(s) • $${total.toFixed(2)} Total
            </div>
            <div style="font-family: var(--font-mono); font-size: 12px; color: var(--color-gold-light);">
              📅 ${date} at ${time} • Salon Haute Cuvée (Zurich Atelier)
            </div>
          </div>

          <button class="btn-glass-primary" onclick="document.getElementById('bookingConfirmationModal').classList.remove('active');">
            Acknowledge & Close
          </button>
        </div>
      `;
      modal.classList.add('active');
    }

    if (window.MaisonApp) {
      window.MaisonApp.showToast(`Reservation ${bookingRef} secured for ${name}`);
    }

    this.form.reset();
    this.updatePriceEstimate();
  }
}

window.MaisonBooking = new MaisonBookingEngine();

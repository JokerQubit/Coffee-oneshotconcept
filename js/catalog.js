/* ==========================================================================
   MAISON PUR & — TERROIR & MICRO-LOT SENSORY CATALOG
   ========================================================================== */

const COFFEE_CATALOG = [
  {
    id: 'lot-001-geisha',
    lotNumber: 'CUVÉE NO. 001',
    name: 'Panama Volcán Barú Geisha',
    varietal: 'Green Tip Geisha',
    category: 'geisha',
    origin: 'Boquete, Chiriquí — Panama',
    altitude: '2,150 MASL',
    process: 'Anaerobic Slow Dry (120h)',
    scaScore: 94.8,
    price: 68.00,
    unit: '250g Tin / Whole Bean',
    accentColor: '#c69c6d',
    flavorNotes: ['White Jasmine', 'Bergamot', 'Meyer Lemon', 'White Peach'],
    description: 'Harvested on the volcanic slopes of Volcán Barú during peak dry season. Features an ethereal floral fragrance of blooming jasmine and crystalline stone fruit brightness with tea-like silky texture.',
    radar: {
      florality: 98,
      acidity: 92,
      sweetness: 94,
      body: 84,
      cleanliness: 99,
      complexity: 96
    },
    roastProfile: 'Ultra-Light Convective Roast (Agtron 88)'
  },
  {
    id: 'lot-002-sudan-rume',
    lotNumber: 'CUVÉE NO. 002',
    name: 'Colombia Inmaculada Sudan Rume',
    varietal: 'Wild Sudan Rume Heirloom',
    category: 'rare',
    origin: 'Pichindé, Valle del Cauca — Colombia',
    altitude: '1,980 MASL',
    process: 'Lactic Controlled Fermentation',
    scaScore: 93.5,
    price: 54.00,
    unit: '250g Tin / Whole Bean',
    accentColor: '#d4a373',
    flavorNotes: ['Cardamom', 'Wild Strawberry', 'Dark Cacao Nibs', 'Lemongrass'],
    description: 'An ancient wild heirloom varietal cultivated in rich volcanic soil. Extremely low yielding with intense botanical complexity, warm spice aromatics, and a dense velvety body.',
    radar: {
      florality: 88,
      acidity: 86,
      sweetness: 92,
      body: 94,
      cleanliness: 95,
      complexity: 98
    },
    roastProfile: 'Light Convective Thermal (Agtron 82)'
  },
  {
    id: 'lot-003-eugenioides',
    lotNumber: 'CUVÉE NO. 003',
    name: 'Valle del Cauca Eugenioides',
    varietal: 'Coffea Eugenioides (Rare Ancestor)',
    category: 'rare',
    origin: 'Cali Mountain Range — Colombia',
    altitude: '1,850 MASL',
    process: 'Carbonic Maceration (Natural)',
    scaScore: 92.8,
    price: 62.00,
    unit: '200g Tin / Whole Bean',
    accentColor: '#dfbe99',
    flavorNotes: ['Marshmallow', 'Pink Guava', 'Lychee Blossom', 'Raw Honey'],
    description: 'The ancient botanical mother species of Coffea Arabica. Ultra-low natural caffeine (0.2%), extraordinary natural sugary sweetness, tasting like toasted marshmallow and exotic tropical nectar.',
    radar: {
      florality: 92,
      acidity: 78,
      sweetness: 100,
      body: 86,
      cleanliness: 92,
      complexity: 95
    },
    roastProfile: 'Scandinavian Micro-Curve (Agtron 86)'
  },
  {
    id: 'lot-004-pink-bourbon',
    lotNumber: 'CUVÉE NO. 004',
    name: 'Huila Reserve Pink Bourbon',
    varietal: 'Pink Bourbon (Hybrid Mutated)',
    category: 'anaerobic',
    origin: 'San Adolfo, Huila — Colombia',
    altitude: '2,050 MASL',
    process: 'Thermal Shock Double Washed',
    scaScore: 91.2,
    price: 46.00,
    unit: '250g Tin / Whole Bean',
    accentColor: '#c49767',
    flavorNotes: ['Pink Grapefruit', 'Red Currant', 'Raw Cane Sugar', 'Silky Body'],
    description: 'Cultivated under high canopy shade. The rare pink ripe cherries undergo thermal shock treatment to lock in vibrant malic acidity, sparkling citrus luminosity, and crisp floral clarity.',
    radar: {
      florality: 85,
      acidity: 94,
      sweetness: 90,
      body: 88,
      cleanliness: 96,
      complexity: 91
    },
    roastProfile: 'Light-Medium Precision Roast (Agtron 79)'
  }
];

class MaisonCatalogEngine {
  constructor() {
    this.currentFilter = 'all';
    this.container = document.getElementById('harvestsCardsGrid');
  }

  init() {
    this.render();
    this.bindFilterEvents();
  }

  bindFilterEvents() {
    const filterBtns = document.querySelectorAll('.filter-pill-btn');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        if (window.MaisonAudio) window.MaisonAudio.playTactileClick();
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentFilter = btn.dataset.filter;
        this.render();
      });
    });
  }

  render() {
    if (!this.container) return;

    const filtered = this.currentFilter === 'all'
      ? COFFEE_CATALOG
      : COFFEE_CATALOG.filter(item => item.category === this.currentFilter);

    this.container.innerHTML = filtered.map(item => `
      <article class="glass-product-card dark-theme" data-id="${item.id}">
        <div class="product-card-top-meta">
          <span class="product-lot-number">${item.lotNumber}</span>
          <span class="sca-score-badge">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
            SCA ${item.scaScore}
          </span>
        </div>

        <div class="product-art-preview">
          <svg width="120" height="120" viewBox="0 0 100 100" fill="none" stroke="${item.accentColor}" stroke-width="1.2">
            <circle cx="50" cy="50" r="42" stroke-opacity="0.25" stroke-dasharray="3 3"/>
            <circle cx="50" cy="50" r="30" stroke-opacity="0.45"/>
            <polygon points="50,15 80,68 20,68" stroke-opacity="0.8" fill="rgba(198, 156, 109, 0.08)"/>
            <line x1="50" y1="15" x2="50" y2="85" stroke-opacity="0.3"/>
            <circle cx="50" cy="50" r="6" fill="${item.accentColor}"/>
          </svg>
        </div>

        <h3 class="product-title">${item.name}</h3>
        <p class="product-origin-altitude">${item.origin} • ${item.altitude}</p>

        <div class="flavor-tags-wrap">
          ${item.flavorNotes.map(note => `<span class="flavor-tag-pill">${note}</span>`).join('')}
        </div>

        <div class="product-card-footer">
          <div>
            <span class="product-price-tag">$${item.price.toFixed(2)}</span>
            <span style="font-size: 11px; color: var(--color-text-subtle); display: block;">${item.unit}</span>
          </div>

          <div style="display: flex; gap: 8px;">
            <button class="btn-glass-secondary btn-sensory-modal" data-id="${item.id}" style="padding: 0.6rem 1rem; font-size: 12px;" title="View Sensory Radar">
              Radar
            </button>
            <button class="btn-glass-primary btn-add-cart" data-id="${item.id}" style="padding: 0.6rem 1.25rem; font-size: 12px;">
              + Reserve
            </button>
          </div>
        </div>
      </article>
    `).join('');

    this.bindCardActions();
  }

  bindCardActions() {
    // Sound effect on hover card
    this.container.querySelectorAll('.glass-product-card').forEach(card => {
      card.addEventListener('mouseenter', () => {
        if (window.MaisonAudio) window.MaisonAudio.playSFX('beans');
      });
    });

    // Add to Cart
    this.container.querySelectorAll('.btn-add-cart').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        const product = COFFEE_CATALOG.find(p => p.id === id);
        if (window.MaisonCart && product) {
          window.MaisonCart.addItem(product);
        }
      });
    });

    // View Sensory Radar Modal
    this.container.querySelectorAll('.btn-sensory-modal').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        const product = COFFEE_CATALOG.find(p => p.id === id);
        if (product) {
          this.openSensoryModal(product);
        }
      });
    });
  }

  generateRadarSVG(radar) {
    const size = 260;
    const center = size / 2;
    const radius = 95;
    const keys = ['florality', 'acidity', 'sweetness', 'body', 'cleanliness', 'complexity'];
    const labels = ['Florality', 'Acidity', 'Sweetness', 'Body', 'Cleanliness', 'Complexity'];
    const count = keys.length;

    let circlesSVG = '';
    [0.25, 0.5, 0.75, 1.0].forEach(r => {
      circlesSVG += `<circle cx="${center}" cy="${center}" r="${radius * r}" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>`;
    });

    let spokesSVG = '';
    let polygonPoints = [];

    keys.forEach((key, index) => {
      const angle = (Math.PI * 2 / count) * index - (Math.PI / 2);
      const x = center + radius * Math.cos(angle);
      const y = center + radius * Math.sin(angle);
      spokesSVG += `<line x1="${center}" y1="${center}" x2="${x}" y2="${y}" stroke="rgba(255,255,255,0.18)" stroke-width="1"/>`;

      const labelX = center + (radius + 24) * Math.cos(angle);
      const labelY = center + (radius + 18) * Math.sin(angle);
      spokesSVG += `<text x="${labelX}" y="${labelY}" fill="#dfbe99" font-size="10" font-family="JetBrains Mono" text-anchor="middle" dominant-baseline="middle">${labels[index]}</text>`;

      const valRatio = radar[key] / 100;
      const dataX = center + (radius * valRatio) * Math.cos(angle);
      const dataY = center + (radius * valRatio) * Math.sin(angle);
      polygonPoints.push(`${dataX},${dataY}`);
    });

    const polygonSVG = `<polygon points="${polygonPoints.join(' ')}" fill="rgba(198, 156, 109, 0.35)" stroke="#c69c6d" stroke-width="2"/>`;

    return `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        ${circlesSVG}
        ${spokesSVG}
        ${polygonSVG}
      </svg>
    `;
  }

  openSensoryModal(product) {
    if (window.MaisonAudio) window.MaisonAudio.playTactileClick();
    const modal = document.getElementById('sensoryDetailModal');
    const modalBody = document.getElementById('sensoryModalContent');
    if (!modal || !modalBody) return;

    modalBody.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3xl); align-items: center;">
        <div>
          <div class="tech-meta-badge" style="margin-bottom: var(--space-xs);">
            <span class="bracket">[</span> ${product.lotNumber} • ${product.altitude} <span class="bracket">]</span>
          </div>
          <h2 style="font-family: var(--font-display); font-size: 2.2rem; margin-bottom: var(--space-xs); line-height: 1.1;">
            ${product.name}
          </h2>
          <p style="font-family: var(--font-mono); font-size: var(--text-xs); color: var(--color-gold); margin-bottom: var(--space-lg);">
            ${product.varietal} • ${product.process}
          </p>

          <p style="font-size: var(--text-sm); line-height: 1.6; color: var(--color-text-subtle); margin-bottom: var(--space-xl);">
            ${product.description}
          </p>

          <div style="background: rgba(255,255,255,0.04); padding: var(--space-md); border-radius: var(--radius-md); margin-bottom: var(--space-xl); border: 1px solid rgba(255,255,255,0.08);">
            <div style="font-size: 11px; font-family: var(--font-mono); color: var(--color-gold-bright); margin-bottom: 4px;">ROAST PROFILE:</div>
            <div style="font-size: var(--text-sm);">${product.roastProfile}</div>
          </div>

          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div>
              <span style="font-family: var(--font-display); font-size: 1.75rem; font-weight: 700; color: var(--color-gold-bright);">$${product.price.toFixed(2)}</span>
              <span style="font-size: 11px; color: var(--color-text-subtle); display: block;">${product.unit}</span>
            </div>
            <button class="btn-glass-primary" onclick="window.MaisonCart.addItem(COFFEE_CATALOG.find(p=>p.id==='${product.id}')); window.MaisonCatalog.closeSensoryModal();">
              Add to Atelier Box
            </button>
          </div>
        </div>

        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(0,0,0,0.3); border-radius: var(--radius-lg); padding: var(--space-xl); border: 1px solid rgba(255,255,255,0.06);">
          <div style="font-family: var(--font-mono); font-size: var(--text-xs); letter-spacing: 0.15em; color: var(--color-gold); margin-bottom: var(--space-md);">
            SENSORY RADAR MAP (SCA ${product.scaScore})
          </div>
          ${this.generateRadarSVG(product.radar)}
        </div>
      </div>
    `;

    modal.classList.add('active');
  }

  closeSensoryModal() {
    const modal = document.getElementById('sensoryDetailModal');
    if (modal) modal.classList.remove('active');
  }
}

window.MaisonCatalog = new MaisonCatalogEngine();

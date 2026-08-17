/* ==========================================================================
   MAISON PUR & — SHOPPING CART & PRIVATE CLIENTELE CHECKOUT
   ========================================================================== */

class MaisonCartEngine {
  constructor() {
    this.items = JSON.parse(localStorage.getItem('maison_cart_items') || '[]');
    this.discountCode = null;
    this.discountPercent = 0;
    this.drawer = document.getElementById('cartDrawer');
    this.badge = document.getElementById('cartBadgeCount');
  }

  init() {
    this.bindEvents();
    this.updateUI();
  }

  bindEvents() {
    // Open drawer triggers
    const triggers = document.querySelectorAll('.cart-trigger-btn, .btn-open-cart');
    triggers.forEach(btn => {
      btn.addEventListener('click', () => this.openDrawer());
    });

    // Close drawer
    const closeBtn = document.getElementById('closeCartDrawer');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeDrawer());
    }

    // Apply Coupon
    const couponBtn = document.getElementById('btnApplyCoupon');
    const couponInput = document.getElementById('couponCodeInput');
    if (couponBtn && couponInput) {
      couponBtn.addEventListener('click', () => {
        const code = couponInput.value.trim().toUpperCase();
        if (code === 'MAISON10') {
          this.discountCode = code;
          this.discountPercent = 0.10;
          if (window.MaisonApp) window.MaisonApp.showToast('Privilege Code MAISON10 applied (10% Off)');
          if (window.MaisonAudio) window.MaisonAudio.playHarmonicChime();
        } else if (code === 'TERROIR20') {
          this.discountCode = code;
          this.discountPercent = 0.20;
          if (window.MaisonApp) window.MaisonApp.showToast('Privilege Code TERROIR20 applied (20% Off)');
          if (window.MaisonAudio) window.MaisonAudio.playHarmonicChime();
        } else {
          if (window.MaisonApp) window.MaisonApp.showToast('Invalid privilege code');
        }
        this.updateUI();
      });
    }

    // Checkout Button
    const checkoutBtn = document.getElementById('btnProceedCheckout');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => this.handleCheckout());
    }
  }

  openDrawer() {
    if (window.MaisonAudio) window.MaisonAudio.playTactileClick();
    if (this.drawer) this.drawer.classList.add('open');
  }

  closeDrawer() {
    if (window.MaisonAudio) window.MaisonAudio.playTactileClick();
    if (this.drawer) this.drawer.classList.remove('open');
  }

  addItem(product, grind = 'Whole Bean', subscription = 'onetime') {
    const existingIndex = this.items.findIndex(i => i.id === product.id && i.grind === grind && i.subscription === subscription);

    if (existingIndex > -1) {
      this.items[existingIndex].quantity += 1;
    } else {
      this.items.push({
        id: product.id,
        name: product.name,
        lotNumber: product.lotNumber,
        price: product.price,
        unit: product.unit,
        grind: grind,
        subscription: subscription,
        quantity: 1
      });
    }

    this.save();
    this.updateUI();
    this.openDrawer();
    if (window.MaisonAudio) window.MaisonAudio.playHarmonicChime();
    if (window.MaisonApp) window.MaisonApp.showToast(`Allocated ${product.name} to Atelier Box`);
  }

  updateQuantity(index, delta) {
    if (!this.items[index]) return;
    this.items[index].quantity += delta;
    if (this.items[index].quantity <= 0) {
      this.items.splice(index, 1);
    }
    this.save();
    this.updateUI();
    if (window.MaisonAudio) window.MaisonAudio.playTactileClick();
  }

  removeItem(index) {
    if (!this.items[index]) return;
    this.items.splice(index, 1);
    this.save();
    this.updateUI();
    if (window.MaisonAudio) window.MaisonAudio.playTactileClick();
  }

  save() {
    localStorage.setItem('maison_cart_items', JSON.stringify(this.items));
  }

  updateUI() {
    // Badge count
    const totalCount = this.items.reduce((sum, item) => sum + item.quantity, 0);
    if (this.badge) {
      this.badge.textContent = totalCount;
    }

    // Body container
    const cartBody = document.getElementById('cartDrawerItemsList');
    if (!cartBody) return;

    if (this.items.length === 0) {
      cartBody.innerHTML = `
        <div style="text-align: center; padding: var(--space-4xl) var(--space-md); color: var(--color-text-subtle);">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(198,156,109,0.4)" stroke-width="1.2" style="margin: 0 auto var(--space-md);">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 8v4l3 3"/>
          </svg>
          <div style="font-family: var(--font-display); font-size: 1.15rem; color: #ffffff; margin-bottom: 4px;">Your Atelier Box is Empty</div>
          <p style="font-size: 13px;">Curate your private harvest allocations from our Reserve list.</p>
        </div>
      `;
    } else {
      cartBody.innerHTML = this.items.map((item, index) => `
        <div style="display: flex; gap: var(--space-md); padding: var(--space-md) 0; border-bottom: 1px solid rgba(255,255,255,0.06); align-items: center;">
          <div style="flex: 1;">
            <div style="font-family: var(--font-mono); font-size: 10px; color: var(--color-gold);">${item.lotNumber}</div>
            <div style="font-family: var(--font-display); font-size: 14px; font-weight: 700; color: #ffffff;">${item.name}</div>
            <div style="font-size: 11px; color: var(--color-text-subtle);">${item.grind} • ${item.unit}</div>
            <div style="font-family: var(--font-mono); font-size: 13px; color: var(--color-gold-bright); margin-top: 4px;">
              $${(item.price * item.quantity).toFixed(2)}
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 6px; background: rgba(255,255,255,0.06); border-radius: var(--radius-pill); padding: 2px 8px;">
            <button onclick="window.MaisonCart.updateQuantity(${index}, -1)" style="background: none; border: none; color: #ffffff; cursor: pointer; font-size: 14px;">-</button>
            <span style="font-family: var(--font-mono); font-size: 12px; min-width: 14px; text-align: center;">${item.quantity}</span>
            <button onclick="window.MaisonCart.updateQuantity(${index}, 1)" style="background: none; border: none; color: #ffffff; cursor: pointer; font-size: 14px;">+</button>
          </div>

          <button onclick="window.MaisonCart.removeItem(${index})" style="background: none; border: none; color: rgba(255,255,255,0.3); cursor: pointer; padding: 4px;" title="Remove">
            &times;
          </button>
        </div>
      `).join('');
    }

    // Calculations
    const subtotal = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discountAmount = subtotal * this.discountPercent;
    const shipping = subtotal > 100 || subtotal === 0 ? 0 : 12.00;
    const total = Math.max(0, subtotal - discountAmount + shipping);

    const subtotalEl = document.getElementById('cartSubtotalAmount');
    const discountEl = document.getElementById('cartDiscountAmount');
    const shippingEl = document.getElementById('cartShippingAmount');
    const totalEl = document.getElementById('cartTotalAmount');

    if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    if (discountEl) discountEl.textContent = discountAmount > 0 ? `-$${discountAmount.toFixed(2)} (${this.discountCode})` : '$0.00';
    if (shippingEl) shippingEl.textContent = shipping === 0 ? 'Complimentary' : `$${shipping.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;
  }

  handleCheckout() {
    if (this.items.length === 0) {
      if (window.MaisonApp) window.MaisonApp.showToast('Please add at least one micro-lot before checkout');
      return;
    }

    const orderId = 'ORD-MP-' + Math.floor(100000 + Math.random() * 900000);
    const totalAmount = document.getElementById('cartTotalAmount')?.textContent || '$0.00';

    if (window.MaisonAudio) window.MaisonAudio.playHarmonicChime();

    // Open Order Provenance Certificate Modal
    const modal = document.getElementById('bookingConfirmationModal');
    const content = document.getElementById('bookingConfirmationContent');

    if (modal && content) {
      content.innerHTML = `
        <div style="text-align: center;">
          <div style="font-family: var(--font-mono); font-size: var(--text-xs); color: var(--color-gold); letter-spacing: 0.2em; margin-bottom: var(--space-xs);">
            [ PROVENANCE ORDER CERTIFICATE ]
          </div>
          <h2 style="font-family: var(--font-display); font-size: 2.2rem; margin-bottom: var(--space-sm);">
            Order Dispatched to Roastery
          </h2>
          <p style="font-size: var(--text-sm); color: var(--color-text-subtle); margin-bottom: var(--space-xl);">
            Your rare harvest allocations have been queued for convective roasting and nitrogen-purged hermetic sealing.
          </p>

          <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(198, 156, 109, 0.3); border-radius: var(--radius-lg); padding: var(--space-xl); text-align: left; margin-bottom: var(--space-xl);">
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: var(--space-xs); margin-bottom: var(--space-sm);">
              <span style="font-family: var(--font-mono); font-size: 11px; color: var(--color-text-subtle);">ORDER DISPATCH:</span>
              <span style="font-family: var(--font-mono); font-size: 12px; color: var(--color-gold-bright); font-weight: 700;">${orderId}</span>
            </div>
            <div style="font-family: var(--font-mono); font-size: 11px; color: var(--color-gold-light); margin-bottom: 8px;">
              BLOCKCHAIN PROVENANCE HASH:
              <div style="word-break: break-all; opacity: 0.7; font-size: 10px;">0x7fe47d5c2ff44ae7aaa8fca64940c011b98a4421</div>
            </div>
            <div style="font-family: var(--font-display); font-size: 1.15rem; color: #ffffff; margin-top: var(--space-sm);">
              Total Settled: ${totalAmount}
            </div>
          </div>

          <button class="btn-glass-primary" onclick="window.MaisonCart.items = []; window.MaisonCart.save(); window.MaisonCart.updateUI(); window.MaisonCart.closeDrawer(); document.getElementById('bookingConfirmationModal').classList.remove('active');">
            Complete & Download Certificate
          </button>
        </div>
      `;
      modal.classList.add('active');
    }

    if (window.MaisonApp) {
      window.MaisonApp.showToast(`Order ${orderId} successfully registered`);
    }
  }
}

window.MaisonCart = new MaisonCartEngine();

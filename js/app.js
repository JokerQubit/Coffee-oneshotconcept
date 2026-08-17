/* ==========================================================================
   MAISON PUR & — MASTER APPLICATION COORDINATOR
   ========================================================================== */

class MaisonAppEngine {
  constructor() {
    this.header = document.querySelector('.site-header');
    this.toastContainer = document.getElementById('toastContainer');
  }

  init() {
    // Initialize 3D Spatial Engine & Subsystems
    if (window.Maison3DAtelier) window.Maison3DAtelier.init();
    if (window.MaisonCatalog) window.MaisonCatalog.init();
    if (window.MaisonQuiz) window.MaisonQuiz.init();
    if (window.MaisonBrewLab) window.MaisonBrewLab.init();
    if (window.MaisonBooking) window.MaisonBooking.init();
    if (window.MaisonCart) window.MaisonCart.init();

    this.bindGlobalEvents();
    this.initScrollObservers();
    this.initHeroCanvasAtmosphere();
  }

  bindGlobalEvents() {
    // Header Scroll State
    window.addEventListener('scroll', () => {
      if (window.scrollY > 60) {
        this.header?.classList.add('scrolled');
      } else {
        this.header?.classList.remove('scrolled');
      }
    });

    // Modal Close buttons
    document.querySelectorAll('.modal-close-btn, .modal-backdrop-overlay').forEach(el => {
      el.addEventListener('click', (e) => {
        if (e.target === el) {
          document.querySelectorAll('.modal-backdrop-overlay').forEach(m => m.classList.remove('active'));
        }
      });
    });

    // Smooth Scroll Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  initScrollObservers() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            if (link.getAttribute('href') === `#${id}`) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        }
      });
    }, { threshold: 0.35 });

    sections.forEach(sec => observer.observe(sec));
  }

  initHeroCanvasAtmosphere() {
    const canvas = document.getElementById('heroAtmosphereCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const particleCount = 35;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2 + 0.6,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -Math.random() * 0.4 - 0.1,
        alpha: Math.random() * 0.5 + 0.1
      });
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.y < 0) {
          p.y = height;
          p.x = Math.random() * width;
        }
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(198, 156, 109, ${p.alpha})`;
        ctx.fill();
      });

      requestAnimationFrame(animate);
    }

    animate();
  }

  showToast(message) {
    if (!this.toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.innerHTML = `
      <span style="color: var(--color-gold);">◆</span>
      <span>${message}</span>
    `;
    this.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 350);
    }, 3200);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.MaisonApp = new MaisonAppEngine();
  window.MaisonApp.init();
});

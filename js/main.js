/* =============================================
   nobox.jp — main.js
   ============================================= */

// ── Nav scroll effect ──
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

// ── Mobile nav toggle ──
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

// Close menu on link click
navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => navLinks.classList.remove('open'));
});

// ── Scroll reveal ──
const reveals = document.querySelectorAll(
  '.section-label, .section-title, .service-card, .skill-group, .project-card, .about-text, .about-stats, .stat, .contact-lead, .contact-form'
);

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      // Stagger sibling cards
      const delay = entry.target.dataset.delay || 0;
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, delay);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

reveals.forEach(el => {
  el.classList.add('reveal');
  revealObserver.observe(el);
});

// Stagger cards in grids
document.querySelectorAll('.services-grid .service-card, .projects-grid .project-card, .skills-wrapper .skill-group').forEach((el, i) => {
  el.dataset.delay = (i % 3) * 80;
});

// ── Particle canvas (hero background) ──
(function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function Particle() {
    this.reset();
  }
  Particle.prototype.reset = function () {
    this.x  = Math.random() * W;
    this.y  = Math.random() * H;
    this.r  = Math.random() * 1.5 + 0.4;
    this.vx = (Math.random() - 0.5) * 0.25;
    this.vy = (Math.random() - 0.5) * 0.25;
    this.alpha = Math.random() * 0.5 + 0.1;
  };
  Particle.prototype.update = function () {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < 0 || this.x > W) this.vx *= -1;
    if (this.y < 0 || this.y > H) this.vy *= -1;
  };

  const COUNT = Math.min(120, Math.floor((window.innerWidth * window.innerHeight) / 12000));
  const LINE_DIST = 130;

  function init() {
    resize();
    particles = Array.from({ length: COUNT }, () => new Particle());
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Lines between close particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < LINE_DIST) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          const a = (1 - dist / LINE_DIST) * 0.08;
          ctx.strokeStyle = `rgba(124,111,255,${a})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    // Dots
    particles.forEach(p => {
      p.update();
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(167,139,250,${p.alpha})`;
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }

  const ro = new ResizeObserver(resize);
  ro.observe(canvas.parentElement);

  init();
  draw();
})();

// ── Contact form ──
const form = document.getElementById('contactForm');
if (form) {
  form.addEventListener('submit', async (e) => {
    const btn = form.querySelector('[type="submit"]');
    // If using Formspree or similar, let it handle naturally.
    // Add basic loading state:
    btn.textContent = '送信中...';
    btn.disabled = true;

    // If action URL is placeholder, show a message instead.
    if (form.action.includes('YOUR_FORM_ID')) {
      e.preventDefault();
      btn.textContent = '✓ フォームの設定が必要です';
      setTimeout(() => {
        btn.textContent = '送信する';
        btn.disabled = false;
      }, 3000);
    }
    // Otherwise let the form submit normally to Formspree.
  });
}

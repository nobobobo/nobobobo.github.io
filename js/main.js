/* =============================================
   nobox.jp — main.js
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

  // ── Theme toggle ──
  const themeToggle = document.getElementById('themeToggle');
  const savedTheme  = localStorage.getItem('nobox-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);

  themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next    = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('nobox-theme', next);
  });

  // ── Scroll progress bar ──
  const progressBar = document.getElementById('progressBar');
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    const scrollTop  = window.scrollY;
    const docHeight  = document.documentElement.scrollHeight - window.innerHeight;
    const progress   = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = progress + '%';
    nav.classList.toggle('scrolled', scrollTop > 20);
  }, { passive: true });

  // ── Mobile nav toggle ──
  const navToggle = document.getElementById('navToggle');
  const navLinks  = document.getElementById('navLinks');

  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });

  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => navLinks.classList.remove('open'));
  });

  // ── Scroll reveal ──
  const reveals = document.querySelectorAll(
    '.section-label, .section-title, .service-card, .skill-group, .project-card, .about-text, .about-stats, .stat, .contact-lead, .contact-form'
  );

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const delay = entry.target.dataset.delay || 0;
        setTimeout(() => entry.target.classList.add('visible'), delay);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  reveals.forEach(el => {
    el.classList.add('reveal');
    revealObserver.observe(el);
  });

  document.querySelectorAll('.services-grid .service-card, .projects-grid .project-card, .skills-wrapper .skill-group').forEach((el, i) => {
    el.dataset.delay = (i % 3) * 80;
  });

  // ── Particle canvas ──
  const canvas = document.getElementById('particleCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let W, H, particles;

    function resize() {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    }

    function Particle() { this.reset(); }
    Particle.prototype.reset = function () {
      this.x     = Math.random() * W;
      this.y     = Math.random() * H;
      this.r     = Math.random() * 1.5 + 0.4;
      this.vx    = (Math.random() - 0.5) * 0.25;
      this.vy    = (Math.random() - 0.5) * 0.25;
      this.alpha = Math.random() * 0.5 + 0.1;
    };
    Particle.prototype.update = function () {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > W) this.vx *= -1;
      if (this.y < 0 || this.y > H) this.vy *= -1;
    };

    const COUNT    = Math.min(120, Math.floor((window.innerWidth * window.innerHeight) / 12000));
    const LINE_DIST = 130;

    resize();
    particles = Array.from({ length: COUNT }, () => new Particle());

    new ResizeObserver(resize).observe(canvas.parentElement);

    (function draw() {
      ctx.clearRect(0, 0, W, H);
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < LINE_DIST) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(124,111,255,${(1 - dist / LINE_DIST) * 0.08})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
      particles.forEach(p => {
        p.update();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(167,139,250,${p.alpha})`;
        ctx.fill();
      });
      requestAnimationFrame(draw);
    })();
  }

  // ── Logo strip fade-in ──
  const logoStrip = document.querySelector('.logo-strip-logos');
  if (logoStrip) {
    new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        logoStrip.classList.add('visible');
      }
    }, { threshold: 0.4 }).observe(logoStrip);
  }

  // ── Resume modal ──
  const resumeBtn   = document.getElementById('resumeBtn');
  const resumeModal = document.getElementById('resumeModal');
  const resumeClose = document.getElementById('resumeClose');

  function openModal()  {
    resumeModal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeModal() {
    resumeModal.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (resumeBtn && resumeModal) {
    resumeBtn.addEventListener('click', openModal);
    resumeClose.addEventListener('click', closeModal);
    resumeModal.addEventListener('click', (e) => {
      if (e.target === resumeModal) closeModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });
  }

  // ── Contact form (fetch → inline thank you) ──
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn      = form.querySelector('[type="submit"]');
      const success  = document.getElementById('formSuccess');
      const origText = btn.textContent;

      btn.disabled = true;
      btn.textContent = '…';

      try {
        const res = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { 'Accept': 'application/json' }
        });
        if (res.ok) {
          form.hidden = true;
          success.hidden = false;
        } else {
          throw new Error('send failed');
        }
      } catch {
        btn.disabled = false;
        btn.textContent = origText;
        alert('送信に失敗しました。時間をおいて再度お試しください。');
      }
    });
  }

}); // DOMContentLoaded

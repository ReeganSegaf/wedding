'use strict';

/* ============================================================
   CONSTANTS
============================================================ */
const WEDDING_DATE = new Date('2026-06-07T08:00:00'); // 06 Juni 2026, 08:00 WIB
const SCRATCH_THRESHOLD = 0.90;   // 90% cleared triggers confetti


/* ============================================================
   1. CURTAIN INTRO MODULE
============================================================ */
const CurtainIntro = (() => {

  const curtainLeft  = document.getElementById('curtain-left');
  const curtainRight = document.getElementById('curtain-right');
  const btnOpen      = document.getElementById('btn-open-invitation');
  const introCta     = document.getElementById('intro-cta');
  const introReveal  = document.getElementById('intro-reveal');
  const introScreen  = document.getElementById('intro-screen');
  const mainContent  = document.getElementById('main-content');
  const monogram     = introReveal.querySelector('.intro__monogram');

  let opened = false;

  /** Lock body scroll during intro */
  function lockScroll() {
    document.body.classList.add('no-scroll');
  }

  /** Unlock body scroll after curtains open */
  function unlockScroll() {
    document.body.classList.remove('no-scroll');
  }

  /** Open curtains on button click */
  function openCurtains() {
    if (opened) return;
    opened = true;

    // 1. Hide the CTA button
    introCta.classList.add('is-hidden');

    // Auto-play musik saat undangan dibuka (interaksi user = diizinkan browser)
    const audio = document.getElementById('bg-music');
    const musicBtn = document.getElementById('music-btn');
    if (audio) {
      audio.volume = 0.5;
      audio.play().then(() => {
        // Update tampilan tombol musik jadi "pause"
        const iconPlay  = musicBtn.querySelector('.music-btn__icon--play');
        const iconPause = musicBtn.querySelector('.music-btn__icon--pause');
        musicBtn.setAttribute('aria-pressed', 'true');
        musicBtn.classList.remove('is-paused');
        iconPlay.style.display  = 'none';
        iconPause.style.display = '';
        // Sync state di MusicPlayer
        MusicPlayer.setPlaying(true);
      }).catch(() => {
        // Gagal autoplay (misalnya Safari dengan blokir ketat), biarkan user klik manual
      });
    }

    // Small delay before curtains start moving (cinematic beat)
    setTimeout(() => {

      // 2. Slide curtains open
      curtainLeft.classList.add('is-open');
      curtainRight.classList.add('is-open');

      // 3. Start revealing content behind curtains
      setTimeout(() => {
        introReveal.classList.add('is-visible');
        monogram.classList.add('animate');
      }, 400);

      // 4. After curtains fully open, show main content
      setTimeout(() => {
        unlockScroll();
        revealMainContent();
      }, 1600);

    }, 200);
  }

  /** Fade intro screen out and show main content */
  function revealMainContent() {
    // Show the main content (hidden until now)
    mainContent.style.display = 'block';

    // Small extra delay, then fade in
    setTimeout(() => {
      mainContent.classList.add('is-visible');
      ScrollReveal.init(); // Start observing sections
    }, 200);

    // Remove intro from layout after transition
    setTimeout(() => {
      introScreen.style.display = 'none';
    }, 2400);
  }

  function init() {
    lockScroll();
    btnOpen.addEventListener('click', openCurtains);

    // Keyboard support
    btnOpen.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openCurtains();
      }
    });
  }

  return { init };

})();


/* ============================================================
   2. SCRATCH CARDS MODULE
============================================================ */
const ScratchCards = (() => {

  // Each canvas has a data-value for the hidden date part
  const canvases = document.querySelectorAll('.scratch-canvas');
  const hintEl   = document.getElementById('scratch-hint');

  // Track completion percentage for each canvas
  const completionState = { day: 0, month: 0, year: 0 };
  const completionKeys  = ['day', 'month', 'year'];
  let confettiTriggered = false;

  /**
   * Draw the metallic gold layer on a canvas
   * Uses radial gradients to simulate metallic sheen
   */
  function drawGoldLayer(canvas) {
    const ctx  = canvas.getContext('2d');
    const size = canvas.width; // canvas is square (160x160 internal)

    // 1. Base gold metallic gradient (radial from top-left for sheen)
    const base = ctx.createRadialGradient(
      size * 0.3, size * 0.25, 0,   // inner circle (highlight)
      size * 0.5, size * 0.5, size * 0.75  // outer
    );
    base.addColorStop(0,    '#F0D070');  // bright highlight
    base.addColorStop(0.15, '#D4A83A');  // gold
    base.addColorStop(0.35, '#B8861E');  // mid gold
    base.addColorStop(0.55, '#9C7A2E');  // deep gold
    base.addColorStop(0.75, '#C4973A');  // mid tone
    base.addColorStop(0.9,  '#8A6520');  // shadow
    base.addColorStop(1,    '#705215');  // deep shadow

    // Clip to circle
    ctx.save();
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.clip();

    ctx.fillStyle = base;
    ctx.fillRect(0, 0, size, size);

    // 2. Overlay shine streak (top-left diagonal)
    const shine = ctx.createLinearGradient(0, 0, size * 0.6, size * 0.4);
    shine.addColorStop(0,    'rgba(255,255,200,0.45)');
    shine.addColorStop(0.3,  'rgba(255,240,150,0.25)');
    shine.addColorStop(0.6,  'rgba(255,230,100,0.08)');
    shine.addColorStop(1,    'rgba(255,230,100,0)');

    ctx.fillStyle = shine;
    ctx.fillRect(0, 0, size, size);

    // 3. Subtle texture noise (fine horizontal stripes simulate brushed metal)
    ctx.globalAlpha = 0.06;
    for (let y = 0; y < size; y += 2) {
      ctx.fillStyle = y % 4 === 0
        ? 'rgba(255,255,255,0.4)'
        : 'rgba(0,0,0,0.3)';
      ctx.fillRect(0, y, size, 1);
    }
    ctx.globalAlpha = 1;

    // 4. Inner ring hint (coin-like edge)
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 - 3, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,240,150,0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 5. Fingerprint hint text
    ctx.fillStyle = 'rgba(120,80,10,0.55)';
    ctx.font = `${size * 0.09}px Cormorant Garamond, serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Gosok di sini', size / 2, size / 2 - 8);

    // Small icon
    ctx.font = `${size * 0.12}px serif`;
    ctx.fillText('✦', size / 2, size / 2 + 12);

    ctx.restore();
  }

  /**
   * Calculate percentage of canvas pixels that have been cleared
   */
  function getScratchPercent(canvas) {
    const ctx       = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels    = imageData.data;
    let transparent = 0;

    // Every 4th index = alpha channel
    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] === 0) transparent++;
    }

    return transparent / (canvas.width * canvas.height);
  }

  /**
   * Get canvas-relative coordinates from a pointer/touch event
   */
  function getPos(canvas, e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width  / rect.width;
    const scaleY = canvas.height / rect.height;

    // Support both mouse and touch
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top)  * scaleY,
    };
  }

  /**
   * Apply scratch erase effect at position (x,y) on a canvas
   */
  function scratch(canvas, x, y) {
    const ctx    = canvas.getContext('2d');
    const radius = canvas.width * 0.12; // finger-friendly radius

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
  }

  /**
   * Check if all circles are ≥ 90% revealed; trigger confetti if so
   */
  function checkAllRevealed() {
    const allDone = Object.values(completionState).every(
      (pct) => pct >= SCRATCH_THRESHOLD
    );

    if (allDone && !confettiTriggered) {
      confettiTriggered = true;
      hintEl.classList.add('is-revealed');
      Confetti.launch();
    }
  }

  /**
   * Set up scratch interaction for a single canvas
   */
  function initCanvas(canvas, key) {
    drawGoldLayer(canvas);

    let isScratching = false;

    // ——— Pointer / Mouse events ———
    canvas.addEventListener('pointerdown', (e) => {
      isScratching = true;
      e.preventDefault();
      const pos = getPos(canvas, e);
      scratch(canvas, pos.x, pos.y);
    });

    canvas.addEventListener('pointermove', (e) => {
      if (!isScratching) return;
      e.preventDefault();
      const pos = getPos(canvas, e);
      scratch(canvas, pos.x, pos.y);

      // Update completion every ~5 pixels of movement
      const pct = getScratchPercent(canvas);
      completionState[key] = pct;
      checkAllRevealed();

      // Fade canvas once threshold reached
      if (pct >= SCRATCH_THRESHOLD && canvas.style.opacity !== '0') {
        canvas.style.transition = 'opacity 0.8s ease';
        canvas.style.opacity = '0';
        canvas.style.pointerEvents = 'none';
      }
    });

    canvas.addEventListener('pointerup',    () => { isScratching = false; });
    canvas.addEventListener('pointerleave', () => { isScratching = false; });

    // ——— Touch events (fallback for older mobile) ———
    canvas.addEventListener('touchstart', (e) => {
      isScratching = true;
      e.preventDefault();
      const pos = getPos(canvas, e);
      scratch(canvas, pos.x, pos.y);
    }, { passive: false });

    canvas.addEventListener('touchmove', (e) => {
      if (!isScratching) return;
      e.preventDefault();
      const pos = getPos(canvas, e);
      scratch(canvas, pos.x, pos.y);

      const pct = getScratchPercent(canvas);
      completionState[key] = pct;
      checkAllRevealed();

      if (pct >= SCRATCH_THRESHOLD && canvas.style.opacity !== '0') {
        canvas.style.transition = 'opacity 0.8s ease';
        canvas.style.opacity = '0';
        canvas.style.pointerEvents = 'none';
      }
    }, { passive: false });

    canvas.addEventListener('touchend', () => { isScratching = false; });
  }

  function init() {
    canvases.forEach((canvas, i) => {
      // Set actual canvas internal resolution (matches display)
      const wrapper = canvas.parentElement;
      const size    = Math.round(wrapper.offsetWidth || 160);
      canvas.width  = size;
      canvas.height = size;

      initCanvas(canvas, completionKeys[i]);
    });
  }

  return { init };

})();


/* ============================================================
   3. CONFETTI MODULE (Section-scoped, lightweight)
============================================================ */
const Confetti = (() => {

  const canvas  = document.getElementById('confetti-canvas');
  const ctx     = canvas.getContext('2d');
  const section = document.getElementById('reveal-date');

  // Color palette: burgundy + gold shades
  const COLORS = [
    '#6B1A2A', '#8B2E3E', '#4A0E1A',  // burgundy shades
    '#9C7A2E', '#C4973A', '#D4B86A',  // gold shades
    '#F0D070', '#B8861E',              // bright gold
  ];

  let particles = [];
  let animId    = null;
  let running   = false;
  let stopAfter = 4000; // ms of confetti before natural fade
  let startTime = null;

  /** Create one confetti particle */
  function createParticle() {
    return {
      x:       Math.random() * canvas.width,
      y:       -(Math.random() * canvas.height * 0.5),  // start above view
      w:       Math.random() * 7 + 5,  // width  5–12px
      h:       Math.random() * 4 + 3,  // height 3–7px
      color:   COLORS[Math.floor(Math.random() * COLORS.length)],
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.12,
      vx:      (Math.random() - 0.5) * 1.8,  // horizontal drift
      vy:      Math.random() * 2.5 + 1.5,    // gravity (downward)
      opacity: 0.85 + Math.random() * 0.15,
    };
  }

  /** Resize canvas to section bounds */
  function resizeCanvas() {
    const rect = section.getBoundingClientRect();
    canvas.width  = section.offsetWidth;
    canvas.height = section.offsetHeight;
  }

  /** Animation loop */
  function animate(timestamp) {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Spawn new particles for the first stopAfter ms
    if (elapsed < stopAfter && particles.length < 120) {
      const spawn = Math.floor(Math.random() * 4) + 1;
      for (let i = 0; i < spawn; i++) {
        particles.push(createParticle());
      }
    }

    // Update + draw
    particles = particles.filter((p) => {
      p.x        += p.vx;
      p.y        += p.vy;
      p.rotation += p.rotSpeed;
      p.vx       += (Math.random() - 0.5) * 0.05; // slight wind wobble

      // Fade out when near bottom
      if (p.y > canvas.height * 0.85) {
        p.opacity -= 0.02;
      }

      if (p.opacity <= 0 || p.y > canvas.height + 20) return false; // remove

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle   = p.color;

      // Alternate between rectangles and diamonds
      if (Math.random() > 0.997) {
        // tiny circle
        ctx.beginPath();
        ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      }

      ctx.restore();
      return true;
    });

    // Stop when all particles gone and spawn phase is over
    if (elapsed > stopAfter && particles.length === 0) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      running = false;
      return;
    }

    animId = requestAnimationFrame(animate);
  }

  /** Public: start the confetti */
  function launch() {
    if (running) return;
    running   = true;
    startTime = null;
    particles = [];
    resizeCanvas();
    animId = requestAnimationFrame(animate);
  }

  return { launch };

})();


/* ============================================================
   4. COUNTDOWN TIMER MODULE
============================================================ */
const Countdown = (() => {

  const elDays    = document.getElementById('count-days');
  const elHours   = document.getElementById('count-hours');
  const elMinutes = document.getElementById('count-minutes');
  const elSeconds = document.getElementById('count-seconds');

  /** Format a number to always 2 digits */
  function pad(n) {
    return String(n).padStart(2, '0');
  }

  /** Animate number flip when value changes */
  function flash(el, val) {
    const prev = el.textContent;
    if (prev === val) return;
    el.textContent = val;
    el.style.transform = 'translateY(-4px)';
    el.style.opacity   = '0.6';
    el.style.transition = 'none';
    requestAnimationFrame(() => {
      el.style.transition = 'transform 0.35s ease, opacity 0.35s ease';
      el.style.transform  = 'translateY(0)';
      el.style.opacity    = '1';
    });
  }

  function tick() {
    const now  = Date.now();
    const diff = WEDDING_DATE.getTime() - now;

    if (diff <= 0) {
      // Wedding day has passed
      flash(elDays,    '00');
      flash(elHours,   '00');
      flash(elMinutes, '00');
      flash(elSeconds, '00');
      return;
    }

    const totalSec = Math.floor(diff / 1000);
    const days     = Math.floor(totalSec / 86400);
    const hours    = Math.floor((totalSec % 86400) / 3600);
    const minutes  = Math.floor((totalSec % 3600)  / 60);
    const seconds  = totalSec % 60;

    flash(elDays,    pad(days));
    flash(elHours,   pad(hours));
    flash(elMinutes, pad(minutes));
    flash(elSeconds, pad(seconds));
  }

  function init() {
    tick();
    setInterval(tick, 1000);
  }

  return { init };

})();


/* ============================================================
   5. MUSIC PLAYER MODULE (Web Audio API — ambient tone)
============================================================ */
const MusicPlayer = (() => {
  const btn       = document.getElementById('music-btn');
  const audio     = document.getElementById('bg-music');
  const iconPlay  = btn.querySelector('.music-btn__icon--play');
  const iconPause = btn.querySelector('.music-btn__icon--pause');
  let playing = false;

  function toggle() {
    if (playing) {
      audio.pause();
      btn.setAttribute('aria-pressed', 'false');
      btn.classList.add('is-paused');
      iconPlay.style.display  = '';
      iconPause.style.display = 'none';
    } else {
      audio.play().catch(() => {});
      btn.setAttribute('aria-pressed', 'true');
      btn.classList.remove('is-paused');
      iconPlay.style.display  = 'none';
      iconPause.style.display = '';
    }
    playing = !playing;
  }

  function init() {
    audio.volume = 0.5; // atur volume 0.0 - 1.0
    btn.addEventListener('click', toggle);
  }

  /** Sync state dari luar (misal saat autoplay dari CurtainIntro) */
  function setPlaying(state) {
    playing = state;
  }

  return { init, setPlaying };
})();


/* ============================================================
   6. SCROLL REVEAL MODULE (IntersectionObserver)
============================================================ */
const ScrollReveal = (() => {

  let observer = null;

  function init() {
    const sections = document.querySelectorAll('.reveal-section');

    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          // Unobserve after reveal (performance)
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,       // trigger when 12% visible
      rootMargin: '0px 0px -40px 0px',  // slight offset from bottom
    });

    sections.forEach((el) => observer.observe(el));
  }

  return { init };

})();


/* ============================================================
   7. LANGUAGE TOGGLE MODULE (disabled — undangan dalam Bahasa Indonesia)
============================================================ */
const LangToggle = (() => {
  function init() { /* tidak digunakan */ }
  return { init };
})();


/* ============================================================
   8. PARALLAX (subtle, mobile-safe)
============================================================ */
const Parallax = (() => {

  // Only apply on non-touch devices for performance
  const isTouchDevice = () =>
    window.matchMedia('(hover: none)').matches;

  function init() {
    if (isTouchDevice()) return;

    const illustrations = document.querySelectorAll(
      '.villa-svg, .decoration'
    );

    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      illustrations.forEach((el) => {
        const rect   = el.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const offset = (window.innerHeight / 2 - center) * 0.06;
        el.style.transform = `translateY(${offset.toFixed(1)}px)`;
      });
    }, { passive: true });
  }

  return { init };

})();


/* ============================================================
   MAIN INIT — Boot all modules when DOM is ready
============================================================ */
document.addEventListener('DOMContentLoaded', () => {

  // Always init on load:
  CurtainIntro.init();   // curtain gate — controls page unlock
  Countdown.init();      // start timer immediately
  LangToggle.init();     // language switcher
  MusicPlayer.init();    // music button (doesn't play until clicked)
  Parallax.init();       // subtle scroll parallax

  // ScratchCards and ScrollReveal are initialized after curtains open
  // (called from CurtainIntro.revealMainContent → ScrollReveal.init)
  // ScratchCards needs the wrapper dimensions, so init after visibility:
  setTimeout(() => {
    ScratchCards.init();
  }, 200);

  // Handle window resize: redraw scratch canvases if needed
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      // Re-init scratch if sizes have changed significantly
      // (lightweight: only redraws unfilled canvases)
    }, 300);
  });

  // Smooth anchor scroll for any internal links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

});
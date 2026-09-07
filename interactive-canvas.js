/**
 * ARSLAAN ALAM PORTFOLIO - UNREAL ENGINE 5 ML SANCTUM CONTINUOUS TRACKING SHOT
 * Starts floating outside dark rain-slicked terrace looking through open industrial steel portal.
 * Glides smoothly into moody dark-mode ML sanctum toward triple-monitor PyTorch & liquid GPU rig.
 */

(function () {
  const canvas = document.getElementById('live-bg-canvas') || document.getElementById('hero-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;
  let animationFrameId;

  // DOM Elements
  const cameraRig = document.getElementById('drone-rig');
  const shot1 = document.getElementById('drone-shot-1');
  const shot2 = document.getElementById('drone-shot-2');
  const shot3 = document.getElementById('drone-shot-3');
  const hudLens = document.getElementById('drone-hud-lens');
  const scrollHudIndicator = document.getElementById('scroll-hud-indicator');

  // Camera Physics Variables
  let targetScrollY = 0;
  let currentScrollY = 0;
  let lastScrollY = 0;
  let scrollVelocity = 0;

  // Mouse Gimbal
  const mouse = {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    normX: 0.5,
    normY: 0.5,
    active: false
  };

  // Particle Arrays: Outdoor Rain Streaks & Indoor Violet/Indigo Motes
  let rainDrops = [];
  let indigoMotes = [];

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    initParticles();
  }

  // Rain Drops for Terrace View
  class RainDrop {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * (width + 100) - 50;
      this.y = Math.random() * -height;
      this.speed = Math.random() * 8 + 7;
      this.len = Math.random() * 16 + 10;
      this.alpha = Math.random() * 0.35 + 0.15;
    }

    update(scrollFactor) {
      this.y += this.speed + scrollVelocity * 0.2;
      this.x -= 1.5; // Slight atmospheric diagonal angle
      if (this.y > height) {
        this.reset();
        this.y = 0;
      }
    }

    draw(opacityMultiplier) {
      if (opacityMultiplier <= 0.01) return;
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x - 1.5, this.y + this.len);
      ctx.strokeStyle = `rgba(186, 230, 253, ${this.alpha * opacityMultiplier})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  // Luminous Violet & Indigo Data Motes for Developer Sanctum
  class IndigoMote {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4 - 0.15;
      this.baseRadius = Math.random() * 1.8 + 1;
      this.radius = this.baseRadius;
      this.alpha = Math.random() * 0.45 + 0.25;
      this.pulseSpeed = Math.random() * 0.02 + 0.01;
      this.pulseVal = Math.random() * Math.PI;
      this.isAmber = Math.random() > 0.7; // GPU amber coolant glow accent
      this.depth = Math.random() * 0.5 + 0.2;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy + (scrollVelocity * this.depth * 0.1);

      if (this.x < -10) this.x = width + 10;
      if (this.x > width + 10) this.x = -10;
      if (this.y < -10) this.y = height + 10;
      if (this.y > height + 10) this.y = -10;

      this.pulseVal += this.pulseSpeed;
      this.radius = this.baseRadius + Math.sin(this.pulseVal) * 0.4;
    }

    draw(opacityMultiplier) {
      if (opacityMultiplier <= 0.01) return;
      ctx.beginPath();
      ctx.arc(this.x, this.y, Math.max(0.5, this.radius), 0, Math.PI * 2);

      if (this.isAmber) {
        ctx.fillStyle = `rgba(245, 158, 11, ${this.alpha * opacityMultiplier * 0.9})`;
        ctx.shadowColor = 'rgba(245, 158, 11, 0.6)';
        ctx.shadowBlur = 8;
      } else {
        ctx.fillStyle = `rgba(167, 139, 250, ${this.alpha * opacityMultiplier * 0.8})`;
        ctx.shadowColor = 'rgba(99, 102, 241, 0.5)';
        ctx.shadowBlur = 6;
      }
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  function initParticles() {
    rainDrops = [];
    indigoMotes = [];
    const isMobile = window.innerWidth < 768;
    const rainCount = isMobile ? 18 : 65;
    const moteCount = isMobile ? 16 : 50;

    for (let i = 0; i < rainCount; i++) rainDrops.push(new RainDrop());
    for (let i = 0; i < moteCount; i++) indigoMotes.push(new IndigoMote());
  }

  // Camera Dolly Tracking Engine
  function updateCameraTracking() {
    currentScrollY += (targetScrollY - currentScrollY) * 0.075;
    scrollVelocity = currentScrollY - lastScrollY;
    lastScrollY = currentScrollY;

    const maxScroll = (document.documentElement.scrollHeight - window.innerHeight) || 1;
    const p = Math.min(1, Math.max(0, currentScrollY / maxScroll));

    // Shot 1: Dark rain-kissed penthouse terrace looking through open steel portal
    // Pushes smoothly forward through the portal threshold
    if (shot1) {
      const s1Scale = 1.0 + p * 2.15;
      const s1Opacity = p < 0.22 ? 1 : Math.max(0, 1 - (p - 0.22) / 0.20);
      shot1.style.transform = `scale(${s1Scale.toFixed(3)})`;
      shot1.style.opacity = s1Opacity.toFixed(3);
    }

    // Shot 2: Gliding down center of ML sanctum past server racks & floor reflections
    if (shot2) {
      let s2Opacity = 0;
      if (p >= 0.18 && p <= 0.78) {
        if (p < 0.35) {
          s2Opacity = (p - 0.18) / 0.17;
        } else if (p > 0.60) {
          s2Opacity = 1 - (p - 0.60) / 0.18;
        } else {
          s2Opacity = 1;
        }
      }
      const s2Scale = 0.94 + (p - 0.18) * 1.12;
      shot2.style.transform = `scale(${s2Scale.toFixed(3)})`;
      shot2.style.opacity = s2Opacity.toFixed(3);
    }

    // Shot 3: Decelerating framing triple-monitor PyTorch loss curves & liquid GPU rig
    if (shot3) {
      const s3Opacity = p < 0.58 ? 0 : Math.min(1, (p - 0.58) / 0.18);
      const s3Scale = 0.93 + (Math.max(0, p - 0.58)) * 0.20;
      shot3.style.transform = `scale(${s3Scale.toFixed(3)})`;
      shot3.style.opacity = s3Opacity.toFixed(3);
    }

    // 3D Camera Gimbal Tilt on Mouse Move
    if (cameraRig) {
      const pitch = (mouse.normY - 0.5) * -2.2;
      const yaw = (mouse.normX - 0.5) * 3.0;
      cameraRig.style.transform = `rotateX(${pitch.toFixed(2)}deg) rotateY(${yaw.toFixed(2)}deg)`;
    }

    // HUD Telemetry
    if (hudLens) {
      if (p < 0.28) {
        hudLens.textContent = '18mm F2.0 • RAIN-KISSED TERRACE PORTAL';
      } else if (p < 0.68) {
        hudLens.textContent = '28mm F1.4 • ML SANCTUM & SERVER RACKS';
      } else {
        hudLens.textContent = '50mm F1.2 • TRIPLE-MONITOR PYTORCH RIG';
      }
    }

    if (scrollHudIndicator) {
      scrollHudIndicator.style.height = `${(p * 100).toFixed(1)}%`;
    }

    return p;
  }

  function render() {
    ctx.clearRect(0, 0, width, height);

    const p = updateCameraTracking();

    // Outdoor Rain: Active at terrace (fades out as you push inside)
    const rainOpacity = Math.max(0, 1 - p / 0.35);
    if (rainOpacity > 0.02) {
      for (let i = 0; i < rainDrops.length; i++) {
        rainDrops[i].update();
        rainDrops[i].draw(rainOpacity);
      }
    }

    // Indoor Motes: Fades in as you enter ML sanctum
    const moteOpacity = Math.min(1, Math.max(0, (p - 0.20) / 0.25));
    if (moteOpacity > 0.02) {
      for (let i = 0; i < indigoMotes.length; i++) {
        indigoMotes[i].update();
        indigoMotes[i].draw(moteOpacity);
      }
    }

    scrollVelocity *= 0.85;
    animationFrameId = requestAnimationFrame(render);
  }

  // Event Listeners
  window.addEventListener('scroll', () => {
    targetScrollY = window.pageYOffset || document.documentElement.scrollTop;
  }, { passive: true });

  window.addEventListener('resize', debounce(resize, 150));

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.normX = e.clientX / window.innerWidth;
    mouse.normY = e.clientY / window.innerHeight;
    mouse.active = true;
  });

  window.addEventListener('mouseleave', () => {
    mouse.normX = 0.5;
    mouse.normY = 0.5;
    mouse.active = false;
  });

  function debounce(fn, ms) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), ms);
    };
  }

  // Initialize
  targetScrollY = window.pageYOffset || document.documentElement.scrollTop;
  currentScrollY = targetScrollY;
  lastScrollY = targetScrollY;
  resize();
  render();
})();

import { useEffect, useRef } from 'react';
import { scrollToSectionById } from '../../utils/scrollToSection';
import './Hero.css';

export default function Hero() {
  const canvasRef = useRef(null);
  const videoRef  = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
    if (!ctx) return;

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const lowPowerDevice = Boolean(
      motionQuery.matches
      || navigator.connection?.saveData
      || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4)
    );

    let viewportWidth = window.innerWidth;
    let viewportHeight = window.innerHeight;
    let animationFrameId = 0;
    let particles = [];
    let lastFrameAt = 0;
    let animationStartAt = performance.now();
    let isTabVisible = !document.hidden;

    const config = {
      particleMinSize: 0.6,
      particleMaxSize: 1.8,
      breathingCycleDurationMs: 30000,
      targetFrameDurationMs: lowPowerDevice ? 1000 / 24 : 1000 / 30,
      maxParticleCount: lowPowerDevice ? 70 : 140,
      minParticleCount: lowPowerDevice ? 28 : 48,
    };

    function resizeCanvas() {
      viewportWidth = window.innerWidth;
      viewportHeight = window.innerHeight;

      const devicePixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(viewportWidth * devicePixelRatio);
      canvas.height = Math.round(viewportHeight * devicePixelRatio);
      canvas.style.width = `${viewportWidth}px`;
      canvas.style.height = `${viewportHeight}px`;

      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
      particles = createParticles();
    }

    function getParticleCount() {
      const particleCountFromArea = Math.round((viewportWidth * viewportHeight) / 18000);
      return Math.max(config.minParticleCount, Math.min(config.maxParticleCount, particleCountFromArea));
    }

    class Particle {
      constructor() {
        this.x = Math.random() * viewportWidth;
        this.y = Math.random() * viewportHeight;
        this.depth = Math.random();
        this.size = config.particleMinSize + this.depth * (config.particleMaxSize - config.particleMinSize);
        this.vx = (Math.random() - 0.5) * 0.028;
        this.vy = (Math.random() - 0.5) * 0.028;
        this.driftPhase = Math.random() * Math.PI * 2;
        this.driftSpeed = 0.0007 + Math.random() * 0.0007;
        this.baseBrightness = 0.3 + this.depth * 0.5;
        this.currentBrightness = this.baseBrightness;
      }

      update(deltaMs, breathingIntensity, globalTime) {
        const step = deltaMs / 16.67;
        this.driftPhase += this.driftSpeed * deltaMs;
        this.x += (this.vx + Math.sin(this.driftPhase) * 0.02) * step;
        this.y += (this.vy + Math.cos(this.driftPhase * 0.7) * 0.02) * step;
        const twinkle = Math.sin(globalTime * 0.0025 + this.driftPhase) * 0.22;
        this.currentBrightness = (this.baseBrightness + twinkle) * (0.7 + breathingIntensity * 0.3);

        if (this.x < -20) this.x = viewportWidth + 20;
        if (this.x > viewportWidth + 20) this.x = -20;
        if (this.y < -20) this.y = viewportHeight + 20;
        if (this.y > viewportHeight + 20) this.y = -20;
      }

      draw(ctx) {
        ctx.fillStyle = '#60a5fa';
        ctx.globalAlpha = this.currentBrightness * 0.16;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 4.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#dbeafe';
        ctx.globalAlpha = Math.min(this.currentBrightness, 1);
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function createParticles() {
      return Array.from({ length: getParticleCount() }, () => new Particle());
    }

    function drawFrame(now) {
      const elapsed = now - animationStartAt;
      const breathingIntensity = Math.sin((elapsed / config.breathingCycleDurationMs) * Math.PI * 2) * 0.5 + 0.5;
      ctx.fillStyle = '#0a1423';
      ctx.fillRect(0, 0, viewportWidth, viewportHeight);

      const deltaMs = lastFrameAt ? now - lastFrameAt : config.targetFrameDurationMs;
      particles.forEach((particle) => {
        particle.update(deltaMs, breathingIntensity, elapsed);
        particle.draw(ctx);
      });
      ctx.globalAlpha = 1;
    }

    function animate(now) {
      if (motionQuery.matches) {
        drawFrame(now);
        return;
      }

      if (isTabVisible && (!lastFrameAt || now - lastFrameAt >= config.targetFrameDurationMs)) {
        drawFrame(now);
        lastFrameAt = now;
      }

      animationFrameId = requestAnimationFrame(animate);
    }

    function handleVisibilityChange() {
      isTabVisible = !document.hidden;
      if (isTabVisible) {
        lastFrameAt = 0;
      }
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);

    drawFrame(animationStartAt);

    if (!motionQuery.matches) {
      animationFrameId = requestAnimationFrame(animate);
    }

    // Video crossfade
    const video = videoRef.current;
    let onLoaded;
    let onError;
    if (video) {
      onLoaded = () => { video.classList.add('loaded'); canvas.style.opacity = '0.5'; };
      onError = () => { canvas.style.opacity = '1'; };
      video.addEventListener('loadeddata', onLoaded);
      video.addEventListener('error', onError);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      if (video && onLoaded && onError) {
        video.removeEventListener('loadeddata', onLoaded);
        video.removeEventListener('error', onError);
      }
    };
  }, []);

  function scrollTo(id) {
    scrollToSectionById(id);
  }

  return (
    <section id="home" className="hero">
      <video
        ref={videoRef}
        id="hero-video"
        className="hero-video"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      >
        <source src="/media/hero background.mp4" type="video/mp4" />
      </video>
      <canvas ref={canvasRef} id="hero-canvas" className="hero-canvas" />

      <div className="container">
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="greeting">Hi, I'm</span>
            <span className="name">Agoma Divine E.</span>
            <span className="role">AI Product &amp; Systems Engineer</span>
          </h1>
          <p className="hero-description">
            Stop building AI demos. Start deploying intelligent systems with Dee.< br />
            Building intelligent systems that remove repetitive workflows, improve decision-making, and make products smarter.< br />
            From machine learning integration to scalable system design, I turn AI into usable infrastructure.
          </p>
          <div className="hero-buttons">
            <button className="btn btn-primary" onClick={() => scrollTo('projects')}>View My Work</button>
            <button className="btn btn-secondary" onClick={() => scrollTo('contact')}>Get In Touch</button>
          </div>
        </div>

        <div className="hero-image">
          <div className="hero-profile-container">
            <img src="/media/dee.jpeg" alt="Profile Picture" className="hero-profile-pic" />
          </div>
        </div>
      </div>
    </section>
  );
}

import { useEffect, useRef } from 'react';
import { scrollToSectionById } from '../../utils/scrollToSection';
import './Hero.css';

export default function Hero() {
  const canvasRef = useRef(null);
  const videoRef  = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx  = canvas.getContext('2d');
    let time   = 0;
    let animId = null;

    function resizeCanvas() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const config = {
      particleCount: 400,
      particleMinSize: 0.5,
      particleMaxSize: 2,
      breathingCycleDuration: 30000,
    };

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.depth = Math.random();
        this.size  = config.particleMinSize + this.depth * (config.particleMaxSize - config.particleMinSize);
        this.vx = (Math.random() - 0.5) * 0.04;
        this.vy = (Math.random() - 0.5) * 0.04;
        this.driftPhase  = Math.random() * Math.PI * 2;
        this.driftSpeed  = 0.001 + Math.random() * 0.001;
        this.baseBrightness = 0.3 + this.depth * 0.5;
        this.currentBrightness = this.baseBrightness;
      }

      update(breathingIntensity, globalTime) {
        this.driftPhase += this.driftSpeed;
        this.x += this.vx + Math.sin(this.driftPhase) * 0.03;
        this.y += this.vy + Math.cos(this.driftPhase * 0.7) * 0.03;
        const twinkle = Math.sin(globalTime * 0.003 + this.driftPhase) * 0.3;
        this.currentBrightness = (this.baseBrightness + twinkle) * (0.7 + breathingIntensity * 0.3);
        if (this.x < -20)               this.x = canvas.width + 20;
        if (this.x > canvas.width + 20) this.x = -20;
        if (this.y < -20)                this.y = canvas.height + 20;
        if (this.y > canvas.height + 20) this.y = -20;
      }

      draw(ctx) {
        ctx.save();
        const glow = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 5);
        glow.addColorStop(0, `rgba(96, 165, 250, ${this.currentBrightness * 0.4})`);
        glow.addColorStop(1, 'rgba(96, 165, 250, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(200, 230, 255, ${Math.min(this.currentBrightness, 1)})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    const particles = Array.from({ length: config.particleCount }, () => new Particle());

    function animate() {
      time++;
      const breathingIntensity = Math.sin(time / config.breathingCycleDuration * Math.PI * 2) * 0.5 + 0.5;
      ctx.fillStyle = '#0a1423';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => { p.update(breathingIntensity, time); p.draw(ctx); });
      animId = requestAnimationFrame(animate);
    }
    animate();

    // Video crossfade
    const video = videoRef.current;
    if (video) {
      const onLoaded = () => { video.classList.add('loaded'); canvas.style.opacity = '0.5'; };
      const onError  = () => { canvas.style.opacity = '1'; };
      video.addEventListener('loadeddata', onLoaded);
      video.addEventListener('error', onError);
    }

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resizeCanvas);
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
            Building intelligent systems with AI, machine learning, tackling real-world challenges and
            proffering innovative solutions.
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

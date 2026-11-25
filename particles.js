// Traînée néon : réglages faciles à modifier
(() => {
  const couleurs = ['#c084fc', '#a855f7', '#a3e635'];
  const maximum = 90;
  const duree = 650; // millisecondes
  const canvas = document.getElementById('cursor-particles');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const preference = matchMedia('(prefers-reduced-motion: reduce), (pointer: coarse)');
  let particles = [], frame = 0, last = null;
  function resize() {
    const ratio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = innerWidth * ratio;
    canvas.height = innerHeight * ratio;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }
  resize();
  addEventListener('resize', resize);
  function draw(now) {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    particles = particles.filter(p => now - p.birth < duree);
    for (const p of particles) {
      const t = Math.max(0, (now - p.birth) / duree);
      ctx.save();
      ctx.translate(p.x + p.vx * t, p.y + p.vy * t);
      ctx.rotate(p.angle + t * 2);
      ctx.globalAlpha = (1 - t) * .85;
      ctx.strokeStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 9;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      for (let i = 0; i < p.sides; i++) {
        const a = i * Math.PI * 2 / p.sides;
        const x = Math.cos(a) * p.size, y = Math.sin(a) * p.size;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    }
    frame = particles.length ? requestAnimationFrame(draw) : 0;
  }
  addEventListener('pointermove', e => {
    if (preference.matches || e.pointerType !== 'mouse') return;
    if (last && Math.hypot(e.clientX-last.x, e.clientY-last.y) < 8) return;
    last = {x:e.clientX, y:e.clientY};
    for (let i = 0; i < 2; i++) {
      particles.push({x:e.clientX, y:e.clientY, birth:performance.now(),
        vx:(Math.random()-.5)*65, vy:(Math.random()-.5)*65,
        size:3+Math.random()*5, angle:Math.random()*Math.PI,
        sides:Math.random()<.45?3:4,
        color:couleurs[Math.floor(Math.random()*couleurs.length)]});
    }
    if (particles.length > maximum) particles.splice(0, particles.length-maximum);
    if (!frame) frame = requestAnimationFrame(draw);
  }, {passive:true});
  preference.addEventListener('change', () => {
    particles = []; last = null;
    if (frame) cancelAnimationFrame(frame);
    frame = 0; ctx.clearRect(0,0,innerWidth,innerHeight);
  });
})();

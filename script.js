const canvas = document.getElementById('solarSystem');
const ctx = canvas.getContext('2d');

let centerX, centerY;
const tilt = 0.92;

const solarData = {
  sun: { radius: 50 },
  planets: [
    { name: 'Mercury', radius: 5, a: 70, b: 68, orbitSpeed: 0.047, spinSpeed: 0.0008 },
    { name: 'Venus', radius: 12, a: 100, b: 98, orbitSpeed: 0.035, spinSpeed: 0.0002 },
    { name: 'Earth', radius: 13, a: 140, b: 138, orbitSpeed: 0.03, spinSpeed: 0.00015 },
    { name: 'Mars', radius: 8, a: 180, b: 178, orbitSpeed: 0.024, spinSpeed: 0.00012 },
    { name: 'Jupiter', radius: 25, a: 230, b: 228, orbitSpeed: 0.013, spinSpeed: 0.00025 },
    { name: 'Saturn', radius: 22, a: 280, b: 278, orbitSpeed: 0.009, spinSpeed: 0.0002 },
    { name: 'Uranus', radius: 18, a: 330, b: 328, orbitSpeed: 0.006, spinSpeed: 0.0001 },
    { name: 'Neptune', radius: 17, a: 380, b: 378, orbitSpeed: 0.005, spinSpeed: 0.0001 }
  ],
  stars: { count: 200 }
};

let planets = [];
let stars = [];

function initialize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  centerX = canvas.width / 2;
  centerY = canvas.height / 2;

  planets = solarData.planets.map(p => ({
    ...p,
    orbitAngle: Math.random() * Math.PI * 2,
    spinAngle: Math.random() * Math.PI * 2,
    cloudAngle: Math.random() * Math.PI * 2
  }));

  stars = Array.from({ length: solarData.stars.count }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 1.5,
    alpha: Math.random()
  }));
}

function drawStars() {
  stars.forEach(s => {
    ctx.fillStyle = `rgba(255,255,255,${s.alpha})`;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawPlanets() {
  planets.forEach(p => {
    p.orbitAngle += p.orbitSpeed;
    p.spinAngle += p.spinSpeed;
    p.cloudAngle += p.spinSpeed * 0.6;

    const x = centerX + p.a * Math.cos(p.orbitAngle);
    const y = centerY + p.b * Math.sin(p.orbitAngle) * tilt;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(p.spinAngle);

    const grad = ctx.createRadialGradient(
      -p.radius / 3, -p.radius / 3, p.radius / 4,
      0, 0, p.radius
    );

    switch (p.name) {
      case 'Earth':
        grad.addColorStop(0, '#6ec1ff');
        grad.addColorStop(0.7, '#2e86c1');
        grad.addColorStop(1, '#133f73');
        break;
      case 'Venus':
        grad.addColorStop(0, '#fff5e6');
        grad.addColorStop(1, '#d4b58c');
        break;
      default:
        grad.addColorStop(0, '#ddd');
        grad.addColorStop(1, '#777');
    }

    ctx.beginPath();
    ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // Atmosphere
    if (p.name === 'Earth' || p.name === 'Venus') {
      ctx.beginPath();
      ctx.arc(0, 0, p.radius + 3, 0, Math.PI * 2);
      ctx.fillStyle = p.name === 'Earth'
        ? 'rgba(135,206,235,0.25)'
        : 'rgba(255,223,186,0.22)';
      ctx.fill();
    }

    // Earth clouds (slow, independent layer)
    if (p.name === 'Earth') {
      ctx.rotate(p.cloudAngle - p.spinAngle);
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.arc(
          Math.cos(i) * p.radius * 0.4,
          Math.sin(i) * p.radius * 0.4,
          p.radius * 0.25,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    }

    ctx.restore();
  });
}

function drawSun() {
  const g = ctx.createRadialGradient(
    centerX, centerY, 10,
    centerX, centerY, 50
  );
  g.addColorStop(0, '#fff9a3');
  g.addColorStop(1, '#ffa000');

  ctx.beginPath();
  ctx.arc(centerX, centerY, 50, 0, Math.PI * 2);
  ctx.fillStyle = g;
  ctx.fill();
}

function animate() {
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawStars();
  drawSun();
  drawPlanets();

  requestAnimationFrame(animate);
}

window.addEventListener('resize', initialize);
initialize();
animate();

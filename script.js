// Get canvas and context
const canvas = document.getElementById('solarSystem');
const ctx = canvas.getContext('2d');

let centerX, centerY;

const solarData = {
  sun: { radius: 50 },
  planets: [
    { name: 'Mercury', radius: 5, a: 70, b: 68, speed: 0.047 },
    { name: 'Venus', radius: 12, a: 100, b: 98, speed: 0.035 },
    { name: 'Earth', radius: 13, a: 140, b: 138, speed: 0.03,
      moon: { radius: 4, distance: 20, speed: 0.05 } },
    { name: 'Mars', radius: 8, a: 180, b: 178, speed: 0.024 },
    { name: 'Jupiter', radius: 25, a: 230, b: 228, speed: 0.013 },
    { name: 'Saturn', radius: 22, a: 280, b: 278, speed: 0.009 },
    { name: 'Uranus', radius: 18, a: 330, b: 328, speed: 0.006 },
    { name: 'Neptune', radius: 17, a: 380, b: 378, speed: 0.005 }
  ],
  asteroids: { count: 100, minDistance: 220, maxDistance: 260, minRadius: 1, maxRadius: 3, minSpeed: 0.002, maxSpeed: 0.005 },
  stars: { count: 200 }
};

let planets = [];
let asteroids = [];
let stars = [];
let sun = {};

// Initialize planets, asteroids, stars
function initialize() {
  centerX = canvas.width / 2;
  centerY = canvas.height / 2;
  sun = solarData.sun;

  planets = solarData.planets.map(p => ({
    ...p,
    angle: Math.random() * Math.PI * 2,
    rotation: 0,
    moon: p.moon ? { ...p.moon, angle: Math.random() * Math.PI * 2 } : null
  }));

  asteroids = [];
  for (let i = 0; i < solarData.asteroids.count; i++) {
    asteroids.push({
      distance: solarData.asteroids.minDistance + Math.random() * (solarData.asteroids.maxDistance - solarData.asteroids.minDistance),
      angle: Math.random() * Math.PI * 2,
      radius: solarData.asteroids.minRadius + Math.random() * (solarData.asteroids.maxRadius - solarData.asteroids.minRadius),
      speed: solarData.asteroids.minSpeed + Math.random() * (solarData.asteroids.maxSpeed - solarData.asteroids.minSpeed)
    });
  }

  stars = [];
  for (let i = 0; i < solarData.stars.count; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 1.5,
      blinkSpeed: 0.01 + Math.random() * 0.02,
      opacity: Math.random()
    });
  }
}

// Draw twinkling stars
function drawStars() {
  stars.forEach(star => {
    star.opacity += star.blinkSpeed;
    if (star.opacity > 1 || star.opacity < 0) star.blinkSpeed *= -1;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${star.opacity})`;
    ctx.fill();
  });
}

// Draw planets with visual enhancements, rotation, and atmosphere/clouds
function drawPlanets() {
  planets.forEach(planet => {
    planet.angle += planet.speed;
    planet.rotation += 0.01;

    const x = centerX + planet.a * Math.cos(planet.angle);
    const y = centerY + planet.b * Math.sin(planet.angle);

    const gradient = ctx.createRadialGradient(
      x - planet.radius / 3, y - planet.radius / 3, planet.radius / 5,
      x, y, planet.radius
    );

    // Base color
    switch (planet.name) {
      case 'Mercury':
        gradient.addColorStop(0, '#e0e0e0'); gradient.addColorStop(1, '#7a7a7a'); break;
      case 'Venus':
        gradient.addColorStop(0, '#fff5e6'); gradient.addColorStop(1, '#d4b58c'); break;
      case 'Earth':
        gradient.addColorStop(0, '#6ec1ff'); gradient.addColorStop(0.7, '#2e86c1'); gradient.addColorStop(1, '#133f73'); break;
      case 'Mars':
        gradient.addColorStop(0, '#ff7f50'); gradient.addColorStop(1, '#b03d1d'); break;
      case 'Jupiter':
        gradient.addColorStop(0, '#ffe0b2'); gradient.addColorStop(1, '#b07250'); break;
      case 'Saturn':
        gradient.addColorStop(0, '#fff8c4'); gradient.addColorStop(1, '#d4c08c'); break;
      case 'Uranus':
        gradient.addColorStop(0, '#b0f0ff'); gradient.addColorStop(1, '#4da3cc'); break;
      case 'Neptune':
        gradient.addColorStop(0, '#66a3ff'); gradient.addColorStop(1, '#1c3fa0'); break;
    }

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(planet.rotation);

    // Draw planet
    ctx.beginPath();
    ctx.arc(0, 0, planet.radius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Add atmosphere glow for Earth and Venus
    if (planet.name === 'Earth' || planet.name === 'Venus') {
      ctx.beginPath();
      ctx.arc(0, 0, planet.radius + 3, 0, Math.PI * 2);
      ctx.fillStyle = planet.name === 'Earth' ? 'rgba(135,206,235,0.3)' : 'rgba(255,223,186,0.25)';
      ctx.fill();
    }

    // Add simple clouds for Earth
    if (planet.name === 'Earth') {
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        const cloudRadius = planet.radius * (0.1 + Math.random() * 0.4);
        const angle = Math.random() * Math.PI * 2;
        ctx.arc(
          Math.cos(angle) * planet.radius * 0.5,
          Math.sin(angle) * planet.radius * 0.5,
          cloudRadius,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.fill();
      }
    }

    ctx.restore();

    // Draw moon
    if (planet.moon) {
      planet.moon.angle += planet.moon.speed;
      const mx = x + planet.moon.distance * Math.cos(planet.moon.angle);
      const my = y + planet.moon.distance * Math.sin(planet.moon.angle);

      const moonGradient = ctx.createRadialGradient(
        mx - planet.moon.radius / 3, my - planet.moon.radius / 3,
        planet.moon.radius / 4, mx, my, planet.moon.radius
      );
      moonGradient.addColorStop(0, '#dddddd');
      moonGradient.addColorStop(1, '#888888');

      ctx.beginPath();
      ctx.arc(mx, my, planet.moon.radius, 0, Math.PI * 2);
      ctx.fillStyle = moonGradient;
      ctx.fill();
    }

    // Saturn ring
    if (planet.name === 'Saturn') {
      ctx.beginPath();
      ctx.ellipse(x, y, planet.radius * 1.6, planet.radius * 0.5, Math.PI / 4, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(200,180,120,0.6)';
      ctx.lineWidth = 4;
      ctx.stroke();
    }
  });
}

// Draw asteroids
function drawAsteroids() {
  asteroids.forEach(asteroid => {
    asteroid.angle += asteroid.speed;
    const ax = centerX + asteroid.distance * Math.cos(asteroid.angle);
    const ay = centerY + asteroid.distance * Math.sin(asteroid.angle);

    ctx.beginPath();
    ctx.arc(ax, ay, asteroid.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#aaaaaa';
    ctx.fill();
  });
}

// Main animation loop
function animate() {
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawStars();

  // Sun
  const sunGradient = ctx.createRadialGradient(
    centerX, centerY, sun.radius * 0.2,
    centerX, centerY, sun.radius
  );
  sunGradient.addColorStop(0, '#fff9a3');
  sunGradient.addColorStop(0.3, '#fff176');
  sunGradient.addColorStop(0.6, '#ffd54f');
  sunGradient.addColorStop(0.8, '#ffb300');
  sunGradient.addColorStop(1, '#ffa000');

  ctx.beginPath();
  ctx.arc(centerX, centerY, sun.radius, 0, Math.PI * 2);
  ctx.fillStyle = sunGradient;
  ctx.fill();

  drawPlanets();
  drawAsteroids();

  requestAnimationFrame(animate);
}

// Resize canvas and initialize
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  initialize();
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
animate();

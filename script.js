// Get canvas and context
const canvas = document.getElementById('solarSystem');
const ctx = canvas.getContext('2d');

let centerX, centerY;
const tilt = 0.92;
const scale = 0.5; // Scale factor for fitting on screen

// Settings
let settings = {
  showOrbits: true,
  showTrails: true,
  showLabels: false,
  showGlow: true
};

// Bind controls
document.getElementById('showOrbits').addEventListener('change', e => settings.showOrbits = e.target.checked);
document.getElementById('showTrails').addEventListener('change', e => settings.showTrails = e.target.checked);
document.getElementById('showLabels').addEventListener('change', e => settings.showLabels = e.target.checked);
document.getElementById('showGlow').addEventListener('change', e => settings.showGlow = e.target.checked);

// Solar system data with real astronomical values
// Distances in AU (scaled), periods in Earth years, eccentricity is actual
const solarData = {
  sun: { radius: 50 },
  planets: [
    { 
      name: 'Mercury', 
      radius: 5, 
      semiMajorAxis: 70,      // 0.387 AU
      eccentricity: 0.206,     // Actual eccentricity
      orbitalPeriod: 0.241,    // Earth years
      startAngle: 0,
      color: ['#e0e0e0', '#9a9a9a', '#5a5a5a'] 
    },
    { 
      name: 'Venus', 
      radius: 12, 
      semiMajorAxis: 100, 
      eccentricity: 0.007,     // Nearly circular
      orbitalPeriod: 0.615,
      startAngle: Math.PI * 0.3,
      color: ['#fff5e6', '#f4d7a0', '#d4b58c'] 
    },
    { 
      name: 'Earth', 
      radius: 13, 
      semiMajorAxis: 140,      // 1.0 AU (reference)
      eccentricity: 0.017,     // Nearly circular
      orbitalPeriod: 1.0,      // 1 Earth year
      startAngle: Math.PI * 0.7,
      color: ['#6ec1ff', '#2e86c1', '#0a4a7a', '#133f73'],
      moon: { radius: 4, distance: 20, orbitalPeriod: 0.0748 } // 27.3 days
    },
    { 
      name: 'Mars', 
      radius: 8, 
      semiMajorAxis: 180,      // 1.524 AU
      eccentricity: 0.093,
      orbitalPeriod: 1.881,
      startAngle: Math.PI * 1.2,
      color: ['#ff9f80', '#ff7f50', '#b03d1d'] 
    },
    { 
      name: 'Jupiter', 
      radius: 25, 
      semiMajorAxis: 240,      // 5.203 AU
      eccentricity: 0.048,
      orbitalPeriod: 11.86,
      startAngle: Math.PI * 1.8,
      color: ['#ffecd2', '#ffd9a0', '#d4a574', '#b07250'] 
    },
    { 
      name: 'Saturn', 
      radius: 22, 
      semiMajorAxis: 300,      // 9.537 AU
      eccentricity: 0.054,
      orbitalPeriod: 29.46,
      startAngle: Math.PI * 0.5,
      color: ['#fff8d4', '#f4e8b0', '#d4c08c'] 
    },
    { 
      name: 'Uranus', 
      radius: 18, 
      semiMajorAxis: 360,      // 19.191 AU
      eccentricity: 0.047,
      orbitalPeriod: 84.01,
      startAngle: Math.PI * 1.4,
      color: ['#d0f0ff', '#b0d8f0', '#4da3cc'] 
    },
    { 
      name: 'Neptune', 
      radius: 17, 
      semiMajorAxis: 420,      // 30.069 AU
      eccentricity: 0.009,
      orbitalPeriod: 164.8,
      startAngle: Math.PI * 0.9,
      color: ['#8cb3ff', '#66a3ff', '#3d6fcc', '#1c3fa0'] 
    }
  ],
  asteroids: { count: 150, minDistance: 200, maxDistance: 215, minRadius: 0.8, maxRadius: 2.5, minSpeed: 0.002, maxSpeed: 0.005 },
  stars: { count: 300 }
};

let planets = [];
let asteroids = [];
let stars = [];
let sun = {};
let timeSpeed = 0.000001; // Controls animation speed (higher = faster)

// Initialize
function initialize() {
  centerX = canvas.width / 2;
  centerY = canvas.height / 2;
  sun = solarData.sun;

  planets = solarData.planets.map(p => {
    // Calculate semi-minor axis from eccentricity
    const semiMinorAxis = p.semiMajorAxis * Math.sqrt(1 - p.eccentricity * p.eccentricity);
    // Calculate focal distance (sun is at one focus)
    const focalDistance = p.semiMajorAxis * p.eccentricity;
    
    return {
      ...p,
      semiMinorAxis: semiMinorAxis,
      focalDistance: focalDistance,
      angle: p.startAngle, // Start at specified position
      rotation: 0,
      trail: [],
      // Angular velocity based on Kepler's third law
      angularVelocity: (2 * Math.PI) / p.orbitalPeriod,
      moon: p.moon ? { 
        ...p.moon, 
        angle: Math.random() * Math.PI * 2,
        angularVelocity: (2 * Math.PI) / p.moon.orbitalPeriod
      } : null
    };
  });

  asteroids = [];
  for (let i = 0; i < solarData.asteroids.count; i++) {
    const distance = solarData.asteroids.minDistance + Math.random() * (solarData.asteroids.maxDistance - solarData.asteroids.minDistance);
    asteroids.push({
      distance: distance,
      angle: Math.random() * Math.PI * 2,
      radius: solarData.asteroids.minRadius + Math.random() * (solarData.asteroids.maxRadius - solarData.asteroids.minRadius),
      // Asteroids follow Kepler's laws too (approximate period)
      angularVelocity: (2 * Math.PI) / Math.sqrt(Math.pow(distance / 140, 3)), // Relative to Earth
      brightness: 0.3 + Math.random() * 0.4
    });
  }

  stars = [];
  for (let i = 0; i < solarData.stars.count; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: 0.5 + Math.random() * 1.5,
      blinkSpeed: 0.01 + Math.random() * 0.02,
      opacity: Math.random(),
      color: Math.random() > 0.9 ? '#bbddff' : '#ffffff'
    });
  }
}

// Calculate position on ellipse with sun at focus
function getEllipticalPosition(planet, centerX, centerY) {
  const a = planet.semiMajorAxis;
  const b = planet.semiMinorAxis;
  const c = planet.focalDistance;
  
  // Position on ellipse (sun at left focus)
  const x = centerX + a * Math.cos(planet.angle) - c;
  const y = centerY + b * Math.sin(planet.angle) * tilt;
  
  return { x, y };
}

// Draw stars with enhanced twinkle
function drawStars() {
  stars.forEach(star => {
    star.opacity += star.blinkSpeed;
    if (star.opacity > 1 || star.opacity < 0.3) star.blinkSpeed *= -1;
    
    ctx.save();
    if (settings.showGlow && star.radius > 1) {
      ctx.shadowBlur = 4;
      ctx.shadowColor = star.color;
    }
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx.fillStyle = `${star.color}${Math.floor(star.opacity * 255).toString(16).padStart(2, '0')}`;
    ctx.fill();
    ctx.restore();
  });
}

// Draw orbital paths
function drawOrbits() {
  if (!settings.showOrbits) return;
  
  planets.forEach(planet => {
    ctx.beginPath();
    // Draw ellipse with sun at focus (offset by focal distance)
    ctx.ellipse(
      centerX - planet.focalDistance, 
      centerY, 
      planet.semiMajorAxis, 
      planet.semiMinorAxis * tilt, 
      0, 0, Math.PI * 2
    );
    ctx.strokeStyle = 'rgba(100, 100, 150, 0.15)';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Draw a small marker at perihelion (closest point)
    const periX = centerX - planet.focalDistance + planet.semiMajorAxis;
    const periY = centerY;
    ctx.beginPath();
    ctx.arc(periX, periY, 2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 200, 100, 0.3)';
    ctx.fill();
  });

  // Asteroid belt orbit
  ctx.beginPath();
  ctx.ellipse(centerX, centerY, 207, 207 * tilt, 0, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(150, 150, 150, 0.1)';
  ctx.lineWidth = 1;
  ctx.stroke();
}

// Draw planet trails
function drawTrails() {
  if (!settings.showTrails) return;
  
  planets.forEach(planet => {
    if (planet.trail.length < 2) return;
    
    ctx.beginPath();
    ctx.moveTo(planet.trail[0].x, planet.trail[0].y);
    
    for (let i = 1; i < planet.trail.length; i++) {
      ctx.lineTo(planet.trail[i].x, planet.trail[i].y);
    }
    
    const gradient = ctx.createLinearGradient(
      planet.trail[0].x, planet.trail[0].y,
      planet.trail[planet.trail.length - 1].x, planet.trail[planet.trail.length - 1].y
    );
    gradient.addColorStop(0, planet.color[0] + '00');
    gradient.addColorStop(1, planet.color[1] + '40');
    
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  });
}

// Draw planets with enhanced visuals
function drawPlanets() {
  const sorted = planets.slice().sort((a, b) => {
    const aPos = getEllipticalPosition(a, centerX, centerY);
    const bPos = getEllipticalPosition(b, centerX, centerY);
    return aPos.y - bPos.y;
  });

  sorted.forEach(planet => {
    // Update angle based on orbital period
    planet.angle += planet.angularVelocity * timeSpeed;
    planet.rotation += 0.01;

    const pos = getEllipticalPosition(planet, centerX, centerY);
    const x = pos.x;
    const y = pos.y;

    // Update trail
    planet.trail.push({ x, y });
    if (planet.trail.length > 80) planet.trail.shift();

    // Scale based on distance
    const distanceFromCenter = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
    const scale = 0.85 + 0.15 * (distanceFromCenter / 400);
    const radius = planet.radius * scale;

    // Glow effect
    if (settings.showGlow) {
      ctx.save();
      ctx.shadowBlur = radius * 0.8;
      ctx.shadowColor = planet.color[0];
      ctx.beginPath();
      ctx.arc(x, y, radius * 1.1, 0, Math.PI * 2);
      ctx.fillStyle = planet.color[0] + '20';
      ctx.fill();
      ctx.restore();
    }

    // Planet gradient
    const gradient = ctx.createRadialGradient(
      x - radius * 0.35, y - radius * 0.35, radius * 0.1,
      x, y, radius * 1.1
    );

    planet.color.forEach((color, i) => {
      gradient.addColorStop(i / (planet.color.length - 1), color);
    });

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(planet.rotation);

    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Special features
    if (planet.name === 'Earth') {
      // Atmosphere
      const atmGrad = ctx.createRadialGradient(0, 0, radius * 0.9, 0, 0, radius * 1.2);
      atmGrad.addColorStop(0, 'rgba(135, 206, 235, 0)');
      atmGrad.addColorStop(1, 'rgba(135, 206, 235, 0.4)');
      ctx.beginPath();
      ctx.arc(0, 0, radius * 1.2, 0, Math.PI * 2);
      ctx.fillStyle = atmGrad;
      ctx.fill();

      // Continents (simple)
      ctx.fillStyle = 'rgba(34, 139, 34, 0.3)';
      for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2 + planet.rotation;
        ctx.beginPath();
        ctx.ellipse(
          Math.cos(angle) * radius * 0.4,
          Math.sin(angle) * radius * 0.4,
          radius * 0.3, radius * 0.2, angle, 0, Math.PI * 2
        );
        ctx.fill();
      }
    }

    if (planet.name === 'Jupiter') {
      // Bands
      ctx.strokeStyle = 'rgba(139, 90, 43, 0.3)';
      ctx.lineWidth = 2;
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath();
        ctx.moveTo(-radius, i * radius * 0.25);
        ctx.lineTo(radius, i * radius * 0.25);
        ctx.stroke();
      }
      
      // Great Red Spot
      ctx.fillStyle = 'rgba(255, 69, 0, 0.5)';
      ctx.beginPath();
      ctx.ellipse(radius * 0.3, radius * 0.1, radius * 0.25, radius * 0.15, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    if (planet.name === 'Saturn') {
      ctx.restore();
      // Rings
      for (let i = 0; i < 3; i++) {
        const ringRadius = radius * (1.5 + i * 0.2);
        ctx.beginPath();
        ctx.ellipse(x, y, ringRadius, ringRadius * 0.3, Math.PI / 6, 0, Math.PI * 2);
        const ringColor = `rgba(${220 - i * 20}, ${180 - i * 20}, ${120 - i * 20}, ${0.5 - i * 0.1})`;
        ctx.strokeStyle = ringColor;
        ctx.lineWidth = 3;
        ctx.stroke();
      }
      ctx.save();
      ctx.translate(x, y);
    }

    ctx.restore();

    // Moon
    if (planet.moon) {
      planet.moon.angle += planet.moon.angularVelocity * timeSpeed;
      const mx = x + planet.moon.distance * Math.cos(planet.moon.angle);
      const my = y + planet.moon.distance * Math.sin(planet.moon.angle) * tilt;
      
      const moonGrad = ctx.createRadialGradient(
        mx - planet.moon.radius * 0.3, my - planet.moon.radius * 0.3, planet.moon.radius * 0.1,
        mx, my, planet.moon.radius
      );
      moonGrad.addColorStop(0, '#f0f0f0');
      moonGrad.addColorStop(0.5, '#c0c0c0');
      moonGrad.addColorStop(1, '#808080');
      
      ctx.beginPath();
      ctx.arc(mx, my, planet.moon.radius, 0, Math.PI * 2);
      ctx.fillStyle = moonGrad;
      ctx.fill();

      // Moon craters
      ctx.fillStyle = 'rgba(100, 100, 100, 0.2)';
      for (let i = 0; i < 2; i++) {
        const craterX = mx + (Math.random() - 0.5) * planet.moon.radius;
        const craterY = my + (Math.random() - 0.5) * planet.moon.radius;
        ctx.beginPath();
        ctx.arc(craterX, craterY, planet.moon.radius * 0.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Labels
    if (settings.showLabels) {
      ctx.save();
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.shadowBlur = 4;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.fillText(planet.name, x, y + radius + 15);
      ctx.restore();
    }
  });
}

// Draw asteroids
function drawAsteroids() {
  asteroids.forEach(a => {
    a.angle += a.angularVelocity * timeSpeed;
    const ax = centerX + a.distance * Math.cos(a.angle);
    const ay = centerY + a.distance * Math.sin(a.angle) * tilt;
    
    ctx.beginPath();
    ctx.arc(ax, ay, a.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(170, 170, 170, ${a.brightness})`;
    ctx.fill();
  });
}

// Draw sun with enhanced glow
function drawSun() {
  if (settings.showGlow) {
    // Outer glow
    const outerGlow = ctx.createRadialGradient(centerX, centerY, sun.radius * 0.5, centerX, centerY, sun.radius * 2);
    outerGlow.addColorStop(0, 'rgba(255, 200, 50, 0.3)');
    outerGlow.addColorStop(0.5, 'rgba(255, 180, 0, 0.1)');
    outerGlow.addColorStop(1, 'rgba(255, 160, 0, 0)');
    ctx.beginPath();
    ctx.arc(centerX, centerY, sun.radius * 2, 0, Math.PI * 2);
    ctx.fillStyle = outerGlow;
    ctx.fill();
  }

  // Sun body
  const sunGrad = ctx.createRadialGradient(
    centerX - sun.radius * 0.2, centerY - sun.radius * 0.2, sun.radius * 0.1,
    centerX, centerY, sun.radius
  );
  sunGrad.addColorStop(0, '#fffacd');
  sunGrad.addColorStop(0.2, '#fff9a3');
  sunGrad.addColorStop(0.4, '#fff176');
  sunGrad.addColorStop(0.6, '#ffd54f');
  sunGrad.addColorStop(0.8, '#ffb300');
  sunGrad.addColorStop(1, '#ff8f00');
  
  ctx.save();
  if (settings.showGlow) {
    ctx.shadowBlur = 40;
    ctx.shadowColor = '#ffb300';
  }
  ctx.beginPath();
  ctx.arc(centerX, centerY, sun.radius, 0, Math.PI * 2);
  ctx.fillStyle = sunGrad;
  ctx.fill();
  ctx.restore();

  // Sun texture
  ctx.fillStyle = 'rgba(255, 140, 0, 0.1)';
  for (let i = 0; i < 8; i++) {
    const angle = (Date.now() * 0.0001 + i) % (Math.PI * 2);
    ctx.beginPath();
    ctx.arc(
      centerX + Math.cos(angle) * sun.radius * 0.3,
      centerY + Math.sin(angle) * sun.radius * 0.3,
      sun.radius * 0.15,
      0, Math.PI * 2
    );
    ctx.fill();
  }
}

// Animate
function animate() {
  // Clear with gradient background
  const bgGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.max(canvas.width, canvas.height));
  bgGrad.addColorStop(0, '#0a0a1a');
  bgGrad.addColorStop(0.5, '#050510');
  bgGrad.addColorStop(1, '#000000');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawStars();
  drawOrbits();
  drawTrails();
  drawSun();
  drawPlanets();
  drawAsteroids();

  requestAnimationFrame(animate);
}

// Resize canvas
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  initialize();
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
animate();

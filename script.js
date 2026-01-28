// Get canvas and context
const canvas = document.getElementById('solarSystem');
const ctx = canvas.getContext('2d');

let centerX, centerY;
const tilt = 0.92; // Orbital tilt for pseudo-3D

// Solar system data
const solarData = {
  sun: { radius: 50 },
  planets: [
    { name: 'Mercury', radius: 5, a: 70, b: 68, speed: 0.047 },
    { name: 'Venus', radius: 12, a: 100, b: 98, speed: 0.035 },
    { name: 'Earth', radius: 13, a: 140, b: 138, speed: 0.03, moon: { radius: 4, distance: 20, speed: 0.05 } },
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

// Initialize
function initialize() {
  centerX = canvas.width / 2;
  centerY = canvas.height / 2;
  sun = solarData.sun;

  planets = solarData.planets.map(p => ({
    ...p,
    angle: Math.random() * Math.PI * 2,
    rotation: 0,
    rotationSpeed: p.name === 'Earth' ? 0.0005 :
                   p.name === 'Venus' ? 0.0003 :
                   p.name === 'Mercury' ? 0.0008 :
                   p.name === 'Mars' ? 0.0004 :
                   p.name === 'Jupiter' ? 0.0002 :
                   p.name === 'Saturn' ? 0.00015 :
                   p.name === 'Uranus' ? 0.0001 :
                   0.0001,
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

// Draw stars
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

// Draw planets with pseudo-3D
function drawPlanets() {
  const sorted = planets.slice().sort((a,b) => (a.a + a.b)/2 - (b.a + b.b)/2);
  sorted.forEach(planet => {
    planet.angle += planet.speed;
    planet.rotation += planet.rotationSpeed;

    const x = centerX + planet.a * Math.cos(planet.angle);
    const y = centerY + planet.b * Math.sin(planet.angle) * tilt;

    const scale = 0.8 + 0.2 * (planet.b / 400);
    const radius = planet.radius * scale;

    const gradient = ctx.createRadialGradient(
      x - radius / 3, y - radius / 3, radius / 5,
      x, y, radius
    );

    switch (planet.name) {
      case 'Mercury': gradient.addColorStop(0,'#e0e0e0'); gradient.addColorStop(1,'#7a7a7a'); break;
      case 'Venus': gradient.addColorStop(0,'#fff5e6'); gradient.addColorStop(1,'#d4b58c'); break;
      case 'Earth': gradient.addColorStop(0,'#6ec1ff'); gradient.addColorStop(0.7,'#2e86c1'); gradient.addColorStop(1,'#133f73'); break;
      case 'Mars': gradient.addColorStop(0,'#ff7f50'); gradient.addColorStop(1,'#b03d1d'); break;
      case 'Jupiter': gradient.addColorStop(0,'#ffe0b2'); gradient.addColorStop(1,'#b07250'); break;
      case 'Saturn': gradient.addColorStop(0,'#fff8c4'); gradient.addColorStop(1,'#d4c08c'); break;
      case 'Uranus': gradient.addColorStop(0,'#b0f0ff'); gradient.addColorStop(1,'#4da3cc'); break;
      case 'Neptune': gradient.addColorStop(0,'#66a3ff'); gradient.addColorStop(1,'#1c3fa0'); break;
    }

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(planet.rotation);

    ctx.beginPath();
    ctx.arc(0,0,radius,0,Math.PI*2);
    ctx.fillStyle = gradient;
    ctx.fill();

    if(planet.name==='Earth' || planet.name==='Venus'){
      ctx.beginPath();
      ctx.arc(0,0,radius+3,0,Math.PI*2);
      ctx.fillStyle = planet.name==='Earth'?'rgba(135,206,235,0.3)':'rgba(255,223,186,0.25)';
      ctx.fill();
    }

    if(planet.name==='Earth'){
      for(let i=0;i<3;i++){
        ctx.beginPath();
        const cloudR = radius*(0.1 + Math.random()*0.4);
        const angle = Math.random()*Math.PI*2;
        ctx.arc(Math.cos(angle)*radius*0.5, Math.sin(angle)*radius*0.5, cloudR,0,Math.PI*2);
        ctx.fillStyle='rgba(255,255,255,0.3)';
        ctx.fill();
      }
    }

    ctx.restore();

    if(planet.moon){
      planet.moon.angle += planet.moon.speed;
      const mx = x + planet.moon.distance*Math.cos(planet.moon.angle);
      const my = y + planet.moon.distance*Math.sin(planet.moon.angle)*tilt;
      const moonGrad = ctx.createRadialGradient(mx - planet.moon.radius/3,my - planet.moon.radius/3, planet.moon.radius/4, mx, my, planet.moon.radius);
      moonGrad.addColorStop(0,'#dddddd'); moonGrad.addColorStop(1,'#888888');
      ctx.beginPath(); ctx.arc(mx,my,planet.moon.radius,0,Math.PI*2); ctx.fillStyle=moonGrad; ctx.fill();
    }

    if(planet.name==='Saturn'){
      ctx.beginPath();
      ctx.ellipse(x, y, radius*1.6, radius*0.5, Math.PI/4, 0, Math.PI*2);
      ctx.strokeStyle='rgba(200,180,120,0.6)'; ctx.lineWidth=4; ctx.stroke();
    }
  });
}

// Draw asteroids
function drawAsteroids(){
  asteroids.forEach(a=>{
    a.angle += a.speed;
    const ax = centerX + a.distance*Math.cos(a.angle);
    const ay = centerY + a.distance*Math.sin(a.angle)*tilt;
    ctx.beginPath(); ctx.arc(ax,ay,a.radius,0,Math.PI*2); ctx.fillStyle='#aaaaaa'; ctx.fill();
  });
}

// Animate
function animate(){
  ctx.fillStyle='black'; ctx.fillRect(0,0,canvas.width,canvas.height);
  drawStars();

  const sunGrad = ctx.createRadialGradient(centerX,centerY,sun.radius*0.2,centerX,centerY,sun.radius);
  sunGrad.addColorStop(0,'#fff9a3'); sunGrad.addColorStop(0.3,'#fff176'); sunGrad.addColorStop(0.6,'#ffd54f'); sunGrad.addColorStop(0.8,'#ffb300'); sunGrad.addColorStop(1,'#ffa000');
  ctx.beginPath(); ctx.arc(centerX,centerY,sun.radius,0,Math.PI*2); ctx.fillStyle=sunGrad; ctx.fill();

  drawPlanets(); drawAsteroids();
  requestAnimationFrame(animate);
}

// Resize canvas
function resizeCanvas(){ canvas.width=window.innerWidth; canvas.height=window.innerHeight; initialize(); }
window.addEventListener('resize',resizeCanvas);
resizeCanvas(); animate();

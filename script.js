const heartsBg = document.getElementById('heartsBg');
const noBtn = document.getElementById('noBtn');
const yesBtn = document.getElementById('yesBtn');
const buttonRow = document.getElementById('buttonRow');
const taunt = document.getElementById('taunt');
const askCard = document.getElementById('askCard');
const celebrateCard = document.getElementById('celebrateCard');

// ambient floating hearts
setInterval(() => {
  const heart = document.createElement('span');
  heart.className = 'heart';
  heart.textContent = ['💕', '💖', '💗', '❤️', '💘'][Math.floor(Math.random() * 5)];
  heart.style.left = Math.random() * 100 + 'vw';
  heart.style.fontSize = 14 + Math.random() * 18 + 'px';
  const duration = 6 + Math.random() * 5;
  heart.style.animationDuration = duration + 's';
  heartsBg.appendChild(heart);
  setTimeout(() => heart.remove(), duration * 1000);
}, 400);

const taunts = [
  "Nice try 😏",
  "Nope, try again!",
  "You can't escape this button!",
  "The 'No' button is shy 🙈",
  "C'mon, just say yes!",
  "It's getting harder to say no, huh?",
];

let dodgeCount = 0;
let lastDodge = 0;

function dodgeNoButton() {
  const now = Date.now();
  if (now - lastDodge < 150) return;
  lastDodge = now;
  dodgeCount++;

  // reparent to <body> so `position: fixed` is relative to the viewport,
  // not trapped by .card's transform-bearing animation (which would
  // otherwise create a new containing block for fixed descendants)
  if (noBtn.parentElement !== document.body) document.body.appendChild(noBtn);

  const margin = 20;
  const maxX = window.innerWidth - noBtn.offsetWidth - margin;
  const maxY = window.innerHeight - noBtn.offsetHeight - margin;
  const x = margin + Math.random() * Math.max(0, maxX - margin);
  const y = margin + Math.random() * Math.max(0, maxY - margin);

  noBtn.classList.add('dodging');
  noBtn.style.left = x + 'px';
  noBtn.style.top = y + 'px';

  taunt.textContent = taunts[Math.min(dodgeCount - 1, taunts.length - 1)];

  const scale = Math.max(0.5, 1 - dodgeCount * 0.06);
  noBtn.style.transform = `scale(${scale})`;

  const yesScale = Math.min(1.8, 1 + dodgeCount * 0.08);
  yesBtn.style.transform = `scale(${yesScale})`;
}

// hover dodges it on desktop; a touch is the mobile equivalent of hover here.
// no separate 'click' handler — keeping both caused a double-trigger jump on tap.
noBtn.addEventListener('mouseover', dodgeNoButton);
noBtn.addEventListener('touchstart', (e) => {
  e.preventDefault();
  dodgeNoButton();
}, { passive: false });

window.addEventListener('resize', () => {
  if (noBtn.classList.contains('dodging')) dodgeNoButton();
});

yesBtn.addEventListener('click', () => {
  askCard.hidden = true;
  noBtn.hidden = true;
  celebrateCard.hidden = false;
  burstConfetti();
});

// lightweight vanilla confetti burst
const canvas = document.getElementById('confetti');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.style.width = window.innerWidth + 'px';
  canvas.style.height = window.innerHeight + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const colors = ['#ff6b9d', '#d6336c', '#ffd166', '#06d6a0', '#4cc9f0'];

function burstConfetti() {
  const pieces = Array.from({ length: 160 }, () => ({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    vx: (Math.random() - 0.5) * 14,
    vy: (Math.random() - 1.2) * 14,
    size: 6 + Math.random() * 6,
    color: colors[Math.floor(Math.random() * colors.length)],
    rotation: Math.random() * 360,
    spin: (Math.random() - 0.5) * 12,
    life: 0,
  }));

  function frame() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    let alive = false;
    for (const p of pieces) {
      p.life++;
      if (p.life > 140) continue;
      alive = true;
      p.vy += 0.35;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.spin;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, 1 - p.life / 140);
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx.restore();
    }
    if (alive) requestAnimationFrame(frame);
    else ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  }
  requestAnimationFrame(frame);
}

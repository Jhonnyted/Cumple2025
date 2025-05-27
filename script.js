// Contador desde el 4 de febrero de 2024
function actualizarContador() {
  const inicio = new Date('2024-02-04T00:00:00');
  const ahora = new Date();
  const diff = ahora - inicio;

  const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
  const horas = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutos = Math.floor((diff / (1000 * 60)) % 60);
  const segundos = Math.floor((diff / 1000) % 60);

  document.getElementById("contador").innerHTML = 
    `Mi amor por ti comenzó hace:<br>${dias} días, ${horas}h ${minutos}m ${segundos}s`;
}

setInterval(actualizarContador, 1000);
actualizarContador();

// Pétalos cayendo
const canvas = document.getElementById("petalos");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let petalos = [];
for (let i = 0; i < 100; i++) {
  petalos.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 5 + 2,
    d: Math.random() * 2 + 1
  });
}

function drawPetalos() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(255,182,193,0.8)";
  ctx.beginPath();
  for (let i = 0; i < petalos.length; i++) {
    let p = petalos[i];
    ctx.moveTo(p.x, p.y);
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2, true);
  }
  ctx.fill();
  moverPetalos();
}

function moverPetalos() {
  for (let i = 0; i < petalos.length; i++) {
    let p = petalos[i];
    p.y += p.d;
    if (p.y > canvas.height) {
      p.y = 0;
      p.x = Math.random() * canvas.width;
    }
  }
}

setInterval(drawPetalos, 33);

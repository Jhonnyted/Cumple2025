const canvas = document.getElementById("arbolCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let centroX = canvas.width / 2;
const altura = canvas.height;
const semillaBase = altura - 40;
let semillaY = -50;
let semillaCayendo = true;
let moverArbol = false;
let desplazamientoX = 0;

const hojas = [];
const hojasFijas = [];
const colores = ["#f43f5e", "#f97316", "#facc15", "#84cc16", "#22d3ee"];

function dibujarTrapezoide(x1, y1, x2, y2, anchoBase, anchoPunta, color, borde = false) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const ux = dx / dist;
  const uy = dy / dist;
  const px = -uy;
  const py = ux;

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x1 + px * anchoBase, y1 + py * anchoBase);
  ctx.lineTo(x2 + px * anchoPunta, y2 + py * anchoPunta);
  ctx.lineTo(x2 - px * anchoPunta, y2 - py * anchoPunta);
  ctx.lineTo(x1 - px * anchoBase, y1 - py * anchoBase);
  ctx.closePath();
  ctx.fill();

  if (borde) {
    ctx.strokeStyle = "#2f1f00";
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

function Rama(x, y, longitud, angulo, profundidad, anchoPadre = 0) {
  this.x = x;
  this.y = y;
  this.longitud = longitud;
  this.angulo = angulo;
  this.profundidad = profundidad;
  this.progress = 0;
  this.anchoPadre = anchoPadre;

  this.actualizar = function () {
    if (this.progress < 1) {
      this.progress += 0.01;
      if (this.progress > 1) this.progress = 1;
    }

    const easedProgress = 1 - Math.pow(1 - this.progress, 3);
    const finX = this.x + Math.cos(this.angulo) * this.longitud * easedProgress;
    const finY = this.y - Math.sin(this.angulo) * this.longitud * easedProgress;

    let anchoBase, anchoPunta, colorRama;

    if (this.profundidad === 0) {
      anchoBase = 30 * easedProgress;
      anchoPunta = 8 * easedProgress;
      colorRama = "#4b2e05";
    } else {
      anchoBase = Math.max(this.anchoPadre * 0.7, 1.5);
      anchoPunta = Math.max(anchoBase * 0.6, 1);
      const verde = 50 + this.profundidad * 15;
      colorRama = `rgb(60,${verde},20)`;
    }

    dibujarTrapezoide(this.x + desplazamientoX, this.y, finX + desplazamientoX, finY, anchoBase, anchoPunta, colorRama, this.profundidad === 0);

    if (this.progress >= 1 && !this.expandidas && this.profundidad < 6) {
      const angOffset = 0.35 + Math.random() * 0.3;
      const longFactor = 0.6 + Math.random() * 0.2;
      const nuevaLongitud = this.longitud * longFactor;

      ramasCrecidas.push(
        new Rama(finX, finY, nuevaLongitud, this.angulo - angOffset, this.profundidad + 1, anchoPunta),
        new Rama(finX, finY, nuevaLongitud, this.angulo + angOffset, this.profundidad + 1, anchoPunta),
        new Rama(finX, finY, nuevaLongitud * 0.8, this.angulo + (Math.random() - 0.5) * 0.5, this.profundidad + 1, anchoPunta)
      );

      this.expandidas = true;
    }

    if (this.progress >= 1 && this.profundidad >= 3 && !this.hojaColocada) {
      hojasFijas.push({
        x: finX,
        y: finY,
        radio: 7 + Math.random() * 4,
        color: colores[Math.floor(Math.random() * colores.length)],
        usada: false
      });
      this.hojaColocada = true;
    }
  };
}

function dibujarHoja(hoja) {
  ctx.save();
  ctx.translate(hoja.x + desplazamientoX, hoja.y);
  ctx.globalAlpha = hoja.opacity;
  ctx.rotate(Math.sin(hoja.angle) * 0.3);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(-hoja.radio, -hoja.radio, -hoja.radio, hoja.radio / 2, 0, hoja.radio * 1.5);
  ctx.bezierCurveTo(hoja.radio, hoja.radio / 2, hoja.radio, -hoja.radio, 0, 0);
  ctx.fillStyle = hoja.color;
  ctx.fill();
  ctx.restore();
}

let ramasCrecidas = [];
let frame = 0;

function animar() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (semillaCayendo) {
    if (semillaY < semillaBase) {
      semillaY += 3;
      ctx.beginPath();
      ctx.arc(centroX, semillaY, 10, 0, Math.PI * 2);
      ctx.fillStyle = "#7c3aed";
      ctx.fill();
    } else {
      semillaCayendo = false;
      ramasCrecidas.push(new Rama(centroX, semillaBase, 140, Math.PI / 2, 0, 30));
      moverArbol = true;
    }
  } else {
    if (moverArbol && desplazamientoX < 100) {
      desplazamientoX += 0.3;
    }

    ramasCrecidas.forEach((r) => r.actualizar());

    // Agregar hojas gradualmente
    if (frame % 10 === 0 && hojas.length < 100) {
      const hojasDisponibles = hojasFijas.filter(h => !h.usada);
      if (hojasDisponibles.length > 0) {
        const origen = hojasDisponibles[Math.floor(Math.random() * hojasDisponibles.length)];
        hojas.push({
          x: origen.x,
          y: origen.y,
          radio: 7 + Math.random() * 3,
          vx: -0.2 + Math.random() * -0.3,  // viento suave hacia la izquierda
          vy: 0.3 + Math.random() * 0.1,    // caída vertical más lenta
          angle: Math.random() * Math.PI * 2,
          opacity: 1,
          color: colores[Math.floor(Math.random() * colores.length)]
        });
        origen.usada = true;
      }
    }

    hojas.forEach((hoja, i) => {
      hoja.x += hoja.vx + Math.sin((frame + i) / 60) * 0.2;
      hoja.y += hoja.vy + Math.cos((frame + i) / 80) * 0.2;
      hoja.angle += 0.01;

      // Desvanecer si pasa cerca del texto
      if (hoja.x + desplazamientoX < 350 && hoja.y > canvas.height * 0.35 && hoja.y < canvas.height * 0.75) {
        hoja.opacity = Math.max(0.1, hoja.opacity - 0.01);
      } else {
        hoja.opacity = Math.min(1, hoja.opacity + 0.005);
      }

      // Eliminar si llega al suelo
      if (hoja.y > canvas.height) {
        hojas.splice(i, 1);
        return;
      }

      dibujarHoja(hoja);
    });

    hojasFijas.forEach((hoja) => dibujarHoja(hoja));
  }

  frame++;
  requestAnimationFrame(animar);
}
animar();

const contador = document.getElementById("contador");
function actualizarContador() {
  const inicio = new Date("2024-02-04T00:00:00");
  const ahora = new Date();
  const diferencia = ahora - inicio;
  const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
  const horas = Math.floor((diferencia / (1000 * 60 * 60)) % 24);
  const minutos = Math.floor((diferencia / (1000 * 60)) % 60);
  const segundos = Math.floor((diferencia / 1000) % 60);
  contador.textContent = `Llevamos ${dias} días, ${horas} horas, ${minutos} minutos, ${segundos} segundos.`;
}
setInterval(actualizarContador, 1000);
actualizarContador();

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  centroX = canvas.width / 2;
  semillaY = -50;
  semillaCayendo = true;
  ramasCrecidas = [];
  hojas.length = 0;
  hojasFijas.length = 0;
  desplazamientoX = 0;
});

// Texto animado letra por letra con fade-in final más lento y suave
const mensaje = "El amor es como una semilla:\npequeña, pero llena de esperanza.\nCon cuidado, tiempo y ternura,\ncrece, florece y se convierte\nen algo hermoso e inmenso.";
const textoDiv = document.getElementById("texto");
let i = 0;
function escribirTexto() {
  if (i < mensaje.length) {
    textoDiv.textContent += mensaje.charAt(i);
    i++;
    setTimeout(escribirTexto, 120); // más lento
  } else {
    textoDiv.classList.add("aparecer");
  }
}
setTimeout(() => {
  textoDiv.classList.add("aparecer");
  escribirTexto();
}, 1000);

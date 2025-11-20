/* ---------------------------
   ELEMENTOS PRINCIPALES
----------------------------*/
const mask = document.getElementById("mask");
const cursor = document.createElement("div");
cursor.className = "cursor";
document.body.appendChild(cursor);

const marte = document.getElementById("marte");
const planetsContainer = document.getElementById("planets");
const progressWrap = document.getElementById("progressWrap");
const bar = document.getElementById("bar");
const secondsLabel = document.getElementById("seconds");

let pointing = false;
let pointerX = window.innerWidth / 2;
let pointerY = window.innerHeight / 2;
let holdStart = null;
const HOLD_TIME = 6;
let found = false;

/* ---------------------------
   GENERAR PLANETAS RANDOM RESPONSIVE SIN PISAR EL TEXTO
----------------------------*/
const PLANET_IMAGES = [
  "mercurio.png",
  "venus.png",
  "tierra.png",
  "saturno.png",
  "urano.png",
  "pluton.png",
];

let planets = [];
const textArea = document.querySelector(".text"); // área a evitar

function createPlanets() {
  planetsContainer.innerHTML = "";
  planets = [];

  // Ajustamos tamaño mínimo según ancho de pantalla (para mobile)
  const MIN_SIZE = window.innerWidth < 500 ? 10 : 8;  // vmin
  const MAX_SIZE = window.innerWidth < 500 ? 18 : 15; // vmin

  const textRect = textArea.getBoundingClientRect();

  PLANET_IMAGES.forEach((name) => {
    const planet = document.createElement("div");
    planet.className = "planet";

    const img = document.createElement("img");
    img.src = "./assets/img/planets/" + name;
    planet.appendChild(img);

    // Tamaño aleatorio
    const size = Math.random() * (MAX_SIZE - MIN_SIZE) + MIN_SIZE;
    planet.dataset.size = size;
    planet.style.width = size + "vmin";
    planet.style.height = size + "vmin";

    let left, top, planetRect;

    // Generamos posición aleatoria, pero evitando el área del texto
    let attempts = 0;
    do {
      left = Math.random() * 80 + 10; // en vw
      top = Math.random() * 80 + 10;  // en vh
      planet.style.left = left + "vw";
      planet.style.top = top + "vh";
      planetRect = planet.getBoundingClientRect();
      attempts++;
      // Evitamos pisar el texto o pasarnos de la pantalla
    } while (
      intersects(planetRect, textRect) &&
      attempts < 50
    );

    planet.dataset.left = left;
    planet.dataset.top = top;

    planetsContainer.appendChild(planet);
    planets.push(planet);
  });
}

// Función para detectar intersección entre dos rectángulos
function intersects(r1, r2) {
  return !(
    r2.left > r1.right ||
    r2.right < r1.left ||
    r2.top > r1.bottom ||
    r2.bottom < r1.top
  );
}

// Recalcular planetas al cambiar tamaño de ventana
function resizePlanets() {
  const MIN_SIZE = window.innerWidth < 500 ? 10 : 8;  // vmin
  const MAX_SIZE = window.innerWidth < 500 ? 18 : 15; // vmin

  const textRect = textArea.getBoundingClientRect();

  planets.forEach((planet) => {
    const size = planet.dataset.size;
    planet.style.width = size + "vmin";
    planet.style.height = size + "vmin";

    let left = planet.dataset.left;
    let top = planet.dataset.top;

    let planetRect = planet.getBoundingClientRect();

    // Si intersecta con texto, generar nueva posición
    let attempts = 0;
    while (intersects(planetRect, textRect) && attempts < 50) {
      left = Math.random() * 80 + 10;
      top = Math.random() * 80 + 10;
      planet.style.left = left + "vw";
      planet.style.top = top + "vh";
      planetRect = planet.getBoundingClientRect();
      attempts++;
    }

    planet.dataset.left = left;
    planet.dataset.top = top;

    planet.style.left = left + "vw";
    planet.style.top = top + "vh";
  });
}

// Crear planetas iniciales
createPlanets();

// Evento resize
window.addEventListener("resize", resizePlanets);

/* ---------------------------
   LINTERNA / ACTUALIZAR MÁSCARA
----------------------------*/
function setMask(x, y) {
  mask.style.setProperty("--x", x + "px");
  mask.style.setProperty("--y", y + "px");
  cursor.style.left = x + "px";
  cursor.style.top = y + "px";
}

function tick() {
  setMask(pointerX, pointerY);
  requestAnimationFrame(tick);
}
tick();

/* ---------------------------
   DETECTAR SI APUNTAMOS A MARTE
----------------------------*/
function isOverMarte(x, y) {
  const r = marte.getBoundingClientRect();
  return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
}

/* ---------------------------
   SISTEMA DE HOLD 6s
----------------------------*/
function startHold() {
  if (found) return;
  if (isOverMarte(pointerX, pointerY) && holdStart === null) {
    holdStart = performance.now();
    updateHold();
  }
}

function cancelHold() {
  holdStart = null;
  bar.style.width = "0%";
  secondsLabel.textContent = "0s";
}

function updateHold() {
  if (holdStart === null) return;

  const elapsed = (performance.now() - holdStart) / 1000;

  if (!pointing || !isOverMarte(pointerX, pointerY)) {
    cancelHold();
    return;
  }

  const progress = Math.min(1, elapsed / HOLD_TIME);
  bar.style.width = Math.round(progress * 100) + "%";
  secondsLabel.textContent = Math.floor(elapsed) + "s";

  if (progress >= 1) {
    revealPage();
    cancelHold();
    return;
  }

  requestAnimationFrame(updateHold);
}

/* ---------------------------
   AL TERMINAR LOS 6s / REVELAR PÁGINA
----------------------------*/
function revealPage() {
  found = true;
  mask.style.opacity = 0;

  progressWrap.style.display = "none";
  cursor.style.display = "none";

  // Activar lluvia de aliens
  spawnAliensRain();
}

/* ---------------------------
   LLUVIA DE ALIENS
----------------------------*/
function spawnAliensRain() {
  const aliensContainer = document.getElementById("aliensRain");
  const total = 40; // número de aliens

  for (let i = 0; i < total; i++) {
    const alien = document.createElement("img");
    alien.src = "./assets/img/alien.png"; // ruta correcta
    alien.classList.add("alien");

    alien.style.left = Math.random() * 100 + "vw";
    const size = 40 + Math.random() * 60; // tamaño aleatorio
    alien.style.width = size + "px";
    alien.style.height = size + "px";

    alien.style.animationDuration = 2 + Math.random() * 3 + "s"; // velocidad aleatoria
    alien.style.animationDelay = Math.random() * 1.5 + "s"; // delay aleatorio

    aliensContainer.appendChild(alien);

    // eliminar después de caer
    setTimeout(() => {
      alien.remove();
    }, 6000);
  }
}

/* ---------------------------
   EVENTOS PRINCIPALES
----------------------------*/
function onPointerDown(e) {
  pointing = true;
  cursor.style.display = "block";

  pointerX = e.clientX ?? e.touches?.[0].clientX ?? pointerX;
  pointerY = e.clientY ?? e.touches?.[0].clientY ?? pointerY;

  startHold();
}

function onPointerMove(e) {
  pointerX = e.clientX ?? e.touches?.[0].clientX ?? pointerX;
  pointerY = e.clientY ?? e.touches?.[0].clientY ?? pointerY;

  if (pointing) {
    if (holdStart !== null && !isOverMarte(pointerX, pointerY)) {
      cancelHold();
    } else if (holdStart === null) {
      startHold();
    }
  }
}

function onPointerUp() {
  pointing = false;
  cursor.style.display = "none";
  cancelHold();
}

["pointerdown", "pointermove", "pointerup", "pointercancel"].forEach((ev) => {
  window.addEventListener(
    ev,
    (e) => {
      if (ev === "pointerdown") onPointerDown(e);
      if (ev === "pointermove") onPointerMove(e);
      if (ev === "pointerup" || ev === "pointercancel") onPointerUp();
    },
    { passive: false }
  );
});

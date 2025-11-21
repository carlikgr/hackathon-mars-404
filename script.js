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
   UTILITY: INTERSECCIÓN RECTÁNGULOS
----------------------------*/
function intersects(r1, r2) {
  return !(
    r2.left > r1.right ||
    r2.right < r1.left ||
    r2.top > r1.bottom ||
    r2.bottom < r1.top
  );
}

/* ---------------------------
   GENERAR PLANETAS RESPONSIVOS + ANTI-COLISIÓN CON EL TÍTULO
----------------------------*/
const PLANET_IMAGES = [
  "mercurio.png",
  "venus.png",
  "tierra.png",
  "saturno.png",
  "urano.png",
  "pluton.png",
];

function createPlanets() {
  planetsContainer.innerHTML = "";

  // Rectángulo donde NO pueden aparecer
  const textRect = document.querySelector(".text").getBoundingClientRect();

  // Tamaños seguros según pantalla
  const MIN_PX = window.innerWidth < 500 ? 60 : 80;
  const MAX_PX = window.innerWidth < 500 ? 110 : 150;

  PLANET_IMAGES.forEach((name) => {
    const planet = document.createElement("div");
    planet.className = "planet";

    const img = document.createElement("img");
    img.src = "./assets/img/planets/" + name;
    planet.appendChild(img);

    const size = Math.random() * (MAX_PX - MIN_PX) + MIN_PX;
    planet.style.width = size + "px";
    planet.style.height = size + "px";

    let x, y, rect;
    let attempts = 0;

    do {
      x = Math.random() * (window.innerWidth - size);
      y = Math.random() * (window.innerHeight - size);

      planet.style.left = x + "px";
      planet.style.top = y + "px";

      rect = planet.getBoundingClientRect();
      attempts++;
    } while (intersects(rect, textRect) && attempts < 80);

    planetsContainer.appendChild(planet);
  });
}

createPlanets();

/* ---------------------------
   LINTERNA (SEGUIMIENTO CURSOR)
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
   DETECTAR SI EL PUNTERO ESTÁ SOBRE MARTE
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
   LLUVIA DE ALIENS
----------------------------*/
function spawnAliensRain() {
  const aliensContainer = document.getElementById("aliensRain");
  const total = 40;

  for (let i = 0; i < total; i++) {
    const alien = document.createElement("img");
    alien.src = "./assets/img/alien.png";
    alien.classList.add("alien");

    alien.style.left = Math.random() * 100 + "vw";

    // Tamaños diferentes según pantalla
    let size;
    if (window.innerWidth > 768) {
      // Desktop → aliens grandes
      size = 90 + Math.random() * 70; // 90–160px
    } else {
      // Mobile
      size = 50 + Math.random() * 40; // 50–90px
    }

    alien.style.width = size + "px";
    alien.style.height = size + "px";

    alien.style.animationDuration = 2 + Math.random() * 3 + "s";
    alien.style.animationDelay = Math.random() * 1.5 + "s";

    aliensContainer.appendChild(alien);

    setTimeout(() => alien.remove(), 6000);
  }
}

/* ---------------------------
   REVELAR PÁGINA AL COMPLETAR 6s
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

/* ---------------------------
   REGENERAR PLANETAS AL RESIZE
----------------------------*/
window.addEventListener("resize", () => {
  createPlanets();
});

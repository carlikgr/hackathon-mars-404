const mask = document.getElementById("mask");
const cursor = document.createElement("div");
cursor.className = "cursor";
document.body.appendChild(cursor);
const marte = document.getElementById("marte");
const progressWrap = document.getElementById("progressWrap");
const bar = document.getElementById("bar");
const secondsLabel = document.getElementById("seconds");

let pointing = false;
let pointerX = window.innerWidth / 2,
  pointerY = window.innerHeight / 2;
let holdStart = null;
const HOLD_TIME = 6;
let holdTimer = null;
let found = false;

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

function isOverMarte(x, y) {
  const r = marte.getBoundingClientRect();
  return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
}

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
    unlockReveal();
    cancelHold();
    return;
  }
  holdTimer = requestAnimationFrame(updateHold);
}

function unlockReveal() {
  found = true;
  mask.style.opacity = 0;
  progressWrap.style.display = "none";
  cursor.style.display = "none";
}

function onPointerDown(e) {
  pointing = true;
  pointerX = e.clientX || (e.touches && e.touches[0].clientX) || pointerX;
  pointerY = e.clientY || (e.touches && e.touches[0].clientY) || pointerY;
  cursor.style.display = "block";
  startHold();
}
function onPointerMove(e) {
  pointerX = e.clientX || (e.touches && e.touches[0].clientX) || pointerX;
  pointerY = e.clientY || (e.touches && e.touches[0].clientY) || pointerY;
  if (pointing) {
    if (holdStart !== null) {
      if (!isOverMarte(pointerX, pointerY)) cancelHold();
    } else startHold();
  }
}
function onPointerUp() {
  pointing = false;
  cursor.style.display = "none";
  cancelHold();
}

["pointerdown", "pointermove", "pointerup", "pointercancel"].forEach((name) => {
  window.addEventListener(
    name,
    (e) => {
      if (name === "pointerdown") onPointerDown(e);
      if (name === "pointermove") onPointerMove(e);
      if (name === "pointerup" || name === "pointercancel") onPointerUp(e);
    },
    { passive: false }
  );
});

window.addEventListener("resize", () => {});

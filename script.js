const mask = document.getElementById('mask');
let isActive = false;

function updatePosition(x, y) {
  mask.style.setProperty('--x', x + 'px');
  mask.style.setProperty('--y', y + 'px');
}

// 🖱️ Eventos de ratón
document.addEventListener('mousedown', e => {
  isActive = true;
  mask.classList.add('active');
  updatePosition(e.clientX, e.clientY);
});

document.addEventListener('mouseup', () => {
  isActive = false;
  mask.classList.remove('active');
});

document.addEventListener('mousemove', e => {
  if (isActive) updatePosition(e.clientX, e.clientY);
});

// 📱 Eventos táctiles (para móvil)
document.addEventListener('touchstart', e => {
  isActive = true;
  mask.classList.add('active');
  const touch = e.touches[0];
  updatePosition(touch.clientX, touch.clientY);
}, { passive: true });

document.addEventListener('touchmove', e => {
  if (!isActive) return;
  const touch = e.touches[0];
  updatePosition(touch.clientX, touch.clientY);
}, { passive: true });

document.addEventListener('touchend', () => {
  isActive = false;
  mask.classList.remove('active');
});

// 🚫 Evitar doble clic o zoom táctil
document.addEventListener('dblclick', e => e.preventDefault());
document.addEventListener('gesturestart', e => e.preventDefault());
(() => {
'use strict';
const machine = document.querySelector('.research-machine');
if (!machine) return;
const gears = [...machine.querySelectorAll('[data-domain]')];
const baseAngles = [-90, 30, 150];
const callout = machine.querySelector('.domain-callout');
callout.hidden = false;
callout.setAttribute('aria-hidden', 'true');
const sun = machine.querySelector('.gear-sun');
const motion = matchMedia('(prefers-reduced-motion: reduce)');
let carrier = 0, frame = 0, selected = null;
function draw() {
  // Fixed ring, 18-tooth sun and 24-tooth planets: move the carrier
  // and spin each gear at the planetary pitch-circle ratio.
  sun.setAttribute('transform', 'rotate(' + carrier * (1 + 66 / 18) + ')');
  gears.forEach((gear, i) => {
    const angle = (baseAngles[i] + carrier) * Math.PI / 180;
    gear.setAttribute('transform', 'translate(' + 126 * Math.cos(angle) + ' ' + 126 * Math.sin(angle) + ')');
    gear.querySelector('.gear-planet').setAttribute('transform', 'rotate(' + carrier * (1 - 66 / 24) + ')');
  });
}
function reveal() {
  const gear = gears[selected];
  machine.querySelector('#domain-title').textContent = gear.textContent.trim();
  const paragraph = machine.querySelector('#domain-' + gear.dataset.domain).content.querySelector('p');
  machine.querySelector('#domain-description').textContent = paragraph.textContent;
  gears.forEach((item, i) => item.setAttribute('aria-pressed', String(i === selected)));
  callout.setAttribute('aria-hidden', 'false');
  callout.classList.add('is-visible');
  machine.removeAttribute('aria-busy');
}
function select(index) {
  if (selected === index && callout.classList.contains('is-visible')) return;
  cancelAnimationFrame(frame);
  selected = index;
  callout.setAttribute('aria-hidden', 'true');
  callout.classList.remove('is-visible');
  machine.setAttribute('aria-busy', 'true');
  const start = carrier;
  // Place the chosen gear immediately to the right of the left-facing arrow.
  const desired = 180 - baseAngles[index];
  const delta = ((desired - start + 540) % 360 + 360) % 360 - 180;
  const target = start + delta;
  if (motion.matches || Math.abs(delta) < .01) {
    carrier = target; draw(); reveal(); return;
  }
  const startTime = performance.now();
  function tick(now) {
    const progress = Math.min((now - startTime) / 1100, 1);
    const eased = progress * progress * (3 - 2 * progress);
    carrier = start + delta * eased;
    draw();
    if (progress < 1) frame = requestAnimationFrame(tick);
    else reveal();
  }
  frame = requestAnimationFrame(tick);
}
gears.forEach((gear, index) => {
  gear.addEventListener('click', () => select(index));
  gear.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault(); select(index);
    }
  });
});
motion.addEventListener('change', () => { if (selected !== null) select(selected); });
draw();
})();

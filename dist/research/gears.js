(() => {
'use strict';
const machine = document.querySelector('.research-machine');
if (!machine) return;
const gears = [...machine.querySelectorAll('[data-domain]')];
// Clockwise arrival at the pointer: Discovery, Analysis, Design.
const baseAngles = [-90, 150, 30];
const callout = machine.querySelector('.domain-callout');
callout.hidden = false;
const sun = machine.querySelector('.gear-sun');
const motion = matchMedia('(prefers-reduced-motion: reduce)');
const domainImages = {
  discovery: {src:'./discovery.png', alt:'Flow field with a magnifying glass highlighting a governing equation'},
  analysis: {src:'./analysis.png', alt:'Simulation of a physical field evolving over successive time steps'},
  design: {src:'./design.png', alt:'Engineering drawings and component assemblies leading to a complete car'}
};
Object.values(domainImages).forEach(item => { const image = new Image(); image.src = item.src; });
let carrier = -90, frame = 0, selected = 0;
let autoTimer = 0;
const autoDelay = 6000;
function scheduleRotation() {
  window.clearTimeout(autoTimer);
  if (motion.matches || document.hidden) return;
  autoTimer = window.setTimeout(() => select((selected + 1) % gears.length), autoDelay);
}
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
  const visual = domainImages[gear.dataset.domain];
  const image = machine.querySelector('#domain-image');
  image.src = visual.src;
  image.alt = visual.alt;
  machine.querySelector('#domain-title').textContent = gear.textContent.trim();
  const paragraph = machine.querySelector('#domain-' + gear.dataset.domain).content.querySelector('p');
  machine.querySelector('#domain-description').replaceChildren(...[...paragraph.childNodes].map(node => node.cloneNode(true)));
  gears.forEach((item, i) => item.setAttribute('aria-pressed', String(i === selected)));
  callout.setAttribute('aria-hidden', 'false');
  callout.classList.add('is-visible');
  machine.removeAttribute('aria-busy');
  scheduleRotation();
}
function select(index) {
  window.clearTimeout(autoTimer);
  if (selected === index && callout.classList.contains('is-visible')) {
    scheduleRotation();
    return;
  }
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
motion.addEventListener('change', () => {
  select(selected);
  scheduleRotation();
});
document.addEventListener('visibilitychange', scheduleRotation);
draw();
reveal();
// Measure the space below the introduction instead of assuming a screen size.
// Document coordinates keep sizing stable when the visitor scrolls.
function fitOpeningView() {
  if (!matchMedia('(min-width: 761px)').matches) {
    machine.style.removeProperty('--research-gear-size');
    return;
  }
  const top = machine.getBoundingClientRect().top + window.scrollY;
  const available = window.innerHeight - top - 24;
  machine.style.setProperty('--research-gear-size', Math.max(240, Math.min(500, available)) + 'px');
}
fitOpeningView();
window.addEventListener('resize', fitOpeningView);
window.addEventListener('pageshow', fitOpeningView);
if (document.fonts) document.fonts.ready.then(fitOpeningView);
})();

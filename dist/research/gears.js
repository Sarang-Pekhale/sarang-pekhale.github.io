(() => {
'use strict';
const machine = document.querySelector('.research-machine');
if (!machine) return;
const descriptions = {
 discovery: ['Discovery', 'Connect observations, physical knowledge, and multimodal reasoning to explore candidate scientific explanations.'],
 analysis: ['Analysis', 'Combine numerical simulation, physics-based diagnostics, and machine learning to understand and evaluate physical systems.'],
 design: ['Design', 'Connect scientific insight and predictive models to explore engineering possibilities and inform design decisions.']
};
const gears = [...machine.querySelectorAll('[data-domain]')];
function select(gear) {
 gears.forEach(item => item.setAttribute('aria-pressed', String(item === gear)));
 const [title, description] = descriptions[gear.dataset.domain];
 machine.querySelector('#domain-title').textContent = title;
 machine.querySelector('#domain-description').textContent = description;
}
gears.forEach(gear => {
 gear.addEventListener('click', () => select(gear));
 gear.addEventListener('keydown', event => {
  if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); select(gear); }
 });
});
const motion = matchMedia('(prefers-reduced-motion: reduce)');
const toggle = machine.querySelector('.gear-toggle');
const ring = machine.querySelector('.gear-ring');
const sun = machine.querySelector('.gear-sun');
const planets = [...machine.querySelectorAll('.gear-planet')];
let paused = motion.matches, frame = 0, last = 0, angle = 0;
// Fixed planet axes. Pitch-circle ratios: sun 18, planets 24, ring 66 teeth.
function draw() {
 sun.setAttribute('transform', 'rotate(' + angle + ')');
 ring.setAttribute('transform', 'rotate(' + (-angle * 18 / 66) + ')');
 planets.forEach(planet => planet.setAttribute('transform', 'rotate(' + (-angle * 18 / 24 ) + ')'));
}
function tick(time) {
 if (last) angle = (angle + Math.min(time - last, 64) * .009) % 15840;
 last = time; draw(); frame = requestAnimationFrame(tick);
}
function sync() {
 cancelAnimationFrame(frame); last = 0;
 toggle.textContent = paused ? 'Play animation' : 'Pause animation';
 if (!paused && !document.hidden) frame = requestAnimationFrame(tick);
}
toggle.hidden = false;
toggle.addEventListener('click', () => { paused = !paused; sync(); });
motion.addEventListener('change', () => { paused = motion.matches; sync(); });
document.addEventListener('visibilitychange', sync);
draw(); sync();
})();

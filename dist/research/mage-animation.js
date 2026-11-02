(() => {
const image=document.querySelector('#mage-animation');
const button=document.querySelector('#mage-toggle');
if(!image||!button)return;
const preference=matchMedia('(prefers-reduced-motion: reduce)');
let playing=!preference.matches;
function sync(){
 const src=playing?'./mage-framework.gif':'./mage-framework.png';
 image.closest('picture').querySelector('source').srcset=src;
 image.src=src;
 button.textContent=playing?'Show complete diagram':'Play animation';
}
button.hidden=false;
button.addEventListener('click',()=>{playing=!playing;sync();});
preference.addEventListener('change',()=>{playing=!preference.matches;sync();});
sync();
})();
/* ==========================================================================
   O tamanho do meu amor por você — v2
   Imagens esperadas em /imagens/ (WebP com transparência).
   ========================================================================== */
const items = [
  {name:'Elefante', tag:'Animal', color:'#9fb0c4', measure:'≈ 3,3 m de altura', desc:'Um dos maiores animais terrestres.', compare:'Ponto de partida', img:'imagens/elefante.webp', size:3.3},
  {name:'Girafa', tag:'Animal', color:'#e6a64f', measure:'≈ 5,5 m de altura', desc:'Mais alta que um elefante.', compare:'1,7× o elefante', img:'imagens/girafa.webp', size:5.5},
  {name:'Burj Khalifa', tag:'Arquitetura', color:'#5fb4ff', measure:'828 m de altura', desc:'O arranha-céu mais alto do mundo.', compare:'≈ 150× a girafa', img:'imagens/burj-khalifa.webp', size:828},
  {name:'Terra', tag:'Planeta', color:'#3d8bff', measure:'12.742 km de diâmetro', desc:'Nosso planeta.', compare:'≈ 15.400× o Burj Khalifa', img:'imagens/terra.webp', size:12742000},
  {name:'Marte', tag:'Planeta', color:'#ff6a3d', measure:'6.779 km de diâmetro', desc:'Menor que a Terra, mas já estamos falando de mundos.', compare:'≈ metade da Terra', img:'imagens/marte.webp', size:6779000},
  {name:'Júpiter', tag:'Planeta', color:'#e3a06b', measure:'139.820 km de diâmetro', desc:'O gigante do Sistema Solar.', compare:'≈ 11× a Terra', img:'imagens/jupiter.webp', size:139820000},
  {name:'Sol', tag:'Estrela', color:'#ffb020', measure:'1,39 milhão de km de diâmetro', desc:'Uma estrela gigantesca em comparação com os planetas.', compare:'≈ 10× Júpiter', img:'imagens/sol.webp', size:1392700000},
  {name:'Via Láctea', tag:'Galáxia', color:'#9b8cff', measure:'≈ 100.000 anos-luz de diâmetro', desc:'Nossa galáxia.', compare:'≈ 680 bilhões de vezes o Sol', img:'imagens/via-lactea.webp', size:9.46e20},
  {name:'Galáxia de Andrômeda', tag:'Galáxia', color:'#7aa2ff', measure:'≈ 220.000 anos-luz de extensão', desc:'Uma vizinha galáctica gigantesca.', compare:'≈ 2,2× a Via Láctea', img:'imagens/andromeda.webp', size:2.08e21},
  {name:'Meu amor por você', tag:'Amor', color:'#ff3b73', measure:'Grande demais para medir', desc:'Depois de tudo isso… ainda faltava alguma coisa.', compare:'Sem escala conhecida', heart:true,
   finale:'meu amor por você é maior que tudo.', size:1e24}
];

const $ = id => document.getElementById(id);
const app = $('app');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (v,a,b) => Math.max(a,Math.min(b,v));
const lerp = (a,b,t) => a + (b-a)*t;
const smooth = (a,b,x) => { const t = clamp((x-a)/(b-a),0,1); return t*t*(3-2*t); };
const easeIO = t => t<.5 ? 4*t*t*t : 1-Math.pow(-2*t+2,3)/2;
const easeOut = t => 1-Math.pow(1-t,3);
const easeBack = t => { const c1=1.3, c3=c1+1; return 1 + c3*Math.pow(t-1,3) + c1*Math.pow(t-1,2); };

const HEART_PATH = 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z';

let index = 0;
let animating = false;
let inFinale = false;
let heartTimer = null;

/* ---------- Tamanho visual dos objetos ---------- */
const minLog = Math.log10(items[0].size);
const maxLog = Math.log10(items[items.length-2].size);
// Objetos maiores ocupam um pouco mais da tela; o "fit" adapta ao dispositivo.
function baseFor(item){
  const t = clamp((Math.log10(item.size)-minLog)/(maxLog-minLog),0,1);
  const b = 440 + 200*Math.pow(t,.55);
  return item.heart ? b*.86 : b;
}
function updateFit(){
  const r = $('objectWrap').getBoundingClientRect();
  const avail = Math.min(r.height*1.0, r.width*.92, 700);
  document.documentElement.style.setProperty('--fit', clamp(avail/640,.4,1.15).toFixed(3));
}

/* ---------- Montagem ---------- */
function media(item, cls){
  const base = baseFor(item);
  if(item.heart){
    return `<div class="scale-object heartObj ${cls}" style="--base:${base}px" role="img" aria-label="${item.name}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${HEART_PATH}"/></svg></div>`;
  }
  return `<img class="scale-object ${cls}" style="--base:${base}px" src="${item.img}" alt="${item.name}" draggable="false" decoding="async">`;
}

function setInfo(item){
  const el = $('info');
  el.classList.remove('out');
  el.classList.toggle('is-heart', !!item.heart);
  let i = 0;
  const part = (cls,html) => `<div class="${cls}" style="--i:${i++}">${html}</div>`;
  el.innerHTML =
    part('meta-row', `<span class="chip tag">${item.tag}</span><span class="chip cmp">${item.compare}</span>`) +
    part('name', item.name) +
    part('measure', item.measure) +
    part('description', item.desc) +
    (item.finale ? part('love-line', item.finale) : '');
}

function setCounter(){
  const n = String(index+1).padStart(2,'0');
  $('counter').innerHTML = `<b>${n}</b><i></i><span>${String(items.length).padStart(2,'0')}</span>`;
}

function buildProgress(){
  $('progress').innerHTML = items.map((it,j)=>
    `<button class="seg ${it.heart?'heart':''}" type="button" data-i="${j}" aria-label="${j+1}. ${it.name}"><i></i></button>`).join('');
  $('progress').addEventListener('click',e=>{
    const b = e.target.closest('.seg'); if(b) goTo(+b.dataset.i);
  });
}
function updateProgress(){
  [...$('progress').children].forEach((s,j)=>{
    s.classList.toggle('on', j===index);
    s.classList.toggle('done', j<index);
    if(j===index) s.setAttribute('aria-current','step'); else s.removeAttribute('aria-current');
  });
}
function updateNav(){
  $('prevBtn').disabled = index === 0;
  const last = index === items.length-1;
  $('nextBtn').classList.toggle('restart', last);
  $('nextBtn').setAttribute('aria-label', last ? 'Recomeçar do início' : 'Mostrar o próximo tamanho');
}
function setGlow(item){ document.documentElement.style.setProperty('--glow', item.color); }

function render(intro=false){
  const item = items[index];
  $('objectWrap').innerHTML = `<div class="scale-stage" id="scaleStage">${media(item,'current'+(intro?' intro':''))}</div>`;
  setInfo(item); setCounter(); buildProgressOnce(); updateProgress(); updateNav(); setGlow(item);
  if(item.heart) enterFinale(false);
}
let progressBuilt = false;
function buildProgressOnce(){ if(!progressBuilt){ buildProgress(); progressBuilt = true; } }

/* ---------- Final: corações, anéis e brilho ---------- */
function spawnHeart(delay=0){
  const fx = $('fx'), h = document.createElement('span');
  h.className = 'h'; h.textContent = '♥';
  const ang = Math.random()*Math.PI*2, dist = 90 + Math.random()*210;
  h.style.setProperty('--x', Math.cos(ang)*dist*.9 + 'px');
  h.style.setProperty('--y', (Math.sin(ang)*dist*.7 - 70 - Math.random()*120) + 'px');
  h.style.setProperty('--r', (Math.random()*50-25) + 'deg');
  h.style.setProperty('--sz', (10 + Math.random()*16) + 'px');
  h.style.setProperty('--d', (1.4 + Math.random()*1.4) + 's');
  h.style.setProperty('--delay', delay + 'ms');
  h.addEventListener('animationend', () => h.remove());
  fx.appendChild(h);
}
function enterFinale(withBurst){
  if(inFinale) return;
  inFinale = true;
  const fx = $('fx');
  fx.classList.remove('leaving');
  app.classList.add('finale');
  if(withBurst) fx.insertAdjacentHTML('beforeend','<div class="burst"></div>');
  fx.insertAdjacentHTML('beforeend','<div class="ring"></div><div class="ring" style="--rd:1.2s"></div><div class="ring" style="--rd:2.4s"></div>');
  if(!reduce){
    for(let n=0;n<(withBurst?26:10);n++) spawnHeart(Math.random()*400);
    heartTimer = setInterval(()=>spawnHeart(0), 420);
  }
}
function leaveFinale(){
  if(!inFinale) return;
  inFinale = false;
  clearInterval(heartTimer);
  app.classList.remove('finale');
  const fx = $('fx');
  fx.classList.add('leaving');
  setTimeout(()=>{ if(!inFinale){ fx.innerHTML=''; fx.classList.remove('leaving'); } }, 650);
}

/* ---------- Transição ---------- */
function tf(v){ return `translate(-50%,-50%) scale(${v})`; }

function animatePair(cur, next, duration){
  const stage = $('scaleStage');
  stage.insertAdjacentHTML('beforeend', media(next,'incoming'));
  const old = stage.querySelector('.current');
  const inc = stage.querySelector('.incoming');
  old.style.animation = 'none'; old.style.rotate = '0deg';
  inc.style.opacity = 0; inc.style.transform = tf(.01);

  const bigger = next.size > cur.size;
  const toHeart = !!next.heart;
  let burstDone = false;

  return new Promise(resolve=>{
    const t0 = performance.now();
    (function frame(now){
      const raw = clamp((now-t0)/duration,0,1);
      const p = easeIO(raw);
      let vOld, oOld, vNew, oNew;

      if(bigger){
        // "Afastando a câmera": o antigo encolhe e some, o novo se revela por trás.
        vOld = Math.exp(-2.5*p);
        oOld = 1 - smooth(.05,.7,p);
        vNew = toHeart ? lerp(.04,1,easeBack(raw)) : lerp(1.3,1,easeOut(p));
        oNew = toHeart ? smooth(.1,.55,raw) : smooth(.22,.8,p);
      }else{
        // "Aproximando": o antigo cresce e se dissolve, o novo emerge do centro.
        vOld = Math.exp(1.0*p);
        oOld = 1 - smooth(.08,.62,p);
        vNew = Math.exp(-2.3*(1-p));
        oNew = smooth(.18,.78,p);
      }
      old.style.transform = tf(vOld); old.style.opacity = oOld;
      inc.style.transform = tf(vNew); inc.style.opacity = oNew;

      if(toHeart && !burstDone && raw>.62){ burstDone = true; enterFinale(true); }
      if(raw<1) requestAnimationFrame(frame); else resolve();
    })(t0);
  });
}

async function goTo(target){
  if(animating || target===index || target<0 || target>=items.length) return;
  animating = true;
  hideHint();
  const cur = items[index], next = items[target];
  const bigger = next.size > cur.size;
  const jump = Math.abs(target-index);
  const duration = reduce ? 1 : (next.heart ? 1700 : 1000 + Math.min(jump-1,3)*140);

  // texto sai, brilho e contagem mudam no meio do movimento
  $('info').classList.add('out');
  index = target;
  updateProgress(); updateNav();
  if(cur.heart) leaveFinale();
  space.boost(bigger ? 1 : -1, duration);

  setTimeout(()=>{ setGlow(next); setCounter(); }, duration*.35);
  setTimeout(()=>setInfo(next), reduce ? 0 : Math.min(420, duration*.42));

  try{ await animatePair(cur,next,duration); }
  finally{
    // Promove o elemento que entrou (sem recriar → sem piscar)
    const stage = $('scaleStage');
    stage.querySelector('.current')?.remove();
    const inc = stage.querySelector('.incoming');
    if(inc){
      inc.classList.replace('incoming','current');
      inc.style.transform = tf(1); inc.style.opacity = 1;
    }
    animating = false;
  }
}
const goNext = () => goTo(index === items.length-1 ? 0 : index+1);
const goPrev = () => goTo(index-1);

/* ---------- Fundo estrelado em canvas (parallax + "warp" nas transições) ---------- */
const space = (()=>{
  const cv = $('space'), ctx = cv.getContext('2d');
  const tints = ['255,255,255','200,222,255','255,236,212'];
  let W=0,H=0,dpr=1,stars=[],boostVel=0,boostTarget=0,tx=0,ty=0,px=0,py=0,last=performance.now();
  let meteor=null,nextMeteor=last+5000,running=true;
  const IDLE = -0.012;

  const rnd = () => Math.random()*2.4-1.2;
  const mk = z => ({x:rnd(),y:rnd(),z,tw:.6+Math.random()*2,ph:Math.random()*6.28,c:tints[(Math.random()*3)|0],b:.35+Math.random()*.55});
  function resize(){
    dpr = Math.min(window.devicePixelRatio||1,2);
    W = cv.width = Math.round(innerWidth*dpr); H = cv.height = Math.round(innerHeight*dpr);
    const n = Math.min(340, Math.round((innerWidth*innerHeight)/4600));
    stars = Array.from({length:n},()=>mk(.06+Math.random()*.94));
  }
  function boost(dir,ms){
    if(reduce) return;
    boostTarget = dir*2.6;
    setTimeout(()=>{ boostTarget = 0; }, ms*.55);
  }
  function frame(now){
    if(!running) return;
    const dt = Math.min(.05,(now-last)/1000); last = now;
    boostVel += (boostTarget-boostVel)*Math.min(1,dt*4.5);
    const v = reduce ? 0 : IDLE + boostVel;

    // parallax suave do ponteiro
    px += (tx-px)*Math.min(1,dt*3); py += (ty-py)*Math.min(1,dt*3);
    if(Math.abs(tx-px)>.002 || Math.abs(ty-py)>.002){
      app.style.setProperty('--px',px.toFixed(3)); app.style.setProperty('--py',py.toFixed(3));
    }

    ctx.clearRect(0,0,W,H);
    const cx = W/2 - px*22*dpr, cy = H*.46 - py*16*dpr, f = Math.max(W,H)*.5;
    const streak = Math.abs(v) > .22;
    const t = now/1000;
    for(const s of stars){
      s.z += v*dt;
      let sx = cx + s.x/s.z*f, sy = cy + s.y/s.z*f;
      const out = sx<-60||sx>W+60||sy<-60||sy>H+60;
      if(v<=0 && (s.z<.04 || out)){ s.x=rnd(); s.y=rnd(); s.z=1; continue; }
      if(v>0 && s.z>1){ s.x=rnd(); s.y=rnd(); s.z=.1+Math.random()*.12; continue; }
      const fadeIn = clamp((1-s.z)*7,0,1);
      const a = s.b * fadeIn * (.68+.32*Math.sin(t*s.tw+s.ph));
      if(a<.02) continue;
      const r = Math.max(.5,(1.25-s.z)*1.55)*dpr;
      if(streak){
        const zp = s.z - v*.05;
        const sx2 = cx + s.x/zp*f, sy2 = cy + s.y/zp*f;
        ctx.strokeStyle = `rgba(${s.c},${a})`; ctx.lineWidth = r; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(sx,sy); ctx.lineTo(sx2,sy2); ctx.stroke();
      }else{
        ctx.fillStyle = `rgba(${s.c},${a})`;
        ctx.beginPath(); ctx.arc(sx,sy,r,0,6.2832); ctx.fill();
      }
    }

    // estrela cadente ocasional
    if(!reduce){
      if(!meteor && now>nextMeteor){
        meteor = {x:W*(.45+Math.random()*.5), y:H*Math.random()*.35, t:0, len:(120+Math.random()*120)*dpr};
        nextMeteor = now + 7000 + Math.random()*9000;
      }
      if(meteor){
        meteor.t += dt/.9;
        const k = meteor.t, hx = meteor.x - k*W*.28, hy = meteor.y + k*H*.2;
        const g = ctx.createLinearGradient(hx,hy,hx+meteor.len*.85,hy-meteor.len*.6);
        const al = Math.sin(clamp(k,0,1)*Math.PI);
        g.addColorStop(0,`rgba(255,255,255,${.85*al})`); g.addColorStop(1,'rgba(255,255,255,0)');
        ctx.strokeStyle = g; ctx.lineWidth = 1.4*dpr; ctx.lineCap='round';
        ctx.beginPath(); ctx.moveTo(hx,hy); ctx.lineTo(hx+meteor.len*.85,hy-meteor.len*.6); ctx.stroke();
        if(k>=1) meteor = null;
      }
    }
    requestAnimationFrame(frame);
  }
  addEventListener('resize',resize);
  addEventListener('pointermove',e=>{
    if(e.pointerType==='touch') return;
    tx = (e.clientX/innerWidth)*2-1; ty = (e.clientY/innerHeight)*2-1;
  },{passive:true});
  document.addEventListener('visibilitychange',()=>{
    running = !document.hidden;
    if(running){ last = performance.now(); requestAnimationFrame(frame); }
  });
  resize(); requestAnimationFrame(frame);
  return {boost,resize};
})();

/* ---------- Entrada do usuário ---------- */
let hintShown = false, hintTimer = null;
function showHint(){ if(!hintShown) $('hint').classList.add('show'); }
function hideHint(){ hintShown = true; $('hint').classList.remove('show'); clearTimeout(hintTimer); }

$('nextBtn').addEventListener('click',goNext,{passive:true});
$('prevBtn').addEventListener('click',goPrev,{passive:true});
document.addEventListener('keydown',e=>{
  const onBtn = e.target.closest && e.target.closest('button');
  if(e.key==='ArrowRight' || e.key==='PageDown' || (e.key===' ' && !onBtn)){ e.preventDefault(); goNext(); }
  else if(e.key==='ArrowLeft' || e.key==='PageUp'){ e.preventDefault(); goPrev(); }
  else if(e.key==='Home'){ goTo(0); }
  else if(e.key==='End'){ goTo(items.length-1); }
});
// deslizar no celular
let sx=0, sy=0;
$('stage').addEventListener('touchstart',e=>{ sx=e.touches[0].clientX; sy=e.touches[0].clientY; },{passive:true});
$('stage').addEventListener('touchend',e=>{
  const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
  if(Math.abs(dx)>48 && Math.abs(dx)>Math.abs(dy)*1.4){ dx<0 ? goNext() : goPrev(); }
},{passive:true});

addEventListener('resize',updateFit);

/* ---------- Início ---------- */
function preload(){
  return Promise.all(items.filter(i=>i.img).map(i=>new Promise(res=>{
    const im = new Image(); im.onload = im.onerror = () => res(); im.src = i.img;
    if(im.decode) im.decode().then(res,res);
  })));
}
$('info').setAttribute('aria-live','polite');
updateFit();
Promise.race([preload(), new Promise(r=>setTimeout(r,2800))]).then(()=>{
  updateFit();
  render(!reduce);
  requestAnimationFrame(()=>app.classList.remove('is-loading'));
  hintTimer = setTimeout(showHint, 2600);
});

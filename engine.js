"use strict";
/* ============================================================
   ألبوم أُسرتي — engine: state, sound, clock/tweens, avatar,
   props, sets, renderer, camera, interactions, capture
   ============================================================ */
const $=(s,el=document)=>el.querySelector(s), $$=(s,el=document)=>[...el.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const AR="٠١٢٣٤٥٦٧٨٩", ar=n=>String(n).replace(/\d/g,d=>AR[d]);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)), lerp=(a,b,t)=>a+(b-a)*t;
const FAST=location.hash==="#fast";
const SPEED=FAST?7:1;

/* ---------------- character state ---------------- */
const SKINS=[["فاتح جدًّا","#FFE3CC"],["فاتح","#F9D0AE"],["حنطي","#EDB98A"],["أسمر فاتح","#D49A6A"],["أسمر","#A86B42"],["أسمر داكن","#7A4A2A"]];
const EYES=[["بنّي","#6B3B1F"],["عسلي","#A8742B"],["أخضر","#3F8A54"],["أزرق","#3F7FC4"],["أسود","#241816"]];
const HAIRC=[["أسود","#2A1C19"],["بنّي داكن","#4B2C1C"],["بنّي","#7D4A27"],["كستنائي","#A0522D"],["أشقر","#E2B85F"],["أحمر","#B5442F"]];
const OUTC=[["أبيض","#FFFFFF"],["فيروزي","#16B3A6"],["مرجاني","#FF6F61"],["أصفر مشمشي","#FFB04A"],["سماوي","#38B6EE"],["بنفسجي","#8A63FF"],["أخضر","#3CC56B"]];
const GLC=[["كحلي","#2A2140"],["أحمر","#E0355F"],["أزرق","#1C8FD6"],["ذهبي","#E9A300"]];
const HAIRS=[["short","قصير"],["long","طويل"],["curly","مجعّد"],["wavy","مموّج"],["braids","مضفّر"]];
const OUTFITS=[["thobe","ثوب"],["dress","فستان"],["shirt","قميص وبنطال"]];
const GLASSES=[["none","بلا نظّارة"],["round","دائرية"],["square","مربّعة"]];
function defaultChar(g){return g==="girl"
  ?{g:"girl",name:"",skin:1,eye:0,hair:"braids",hairC:1,outfit:"dress",outC:2,cap:false,band:true,watch:false,glasses:"none",glC:0}
  :{g:"boy",name:"",skin:2,eye:0,hair:"short",hairC:0,outfit:"thobe",outC:0,cap:false,band:false,watch:false,glasses:"none",glC:0}}
let CHAR=defaultChar("boy");
const G=(m,f)=>CHAR.g==="girl"?f:m;
const NAME=()=>CHAR.name.trim();
function cfgFor(ch){const sv=CHAR;CHAR=ch;const c=charCfg();CHAR=sv;return c}
function charCfg(){return {kind:CHAR.g, skin:SKINS[CHAR.skin][1], eye:EYES[CHAR.eye][1], hair:CHAR.hair, hairC:HAIRC[CHAR.hairC][1],
  outfit:CHAR.outfit, color:OUTC[CHAR.outC][1], color2:"#2F5FB8", cap:CHAR.cap, band:CHAR.band, watch:CHAR.watch, glasses:CHAR.glasses, glC:GLC[CHAR.glC][1], shoe:"#5B3A8C"}}
const LOOK={
  dad:{kind:"man",skin:"#F0C49E",outfit:"thobe",color:"#FFFFFF",shoe:"#8B5A2B",eye:"#4A2A14"},
  momH:{kind:"woman",skin:"#F6CDA8",outfit:"long",color:"#9B7BFF",hijab:"#FF6F61",shoe:"#6A4BD6",eye:"#5A3418"},
  momR:{kind:"woman",skin:"#F6CDA8",outfit:"long",color:"#9B7BFF",hair:"bun",hairC:"#3A2318",shoe:"#6A4BD6",eye:"#5A3418"},
  bro:{kind:"tod",skin:"#F2C49B",outfit:"overall",color:"#3E7BE0",color2:"#3CC56B",hair:"short",hairC:"#2A1C19",shoe:"#FFFFFF",eye:"#4A2A14"}
};
const cfgOf=e=>e.cfg==="char"?charCfg():LOOK[e.cfg];

/* ---------------- sound ---------------- */
const S={mute:false};
let AC=null;
function ac(){try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();if(AC.state==="suspended")AC.resume()}catch(e){}return AC}
function tone(seq,vol=.13){if(S.mute||FAST||!ac())return;let t=AC.currentTime;seq.forEach(([f,d,ty,f2])=>{const o=AC.createOscillator(),g=AC.createGain();o.type=ty||"sine";o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+d);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+.02);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g).connect(AC.destination);o.start(t);o.stop(t+d+.05);t+=d*.8})}
function noise(d=.25,vol=.12,hp=800){if(S.mute||FAST||!ac())return;const b=AC.createBuffer(1,AC.sampleRate*d,AC.sampleRate),a=b.getChannelData(0);for(let i=0;i<a.length;i++)a[i]=(Math.random()*2-1)*(1-i/a.length);const s=AC.createBufferSource();s.buffer=b;const f=AC.createBiquadFilter();f.type="highpass";f.frequency.value=hp;const g=AC.createGain();g.gain.value=vol;s.connect(f).connect(g).connect(AC.destination);s.start()}
const SFX={
  tap:()=>tone([[720,.06,"triangle"]],.07), good:()=>tone([[523,.12],[659,.12],[784,.24]]), soft:()=>tone([[392,.16,"triangle"],[349,.22,"triangle"]]),
  pop:()=>tone([[880,.08],[1320,.12]]), magic:()=>tone([[784,.1],[988,.1],[1175,.1],[1568,.26]],.1),
  page:()=>noise(.18,.1,2500), shutter:()=>{noise(.06,.2,3000);setTimeout(()=>noise(.05,.15,3000),90)},
  whoosh:()=>noise(.45,.08,600), thud:()=>tone([[140,.18,"sine",60]],.22), creak:()=>tone([[300,.4,"sawtooth",220]],.03),
  brush:()=>noise(.2,.06,1500), kiss:()=>tone([[1200,.05,"sine",1800],[900,.06]],.08), step:()=>tone([[180,.05,"triangle"]],.05),
  plane:()=>tone([[220,.9,"sawtooth",330]],.025)
};
/* recorded clips (audio/<id>.mp3) take priority; device Arabic voice otherwise */
const CLIPS=new Set([]);
/* when recordings are uploaded, audio/manifest.json lists their ids, e.g. ["c01","s1a_b","s1a_g"] */
fetch("audio/manifest.json").then(r=>r.ok?r.json():[]).then(a=>{if(Array.isArray(a))a.forEach(x=>CLIPS.add(x))}).catch(()=>{});
let arVoice=null;
function pickVoice(){try{const vs=speechSynthesis.getVoices();arVoice=vs.find(v=>/^ar[-_](SA|BH|AE|KW|QA|OM)/i.test(v.lang))||vs.find(v=>/^ar/i.test(v.lang))||null}catch(e){arVoice=null}}
try{pickVoice();speechSynthesis.onvoiceschanged=pickVoice}catch(e){}
let curAudio=null;
function stopVoice(){try{speechSynthesis.cancel()}catch(e){}if(curAudio){try{curAudio.pause()}catch(e){}curAudio=null}}
let curUtt=null; /* keep a reference: iOS drops onend if the utterance is garbage-collected */
function voice(text,id,pitch=1.05){
  return new Promise(res=>{
    if(S.mute||FAST){res();return}
    let done=false,guard=0;const fin=()=>{if(done)return;done=true;clearTimeout(guard);res()};
    /* safety net: never let the story hang if the device voice never reports "end" (iOS / in-app browsers) */
    const arm=ms=>{guard=setTimeout(()=>{if(PAUSED){arm(1000);return}try{if(curUtt)speechSynthesis.cancel()}catch(e){}fin()},ms)};
    arm(2500+text.length*140);
    const tts=()=>{
      if(!window.speechSynthesis||!window.SpeechSynthesisUtterance){fin();return}
      if(!arVoice)pickVoice();
      try{
        const u=new SpeechSynthesisUtterance(text.replace(/[«»]/g,""));
        if(arVoice){u.voice=arVoice;u.lang=arVoice.lang}else u.lang="ar-SA"; /* iOS can speak with lang only */
        u.rate=.9;u.pitch=pitch;u.onend=fin;u.onerror=fin;curUtt=u;
        if(speechSynthesis.paused)speechSynthesis.resume();
        speechSynthesis.speak(u);
      }catch(e){fin()}
    };
    if(id&&CLIPS.has(id)){fetch("audio/"+id+".mp3").then(r=>{if(!r.ok)throw 0;return r.blob()}).then(b=>{const a=new Audio(URL.createObjectURL(b));curAudio=a;a.onended=fin;a.onerror=tts;a.play().catch(tts)}).catch(tts)}
    else tts();
  });
}
/* iOS/Safari only allow audio + speech after a user gesture: unlock both on the first tap */
let unlocked=false;
function unlockAudio(){
  const c=ac();
  if(unlocked)return;unlocked=true;
  try{if(c){const b=c.createBuffer(1,1,22050),src=c.createBufferSource();src.buffer=b;src.connect(c.destination);src.start(0)}}catch(e){}
  try{pickVoice();const u=new SpeechSynthesisUtterance(" ");u.volume=0;u.lang="ar-SA";speechSynthesis.speak(u)}catch(e){}
}
["pointerdown","touchend","click"].forEach(ev=>document.addEventListener(ev,unlockAudio,{capture:true}));

/* ---------------- clock, tweens, run token ---------------- */
let PAUSED=false, RUN=0, clock=0, lastT=performance.now();
const ABORT={abort:true};
const TW=[], TIMERS=[], DIRTY=new Set();
const EIO=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2, EO=t=>1-Math.pow(1-t,3), EI=t=>t*t*t, LIN=t=>t;
const CSS_EIO="cubic-bezier(.65,0,.35,1)", CSS_EO="cubic-bezier(.23,1,.32,1)";
function chk(my){return v=>{if(my!==RUN)throw ABORT;return v}}
function guard(p){const my=RUN;return p.then(chk(my))}
function wait(ms){return guard(new Promise(res=>TIMERS.push({t:clock+ms,res})))}
const FRAMEHOOKS=[];
function frame(t){const dt=Math.min(64,t-lastT);lastT=t;if(!PAUSED){clock+=dt*SPEED;tick();for(const f of FRAMEHOOKS)f()}flush();requestAnimationFrame(frame)}
function tick(){
  for(let i=TW.length-1;i>=0;i--){const w=TW[i];const p=clamp((clock-w.t0)/w.dur,0,1),k=w.ease(p);
    for(const key in w.to){const a=w.from[key],b=w.to[key];w.e[key]=Array.isArray(b)?b.map((v,j)=>lerp(a[j],v,k)):lerp(a,b,k)}
    if(w.upd)w.upd(w.e,p,k);DIRTY.add(w.id);if(p>=1){TW.splice(i,1);w.res()}}
  for(let i=TIMERS.length-1;i>=0;i--){if(clock>=TIMERS[i].t){const tm=TIMERS.splice(i,1)[0];tm.res()}}
}
/* tween entity props; arm targets may start from a named pose */
function tw(id,to,dur=600,ease=EIO,upd){
  const e=R.ents[id];if(!e)return wait(0);const from={};
  for(const k in to){
    if((k==="armL"||k==="armR")&&Array.isArray(to[k])&&!Array.isArray(e[k]))e[k]=handWorld(e,k==="armL"?"L":"R");
    from[k]=Array.isArray(e[k])?e[k].slice():(e[k]??0);
  }
  return guard(new Promise(res=>TW.push({id,e,from,to,dur:Math.max(1,dur),t0:clock,ease,upd,res})));
}
function set(id,props){const e=R.ents[id];if(!e)return;Object.assign(e,props);DIRTY.add(id)}
function abortAll(){RUN++;TW.length=0;TIMERS.length=0;stopVoice();clearUI();R.ents&&Object.values(R.ents).forEach(e=>{if(e.t==="actor")e.talk=false})}
requestAnimationFrame(frame);

/* ---------------- avatar ---------------- */
function shade(hex,k){const n=parseInt(hex.slice(1),16);let r=n>>16,g=(n>>8)&255,b=n&255;const f=v=>Math.max(0,Math.min(255,Math.round(k<1?v*k:v+(255-v)*(k-1))));return"#"+[f(r),f(g),f(b)].map(v=>v.toString(16).padStart(2,"0")).join("")}
const HAIR="#2A1C19";
function metrics(c,pose){const adult=c.kind==="man"||c.kind==="woman",E=adult?44:0,Ls=210+E;
  const H=pose==="sit"?Ls+124:pose==="floor"?244:pose==="kneel"?262+E:290+E;return{adult,E,Ls,H,LAP:pose==="sit"?Ls+4:200}}
const ARM={
  L:{down:[52,194,58,222],up:[44,128,40,92],lap:[54,204,80,"LAP"],hold:[62,204,92,212],wave:[40,140,36,100],hip:[40,190,62,206]},
  R:{down:[148,194,142,222],up:[156,128,160,92],fwd:[168,170,194,156],lap:[146,204,120,"LAP"],hold:[138,204,108,212],talk:[172,150,164,108],wave:[160,140,166,100]}
};
function armPts(side,spec,m,sh){
  const sx=side==="L"?66:134,sy=166-sh;
  if(typeof spec==="string"){const a=ARM[side][spec]||ARM[side].down;return[sx,sy,a[0],a[1]-sh*.5,a[2],a[3]==="LAP"?m.LAP:a[3]]}
  let ex=spec.l[0],ey=spec.l[1],dx=ex-sx,dy=ey-sy,len=Math.hypot(dx,dy)||1;const MAX=120;
  if(len>MAX){ex=sx+dx/len*MAX;ey=sy+dy/len*MAX;dx=ex-sx;dy=ey-sy;len=MAX}
  let nx=-dy/len,ny=dx/len;
  if(Math.abs(ny)>.3){if(ny<0){nx=-nx;ny=-ny}}else{const want=side==="L"?-1:1;if(Math.sign(nx)!==want){nx=-nx;ny=-ny}}
  const bend=Math.max(6,(MAX-len)*.32+8);
  return[sx,sy,(sx+ex)/2+nx*bend,(sy+ey)/2+ny*bend,ex,ey];
}
function handSVG(x,y,ang,open,skin){
  if(!open)return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="11.5" fill="${skin}"/>`;
  let s="";for(const d of[-.95,-.32,.32,.95]){const a=ang+d*.55,fx=x+Math.cos(a)*13,fy=y+Math.sin(a)*13;s+=`<ellipse cx="${fx.toFixed(1)}" cy="${fy.toFixed(1)}" rx="4.4" ry="7.2" transform="rotate(${(a*180/Math.PI+90).toFixed(0)} ${fx.toFixed(1)} ${fy.toFixed(1)})" fill="${skin}"/>`}
  return s+`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="10.5" fill="${skin}"/>`;
}
function hairBack(c){
  const h=c.hairC||HAIR;
  if(c.kind==="woman"&&c.hijab)return `<path d="M36 104 Q32 22 100 20 Q168 22 164 104 Q168 158 146 180 L54 180 Q32 158 36 104Z" fill="${c.hijab}"/>`;
  if(c.kind==="man")return `<path d="M42 84 Q42 22 100 20 Q158 22 158 84 L174 196 Q144 180 140 128 L60 128 Q56 180 26 196Z" fill="#fff" stroke="#D8DFE7" stroke-width="3"/>`;
  switch(c.hair){
    case"bun":return `<circle cx="100" cy="30" r="27" fill="${h}"/><path d="M44 96 Q40 36 100 34 Q160 36 156 96 L160 172 Q130 182 128 152 L72 152 Q70 182 40 172Z" fill="${h}"/>`;
    case"long":return `<path d="M46 96 Q42 34 100 32 Q158 34 154 96 L160 204 Q100 218 40 204Z" fill="${h}"/>`;
    case"wavy":return `<path d="M47 94 Q42 34 100 32 Q158 34 153 94 Q165 118 153 142 Q167 166 151 190 Q130 206 112 194 Q100 206 88 194 Q70 206 49 190 Q33 166 47 142 Q35 118 47 94Z" fill="${h}"/>`;
    case"curly":{let s=`<path d="M44 98 Q40 34 100 32 Q160 34 156 98 L158 160 Q100 178 42 160Z" fill="${h}"/>`;for(let i=0;i<12;i++){const a=Math.PI*(.02+.96*i/11);s+=`<circle cx="${(100+Math.cos(a)*60).toFixed(0)}" cy="${(110+Math.sin(a)*58).toFixed(0)}" r="16" fill="${h}"/>`}for(let i=0;i<10;i++){const a=Math.PI*(1.05+.9*i/9);s+=`<circle cx="${(100+Math.cos(a)*58).toFixed(0)}" cy="${(96+Math.sin(a)*58).toFixed(0)}" r="15" fill="${h}"/>`}return s}
    case"braids":{let s="";for(const sd of[-1,1]){for(let i=0;i<6;i++)s+=`<ellipse cx="${100+sd*56}" cy="${114+i*16}" rx="${12-i*.7}" ry="10.5" fill="${i%2?shade(h,.78):h}"/>`;s+=`<circle cx="${100+sd*56}" cy="214" r="7" fill="${c.color&&c.color!=="#FFFFFF"?c.color:"#FF6F61"}"/>`}return s}
  }
  return"";
}
function hairFront(c){
  const h=c.hairC||HAIR;
  if(c.kind==="woman"&&c.hijab)return `<path d="M48 92 Q50 44 100 40 Q150 44 152 92 Q142 60 100 56 Q58 60 48 92Z" fill="${c.hijab}"/><path d="M48 92 Q44 124 56 150 M152 92 Q156 124 144 150" stroke="${c.hijab}" stroke-width="12" fill="none" stroke-linecap="round"/><path d="M56 70 Q100 46 144 70" stroke="${shade(c.hijab,.82)}" stroke-width="3" fill="none"/>`;
  if(c.kind==="man")return `<path d="M46 92 Q44 40 100 38 Q156 40 154 92 Q146 64 100 60 Q54 64 46 92Z" fill="#fff" stroke="#D8DFE7" stroke-width="3"/><ellipse cx="100" cy="46" rx="50" ry="11" fill="none" stroke="#1E1E24" stroke-width="7"/><ellipse cx="100" cy="40" rx="46" ry="9" fill="none" stroke="#1E1E24" stroke-width="5"/>`;
  const hl=shade(h,1.35);
  switch(c.hair){
    case"short":return `<path d="M48 94 Q44 38 100 38 Q156 38 152 94 Q147 70 128 64 Q120 76 102 68 Q86 78 70 68 Q55 74 48 94Z" fill="${h}"/><path d="M78 50 q12 -8 24 -2" stroke="${hl}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    case"curly":{let s=`<path d="M48 96 Q44 40 100 38 Q156 40 152 96 Q140 66 100 62 Q60 66 48 96Z" fill="${h}"/>`;for(let i=0;i<7;i++){const a=Math.PI*(1.1+.8*i/6);s+=`<circle cx="${(100+Math.cos(a)*44).toFixed(0)}" cy="${(68+Math.sin(a)*14).toFixed(0)}" r="10" fill="${h}"/>`}return s}
    case"braids":case"bun":return `<path d="M49 94 Q46 40 100 40 Q154 40 151 94 Q144 62 100 58 Q56 62 49 94Z" fill="${h}"/><path d="M100 41 V58" stroke="${shade(h,.75)}" stroke-width="2.5"/>`;
    default:return `<path d="M48 98 Q44 40 100 38 Q156 40 152 98 Q146 66 116 60 Q96 82 62 84 Q52 88 48 98Z" fill="${h}"/><path d="M82 48 q14 -8 30 -2" stroke="${hl}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  }
}
function avatar(c,o){
  const pose=o.pose||"stand",m=metrics(c,pose),{E,Ls,H}=m;
  const skin=c.skin,oc=c.color,oc2=shade(oc==="#FFFFFF"?"#E6EBF0":oc,.82),shoe=c.shoe||"#5B3A8C";
  const longG=c.outfit==="thobe"||c.outfit==="abaya"||c.outfit==="long";
  const longSleeve=m.adult||c.outfit==="thobe";
  const step=o.step||0,sh=o.sh||0,tilt=o.tilt||0,hip=204+E;
  const hr=`rotate(${tilt.toFixed(1)} 100 142)`;
  let legs="",torso="",arms="",acc="";
  /* legs */
  const legC=c.outfit==="shirt"?(c.color2||"#2F5FB8"):c.outfit==="overall"?oc:skin;
  if(pose==="stand"){
    if(longG){legs=`<ellipse cx="${(80-step*9).toFixed(1)}" cy="${H-12}" rx="20" ry="10" fill="${shoe}"/><ellipse cx="${(120+step*9).toFixed(1)}" cy="${H-12}" rx="20" ry="10" fill="${shoe}"/>`}
    else{for(const[x0,sg]of[[70,1],[104,-1]]){const ang=(step*16*sg).toFixed(1);const top=c.outfit==="dress"?226:hip-4;
      legs+=`<g transform="rotate(${ang} ${x0+13} ${hip})"><rect x="${x0}" y="${top}" width="26" height="${H-22-top}" rx="11" fill="${legC}"/>${c.outfit==="dress"?`<rect x="${x0}" y="${H-38}" width="26" height="16" rx="5" fill="#fff"/>`:""}<ellipse cx="${x0+13}" cy="${H-12}" rx="20" ry="10" fill="${shoe}"/><ellipse cx="${x0+7}" cy="${H-16}" rx="6" ry="2.5" fill="#fff" opacity=".4"/></g>`}}
  }else if(pose==="sit"){
    const lc=longG?oc:legC;
    legs=`<rect x="56" y="${Ls-14}" width="88" height="40" rx="18" fill="${longG?oc:(c.outfit==="dress"?oc:legC)}"/>`+[66,106].map(x=>`<rect x="${x}" y="${Ls+16}" width="28" height="96" rx="12" fill="${lc}"/><ellipse cx="${x+14}" cy="${Ls+114}" rx="21" ry="10" fill="${shoe}"/>`).join("");
  }else if(pose==="floor"){
    legs=`<ellipse cx="52" cy="226" rx="16" ry="9" fill="${shoe}"/><ellipse cx="148" cy="226" rx="16" ry="9" fill="${shoe}"/><ellipse cx="100" cy="216" rx="64" ry="24" fill="${longG?oc:(c.outfit==="dress"?oc:legC)}"/>`;
  }else{ /* kneel */
    const kc=longG?oc:(c.outfit==="dress"?skin:legC);
    legs=`<ellipse cx="62" cy="${H-8}" rx="14" ry="8" fill="${shoe}"/><ellipse cx="138" cy="${H-8}" rx="14" ry="8" fill="${shoe}"/>`+[68,104].map(x=>`<rect x="${x}" y="${hip-4}" width="28" height="${H-hip-6}" rx="12" fill="${kc}"/><ellipse cx="${x+14}" cy="${H-12}" rx="16" ry="9" fill="${shade(kc,.9)}"/>`).join("");
  }
  /* torso */
  const t0=151-sh,tTop=`M63 ${170-sh} Q66 ${t0} 88 ${147-sh} L112 ${147-sh} Q134 ${t0} 137 ${170-sh}`;
  if(longG){const bot=pose==="sit"?Ls:pose==="floor"?214:pose==="kneel"?H-14:H-16,wd=pose==="stand"?4:1;
    torso=`<path d="${tTop} L${137+wd} ${bot} Q100 ${bot+8} ${63-wd} ${bot}Z" fill="${oc}" stroke="${oc==="#FFFFFF"?"#DDE3EA":"none"}" stroke-width="2"/>`;
    if(c.outfit==="thobe")torso+=`<path d="M100 ${150-sh} V${196+E*.5}" stroke="${oc2}" stroke-width="2.5"/><circle cx="100" cy="${166-sh}" r="2.4" fill="${oc2}"/><circle cx="100" cy="${180-sh}" r="2.4" fill="${oc2}"/><path d="M90 ${147-sh} Q100 ${156-sh} 110 ${147-sh}" stroke="${oc2}" stroke-width="3" fill="none"/>`;
    if(c.outfit==="long")torso+=`<path d="M70 ${200+E} Q100 ${210+E} 130 ${200+E}" stroke="${shade(oc,1.3)}" stroke-width="6" fill="none"/>`;
  }else if(c.outfit==="dress"){const b=pose==="stand"?246:220;
    torso=`<path d="${tTop} L138 196 Q152 ${b-16} 156 ${b} Q100 ${b+10} 44 ${b} Q48 ${b-16} 62 196Z" fill="${oc}" stroke="${oc==="#FFFFFF"?"#DDE3EA":"none"}" stroke-width="2"/><path d="M86 ${148-sh} Q93 ${160-sh} 100 ${152-sh} Q107 ${160-sh} 114 ${148-sh}Z" fill="#fff"/><path d="M58 ${b-14} Q100 ${b-4} 142 ${b-14}" stroke="#fff" stroke-width="5" fill="none" opacity=".7"/>`;
  }else if(c.outfit==="overall"){
    torso=`<path d="${tTop} L138 206 L62 206Z" fill="${c.color2}"/><path d="M70 176 H130 V208 H70Z" fill="${oc}"/><path d="M76 176 L70 152 M124 176 L130 152" stroke="${oc}" stroke-width="8" stroke-linecap="round"/><circle cx="100" cy="190" r="8" fill="#fff"/><circle cx="97" cy="188" r="1.8" fill="#333"/><circle cx="103" cy="188" r="1.8" fill="#333"/>`;
  }else{
    torso=`<path d="${tTop} L138 208 L62 208Z" fill="${oc}" stroke="${oc==="#FFFFFF"?"#DDE3EA":"none"}" stroke-width="2"/><path d="M88 ${148-sh} L100 ${162-sh} L112 ${148-sh}" stroke="${oc2}" stroke-width="3.5" fill="none" stroke-linejoin="round"/><circle cx="100" cy="${176-sh}" r="2.6" fill="${oc2}"/><circle cx="100" cy="${192-sh}" r="2.6" fill="${oc2}"/><rect x="62" y="202" width="76" height="8" fill="${shade(c.color2||"#2F5FB8",.8)}"/>`;
  }
  if(c.kind==="woman"&&c.hijab)torso+=`<path d="M56 ${176-sh} Q100 ${198-sh} 144 ${176-sh} L142 ${198-sh} Q100 ${214-sh} 58 ${198-sh}Z" fill="${c.hijab}"/>`;
  /* arms */
  const sleeve=longSleeve?(oc==="#FFFFFF"?"#F4F7FA":oc):skin;
  for(const side of["L","R"]){
    const p=armPts(side,o["arm"+side]||"down",m,sh);const ang=Math.atan2(p[5]-p[3],p[4]-p[2]);
    arms+=`<path d="M${p[0]} ${p[1]} Q${p[2].toFixed(1)} ${p[3].toFixed(1)} ${p[4].toFixed(1)} ${p[5].toFixed(1)}" stroke="${sleeve}" stroke-width="19" stroke-linecap="round" fill="none"/>`;
    if(longSleeve&&oc==="#FFFFFF")arms+=`<path d="M${p[0]} ${p[1]} Q${p[2].toFixed(1)} ${p[3].toFixed(1)} ${p[4].toFixed(1)} ${p[5].toFixed(1)}" stroke="#DDE3EA" stroke-width="1.5" fill="none" opacity=".7"/>`;
    if(!longSleeve)arms+=`<ellipse cx="${p[0]}" cy="${p[1]}" rx="15" ry="14" fill="${oc}"/>`;
    if(side==="L"&&c.watch){const t=.8,bx=(1-t)*(1-t)*p[0]+2*(1-t)*t*p[2]+t*t*p[4],by=(1-t)*(1-t)*p[1]+2*(1-t)*t*p[3]+t*t*p[5];
      arms+=`<g transform="translate(${bx.toFixed(1)} ${by.toFixed(1)}) rotate(${(ang*180/Math.PI+90).toFixed(0)})"><rect x="-11" y="-5" width="22" height="10" rx="4" fill="#2A2140"/><circle r="6" fill="#FFE07A" stroke="#2A2140" stroke-width="2"/></g>`}
    arms+=handSVG(p[4],p[5],ang,o["hand"+side]==="open",skin);
  }
  /* head */
  const hidden=c.kind==="man"||(c.kind==="woman"&&c.hijab);
  const ears=hidden?"":`<circle cx="49" cy="104" r="11" fill="${skin}"/><circle cx="151" cy="104" r="11" fill="${skin}"/>`;
  const head=`<rect x="89" y="${130-sh*.4}" width="22" height="22" rx="6" fill="${shade(skin,.9)}"/>${ears}<ellipse cx="100" cy="98" rx="52" ry="50" fill="${skin}"/>`;
  const lx=(o.gx||0)*4.5,ly=(o.gy||0)*3.8,mood=o.mood||"smile",ec=c.eye||"#6B3B1F";
  let eyes;
  if(mood==="love")eyes=`<path d="M68 106 Q80 92 92 106 M108 106 Q120 92 132 106" stroke="#2A1C19" stroke-width="5" fill="none" stroke-linecap="round"/>`;
  else eyes=`<g class="eyes" style="animation-delay:${o.blinkDelay||0}s">`+[80,120].map(x=>`<ellipse cx="${x}" cy="104" rx="12.5" ry="${mood==="wow"?16:14.5}" fill="#fff"/><circle cx="${(x+lx).toFixed(1)}" cy="${(105+ly).toFixed(1)}" r="9.5" fill="${ec}"/><circle cx="${(x+lx).toFixed(1)}" cy="${(106+ly).toFixed(1)}" r="5" fill="#1A1212"/><circle cx="${(x+lx+3.5).toFixed(1)}" cy="${(100+ly).toFixed(1)}" r="3.6" fill="#fff"/><circle cx="${(x+lx-3).toFixed(1)}" cy="${(109+ly).toFixed(1)}" r="1.6" fill="#fff"/><path d="M${x-13} 97 Q${x} 87 ${x+13} 97" stroke="#2A1C19" stroke-width="3" fill="none" stroke-linecap="round"/>`).join("")+`</g>`;
  const bc=c.kind==="man"?"#2A1C19":(c.hairC||HAIR),bu=mood==="wow"?-4:0;
  const brows=`<path d="M68 ${81+bu} Q78 ${76+bu} 88 80" stroke="${bc}" stroke-width="3.4" fill="none" stroke-linecap="round"/><path d="M112 80 Q122 ${76+bu} 132 ${81+bu}" stroke="${bc}" stroke-width="3.4" fill="none" stroke-linecap="round"/>`;
  const rest=mood==="happy"?`<path d="M86 121 Q100 140 114 121 Q100 127 86 121Z" fill="#B8435F"/><path d="M93 129 Q100 135 107 129Z" fill="#F38BA6"/>`
    :mood==="wow"?`<ellipse cx="100" cy="127" rx="7" ry="8" fill="#B8435F"/>`
    :mood==="laugh"?`<path d="M84 118 Q100 146 116 118Z" fill="#B8435F"/><path d="M90 120 H110" stroke="#fff" stroke-width="3"/>`
    :`<path d="M89 122 Q100 132 111 122" stroke="#9C3A54" stroke-width="3.4" fill="none" stroke-linecap="round"/>`;
  const talkM=`<path d="M88 120 Q100 142 112 120 Q100 125 88 120Z" fill="#B8435F"/><path d="M94 130 Q100 136 106 130Z" fill="#F38BA6"/>`;
  const mouth=`<g class="m-rest">${rest}</g><g class="m-talk">${talkM}</g>`;
  const beard=c.kind==="man"?`<path d="M52 104 Q54 152 100 154 Q146 152 148 104 Q142 134 122 138 Q100 146 78 138 Q58 134 52 104Z" fill="#3A2A22"/><path d="M84 116 Q100 110 116 116 Q100 120 84 116Z" fill="#3A2A22"/>`:"";
  let face=eyes+brows+`<ellipse cx="68" cy="122" rx="9.5" ry="6" fill="#FF8FB1" opacity=".55"/><ellipse cx="132" cy="122" rx="9.5" ry="6" fill="#FF8FB1" opacity=".55"/><path d="M97 114 q3 3 6 0" stroke="${shade(skin,.72)}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`+beard+mouth;
  if(c.glasses&&c.glasses!=="none"){const g=c.glC||"#2A2140";face+=c.glasses==="round"?`<g fill="#ffffff22" stroke="${g}" stroke-width="3.5"><circle cx="80" cy="104" r="17"/><circle cx="120" cy="104" r="17"/></g><path d="M97 101 Q100 97 103 101" stroke="${g}" stroke-width="3.5" fill="none"/>`
    :`<g fill="#ffffff22" stroke="${g}" stroke-width="3.5"><rect x="62" y="90" width="36" height="28" rx="8"/><rect x="102" y="90" width="36" height="28" rx="8"/></g><path d="M98 102 H102" stroke="${g}" stroke-width="3.5"/>`}
  let strand="";
  if(o.strand!=null&&c.hair==="bun"){const ms=o.strand;strand=`<path d="M146 78 Q${(150+ms*26).toFixed(1)} ${110} ${(146-ms*14).toFixed(1)} 138 Q${(152+ms*24).toFixed(1)} 162 ${(150+ms*8).toFixed(1)} 186" stroke="${c.hairC}" stroke-width="9" fill="none" stroke-linecap="round"/>`;if(o.strandSide==="L")strand=`<g transform="translate(200 0) scale(-1 1)">${strand}</g>`}
  if(c.band)acc+=`<path d="M52 74 Q100 28 148 74" stroke="#FF6F61" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M136 46 l14 -12 2 18z M136 46 l-6 -16 -12 12z" fill="#FF6F61"/><circle cx="136" cy="46" r="5" fill="#D94B3E"/>`;
  if(c.cap){const cc=c.color==="#FFFFFF"?"#16B3A6":c.color;acc+=`<path d="M48 76 Q48 28 100 28 Q152 28 152 76Z" fill="${cc}"/><path d="M46 76 Q100 66 168 80 Q152 92 100 84 Q60 84 46 76Z" fill="${shade(cc,.72)}"/><circle cx="100" cy="30" r="6" fill="${shade(cc,1.3)}"/>`}
  const svg=`<g transform="${hr}">${hairBack(c)}</g>${legs}${torso}${arms}<g transform="${hr}">${head}${face}${hairFront(c)}${strand}${acc}</g>`;
  return{H,svg,m};
}
/* local <-> world for an actor entity */
function toWorld(e,lx,ly,H){const a=(e.lean||0)*Math.PI/180;let x=lx-100,y=ly-H;lx=x*Math.cos(a)-y*Math.sin(a)+100;ly=x*Math.sin(a)+y*Math.cos(a)+H;if(e.flip)lx=200-lx;return[e.x-100*e.s+lx*e.s,e.y-H*e.s+ly*e.s+(e.bob||0)]}
function toLocal(e,wx,wy,H){let lx=(wx-(e.x-100*e.s))/e.s,ly=(wy-(e.bob||0)-(e.y-H*e.s))/e.s;if(e.flip)lx=200-lx;const a=-(e.lean||0)*Math.PI/180;const x=lx-100,y=ly-H;return[x*Math.cos(a)-y*Math.sin(a)+100,x*Math.sin(a)+y*Math.cos(a)+H]}
function resolveArm(e,side,m){const v=e["arm"+side];return Array.isArray(v)?{l:toLocal(e,v[0],v[1],m.H)}:(v||"down")}
function handWorld(e,side){const c=cfgOf(e),m=metrics(c,e.pose||"stand");const p=armPts(side,resolveArm(e,side,m),m,e.sh||0);return toWorld(e,p[4],p[5],m.H)}
function partWorld(e,lx,ly){const m=metrics(cfgOf(e),e.pose||"stand");return toWorld(e,lx,ly,m.H)}
function rActor(e){
  const c=cfgOf(e),m=metrics(c,e.pose||"stand");
  const av=avatar(c,{pose:e.pose,mood:e.mood,gx:e.gx,gy:e.gy,tilt:e.tilt,step:e.step,sh:e.sh,strand:e.strand,strandSide:e.strandSide,armL:resolveArm(e,"L",m),armR:resolveArm(e,"R",m),handL:e.handL,handR:e.handR,blinkDelay:e.bd||0});
  const H=av.H,s=e.s;let inner=av.svg;
  if(e.lean)inner=`<g transform="rotate(${e.lean.toFixed(2)} 100 ${H})">${inner}</g>`;
  if(e.flip)inner=`<g transform="translate(200 0) scale(-1 1)">${inner}</g>`;
  const walking=Math.abs(e.step||0)>.01;
  return `<g transform="translate(${(e.x-100*s).toFixed(1)} ${(e.y-H*s+(e.bob||0)).toFixed(1)}) scale(${s})" opacity="${e.alpha??1}"><ellipse cx="100" cy="${H-4}" rx="66" ry="11" fill="#2A2140" opacity=".13"/><g class="actor ${walking?"":"idle"} ${e.talk?"speaking":""} ${e.anim||""}">${inner}</g></g>`;
}

/* ---------------- props ---------------- */
const heartP=(x,y,s,c)=>`<path transform="translate(${x} ${y}) scale(${s})" d="M0 8 C-10 -6 -26 4 0 26 C26 4 10 -6 0 8Z" fill="${c}"/>`;
const PC=["#16B3A6","#FF6F61","#FFB04A","#38B6EE","#8A63FF","#3CC56B"];
function flowerG(r=1,on){let p="";for(let k=0;k<6;k++)p+=`<g transform="rotate(${k*60})"><ellipse cx="0" cy="-50" rx="27" ry="44" fill="${on&&on[k]?PC[k]:"#fff"}" stroke="#E2D6BF" stroke-width="4"/></g>`;return `<g transform="scale(${r})">${p}<circle r="30" fill="#FFD43B" stroke="#F2B500" stroke-width="4"/><circle cx="-9" cy="-9" r="10" fill="#FFF0A0"/></g>`}
function photoInner(k){const ph=PHOTOS[k];return ph?ph.svg:""}
const P={
  bag:e=>`<g transform="translate(${e.x.toFixed(1)} ${e.y.toFixed(1)}) rotate(${(e.rot||0).toFixed(1)}) scale(${e.s||1})" opacity="${e.alpha??1}"><path d="M-14 8 Q0 -16 14 8" stroke="#2B2E44" stroke-width="7" fill="none" stroke-linecap="round"/><circle cx="0" cy="12" r="7" fill="#2B2E44"/><path d="M-34 16 Q-62 70 -44 112 Q0 138 44 112 Q62 70 34 16 Q0 4 -34 16Z" fill="#3B3F5C"/><path d="M-22 36 Q-32 66 -22 92" stroke="#6A7096" stroke-width="7" fill="none" stroke-linecap="round"/></g>`,
  plane:e=>`<g transform="translate(${e.x.toFixed(1)} ${e.y.toFixed(1)}) rotate(${(e.rot||0).toFixed(1)}) scale(${e.s||1})" opacity="${e.alpha??1}"><path d="M-80 -6 L60 -18 Q92 -18 94 0 Q92 18 60 18 L-80 8Z" fill="#FF8A3D"/><path d="M-10 -10 L30 -76 L52 -74 L30 -8Z" fill="#F25F5C"/><path d="M-10 10 L24 66 L44 64 L28 8Z" fill="#F25F5C"/><path d="M-80 -4 L-100 -44 L-82 -46 L-56 -6Z" fill="#F25F5C"/><circle cx="44" cy="-2" r="7" fill="#BFEBFF"/><circle cx="22" cy="0" r="7" fill="#BFEBFF"/><circle cx="0" cy="1" r="7" fill="#BFEBFF"/></g>`,
  trail:e=>{const p=e.pts||[];let s="";for(let i=1;i<p.length;i++){s+=`<path d="M${p[i-1][0].toFixed(0)} ${p[i-1][1].toFixed(0)} L${p[i][0].toFixed(0)} ${p[i][1].toFixed(0)}" stroke="#FFFFFF" stroke-width="${(4+i/p.length*10).toFixed(1)}" stroke-linecap="round" opacity="${(i/p.length*.85*(e.alpha??1)).toFixed(2)}"/>`}return s},
  comb:e=>`<g transform="translate(${e.x.toFixed(1)} ${e.y.toFixed(1)}) rotate(${(e.rot||0).toFixed(1)})"><rect x="-44" y="-12" width="88" height="20" rx="8" fill="#FFB04A"/>${Array.from({length:8},(_,i)=>`<rect x="${-38+i*10.5}" y="6" width="6" height="20" rx="3" fill="#FFB04A"/>`).join("")}<rect x="-40" y="-8" width="80" height="5" rx="2" fill="#fff" opacity=".5"/></g>`,
  cloth:e=>`<g transform="translate(${e.x.toFixed(1)} ${e.y.toFixed(1)}) rotate(${(e.rot||0).toFixed(1)}) scale(${e.s||1})"><path d="M-46 -18 Q0 -34 46 -18 L40 22 Q0 34 -40 22Z" fill="#FF6F61"/><path d="M-36 -6 Q0 -18 36 -6 M-34 8 Q0 -4 34 8" stroke="#fff" stroke-width="3" stroke-dasharray="6 5" fill="none"/></g>`,
  book:e=>{const o=clamp(e.open||0,0,1),c=e.c||"#8A63FF";return `<g transform="translate(${e.x.toFixed(1)} ${e.y.toFixed(1)}) scale(${e.s||1})">${o>.5
    ?`<path d="M0 -4 L-50 -16 L-52 24 L0 36Z" fill="#fff" stroke="${c}" stroke-width="5" stroke-linejoin="round"/><path d="M0 -4 L50 -16 L52 24 L0 36Z" fill="#fff" stroke="${c}" stroke-width="5" stroke-linejoin="round"/><path d="M-42 0 L-10 8 M-42 10 L-10 18 M10 8 L42 0 M10 18 L42 10" stroke="#C9C2DA" stroke-width="3"/><circle cx="-26" cy="18" r="6" fill="#FFB04A"/>`
    :`<rect x="-40" y="-14" width="80" height="44" rx="6" fill="${c}"/><rect x="-34" y="-8" width="68" height="32" rx="4" fill="${shade(c,1.25)}"/>${e.mark?`<path d="M18 -14 V18 L24 12 L30 18 V-14Z" fill="#FF6F61"/>`:""}`}</g>`},
  album:e=>{const s=e.s||1;if(!e.open)return `<g transform="translate(${e.x.toFixed(1)} ${e.y.toFixed(1)}) rotate(${(e.rot||0).toFixed(1)}) scale(${s})"><rect x="-70" y="-50" width="140" height="100" rx="12" fill="#E8467C"/><rect x="58" y="-50" width="12" height="100" rx="5" fill="#FFB04A"/><path d="M-70 -38 L-58 -50 M-70 38 L-58 50" stroke="#FFD48A" stroke-width="6" stroke-linecap="round"/><g transform="translate(-4 -6)">${flowerG(.42)}</g></g>`;
    let fr="";for(let k=0;k<6;k++){const px=-128+(k%3)*42+(k>2?132:0)-(k>2?126:0),py=-40;const gx=k<3?-122+k*40:10+(k-3)*40,gy=-30;fr+=`<rect x="${gx}" y="${gy}" width="34" height="24" rx="3" fill="${PHOTOS[k+1]?PC[k]:"#FFF2F6"}" stroke="#F7A8C2" stroke-width="2" stroke-dasharray="${PHOTOS[k+1]?"0":"4 3"}"/>`}
    const pk=e.photo;const pic=pk&&PHOTOS[pk]?`<svg x="-64" y="-34" width="128" height="72" viewBox="${PHOTOS[pk].vb}" preserveAspectRatio="xMidYMid slice">${PHOTOS[pk].inner}</svg><rect x="-64" y="-34" width="128" height="72" fill="none" stroke="#FFB04A" stroke-width="4"/>`:fr;
    return `<g transform="translate(${e.x.toFixed(1)} ${e.y.toFixed(1)}) scale(${s})"><path d="M-140 -46 L0 -54 L140 -46 L140 46 L0 40 L-140 46Z" fill="#fff" stroke="#E8467C" stroke-width="6" stroke-linejoin="round"/><path d="M0 -54 V40" stroke="#F9C6D6" stroke-width="4"/>${pic}</g>`},
  bin:e=>{const l=clamp(e.lid||0,0,1);return `<g transform="translate(${e.x} ${e.y})"><path d="M-80 -230 L80 -230 L64 0 L-64 0Z" fill="#2F7BFF"/><path d="M-40 -200 L-34 -24 M0 -200 V-24 M40 -200 L34 -24" stroke="#1E5BD6" stroke-width="10" stroke-linecap="round"/><path d="M-26 -130 q26 -24 52 0 q-26 24 -52 0" fill="#fff" opacity=".9"/><rect x="-90" y="-246" width="180" height="22" rx="8" fill="#1E5BD6"/><g transform="rotate(${(-75*(1-l)).toFixed(1)} 88 -246)"><rect x="-94" y="-268" width="188" height="26" rx="10" fill="#2569E6"/><rect x="-24" y="-282" width="48" height="16" rx="6" fill="#1E5BD6"/></g></g>`},
  door:e=>{const o=clamp(e.open||0,0,1),w=120*(1-o*.82);return `<g transform="translate(${e.x} ${e.y})"><rect x="-8" y="-330" width="136" height="338" rx="6" fill="#C98A4B"/><rect x="0" y="-322" width="120" height="322" fill="#BFEBFF"/>${o>0?`<ellipse cx="60" cy="-40" rx="70" ry="30" fill="#7ED957"/><circle cx="90" cy="-250" r="26" fill="#FFD43B"/>`:""}<rect x="${120-w}" y="-322" width="${w}" height="322" fill="#E39B5A"/><rect x="${120-w+12}" y="-300" width="${Math.max(0,w-24)}" height="130" rx="6" fill="#F2B77D"/><circle cx="${120-w+16}" cy="-150" r="7" fill="#FFD43B"/></g>`},
  stool:e=>`<g transform="translate(${e.x} ${e.y})"><rect x="-84" y="-154" width="168" height="26" rx="12" fill="#16B3A6"/><rect x="-68" y="-130" width="18" height="130" rx="6" fill="#0D8A80"/><rect x="50" y="-130" width="18" height="130" rx="6" fill="#0D8A80"/><rect x="-60" y="-70" width="120" height="10" rx="4" fill="#0D8A80"/></g>`,
  table:e=>`<g transform="translate(${e.x} ${e.y})"><ellipse cx="0" cy="-92" rx="${e.w||110}" ry="22" fill="#E39B5A"/><ellipse cx="0" cy="-98" rx="${e.w||110}" ry="22" fill="#F2B77D"/><rect x="-10" y="-90" width="20" height="90" fill="#C98A4B"/><ellipse cx="0" cy="0" rx="50" ry="10" fill="#C98A4B"/></g>`,
  emo:e=>{if(e.hidden)return"";const k=e.k||"joy",fl=e.flip?-1:1;
    const face=(m)=>`<circle r="31" fill="#FFD43B" stroke="#F2B500" stroke-width="3"/><circle cx="-17" cy="9" r="7" fill="#FF9DB5" opacity=".85"/><circle cx="17" cy="9" r="7" fill="#FF9DB5" opacity=".85"/>${m}`;
    const ic=k==="love"?heartP(0,-14,1.9,"#FF4F7B")+`<ellipse cx="-12" cy="-4" rx="6" ry="4" fill="#fff" opacity=".7"/>`
      :k==="calm"?face(`<path d="M-17 -6 Q-10 0 -3 -6 M3 -6 Q10 0 17 -6" stroke="#5A3A12" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M-10 13 Q0 20 10 13" stroke="#5A3A12" stroke-width="4" fill="none" stroke-linecap="round"/>`)
      :face(`<path d="M-18 -4 Q-10 -14 -2 -4 M2 -4 Q10 -14 18 -4" stroke="#5A3A12" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M-14 8 Q0 26 14 8Z" fill="#B8435F"/>`);
    const sp=(x,y,c)=>`<path transform="translate(${x} ${y})" d="M0 -9 L2.5 -2.5 L9 0 L2.5 2.5 L0 9 L-2.5 2.5 L-9 0 L-2.5 -2.5Z" fill="${c}"/>`;
    return `<g transform="translate(${e.x.toFixed(1)} ${e.y.toFixed(1)}) scale(${(e.s||1).toFixed(3)})" opacity="${(e.alpha??1).toFixed(2)}"><circle cx="${-38*fl}" cy="52" r="9" fill="#fff" stroke="#FFC2CF" stroke-width="3"/><circle cx="${-52*fl}" cy="70" r="5.5" fill="#fff" stroke="#FFC2CF" stroke-width="3"/><circle r="50" fill="#fff" stroke="#FFC2CF" stroke-width="5"/>${ic}${sp(44,-40,"#FFB04A")}${sp(-46,-30,"#16B3A6")}</g>`},
  glow:e=>e.on?`<g transform="translate(${e.x.toFixed(1)} ${e.y.toFixed(1)})"><circle r="46" fill="#FFE68A" opacity=".55" class="glowp"/><circle r="30" fill="none" stroke="#FFD43B" stroke-width="6" opacity=".9"/></g>`:"",
  mirror:e=>{const refl=(e.refl||[]).map(id=>{const r=R.ents[id];if(!r||r.alpha===0)return"";if(r.t==="actor"){const cp={...r,flip:!r.flip,x:e.x+(e.x-r.x)*.35-40,y:r.y-20,s:r.s*.92,talk:false};return rActor(cp)}if(r.t==="plane"&&Math.abs(r.x-e.x)<e.rx+90){return `<g transform="translate(${2*r.x} 0) scale(-1 1)">${P.plane({...r,y:e.y+40,rot:-(r.rot||0)})}</g>`}return""}).join("");
    return `<g><clipPath id="mclip"><ellipse cx="${e.x}" cy="${e.y}" rx="${e.rx}" ry="${e.ry}"/></clipPath><ellipse cx="${e.x}" cy="${e.y}" rx="${e.rx+18}" ry="${e.ry+18}" fill="#FFB04A"/><ellipse cx="${e.x}" cy="${e.y}" rx="${e.rx+8}" ry="${e.ry+8}" fill="#FFD48A"/><g clip-path="url(#mclip)"><rect x="${e.x-e.rx}" y="${e.y-e.ry}" width="${e.rx*2}" height="${e.ry*2}" fill="#DDF3FF"/>${refl}<rect x="${e.x-e.rx}" y="${e.y-e.ry}" width="${e.rx*2}" height="${e.ry*2}" fill="#BFE6FF" opacity=".25"/><path d="M${e.x-e.rx*.6} ${e.y-e.ry*.5} l${e.rx*.5} -${e.ry*.25} M${e.x-e.rx*.5} ${e.y-e.ry*.25} l${e.rx*.6} -${e.ry*.3}" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity=".7"/></g></g>`},
  kmirror:e=>{const c=charCfg(),av=avatar(c,{pose:"stand",mood:e.mood||"happy",gx:0,armL:e.armL||"down",armR:e.armR||"down",handR:e.handR});const s=1.32,H=av.H;
    return `<g><clipPath id="kclip"><ellipse cx="${e.x}" cy="${e.y}" rx="210" ry="300"/></clipPath><rect x="${e.x-14}" y="${e.y+290}" width="28" height="120" fill="#C98A4B"/><ellipse cx="${e.x}" cy="${e.y+410}" rx="110" ry="18" fill="#C98A4B"/><ellipse cx="${e.x}" cy="${e.y}" rx="232" ry="322" fill="#FF6F61"/><ellipse cx="${e.x}" cy="${e.y}" rx="220" ry="310" fill="#FFB04A"/><g clip-path="url(#kclip)"><rect x="${e.x-210}" y="${e.y-300}" width="420" height="600" fill="#E3F6FF"/><ellipse cx="${e.x}" cy="${e.y+300}" rx="260" ry="90" fill="#BFE6FF"/>${e.hideKid?"":`<g transform="translate(${e.x-100*s} ${e.y+272-H*s}) scale(${s})"><g class="actor idle">${av.svg}</g></g>`}<path d="M${e.x-150} ${e.y-200} l90 -50 M${e.x-140} ${e.y-140} l120 -66" stroke="#fff" stroke-width="14" stroke-linecap="round" opacity=".7"/></g>${[[-190,-250],[200,-170],[-170,180],[190,230]].map(([dx,dy],i)=>`<path transform="translate(${e.x+dx} ${e.y+dy}) scale(${.8+i%2*.4})" d="M0 -16 L4 -4 L16 0 L4 4 L0 16 L-4 4 L-16 0 L-4 -4Z" fill="#FFF3A0" class="glowp"/>`).join("")}</g>`}
};

/* ---------------- painted sets (1600x900) ---------------- */
const DEFS=`<defs>
<pattern id="dots" width="64" height="64" patternUnits="userSpaceOnUse"><circle cx="32" cy="32" r="7" fill="#fff" opacity=".5"/></pattern>
<pattern id="stars" width="140" height="140" patternUnits="userSpaceOnUse"><path d="M70 48 l7 15 16 2 -12 11 3 16 -14 -8 -14 8 3 -16 -12 -11 16 -2z" fill="#fff" opacity=".45"/></pattern>
<pattern id="clouds" width="260" height="180" patternUnits="userSpaceOnUse"><g fill="#fff" opacity=".55"><ellipse cx="70" cy="60" rx="46" ry="20"/><ellipse cx="96" cy="48" rx="30" ry="20"/><ellipse cx="200" cy="140" rx="36" ry="16"/></g></pattern>
<pattern id="wood" width="200" height="64" patternUnits="userSpaceOnUse"><rect width="200" height="64" fill="#FFBE6E"/><path d="M0 62 H200 M100 0 V62" stroke="#F09E45" stroke-width="5"/></pattern>
<pattern id="tiles" width="120" height="120" patternUnits="userSpaceOnUse"><rect width="120" height="120" fill="#A6EADB"/><rect width="60" height="60" fill="#C4F3E8"/><rect x="60" y="60" width="60" height="60" fill="#C4F3E8"/></pattern>
<pattern id="patio" width="110" height="110" patternUnits="userSpaceOnUse"><rect width="110" height="110" fill="#E9D7C2"/><rect x="4" y="4" width="102" height="102" rx="8" fill="#F3E4D2"/></pattern>
<pattern id="grass" width="60" height="40" patternUnits="userSpaceOnUse"><rect width="60" height="40" fill="#6FD36A"/><path d="M8 30 l4 -10 l4 10 M38 18 l4 -10 l4 10" stroke="#52BD55" stroke-width="3" fill="none"/></pattern>
<linearGradient id="skyG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3CC4F5"/><stop offset="1" stop-color="#C9EEFF"/></linearGradient>
<radialGradient id="tableG"><stop offset="0" stop-color="#FFD9A8"/><stop offset="1" stop-color="#F2B77D"/></radialGradient>
</defs>`;
function bunting(y,n){const cols=["#FF6F61","#FFB04A","#16B3A6","#38B6EE","#8A63FF","#3CC56B"];let s=`<path d="M0 ${y} Q800 ${y+70} 1600 ${y}" stroke="#E7B65A" stroke-width="4" fill="none"/>`;for(let i=0;i<n;i++){const t=(i+.5)/n,x=1600*t,yy=y+70*4*t*(1-t)*.5;s+=`<path d="M${x-26} ${yy} L${x+26} ${yy} L${x} ${yy+52}Z" fill="${cols[i%6]}"/>`}return s}
function sunFace(x,y,r){return `<g transform="translate(${x} ${y})"><g stroke="#FFB300" stroke-width="10" stroke-linecap="round">${Array.from({length:10},(_,i)=>{const a=i*Math.PI/5;return `<path d="M${(Math.cos(a)*(r+14)).toFixed(0)} ${(Math.sin(a)*(r+14)).toFixed(0)} L${(Math.cos(a)*(r+34)).toFixed(0)} ${(Math.sin(a)*(r+34)).toFixed(0)}"/>`}).join("")}</g><circle r="${r}" fill="#FFD93D"/><circle cx="${-r*.32}" cy="${-r*.1}" r="${r*.09}" fill="#5A3A00"/><circle cx="${r*.32}" cy="${-r*.1}" r="${r*.09}" fill="#5A3A00"/><path d="M${-r*.35} ${r*.2} Q0 ${r*.5} ${r*.35} ${r*.2}" stroke="#5A3A00" stroke-width="6" fill="none" stroke-linecap="round"/><circle cx="${-r*.55}" cy="${r*.18}" r="${r*.14}" fill="#FF9E80" opacity=".7"/><circle cx="${r*.55}" cy="${r*.18}" r="${r*.14}" fill="#FF9E80" opacity=".7"/></g>`}
const cloud=(x,y,s=1)=>`<g transform="translate(${x} ${y}) scale(${s})" fill="#fff"><ellipse cx="0" cy="0" rx="90" ry="40"/><ellipse cx="-50" cy="10" rx="55" ry="32"/><ellipse cx="55" cy="8" rx="60" ry="34"/><ellipse cx="10" cy="-26" rx="50" ry="34"/></g>`;
function windowSky(x,y,w,h,id){return `<rect x="${x-14}" y="${y-14}" width="${w+28}" height="${h+28}" rx="22" fill="#fff"/><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="url(#skyG)"/><clipPath id="wc${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10"/></clipPath><g clip-path="url(#wc${id})">${sunFace(x+w*.72,y+h*.32,40)}${cloud(x+w*.3,y+h*.42,.8)}<ellipse cx="${x+w*.3}" cy="${y+h+30}" rx="${w*.6}" ry="90" fill="#6BD66B"/><ellipse cx="${x+w*.9}" cy="${y+h+40}" rx="${w*.5}" ry="90" fill="#4CC45A"/></g><path d="M${x+w/2} ${y} V${y+h} M${x} ${y+h/2} H${x+w}" stroke="#fff" stroke-width="12"/>`}
const curtains=(x,y,w,h,col)=>`<path d="M${x-40} ${y-30} Q${x-10} ${y+h*.5} ${x-34} ${y+h+40} L${x+20} ${y+h+40} Q${x+6} ${y+h*.5} ${x+24} ${y-30}Z" fill="${col}"/><path d="M${x+w+40} ${y-30} Q${x+w+10} ${y+h*.5} ${x+w+34} ${y+h+40} L${x+w-20} ${y+h+40} Q${x+w-6} ${y+h*.5} ${x+w-24} ${y-30}Z" fill="${col}"/><rect x="${x-60}" y="${y-44}" width="${w+120}" height="20" rx="10" fill="${shade(col,.75)}"/>`;
const plant=(x,y,s=1,pot="#FF6F61")=>`<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 -40 Q-60 -80 -46 -140 Q-6 -104 0 -40 Q10 -128 52 -150 Q50 -84 0 -40 Q-34 -120 -12 -184 Q22 -128 0 -40" fill="#3FCB6E"/><path d="M-34 -40 H34 L25 14 H-25Z" fill="${pot}"/><path d="M-34 -40 H34" stroke="#fff" stroke-width="6" opacity=".5"/></g>`;
const pframe=(x,y,w,h,col,inner)=>`<g transform="translate(${x} ${y})"><rect x="-10" y="-10" width="${w+20}" height="${h+20}" rx="14" fill="${col}"/><rect width="${w}" height="${h}" rx="6" fill="#FFF8E1"/>${inner||""}</g>`;
function rug(x,y,w=380){const cols=["#FF6F61","#FFB04A","#16B3A6","#38B6EE"];return cols.map((c,i)=>`<ellipse cx="${x}" cy="${y}" rx="${w-i*w*.18}" ry="${78-i*15}" fill="${c}"/>`).join("")}
function sofa(x0,x1,col){const c2=shade(col,.85);return `<rect x="${x0}" y="400" width="${x1-x0}" height="200" rx="60" fill="${col}"/><rect x="${x0+40}" y="430" width="${(x1-x0)/2-60}" height="130" rx="40" fill="${shade(col,1.15)}"/><rect x="${(x0+x1)/2+20}" y="430" width="${(x1-x0)/2-60}" height="130" rx="40" fill="${shade(col,1.15)}"/><rect x="${x0-50}" y="470" width="110" height="230" rx="46" fill="${c2}"/><rect x="${x1-60}" y="470" width="110" height="230" rx="46" fill="${c2}"/><rect x="${x0}" y="560" width="${x1-x0}" height="60" rx="26" fill="${shade(col,1.1)}"/><rect x="${x0}" y="606" width="${x1-x0}" height="96" rx="30" fill="${c2}"/><rect x="${x0+30}" y="698" width="22" height="34" rx="6" fill="#B06A2E"/><rect x="${x1-52}" y="698" width="22" height="34" rx="6" fill="#B06A2E"/>`}
function familyPic(){return `<circle cx="40" cy="44" r="14" fill="#FFD2AE"/><path d="M22 96 Q22 64 40 62 Q58 64 58 96Z" fill="#fff" stroke="#ccc"/><circle cx="80" cy="46" r="13" fill="#FFD2AE"/><path d="M62 96 Q62 66 80 64 Q98 66 98 96Z" fill="#16B3A6"/><circle cx="116" cy="60" r="10" fill="#FFD2AE"/><path d="M102 96 Q102 76 116 74 Q130 76 130 96Z" fill="#3E7BE0"/>${heartP(80,6,.7,"#FF6F61")}`}
const fence=(y)=>`<g>${Array.from({length:34},(_,i)=>`<path d="M${i*48+6} ${y+110} V${y+14} L${i*48+24} ${y} L${i*48+42} ${y+14} V${y+110}Z" fill="#fff" stroke="#E7DCCB" stroke-width="2"/>`).join("")}<rect y="${y+30}" width="1600" height="14" fill="#F1E8DA"/><rect y="${y+80}" width="1600" height="14" fill="#F1E8DA"/></g>`;
const butterfly=(x,y,c)=>`<g transform="translate(${x} ${y})" class="glowp"><ellipse cx="-10" cy="-4" rx="12" ry="9" fill="${c}"/><ellipse cx="10" cy="-4" rx="12" ry="9" fill="${c}"/><ellipse cx="-8" cy="8" rx="8" ry="6" fill="${c}"/><ellipse cx="8" cy="8" rx="8" ry="6" fill="${c}"/><rect x="-2" y="-10" width="4" height="22" rx="2" fill="#2A2140"/></g>`;
const SETS={
  cover:{
    far:()=>`<rect width="1600" height="900" fill="#CDB8FF"/>${[[180,160,380,230,"#B9A0FF"],[1380,120,420,240,"#E0D2FF"],[820,520,620,330,"#D6C6FF"],[120,760,360,220,"#EDE4FF"],[1500,760,380,240,"#B9A0FF"],[760,90,300,150,"#EDE4FF"]].map(([x,y,rx,ry,c])=>`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${c}" opacity=".45"/>`).join("")}<rect width="1600" height="900" fill="url(#dots)" opacity=".35"/>${bunting(-6,16)}`,
    mid:()=>{const fig=(c,x,base,k,mood,flip)=>{const a=avatar(c,{pose:"stand",mood,armL:"down",armR:"down"});const inner=flip?`<g transform="translate(200 0) scale(-1 1)">${a.svg}</g>`:a.svg;return `<g transform="translate(${(x-100*k).toFixed(1)} ${(base-a.H*k).toFixed(1)}) scale(${k.toFixed(4)})">${inner}</g>`};
      const k=470/avatar(LOOK.dad,{pose:"stand"}).H,b=915;
      return `<ellipse cx="300" cy="905" rx="300" ry="40" fill="#9F83F0" opacity=".35"/><ellipse cx="1300" cy="905" rx="320" ry="40" fill="#9F83F0" opacity=".35"/>`
        +fig(LOOK.dad,205,b,k,"happy",false)+fig(cfgFor(defaultChar("boy")),395,b,k,"happy",false)
        +fig(LOOK.momH,1405,b,k,"happy",true)+fig(cfgFor(defaultChar("girl")),1215,b,k,"laugh",true)+fig(LOOK.bro,1062,b+6,k,"happy",true)},
    near:()=>{const sp=(x,y,r,c)=>`<path transform="translate(${x} ${y}) scale(${r})" d="M0 -10 L2.8 -2.8 L10 0 L2.8 2.8 L0 10 L-2.8 2.8 L-10 0 L-2.8 -2.8Z" fill="${c}"/>`;
      return `<g style="font-family:var(--f-display);font-weight:800" text-anchor="middle">
        <text x="800" y="330" font-size="210" fill="#4B2A99" opacity=".25" transform="translate(0 14)">ألبوم أُسرتي</text>
        <text x="800" y="330" font-size="210" fill="#EEE4FF" stroke="#4B2A99" stroke-width="20" stroke-linejoin="round" paint-order="stroke">ألبوم أُسرتي</text>
        <g transform="rotate(-2 800 420)"><rect x="560" y="378" width="480" height="88" rx="44" fill="#fff"/><text x="800" y="440" font-size="58" fill="#4B2A99">يومٌ نصنعه معًا</text></g>
        <text x="800" y="530" font-size="38" fill="#fff" stroke="#4B2A99" stroke-width="8" stroke-linejoin="round" paint-order="stroke">قصّةٌ تفاعلية للصفّ الثاني</text></g>
        ${heartP(560,560,2.4,"#fff")}${heartP(1060,470,1.6,"#FFD43B")}${sp(470,220,2.2,"#FFD43B")}${sp(1140,200,1.8,"#fff")}${sp(1210,470,1.4,"#FFD43B")}${sp(390,470,1.3,"#fff")}
        <g transform="translate(1480 230)"><circle r="58" fill="#FFD43B"/>${[0,1,2,3,4,5,6,7].map(i=>`<rect x="-6" y="-88" width="12" height="20" rx="6" fill="#FFD43B" transform="rotate(${i*45})"/>`).join("")}<path d="M-20 -6 Q-13 -16 -6 -6 M6 -6 Q13 -16 20 -6" stroke="#8A4B00" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M-16 12 Q0 28 16 12" stroke="#8A4B00" stroke-width="5" fill="none" stroke-linecap="round"/></g>`}
  },
  kidroom:{
    far:()=>`<rect width="1600" height="660" fill="#BDEFE7"/><rect width="1600" height="660" fill="url(#clouds)"/>${windowSky(1060,110,280,230,"k")}${curtains(1060,110,280,230,"#FFB04A")}<g transform="translate(150 230)"><rect width="300" height="16" rx="6" fill="#C98A4B"/><rect x="20" y="-70" width="50" height="70" rx="8" fill="#FF6F61"/><circle cx="130" cy="-34" r="34" fill="#8A63FF"/><rect x="190" y="-56" width="70" height="56" rx="10" fill="#38B6EE"/></g>${bunting(14,16)}`,
    mid:()=>`<rect y="640" width="1600" height="260" fill="url(#wood)"/><rect y="630" width="1600" height="16" fill="#9ADCD3"/><ellipse cx="800" cy="830" rx="420" ry="60" fill="#FFB04A"/><ellipse cx="800" cy="830" rx="330" ry="44" fill="none" stroke="#fff" stroke-width="8" stroke-dasharray="20 14"/><g><rect x="1150" y="560" width="400" height="190" rx="30" fill="#FF6F61"/><rect x="1130" y="470" width="50" height="300" rx="18" fill="#D94B3E"/><path d="M1170 600 H1550 V720 Q1550 750 1520 750 H1200 Q1170 750 1170 720Z" fill="#FFE2DE"/><ellipse cx="1260" cy="580" rx="70" ry="30" fill="#fff"/></g><rect x="1468" y="300" width="132" height="345" rx="6" fill="#C98A4B"/><rect x="1478" y="310" width="122" height="335" fill="#F2B77D"/><circle cx="1490" cy="490" r="8" fill="#FFD43B"/>`,
    near:()=>`${plant(60,900,1.5,"#8A63FF")}<g transform="translate(1520 880)"><circle cy="-70" r="46" fill="#C98A4B"/><circle cx="-36" cy="-108" r="18" fill="#C98A4B"/><circle cx="36" cy="-108" r="18" fill="#C98A4B"/><circle cx="-14" cy="-74" r="5" fill="#2A2140"/><circle cx="14" cy="-74" r="5" fill="#2A2140"/><ellipse cy="-58" rx="14" ry="10" fill="#F2B77D"/><ellipse cy="-6" rx="54" ry="44" fill="#C98A4B"/></g>`
  },
  living:{
    far:()=>`<rect width="1600" height="660" fill="#FFE07A"/><rect width="1600" height="660" fill="url(#dots)"/>${windowSky(640,96,320,250,"l")}${curtains(640,96,320,250,"#FF8A3D")}${pframe(170,170,150,110,"#8A63FF",familyPic())}${pframe(1180,150,130,130,"#16B3A6",heartP(65,40,2,"#FF6F61"))}${bunting(10,16)}<path d="M1380 300 V640" stroke="#FFB300" stroke-width="10"/><path d="M1318 300 L1442 300 L1424 220 L1336 220Z" fill="#FF6F61"/>`,
    mid:()=>`<rect y="628" width="1600" height="26" fill="#E8C150"/><rect y="650" width="1600" height="250" fill="url(#wood)"/><rect x="0" y="290" width="120" height="360" fill="#7A4A2A" opacity=".35"/><rect x="0" y="290" width="128" height="16" fill="#C98A4B"/>${rug(800,830)}${sofa(380,1220,"#16B3A6")}${P.table({x:800,y:812,w:96})}`,
    near:()=>`${plant(70,930,1.7,"#38B6EE")}`
  },
  yard:{
    far:()=>`<rect width="1600" height="640" fill="url(#skyG)"/>${sunFace(1240,120,64)}${cloud(320,120,1.1)}${cloud(860,80,.8)}<g><rect x="60" y="330" width="260" height="230" rx="10" fill="#FF8A3D"/><path d="M40 340 L190 230 L340 340Z" fill="#F25F5C"/><rect x="560" y="360" width="240" height="200" rx="10" fill="#FFB04A"/><path d="M540 370 L680 270 L820 370Z" fill="#38B6EE"/></g><g fill="#3FB650">${[0,1,2,3,4,5,6,7,8,9].map(i=>`<circle cx="${i*180+20}" cy="${555+(i%2)*10}" r="${80+(i%3)*12}"/>`).join("")}</g>`,
    mid:()=>`${fence(470)}<rect y="600" width="1600" height="300" fill="url(#grass)"/><path d="M760 600 H1600 V900 H700Z" fill="url(#patio)"/><rect x="1440" y="220" width="160" height="420" fill="#F2D3A0"/><rect x="1440" y="210" width="160" height="20" fill="#E39B5A"/><g transform="translate(300 700)"><rect x="-130" y="-40" width="260" height="26" rx="10" fill="#C98A4B"/><rect x="-130" y="-92" width="260" height="20" rx="8" fill="#C98A4B"/><rect x="-118" y="-14" width="18" height="70" fill="#9A642F"/><rect x="100" y="-14" width="18" height="70" fill="#9A642F"/></g>${[180,430,620].map((x,i)=>`<g transform="translate(${x} ${640+i*14})">${[0,72,144,216,288].map(a=>`<ellipse cx="0" cy="-14" rx="7" ry="12" transform="rotate(${a})" fill="${["#FF6F61","#FFB04A","#8A63FF"][i]}"/>`).join("")}<circle r="6" fill="#FFE66D"/></g>`).join("")}`,
    near:()=>`<g fill="#3FB650"><circle cx="-20" cy="900" r="150"/><circle cx="120" cy="930" r="110"/><circle cx="1620" cy="910" r="130"/></g>${butterfly(220,300,"#FF6F61")}${butterfly(1180,360,"#8A63FF")}`
  },
  room:{
    far:()=>`<rect width="1600" height="660" fill="#FFC4DD"/><rect width="1600" height="660" fill="url(#stars)"/>${windowSky(240,110,260,220,"r")}${curtains(240,110,260,220,"#8A63FF")}${pframe(620,160,120,96,"#16B3A6",heartP(60,30,1.8,"#FF6F61"))}${bunting(10,16)}`,
    mid:()=>`<rect y="628" width="1600" height="26" fill="#F49CC4"/><rect y="650" width="1600" height="250" fill="url(#tiles)"/><ellipse cx="760" cy="850" rx="360" ry="56" fill="#FFE66D"/><ellipse cx="760" cy="850" rx="270" ry="38" fill="none" stroke="#fff" stroke-width="8" stroke-dasharray="20 14"/><g transform="translate(1100 0)"><rect x="-150" y="590" width="300" height="200" rx="20" fill="#8A63FF"/><rect x="-130" y="616" width="120" height="70" rx="12" fill="#A88BFF"/><rect x="10" y="616" width="120" height="70" rx="12" fill="#A88BFF"/><rect x="-130" y="700" width="260" height="70" rx="12" fill="#A88BFF"/><circle cx="-70" cy="651" r="8" fill="#FFB04A"/><circle cx="70" cy="651" r="8" fill="#FFB04A"/><rect x="-160" y="578" width="320" height="22" rx="10" fill="#6541D9"/></g><g transform="translate(820 0)"><rect x="-96" y="400" width="16" height="400" rx="6" fill="#C8792F"/><rect x="80" y="400" width="16" height="400" rx="6" fill="#C8792F"/><rect x="-96" y="400" width="192" height="20" rx="8" fill="#E08E3C"/><rect x="-96" y="450" width="192" height="16" rx="8" fill="#E08E3C"/></g><rect x="1470" y="300" width="130" height="345" rx="6" fill="#C98A4B"/><rect x="1480" y="310" width="120" height="335" fill="#7A4A2A" opacity=".4"/>`,
    near:()=>`${plant(1540,930,1.5,"#FFB04A")}`
  }
};

/* ---------------- renderer & camera ---------------- */
const R={set:null,ents:{},order:[]};
const farSvg=$("#far"),midSvg=$("#mid"),nearSvg=$("#near"),farW=$("#farW"),midW=$("#midW"),nearW=$("#nearW"),stage=$("#stage"),UIL=$("#ui");
function renderEnt(id){const e=R.ents[id];if(!e||e.hidden)return"";return e.t==="actor"?rActor(e):(P[e.t]?P[e.t](e):"")}
function useSet(name){R.set=name;const S2=SETS[name];farSvg.innerHTML=DEFS+S2.far();nearSvg.innerHTML=S2.near?S2.near():""}
function drawMid(){const S2=SETS[R.set];midSvg.innerHTML=DEFS+S2.mid()+R.order.map(id=>`<g id="e_${id}">${renderEnt(id)}</g>`).join("")}
function ent(id,o){R.ents[id]=Object.assign({alpha:1,bd:(id.length*.7)%4},o);if(!R.order.includes(id))R.order.push(id)}
function clearEnts(){R.ents={};R.order=[]}
function flush(){
  if(!DIRTY.size)return;const ids=new Set(DIRTY);DIRTY.clear();
  for(const id of R.order){const e=R.ents[id];if(!e)continue;if(e.att&&ids.has(e.att.to))ids.add(id);if(e.dep&&e.dep.some(d=>ids.has(d)))ids.add(id)}
  for(const id of R.order){const e=R.ents[id];if(e&&e.att){const [hx,hy]=handWorld(R.ents[e.att.to],e.att.side);e.x=hx+(e.att.dx||0);e.y=hy+(e.att.dy||0)}}
  ids.forEach(id=>{const g=midSvg.querySelector("#e_"+id);if(g)g.innerHTML=renderEnt(id)});
}
function attach(id,to,side,dx=0,dy=0){set(id,{att:{to,side,dx,dy}});DIRTY.add(to)}
function detach(id){const e=R.ents[id];if(e)e.att=null}
let CAM={cx:800,cy:450,z:1};
function camApply(dur,ease){
  const {cx,cy,z}=CAM;
  const put=(el,f)=>{const zz=1+(z-1)*f,hw=800/zz,hh=450/zz,ccx=clamp(800+(cx-800)*f,hw,1600-hw),ccy=clamp(450+(cy-450)*f,hh,900-hh);
    el.style.transition=dur?`transform ${Math.round(dur/SPEED)}ms ${ease}`:"none";el.style.transform=`translate(50%,50%) scale(${zz.toFixed(4)}) translate(${(-ccx/16).toFixed(3)}%,${(-ccy/9).toFixed(3)}%)`};
  put(farW,.86);put(midW,1);put(nearW,1.14);
}
function cam(cx,cy,z,dur=1400,ease=CSS_EIO){z=Math.max(1,z);const hw=800/z,hh=450/z;CAM={cx:clamp(cx,hw,1600-hw),cy:clamp(cy,hh,900-hh),z};camApply(dur,ease);repositionUI();return dur?wait(dur):Promise.resolve()}
function w2s(wx,wy){const r=stage.getBoundingClientRect(),k=r.width/1600;return{x:r.width/2+(wx-CAM.cx)*k*CAM.z,y:r.height/2+(wy-CAM.cy)*k*CAM.z,k:k*CAM.z}}
function s2w(cx,cy){const r=stage.getBoundingClientRect(),k=r.width/1600*CAM.z;return[CAM.cx+(cx-r.left-r.width/2)/k,CAM.cy+(cy-r.top-r.height/2)/k]}

/* ---------------- stage UI helpers ---------------- */
const HANDSVG=`<svg viewBox="0 0 64 64"><path d="M24 8 q6 -4 9 2 v20 l4 -2 q6 -2 8 3 l3 -1 q6 -1 7 5 l2 0 q6 1 5 8 l-3 14 q-2 6 -8 6 H30 q-5 0 -8 -4 L10 38 q-3 -5 2 -8 q4 -2 8 2 l4 4 V12z" fill="#fff" stroke="#2A2140" stroke-width="3" stroke-linejoin="round"/></svg>`;
let PLACED=[];
function place(el,wx,wy,r){el._w=[wx,wy,r];PLACED.push(el);posEl(el);UIL.appendChild(el);return el}
function posEl(el){if(!el._w)return;const [wx,wy,r]=el._w,p=w2s(wx,wy);el.style.left=p.x+"px";el.style.top=p.y+"px";if(r){const d=Math.max(64,r*2*p.k);el.style.width=el.style.height=d+"px"}}
function repositionUI(){PLACED=PLACED.filter(el=>el.isConnected);PLACED.forEach(posEl)}
window.addEventListener("resize",repositionUI);
function clearUI(){UIL.querySelectorAll(".hint,.ring,.hand,.dot,.pagetgt,.tray,.cardsel").forEach(n=>n.remove());PLACED=[];document.querySelectorAll(".card.drag").forEach(n=>n.remove())}
function hint(text){UIL.querySelectorAll(".hint").forEach(n=>n.remove());panelHint(text);if(!text)return;const d=document.createElement("div");d.className="hint";d.textContent=text;UIL.appendChild(d)}
function handAt(wx,wy){const h=document.createElement("div");h.className="hand";h.innerHTML=HANDSVG;return place(h,wx,wy,0)}
function ringBtn(wx,wy,r,label,cls="ring"){const b=document.createElement("button");b.className=cls;b.innerHTML=`<span class="lbl">${esc(label)}</span>`;b.setAttribute("aria-label",label);return place(b,wx,wy,r)}
function fx(ch,wx,wy,n=6){const L=fxLayer();const p=w2s(wx,wy);for(let k=0;k<n;k++){const d=document.createElement("span");d.className="fx";d.textContent=ch;d.style.left=(p.x+(Math.random()*90-45))+"px";d.style.top=(p.y+(Math.random()*50-25))+"px";d.style.color=PC[k%6];d.style.animationDelay=(k*90)+"ms";L.appendChild(d);setTimeout(()=>d.remove(),1900)}}
function fxLayer(){let L=UIL.querySelector(".fxl");if(!L){L=document.createElement("div");L.className="fxl";UIL.appendChild(L)}return L}
function flashFx(){const f=document.createElement("div");f.className="flash";UIL.appendChild(f);setTimeout(()=>f.remove(),600)}
const RM=matchMedia("(prefers-reduced-motion: reduce)");
function stageClone(){const t=document.createElement("div");t.className="trans pgclone";t.innerHTML=(farW.outerHTML+midW.outerHTML+nearW.outerHTML).replace(/\sid="(e_[^"]*|far|mid|near|farW|midW|nearW)"/g,"");return t}
function slideEl(el,from,to,dur){return el.animate([{transform:`translateX(${from})`},{transform:`translateX(${to})`}],{duration:RM.matches?1:Math.round(dur/SPEED),easing:"cubic-bezier(.77,0,.175,1)",fill:"forwards"})}
async function pageSlide(build,dur=720){
  const old=stageClone();UIL.appendChild(old);build();drawMid();const nu=stageClone();UIL.appendChild(nu);
  nu.style.transform="translateX(-100%)";SFX.page();slideEl(old,"0%","100%",dur);slideEl(nu,"-100%","0%",dur);try{await wait(dur+40)}finally{old.remove();nu.remove()}
}
async function titleCard(n,title,c){
  const d=document.createElement("div");d.className="titlecard";d.style.setProperty("--c",c||PC[(n-1)%6]);d.innerHTML=`<div><small>المشهد ${ar(n)}</small><h2>${esc(title)}</h2></div>`;
  d.style.transform="translateX(-100%)";UIL.appendChild(d);let nu=null;
  try{SFX.page();slideEl(d,"-100%","0%",650);await wait(650);SFX.magic();await wait(950);
    nu=stageClone();nu.style.transform="translateX(-100%)";UIL.insertBefore(nu,d);SFX.page();slideEl(d,"0%","100%",650);slideEl(nu,"-100%","0%",650);await wait(690)}
  finally{d.remove();if(nu)nu.remove()}
}

/* ---------------- interactions ---------------- */
function waitTap(wx,wy,label,r=70){
  const my=RUN;
  return new Promise(res=>{const b=ringBtn(wx,wy,r,label);const h=handAt(wx,wy);
    b.onclick=()=>{b.remove();h.remove();SFX.good();fx("✦",wx,wy,5);res()};}).then(chk(my));
}
/* drag a prop to a world target; tap prop then tap target also works */
function waitDrag(o){
  const my=RUN;
  return new Promise(res=>{
    const e=R.ents[o.id];const start={x:e.x,y:e.y,att:e.att?{...e.att}:null};
    const tg=typeof o.target==="function"?o.target():o.target;
    const grab=ringBtn(e.x+(o.gdx||0),e.y+(o.gdy||0),o.gr||64,o.label,"ring grab");
    const tgt=ringBtn(tg[0],tg[1],o.tr||70,o.tlabel||"المكان المطلوب","ring target");
    const hnd=handAt(e.x+(o.gdx||0),e.y+(o.gdy||0));
    let drag=null,sel=false,near=false,done=false;
    const finish=(how)=>{if(done)return;done=true;grab.remove();tgt.remove();hnd.remove();o.onNear&&o.onNear(false);SFX.good();res(how)};
    const revert=()=>{SFX.soft();o.onFail&&o.onFail();if(start.att){e.att=start.att;DIRTY.add(o.id);DIRTY.add(start.att.to);setTimeout(()=>{const [hx,hy]=handWorld(R.ents[start.att.to],start.att.side);grab._w=[hx+(start.att.dx||0)+(o.gdx||0),hy+(start.att.dy||0)+(o.gdy||0),o.gr||64];posEl(grab)},30)}else{tw(o.id,{x:start.x,y:start.y},350,EO).catch(()=>{});grab._w=[start.x+(o.gdx||0),start.y+(o.gdy||0),o.gr||64];posEl(grab)}};
    grab.addEventListener("pointerdown",ev=>{ev.preventDefault();try{grab.setPointerCapture(ev.pointerId)}catch(_){}drag={x:ev.clientX,y:ev.clientY,moved:false};hnd.remove();});
    grab.addEventListener("pointermove",ev=>{if(!drag)return;if(Math.hypot(ev.clientX-drag.x,ev.clientY-drag.y)>10&&!drag.moved){drag.moved=true;grab.classList.add("dragging");if(e.att){const [hx,hy]=handWorld(R.ents[e.att.to],e.att.side);e.x=hx+(e.att.dx||0);e.y=hy+(e.att.dy||0);e.att=null}o.onGrab&&o.onGrab()}
      if(drag.moved){const [wx,wy]=s2w(ev.clientX,ev.clientY);e.x=wx-(o.gdx||0);e.y=wy-(o.gdy||0);DIRTY.add(o.id);grab._w=[wx,wy,o.gr||64];posEl(grab);
        const t2=typeof o.target==="function"?o.target():tg;const n=Math.hypot(e.x-t2[0],e.y-t2[1])<(o.tr||70)*1.25;if(n!==near){near=n;o.onNear&&o.onNear(n)}}});
    const up=ev=>{if(!drag)return;const d=drag;drag=null;grab.classList.remove("dragging");
      if(!d.moved){sel=!sel;grab.classList.toggle("sel",sel);tgt.classList.toggle("armed",sel);SFX.tap();if(sel)o.onGrab&&o.onGrab();return}
      if(near)finish("drag");else revert()};
    grab.addEventListener("pointerup",up);grab.addEventListener("pointercancel",up);
    grab.addEventListener("keydown",ev=>{if(ev.key==="Enter"||ev.key===" "){ev.preventDefault();sel=true;grab.classList.add("sel");tgt.classList.add("armed");tgt.focus()}});
    tgt.addEventListener("click",()=>{if(sel)finish("tap")});
  }).then(chk(my));
}
/* trace along points (drag) or tap the dots in order */
function waitTrace(pts,onProg,label){
  const my=RUN;
  return new Promise(res=>{
    let next=0,down=false;const dots=pts.map((p,i)=>{const b=document.createElement("button");b.className="dot"+(i===0?" next":"");b.setAttribute("aria-label",`${label} ${ar(i+1)}`);place(b,p[0],p[1],0);return b});
    const hnd=handAt(pts[0][0],pts[0][1]);
    const reach=(i,w)=>{if(i!==next)return;dots[i].classList.remove("next");dots[i].classList.add("done");next++;SFX.brush();onProg(next/pts.length,w||pts[i]);if(next<pts.length)dots[next].classList.add("next");else{cleanup();setTimeout(res,250)}};
    const near=(cx,cy)=>{if(next>=pts.length)return;const [wx,wy]=s2w(cx,cy);const p=pts[next];if(Math.hypot(wx-p[0],wy-p[1])<70/CAM.z*1.6+30)reach(next,[wx,wy]);else if(down){const prev=pts[Math.max(0,next-1)];const t=clamp(((wx-prev[0])*(p[0]-prev[0])+(wy-prev[1])*(p[1]-prev[1]))/((p[0]-prev[0])**2+(p[1]-prev[1])**2||1),0,1);onProg((next-1+t)/pts.length,[wx,wy])}};
    const mv=ev=>{if(down)near(ev.clientX,ev.clientY)},upf=()=>{down=false};
    dots.forEach((b,i)=>{b.addEventListener("pointerdown",ev=>{ev.preventDefault();hnd.remove();down=true;reach(i)});b.addEventListener("keydown",ev=>{if(ev.key==="Enter"||ev.key===" "){ev.preventDefault();reach(i)}})});
    window.addEventListener("pointermove",mv);window.addEventListener("pointerup",upf);
    const cleanup=()=>{dots.forEach(d=>d.remove());hnd.remove();window.removeEventListener("pointermove",mv);window.removeEventListener("pointerup",upf)};
  }).then(chk(my));
}

/* ---------------- photos ---------------- */
const PHOTOS={};
function photoSVG(){
  const z=CAM.z,w=1600/z,h=900/z,x=CAM.cx-w/2,y=CAM.cy-h/2,vb=`${x.toFixed(1)} ${y.toFixed(1)} ${w.toFixed(1)} ${h.toFixed(1)}`;
  const tintOn=$("#tint").classList.contains("on");
  const inner=farSvg.innerHTML+midSvg.innerHTML.replace(/<defs>[\s\S]*?<\/defs>/,"").replace(/\sid="e_/g,' data-e="')+(tintOn?`<rect x="0" y="0" width="1600" height="900" fill="#B05A8A" opacity=".18"/>`:"");
  return{vb,inner,svg:`<svg viewBox="${vb}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`};
}
async function capture(n,pre){
  SFX.shutter();flashFx();const ph=pre||photoSVG();PHOTOS[n]=ph;
  const r=stage.getBoundingClientRect(),f=$(`.frame[data-k="${n}"]`).getBoundingClientRect();
  const fl=document.createElement("div");fl.className="fly";fl.innerHTML=ph.svg;Object.assign(fl.style,{left:r.left+"px",top:r.top+"px",width:r.width+"px",height:r.height+"px"});document.body.appendChild(fl);
  await wait(250);
  fl.style.transition=`transform ${Math.round(900/SPEED)}ms cubic-bezier(.65,0,.35,1)`;fl.style.transform=`translate(${f.left-r.left}px,${f.top-r.top}px) scale(${f.width/r.width})`;
  await wait(950);fl.remove();renderStrip();const fr=$(`.frame[data-k="${n}"]`);fr.classList.add("pop");setTimeout(()=>fr.classList.remove("pop"),700);
}

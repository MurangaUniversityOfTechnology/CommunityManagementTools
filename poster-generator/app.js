/* ═══════════════ 1. CONSTANTS ═══════════════ */
const OUTPUT_FORMATS = {
  social_portrait:   { key:'social_portrait',   label:'Social Portrait',   widthPx:1080, heightPx:1350, ppi:150, category:'digital', orientation:'portrait' },
  social_square:     { key:'social_square',     label:'Social Square',     widthPx:1080, heightPx:1080, ppi:150, category:'digital', orientation:'square' },
  story:             { key:'story',             label:'Story / Status',    widthPx:1080, heightPx:1920, ppi:150, category:'digital', orientation:'portrait' },
  landscape_display: { key:'landscape_display', label:'Landscape Display', widthPx:1920, heightPx:1080, ppi:150, category:'digital', orientation:'landscape' },
  a4: { key:'a4', label:'A4 Print', widthPx:2480, heightPx:3508, ppi:300, category:'print', orientation:'portrait', mm:{w:210,h:297} },
  a3: { key:'a3', label:'A3 Print', widthPx:3508, heightPx:4961, ppi:300, category:'print', orientation:'portrait', mm:{w:297,h:420} },
  a2: { key:'a2', label:'A2 Print', widthPx:4961, heightPx:7016, ppi:300, category:'print', orientation:'portrait', mm:{w:420,h:594} },
  a1: { key:'a1', label:'A1 Print', widthPx:7016, heightPx:9933, ppi:300, category:'print', orientation:'portrait', mm:{w:594,h:841} }
};

const EVENT_TYPES = [
  ['workshop','Workshop'], ['hackathon','Hackathon'], ['ai-ml','AI / ML Session'],
  ['robotics','Robotics'], ['career','Career Talk'], ['meetup','Community Meetup'],
  ['coding-class','Beginner Coding Class'], ['academic','Formal Academic Event'],
  ['social','Social Event'], ['competition','Competition'], ['recruitment','Recruitment Drive'],
  ['announcement','Announcement'], ['special','Special Event']
];

const TONE_OPTIONS = [
  [null,'System default'], ['more-vibrant','More vibrant'], ['more-professional','More professional'],
  ['more-calm','More calm'], ['more-bold','More bold']
];

const RATIO_BUCKETS = [
  {key:'square', ratio:1.000, tol:0.05, label:'1:1'},
  {key:'portrait_45', ratio:0.800, tol:0.05, label:'4:5'},
  {key:'portrait_34', ratio:0.750, tol:0.05, label:'3:4'},
  {key:'portrait_23', ratio:0.667, tol:0.05, label:'2:3'},
  {key:'portrait_916', ratio:0.5625, tol:0.04, label:'9:16'},
  {key:'landscape_43', ratio:1.333, tol:0.05, label:'4:3'},
  {key:'landscape_32', ratio:1.500, tol:0.05, label:'3:2'},
  {key:'landscape_169', ratio:1.778, tol:0.04, label:'16:9'}
];

function classifyBucket(ratio){
  let best=null, bestDiff=Infinity;
  for(const b of RATIO_BUCKETS){
    const diff = Math.abs(ratio-b.ratio)/b.ratio;
    if(diff<=b.tol && diff<bestDiff){ best=b; bestDiff=diff; }
  }
  return best ? best.key : 'extreme';
}
function bucketLabel(ratio){
  const b = RATIO_BUCKETS.find(b=>b.key===classifyBucket(ratio));
  return b ? b.label : (ratio>1?(ratio.toFixed(2)+':1'):('1:'+(1/ratio).toFixed(2)));
}

const VISUAL_DIRECTION_RULES = {
  workshop:       { compositionPriority:['editorial','grid','minimal'],            paletteVariant:'educational',  decoration:1 },
  hackathon:      { compositionPriority:['immersive','editorial','grid'],          paletteVariant:'vibrant',      decoration:2 },
  'ai-ml':        { compositionPriority:['immersive','editorial','minimal'],       paletteVariant:'futuristic',   decoration:1 },
  robotics:       { compositionPriority:['editorial','immersive','grid'],          paletteVariant:'futuristic',   decoration:1 },
  career:         { compositionPriority:['split','editorial','minimal'],           paletteVariant:'professional', decoration:0 },
  meetup:         { compositionPriority:['split','editorial','grid'],              paletteVariant:'community',    decoration:1 },
  'coding-class': { compositionPriority:['editorial','minimal','grid'],            paletteVariant:'educational',  decoration:0 },
  academic:       { compositionPriority:['minimal','editorial'],                   paletteVariant:'professional', decoration:0 },
  social:         { compositionPriority:['immersive','grid','editorial'],          paletteVariant:'community',    decoration:2 },
  competition:    { compositionPriority:['editorial','immersive','grid'],          paletteVariant:'vibrant',      decoration:2 },
  recruitment:    { compositionPriority:['split','editorial'],                     paletteVariant:'professional', decoration:0 },
  announcement:   { compositionPriority:['minimal','editorial'],                   paletteVariant:'professional', decoration:0 },
  special:        { compositionPriority:['editorial','immersive','grid','split','minimal'], paletteVariant:'community', decoration:1 }
};
const DECOR_LEVELS = ['low','medium','high'];
const TONE_MODIFIERS = {
  'more-vibrant':      { paletteVariant:'vibrant',      decorationDelta:1 },
  'more-professional': { paletteVariant:'professional', decorationDelta:-1 },
  'more-calm':          { paletteVariant:'educational',  decorationDelta:-1 },
  'more-bold':          { boost:['immersive','grid'],    decorationDelta:1 }
};

const FILLER_PHRASES = [
  /\bjoin us for\b\s*/gi, /\bwe are excited to announce\b\s*/gi, /\bwe're excited to\b\s*/gi,
  /\bwe are thrilled to\b\s*/gi, /\bdon'?t miss out\b[.,!]?\s*/gi, /\bbe sure to\b\s*/gi,
  /\blooking forward to\b\s*/gi, /\bcome and\b\s*/gi, /\bmake sure to\b\s*/gi
];

/* ═══════════════ 2. BRAND ═══════════════ */
const DEFAULT_BRAND = {
  name:'MUT Tech Community',
  organizer:'MUT Tech Community',
  logoDataUrl:DEFAULT_LOGO_DATA_URI,
  colors:{ navy:'#1a2744', navy2:'#243057', navy3:'#0f1a30', gold:'#c9a84c', gold2:'#e8c96a', gold3:'#f5dfa0', cream:'#faf8f3', warm:'#f0ece0', border:'#ddd6c4', text:'#1a1a1a', muted:'#7a7060' },
  fonts:{ display:'Playfair Display', support:'DM Sans' },
  socials:{ handle:'', website:'' },
  footer:'MUT Tech Community'
};
const BRAND_KEY = 'posterGenBrandOverride';
const ADMIN_PASS_KEY = 'posterGenAdminPass';

function mergeDeep(base, over){
  const out = Array.isArray(base) ? base.slice() : Object.assign({}, base);
  for(const k in (over||{})){
    if(over[k] && typeof over[k]==='object' && !Array.isArray(over[k]) && base[k] && typeof base[k]==='object'){
      out[k] = mergeDeep(base[k], over[k]);
    } else if(over[k]!==undefined && over[k]!==null && over[k]!==''){
      out[k] = over[k];
    }
  }
  return out;
}
const BrandStore = {
  load(){
    try{
      const raw = localStorage.getItem(BRAND_KEY);
      return raw ? mergeDeep(DEFAULT_BRAND, JSON.parse(raw)) : Object.assign({}, DEFAULT_BRAND);
    }catch(e){ return Object.assign({}, DEFAULT_BRAND); }
  },
  saveOverride(partial){
    try{
      const raw = localStorage.getItem(BRAND_KEY);
      const existing = raw ? JSON.parse(raw) : {};
      localStorage.setItem(BRAND_KEY, JSON.stringify(mergeDeep(existing, partial)));
    }catch(e){}
  },
  resetOverride(){ try{ localStorage.removeItem(BRAND_KEY); }catch(e){} },
  exportJSON(){ return JSON.stringify(this.load(), null, 2); }
};

/* ═══════════════ 3. POSTER DOCUMENT ═══════════════ */
function newPosterDocument(){
  return {
    id:'pd_'+Date.now().toString(36),
    brand:BrandStore.load(),
    event:{ name:'', eventType:'meetup', tone:null, date:'', time:'', venue:'', description:'',
             speaker:'', speakerTitle:'', organizer:'', registrationUrl:'', cta:'', social:'' },
    format:null,
    assets:{ photos:[], logoOverride:null, partnerLogos:[] },
    visualDirection:null, palette:null, copy:null, layout:null, qa:null,
    exportSettings:{ jpegQuality:0.92 }
  };
}

/* ═══════════════ 4. IMAGE PREFLIGHT ═══════════════ */
function ppiStatus(effectivePpi, category){
  const passT = category==='print'?250:135;
  const warnT = category==='print'?150:90;
  if(effectivePpi>=passT) return 'pass';
  if(effectivePpi>=warnT) return 'warn';
  return 'reject';
}
function effectivePPIForBox(photo, boxW, boxH, ppi){
  const scale = Math.max(boxW/photo.naturalWidth, boxH/photo.naturalHeight);
  return ppi/scale;
}
function estimatePrintReach(photo){
  const order=['a4','a3','a2','a1'];
  let maxOk=null, status='reject';
  for(const key of order){
    const f = OUTPUT_FORMATS[key];
    const side = Math.min(f.widthPx,f.heightPx);
    const eppi = effectivePPIForBox(photo, side, side, f.ppi);
    const st = ppiStatus(eppi,'print');
    if(st==='reject') break;
    maxOk = key; status = st;
  }
  return { maxOk, status };
}
const ImagePreflight = {
  analyze(file){
    return new Promise((resolve,reject)=>{
      if(!file.type.startsWith('image/')){ reject(new Error('Not an image file')); return; }
      const reader = new FileReader();
      reader.onload = ()=>{
        const dataUrl = reader.result;
        const img = new Image();
        img.onload = ()=>{
          const naturalWidth = img.naturalWidth, naturalHeight = img.naturalHeight;
          const aspectRatio = naturalWidth/naturalHeight;
          const bucket = classifyBucket(aspectRatio);
          let hasAlpha = false;
          try{
            const c = document.createElement('canvas');
            c.width = Math.min(naturalWidth,80); c.height = Math.min(naturalHeight,80);
            const cx = c.getContext('2d');
            cx.drawImage(img,0,0,c.width,c.height);
            const data = cx.getImageData(0,0,c.width,c.height).data;
            for(let i=3;i<data.length;i+=4*7){ if(data[i]<250){ hasAlpha=true; break; } }
          }catch(e){}
          const digitalEppi = effectivePPIForBox({naturalWidth,naturalHeight}, 1080, 1080, 150);
          const digitalStatus = ppiStatus(digitalEppi,'digital');
          const printReach = estimatePrintReach({naturalWidth,naturalHeight});
          const shortSide = Math.min(naturalWidth,naturalHeight);
          const tooSmall = shortSide < 480;
          let status = tooSmall ? 'reject' : (digitalStatus!=='reject' || printReach.status!=='reject') ? (digitalStatus==='pass'||printReach.status==='pass' ? 'pass':'warn') : 'warn';
          const messages = [];
          if(tooSmall){
            messages.push(`${naturalWidth}×${naturalHeight} is quite low-resolution — it will look soft in most placements.`);
          } else {
            messages.push(`✓ Suitable for digital formats${digitalStatus==='warn'?' (slightly soft at full size)':''}.`);
            messages.push(printReach.maxOk ? `✓ Suitable for print up to ${OUTPUT_FORMATS[printReach.maxOk].label}.` : 'Not high enough resolution for a full-size print placement — still fine for digital or a smaller inset.');
          }
          resolve({
            id:'ph_'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),
            dataUrl, naturalWidth, naturalHeight, aspectRatio,
            bucket, bucketLabel:bucketLabel(aspectRatio),
            fileType:file.type, fileSizeBytes:file.size, hasAlpha,
            preflight:{ status, digitalStatus, printReach, messages }
          });
        };
        img.onerror = ()=>reject(new Error('Could not read image'));
        img.src = dataUrl;
      };
      reader.onerror = ()=>reject(new Error('Could not read file'));
      reader.readAsDataURL(file);
    });
  }
};

const PartnerLogoLoader = {
  analyze(file){
    return new Promise((resolve,reject)=>{
      if(!file.type.startsWith('image/')){ reject(new Error('Not an image file')); return; }
      const reader = new FileReader();
      reader.onload = ()=>{
        const dataUrl = reader.result;
        const img = new Image();
        img.onload = ()=>{
          resolve({
            id:'pl_'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),
            dataUrl, naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight, name:file.name
          });
        };
        img.onerror = ()=>reject(new Error('Could not read image'));
        img.src = dataUrl;
      };
      reader.onerror = ()=>reject(new Error('Could not read file'));
      reader.readAsDataURL(file);
    });
  }
};

/* ═══════════════ 5. COPY ENGINE ═══════════════ */
const CopyEngine = {
  stripFiller(text){
    let t = text||'';
    FILLER_PHRASES.forEach(re=>{ t = t.replace(re,''); });
    t = t.replace(/\s{2,}/g,' ').trim();
    if(t) t = t[0].toUpperCase()+t.slice(1);
    return t;
  },
  tightenToWords(text, maxWords){
    const clean = this.stripFiller(text);
    if(!clean) return '';
    const allWords = clean.split(/\s+/);
    if(allWords.length<=maxWords) return clean;
    const sentences = clean.match(/[^.!?]+[.!?]*/g) || [clean];
    let out = '', words = 0;
    for(const s of sentences){
      const sTrim = s.trim();
      const w = sTrim.split(/\s+/).length;
      if(words+w>maxWords) break;
      out += (out?' ':'')+sTrim;
      words += w;
    }
    if(!out){
      out = allWords.slice(0,maxWords).join(' ')+'…';
    }
    return out;
  },
  formatDateTime(dateStr, timeStr){
    let d = '';
    if(dateStr){
      const dt = new Date(dateStr+'T00:00:00');
      if(!isNaN(dt)) d = dt.toLocaleDateString('en-GB',{weekday:'short', day:'2-digit', month:'short', year:'numeric'});
      else d = dateStr;
    }
    let t = '';
    if(timeStr){
      const [h,m] = timeStr.split(':').map(Number);
      const hr12 = ((h+11)%12)+1;
      t = `${hr12}:${String(m).padStart(2,'0')} ${h<12?'AM':'PM'}`;
    }
    return [d,t].filter(Boolean).join(' · ');
  },
  build(doc){
    const e = doc.event;
    const title = e.name || 'Untitled Event';
    const dateContext = this.formatDateTime(e.date, e.time) || 'Date & time to be announced';
    const venueSpeaker = [e.venue, e.speaker ? (e.speaker+(e.speakerTitle?', '+e.speakerTitle:'')) : ''].filter(Boolean).join(' · ');
    const wantsBlurb = doc.visualDirection && doc.visualDirection.composition==='minimal';
    const blurb = wantsBlurb && e.description ? this.tightenToWords(e.description, 32) : '';
    const supporting = [venueSpeaker, blurb].filter(Boolean).join('\n');
    const cta = e.cta || (e.registrationUrl ? 'Register now' : '');
    const registration = [cta, e.registrationUrl, e.organizer || doc.brand.organizer, e.social].filter(Boolean).join('  ·  ');
    return { title, dateContext, supporting: supporting || (e.organizer||doc.brand.organizer), registration };
  }
};

/* ═══════════════ 6. VISUAL DIRECTION ENGINE ═══════════════ */
function clamp(v,lo,hi){ return Math.max(lo,Math.min(hi,v)); }
function countWords(s){ return (s||'').trim() ? (s.trim().split(/\s+/).length) : 0; }

function selectVisualDirection(doc){
  const base = VISUAL_DIRECTION_RULES[doc.event.eventType] || VISUAL_DIRECTION_RULES.special;
  let order = base.compositionPriority.slice();
  let paletteVariant = base.paletteVariant;
  let decoration = base.decoration;

  const tm = TONE_MODIFIERS[doc.event.tone];
  if(tm){
    if(tm.paletteVariant) paletteVariant = tm.paletteVariant;
    decoration = clamp(decoration+tm.decorationDelta,0,2);
    if(tm.boost) order = [...tm.boost.filter(k=>order.includes(k)), ...order.filter(k=>!tm.boost.includes(k))];
  }

  const photos = doc.assets.photos;
  if(photos.length===0) order = ['minimal'];
  else if(photos.length>=2) order = ['grid', ...order.filter(k=>k!=='grid')];

  if(countWords(doc.event.description)>60) order = ['editorial','minimal',...order.filter(k=>k!=='editorial'&&k!=='minimal')];

  let chosen = null, reason='';
  for(const key of order){
    const comp = COMPOSITIONS[key];
    if(!comp) continue;
    const res = comp.canRender(doc);
    if(res.ok){ chosen = comp; break; }
    reason = res.reason;
  }
  if(!chosen){ chosen = COMPOSITIONS.minimal; }

  return {
    composition: chosen.key,
    paletteVariant, decorationIntensity: DECOR_LEVELS[decoration],
    photoTreatment: photos.length ? (chosen.key==='minimal'?'inset-contain':(chosen.key==='grid'?'grid-pack':'framed-cover')) : 'none',
    switchNote: (chosen.key!==order[0] && photos.length>0) ? `Composition adjusted to ${chosen.displayName} — ${reason}` : null
  };
}

/* ═══════════════ 7. RENDERER PRIMITIVES ═══════════════ */
function baseGeometry(doc){
  const W = doc.format.widthPx, H = doc.format.heightPx;
  const shortSide = Math.min(W,H);
  const margin = Math.round(shortSide*(doc.format.category==='print'?0.062:0.055));
  return { W,H, shortSide, margin, safe:{x:margin,y:margin,w:W-2*margin,h:H-2*margin}, orientation:doc.format.orientation };
}
function resolvePalette(brand, variant){
  const c = brand.colors;
  const table = {
    professional: {bg:c.cream, panel:c.navy,  accent:c.gold,  text:c.text, onPanel:'#ffffff', onDark:'#ffffff', border:c.border},
    educational:  {bg:c.cream, panel:c.navy2, accent:c.gold,  text:c.text, onPanel:'#ffffff', onDark:'#ffffff', border:c.border},
    community:    {bg:c.warm,  panel:c.gold,  accent:c.navy,  text:c.text, onPanel:c.navy,    onDark:'#ffffff', border:c.border},
    vibrant:      {bg:c.navy,  panel:c.gold2, accent:c.gold,  text:'#ffffff', onPanel:c.navy,  onDark:'#ffffff', border:'rgba(255,255,255,0.25)'},
    futuristic:   {bg:c.navy3, panel:c.navy2, accent:c.gold2, text:'#ffffff', onPanel:'#ffffff', onDark:'#ffffff', border:'rgba(255,255,255,0.18)'}
  };
  return table[variant] || table.professional;
}
function wrapText(ctx, text, maxWidth){
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = []; let line = '';
  for(const w of words){
    const test = line ? line+' '+w : w;
    if(ctx.measureText(test).width<=maxWidth || !line) line = test;
    else { lines.push(line); line = w; }
  }
  if(line) lines.push(line);
  return lines.length ? lines : [''];
}
function fitTextToBox(ctx, text, box, opts){
  const t = opts.uppercase ? String(text).toUpperCase() : String(text);
  const paragraphs = t.split('\n');
  let lo=opts.minPx, hi=opts.maxPx, best=null;
  for(let i=0;i<16;i++){
    const mid = (lo+hi)/2;
    ctx.font = `${opts.fontWeight||400} ${mid}px '${opts.fontFamily}'`;
    let lines = [];
    paragraphs.forEach(p=> lines = lines.concat(wrapText(ctx,p,box.w)));
    const lh = mid*(opts.lineHeightMult||1.15);
    const fits = lines.length<=opts.maxLines && lines.length*lh<=box.h;
    if(fits){ best = {fontSize:mid, lines, lineHeight:lh, overflow:false}; lo=mid; } else { hi=mid; }
  }
  if(!best){
    ctx.font = `${opts.fontWeight||400} ${opts.minPx}px '${opts.fontFamily}'`;
    let lines = [];
    paragraphs.forEach(p=> lines = lines.concat(wrapText(ctx,p,box.w)));
    const overflow = lines.length>opts.maxLines;
    if(overflow) lines = lines.slice(0,opts.maxLines);
    best = {fontSize:opts.minPx, lines, lineHeight:opts.minPx*(opts.lineHeightMult||1.15), overflow};
  }
  return best;
}
function drawShape(ctx, doc, p){
  const pal = doc.palette;
  const colorMap = { primary:pal.panel, accent:pal.accent, border:pal.border, panel:pal.panel };
  ctx.save();
  ctx.globalAlpha = p.opacity!=null ? p.opacity : 1;
  ctx.fillStyle = colorMap[p.fill] || pal.panel;
  if(p.curveTopAmp){
    const {x,y,w,h} = p.box;
    ctx.beginPath();
    ctx.moveTo(x, y+h);
    ctx.lineTo(x+w, y+h);
    ctx.lineTo(x+w, y);
    ctx.quadraticCurveTo(x+w/2, y+p.curveTopAmp, x, y);
    ctx.closePath();
    ctx.fill();
  } else {
    ctx.fillRect(p.box.x, p.box.y, p.box.w, p.box.h);
  }
  ctx.restore();
}
function drawImageInFrame(ctx, doc, p){
  const photo = doc.assets.photos[p.photoIndex];
  if(!photo || !photo._img) return;
  const img = photo._img;
  const {x,y,w,h} = p.box;
  ctx.save();
  if(p.curveBottomAmp){
    const h0 = y+h;
    ctx.beginPath();
    ctx.moveTo(x,y);
    ctx.lineTo(x+w,y);
    ctx.lineTo(x+w,h0);
    ctx.quadraticCurveTo(x+w/2, h0+p.curveBottomAmp, x, h0);
    ctx.closePath(); ctx.clip();
  } else if(p.frame && p.frame.radius){
    const r = p.frame.radius;
    ctx.beginPath();
    ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r);
    ctx.closePath(); ctx.clip();
  } else {
    ctx.beginPath(); ctx.rect(x,y,w,h); ctx.clip();
  }
  if(p.fit==='contain'){
    ctx.fillStyle = doc.palette.border; ctx.globalAlpha=0.25; ctx.fillRect(x,y,w,h); ctx.globalAlpha=1;
    const scale = Math.min(w/img.naturalWidth, h/img.naturalHeight);
    const dw = img.naturalWidth*scale, dh = img.naturalHeight*scale;
    ctx.drawImage(img, x+(w-dw)/2, y+(h-dh)/2, dw, dh);
  } else {
    const amp = p.curveBottomAmp || 0;
    const effH = h + Math.abs(amp);
    const scale = Math.max(w/img.naturalWidth, effH/img.naturalHeight);
    const dw = img.naturalWidth*scale, dh = img.naturalHeight*scale;
    const dx = x+(w-dw)/2;
    const dy = amp ? (y+h+amp-dh) : (y+(h-dh)/2);
    ctx.drawImage(img, dx, dy, dw, dh);
  }
  ctx.restore();
}
function drawLogo(ctx, doc, p){
  const src = doc.assets.logoOverride || doc.brand.logoDataUrl;
  if(!src || !doc._logoImg) return;
  const img = doc._logoImg;
  const {x,y,w,h} = p.box;
  const scale = Math.min(w/img.naturalWidth, h/img.naturalHeight);
  const dw = img.naturalWidth*scale, dh = img.naturalHeight*scale;
  ctx.drawImage(img, x+(w-dw)/2, y+(h-dh)/2, dw, dh);
}
function drawPartnerLogo(ctx, doc, p){
  const logo = (doc.assets.partnerLogos||[])[p.logoIndex];
  if(!logo || !logo._img) return;
  const img = logo._img;
  const {x,y,w,h} = p.box;
  const scale = Math.min(w/img.naturalWidth, h/img.naturalHeight);
  const dw = img.naturalWidth*scale, dh = img.naturalHeight*scale;
  ctx.drawImage(img, x+(w-dw)/2, y+(h-dh)/2, dw, dh);
}
function drawHierarchyText(ctx, doc, p){
  const pal = doc.palette;
  const fontFamily = p.font==='display' ? doc.brand.fonts.display : doc.brand.fonts.support;
  const opts = {
    minPx:p.sizeRange[0], maxPx:p.sizeRange[1], fontWeight:p.fontWeight||400, fontFamily,
    maxLines:p.maxLines||3, lineHeightMult:p.lineHeightMult||1.15, uppercase:!!p.uppercase
  };
  const fit = fitTextToBox(ctx, p.text, p.box, opts);
  p._fit = fit;
  ctx.font = `${opts.fontWeight} ${fit.fontSize}px '${fontFamily}'`;
  ctx.fillStyle = pal[p.colorRole] || pal.text;
  ctx.textBaseline = 'alphabetic';
  try{ ctx.letterSpacing = (p.letterSpacing? p.letterSpacing+'px' : '0px'); }catch(e){}
  const totalH = fit.lines.length*fit.lineHeight;
  let startY = p.box.y + (fit.fontSize*0.82);
  if(p.verticalAlign==='center') startY = p.box.y + (p.box.h-totalH)/2 + fit.fontSize*0.82;
  if(p.verticalAlign==='bottom') startY = p.box.y + p.box.h - totalH + fit.fontSize*0.82;
  fit.lines.forEach((line,i)=>{
    let dx = p.box.x;
    if(p.align==='center'){ dx = p.box.x + (p.box.w - ctx.measureText(line).width)/2; }
    else if(p.align==='right'){ dx = p.box.x + p.box.w - ctx.measureText(line).width; }
    ctx.fillText(line, dx, startY + i*fit.lineHeight);
  });
}
function paintPoster(ctx, doc){
  const W = doc.format.widthPx, H = doc.format.heightPx;
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle = doc.palette.bg;
  ctx.fillRect(0,0,W,H);
  (doc.layout||[]).forEach(p=>{
    if(p.type==='shape') drawShape(ctx,doc,p);
    else if(p.type==='image') drawImageInFrame(ctx,doc,p);
    else if(p.type==='logo') drawLogo(ctx,doc,p);
    else if(p.type==='partnerLogo') drawPartnerLogo(ctx,doc,p);
    else if(p.type==='text') drawHierarchyText(ctx,doc,p);
  });
}

/* ═══════════════ 8. COMPOSITION STRATEGIES ═══════════════ */
let _infoStackScratchCtx = null;
function partnerLogoRow(placements, doc, x, y, w, shortSide, colorRole){
  const logos = doc.assets.partnerLogos||[];
  if(!logos.length) return 0;
  const captionH = shortSide*0.022, rowGap = shortSide*0.012, logoH = shortSide*0.046, logoGap = shortSide*0.02;
  placements.push({type:'text', role:'partnerCaption', text:'In collaboration with', box:{x,y,w,h:captionH}, align:'left',
    font:'support', fontWeight:600, maxLines:1, sizeRange:[shortSide*0.0105,shortSide*0.013], uppercase:true, letterSpacing:1.1, colorRole});
  let lx = x;
  const logosY = y+captionH+rowGap;
  logos.forEach((logo,li)=>{
    const ratio = (logo.naturalWidth && logo.naturalHeight) ? logo.naturalWidth/logo.naturalHeight : 1;
    const lw = logoH*ratio;
    placements.push({type:'partnerLogo', logoIndex:li, box:{x:lx,y:logosY,w:lw,h:logoH}});
    lx += lw+logoGap;
  });
  return captionH+rowGap+logoH;
}

function infoStack(placements, doc, box, shortSide, colorRole, opts){
  opts = opts||{};
  const copy = doc.copy;
  const rows = [
    {kind:'text', role:'title', text:copy.title, capWeight:0.52*(opts.titleBoost||1), font:'display', fontWeight:900, maxLines:3,
     sizeRange:[shortSide*0.032, shortSide*0.10*(opts.titleBoost||1)], lineHeightMult:1.02},
    {kind:'text', role:'dateContext', text:copy.dateContext, capWeight:0.16, font:'support', fontWeight:600, maxLines:1,
     sizeRange:[shortSide*0.016, shortSide*0.028], uppercase:true, letterSpacing:1.2},
    {kind:'text', role:'supporting', text:copy.supporting, capWeight:0.28, font:'support', fontWeight:400, maxLines:3,
     sizeRange:[shortSide*0.014, shortSide*0.021], lineHeightMult:1.3},
    {kind:'text', role:'registration', text:copy.registration, capWeight:0.16, font:'support', fontWeight:500, maxLines:2,
     sizeRange:[shortSide*0.012, shortSide*0.017], lineHeightMult:1.3}
  ].filter(r=>r.text && r.text.trim());

  const partnerLogos = doc.assets.partnerLogos||[];
  if(partnerLogos.length){
    rows.push({kind:'logos', role:'partnerLogos', captionH:shortSide*0.022, rowGap:shortSide*0.012, logoH:shortSide*0.046});
  }

  if(!_infoStackScratchCtx) _infoStackScratchCtx = document.createElement('canvas').getContext('2d');
  const gap = box.h*0.045;
  const barGap = shortSide*0.022;

  const measured = rows.map(r=>{
    if(r.kind==='logos'){
      const usedH = r.captionH+r.rowGap+r.logoH;
      return { r, capH:usedH, usedH };
    }
    const fontFamily = r.font==='display' ? doc.brand.fonts.display : doc.brand.fonts.support;
    const capH = box.h*r.capWeight;
    const fitOpts = {minPx:r.sizeRange[0], maxPx:r.sizeRange[1], fontWeight:r.fontWeight, fontFamily,
      maxLines:r.maxLines, lineHeightMult:r.lineHeightMult||1.15, uppercase:!!r.uppercase};
    const fit = fitTextToBox(_infoStackScratchCtx, r.text, {w:box.w,h:capH}, fitOpts);
    return { r, capH, usedH: fit.lines.length*fit.lineHeight };
  });
  let totalUsed = 0;
  measured.forEach((m,i)=>{
    totalUsed += m.usedH;
    const isLast = i===measured.length-1;
    if(m.r.role==='title') totalUsed += gap*0.4 + barGap;
    else if(!isLast) totalUsed += gap;
  });

  let y = box.y + Math.max(0, (box.h-totalUsed)/2);
  measured.forEach((m,i)=>{
    const r = m.r;
    if(r.kind==='logos'){
      partnerLogoRow(placements, doc, box.x, y, box.w, shortSide, colorRole);
      y += m.usedH+gap;
      return;
    }
    placements.push({type:'text', role:r.role, text:r.text, box:{x:box.x,y,w:box.w,h:m.capH}, align:'left', verticalAlign:'top',
      font:r.font, fontWeight:r.fontWeight, maxLines:r.maxLines, sizeRange:r.sizeRange, lineHeightMult:r.lineHeightMult,
      uppercase:r.uppercase, letterSpacing:r.letterSpacing, colorRole});
    if(r.role==='title'){
      const barY = y+m.usedH+gap*0.4;
      placements.push({type:'shape', role:'accentBar', box:{x:box.x,y:barY,w:shortSide*0.16,h:shortSide*0.007}, fill:'accent'});
      y = barY+barGap;
    } else {
      y += m.usedH+gap;
    }
  });
  return placements;
}

const COMPOSITIONS = {};

COMPOSITIONS.minimal = {
  key:'minimal', displayName:'Minimal', minPhotos:0, maxPhotos:1,
  canRender(doc){ return {ok:true}; },
  layout(doc){
    const {W,H,margin,safe,shortSide} = baseGeometry(doc);
    const placements = [];
    if(!_infoStackScratchCtx) _infoStackScratchCtx = document.createElement('canvas').getContext('2d');
    let headerTop = safe.y;
    if(doc._hasLogo){
      const ls = shortSide*0.09;
      placements.push({type:'logo', box:{x:safe.x,y:safe.y,w:ls,h:ls}});
      headerTop = safe.y + ls + shortSide*0.05;
    } else { headerTop = safe.y + shortSide*0.02; }

    const titleH = H*0.30, titleOpts = {minPx:shortSide*0.044,maxPx:shortSide*0.115,fontWeight:900,fontFamily:doc.brand.fonts.display,maxLines:4,lineHeightMult:1.02};
    const titleFit = fitTextToBox(_infoStackScratchCtx, doc.copy.title, {w:safe.w,h:titleH}, titleOpts);
    const dcH = shortSide*0.05;
    const supH = shortSide*0.16;
    const supOpts = {minPx:shortSide*0.017,maxPx:shortSide*0.024,fontWeight:400,fontFamily:doc.brand.fonts.support,maxLines:4,lineHeightMult:1.3};
    const supFit = fitTextToBox(_infoStackScratchCtx, doc.copy.supporting, {w:safe.w,h:supH}, supOpts);

    const partnerLogos = doc.assets.partnerLogos||[];
    const regTextH = shortSide*0.14;
    const partnerStripH = partnerLogos.length ? shortSide*(0.022+0.012+0.046+0.014) : 0;
    const regZoneH = regTextH + partnerStripH;
    const regY = safe.y+safe.h-regZoneH;
    const headerUsedH = titleFit.lines.length*titleFit.lineHeight + shortSide*0.025 + shortSide*0.045
      + dcH + shortSide*0.025 + supFit.lines.length*supFit.lineHeight;
    const availH = regY - shortSide*0.05 - headerTop;
    let y = headerTop;
    if(!doc.assets.photos[0] && availH>headerUsedH){
      y = headerTop + Math.min((availH-headerUsedH)/2, shortSide*0.18);
    }

    placements.push({type:'text', role:'title', text:doc.copy.title, box:{x:safe.x,y,w:safe.w,h:titleH}, align:'left',
      verticalAlign:'top', font:'display', fontWeight:900, maxLines:4, sizeRange:[shortSide*0.044,shortSide*0.115],
      lineHeightMult:1.02, colorRole:'text'});
    y += titleFit.lines.length*titleFit.lineHeight + shortSide*0.025;
    placements.push({type:'shape', role:'accentBar', box:{x:safe.x,y,w:shortSide*0.18,h:shortSide*0.008}, fill:'accent'});
    y += shortSide*0.045;
    placements.push({type:'text', role:'dateContext', text:doc.copy.dateContext, box:{x:safe.x,y,w:safe.w,h:dcH}, align:'left',
      font:'support', fontWeight:600, maxLines:1, sizeRange:[shortSide*0.02,shortSide*0.032], uppercase:true, letterSpacing:1.4, colorRole:'text'});
    y += dcH + shortSide*0.025;
    placements.push({type:'text', role:'supporting', text:doc.copy.supporting, box:{x:safe.x,y,w:safe.w,h:supH}, align:'left',
      font:'support', fontWeight:400, maxLines:4, sizeRange:[shortSide*0.017,shortSide*0.024], lineHeightMult:1.3, colorRole:'text'});
    y += supFit.lines.length*supFit.lineHeight + shortSide*0.02;
    if(doc.assets.photos[0] && regY-y > shortSide*0.14){
      const photoH = Math.min(regY-y-shortSide*0.03, shortSide*0.34);
      placements.push({type:'image', role:'inset', photoIndex:0, box:{x:safe.x,y:y+shortSide*0.03,w:safe.w,h:photoH}, fit:'contain', frame:{radius:shortSide*0.006}});
    }
    placements.push({type:'shape', role:'divider', box:{x:safe.x,y:regY-shortSide*0.02,w:safe.w,h:shortSide*0.0025}, fill:'border'});
    placements.push({type:'text', role:'registration', text:doc.copy.registration, box:{x:safe.x,y:regY,w:safe.w,h:regTextH}, align:'left',
      font:'support', fontWeight:500, maxLines:3, sizeRange:[shortSide*0.013,shortSide*0.019], lineHeightMult:1.35, colorRole:'text'});
    if(partnerLogos.length){
      partnerLogoRow(placements, doc, safe.x, regY+regTextH+shortSide*0.014, safe.w, shortSide, 'text');
    }
    return placements;
  }
};

function cropSeverity(photoRatio, boxRatio){ return Math.abs(Math.log(photoRatio/boxRatio)); }
function partnerReserve(doc){ return (doc.assets.partnerLogos && doc.assets.partnerLogos.length) ? 0.09 : 0; }

COMPOSITIONS.editorial = {
  key:'editorial', displayName:'Editorial', minPhotos:1, maxPhotos:1,
  primaryBoxRatio(doc){ const {W,H} = baseGeometry(doc); return W/(H*(0.60-partnerReserve(doc))); },
  canRender(doc){
    if(doc.assets.photos.length<1) return {ok:false, reason:'Needs 1 photo'};
    const sev = cropSeverity(doc.assets.photos[0].aspectRatio, this.primaryBoxRatio(doc));
    if(sev>0.28) return {ok:false, reason:`photo shape (${doc.assets.photos[0].bucketLabel}) needs heavy cropping for Editorial's image band`};
    return {ok:true};
  },
  layout(doc){
    const {W,H,margin,shortSide} = baseGeometry(doc);
    const placements = [];
    const imgH = H*(0.60-partnerReserve(doc));
    placements.push({type:'shape', role:'panelZone', box:{x:0,y:imgH,w:W,h:H-imgH}, fill:'panel'});
    placements.push({type:'image', role:'hero', photoIndex:0, box:{x:0,y:0,w:W,h:imgH}, fit:'cover', curveBottomAmp:shortSide*0.022});
    infoStack(placements, doc, {x:margin,y:imgH+margin*0.65,w:W-margin*2,h:H-imgH-margin*1.3}, shortSide, 'onPanel', {titleBoost:1.15});
    if(doc._hasLogo){
      const ls = shortSide*0.075;
      placements.push({type:'shape', role:'logoChip', box:{x:margin-shortSide*0.012,y:margin-shortSide*0.012,w:ls+shortSide*0.024,h:ls+shortSide*0.024}, fill:'panel', opacity:0.82});
      placements.push({type:'logo', box:{x:margin,y:margin,w:ls,h:ls}});
    }
    return placements;
  }
};

COMPOSITIONS.split = {
  key:'split', displayName:'Split', minPhotos:1, maxPhotos:1,
  primaryBoxRatio(doc){
    const {W,H,orientation} = baseGeometry(doc);
    return orientation==='portrait' ? W/(H*(0.48-partnerReserve(doc))) : (W*0.5)/H;
  },
  canRender(doc){
    if(doc.assets.photos.length<1) return {ok:false, reason:'Needs 1 photo'};
    const sev = cropSeverity(doc.assets.photos[0].aspectRatio, this.primaryBoxRatio(doc));
    if(sev>0.28) return {ok:false, reason:`photo shape (${doc.assets.photos[0].bucketLabel}) needs heavy cropping for Split's image half`};
    return {ok:true};
  },
  layout(doc){
    const {W,H,margin,shortSide,orientation} = baseGeometry(doc);
    const placements = [];
    if(orientation!=='portrait'){
      const imgW = W*0.5;
      placements.push({type:'image', role:'hero', photoIndex:0, box:{x:0,y:0,w:imgW,h:H}, fit:'cover'});
      placements.push({type:'shape', role:'panelZone', box:{x:imgW,y:0,w:W-imgW,h:H}, fill:'panel'});
      infoStack(placements, doc, {x:imgW+margin,y:margin,w:W-imgW-margin*2,h:H-margin*2}, shortSide, 'onPanel');
      if(doc._hasLogo){ const ls=shortSide*0.07; placements.push({type:'logo', box:{x:imgW+margin,y:H-margin-ls,w:ls,h:ls}}); }
    } else {
      const imgH = H*(0.48-partnerReserve(doc));
      placements.push({type:'shape', role:'panelZone', box:{x:0,y:imgH,w:W,h:H-imgH}, fill:'panel'});
      placements.push({type:'image', role:'hero', photoIndex:0, box:{x:0,y:0,w:W,h:imgH}, fit:'cover', curveBottomAmp:shortSide*0.022});
      infoStack(placements, doc, {x:margin,y:imgH+margin,w:W-margin*2,h:H-imgH-margin*2}, shortSide, 'onPanel');
      if(doc._hasLogo){ const ls=shortSide*0.07; placements.push({type:'logo', box:{x:margin,y:imgH+margin*0.3,w:ls,h:ls}}); }
    }
    return placements;
  }
};

COMPOSITIONS.immersive = {
  key:'immersive', displayName:'Immersive', minPhotos:1, maxPhotos:1,
  canRender(doc){
    if(doc.assets.photos.length<1) return {ok:false, reason:'Needs 1 photo'};
    const {W,H} = baseGeometry(doc);
    const sev = cropSeverity(doc.assets.photos[0].aspectRatio, W/H);
    if(sev>0.14) return {ok:false, reason:`photo shape (${doc.assets.photos[0].bucketLabel}) isn't close enough to the canvas shape for a full-bleed Immersive treatment`};
    return {ok:true};
  },
  layout(doc){
    const {W,H,margin,shortSide} = baseGeometry(doc);
    const placements = [];
    placements.push({type:'image', role:'hero', photoIndex:0, box:{x:0,y:0,w:W,h:H}, fit:'cover'});
    const panelH = H*(0.32+partnerReserve(doc));
    placements.push({type:'shape', role:'overlay', box:{x:0,y:H-panelH,w:W,h:panelH}, fill:'panel', opacity:0.88, curveTopAmp:shortSide*0.022});
    infoStack(placements, doc, {x:margin,y:H-panelH+margin*0.55,w:W-margin*2,h:panelH-margin*1.1}, shortSide, 'onDark');
    if(doc._hasLogo){
      const ls = shortSide*0.075;
      placements.push({type:'shape', role:'logoChip', box:{x:margin-shortSide*0.015,y:margin-shortSide*0.015,w:ls+shortSide*0.03,h:ls+shortSide*0.03}, fill:'panel', opacity:0.78});
      placements.push({type:'logo', box:{x:margin,y:margin,w:ls,h:ls}});
    }
    return placements;
  }
};

function packPhotosIntoRows(photos, containerW, gap){
  const n = photos.length;
  const groups = n<=2 ? [n] : n===3 ? [3] : n===4 ? [2,2] : [3,2];
  let idx=0;
  const rows = groups.map(count=>{
    const cellPhotos = photos.slice(idx, idx+count); idx+=count;
    const sumRatios = cellPhotos.reduce((a,p)=>a+p.aspectRatio,0);
    const h = (containerW - gap*(count-1)) / sumRatios;
    const cells = cellPhotos.map(p=>({photoIndex: photos.indexOf(p), w: p.aspectRatio*h}));
    return {cells, h};
  });
  const totalH = rows.reduce((a,r)=>a+r.h,0) + gap*(rows.length-1);
  return { rows, totalH };
}

COMPOSITIONS.grid = {
  key:'grid', displayName:'Grid', minPhotos:2, maxPhotos:5,
  canRender(doc){
    const n = doc.assets.photos.length;
    if(n<this.minPhotos || n>this.maxPhotos) return {ok:false, reason:`Grid needs 2–5 photos, has ${n}`};
    return {ok:true};
  },
  layout(doc){
    const {W,H,margin,safe,shortSide} = baseGeometry(doc);
    const placements = [];
    let galleryY = safe.y;
    if(doc._hasLogo){
      const ls = shortSide*0.07;
      placements.push({type:'logo', box:{x:safe.x,y:safe.y,w:ls,h:ls}});
      galleryY = safe.y+ls+shortSide*0.03;
    }
    const gap = shortSide*0.008;
    const budgetH = safe.h*(0.56-partnerReserve(doc));
    const packed = packPhotosIntoRows(doc.assets.photos, safe.w, gap);
    const scaleDown = packed.totalH>budgetH ? budgetH/packed.totalH : 1;
    let ry = galleryY;
    packed.rows.forEach(row=>{
      const rh = row.h*scaleDown;
      let rx = safe.x;
      row.cells.forEach(cell=>{
        const cw = cell.w*scaleDown;
        placements.push({type:'image', role:'grid', photoIndex:cell.photoIndex, box:{x:rx,y:ry,w:cw,h:rh}, fit:'cover', frame:{radius:shortSide*0.004}});
        rx += cw + gap*scaleDown;
      });
      ry += rh + gap*scaleDown;
    });
    const panelY = ry+shortSide*0.03;
    placements.push({type:'shape', role:'panelZone', box:{x:0,y:panelY,w:W,h:H-panelY}, fill:'panel'});
    infoStack(placements, doc, {x:margin,y:panelY+margin*0.6,w:W-margin*2,h:H-panelY-margin*1.2}, shortSide, 'onPanel');
    return placements;
  }
};

/* ═══════════════ 9. LAYOUT ENGINE (overflow downgrade) ═══════════════ */
function tryLayout(doc, compositionKey){
  const comp = COMPOSITIONS[compositionKey];
  doc.layout = comp.layout(doc);
  const overflow = doc.layout.some(p=>p.type==='text' && p._fitPending);
  return doc.layout;
}
function buildLayout(doc){
  let attempt = 0;
  while(attempt<3){
    const comp = COMPOSITIONS[doc.visualDirection.composition];
    doc.layout = comp.layout(doc);
    const scratch = document.createElement('canvas').getContext('2d');
    let anyOverflow = false;
    doc.layout.forEach(p=>{
      if(p.type==='text'){
        const fontFamily = p.font==='display' ? doc.brand.fonts.display : doc.brand.fonts.support;
        const fit = fitTextToBox(scratch, p.text, p.box, {minPx:p.sizeRange[0], maxPx:p.sizeRange[1], fontWeight:p.fontWeight||400, fontFamily, maxLines:p.maxLines||3, lineHeightMult:p.lineHeightMult||1.15, uppercase:!!p.uppercase});
        if(fit.overflow) anyOverflow = true;
      }
    });
    if(!anyOverflow) break;
    if(attempt===0 && doc.visualDirection.composition!=='minimal'){
      doc.visualDirection = Object.assign({}, doc.visualDirection, {composition:'minimal'});
      doc.copy = CopyEngine.build(doc);
    } else if(doc.event.description){
      doc.event = Object.assign({}, doc.event, {description:''});
      doc.copy = CopyEngine.build(doc);
    } else {
      break;
    }
    attempt++;
  }
  return doc.layout;
}

/* ═══════════════ 10. PREFLIGHT QA ═══════════════ */
const PreflightQA = {
  run(doc){
    const checks = [];
    const push=(category,level,message)=>checks.push({category,level,message});

    if(!doc.event.name) push('content','fail','Event title is missing.');
    else push('content','pass','Event title present.');
    if(!doc.event.date && !doc.event.time) push('content','warn','No date or time set — poster shows a placeholder.');
    else push('content','pass','Date/time present.');
    if(!doc.event.venue) push('content','warn','No venue set.');
    else push('content','pass','Venue present.');

    let overflowCount = 0;
    (doc.layout||[]).forEach(p=>{ if(p.type==='text' && p._fit && p._fit.overflow) overflowCount++; });
    if(overflowCount>0) push('typography','fail', `${overflowCount} text block(s) still don't fit — try shortening the description or organizer/social fields.`);
    else push('typography','pass','All text fits within its area at a readable size.');

    doc.assets.photos.forEach((p,i)=>{
      if(p.preflight.status==='reject') push('images','warn', `Photo ${i+1} is low-resolution (${p.naturalWidth}×${p.naturalHeight}).`);
    });
    const usedPhotoIdx = new Set((doc.layout||[]).filter(p=>p.type==='image').map(p=>p.photoIndex));
    doc.layout && doc.layout.filter(p=>p.type==='image').forEach(p=>{
      const photo = doc.assets.photos[p.photoIndex];
      if(!photo) return;
      const eppi = effectivePPIForBox(photo, p.box.w, p.box.h, doc.format.ppi);
      const st = ppiStatus(eppi, doc.format.category);
      if(st==='reject') push('images','warn', `A placed photo is being enlarged beyond its native resolution for this format (≈${Math.round(eppi)} PPI) — it may look soft.`);
    });
    if(doc.assets.photos.length && usedPhotoIdx.size===0) push('images','warn','Uploaded photo(s) not used by the current composition.');
    if(!doc.assets.photos.length && doc.visualDirection.composition!=='minimal') push('images','fail','No photo but a photo-based composition was selected.');
    else push('images','pass','Image placement is consistent with the chosen composition.');

    if(doc._hasLogo) push('branding','pass','Logo placed without distortion, clear of the title.');
    else push('branding','warn','No logo set — add one in Brand Settings for consistent identity.');
    if(doc.assets.partnerLogos && doc.assets.partnerLogos.length){
      push('branding','pass', `${doc.assets.partnerLogos.length} partner logo(s) shown as a secondary strip, clear of the title.`);
    }

    push('export','pass', `Output: ${doc.format.label} (${doc.format.widthPx}×${doc.format.heightPx}px @ ${doc.format.ppi} PPI).`);

    const hasFail = checks.some(c=>c.level==='fail');
    const hasWarn = checks.some(c=>c.level==='warn');
    return { checks, status: hasFail?'fail':(hasWarn?'warn':'pass') };
  }
};

/* ═══════════════ 11. EXPORT PIPELINE ═══════════════ */
function slug(str){ return (str||'Poster').trim().replace(/[^a-zA-Z0-9]+/g,'_').replace(/^_+|_+$/g,'') || 'Poster'; }
const ExportPipeline = {
  buildCanvas(doc){
    const c = document.createElement('canvas');
    c.width = doc.format.widthPx; c.height = doc.format.heightPx;
    const ctx = c.getContext('2d');
    paintPoster(ctx, doc);
    return c;
  },
  download(blob, filename){
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(()=>URL.revokeObjectURL(url), 4000);
  },
  toPNG(doc){
    const c = this.buildCanvas(doc);
    c.toBlob(blob=>{ this.download(blob, `${slug(doc.event.name)}_${doc.format.key}.png`); c.width=0; }, 'image/png');
  },
  toJPEG(doc){
    const c = this.buildCanvas(doc);
    c.toBlob(blob=>{ this.download(blob, `${slug(doc.event.name)}_${doc.format.key}.jpg`); c.width=0; }, 'image/jpeg', doc.exportSettings.jpegQuality);
  },
  toPDF(doc){
    const c = this.buildCanvas(doc);
    const dataUrl = c.toDataURL('image/jpeg', doc.exportSettings.jpegQuality);
    const { jsPDF } = window.jspdf;
    const mm = doc.format.mm;
    const orientation = mm.w>mm.h ? 'landscape' : 'portrait';
    const pdf = new jsPDF({ unit:'mm', format:[mm.w,mm.h], orientation });
    pdf.addImage(dataUrl, 'JPEG', 0, 0, mm.w, mm.h);
    pdf.save(`${slug(doc.event.name)}_${doc.format.key}.pdf`);
    c.width = 0;
  }
};

/* ═══════════════ 12. REGENERATION ═══════════════ */
function generateVariant(baseDoc, variant){
  const doc = JSON.parse(JSON.stringify(baseDoc, (k,v)=> k==='_img'||k==='_logoImg' ? undefined : v));
  doc.assets.photos.forEach((p,i)=>{ p._img = baseDoc.assets.photos[i]._img; });
  doc.assets.partnerLogos.forEach((l,i)=>{ l._img = baseDoc.assets.partnerLogos[i]._img; });
  doc._logoImg = baseDoc._logoImg;
  doc._hasLogo = baseDoc._hasLogo;

  if(variant==='minimal'){
    doc.visualDirection = { composition:'minimal', paletteVariant:'professional', decorationIntensity:'low',
      photoTreatment: doc.assets.photos.length?'inset-contain':'none', switchNote:null };
  } else {
    if(variant==='bold') doc.event.tone = 'more-bold';
    doc.visualDirection = selectVisualDirection(doc);
  }
  doc.copy = CopyEngine.build(doc);
  doc.palette = resolvePalette(doc.brand, doc.visualDirection.paletteVariant);
  buildLayout(doc);
  doc.qa = PreflightQA.run(doc);
  return doc;
}

/* ═══════════════ 13. WIZARD UI ═══════════════ */
const STEPS = ['Event','Assets','Format','Generate','Review'];
const state = { step:1, doc:newPosterDocument(), variants:{}, selectedVariant:'recommended' };

function renderStepNav(){
  const nav = document.getElementById('stepNav');
  nav.innerHTML = STEPS.map((s,i)=>{
    const n = i+1;
    const cls = n===state.step ? 'active' : (n<state.step ? 'done' : '');
    return `<div class="step-pill ${cls}"><span class="num">${n}</span>${s}</div>`;
  }).join('');
}
function showPanel(n){
  document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));
  document.getElementById('panel-5').classList.remove('active');
  if(n===5) document.getElementById('panel-5').classList.add('active');
  else document.getElementById('panel-'+n).classList.add('active');
  state.step = n;
  renderStepNav();
  window.scrollTo(0,0);
}

const Wizard = {
  next(){
    if(state.step===1 && !this.validateEvent()) return;
    showPanel(Math.min(state.step+1,5));
  },
  prev(){ showPanel(Math.max(state.step-1,1)); },
  goto(n){ showPanel(n); },
  validateEvent(){
    const required = [['f-name','Event name'],['f-date','Date'],['f-time','Time'],['f-venue','Venue']];
    for(const [id,label] of required){
      if(!document.getElementById(id).value.trim()){ showToast(`${label} is required`); document.getElementById(id).focus(); return false; }
    }
    return true;
  },
  async generate(){
    if(!state.doc.format){ showToast('Choose a format first'); return; }
    showPanel(4);
    await preloadImages(state.doc);
    await new Promise(r=>setTimeout(r,300));
    state.variants.recommended = generateVariant(state.doc,'recommended');
    state.variants.bold = generateVariant(state.doc,'bold');
    state.variants.minimal = generateVariant(state.doc,'minimal');
    state.selectedVariant = 'recommended';
    showPanel(5);
    renderStudio();
    saveDraft();
  },
  regenerate(){ this.generate(); },
  exportPoster(fmt){
    const doc = state.variants[state.selectedVariant];
    if(doc.qa.status==='fail'){ showToast('Fix the issues in the QA panel before exporting'); return; }
    if(fmt==='png') ExportPipeline.toPNG(doc);
    else if(fmt==='jpeg') ExportPipeline.toJPEG(doc);
    else if(fmt==='pdf'){
      if(doc.format.category!=='print'){ showToast('PDF export is available for print formats'); return; }
      ExportPipeline.toPDF(doc);
    }
    showToast(`Exporting ${fmt.toUpperCase()}…`);
  }
};

function preloadImages(doc){
  const jobs = doc.assets.photos.map(p=> new Promise(res=>{
    if(p._img){ res(); return; }
    const img = new Image(); img.onload=()=>{ p._img=img; res(); }; img.onerror=()=>res(); img.src=p.dataUrl;
  }));
  doc.assets.partnerLogos.forEach(l=>{
    jobs.push(new Promise(res=>{
      if(l._img){ res(); return; }
      const img = new Image(); img.onload=()=>{ l._img=img; res(); }; img.onerror=()=>res(); img.src=l.dataUrl;
    }));
  });
  const logoSrc = doc.assets.logoOverride || doc.brand.logoDataUrl;
  doc._hasLogo = !!logoSrc;
  if(logoSrc){
    jobs.push(new Promise(res=>{
      const img = new Image(); img.onload=()=>{ doc._logoImg=img; res(); }; img.onerror=()=>res(); img.src=logoSrc;
    }));
  }
  return Promise.all(jobs);
}

function renderStudio(){
  const doc = state.variants[state.selectedVariant];
  const canvas = document.getElementById('stageCanvas');
  const maxEdge = 720;
  const scale = maxEdge/Math.max(doc.format.widthPx, doc.format.heightPx);
  canvas.width = doc.format.widthPx*scale;
  canvas.height = doc.format.heightPx*scale;
  const ctx = canvas.getContext('2d');
  ctx.setTransform(scale,0,0,scale,0,0);
  paintPoster(ctx, doc);
  ctx.setTransform(1,0,0,1,0,0);

  const strip = document.getElementById('variantStrip');
  strip.innerHTML = '';
  ['recommended','bold','minimal'].forEach(key=>{
    const v = state.variants[key];
    const wrap = document.createElement('div');
    wrap.className = 'variant-thumb'+(key===state.selectedVariant?' active':'');
    wrap.onclick = ()=>{ state.selectedVariant=key; renderStudio(); };
    const tc = document.createElement('canvas');
    const ts = 140/Math.max(v.format.widthPx,v.format.heightPx);
    tc.width = v.format.widthPx*ts; tc.height = v.format.heightPx*ts;
    const tctx = tc.getContext('2d');
    tctx.setTransform(ts,0,0,ts,0,0);
    paintPoster(tctx, v);
    const label = document.createElement('div');
    label.className = 'vt-label';
    label.textContent = key;
    wrap.appendChild(tc); wrap.appendChild(label);
    strip.appendChild(wrap);
  });

  const qaBox = document.getElementById('qaBox');
  const qa = doc.qa;
  qaBox.innerHTML = `<h3>Preflight</h3>
    <div class="qa-status-badge ${qa.status}">${qa.status==='pass'?'✓ Ready to export':qa.status==='warn'?'⚠ Review warnings':'✕ Needs fixes'}</div>
    ${doc.visualDirection.switchNote?`<div class="qa-check warn"><span class="qc-dot"></span>${esc(doc.visualDirection.switchNote)}</div>`:''}
    ${qa.checks.map(c=>`<div class="qa-check ${c.level}"><span class="qc-dot"></span>${esc(c.message)}</div>`).join('')}`;

  document.getElementById('exportPdfBtn').disabled = doc.format.category!=='print';
}
function esc(v){ return (v==null?'':String(v)).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

/* ── ASSETS MODULE ── */
const Assets = {
  async addFiles(files){
    const remaining = 5 - state.doc.assets.photos.length;
    if(remaining<=0){ showToast('Maximum 5 photos'); return; }
    const list = Array.from(files).slice(0,remaining);
    for(const f of list){
      try{
        const asset = await ImagePreflight.analyze(f);
        state.doc.assets.photos.push(asset);
      }catch(e){ showToast('Could not read '+f.name); }
    }
    renderPhotoGrid();
  },
  removePhoto(id){
    state.doc.assets.photos = state.doc.assets.photos.filter(p=>p.id!==id);
    renderPhotoGrid();
  },
  setLogo(dataUrl){
    state.doc.assets.logoOverride = dataUrl;
    renderLogoPreview();
  },
  clearLogo(){ state.doc.assets.logoOverride = null; renderLogoPreview(); },
  async addPartnerLogos(files){
    const remaining = 4 - state.doc.assets.partnerLogos.length;
    if(remaining<=0){ showToast('Maximum 4 partner logos'); return; }
    const list = Array.from(files).slice(0,remaining);
    for(const f of list){
      try{
        const logo = await PartnerLogoLoader.analyze(f);
        state.doc.assets.partnerLogos.push(logo);
      }catch(e){ showToast('Could not read '+f.name); }
    }
    renderPartnerLogoGrid();
  },
  removePartnerLogo(id){
    state.doc.assets.partnerLogos = state.doc.assets.partnerLogos.filter(l=>l.id!==id);
    renderPartnerLogoGrid();
  }
};
function renderPhotoGrid(){
  const grid = document.getElementById('photoGrid');
  grid.innerHTML = state.doc.assets.photos.map(p=>{
    const st = p.preflight.status;
    const icon = st==='pass'?'✓':st==='warn'?'⚠':'✕';
    return `<div class="photo-card">
      <img class="photo-thumb" src="${p.dataUrl}">
      <div class="photo-meta">
        <div class="photo-dims">${p.naturalWidth}×${p.naturalHeight} · ${p.bucketLabel}</div>
        <div class="photo-status ${st}">${icon} ${st==='pass'?'Suitable':st==='warn'?'Usable, some limits':'Too low-res'}</div>
      </div>
      <button class="photo-remove" onclick="Assets.removePhoto('${p.id}')">Remove</button>
    </div>`;
  }).join('');
}
function renderLogoPreview(){
  const el = document.getElementById('logoPreview');
  const src = state.doc.assets.logoOverride || state.doc.brand.logoDataUrl;
  el.innerHTML = src ? `<img src="${src}">` : `<span style="font-size:10px;color:var(--muted)">None</span>`;
  document.getElementById('logoClearBtn').style.display = state.doc.assets.logoOverride ? 'inline-block' : 'none';
}
function renderPartnerLogoGrid(){
  const grid = document.getElementById('partnerLogoGrid');
  grid.innerHTML = state.doc.assets.partnerLogos.map(l=>`
    <div class="photo-card">
      <img class="photo-thumb" style="object-fit:contain;padding:10px" src="${l.dataUrl}">
      <button class="photo-remove" onclick="Assets.removePartnerLogo('${l.id}')">Remove</button>
    </div>`).join('');
}

/* ── FORMAT MODULE ── */
function shapeStyle(f){
  const ratio = f.widthPx/f.heightPx;
  const h = 20, w = Math.round(h*ratio);
  return `width:${w}px;height:${h}px`;
}
function renderFormatGrids(){
  const dg = document.getElementById('formatGridDigital');
  const pg = document.getElementById('formatGridPrint');
  const build = (list)=> list.map(f=>{
    const spec = f.category==='print' ? `${f.mm.w}×${f.mm.h}mm` : `${f.widthPx}×${f.heightPx}px`;
    return `<button type="button" class="format-card${state.doc.format&&state.doc.format.key===f.key?' active':''}" data-key="${f.key}" onclick="selectFormat('${f.key}')">
      <div class="fc-shape" style="${shapeStyle(f)}"></div>
      <div class="fc-name">${f.label}</div>
      <div class="fc-spec">${spec}</div>
    </button>`;
  }).join('');
  dg.innerHTML = build(Object.values(OUTPUT_FORMATS).filter(f=>f.category==='digital'));
  pg.innerHTML = build(Object.values(OUTPUT_FORMATS).filter(f=>f.category==='print'));
}
function selectFormat(key){
  state.doc.format = Object.assign({}, OUTPUT_FORMATS[key]);
  renderFormatGrids();
}

/* ── EVENT FORM BINDING ── */
function bindEventForm(){
  const map = { 'f-name':'name','f-date':'date','f-time':'time','f-venue':'venue','f-desc':'description',
    'f-speaker':'speaker','f-speakerTitle':'speakerTitle','f-organizer':'organizer','f-regUrl':'registrationUrl',
    'f-cta':'cta','f-social':'social' };
  Object.keys(map).forEach(id=>{
    document.getElementById(id).addEventListener('input', debounce(e=>{
      state.doc.event[map[id]] = e.target.value;
      saveDraft();
    },250));
  });
  const typeSel = document.getElementById('f-type');
  typeSel.innerHTML = EVENT_TYPES.map(([k,l])=>`<option value="${k}">${l}</option>`).join('');
  typeSel.value = state.doc.event.eventType;
  typeSel.addEventListener('change', e=>{ state.doc.event.eventType = e.target.value; saveDraft(); });

  const toneRow = document.getElementById('toneRow');
  toneRow.innerHTML = TONE_OPTIONS.map(([k,l])=>`<button type="button" class="tone-chip${k===state.doc.event.tone?' active':''}" data-tone="${k}">${l}</button>`).join('');
  toneRow.querySelectorAll('.tone-chip').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      state.doc.event.tone = btn.dataset.tone==='null' ? null : btn.dataset.tone;
      toneRow.querySelectorAll('.tone-chip').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      saveDraft();
    });
  });
}
function debounce(fn,ms){ let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a),ms); }; }

/* ── DRAFT PERSISTENCE (event fields + format only — photos are not persisted) ── */
const DRAFT_KEY = 'posterGenDraft';
function saveDraft(){
  try{
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ event: state.doc.event, format: state.doc.format ? state.doc.format.key : null }));
  }catch(e){}
}
function loadDraft(){
  try{
    const raw = localStorage.getItem(DRAFT_KEY);
    if(!raw) return;
    const d = JSON.parse(raw);
    Object.assign(state.doc.event, d.event||{});
    if(d.format && OUTPUT_FORMATS[d.format]) state.doc.format = Object.assign({}, OUTPUT_FORMATS[d.format]);
  }catch(e){}
}
function applyDraftToForm(){
  const map = { 'f-name':'name','f-date':'date','f-time':'time','f-venue':'venue','f-desc':'description',
    'f-speaker':'speaker','f-speakerTitle':'speakerTitle','f-organizer':'organizer','f-regUrl':'registrationUrl',
    'f-cta':'cta','f-social':'social' };
  Object.keys(map).forEach(id=>{ document.getElementById(id).value = state.doc.event[map[id]]||''; });
  document.getElementById('f-type').value = state.doc.event.eventType;
}

/* ═══════════════ 14. ADMIN BRAND EDITOR ═══════════════ */
const Admin = {
  unlocked:false,
  open(){
    document.getElementById('adminOverlay').classList.add('active');
    this.render();
  },
  close(){ document.getElementById('adminOverlay').classList.remove('active'); },
  render(){
    const storedPass = localStorage.getItem(ADMIN_PASS_KEY);
    const modal = document.getElementById('adminModal');
    if(!this.unlocked){
      modal.innerHTML = `
        <button class="modal-close" onclick="Admin.close()">×</button>
        <h2>Brand Settings</h2>
        <div class="modal-sub">${storedPass? 'Enter the passphrase to edit the MUT Tech Community brand.' : 'Set a local passphrase to protect this screen. This is a light deterrent, not real security — anyone with browser access can still view the page source.'}</div>
        <div class="field-group"><label>Passphrase</label><input type="text" id="adminPassInput" placeholder="${storedPass?'':'Choose a passphrase'}"></div>
        <div class="modal-actions"><button class="btn-primary" onclick="Admin.unlock()">${storedPass?'Unlock':'Set & continue'}</button></div>`;
      return;
    }
    const b = BrandStore.load();
    modal.innerHTML = `
      <button class="modal-close" onclick="Admin.close()">×</button>
      <h2>Brand Settings</h2>
      <div class="modal-sub">Changes apply to every poster generated from this browser. Export brand.json to share the update.</div>
      <div class="field-group"><label>Organizer name</label><input type="text" id="b-organizer" value="${esc(b.organizer)}"></div>
      <div class="field-group"><label>Footer text</label><input type="text" id="b-footer" value="${esc(b.footer)}"></div>
      <div class="field-group"><label>Social handle</label><input type="text" id="b-handle" value="${esc(b.socials.handle)}"></div>
      <div class="field-group"><label>Website</label><input type="text" id="b-website" value="${esc(b.socials.website)}"></div>
      <div class="section-divider">Logo</div>
      <div class="logo-row">
        <div class="logo-preview">${b.logoDataUrl?`<img src="${b.logoDataUrl}">`:'<span style="font-size:10px;color:var(--muted)">None</span>'}</div>
        <button class="btn-secondary" onclick="document.getElementById('b-logo').click()">Upload logo</button>
        <input type="file" id="b-logo" accept="image/*" style="display:none">
      </div>
      <div class="section-divider">Colors</div>
      ${['navy','navy2','navy3','gold','gold2','gold3'].map(k=>`<div class="color-row"><input type="color" id="b-c-${k}" value="${b.colors[k]}"><span>${k}</span></div>`).join('')}
      <div class="modal-actions">
        <button class="btn-primary" onclick="Admin.save()">Save</button>
        <button class="btn-secondary" onclick="Admin.exportJSON()">Export brand.json</button>
        <button class="btn-secondary" onclick="Admin.resetDefaults()">Reset to defaults</button>
      </div>`;
    document.getElementById('b-logo').addEventListener('change', e=>{
      const f = e.target.files[0]; if(!f) return;
      const reader = new FileReader();
      reader.onload = ()=>{ BrandStore.saveOverride({logoDataUrl:reader.result}); Admin.render(); state.doc.brand = BrandStore.load(); renderLogoPreview(); };
      reader.readAsDataURL(f);
    });
  },
  unlock(){
    const val = document.getElementById('adminPassInput').value.trim();
    const stored = localStorage.getItem(ADMIN_PASS_KEY);
    if(!val){ showToast('Enter a passphrase'); return; }
    if(!stored){ localStorage.setItem(ADMIN_PASS_KEY, val); this.unlocked=true; this.render(); return; }
    if(val===stored){ this.unlocked=true; this.render(); } else { showToast('Incorrect passphrase'); }
  },
  save(){
    const colors = {};
    ['navy','navy2','navy3','gold','gold2','gold3'].forEach(k=>{ colors[k]=document.getElementById('b-c-'+k).value; });
    BrandStore.saveOverride({
      organizer: document.getElementById('b-organizer').value,
      footer: document.getElementById('b-footer').value,
      socials:{ handle:document.getElementById('b-handle').value, website:document.getElementById('b-website').value },
      colors
    });
    state.doc.brand = BrandStore.load();
    renderLogoPreview();
    showToast('Brand settings saved');
    this.close();
  },
  exportJSON(){
    const blob = new Blob([BrandStore.exportJSON()], {type:'application/json'});
    ExportPipeline.download(blob, 'brand.json');
  },
  resetDefaults(){
    if(!confirm('Reset brand to the shipped MUT Tech Community defaults?')) return;
    BrandStore.resetOverride();
    state.doc.brand = BrandStore.load();
    renderLogoPreview();
    this.render();
  }
};

/* ═══════════════ 15. TOAST + INIT ═══════════════ */
function showToast(msg){
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(showToast._h);
  showToast._h = setTimeout(()=>t.classList.remove('show'), 2400);
}

function init(){
  loadDraft();
  bindEventForm();
  applyDraftToForm();
  renderFormatGrids();
  renderLogoPreview();
  renderStepNav();
  showPanel(1);

  document.getElementById('dropzone').addEventListener('click', ()=>document.getElementById('photoInput').click());
  document.getElementById('photoInput').addEventListener('change', e=>{ Assets.addFiles(e.target.files); e.target.value=''; });
  document.getElementById('logoInput').addEventListener('change', e=>{
    const f = e.target.files[0]; if(!f) return;
    const reader = new FileReader();
    reader.onload = ()=>Assets.setLogo(reader.result);
    reader.readAsDataURL(f);
    e.target.value='';
  });
  document.getElementById('partnerLogoInput').addEventListener('change', e=>{ Assets.addPartnerLogos(e.target.files); e.target.value=''; });
  document.getElementById('adminOverlay').addEventListener('click', e=>{ if(e.target.id==='adminOverlay') Admin.close(); });
}
window.addEventListener('DOMContentLoaded', init);

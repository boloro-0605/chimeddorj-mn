(function () {
  var card = document.getElementById('cdx');
  if (!card) return;
  var cv = card.querySelector('.cdx-cv'), fx = card.querySelector('.cdx-fx'), ctx0 = cv.getContext('2d'), ctxF = fx.getContext('2d'), ctx = ctx0, grid = card.querySelector('.cdx-grid'),
      cap = document.getElementById('cdxCap'), mEl = document.getElementById('cdxMotto'),
      mWrap = card.querySelector('.cdx-mwrap'), tiles = [].slice.call(card.querySelectorAll('.cdx-t'));
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FONT = '-apple-system,"Helvetica Neue",Helvetica,Arial,sans-serif';
  var LANG = (document.documentElement.lang || 'mn').toLowerCase().indexOf('en') === 0 ? 'en' : 'mn';

  // ---- Хэл тус бүрийн бичвэр (нэг газар цугласан, document.documentElement.lang-аар сонгоно) ----
  var L = {
    mn: {
      caps: ['<b>Атом</b> · цөм ба электрон бүрхүүл', '<b>Шаталтын дулаан</b> · нүүрс ба устөрөгч', ''],
      names: { C: 'Нүүрстөрөгч', H: 'Устөрөгч', O: 'Хүчилтөрөгч' },
      unit: 'МЖ/кг',
      emitCO2: 'CO₂ ялгаруулна',
      emitH2O: 'Зөвхөн ус ялгаруулна',
      replay: '↻ дахин үзэх',
      sndOn: '🔊 Дуутай үзэх',
      sndOff: '🔈 Дууг хаах'
    },
    en: {
      caps: ['<b>Atom</b> · nucleus &amp; electron shells', '<b>Heat of combustion</b> · coal vs hydrogen', ''],
      names: { C: 'Carbon', H: 'Hydrogen', O: 'Oxygen' },
      unit: 'MJ/kg',
      emitCO2: 'Emits CO₂',
      emitH2O: 'Emits only water',
      replay: '↻ replay',
      sndOn: '🔊 Play with sound',
      sndOff: '🔈 Mute'
    }
  }[LANG];

  // ---- Тохиргоо ----
  var MOTTO = 'Great Transformation', MOTTO_HTML = '<b>Great</b> Transformation', WAIT = 'Transforming';
  var TB0 = 5.2, TB1 = 11.2, TC0 = 11.2, STEP = .2, FLY = .8;
  var FIN = TC0 + .5 + 9 * STEP + FLY;   // сүүлийн үсэг буух мөч
  var CAPS = L.caps;
  var E = {
    C: { n:L.names.C, z:6, m:'12.011',  sh:[2,4], c1:'#7a838d', c2:'#262b30' },
    H: { n:L.names.H, z:1, m:'1.008',   sh:[1],   c1:'#ffffff', c2:'#aebccd' },
    O: { n:L.names.O, z:8, m:'15.9994', sh:[2,6], c1:'#ff9283', c2:'#b8352e' }
  };
  var SLOT = { C:.2, H:.5, O:.8 };

  var W = 0, H = 0;
  function resize() {
    var r = card.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = r.width; H = r.height;
    [cv, fx].forEach(function (c) { c.width = W * dpr; c.height = H * dpr; });
    ctx0.setTransform(dpr, 0, 0, dpr, 0, 0); ctxF.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize(); window.addEventListener('resize', resize);

  function cl(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function eio(x) { x = cl(x); return x < .5 ? 4*x*x*x : 1 - Math.pow(-2*x + 2, 3) / 2; }
  function eo(x) { x = cl(x); return 1 - Math.pow(1 - x, 3); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function line(a, b, c, d) { ctx.beginPath(); ctx.moveTo(a, b); ctx.lineTo(c, d); ctx.stroke(); }
  function rrect(x, y, w, h, r) { ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x, y, w, h, Math.max(0, r)); else ctx.rect(x, y, w, h); }
  function text(s, x, y, size, col, a, wt) {
    if (a <= 0) return;
    ctx.globalAlpha = a; ctx.fillStyle = col; ctx.font = (wt || 400) + ' ' + size + 'px ' + FONT;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(s, x, y); ctx.globalAlpha = 1;
  }
  function sphere(x, y, r, k, a, label) {
    if (a <= 0) return;
    var e = E[k], g = ctx.createRadialGradient(x - r*.35, y - r*.35, r*.1, x, y, r);
    g.addColorStop(0, e.c1); g.addColorStop(1, e.c2);
    ctx.globalAlpha = a; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
    if (label) text(k, x, y + r*.05, r*.9, k === 'H' ? '#2b3035' : '#fff', a, 600);
    ctx.globalAlpha = 1;
  }
  function bond(x1, y1, x2, y2, a, dbl, w) {
    ctx.globalAlpha = a * .8; ctx.strokeStyle = '#e6ecf5'; ctx.lineWidth = w; ctx.lineCap = 'round';
    if (dbl) {
      var dx = y2 - y1, dy = x1 - x2, l = Math.hypot(dx, dy) || 1, o = w * 1.3;
      dx = dx / l * o; dy = dy / l * o;
      line(x1 + dx, y1 + dy, x2 + dx, y2 + dy); line(x1 - dx, y1 - dy, x2 - dx, y2 - dy);
    } else line(x1, y1, x2, y2);
    ctx.globalAlpha = 1;
  }
  function flash(x, y, r, col, a) {
    if (a <= 0 || r <= 0) return;
    var g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.globalAlpha = a; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); ctx.globalAlpha = 1;
  }

  // Арын хөвөгч атомууд
  var P = [];
  for (var i = 0; i < 26; i++) P.push({ k:'CHO'[i % 3], x:Math.random(), y:Math.random(),
    vx:(Math.random() - .5) * .02, vy:(Math.random() - .5) * .02, r:2 + Math.random() * 3 });
  function ambient(dt, a) {
    P.forEach(function (p) {
      p.x += p.vx * dt; p.y += p.vy * dt;
      if (p.x < 0 || p.x > 1) { p.vx *= -1; p.x = cl(p.x); }
      if (p.y < 0 || p.y > 1) { p.vy *= -1; p.y = cl(p.y); }
      sphere(p.x * W, p.y * H, p.r, p.k, a, false);
    });
  }

  // 1. Атомууд нэрийн дарааллаар (C → H → O): төвд төрж, электроноо татаад байрандаа очно
  function bohr(k, i, t, aOut) {
    var lt = t - (.2 + i * 1.4);
    if (lt <= 0 || aOut <= 0) return;
    var e = E[k], Rb = Math.min(W * .12, H * .2), m = eio((lt - .9) / .5),
        x = lerp(W * .5, W * SLOT[k], m), y = H * .42,
        sc = lerp(1.3, 1, m) * (.55 + .45 * eo(lt / .35)), R = Rb * sc, a = cl(lt / .2) * aOut,
        sa = eo((lt - .2) / .3), ei = 0;
    flash(x, y, Rb * 1.5, 'rgba(140,190,255,.55)', a * Math.max(0, 1 - lt / .6));
    e.sh.forEach(function (n, si) {
      var rr = e.sh.length === 1 ? R * .62 : R * (.5 + .5 * si), sp = 1.8 / (si + 1);
      ctx.globalAlpha = a * .3 * sa; ctx.strokeStyle = '#9cc4ff'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(x, y, rr * (.6 + .4 * sa), 0, 7); ctx.stroke();
      for (var j = 0; j < n; j++, ei++) {
        var fe = eo((lt - .3 - ei * .06) / .35);
        if (fe <= 0) continue;
        var an = t * sp + j * Math.PI * 2 / n + si, st = ei * 2.4 + i * 1.7, d0 = Rb * 2.6,
            sx = x + Math.cos(st) * d0, sy = y + Math.sin(st) * d0,
            ex = lerp(sx, x + Math.cos(an) * rr, fe), ey = lerp(sy, y + Math.sin(an) * rr, fe);
        if (fe < 1) {
          ctx.globalAlpha = a * .5 * (1 - fe); ctx.strokeStyle = '#a8ccff'; ctx.lineWidth = 1.5;
          line(ex, ey, lerp(ex, sx, .3), lerp(ey, sy, .3));
        }
        ctx.globalAlpha = a * cl(fe * 2); ctx.fillStyle = '#cfe4ff';
        ctx.shadowColor = 'rgba(120,170,255,.95)'; ctx.shadowBlur = 10;
        ctx.beginPath(); ctx.arc(ex, ey, Math.max(2, Rb * .045), 0, 7); ctx.fill();
        ctx.shadowBlur = 0; ctx.globalAlpha = 1;
      }
    });
    sphere(x, y, R * (.2 + .015 * Math.sin(t * 4)), k, a, true);
    var fs = Math.max(10, Math.min(15, W * .022)), la = a * eo((lt - .5) / .4);
    text(e.n, x, y + R + fs * 1.5, fs, '#fff', la * .9, 500);
    text('Z = ' + e.z + '  ·  ' + e.m, x, y + R + fs * 3, fs * .85, '#8db8ff', la * .85);
  }

  // 2. Шаталт: эхлээд нүүрс (C), дараа нь устөрөгч (H)
  function o2(cx, cy, s, ang, a) {
    var d = s * 1.05, c = Math.cos(ang) * d, n = Math.sin(ang) * d;
    bond(cx + c, cy + n, cx - c, cy - n, a, true, s * .12);
    sphere(cx + c, cy + n, s * .95, 'O', a, true); sphere(cx - c, cy - n, s * .95, 'O', a, true);
  }
  function reaction(t, a) {
    if (a <= 0) return;
    var p = (t - TB0) / (TB1 - TB0), p2 = p - .1, s = Math.min(W, H) * .036, pw = W * .42, cy = H * .44,
        L2 = W * .26, R2 = W * .74, fs = Math.max(10, Math.min(15, W * .022));
    function jit(ph) { return Math.sin(t * 3 + ph) * s * .1; }

    ctx.globalAlpha = a * .15; ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; line(W / 2, H * .1, W / 2, H * .84); ctx.globalAlpha = 1;
    text('C + O₂ → CO₂', L2, H * .12, fs * 1.1, '#e6ebf2', a, 500);
    text('2H₂ + O₂ → 2H₂O', R2, H * .12, fs * 1.1, '#e6ebf2', a * cl(p2 / .08 + 1), 500);

    // Нүүрс
    var q = eio((p - .06) / .36), r = eo((p - .47) / .4), fl = Math.max(0, 1 - Math.abs(p - .465) / .06);
    if (p < .465) {
      sphere(L2 - pw * .32 * (1 - q), cy + jit(2), s, 'C', a, true);
      o2(L2 + pw * .32 * (1 - q) + s * .4 * q, cy + jit(1), s, t * .8, a);
    } else {
      var px = L2 + Math.sin(t * .9) * s * .6 * r, py = cy - H * .08 * r, th = r * 1.1 + .2 * Math.sin(t),
          bl = s * 1.9, ax = Math.cos(th) * bl, ay = Math.sin(th) * bl;
      for (var i = 0; i < 6; i++) {
        var hh = (t * .25 + i / 6) % 1;
        ctx.globalAlpha = a * r * .16 * (1 - hh); ctx.fillStyle = '#9aa3ad';
        ctx.beginPath(); ctx.arc(px + Math.sin(i * 2.1 + t) * s * 1.5, py - s * 1.6 - hh * H * .09, s * (.6 + hh * 1.3), 0, 7); ctx.fill();
      }
      ctx.globalAlpha = 1;
      bond(px - ax, py - ay, px + ax, py + ay, a, true, s * .12);
      sphere(px - ax, py - ay, s * .95, 'O', a, true); sphere(px + ax, py + ay, s * .95, 'O', a, true);
      sphere(px, py, s, 'C', a, true);
    }
    flash(L2, cy, s * 6 * (.4 + fl), 'rgba(255,160,70,.9)', a * fl);

    // Устөрөгч
    var q2 = eio((p2 - .06) / .36), r2 = eo((p2 - .47) / .4), fl2 = Math.max(0, 1 - Math.abs(p2 - .465) / .06);
    if (p2 < .465) {
      [-1, 1].forEach(function (sg, i) {
        var hx = lerp(R2 - pw * .32, R2 - s * .8, q2), hy = cy + sg * lerp(s * 2.4, s * 1.2, q2) + jit(i + 3),
            an = t * 1.2 * sg + i, dd = s * .75, c = Math.cos(an) * dd, n = Math.sin(an) * dd;
        bond(hx + c, hy + n, hx - c, hy - n, a, false, s * .12);
        sphere(hx + c, hy + n, s * .62, 'H', a, true); sphere(hx - c, hy - n, s * .62, 'H', a, true);
      });
      o2(lerp(R2 + pw * .32, R2 + s * .8, q2), cy + jit(5), s, t * .7 + 1, a);
    } else {
      [-1, 1].forEach(function (sg, i) {
        var wx = R2 + sg * pw * .18 * r2 + Math.sin(t + i) * s * .3, wy = cy + sg * H * .05 * r2 - H * .02 * r2,
            dir = -Math.PI / 2 + sg * .6 * r2 + t * .5 * sg, b2 = s * 1.45, ha = .912,
            h1x = wx + Math.cos(dir - ha) * b2, h1y = wy + Math.sin(dir - ha) * b2,
            h2x = wx + Math.cos(dir + ha) * b2, h2y = wy + Math.sin(dir + ha) * b2;
        flash(wx, wy, s * 3, 'rgba(90,160,255,.35)', a * r2);
        bond(wx, wy, h1x, h1y, a, false, s * .12); bond(wx, wy, h2x, h2y, a, false, s * .12);
        sphere(wx, wy, s * .95, 'O', a, true); sphere(h1x, h1y, s * .62, 'H', a, true); sphere(h2x, h2y, s * .62, 'H', a, true);
      });
    }
    flash(R2, cy, s * 6 * (.4 + fl2), 'rgba(170,215,255,.9)', a * fl2);

    // Шаталтын дулаан
    var by = H * .72, bw = pw * .78, bh = Math.max(6, H * .018);
    [[L2, 33, '#9aa3ad', '≈ 33 ' + L.unit, L.emitCO2, '#c2c8cf', eo((p - .55) / .25)],
     [R2, 142, '#5b9bff', '≈ 142 ' + L.unit, L.emitH2O, '#8db8ff', eo((p2 - .55) / .25)]].forEach(function (b) {
      var x0 = b[0] - bw / 2, bp = b[6];
      ctx.globalAlpha = a * .15; ctx.fillStyle = '#fff'; rrect(x0, by, bw, bh, bh / 2); ctx.fill();
      ctx.globalAlpha = a; ctx.fillStyle = b[2]; rrect(x0, by, Math.max(bh, bw * b[1] / 142 * bp), bh, bh / 2); ctx.fill();
      ctx.globalAlpha = 1;
      text(b[3], b[0], by - fs * 1.1, fs, '#fff', a * bp, 600);
      text(b[4], b[0], by + bh + fs * 1.2, fs * .85, b[5], a * bp);
    });
  }

  // 3. Нэр үсэг үсгээр бүтнэ: C, H нисэж ирнэ → I M E D D унана → O нисэж ирнэ → R J
  function glyph(x, y, sz, rad, rot, k, a, f) {
    if (a <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.globalAlpha = a;
    ctx.shadowColor = 'rgba(70,140,255,.8)'; ctx.shadowBlur = 24 * (1 - f) + 10;
    var g = ctx.createLinearGradient(-sz / 2, -sz / 2, sz / 2, sz / 2);
    g.addColorStop(0, '#5b9bff'); g.addColorStop(.55, '#2563d9'); g.addColorStop(1, '#1b4fb8');
    ctx.fillStyle = g; rrect(-sz / 2, -sz / 2, sz, sz, rad); ctx.fill();
    ctx.shadowBlur = 0; ctx.fillStyle = '#fff'; ctx.font = '300 ' + (sz * .6) + 'px ' + FONT;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(k, 0, sz * .03);
    ctx.restore(); ctx.globalAlpha = 1;
  }
  function ripple(x, y, ts, u, blue) {
    var hs = ts * (.5 + .28 * eo(u));
    ctx.globalAlpha = (1 - u) * .45; ctx.strokeStyle = blue ? '#7fb0ff' : '#ffffff'; ctx.lineWidth = 2 * (1 - u) + .5;
    rrect(x - hs, y - hs, hs * 2, hs * 2, 3 + 8 * u); ctx.stroke(); ctx.globalAlpha = 1;
  }
  function assemble(t) {
    if (t > FIN + .6) return;
    var cr = card.getBoundingClientRect(), gr = grid.getBoundingClientRect(), R0 = Math.min(W * .12, H * .2) * .45, ap = eo((t - TC0) / .4);
    tiles.forEach(function (el, i) {
      var s0 = TC0 + .5 + i * STEP, land = s0 + FLY, k = el.getAttribute('data-l'),
          ts = el.offsetWidth, tx = gr.left - cr.left + el.offsetLeft + ts / 2,
          ty = gr.top - cr.top + el.offsetTop + ts / 2;
      if (k) {
        if (t < land) {
          var sx = W * SLOT[k], sy = H * .42, dir = i % 2 ? -1 : 1;
          if (t < TC0 + .6) flash(sx, sy, R0 * 3.5, 'rgba(120,180,255,.6)', 1 - eo((t - TC0) / .6));
          [.15, .1, .05].forEach(function (lag) {            // хурдны мөр
            var f2 = eio((t - lag - s0) / FLY);
            if (f2 > 0 && f2 < 1) glyph(lerp(sx, tx, f2), lerp(sy, ty, f2) - Math.sin(f2 * Math.PI) * H * .1,
              lerp(R0 * 2, ts, f2), lerp(R0, 3, f2), Math.sin(f2 * Math.PI) * .5 * dir, k, ap * .14, f2);
          });
          var f = eio((t - s0) / FLY), pulse = 1 + .05 * Math.sin(t * 6) * (1 - f), sz = lerp(R0 * 2 * pulse, ts, f);
          glyph(lerp(sx, tx, f), lerp(sy, ty, f) - Math.sin(f * Math.PI) * H * .1,
                sz, lerp(sz / 2, 3, f), Math.sin(f * Math.PI) * .5 * dir, k, ap, f);
        } else if (!el.classList.contains('in')) el.classList.add('in');
      } else if (t >= s0 + .4 && !el.classList.contains('in')) el.classList.add('in');
      if (t >= land && t < land + .5) ripple(tx, ty, ts, (t - land) / .5, !!k);
    });
  }

  // Мотто: "Transforming..." → "Great Transformation" (мотто хэлнээс үл хамаарна)
  var CH = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', mState = 0, mLast = 0;
  function motto(t) {
    if (t < TC0 + .2) return;
    if (t < FIN + .1) {
      if (mState !== 1) { mState = 1; mWrap.classList.add('show'); }
      var d = Math.floor(t * 3) % 4;
      mEl.textContent = WAIT + '...'.slice(0, d) + '   '.slice(d);
      return;
    }
    var k = (t - FIN - .1) / .04;
    if (k < MOTTO.length + 1) {
      if (t - mLast < .045) return;
      mLast = t;
      var s = '';
      for (var i = 0; i < MOTTO.length; i++) {
        var c = MOTTO[i];
        s += (i < k || c === ' ') ? c : CH[(Math.random() * CH.length) | 0];
      }
      mEl.textContent = s;
    } else if (mState !== 2) {
      mState = 2; mEl.innerHTML = MOTTO_HTML; card.classList.add('done');
    }
  }

  // ===== ДУУ (Web Audio — файлгүй, кодоор нийлэгжүүлнэ) =====
  var ac = null, master = null, nbuf = null, droneN = null, soundOn = false, prevT = -1, EV = [];
  var F0 = 110; // суурь нот (A2) — бүх дуу энэ нотын обертон цуваанд зохицно
  function audioInit() {
    if (ac) return;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ac = new AC();
    var comp = ac.createDynamicsCompressor();
    master = ac.createGain(); master.gain.value = 0;
    master.connect(comp); comp.connect(ac.destination);
    nbuf = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate);
    var d = nbuf.getChannelData(0);
    for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  function env(g, t0, a, peak, d) {
    g.gain.setValueAtTime(.0001, t0);
    g.gain.exponentialRampToValueAtTime(peak, t0 + a);
    g.gain.exponentialRampToValueAtTime(.0001, t0 + a + d);
  }
  function tone(type, f, peak, a, d, f2, delay) {
    var n = ac.currentTime + (delay || 0), o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(f, n);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, n + a + d);
    env(g, n, a, peak, d); o.connect(g); g.connect(master);
    o.start(n); o.stop(n + a + d + .05);
  }
  function noise(dur, type, f, f2, q, peak, a, delay) {
    var n = ac.currentTime + (delay || 0), s = ac.createBufferSource(), fl = ac.createBiquadFilter(), g = ac.createGain();
    s.buffer = nbuf; fl.type = type; fl.Q.value = q;
    fl.frequency.setValueAtTime(f, n); fl.frequency.exponentialRampToValueAtTime(f2, n + dur);
    env(g, n, a, peak, Math.max(.01, dur - a));
    s.connect(fl); fl.connect(g); g.connect(master); s.start(n); s.stop(n + dur + .05);
  }

  // Хөөмий төст суурь дуу
  function droneStart() {
    droneStop(.2);
    var now = ac.currentTime, out = ac.createGain();
    out.gain.setValueAtTime(.0001, now); out.gain.linearRampToValueAtTime(.18, now + 2.5); out.connect(master);
    var o1 = ac.createOscillator(), o2 = ac.createOscillator(), lfo = ac.createOscillator(), lg = ac.createGain(), mix = ac.createGain();
    o1.type = o2.type = 'sawtooth'; o1.frequency.value = F0; o2.frequency.value = F0 * 1.003;
    lfo.frequency.value = 4.6; lg.gain.value = .5; lfo.connect(lg); lg.connect(o1.frequency); lg.connect(o2.frequency);
    mix.gain.value = .5; o1.connect(mix); o2.connect(mix);
    var lp = ac.createBiquadFilter(), bg = ac.createGain();
    lp.type = 'lowpass'; lp.frequency.value = 520; lp.Q.value = .8; bg.gain.value = .55;
    mix.connect(lp); lp.connect(bg); bg.connect(out);
    var bp1 = ac.createBiquadFilter(), bp2 = ac.createBiquadFilter(), og = ac.createGain();
    bp1.type = bp2.type = 'bandpass'; bp1.Q.value = bp2.Q.value = 30;
    bp1.frequency.value = bp2.frequency.value = F0 * 8; og.gain.value = 7;
    mix.connect(bp1); bp1.connect(bp2); bp2.connect(og); og.connect(out);
    var mel = [8, 9, 10, 12, 10, 9, 8, 6, 8, 10, 12, 13, 12, 10, 9, 8], st = now + 1.2, step = .95;
    for (var r = 0; r < 2; r++) mel.forEach(function (h, n) {
      var tt = st + (r * mel.length + n) * step;
      bp1.frequency.setTargetAtTime(F0 * h, tt, .07); bp2.frequency.setTargetAtTime(F0 * h, tt, .07);
    });
    [o1, o2, lfo].forEach(function (o) { o.start(now); });
    droneN = { out:out, osc:[o1, o2, lfo] };
  }
  function droneStop(fade) {
    if (!droneN || !ac) return;
    var now = ac.currentTime, d = droneN, f = fade || .3;
    d.out.gain.cancelScheduledValues(now); d.out.gain.setValueAtTime(d.out.gain.value, now);
    d.out.gain.linearRampToValueAtTime(.0001, now + f);
    d.osc.forEach(function (o) { o.stop(now + f + .05); });
    droneN = null;
  }

  var PENT = [220, 277.18, 329.63, 369.99, 440, 554.37, 659.25, 739.99, 880, 1108.73];
  var HARM = [16, 18, 20, 24, 27, 30, 32, 36];
  function play(e) {
    var k = e[1];
    if (k === 'drone') droneStart();
    else if (k === 'droneOff') droneStop(3.5);
    else if (k === 'boom') {
      var f = { C:110, H:220, O:82.4 }[e[2]];
      tone('sine', f * 2, .5, .01, .9, f);
      tone('triangle', f * 4, .07, .005, .3, f * 2);
    } else if (k === 'ting') {
      var fh = F0 * HARM[e[2] % HARM.length] / 2;
      tone('sine', fh, .08, .003, .5); tone('sine', fh * 2.01, .025, .003, .25);
    } else if (k === 'coal') {
      noise(1.4, 'lowpass', 900, 120, 1, .45, .05);
      tone('sine', 60, .3, .02, 1.2, 40);
    } else if (k === 'hydro') {
      noise(.35, 'bandpass', 2500, 5000, 2, .15, .01);
      tone('sine', 700, .22, .005, .22, 1600);
      tone('sine', 900, .15, .005, .2, 2000, .17);
    } else if (k === 'bar') {
      if (e[2] === 0) tone('triangle', 220, .06, .3, 1.1, 275);
      else tone('triangle', 220, .08, .3, 1.4, 880);
    } else if (k === 'shimmer') {
      [1760, 2217.5, 2637].forEach(function (f, n) { tone('sine', f, .035, .01, .6, 0, n * .07); });
    } else if (k === 'swoosh') {
      noise(.8, 'bandpass', 400, 3000, 1.5, .18, .35);
    } else if (k === 'land') {
      var fp = PENT[e[2]];
      tone('triangle', fp, .26, .003, .35);
      noise(.05, 'highpass', 2000, 2000, .7, .1, .002);
      if (e[3]) tone('sine', fp * 2, .1, .005, 1.2);
    } else if (k === 'chord') {
      [110, 164.81, 220, 277.18, 329.63, 440].forEach(function (f, n) { tone('triangle', f, .06, .4 + n * .05, 3.5); });
      tone('sine', 880, .03, .6, 3);
    }
  }
  function buildEvents() {
    EV = [[.05, 'drone']];
    ['C', 'H', 'O'].forEach(function (k, i) {
      var b = .2 + i * 1.4, ei = 0;
      EV.push([b, 'boom', k]);
      E[k].sh.forEach(function (n) { for (var j = 0; j < n; j++, ei++) EV.push([b + .6 + ei * .06, 'ting', ei]); });
    });
    var D = TB1 - TB0;
    EV.push([TB0 + .465 * D, 'coal'], [TB0 + .565 * D, 'hydro'], [TB0 + .55 * D, 'bar', 0], [TB0 + .65 * D, 'bar', 1], [TC0, 'shimmer']);
    tiles.forEach(function (el, i) {
      var s0 = TC0 + .5 + i * STEP;
      if (el.getAttribute('data-l')) EV.push([s0, 'swoosh'], [s0 + FLY, 'land', i, 1]);
      else EV.push([s0 + .72, 'land', i, 0]);
    });
    EV.push([FIN + .95, 'chord'], [FIN + 2.5, 'droneOff']);
  }
  function sound(t) {
    if (soundOn && ac) EV.forEach(function (e) { if (prevT < e[0] && t >= e[0]) play(e); });
    prevT = t;
  }

  // Үндсэн давталт
  var t = 0, last = 0, running = false, visible = false, phase = -1;
  function setPhase(i) {
    if (i === phase) return;
    phase = i; cap.parentNode.classList.add('fade');
    setTimeout(function () { cap.innerHTML = CAPS[i]; if (CAPS[i]) cap.parentNode.classList.remove('fade'); }, 350);
  }
  function draw(dt) {
    ctx = ctx0; ctx.clearRect(0, 0, W, H); ctxF.clearRect(0, 0, W, H);
    ambient(dt, t > TC0 ? .22 : .12);
    if (t < TB0 + .1) ['C', 'H', 'O'].forEach(function (k, i) { bohr(k, i, t, 1 - cl((t - (TB0 - .5)) / .5)); });
    if (t > TB0 && t < TB1) reaction(t, cl((t - TB0) / .5) * (1 - cl((t - (TB1 - .5)) / .5)));
    if (t >= TC0) { ctx = ctxF; assemble(t); ctx = ctx0; }
    motto(t);
    setPhase(t < TB0 ? 0 : t < TC0 ? 1 : 2);
    sound(t);
  }
  function frame(ts) {
    if (!visible) { running = false; return; }
    var dt = last ? Math.min((ts - last) / 1000, .05) : 0; last = ts; t += dt;
    draw(dt); requestAnimationFrame(frame);
  }
  function start() { if (!running) { running = true; last = 0; requestAnimationFrame(frame); } }

  var replayLabel = card.querySelector('.cdx-replay');
  if (replayLabel) replayLabel.textContent = L.replay;
  var sndBtn = document.getElementById('cdxSnd');
  if (sndBtn) sndBtn.textContent = L.sndOn;

  if (reduce) {
    if (sndBtn) sndBtn.style.display = 'none';
    tiles.forEach(function (el) { el.classList.add('in'); });
    mWrap.classList.add('show'); mEl.innerHTML = MOTTO_HTML; card.classList.add('done');
    t = FIN + 5; draw(0);
    window.addEventListener('resize', function () { draw(0); });
    return;
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        visible = e.isIntersecting; if (visible) start();
        if (ac && soundOn) { if (visible) ac.resume(); else ac.suspend(); }
      });
    }, { threshold: .35 }).observe(card);
  } else { visible = true; start(); }

  function replay() {
    t = 0; mState = 0; mLast = 0; prevT = -1;
    if (ac) droneStop(.3);
    tiles.forEach(function (el) { el.classList.remove('in'); });
    mWrap.classList.remove('show'); mEl.textContent = '';
    card.classList.remove('done');
  }
  card.addEventListener('click', replay);

  buildEvents();
  if (sndBtn) sndBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    audioInit();
    if (!ac) { sndBtn.style.display = 'none'; return; }
    ac.resume();
    soundOn = !soundOn;
    var now = ac.currentTime;
    master.gain.cancelScheduledValues(now); master.gain.setValueAtTime(master.gain.value, now);
    master.gain.linearRampToValueAtTime(soundOn ? .8 : 0, now + .3);
    sndBtn.setAttribute('aria-pressed', soundOn);
    sndBtn.textContent = soundOn ? L.sndOff : L.sndOn;
    if (soundOn) replay(); else droneStop(.3);
  });
})();

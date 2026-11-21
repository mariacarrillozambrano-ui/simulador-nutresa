/* Capa 5b · Gráficos SVG sin dependencias (funciona sin internet).
 * Colores por rol vía variables CSS (--serie-1, --serie-2, ...), definidas en estilos.css.
 */
(function (global) {
  "use strict";
  const NS = "http://www.w3.org/2000/svg";

  function el(tag, attrs, parent) {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs || {}) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }

  let tip;
  function tooltip() {
    if (!tip) { tip = document.createElement("div"); tip.className = "viz-tip"; document.body.appendChild(tip); }
    return tip;
  }
  function mostrarTip(ev, html) {
    const t = tooltip(); t.innerHTML = html; t.style.display = "block";
    const x = Math.min(ev.clientX + 14, window.innerWidth - t.offsetWidth - 8);
    t.style.left = x + "px"; t.style.top = (ev.clientY + 14) + "px";
  }
  function ocultarTip() { if (tip) tip.style.display = "none"; }

  function escala(d0, d1, r0, r1) { return v => r0 + (v - d0) * (r1 - r0) / ((d1 - d0) || 1); }
  function ticks(min, max, n) {
    const paso0 = (max - min) / n, mag = Math.pow(10, Math.floor(Math.log10(paso0 || 1)));
    const paso = [1, 2, 2.5, 5, 10].map(m => m * mag).find(s => s >= paso0) || paso0;
    const out = []; for (let v = Math.ceil(min / paso) * paso; v <= max + 1e-9; v += paso) out.push(+v.toFixed(10));
    return out;
  }

  /* Línea multi-serie con cruz y tooltip. series: [{nombre, valores:[...], clase:'serie-1'}] */
  function lineas(cont, { x, series, formato = v => v.toLocaleString("es-CO", { minimumFractionDigits: 1, maximumFractionDigits: 1 }), alto = 220, unidad = "", etiquetas = false }) {
    cont.innerHTML = "";
    const ancho = Math.max(cont.clientWidth || 320, 260);
    const m = { t: 14, r: 16, b: 26, l: 46 };
    const svg = el("svg", { viewBox: `0 0 ${ancho} ${alto}`, class: "viz", role: "img" }, cont);
    const todos = series.flatMap(s => s.valores).filter(v => v != null);
    let min = Math.min(...todos), max = Math.max(...todos);
    const pad = (max - min) * 0.15 || Math.abs(max) * 0.1 || 1;
    min = min >= 0 && min - pad < 0 ? 0 : min - pad; max += pad;
    const tk = ticks(min, max, 4); min = Math.min(min, tk[0]); max = Math.max(max, tk[tk.length - 1]);
    const sx = escala(0, x.length - 1, m.l + 10, ancho - m.r - 10), sy = escala(min, max, alto - m.b, m.t);
    tk.forEach(v => {
      el("line", { x1: m.l, x2: ancho - m.r, y1: sy(v), y2: sy(v), class: "viz-grid" }, svg);
      el("text", { x: m.l - 6, y: sy(v) + 4, class: "viz-eje", "text-anchor": "end" }, svg).textContent = formato(v);
    });
    if (min < 0 && max > 0) el("line", { x1: m.l, x2: ancho - m.r, y1: sy(0), y2: sy(0), class: "viz-cero" }, svg);
    x.forEach((lab, i) => { el("text", { x: sx(i), y: alto - 8, class: "viz-eje", "text-anchor": "middle" }, svg).textContent = lab; });
    series.forEach(s => {
      const d = s.valores.map((v, i) => `${i ? "L" : "M"}${sx(i)},${sy(v)}`).join("");
      el("path", { d, class: `viz-linea ${s.clase}${s.punteada ? " punteada" : ""}` }, svg);
      s.valores.forEach((v, i) => el("circle", { cx: sx(i), cy: sy(v), r: 4.5, class: `viz-punto ${s.clase}` }, svg));
      if (etiquetas && series.length > 1 && series.length <= 4) {
        const i = s.valores.length - 1;
        el("text", { x: sx(i) - 8, y: sy(s.valores[i]) - 9, class: "viz-etq", "text-anchor": "end" }, svg).textContent = s.nombre;
      }
    });
    const guia = el("line", { y1: m.t, y2: alto - m.b, class: "viz-guia", visibility: "hidden" }, svg);
    const capa = el("rect", { x: m.l, y: m.t, width: ancho - m.l - m.r, height: alto - m.t - m.b, fill: "transparent" }, svg);
    capa.addEventListener("pointermove", ev => {
      const r = svg.getBoundingClientRect(), px = (ev.clientX - r.left) * ancho / r.width;
      let i = Math.round((px - sx(0)) / ((sx(x.length - 1) - sx(0)) / ((x.length - 1) || 1)));
      i = Math.max(0, Math.min(x.length - 1, i));
      guia.setAttribute("x1", sx(i)); guia.setAttribute("x2", sx(i)); guia.setAttribute("visibility", "visible");
      mostrarTip(ev, `<b>${x[i]}</b>` + series.map(s =>
        `<div><span class="viz-sw ${s.clase}"></span>${s.nombre}: <b>${formato(s.valores[i])}${unidad}</b></div>`).join(""));
    });
    capa.addEventListener("pointerleave", () => { guia.setAttribute("visibility", "hidden"); ocultarTip(); });
  }

  /* Barra apilada horizontal (Regla de Taylor). partes: [{nombre, valor, clase}] */
  function apilada(cont, partes, total) {
    cont.innerHTML = "";
    const ancho = Math.max(cont.clientWidth || 320, 260), alto = 54;
    const svg = el("svg", { viewBox: `0 0 ${ancho} ${alto}`, class: "viz" }, cont);
    const pos = partes.filter(p => p.valor > 0).reduce((s, p) => s + p.valor, 0);
    const neg = partes.filter(p => p.valor < 0).reduce((s, p) => s - p.valor, 0);
    const sx = escala(0, Math.max(pos + neg, 1), 0, ancho);
    let x = 0;
    const dibujar = (p, negativo) => {
      const w = Math.max(sx(Math.abs(p.valor)) - 2, 0);
      const r = el("rect", { x: x, y: 8, width: w, height: 36, rx: 4,
        class: negativo ? "viz-barra rayada" : `viz-barra ${p.clase}` }, svg);
      r.addEventListener("pointermove", ev => mostrarTip(ev, `${p.nombre}: <b>${p.valor.toLocaleString("es-CO", { maximumFractionDigits: 2 })} pp</b>${negativo ? " (resta)" : ""}`));
      r.addEventListener("pointerleave", ocultarTip);
      if (w > 44) el("text", { x: x + w / 2, y: 31, class: "viz-etq-barra", "text-anchor": "middle" }, svg).textContent = p.valor.toLocaleString("es-CO", { maximumFractionDigits: 1 });
      x += w + 2;
    };
    partes.filter(p => p.valor < 0).forEach(p => dibujar(p, true));
    partes.filter(p => p.valor > 0).forEach(p => dibujar(p, false));
  }

  /* Tornado: filas [{etiqueta, sube, baja, detalle}] en % */
  function tornado(cont, filas, { formato = v => v.toLocaleString("es-CO", { maximumFractionDigits: 1 }) + " %", nombres = ["Choque +", "Choque −"] } = {}) {
    cont.innerHTML = "";
    const ancho = Math.max(cont.clientWidth || 320, 280), fila = 44, m = { t: 8, l: 120, r: 54, b: 24 };
    const alto = m.t + filas.length * fila + m.b;
    const svg = el("svg", { viewBox: `0 0 ${ancho} ${alto}`, class: "viz" }, cont);
    const lim = Math.max(...filas.flatMap(f => [Math.abs(f.sube), Math.abs(f.baja)]), 0.5) * (ancho < 420 ? 1.9 : 1.4);
    const sx = escala(-lim, lim, m.l, ancho - m.r);
    el("line", { x1: sx(0), x2: sx(0), y1: m.t - 4, y2: alto - m.b + 4, class: "viz-cero" }, svg);
    filas.forEach((f, i) => {
      const y = m.t + i * fila;
      el("text", { x: m.l - 8, y: y + fila / 2 + 4, class: "viz-eje fuerte", "text-anchor": "end" }, svg).textContent = f.etiqueta;
      [[f.sube, "serie-1", nombres[0], 6], [f.baja, "serie-2", nombres[1], 22]].forEach(([v, cls, nom, dy]) => {
        const x0 = Math.min(sx(0), sx(v)), w = Math.max(Math.abs(sx(v) - sx(0)), 1.5);
        const r = el("rect", { x: x0, y: y + dy, width: w, height: 14, rx: 3, class: `viz-barra ${cls}` }, svg);
        r.addEventListener("pointermove", ev => mostrarTip(ev, `<b>${f.etiqueta}</b> · ${nom} ${f.detalle || ""}<br>Efecto: <b>${formato(v)}</b>`));
        r.addEventListener("pointerleave", ocultarTip);
        el("text", { x: v >= 0 ? sx(v) + 4 : sx(v) - 4, y: y + dy + 11, class: "viz-eje", "text-anchor": v >= 0 ? "start" : "end" }, svg).textContent = formato(v);
      });
    });
    [-lim, 0, lim].forEach(v => {
      el("text", { x: sx(v), y: alto - 6, class: "viz-eje", "text-anchor": v < 0 ? "start" : v > 0 ? "end" : "middle" }, svg)
        .textContent = v === 0 ? "0" : formato(v);
    });
  }

  /* Recta numérica para la zona de acuerdo. marcas: [{nombre, valor, clase}], zona: [a,b] o null */
  function rectaZona(cont, marcas, zona, fmt) {
    cont.innerHTML = "";
    const ancho = Math.max(cont.clientWidth || 320, 280), alto = 150, m = { l: 16, r: 16 };
    const svg = el("svg", { viewBox: `0 0 ${ancho} ${alto}`, class: "viz" }, cont);
    const vals = marcas.map(k => k.valor);
    const min = Math.min(...vals) * 0.9, max = Math.max(...vals) * 1.08;
    const sx = escala(min, max, m.l, ancho - m.r);
    el("line", { x1: m.l, x2: ancho - m.r, y1: 69, y2: 69, class: "viz-eje-linea" }, svg);
    if (zona) {
      const [a, b] = zona;
      el("rect", { x: sx(Math.min(a, b)), y: 59, width: Math.abs(sx(b) - sx(a)), height: 20, rx: 4,
                   class: a <= b ? "viz-zona ok" : "viz-zona no" }, svg);
    }
    marcas.forEach((k, i) => {
      const x = sx(k.valor), arriba = i % 2 === 0, lejos = i >= 2;
      const yT = arriba ? (lejos ? 10 : 30) : (lejos ? 142 : 122);
      el("line", { x1: x, x2: x, y1: arriba ? yT + 4 : 79, y2: arriba ? 64 : yT - 12, class: `viz-marca ${k.clase}` }, svg);
      el("circle", { cx: x, cy: 69, r: 6, class: `viz-punto ${k.clase}` }, svg);
      const t = el("text", { x, y: yT, class: "viz-etq", "text-anchor": x < 90 ? "start" : x > ancho - 90 ? "end" : "middle" }, svg);
      t.textContent = `${k.nombre}: ${fmt(k.valor)}`;
    });
  }

  global.Graficos = { lineas, apilada, tornado, rectaZona, ocultarTip };
})(window);

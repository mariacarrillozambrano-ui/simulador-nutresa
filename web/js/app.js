/* Capa 6 · Aplicación: estado, eventos y dibujo de cada pestaña. */
(function () {
  "use strict";
  const D = window.DATOS;
  const M = window.Modelo, G = window.Graficos;
  const $ = s => document.querySelector(s);
  const copia = o => JSON.parse(JSON.stringify(o));

  if (!D) { document.body.innerHTML = "<p style='padding:2rem'>Falta web/data/datos.js. Ejecuta <code>python scripts/construir.py</code>.</p>"; return; }

  /* ---------- Formato (es-CO) ---------- */
  const num = (v, d = 1) => Number(v).toLocaleString("es-CO", { minimumFractionDigits: d, maximumFractionDigits: d });
  const pct = (v, d = 1) => `${num(v, d)} %`;
  const cop = v => `$${Number(v).toLocaleString("es-CO", { maximumFractionDigits: 0 })}`;
  const signo = (v, d = 1, u = " pp") => `${v > 0 ? "+" : v < 0 ? "−" : "±"}${num(Math.abs(v), d)}${u}`;

  /* ---------- Estado ---------- */
  const NOMBRES_ESC = { ocurrio: "Lo que ocurrió", favorable: "Escenario favorable", adverso: "Escenario adverso" };
  const estado = {
    macro: copia(D.macro), p: copia(D.parametros), choques: copia(D.escenarios),
    taylorEndogeno: false, anio: 2022, precio: null,
    seleccion: ["tasa_politica", "inflacion", "trm_promedio", "crecimiento_pib"],
    escDecision: "ocurrio", anioTaylor: null,
    taylor: { inflacion: 9, neutral: 2, meta: 3, brecha: -1 },
    tab: "tablero",
  };
  const opasNutresa = D.eventos.filter(e => e.objetivo === "Nutresa" && e.precio_usd);
  function opaReferencia(anio) {
    const del = opasNutresa.filter(e => e.anio === anio);
    if (del.length) return del[0];
    const prev = opasNutresa.filter(e => e.anio < anio);
    return prev.length ? prev[prev.length - 1] : opasNutresa[0];
  }
  estado.precio = opaReferencia(estado.anio).precio_usd;

  function recalcularIndice() {
    let idx = 1;
    estado.macro.sort((a, b) => a.anio - b.anio).forEach((f, i) => { if (i) idx *= 1 + f.inflacion / 100; f.indice_precios = idx; });
  }
  const fila = anio => estado.macro.find(f => f.anio === anio);
  const choque = clave => Object.assign({}, estado.choques[clave], { tasa_por_taylor: estado.taylorEndogeno });
  function resultados(anio, precio) {
    const f = fila(anio), p = estado.p;
    return {
      ocurrio: M.evaluar(f, precio, p),
      favorable: M.evaluar(M.aplicarChoque(f, choque("favorable"), p), precio, p),
      adverso: M.evaluar(M.aplicarChoque(f, choque("adverso"), p), precio, p),
    };
  }
  const META = Object.fromEntries(D.variables.map(v => [v.variable, v]));

  /* ---------- Controles deslizantes reutilizables ---------- */
  function deslizador(cont, { etiqueta, min, max, paso, valor, formato, ayuda, alCambiar, desactivado }) {
    const div = document.createElement("div");
    div.className = "control";
    div.innerHTML = `<div class="fila"><span>${etiqueta}</span><output></output></div>
      <input type="range" min="${min}" max="${max}" step="${paso}" value="${valor}" ${desactivado ? "disabled" : ""} aria-label="${etiqueta}">
      ${ayuda ? `<div class="ayuda">${ayuda}</div>` : ""}`;
    const inp = div.querySelector("input"), out = div.querySelector("output");
    const pintar = () => (out.textContent = formato(+inp.value));
    inp.addEventListener("input", () => { pintar(); alCambiar(+inp.value); });
    pintar(); cont.appendChild(div);
    return inp;
  }

  /* ---------- Navegación ---------- */
  const PASO_A_TAB = ["tablero", "tablero", "decisiones", "escenarios", "critica"];
  function irA(tab) {
    estado.tab = tab;
    document.querySelectorAll("[role=tab]").forEach(b => b.setAttribute("aria-selected", b.dataset.tab === tab));
    document.querySelectorAll(".panel").forEach(p => (p.hidden = p.id !== tab));
    document.querySelectorAll(".pasos button").forEach((b, i) => b.classList.toggle("activo", PASO_A_TAB[i] === tab));
    render();
  }
  document.querySelectorAll("[role=tab]").forEach(b => b.addEventListener("click", () => irA(b.dataset.tab)));
  document.querySelectorAll(".pasos button").forEach(b => b.addEventListener("click", () => {
    irA(b.dataset.ir); document.querySelector("main").scrollIntoView({ behavior: "smooth" });
  }));

  /* =================== 1. TABLERO =================== */
  const VARS_TABLERO = [
    ["tasa_politica", "Tasa de política", v => pct(v, 2)], ["inflacion", "Inflación", v => pct(v, 2)],
    ["trm_promedio", "Tasa de cambio (TRM promedio)", cop], ["crecimiento_pib", "Crecimiento del PIB", v => pct(v)],
    ["embi_pbs", "Riesgo país (EMBI)", v => `${num(v, 0)} pbs`], ["brecha_producto", "Brecha del producto", v => pct(v)],
  ];
  function initTablero() {
    const cont = $("#selector-variables");
    VARS_TABLERO.forEach(([k, et]) => {
      const lab = document.createElement("label");
      lab.innerHTML = `<input type="checkbox" value="${k}" ${estado.seleccion.includes(k) ? "checked" : ""}> ${et}`;
      lab.classList.toggle("marcado", estado.seleccion.includes(k));
      lab.querySelector("input").addEventListener("change", e => {
        if (e.target.checked) estado.seleccion.push(k); else estado.seleccion = estado.seleccion.filter(x => x !== k);
        lab.classList.toggle("marcado", e.target.checked);
        renderTablero();
      });
      cont.appendChild(lab);
    });
  }
  function resumenSerie(vals, anios, fmt) {
    const iMax = vals.indexOf(Math.max(...vals)), iMin = vals.indexOf(Math.min(...vals));
    return `De ${fmt(vals[0])} en ${anios[0]} a ${fmt(vals[vals.length - 1])} en ${anios[anios.length - 1]}. ` +
           `Máximo ${fmt(vals[iMax])} (${anios[iMax]}), mínimo ${fmt(vals[iMin])} (${anios[iMin]}).`;
  }
  function renderTablero() {
    const n = estado.seleccion.length;
    $("#aviso-variables").textContent = n < 3 ? "La guía pide elegir entre tres y cuatro variables." :
      n > 4 ? "Llevas más de cuatro: concéntrate en las que más pesaron." : "";
    const anios = estado.macro.map(f => f.anio);
    const cont = $("#multiples"); cont.innerHTML = "";
    VARS_TABLERO.filter(([k]) => estado.seleccion.includes(k)).forEach(([k, et, fmt]) => {
      const vals = estado.macro.map(f => f[k]), meta = META[k] || {};
      const card = document.createElement("div");
      card.className = "tarjeta mini";
      card.innerHTML = `<h3>${et}</h3><p class="resumen">${resumenSerie(vals, anios, fmt)}</p><div class="grafico"></div>
        <div class="fuente"><span class="calidad ${meta.calidad || ""}">${meta.calidad || ""}</span>Fuente: ${meta.fuente || "—"}. ${meta.nota || ""}</div>`;
      cont.appendChild(card);
      G.lineas(card.querySelector(".grafico"), { x: anios, series: [{ nombre: et, valores: vals, clase: "serie-1" }],
        formato: k === "trm_promedio" ? v => num(v, 0) : k === "embi_pbs" ? v => num(v, 0) : v => num(v, 1),
        unidad: k === "trm_promedio" ? " COP" : k === "embi_pbs" ? " pbs" : " %", alto: 190 });
    });
    const lt = $("#linea-tiempo"); lt.innerHTML = "";
    D.eventos.forEach(e => {
      const f = fila(e.anio);
      const d = document.createElement("div");
      d.className = "hito";
      d.innerHTML = `<span class="fecha">${e.fecha} · ${e.objetivo}</span><b>${e.evento}</b>
        ${e.precio_usd ? `<span class="precio">USD ${num(e.precio_usd, 2)} ≈ ${cop(e.precio_usd * f.trm_promedio)}</span>` : ""}
        <div class="nota" style="margin:4px 0 0">${e.nota}</div>${e.verificar ? '<span class="verificar">verificar</span>' : ""}`;
      lt.appendChild(d);
    });
  }

  /* =================== 2. TAYLOR =================== */
  const tc = {};
  function initTaylor() {
    const c = $("#controles-taylor");
    tc.inflacion = deslizador(c, { etiqueta: "Inflación", min: 0, max: 20, paso: 0.01, valor: estado.taylor.inflacion, formato: v => pct(v, 2), alCambiar: v => { estado.taylor.inflacion = v; estado.anioTaylor = null; renderTaylor(); } });
    tc.neutral = deslizador(c, { etiqueta: "Tasa real neutral", min: 0, max: 5, paso: 0.1, valor: estado.taylor.neutral, formato: v => pct(v), alCambiar: v => { estado.taylor.neutral = v; estado.anioTaylor = null; renderTaylor(); } });
    tc.meta = deslizador(c, { etiqueta: "Meta", min: 1, max: 6, paso: 0.5, valor: estado.taylor.meta, formato: v => pct(v), alCambiar: v => { estado.taylor.meta = v; estado.anioTaylor = null; renderTaylor(); } });
    tc.brecha = deslizador(c, { etiqueta: "Brecha del producto", min: -6, max: 6, paso: 0.1, valor: estado.taylor.brecha, formato: v => pct(v), alCambiar: v => { estado.taylor.brecha = v; estado.anioTaylor = null; renderTaylor(); } });
    const cp = $("#controles-pesos");
    deslizador(cp, { etiqueta: "Peso de (inflación − meta)", min: 0, max: 1.5, paso: 0.05, valor: estado.p.peso_inflacion, formato: v => num(v, 2), ayuda: "Taylor (1993) usa 0,5", alCambiar: v => { estado.p.peso_inflacion = v; render(); } });
    deslizador(cp, { etiqueta: "Peso de la brecha", min: 0, max: 1.5, paso: 0.05, valor: estado.p.peso_brecha, formato: v => num(v, 2), ayuda: "Más peso = banco más atento al empleo", alCambiar: v => { estado.p.peso_brecha = v; render(); } });

    const ba = $("#btn-anios");
    estado.macro.forEach(f => {
      const b = document.createElement("button"); b.className = "btn"; b.textContent = f.anio;
      b.addEventListener("click", () => cargarAnioTaylor(f.anio)); ba.appendChild(b);
    });
    $("#btn-ejemplo").addEventListener("click", verEjemplo);
    const ley = $("#leyenda-taylor");
    ley.innerHTML = [["serie-1", "inflación"], ["serie-2", "tasa real neutral"], ["serie-3", "½ (inflación − meta)"], ["serie-4", "½ (brecha)"], ["rayada", "término negativo"]]
      .map(([c, t]) => `<span><i class="viz-sw ${c}"></i>${t}</span>`).join("");
  }
  function fijarTaylor(v) {
    Object.assign(estado.taylor, v);
    for (const k in tc) { tc[k].value = estado.taylor[k]; tc[k].dispatchEvent(new Event("input")); }
  }
  function cargarAnioTaylor(anio) {
    const f = fila(anio);
    fijarTaylor({ inflacion: f.inflacion, neutral: f.tasa_real_neutral, meta: f.meta_inflacion, brecha: f.brecha_producto });
    estado.anioTaylor = anio; renderTaylor();
  }
  function verEjemplo() {
    estado.anioTaylor = null;
    const ids = ["#f-inf", "#f-neu", "#f-gap", "#f-bre", "#f-tasa"];
    fijarTaylor({ inflacion: 9, neutral: 2, meta: 3, brecha: -1 });
    ids.forEach(i => ($(i).textContent = "—"));
    const t = M.reglaTaylor(9, 2, 3, -1, estado.p);
    const vals = [pct(9, 0), pct(2, 0), `½ (9 % − 3 %) = ${pct(t.termino_inflacion)}`, `½ (−1 %) = ${pct(t.termino_brecha)}`, pct(t.tasa)];
    ids.forEach((i, k) => setTimeout(() => {
      $(i).textContent = vals[k]; $(i).parentElement.classList.remove("pulso"); void $(i).offsetWidth; $(i).parentElement.classList.add("pulso");
    }, 450 * (k + 1)));
    setTimeout(renderTaylor, 450 * 6);
  }
  function renderTaylor() {
    const v = estado.taylor, t = M.reglaTaylor(v.inflacion, v.neutral, v.meta, v.brecha, estado.p);
    $("#f-inf").textContent = pct(v.inflacion, 2); $("#f-neu").textContent = pct(v.neutral);
    $("#f-gap").textContent = pct(t.termino_inflacion, 2); $("#f-bre").textContent = pct(t.termino_brecha, 2);
    $("#f-tasa").textContent = pct(t.tasa, 2);
    const pi = estado.p.peso_inflacion === 0.5 ? "½" : num(estado.p.peso_inflacion, 2) + "·", py = estado.p.peso_brecha === 0.5 ? "½" : num(estado.p.peso_brecha, 2) + "·";
    $("#f-texto").textContent = `${estado.anioTaylor ? estado.anioTaylor + ": " : "Ejemplo: "}${pct(v.inflacion, 2)} + ${pct(v.neutral)} + ${pi}(${pct(v.inflacion, 2)} − ${pct(v.meta)}) + ${py}(${pct(v.brecha)}) = ${pct(t.tasa, 2)}`;
    document.querySelectorAll("#btn-anios .btn").forEach(b => b.classList.toggle("activo", +b.textContent === estado.anioTaylor));
    $("#t-resultado").textContent = pct(t.tasa, 2);
    $("#t-real").textContent = pct(t.tasa - v.inflacion, 2);
    G.apilada($("#barra-taylor"), [
      { nombre: "Inflación", valor: v.inflacion, clase: "serie-1" }, { nombre: "Tasa real neutral", valor: v.neutral, clase: "serie-2" },
      { nombre: "½ (inflación − meta)", valor: t.termino_inflacion, clase: "serie-3" }, { nombre: "½ (brecha)", valor: t.termino_brecha, clase: "serie-4" }]);
    let lectura;
    if (estado.anioTaylor) {
      const f = fila(estado.anioTaylor), dif = f.tasa_politica - t.tasa;
      lectura = `En ${estado.anioTaylor} BanRep cerró con ${pct(f.tasa_politica, 2)}; la regla sugería ${pct(t.tasa, 2)}. ` +
        (Math.abs(dif) < 0.75 ? "La política estuvo prácticamente alineada con la regla." :
         dif < 0 ? `La tasa observada estuvo ${num(-dif)} pp por debajo: política más laxa que la regla (tasa real ex post ${pct(f.tasa_politica - f.inflacion)}). Financiarse era barato en términos reales.` :
                   `La tasa observada estuvo ${num(dif)} pp por encima: política más restrictiva que la regla, encareciendo la financiación de cualquier OPA.`);
    } else {
      lectura = t.tasa - v.inflacion > v.neutral
        ? `Con inflación por encima de la meta y/o brecha positiva, la regla pide una tasa real de ${pct(t.tasa - v.inflacion)}, mayor que la neutral: política contractiva.`
        : `La regla pide una tasa real de ${pct(t.tasa - v.inflacion)}, igual o menor que la neutral: política neutral o expansiva.`;
    }
    $("#t-lectura").textContent = lectura;
    const serie = estado.macro.map(f => ({ f, t: M.reglaTaylor(f.inflacion, f.tasa_real_neutral, f.meta_inflacion, f.brecha_producto, estado.p) }));
    G.lineas($("#grafico-taylor-hist"), { x: serie.map(s => s.f.anio), series: [
      { nombre: "BanRep", valores: serie.map(s => s.f.tasa_politica), clase: "serie-1" },
      { nombre: "Taylor", valores: serie.map(s => s.t.tasa), clase: "serie-2", punteada: true }], unidad: " %" });
    $("#tabla-taylor").innerHTML = `<table><thead><tr><th>Año</th><th class="num">Inflación</th><th class="num">Brecha</th><th class="num">Taylor</th><th class="num">BanRep</th><th class="num">Diferencia</th><th class="num">Tasa real ex post</th></tr></thead><tbody>${
      serie.map(({ f, t }) => `<tr><td>${f.anio}</td><td class="num">${pct(f.inflacion, 2)}</td><td class="num">${pct(f.brecha_producto)}</td><td class="num">${pct(t.tasa, 2)}</td><td class="num">${pct(f.tasa_politica, 2)}</td><td class="num">${signo(f.tasa_politica - t.tasa)}</td><td class="num">${pct(f.tasa_politica - f.inflacion, 2)}</td></tr>`).join("")}</tbody></table>`;
  }

  /* =================== 3. ESCENARIOS =================== */
  const CTRL_CHOQUE = [
    ["d_tasa", "Δ Tasa de política", -6, 6, 0.25, v => signo(v, 2), "Puntos porcentuales"],
    ["d_inflacion", "Δ Inflación", -6, 6, 0.1, v => signo(v), "Puntos porcentuales"],
    ["d_trm_pct", "Δ Tasa de cambio", -25, 25, 1, v => signo(v, 0, " %"), "+ = peso más débil (devaluación)"],
    ["d_crecimiento", "Δ Crecimiento PIB", -5, 5, 0.1, v => signo(v), "También mueve la brecha 1:1"],
    ["d_embi", "Δ Riesgo país", -200, 300, 10, v => signo(v, 0, " pbs"), "Prima de riesgo (EMBI)"],
  ];
  const inputsChoque = { favorable: {}, adverso: {} };
  function initEscenarios() {
    const sa = $("#esc-anio"), so = $("#esc-opa"), sc = $("#crit-anio");
    estado.macro.forEach(f => { sa.add(new Option(f.anio, f.anio)); sc.add(new Option(f.anio, f.anio)); });
    sa.value = sc.value = estado.anio;
    opasNutresa.forEach(e => so.add(new Option(`${e.evento} · USD ${num(e.precio_usd, 2)}`, e.precio_usd)));
    so.value = estado.precio;
    const cambiarAnio = v => { estado.anio = +v; estado.precio = opaReferencia(estado.anio).precio_usd; sa.value = sc.value = v; so.value = estado.precio; render(); };
    sa.addEventListener("change", e => cambiarAnio(e.target.value));
    sc.addEventListener("change", e => cambiarAnio(e.target.value));
    so.addEventListener("change", e => { estado.precio = +e.target.value; render(); });
    $("#esc-taylor").addEventListener("change", e => {
      estado.taylorEndogeno = e.target.checked;
      ["favorable", "adverso"].forEach(k => (inputsChoque[k].d_tasa.disabled = e.target.checked));
      render();
    });
    ["favorable", "adverso"].forEach(k => {
      const c = $(`#ctrl-${k}`);
      CTRL_CHOQUE.forEach(([campo, et, mi, ma, pa, fmt, ay]) => {
        inputsChoque[k][campo] = deslizador(c, { etiqueta: et, min: mi, max: ma, paso: pa, valor: estado.choques[k][campo], formato: fmt, ayuda: ay,
          alCambiar: v => { estado.choques[k][campo] = v; render(); } });
      });
    });
    $("#btn-csv").addEventListener("click", descargarCSV);
    $("#btn-copiar").addEventListener("click", () => {
      const t = tablaPlantilla().map(r => r.join("\t")).join("\n");
      navigator.clipboard?.writeText(t).then(() => ($("#btn-copiar").textContent = "¡Copiada!"));
      setTimeout(() => ($("#btn-copiar").textContent = "Copiar tabla"), 1500);
    });
  }
  const FILAS_PLANTILLA = [
    ["Tasa de política", "dato", r => pct(r.entorno.tasa_politica, 2), r => r.entorno.tasa_politica, "pp"],
    ["Inflación", "dato", r => pct(r.entorno.inflacion, 2), r => r.entorno.inflacion, "pp"],
    ["Tasa de cambio (TRM)", "dato", r => cop(r.entorno.trm_promedio), r => r.entorno.trm_promedio, "%"],
    ["Crecimiento PIB", "dato", r => pct(r.entorno.crecimiento_pib), r => r.entorno.crecimiento_pib, "pp"],
    ["Riesgo país (EMBI)", "dato", r => `${num(r.entorno.embi_pbs, 0)} pbs`, r => r.entorno.embi_pbs, "pbs"],
    ["Costo de financiación (Kd)", "efecto", r => pct(r.valoracion.kd), r => r.valoracion.kd, "pp"],
    ["WACC", "efecto", r => pct(r.valoracion.wacc), r => r.valoracion.wacc, "pp"],
    ["Valor fundamental por acción", "efecto", r => cop(r.valoracion.valor_accion), r => r.valoracion.valor_accion, "%"],
    ["Precio OPA en pesos", "efecto", r => cop(r.precio_opa_cop), r => r.precio_opa_cop, "%"],
    ["Prima OPA vs. valor", "efecto", r => signo(r.prima_opa, 0, " %"), r => r.prima_opa, "pp"],
    ["Resultado del juego", "efecto", r => r.juego.resultado, null, null],
  ];
  function textoEfecto(b, e) {
    const dv = (e.valoracion.valor_accion / b.valoracion.valor_accion - 1) * 100, dk = e.valoracion.kd - b.valoracion.kd;
    return `Kd ${dk >= 0 ? "sube" : "baja"} ${num(Math.abs(dk))} pp y el valor por acción ${dv >= 0 ? "sube" : "cae"} ${num(Math.abs(dv), 0)} %. ` +
      `La OPA queda ${e.prima_opa >= 0 ? "con prima" : "con descuento"} de ${num(Math.abs(e.prima_opa), 0)} % frente al valor; ` +
      (e.juego.zona.existe ? "existe zona de acuerdo → la venta es racional para el GEA." : "no hay zona de acuerdo → lo racional es bloquear.") +
      (e.juego.resultado !== b.juego.resultado ? ` El resultado del juego cambia frente a lo ocurrido.` : "");
  }
  function tablaPlantilla() {
    const R = resultados(estado.anio, estado.precio);
    const filas = [["Variable", NOMBRES_ESC.ocurrio, NOMBRES_ESC.favorable, NOMBRES_ESC.adverso]];
    FILAS_PLANTILLA.forEach(([et, , f]) => filas.push([et, f(R.ocurrio), f(R.favorable), f(R.adverso)]));
    filas.push(["Efecto en las decisiones", "Referencia: dato del tablero", textoEfecto(R.ocurrio, R.favorable), textoEfecto(R.ocurrio, R.adverso)]);
    return filas;
  }
  function descargarCSV() {
    const csv = tablaPlantilla().map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(";")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv" }));
    a.download = `plantilla_escenarios_${estado.anio}.csv`; a.click();
  }
  function renderEscenarios() {
    const R = resultados(estado.anio, estado.precio), cols = ["ocurrio", "favorable", "adverso"];
    let h = `<table class="plantilla"><thead><tr><th class="c-var">Variable</th>${cols.map(c => `<th class="c-${c}">${NOMBRES_ESC[c]}</th>`).join("")}</tr></thead><tbody>`;
    FILAS_PLANTILLA.forEach(([et, tipo, f, raw, u], i) => {
      h += `<tr class="${i === 5 ? "sep" : ""}"><td>${et}</td>` + cols.map(c => {
        let chip;
        if (tipo === "dato") chip = c === "ocurrio" ? '<span class="chip dato">Dato</span>' : '<span class="chip supuesto">Supuesto</span>';
        else chip = '<span class="chip efecto">Modelo</span>';
        let delta = "";
        if (c !== "ocurrio" && raw) {
          const a = raw(R.ocurrio), b = raw(R[c]);
          delta = `<span class="delta-celda">${u === "%" ? signo((b / a - 1) * 100, 1, " %") : u === "pbs" ? signo(b - a, 0, " pbs") : signo(b - a)} vs. ocurrió</span>`;
        }
        return `<td>${chip}<span class="valor-celda">${f(R[c])}</span>${delta}</td>`;
      }).join("") + "</tr>";
    });
    h += `<tr class="analisis"><td>Efecto en las decisiones</td><td><span class="chip analisis">Tu análisis</span>Escenario de referencia: lo que mostró el tablero en ${estado.anio}.</td>` +
         ["favorable", "adverso"].map(c => `<td><span class="chip analisis">Tu análisis</span>${textoEfecto(R.ocurrio, R[c])}</td>`).join("") + "</tr>";
    $("#plantilla").innerHTML = h + "</tbody></table>";
  }

  /* =================== 4. DECISIONES =================== */
  const tk = v => num(v / 1000, 1);
  function initDecisiones() {
    const g = $("#dec-escenario");
    ["ocurrio", "favorable", "adverso"].forEach(k => {
      const b = document.createElement("button"); b.className = "btn"; b.dataset.k = k; b.textContent = NOMBRES_ESC[k];
      b.addEventListener("click", () => { estado.escDecision = k; render(); }); g.appendChild(b);
    });
    const c = $("#controles-juego"), p = estado.p;
    [["prima_control", "Prima de control (oferente)", 0, 60, 1, "%", "Cuánto vale el control para Gilinski/IHC"],
     ["beneficio_privado", "Beneficio privado (GEA)", 0, 40, 1, "%", "Lo que pierde el GEA si cede el control"],
     ["asimetria_info", "Asimetría de información", 0, 50, 1, "%", "Cuánto más cree el GEA que vale Nutresa"],
     ["costo_defensa", "Costo de defensa (GEA)", 0, 10, 0.5, "%", "Litigios, enroque, desgaste"],
     ["alza_oferta", "Alza en «Subir oferta»", 0, 50, 1, "%", "Incremento del precio"],
     ["plazo_financiacion", "Plazo de financiación", 0, 2, 0.1, " años", "Tiempo que se paga Kd"],
     ["costo_oferta", "Costo de OPA fallida", 0, 10, 0.5, "%", "Para el oferente"],
     ["fcf_por_accion", "Flujo de caja por acción 2021", 1000, 4000, 50, " COP", "Supuesto de valoración"]]
      .forEach(([k, et, mi, ma, pa, u, ay]) => deslizador(c, { etiqueta: et, min: mi, max: ma, paso: pa, valor: p[k],
        formato: v => (u === " COP" ? cop(v) : num(v, pa < 1 ? 1 : 0) + u), ayuda: ay, alCambiar: v => { estado.p[k] = v; render(); } }));
  }
  function renderDecisiones() {
    document.querySelectorAll("#dec-escenario .btn").forEach(b => b.classList.toggle("activo", b.dataset.k === estado.escDecision));
    const R = resultados(estado.anio, estado.precio), r = R[estado.escDecision], b = R.ocurrio, v = r.valoracion;
    $("#dec-contexto").textContent = `Año ${estado.anio} · OPA USD ${num(estado.precio, 2)} (cámbialos en «Escenarios»)`;
    const d = (x, y, u = "pp", inv) => estado.escDecision === "ocurrio" ? "" :
      `<span class="delta ${Math.abs(x - y) < 1e-9 ? "neutro" : (x > y) !== !!inv ? "sube" : "baja"}">${u === "%" ? signo((x / y - 1) * 100, 1, " %") : signo(x - y)}</span>`;
    $("#cadena").innerHTML = [
      ["Tasa de política", pct(r.entorno.tasa_politica, 2), d(r.entorno.tasa_politica, b.entorno.tasa_politica), "Decisión de BanRep"],
      ["Tasa larga (TES)", pct(v.tasa_larga), d(v.tasa_larga, b.valoracion.tasa_larga), `Transmisión ${num(estado.p.transmision * 100, 0)} % + prima de plazo`],
      ["Costo de financiación", `Kd ${pct(v.kd)}`, d(v.kd, b.valoracion.kd), `Ke ${pct(v.ke)} · WACC ${pct(v.wacc)}`],
      ["Valor por acción", cop(v.valor_accion), d(v.valor_accion, b.valoracion.valor_accion, "%", true), `g = ${pct(v.g)} · ${num(v.valor_empresa_billones, 1)} billones`],
      ["OPA vs. valor", signo(r.prima_opa, 0, " %"), "", `OPA ${cop(r.precio_opa_cop)} (USD ${num(r.precio_opa_usd, 2)} × ${cop(r.entorno.trm_promedio)})`],
    ].map(([t, val, dl, det]) => `<div class="eslabon"><small>${t}</small><b>${val}</b>${dl}<div class="detalle">${det}</div></div>`).join("");

    const J = r.juego, m = J.matriz, eO = ["Subir oferta", "Mantener oferta"], eD = ["Vender", "Retener"];
    const esNash = (i, j) => J.nash.some(([a, c]) => a === i && c === j);
    let h = `<div class="matriz tabla-scroll"><table><thead><tr><th>Gilinski/IHC \\ GEA</th>${eD.map(x => `<th>${x}</th>`).join("")}</tr></thead><tbody>`;
    m.forEach((filaM, i) => {
      h += `<tr><th>${eO[i]}<span class="etiqueta-celda">${cop(r.precio_opa_cop * (i === 0 ? 1 + estado.p.alza_oferta / 100 : 1))}</span></th>` +
        filaM.map((c, j) => `<td class="${esNash(i, j) ? "nash" : ""} ${J.secuencial[0] === i && J.secuencial[1] === j ? "ruta" : ""}">(<span class="pago-o">${tk(c[0])}</span>, <span class="pago-d">${tk(c[1])}</span>)${esNash(i, j) ? '<span class="etiqueta-celda">Nash</span>' : ""}${J.secuencial[0] === i && J.secuencial[1] === j ? '<span class="etiqueta-celda">Secuencial</span>' : ""}</td>`).join("") + "</tr>";
    });
    $("#matriz").innerHTML = h + "</tbody></table></div>";
    const resp = J.respuestas;
    $("#lectura-juego").innerHTML = `Si Gilinski sube la oferta, al GEA le conviene <b>${eD[resp[0]].toLowerCase()}</b>; si la mantiene, <b>${eD[resp[1]].toLowerCase()}</b>. ` +
      `Anticipando eso, el oferente elige <b>${eO[J.secuencial[0]].toLowerCase()}</b> → resultado: <b>${J.resultado}</b>. ` +
      `${J.nash.length ? `Equilibrio(s) de Nash: ${J.nash.map(([a, c]) => `${eO[a]}/${eD[c]}`).join("; ")}.` : "No hay equilibrio de Nash en estrategias puras."}`;

    const z = J.zona;
    G.rectaZona($("#zona"), [
      { nombre: "Reserva GEA", valor: z.reserva_gea, clase: "serie-2" }, { nombre: "Máx. oferente", valor: z.maximo_oferente, clase: "serie-1" },
      { nombre: "OPA", valor: r.precio_opa_cop, clase: "serie-3" }, { nombre: "Valor modelo", valor: v.valor_accion, clase: "serie-4" }],
      [z.reserva_gea, z.maximo_oferente], cop);
    $("#lectura-zona").innerHTML = z.existe
      ? `Hay zona de acuerdo de ${cop(z.holgura)} por acción: un precio entre ${cop(z.reserva_gea)} y ${cop(z.maximo_oferente)} deja a ambos mejor que el bloqueo.`
      : `No hay zona de acuerdo: el GEA exige al menos ${cop(z.reserva_gea)} y el oferente puede pagar como máximo ${cop(z.maximo_oferente)} (brecha ${cop(-z.holgura)}). ` +
        `Con más asimetría de información o más beneficio privado, la brecha crece; un Kd menor le permite al oferente pagar más, pero también sube el valor que exige el GEA.`;

    const venderGEA = J.secuencial[1] === 0;
    $("#actores").innerHTML = [
      ["Gilinski / IHC (oferente)", `Financia la compra a Kd ≈ ${pct(v.kd)} durante ${num(estado.p.plazo_financiacion, 1)} años. Paga en USD: una TRM más alta abarata su oferta en dólares frente al valor en pesos.`,
        J.secuencial[0] === 0 ? "Le conviene subir la oferta" : "Le conviene mantener la oferta", ""],
      ["GEA (Sura, Argos)", `Compara la OPA con su valor percibido (${cop(v.valor_accion * (1 + estado.p.asimetria_info / 100))}) más el beneficio privado de control. ${J.beneficio_umbral < 0 ? "Incluso sin beneficio privado, esta OPA está por debajo de lo que cree que vale Nutresa." : `Rechaza si su beneficio privado de control supera ${pct(J.beneficio_umbral, 0)}.`}`,
        venderGEA ? "Vender" : "Retener (bloquear)", venderGEA ? "vende" : "retiene"],
      ["Minoritarios y fondos de pensiones", `Sin beneficio de control: comparan precio OPA (${cop(r.precio_opa_cop)}) con valor fundamental (${cop(v.valor_accion)}). Los fondos tienen deber fiduciario con sus afiliados.`,
        J.minoritarios_aceptan ? "Aceptan la OPA" : "No aceptan", J.minoritarios_aceptan ? "vende" : "retiene"],
      ["Banco de la República / entorno", `Tasa ${pct(r.entorno.tasa_politica, 2)} vs. Taylor ${pct(r.taylor.tasa, 2)}. Riesgo país ${num(r.entorno.embi_pbs, 0)} pbs. Fija el costo de oportunidad de todos.`,
        r.entorno.tasa_politica < r.taylor.tasa ? "Política más laxa que la regla" : "Política más restrictiva que la regla", ""],
    ].map(([t, txt, dec, cls]) => `<div class="actor"><b>${t}</b>${txt}<div class="decision ${cls}">→ ${dec}</div></div>`).join("");
  }

  /* =================== 5. VARIABLE CRÍTICA =================== */
  function renderCritica() {
    $("#crit-anio").value = estado.anio;
    const s = M.sensibilidad(estado.macro, estado.anio, estado.precio, estado.p);
    const det = x => `(±${num(x.choque, x.unidad === "pbs" ? 0 : 1)} ${x.unidad})`;
    G.tornado($("#tornado-valor"), s.map(x => ({ etiqueta: x.etiqueta, sube: x.valor_sube, baja: x.valor_baja, detalle: det(x) })));
    const so = [...s].sort((a, b) => Math.max(Math.abs(b.opa_sube), Math.abs(b.opa_baja)) - Math.max(Math.abs(a.opa_sube), Math.abs(a.opa_baja)));
    G.tornado($("#tornado-opa"), so.map(x => ({ etiqueta: x.etiqueta, sube: x.opa_sube, baja: x.opa_baja, detalle: det(x) })), { formato: v => signo(v, 1, " pp") });
    const top = s[0], topOpa = so[0];
    $("#conclusion").innerHTML = `<p>Para ${estado.anio}, con choques de tamaño histórico:</p><ol>${s.slice(0, 3).map(x =>
      `<li><b>${x.etiqueta}</b> ${det(x)}: el valor por acción se mueve entre ${signo(Math.min(x.valor_sube, x.valor_baja), 1, " %")} y ${signo(Math.max(x.valor_sube, x.valor_baja), 1, " %")}.</li>`).join("")}</ol>
      <p>La variable que más mueve la <b>valoración</b> es <b>${top.etiqueta.toLowerCase()}</b>; la que más cambia el <b>atractivo de la OPA</b> frente al valor es <b>${topOpa.etiqueta.toLowerCase()}</b>.
      ${top.variable === topOpa.variable ? "Coinciden: es una candidata fuerte a variable crítica." : "No coinciden: argumenta cuál pesó más en la decisión (¿el costo de financiar o el precio en pesos de la oferta?)."}</p>`;
  }

  /* =================== 6. SUPUESTOS =================== */
  const AYUDA_P = {
    peso_inflacion: ["Peso (inflación − meta)", "Regla de Taylor"], peso_brecha: ["Peso brecha", "Regla de Taylor"],
    prima_plazo: ["Prima de plazo (pp)", "Tasa larga sobre neutral nominal"], transmision: ["Transmisión tasa corta → larga", "0 = nada, 1 = total"],
    beta: ["Beta de Nutresa", "Riesgo sistemático"], prima_mercado: ["Prima de mercado (pp)", "CAPM"],
    spread_credito: ["Spread de crédito (pp)", "Kd sobre tasa larga"], tasa_impuesto: ["Impuesto de renta (%)", "Escudo fiscal"],
    peso_deuda: ["Deuda / (Deuda + Patrimonio) %", "Estructura de capital"], fcf_por_accion: ["Flujo de caja por acción 2021 (COP)", "SUPUESTO ilustrativo"],
    crecimiento_real_lp: ["Crecimiento real LP (%)", "Gordon"], persistencia_inflacion: ["Persistencia de inflación", "Desvío que pasa a expectativas"],
    crecimiento_potencial: ["PIB potencial (%)", "Ciclo"], elasticidad_fcf_pib: ["Elasticidad flujo–PIB", "Ciclo"],
    exposicion_cambiaria: ["Exposición cambiaria neta", "Ventas externas − insumos importados"], trm_referencia: ["TRM de referencia", "Promedio 2021"],
    prima_control: ["Prima de control (%)", "Juego"], beneficio_privado: ["Beneficio privado GEA (%)", "Juego"],
    asimetria_info: ["Asimetría de información (%)", "Juego"], costo_defensa: ["Costo de defensa (%)", "Juego"],
    costo_oferta: ["Costo OPA fallida (%)", "Juego"], plazo_financiacion: ["Plazo de financiación (años)", "Juego"], alza_oferta: ["Alza de la oferta (%)", "Juego"],
  };
  const COLS_MACRO = [["tasa_politica", "Tasa política"], ["inflacion", "Inflación"], ["meta_inflacion", "Meta"], ["tasa_real_neutral", "r neutral"],
    ["brecha_producto", "Brecha"], ["crecimiento_pib", "PIB"], ["trm_promedio", "TRM prom."], ["trm_cierre", "TRM cierre"], ["embi_pbs", "EMBI"]];
  function renderSupuestos() {
    $("#tabla-macro").innerHTML = `<table><thead><tr><th>Año</th>${COLS_MACRO.map(([, e]) => `<th class="num">${e}</th>`).join("")}</tr></thead><tbody>${
      estado.macro.map(f => `<tr><td>${f.anio}</td>${COLS_MACRO.map(([k]) => `<td class="num"><input type="number" step="any" data-anio="${f.anio}" data-k="${k}" value="${f[k]}"></td>`).join("")}</tr>`).join("")}</tbody></table>`;
    document.querySelectorAll("#tabla-macro input").forEach(i => i.addEventListener("change", e => {
      const f = fila(+e.target.dataset.anio); f[e.target.dataset.k] = +e.target.value; recalcularIndice(); actualizarSello();
    }));
    $("#tabla-param").innerHTML = Object.keys(estado.p).map(k => `<div class="param"><label>${(AYUDA_P[k] || [k])[0]}</label>
      <input type="number" step="any" data-p="${k}" value="${estado.p[k]}"><div class="ayuda">${(AYUDA_P[k] || ["", ""])[1]}</div></div>`).join("");
    document.querySelectorAll("#tabla-param input").forEach(i => i.addEventListener("change", e => { estado.p[e.target.dataset.p] = +e.target.value; actualizarSello(); }));
    $("#tabla-fuentes").innerHTML = `<table><thead><tr><th>Variable</th><th>Unidad</th><th>Fuente</th><th>Calidad</th><th>Nota</th></tr></thead><tbody>${
      D.variables.map(v => `<tr><td>${v.etiqueta}</td><td>${v.unidad}</td><td>${v.fuente}</td><td><span class="calidad ${v.calidad}">${v.calidad}</span></td><td>${v.nota}</td></tr>`).join("")}</tbody></table>`;
  }
  $("#btn-restaurar").addEventListener("click", () => {
    estado.macro = copia(D.macro); estado.p = copia(D.parametros); estado.choques = copia(D.escenarios); location.reload();
  });

  /* ---------- Sello de verificación Python ↔ JS ---------- */
  function actualizarSello() {
    const s = $("#sello");
    const igual = JSON.stringify(estado.macro.map(({ indice_precios, ...r }) => r)) === JSON.stringify(D.macro.map(({ indice_precios, ...r }) => r)) &&
                  JSON.stringify(estado.p) === JSON.stringify(D.parametros);
    if (!igual) { s.className = "sello"; s.textContent = "Datos o supuestos editados en el navegador"; return; }
    const ok = M.verificar(D);
    s.className = "sello " + (ok ? "ok" : "error");
    s.textContent = ok ? "✓ Modelo web = modelo Python" : "✗ El modelo web no coincide con Python";
  }

  /* ---------- Render ---------- */
  function render() {
    G.ocultarTip();
    ({ tablero: renderTablero, taylor: renderTaylor, escenarios: renderEscenarios, decisiones: renderDecisiones,
       critica: renderCritica, supuestos: renderSupuestos })[estado.tab]();
    if (estado.tab !== "supuestos") actualizarSello();
  }
  let rz; window.addEventListener("resize", () => { clearTimeout(rz); rz = setTimeout(render, 150); });

  $("#origen").textContent = `Datos: ${D.origen} · generado ${D.generado.replace("T", " ")}`;
  recalcularIndice();
  initTablero(); initTaylor(); initEscenarios(); initDecisiones();
  irA("tablero");
})();

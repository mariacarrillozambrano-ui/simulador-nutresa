/* Capa 5a · Modelo en JavaScript.
 * Espejo exacto de src/nutresa_sim (taylor.py, finanzas.py, juegos.py, escenarios.py)
 * para que el HTML recalcule en vivo al mover los controles. Al cargar, se
 * compara contra los casos de control que exporta Python (DATOS.control).
 */
(function (global) {
  "use strict";
  const ACCIONES = 457995960;

  function reglaTaylor(inflacion, neutral, meta, brecha, p) {
    const ti = p.peso_inflacion * (inflacion - meta);
    const tb = p.peso_brecha * brecha;
    return { inflacion, tasa_real_neutral: neutral, termino_inflacion: ti, termino_brecha: tb,
             tasa: inflacion + neutral + ti + tb };
  }

  function costoCapital(tasa, embi, neutral, meta, p) {
    const nn = neutral + meta;
    const larga = nn + p.prima_plazo + p.transmision * (tasa - nn);
    const ke = larga + embi / 100 + p.beta * p.prima_mercado;
    const kd = larga + p.spread_credito;
    const kdNeto = kd * (1 - p.tasa_impuesto / 100);
    const wd = p.peso_deuda / 100;
    return { tasa_larga: larga, ke, kd, kd_neto: kdNeto, wacc: wd * kdNeto + (1 - wd) * ke };
  }

  function valoracion(f, p) {
    const cc = costoCapital(f.tasa_politica, f.embi_pbs, f.tasa_real_neutral, f.meta_inflacion, p);
    const piE = f.meta_inflacion + p.persistencia_inflacion * (f.inflacion - f.meta_inflacion);
    const g = (1 + p.crecimiento_real_lp / 100) * (1 + piE / 100) - 1;
    const ciclo = 1 + p.elasticidad_fcf_pib * (f.crecimiento_pib - p.crecimiento_potencial) / 100;
    const cambio = 1 + p.exposicion_cambiaria * (f.trm_promedio / p.trm_referencia - 1);
    const fcf = p.fcf_por_accion * (f.indice_precios ?? 1) * ciclo * cambio;
    const margen = Math.max(cc.wacc / 100 - g, 0.01);
    const valor = fcf * (1 + g) / margen;
    return Object.assign(cc, { inflacion_esperada: piE, g: g * 100, fcf, valor_accion: valor,
                               valor_empresa_billones: valor * ACCIONES / 1e12 });
  }

  function matrizPagos(valor, precio, kd, p) {
    const c = p.prima_control / 100, b = p.beneficio_privado / 100,
          d = p.costo_defensa / 100, f = p.costo_oferta / 100;
    const vG = valor * (1 + p.asimetria_info / 100);
    return [precio * (1 + p.alza_oferta / 100), precio].map(pr => {
      const fin = pr * kd / 100 * p.plazo_financiacion;
      return [[valor * (1 + c) - pr - fin, pr - vG * (1 + b)], [-f * pr, -d * vG]];
    });
  }

  function analizarJuego(valor, precio, kd, p) {
    const m = matrizPagos(valor, precio, kd, p);
    const nash = [];
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
      if (m[i][j][0] >= m[1 - i][j][0] && m[i][j][1] >= m[i][1 - j][1]) nash.push([i, j]);
    }
    const resp = [0, 1].map(i => (m[i][0][1] > m[i][1][1] ? 0 : 1));
    const pagos = [0, 1].map(i => m[i][resp[i]][0]);
    const i = pagos[0] > pagos[1] ? 0 : 1;
    const vG = valor * (1 + p.asimetria_info / 100);
    const reserva = vG * (1 + p.beneficio_privado / 100 - p.costo_defensa / 100);
    const maximo = valor * (1 + p.prima_control / 100) / (1 + kd / 100 * p.plazo_financiacion);
    return {
      matriz: m, nash, secuencial: [i, resp[i]], respuestas: resp,
      resultado: `${["Subir oferta", "Mantener oferta"][i]} / GEA ${["vender", "retener"][resp[i]]}`,
      zona: { reserva_gea: reserva, maximo_oferente: maximo, existe: maximo >= reserva, holgura: maximo - reserva },
      minoritarios_aceptan: precio > valor,
      beneficio_umbral: (precio / vG - 1 + p.costo_defensa / 100) * 100,
    };
  }

  function aplicarChoque(f, ch, p) {
    const n = Object.assign({}, f);
    n.inflacion = f.inflacion + (ch.d_inflacion || 0);
    n.crecimiento_pib = f.crecimiento_pib + (ch.d_crecimiento || 0);
    n.brecha_producto = f.brecha_producto + (ch.d_crecimiento || 0);
    n.trm_promedio = f.trm_promedio * (1 + (ch.d_trm_pct || 0) / 100);
    n.trm_cierre = f.trm_cierre * (1 + (ch.d_trm_pct || 0) / 100);
    n.embi_pbs = f.embi_pbs + (ch.d_embi || 0);
    n.tasa_politica = ch.tasa_por_taylor
      ? reglaTaylor(n.inflacion, n.tasa_real_neutral, n.meta_inflacion, n.brecha_producto, p).tasa
      : f.tasa_politica + (ch.d_tasa || 0);
    return n;
  }

  function evaluar(f, precioUsd, p) {
    const t = reglaTaylor(f.inflacion, f.tasa_real_neutral, f.meta_inflacion, f.brecha_producto, p);
    const v = valoracion(f, p);
    const opa = precioUsd * f.trm_promedio;
    return { entorno: f, taylor: t, valoracion: v, precio_opa_usd: precioUsd, precio_opa_cop: opa,
             prima_opa: (opa / v.valor_accion - 1) * 100, juego: analizarJuego(v.valor_accion, opa, v.kd, p) };
  }

  const pstdev = a => { const m = a.reduce((s, x) => s + x, 0) / a.length;
    return Math.sqrt(a.reduce((s, x) => s + (x - m) ** 2, 0) / a.length); };

  function sensibilidad(filas, anio, precioUsd, p) {
    const f = filas.find(x => x.anio === anio);
    const base = evaluar(f, precioUsd, p);
    const v0 = base.valoracion.valor_accion, h0 = base.juego.zona.holgura;
    const trm = filas.map(x => x.trm_promedio);
    const mTrm = trm.reduce((s, x) => s + x, 0) / trm.length;
    const defs = [
      ["tasa_politica", "Tasa de política", "d_tasa", pstdev(filas.map(x => x.tasa_politica)), "pp"],
      ["inflacion", "Inflación", "d_inflacion", pstdev(filas.map(x => x.inflacion)), "pp"],
      ["trm_promedio", "Tasa de cambio", "d_trm_pct", pstdev(trm) / mTrm * 100, "%"],
      ["crecimiento_pib", "Crecimiento", "d_crecimiento", pstdev(filas.map(x => x.crecimiento_pib)), "pp"],
      ["embi_pbs", "Riesgo país (EMBI)", "d_embi", pstdev(filas.map(x => x.embi_pbs)), "pbs"],
    ];
    return defs.map(([variable, etiqueta, campo, tam, unidad]) => {
      const up = evaluar(aplicarChoque(f, { [campo]: tam }, p), precioUsd, p);
      const dn = evaluar(aplicarChoque(f, { [campo]: -tam }, p), precioUsd, p);
      return { variable, etiqueta, choque: tam, unidad,
               valor_sube: (up.valoracion.valor_accion / v0 - 1) * 100,
               valor_baja: (dn.valoracion.valor_accion / v0 - 1) * 100,
               holgura_sube: up.juego.zona.holgura - h0, holgura_baja: dn.juego.zona.holgura - h0,
               opa_sube: (up.precio_opa_cop / up.valoracion.valor_accion - 1) * 100 - base.prima_opa,
               opa_baja: (dn.precio_opa_cop / dn.valoracion.valor_accion - 1) * 100 - base.prima_opa };
    }).sort((a, b) => Math.max(Math.abs(b.valor_sube), Math.abs(b.valor_baja)) -
                      Math.max(Math.abs(a.valor_sube), Math.abs(a.valor_baja)));
  }

  function verificar(datos) {
    const p = datos.parametros;
    return datos.control.every(c => {
      const f = datos.macro.find(x => x.anio === c.anio);
      const r = evaluar(f, c.precio_usd, p);
      return Math.abs(r.taylor.tasa - c.taylor) < 1e-6 && Math.abs(r.valoracion.wacc - c.wacc) < 1e-6 &&
             Math.abs(r.valoracion.valor_accion - c.valor_accion) < 1e-2;
    });
  }

  global.Modelo = { reglaTaylor, costoCapital, valoracion, analizarJuego, aplicarChoque, evaluar,
                    sensibilidad, verificar };
})(window);

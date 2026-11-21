"""Capa 3 · Escenarios: une datos + modelos y responde "¿qué habría pasado si…?".

- aplicar_choque: crea el entorno alternativo (favorable / adverso / personalizado)
- evaluar: corre Taylor, costo de capital, valoración y el juego sobre un entorno
- plantilla: arma la tabla del curso (Lo que ocurrió / Favorable / Adverso)
- sensibilidad: identifica la variable crítica (paso 5)
"""
from __future__ import annotations

import statistics

from .config import ESCENARIOS_PREDETERMINADOS, ETIQUETAS_VARIABLES, Choque, Parametros
from .finanzas import precio_opa_cop, valoracion
from .juegos import analizar
from .taylor import regla_taylor


def precio_opa_referencia(eventos: list[dict], anio: int) -> dict:
    """Precio de la OPA por Nutresa vigente en el año (primera del año o la última anterior)."""
    nutresa = [e for e in eventos if e["objetivo"] == "Nutresa" and e["precio_usd"]]
    del_anio = [e for e in nutresa if e["anio"] == anio]
    if del_anio:
        return del_anio[0]
    previas = [e for e in nutresa if e["anio"] < anio]
    return previas[-1] if previas else nutresa[0]


def aplicar_choque(fila: dict, ch: Choque, p: Parametros) -> dict:
    n = dict(fila)
    n["inflacion"] = fila["inflacion"] + ch.d_inflacion
    n["crecimiento_pib"] = fila["crecimiento_pib"] + ch.d_crecimiento
    n["brecha_producto"] = fila["brecha_producto"] + ch.d_crecimiento  # aproximación 1:1
    n["trm_promedio"] = fila["trm_promedio"] * (1 + ch.d_trm_pct / 100)
    n["trm_cierre"] = fila["trm_cierre"] * (1 + ch.d_trm_pct / 100)
    n["embi_pbs"] = fila["embi_pbs"] + ch.d_embi
    if ch.tasa_por_taylor:
        n["tasa_politica"] = regla_taylor(n["inflacion"], n["tasa_real_neutral"], n["meta_inflacion"],
                                          n["brecha_producto"], p)["tasa"]
    else:
        n["tasa_politica"] = fila["tasa_politica"] + ch.d_tasa
    return n


def evaluar(fila: dict, precio_usd: float, p: Parametros) -> dict:
    t = regla_taylor(fila["inflacion"], fila["tasa_real_neutral"], fila["meta_inflacion"],
                     fila["brecha_producto"], p)
    v = valoracion(fila, p)
    opa = precio_opa_cop(precio_usd, fila["trm_promedio"])
    juego = analizar(v["valor_accion"], opa, v["kd"], p)
    return {
        "entorno": fila,
        "taylor": t,
        "valoracion": v,
        "precio_opa_usd": precio_usd,
        "precio_opa_cop": opa,
        "prima_opa": (opa / v["valor_accion"] - 1) * 100,
        "juego": juego,
    }


def _texto_efecto(base: dict, esc: dict) -> str:
    dv = (esc["valoracion"]["valor_accion"] / base["valoracion"]["valor_accion"] - 1) * 100
    dk = esc["valoracion"]["kd"] - base["valoracion"]["kd"]
    zona = esc["juego"]["zona"]
    partes = [
        f"Kd {'sube' if dk > 0 else 'baja'} {abs(dk):.1f} pp",
        f"valor por acción {'+' if dv >= 0 else '−'}{abs(dv):.0f} %",
        f"OPA {'con prima' if esc['prima_opa'] >= 0 else 'con descuento'} de {abs(esc['prima_opa']):.0f} % vs. valor",
        "hay zona de acuerdo" if zona["existe"] else "sin zona de acuerdo → bloqueo",
    ]
    return "; ".join(partes) + "."


def plantilla(fila: dict, precio_usd: float, p: Parametros,
              escenarios: dict[str, Choque] | None = None) -> dict:
    escenarios = escenarios or ESCENARIOS_PREDETERMINADOS
    base = evaluar(fila, precio_usd, p)
    res = {"ocurrio": base}
    for clave, ch in escenarios.items():
        res[clave] = evaluar(aplicar_choque(fila, ch, p), precio_usd, p)
    columnas = ["ocurrio", *escenarios.keys()]

    def celda(r, clave):
        e, v = r["entorno"], r["valoracion"]
        return {
            "tasa_politica": f"{e['tasa_politica']:.2f} %",
            "inflacion": f"{e['inflacion']:.2f} %",
            "trm_promedio": f"${e['trm_promedio']:,.0f}",
            "crecimiento_pib": f"{e['crecimiento_pib']:.1f} %",
            "embi_pbs": f"{e['embi_pbs']:.0f} pbs",
            "kd": f"{v['kd']:.1f} %",
            "wacc": f"{v['wacc']:.1f} %",
            "valor_accion": f"${v['valor_accion']:,.0f}",
            "precio_opa_cop": f"${r['precio_opa_cop']:,.0f}",
            "juego": r["juego"]["resultado"],
        }[clave]

    filas_tabla = []
    for clave, etiqueta, tipo in [
        ("tasa_politica", "Tasa de política", "dato"), ("inflacion", "Inflación", "dato"),
        ("trm_promedio", "Tasa de cambio (TRM)", "dato"), ("crecimiento_pib", "Crecimiento PIB", "dato"),
        ("embi_pbs", "Riesgo país (EMBI)", "dato"),
        ("kd", "Costo de financiación (Kd)", "efecto"), ("wacc", "WACC", "efecto"),
        ("valor_accion", "Valor fundamental por acción", "efecto"),
        ("precio_opa_cop", "Precio OPA en pesos", "efecto"), ("juego", "Resultado del juego", "efecto"),
    ]:
        filas_tabla.append({"clave": clave, "etiqueta": etiqueta, "tipo": tipo,
                            "valores": [celda(res[c], clave) for c in columnas]})
    filas_tabla.append({"clave": "analisis", "etiqueta": "Efecto en las decisiones", "tipo": "analisis",
                        "valores": ["Escenario de referencia (dato del tablero)."] +
                                   [_texto_efecto(base, res[c]) for c in escenarios]})
    return {"columnas": columnas, "filas": filas_tabla, "resultados": res}


def sensibilidad(filas: list[dict], anio: int, precio_usd: float, p: Parametros) -> list[dict]:
    """Choque de ±1 desviación estándar histórica (2021-2024) en cada variable."""
    fila = next(f for f in filas if f["anio"] == anio)
    base = evaluar(fila, precio_usd, p)
    v0 = base["valoracion"]["valor_accion"]
    h0 = base["juego"]["zona"]["holgura"]
    trm = [f["trm_promedio"] for f in filas]
    choques = {
        "tasa_politica": ("d_tasa", statistics.pstdev([f["tasa_politica"] for f in filas]), "pp"),
        "inflacion": ("d_inflacion", statistics.pstdev([f["inflacion"] for f in filas]), "pp"),
        "trm_promedio": ("d_trm_pct", statistics.pstdev(trm) / statistics.mean(trm) * 100, "%"),
        "crecimiento_pib": ("d_crecimiento", statistics.pstdev([f["crecimiento_pib"] for f in filas]), "pp"),
        "embi_pbs": ("d_embi", statistics.pstdev([f["embi_pbs"] for f in filas]), "pbs"),
    }
    salida = []
    for var, (campo, tam, unidad) in choques.items():
        resultados = {}
        for signo in (+1, -1):
            ch = Choque(**{campo: signo * tam})
            r = evaluar(aplicar_choque(fila, ch, p), precio_usd, p)
            resultados[signo] = r
        salida.append({
            "variable": var,
            "etiqueta": ETIQUETAS_VARIABLES[var],
            "choque": tam, "unidad": unidad,
            "valor_sube": (resultados[1]["valoracion"]["valor_accion"] / v0 - 1) * 100,
            "valor_baja": (resultados[-1]["valoracion"]["valor_accion"] / v0 - 1) * 100,
            "holgura_sube": resultados[1]["juego"]["zona"]["holgura"] - h0,
            "holgura_baja": resultados[-1]["juego"]["zona"]["holgura"] - h0,
        })
    salida.sort(key=lambda s: -max(abs(s["valor_sube"]), abs(s["valor_baja"])))
    return salida

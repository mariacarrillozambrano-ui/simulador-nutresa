"""Capa 2a · Regla de Taylor (versión simplificada del curso).

    Tasa = inflación + tasa real neutral + ½(inflación − meta) + ½(brecha del producto)

Ejemplo del curso: 9 + 2 + ½(9 − 3) + ½(−1) = 13,5 %
"""
from __future__ import annotations

from .config import Parametros


def regla_taylor(inflacion: float, tasa_real_neutral: float, meta: float, brecha: float,
                 p: Parametros | None = None) -> dict:
    p = p or Parametros()
    termino_inflacion = p.peso_inflacion * (inflacion - meta)
    termino_brecha = p.peso_brecha * brecha
    tasa = inflacion + tasa_real_neutral + termino_inflacion + termino_brecha
    return {
        "inflacion": inflacion,
        "tasa_real_neutral": tasa_real_neutral,
        "termino_inflacion": termino_inflacion,
        "termino_brecha": termino_brecha,
        "tasa": tasa,
    }


def taylor_fila(fila: dict, p: Parametros | None = None) -> dict:
    r = regla_taylor(fila["inflacion"], fila["tasa_real_neutral"], fila["meta_inflacion"],
                     fila["brecha_producto"], p)
    r["anio"] = fila["anio"]
    r["tasa_observada"] = fila["tasa_politica"]
    r["desvio"] = fila["tasa_politica"] - r["tasa"]   # negativo = BanRep por debajo de Taylor (más laxo)
    r["tasa_real_ex_post"] = fila["tasa_politica"] - fila["inflacion"]
    return r


def serie_taylor(filas: list[dict], p: Parametros | None = None) -> list[dict]:
    return [taylor_fila(f, p) for f in filas]

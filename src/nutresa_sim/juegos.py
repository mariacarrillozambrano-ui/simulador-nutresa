"""Capa 2c · Teoría de juegos: Oferente (Gilinski/IHC) vs. Defensor (GEA).

Juego 2×2 en forma normal:

                       GEA: Vender                     GEA: Retener (bloquear)
  Subir oferta   (V(1+c) − Pa − Pa·Kd·h ,  Pa − V'(1+b))     (−f·Pa ,  −d·V')
  Mantener       (V(1+c) − Pb − Pb·Kd·h ,  Pb − V'(1+b))     (−f·Pb ,  −d·V')

  V  = valor fundamental (modelo)        c = prima de control del oferente
  V' = V·(1+asimetría)  (el GEA cree que la empresa vale más: información privilegiada)
  b  = beneficio privado de control      d = costo de defensa   f = costo de una OPA fallida
  Kd = costo de la deuda                 h = plazo de financiación

Además del equilibrio de Nash simultáneo se reporta la solución secuencial
(el oferente fija el precio anticipando la respuesta del GEA) y la "zona de
acuerdo": precio mínimo que acepta el GEA vs. precio máximo que puede pagar
el oferente. Si no hay zona de acuerdo, el resultado es el bloqueo.
"""
from __future__ import annotations

from .config import Parametros

ESTR_OFERENTE = ["Subir oferta", "Mantener oferta"]
ESTR_DEFENSOR = ["Vender", "Retener"]


def matriz_pagos(valor: float, precio: float, kd: float, p: Parametros) -> list[list[tuple[float, float]]]:
    c, b, d, f = p.prima_control / 100, p.beneficio_privado / 100, p.costo_defensa / 100, p.costo_oferta / 100
    v_gea = valor * (1 + p.asimetria_info / 100)
    precios = [precio * (1 + p.alza_oferta / 100), precio]
    m = []
    for pr in precios:
        fin = pr * kd / 100 * p.plazo_financiacion
        vender = (valor * (1 + c) - pr - fin, pr - v_gea * (1 + b))
        retener = (-f * pr, -d * v_gea)
        m.append([vender, retener])
    return m


def equilibrios_nash(m) -> list[tuple[int, int]]:
    eq = []
    for i in range(2):
        for j in range(2):
            mejor_o = m[i][j][0] >= m[1 - i][j][0]
            mejor_d = m[i][j][1] >= m[i][1 - j][1]
            if mejor_o and mejor_d:
                eq.append((i, j))
    return eq


def solucion_secuencial(m) -> tuple[int, int]:
    """El oferente mueve primero; el GEA responde a cada precio."""
    respuestas = [0 if m[i][0][1] > m[i][1][1] else 1 for i in range(2)]
    pagos = [m[i][respuestas[i]][0] for i in range(2)]
    i = 0 if pagos[0] > pagos[1] else 1
    return i, respuestas[i]


def zona_acuerdo(valor: float, kd: float, p: Parametros) -> dict:
    v_gea = valor * (1 + p.asimetria_info / 100)
    reserva_gea = v_gea * (1 + p.beneficio_privado / 100 - p.costo_defensa / 100)
    maximo_oferente = valor * (1 + p.prima_control / 100) / (1 + kd / 100 * p.plazo_financiacion)
    return {"reserva_gea": reserva_gea, "maximo_oferente": maximo_oferente,
            "existe": maximo_oferente >= reserva_gea, "holgura": maximo_oferente - reserva_gea}


def analizar(valor: float, precio: float, kd: float, p: Parametros) -> dict:
    m = matriz_pagos(valor, precio, kd, p)
    nash = equilibrios_nash(m)
    seq = solucion_secuencial(m)
    zona = zona_acuerdo(valor, kd, p)
    return {
        "matriz": [[list(c) for c in fila] for fila in m],
        "nash": [list(e) for e in nash],
        "secuencial": list(seq),
        "resultado": f"{ESTR_OFERENTE[seq[0]]} / GEA {ESTR_DEFENSOR[seq[1]].lower()}",
        "zona": zona,
        "minoritarios_aceptan": precio > valor,
        # Beneficio privado de control a partir del cual el GEA prefiere retener a este precio
        "beneficio_umbral": (precio / (valor * (1 + p.asimetria_info / 100)) - 1 + p.costo_defensa / 100) * 100,
    }

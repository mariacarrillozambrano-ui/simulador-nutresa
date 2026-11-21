"""Capa 2b · Finanzas: costo de financiación y valoración de Nutresa.

Cadena de transmisión que modela el simulador:

  tasa de política ─► tasa larga (TES) ─► costo de deuda (Kd) y del patrimonio (Ke) ─► WACC
  inflación ─► expectativas ─► crecimiento nominal de los flujos (g)
  crecimiento PIB y TRM ─► flujo de caja libre
  WACC, g y flujo ─► valor fundamental por acción (Gordon)
  precio OPA (USD) × TRM ─► precio OPA en pesos ─► prima/descuento frente al valor

Es un modelo pedagógico: los niveles absolutos dependen de supuestos
(config.Parametros); lo importante es la DIRECCIÓN y el TAMAÑO RELATIVO de los
cambios entre escenarios.
"""
from __future__ import annotations

from .config import Parametros


def costo_capital(tasa_politica: float, embi_pbs: float, tasa_real_neutral: float,
                  meta: float, p: Parametros) -> dict:
    neutral_nominal = tasa_real_neutral + meta
    tasa_larga = neutral_nominal + p.prima_plazo + p.transmision * (tasa_politica - neutral_nominal)
    riesgo_pais = embi_pbs / 100
    ke = tasa_larga + riesgo_pais + p.beta * p.prima_mercado
    kd = tasa_larga + p.spread_credito
    kd_neto = kd * (1 - p.tasa_impuesto / 100)
    wd = p.peso_deuda / 100
    wacc = wd * kd_neto + (1 - wd) * ke
    return {"tasa_larga": tasa_larga, "ke": ke, "kd": kd, "kd_neto": kd_neto, "wacc": wacc}


def inflacion_esperada(inflacion: float, meta: float, p: Parametros) -> float:
    return meta + p.persistencia_inflacion * (inflacion - meta)


def flujo_por_accion(crecimiento_pib: float, trm: float, indice_precios: float, p: Parametros) -> float:
    ciclo = 1 + p.elasticidad_fcf_pib * (crecimiento_pib - p.crecimiento_potencial) / 100
    cambio = 1 + p.exposicion_cambiaria * (trm / p.trm_referencia - 1)
    return p.fcf_por_accion * indice_precios * ciclo * cambio


def valoracion(fila: dict, p: Parametros) -> dict:
    cc = costo_capital(fila["tasa_politica"], fila["embi_pbs"], fila["tasa_real_neutral"],
                       fila["meta_inflacion"], p)
    pi_e = inflacion_esperada(fila["inflacion"], fila["meta_inflacion"], p)
    g = (1 + p.crecimiento_real_lp / 100) * (1 + pi_e / 100) - 1
    fcf = flujo_por_accion(fila["crecimiento_pib"], fila["trm_promedio"], fila.get("indice_precios", 1.0), p)
    margen = cc["wacc"] / 100 - g
    margen = max(margen, 0.01)  # evita divisiones explosivas si WACC ≈ g
    valor = fcf * (1 + g) / margen
    return {**cc, "inflacion_esperada": pi_e, "g": g * 100, "fcf": fcf,
            "valor_accion": valor,
            "valor_empresa_billones": valor * 457_995_960 / 1e12}


def precio_opa_cop(precio_usd: float, trm: float) -> float:
    return precio_usd * trm

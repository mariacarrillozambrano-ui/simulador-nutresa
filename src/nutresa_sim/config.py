"""Capa 0 · Configuración y supuestos del modelo.

Todos los supuestos están aquí, en un solo lugar, para que puedas cambiarlos
y justificarlos en el borrador. Las cifras en % se escriben en puntos
porcentuales (3.0 = 3 %).
"""
from __future__ import annotations

from dataclasses import asdict, dataclass, field
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[2]
DIR_DATOS = RAIZ / "datos"
DIR_WEB_DATA = RAIZ / "web" / "data"
DIR_SALIDAS = RAIZ / "salidas"

ARCHIVO_MACRO = DIR_DATOS / "macro_colombia.csv"
ARCHIVO_VARIABLES = DIR_DATOS / "variables.csv"
ARCHIVO_EVENTOS = DIR_DATOS / "eventos_caso.csv"

ACCIONES_NUTRESA = 457_995_960  # acciones en circulación (cuadernillo OPA 2021)


@dataclass
class Parametros:
    # --- Regla de Taylor ---------------------------------------------------
    peso_inflacion: float = 0.5        # coeficiente sobre (inflación - meta)
    peso_brecha: float = 0.5           # coeficiente sobre la brecha del producto

    # --- Costo de capital (CAPM local simplificado) -------------------------
    prima_plazo: float = 1.5           # pp que separa la tasa larga de la corta
    transmision: float = 0.5           # cuánto de la tasa de política pasa a la tasa larga
    beta: float = 0.8                  # beta de Nutresa (consumo básico, defensiva)
    prima_mercado: float = 5.5         # prima de riesgo del mercado accionario
    spread_credito: float = 2.5        # spread de la deuda corporativa sobre la tasa larga
    tasa_impuesto: float = 35.0        # impuesto de renta Colombia
    peso_deuda: float = 30.0           # D/(D+E) en %

    # --- Valoración (flujo de caja descontado, Gordon) ----------------------
    fcf_por_accion: float = 2100.0     # flujo de caja libre normalizado 2021 (COP/acción) · SUPUESTO
    crecimiento_real_lp: float = 2.5   # crecimiento real de largo plazo
    persistencia_inflacion: float = 0.3  # parte del desvío de inflación que se vuelve expectativa
    crecimiento_potencial: float = 3.0
    elasticidad_fcf_pib: float = 0.8   # sensibilidad del flujo al ciclo
    exposicion_cambiaria: float = 0.2  # efecto neto de la TRM en el flujo (ventas fuera - insumos importados)
    trm_referencia: float = 3743.09    # TRM promedio 2021

    # --- Teoría de juegos (Gilinski vs. GEA) --------------------------------
    prima_control: float = 25.0        # valor adicional que el oferente le da al control (%)
    beneficio_privado: float = 10.0    # beneficio privado de control que pierde el GEA si vende (%)
    asimetria_info: float = 15.0       # cuánto más valora el GEA la empresa frente al modelo (%)
    costo_defensa: float = 3.0         # costo para el GEA de bloquear (litigios, enroque) (% del valor)
    costo_oferta: float = 2.0          # costo para el oferente de una OPA fallida (% del precio)
    plazo_financiacion: float = 0.5    # años que el oferente financia la operación antes de capturar valor
    alza_oferta: float = 20.0          # cuánto sube el precio en la estrategia "Subir oferta" (%)

    def a_dict(self) -> dict:
        return asdict(self)

    @classmethod
    def desde_dict(cls, d: dict | None) -> "Parametros":
        base = cls()
        if not d:
            return base
        validos = {k: float(v) for k, v in d.items() if k in base.a_dict()}
        return cls(**{**base.a_dict(), **validos})


@dataclass
class Choque:
    """Desviación de un escenario frente a lo que ocurrió."""

    nombre: str = "Base"
    d_tasa: float = 0.0          # pp
    d_inflacion: float = 0.0     # pp
    d_trm_pct: float = 0.0       # % de la TRM
    d_crecimiento: float = 0.0   # pp
    d_embi: float = 0.0          # puntos básicos
    tasa_por_taylor: bool = False  # si True, la tasa de política la fija la Regla de Taylor
    descripcion: str = ""

    def a_dict(self) -> dict:
        return asdict(self)


ESCENARIOS_PREDETERMINADOS: dict[str, Choque] = {
    "favorable": Choque(
        nombre="Más favorable",
        d_tasa=-3.0, d_inflacion=-2.0, d_trm_pct=-8.0, d_crecimiento=1.0, d_embi=-80,
        descripcion="Tasas bajas: inflación contenida, peso más fuerte y menor riesgo país.",
    ),
    "adverso": Choque(
        nombre="Más adverso",
        d_tasa=2.0, d_inflacion=2.0, d_trm_pct=12.0, d_crecimiento=-1.5, d_embi=150,
        descripcion="Prima de riesgo mayor: más inflación, peso débil y riesgo país alto.",
    ),
}

ETIQUETAS_VARIABLES = {
    "tasa_politica": "Tasa de política",
    "inflacion": "Inflación",
    "trm_promedio": "Tasa de cambio",
    "crecimiento_pib": "Crecimiento",
    "embi_pbs": "Riesgo país (EMBI)",
}

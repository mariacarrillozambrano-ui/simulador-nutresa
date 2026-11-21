"""Simulador macro-financiero del caso Nutresa–Gilinski (2021-2024).

Capas:
  config      -> supuestos y escenarios predeterminados
  datos       -> carga y validación del tablero de coyuntura
  taylor      -> Regla de Taylor simplificada
  finanzas    -> costo de capital y valoración
  juegos      -> teoría de juegos Gilinski vs. GEA
  escenarios  -> entornos alternativos, plantilla y variable crítica
  exportar    -> datos para la web, Excel y HTML de un solo archivo
"""
__version__ = "1.0.0"

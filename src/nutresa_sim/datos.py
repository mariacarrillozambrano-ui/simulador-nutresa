"""Capa 1 · Datos.

Carga el tablero de coyuntura (CSV o Excel), normaliza nombres de columnas y
valida que estén las variables necesarias. Si el tablero del curso trae otros
nombres de columnas, agrega el alias en ALIAS y listo.
"""
from __future__ import annotations

import csv
import unicodedata
from dataclasses import dataclass
from pathlib import Path

from .config import ARCHIVO_EVENTOS, ARCHIVO_MACRO, ARCHIVO_VARIABLES

COLUMNAS_REQUERIDAS = [
    "anio", "tasa_politica", "inflacion", "meta_inflacion", "tasa_real_neutral",
    "brecha_producto", "crecimiento_pib", "trm_promedio", "trm_cierre", "embi_pbs",
]

# Nombres alternativos que puede traer el tablero -> nombre interno
ALIAS = {
    "ano": "anio", "año": "anio", "year": "anio", "periodo": "anio",
    "tasa de politica": "tasa_politica", "tasa de politica monetaria": "tasa_politica",
    "tasa banrep": "tasa_politica", "tasa de intervencion": "tasa_politica", "tpm": "tasa_politica",
    "inflacion anual": "inflacion", "ipc": "inflacion", "inflacion": "inflacion",
    "meta": "meta_inflacion", "meta de inflacion": "meta_inflacion",
    "tasa real neutral": "tasa_real_neutral", "r neutral": "tasa_real_neutral",
    "brecha": "brecha_producto", "brecha del producto": "brecha_producto", "output gap": "brecha_producto",
    "crecimiento": "crecimiento_pib", "pib": "crecimiento_pib", "crecimiento pib": "crecimiento_pib",
    "crecimiento del pib": "crecimiento_pib",
    "trm": "trm_promedio", "tasa de cambio": "trm_promedio", "trm promedio": "trm_promedio",
    "trm cierre": "trm_cierre", "trm fin de ano": "trm_cierre",
    "embi": "embi_pbs", "riesgo pais": "embi_pbs", "embi colombia": "embi_pbs",
}

# Valores por defecto si el tablero no trae la columna
DEFAULTS = {"meta_inflacion": 3.0, "tasa_real_neutral": 2.0}


class ErrorTablero(ValueError):
    pass


@dataclass
class Tablero:
    filas: list[dict]          # una fila por año, ordenadas
    variables: list[dict]      # metadatos (etiqueta, unidad, fuente, calidad)
    eventos: list[dict]        # hitos del caso Nutresa-Gilinski
    origen: str

    def anios(self) -> list[int]:
        return [f["anio"] for f in self.filas]

    def fila(self, anio: int) -> dict:
        for f in self.filas:
            if f["anio"] == anio:
                return dict(f)
        raise KeyError(f"El año {anio} no está en el tablero ({self.anios()})")


def _normalizar(nombre: str) -> str:
    s = unicodedata.normalize("NFKD", str(nombre)).encode("ascii", "ignore").decode()
    s = s.strip().lower().replace("_", " ").replace("(%)", "").replace("%", "").strip()
    s = " ".join(s.split())
    if s.replace(" ", "_") in COLUMNAS_REQUERIDAS:
        return s.replace(" ", "_")
    return ALIAS.get(s, s.replace(" ", "_"))


def _numero(v) -> float | None:
    if v is None:
        return None
    if isinstance(v, (int, float)):
        return float(v)
    s = str(v).strip().replace("%", "").replace(" ", "")
    if not s:
        return None
    # Formato colombiano: 4.255,44 -> 4255.44
    if "," in s and "." in s:
        s = s.replace(".", "").replace(",", ".")
    elif "," in s:
        s = s.replace(",", ".")
    return float(s)


def _leer_tabla(ruta: Path) -> list[dict]:
    ruta = Path(ruta)
    if not ruta.exists():
        raise ErrorTablero(f"No encuentro el archivo {ruta}")
    with open(ruta, "rb") as fh:
        cabecera = fh.read(512).lower()
    if b"<html" in cabecera or b"<!doctype" in cabecera:
        raise ErrorTablero(
            f"{ruta.name} es una página web (HTML), no una hoja de cálculo. "
            "Seguramente la descarga se guardó sin iniciar sesión en el aula. "
            "Vuelve a descargar el tablero ya autenticado."
        )
    if ruta.suffix.lower() in {".xlsx", ".xlsm"}:
        try:
            import openpyxl
        except ImportError as e:  # pragma: no cover
            raise ErrorTablero("Instala openpyxl: pip install -r requirements.txt") from e
        wb = openpyxl.load_workbook(ruta, data_only=True, read_only=True)
        for ws in wb.worksheets:
            filas = [list(r) for r in ws.iter_rows(values_only=True) if any(c is not None for c in r)]
            # Busca la fila de encabezados: la primera que contenga "año"/"anio"
            for i, fila in enumerate(filas):
                if any(_normalizar(c) == "anio" for c in fila if c is not None):
                    enc = [_normalizar(c) if c is not None else "" for c in fila]
                    return [dict(zip(enc, r)) for r in filas[i + 1:]]
        raise ErrorTablero("No encontré una fila de encabezados con la columna 'Año' en el Excel.")
    with open(ruta, encoding="utf-8-sig", newline="") as fh:
        muestra = fh.read(2048)
        fh.seek(0)
        sep = ";" if muestra.count(";") > muestra.count(",") else ","
        lector = csv.DictReader(fh, delimiter=sep)
        return [{_normalizar(k): v for k, v in fila.items()} for fila in lector]


def _formato_ancho(filas: list[dict]) -> list[dict]:
    """Si el tablero viene en formato largo (variable en filas, años en columnas), lo transpone."""
    if filas and "anio" in filas[0]:
        return filas
    if filas and "variable" in filas[0]:
        anios = [k for k in filas[0] if k.isdigit()]
        salida = []
        for a in anios:
            fila = {"anio": int(a)}
            for f in filas:
                fila[_normalizar(f["variable"])] = f.get(a)
            salida.append(fila)
        return salida
    raise ErrorTablero("El tablero debe tener una columna 'Año' o una columna 'Variable' con años como columnas.")


def cargar_macro(ruta: Path | str = ARCHIVO_MACRO) -> list[dict]:
    filas = _formato_ancho(_leer_tabla(Path(ruta)))
    limpias = []
    for f in filas:
        if f.get("anio") in (None, ""):
            continue
        fila = {"anio": int(_numero(f["anio"]))}
        for col in COLUMNAS_REQUERIDAS[1:]:
            val = _numero(f.get(col))
            if val is None and col == "trm_cierre":
                val = _numero(f.get("trm_promedio"))
            if val is None:
                val = DEFAULTS.get(col)
            fila[col] = val
        limpias.append(fila)
    faltantes = sorted({c for f in limpias for c in COLUMNAS_REQUERIDAS if f[c] is None})
    if faltantes:
        raise ErrorTablero(f"Faltan datos en el tablero para: {', '.join(faltantes)}")
    return agregar_indice(limpias)


def agregar_indice(filas: list[dict]) -> list[dict]:
    """Índice de precios acumulado (base primer año = 1) para llevar flujos a pesos de cada año."""
    filas.sort(key=lambda f: f["anio"])
    indice = 1.0
    for i, f in enumerate(filas):
        if i > 0:
            indice *= 1 + f["inflacion"] / 100
        f["indice_precios"] = round(indice, 6)
    return filas


def _leer_csv_simple(ruta: Path) -> list[dict]:
    with open(ruta, encoding="utf-8-sig", newline="") as fh:
        return list(csv.DictReader(fh))


def cargar_eventos(ruta: Path = ARCHIVO_EVENTOS) -> list[dict]:
    eventos = []
    for e in _leer_csv_simple(ruta):
        e["anio"] = int(e["anio"])
        e["precio_usd"] = _numero(e.get("precio_usd"))
        e["participacion_gilinski"] = _numero(e.get("participacion_gilinski"))
        e["verificar"] = str(e.get("verificar", "")).strip().lower() in {"sí", "si", "true", "1"}
        eventos.append(e)
    return eventos


def cargar_tablero(ruta_macro: Path | str | None = None) -> Tablero:
    ruta = Path(ruta_macro) if ruta_macro else ARCHIVO_MACRO
    return Tablero(
        filas=cargar_macro(ruta),
        variables=_leer_csv_simple(ARCHIVO_VARIABLES),
        eventos=cargar_eventos(),
        origen=ruta.name,
    )

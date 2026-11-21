"""Capa 4 · Exportación: lleva los resultados de Python a la web y a Excel.

- web/data/datos.js  -> lo lee el HTML (window.DATOS); funciona abriendo index.html sin servidor
- web/data/datos.json -> mismo contenido, por si quieres usarlo en otro lado
- salidas/plantilla_escenarios.xlsx -> la plantilla del curso ya diligenciada con el modelo
- salidas/simulador_nutresa.html -> versión de un solo archivo para compartir
"""
from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path

from .config import DIR_SALIDAS, DIR_WEB_DATA, ESCENARIOS_PREDETERMINADOS, RAIZ, Parametros
from .datos import Tablero
from .escenarios import evaluar, plantilla, precio_opa_referencia, sensibilidad
from .taylor import serie_taylor


def construir_paquete(tab: Tablero, p: Parametros) -> dict:
    por_anio = {}
    for f in tab.filas:
        ref = precio_opa_referencia(tab.eventos, f["anio"])
        pl = plantilla(f, ref["precio_usd"], p)
        por_anio[f["anio"]] = {
            "opa_referencia": ref,
            "plantilla": {"columnas": pl["columnas"], "filas": pl["filas"]},
            "resultados": pl["resultados"],
            "sensibilidad": sensibilidad(tab.filas, f["anio"], ref["precio_usd"], p),
        }
    # Casos de control: la web recalcula estos números y verifica que coincidan con Python
    control = []
    for f in tab.filas:
        r = evaluar(f, 10.0, p)
        control.append({"anio": f["anio"], "precio_usd": 10.0,
                        "taylor": round(r["taylor"]["tasa"], 6),
                        "wacc": round(r["valoracion"]["wacc"], 6),
                        "valor_accion": round(r["valoracion"]["valor_accion"], 4)})
    return {
        "generado": datetime.now().isoformat(timespec="seconds"),
        "origen": tab.origen,
        "macro": tab.filas,
        "variables": tab.variables,
        "eventos": tab.eventos,
        "parametros": p.a_dict(),
        "escenarios": {k: v.a_dict() for k, v in ESCENARIOS_PREDETERMINADOS.items()},
        "taylor": serie_taylor(tab.filas, p),
        "por_anio": por_anio,
        "control": control,
    }


def escribir_web(paquete: dict, destino: Path = DIR_WEB_DATA) -> list[Path]:
    destino.mkdir(parents=True, exist_ok=True)
    texto = json.dumps(paquete, ensure_ascii=False, indent=1, default=str)
    js = destino / "datos.js"
    js.write_text(f"// Generado por Python (scripts/construir.py). No editar a mano.\nwindow.DATOS = {texto};\n",
                  encoding="utf-8")
    js_json = destino / "datos.json"
    js_json.write_text(texto, encoding="utf-8")
    return [js, js_json]


def escribir_excel(paquete: dict, destino: Path = DIR_SALIDAS) -> Path | None:
    try:
        from openpyxl import Workbook
        from openpyxl.styles import Alignment, Font, PatternFill
    except ImportError:
        return None
    destino.mkdir(parents=True, exist_ok=True)
    wb = Workbook()
    wb.remove(wb.active)
    nombres = {"ocurrio": "Lo que ocurrió", "favorable": "Escenario favorable", "adverso": "Escenario adverso"}
    colores = {"dato": "DCE6F7", "efecto": "EDE7F6", "analisis": "F3E5F5"}
    for anio, d in paquete["por_anio"].items():
        ws = wb.create_sheet(f"Plantilla {anio}")
        ref = d["opa_referencia"]
        ws.append([f"Plantilla de escenarios · caso Nutresa–Gilinski · {anio}"])
        ws.append([f"OPA de referencia: {ref['evento']} (USD {ref['precio_usd']:.2f})"])
        ws.append([])
        ws.append(["Variable", *[nombres.get(c, c) for c in d["plantilla"]["columnas"]]])
        for c in ws[4]:
            c.font = Font(bold=True, color="FFFFFF")
            c.fill = PatternFill("solid", fgColor="2B2350")
        for fila in d["plantilla"]["filas"]:
            ws.append([fila["etiqueta"], *fila["valores"]])
            for c in ws[ws.max_row]:
                c.fill = PatternFill("solid", fgColor=colores[fila["tipo"]])
                c.alignment = Alignment(wrap_text=True, vertical="top")
        ws["A1"].font = Font(bold=True, size=13)
        ws.column_dimensions["A"].width = 30
        for col in "BCD":
            ws.column_dimensions[col].width = 42
    ws = wb.create_sheet("Datos macro")
    cols = list(paquete["macro"][0].keys())
    ws.append(cols)
    for f in paquete["macro"]:
        ws.append([f[c] for c in cols])
    ws = wb.create_sheet("Fuentes")
    ws.append(["variable", "etiqueta", "unidad", "fuente", "calidad", "nota"])
    for v in paquete["variables"]:
        ws.append([v.get(k) for k in ["variable", "etiqueta", "unidad", "fuente", "calidad", "nota"]])
    salida = destino / "plantilla_escenarios.xlsx"
    wb.save(salida)
    return salida


def empaquetar_html(destino: Path = DIR_SALIDAS) -> Path:
    """Une index.html + css + js + datos en un solo archivo para compartir."""
    web = RAIZ / "web"
    html = (web / "index.html").read_text(encoding="utf-8")
    css = (web / "css" / "estilos.css").read_text(encoding="utf-8")
    html = html.replace('<link rel="stylesheet" href="css/estilos.css">', f"<style>\n{css}\n</style>")
    for nombre in ["data/datos.js", "js/graficos.js", "js/modelo.js", "js/app.js"]:
        codigo = (web / nombre).read_text(encoding="utf-8")
        html = html.replace(f'<script src="{nombre}"></script>', f"<script>\n{codigo}\n</script>")
    destino.mkdir(parents=True, exist_ok=True)
    salida = destino / "simulador_nutresa.html"
    salida.write_text(html, encoding="utf-8")
    return salida

"""Línea de comandos.

  python -m nutresa_sim construir                 # genera datos para la web, Excel y HTML único
  python -m nutresa_sim construir --tablero datos/crudos/mi_tablero.xlsx
  python -m nutresa_sim servir                    # abre el simulador en http://localhost:8000
  python -m nutresa_sim escenario --anio 2022 --tasa -3 --trm 10
  python -m nutresa_sim taylor --inflacion 9 --meta 3 --neutral 2 --brecha -1
"""
from __future__ import annotations

import argparse
import functools
import http.server
import socketserver
import webbrowser

from .config import RAIZ, Choque, Parametros
from .datos import ErrorTablero, cargar_tablero
from .escenarios import aplicar_choque, evaluar, precio_opa_referencia
from .exportar import construir_paquete, empaquetar_html, escribir_excel, escribir_web
from .taylor import regla_taylor


def cmd_construir(a):
    try:
        tab = cargar_tablero(a.tablero)
    except ErrorTablero as e:
        raise SystemExit(f"✗ {e}")
    p = Parametros()
    paquete = construir_paquete(tab, p)
    for ruta in escribir_web(paquete):
        print(f"✓ {ruta.relative_to(RAIZ)}")
    xl = escribir_excel(paquete)
    if xl:
        print(f"✓ {xl.relative_to(RAIZ)}")
    print(f"✓ {empaquetar_html().relative_to(RAIZ)}")
    print(f"Datos: {tab.origen} · años {tab.anios()}")


def cmd_servir(a):
    cmd_construir(argparse.Namespace(tablero=a.tablero))
    manejador = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(RAIZ / "web"))
    with socketserver.TCPServer(("", a.puerto), manejador) as srv:
        url = f"http://localhost:{a.puerto}"
        print(f"Simulador en {url}  (Ctrl+C para detener)")
        if not a.sin_navegador:
            webbrowser.open(url)
        srv.serve_forever()


def cmd_escenario(a):
    tab = cargar_tablero(a.tablero)
    p = Parametros()
    fila = tab.fila(a.anio)
    ref = precio_opa_referencia(tab.eventos, a.anio)
    precio = a.opa or ref["precio_usd"]
    ch = Choque(nombre="CLI", d_tasa=a.tasa, d_inflacion=a.inflacion, d_trm_pct=a.trm,
                d_crecimiento=a.crecimiento, d_embi=a.embi, tasa_por_taylor=a.taylor)
    base, esc = evaluar(fila, precio, p), evaluar(aplicar_choque(fila, ch, p), precio, p)
    print(f"Año {a.anio} · OPA USD {precio:.2f}")
    print(f"{'':28}{'Ocurrió':>14}{'Escenario':>14}")
    for etq, f in [("Tasa de política (%)", lambda r: r["entorno"]["tasa_politica"]),
                   ("Taylor (%)", lambda r: r["taylor"]["tasa"]),
                   ("Kd (%)", lambda r: r["valoracion"]["kd"]),
                   ("WACC (%)", lambda r: r["valoracion"]["wacc"]),
                   ("Valor por acción (COP)", lambda r: r["valoracion"]["valor_accion"]),
                   ("OPA en COP", lambda r: r["precio_opa_cop"]),
                   ("Prima OPA vs valor (%)", lambda r: r["prima_opa"])]:
        print(f"{etq:28}{f(base):>14,.2f}{f(esc):>14,.2f}")
    print(f"Juego: {base['juego']['resultado']}  →  {esc['juego']['resultado']}")


def cmd_taylor(a):
    r = regla_taylor(a.inflacion, a.neutral, a.meta, a.brecha)
    print(f"{a.inflacion} + {a.neutral} + ½({a.inflacion} − {a.meta}) + ½({a.brecha}) = {r['tasa']:.2f} %")


def main():
    ap = argparse.ArgumentParser(prog="nutresa_sim", description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    s = sub.add_parser("construir"); s.add_argument("--tablero"); s.set_defaults(f=cmd_construir)
    s = sub.add_parser("servir"); s.add_argument("--tablero"); s.add_argument("--puerto", type=int, default=8000)
    s.add_argument("--sin-navegador", action="store_true"); s.set_defaults(f=cmd_servir)
    s = sub.add_parser("escenario"); s.add_argument("--tablero"); s.add_argument("--anio", type=int, default=2022)
    for k in ["tasa", "inflacion", "trm", "crecimiento", "embi", "opa"]:
        s.add_argument(f"--{k}", type=float, default=0.0)
    s.add_argument("--taylor", action="store_true", help="la tasa de política la fija la Regla de Taylor")
    s.set_defaults(f=cmd_escenario)
    s = sub.add_parser("taylor")
    for k, d in [("inflacion", 9), ("neutral", 2), ("meta", 3), ("brecha", -1)]:
        s.add_argument(f"--{k}", type=float, default=d)
    s.set_defaults(f=cmd_taylor)
    a = ap.parse_args()
    a.f(a)


if __name__ == "__main__":
    main()

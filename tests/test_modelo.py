import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from nutresa_sim.config import Choque, Parametros  # noqa: E402
from nutresa_sim.datos import ErrorTablero, cargar_macro, cargar_tablero  # noqa: E402
from nutresa_sim.escenarios import aplicar_choque, evaluar, plantilla, sensibilidad  # noqa: E402
from nutresa_sim.juegos import analizar, equilibrios_nash  # noqa: E402
from nutresa_sim.taylor import regla_taylor  # noqa: E402

P = Parametros()


def test_ejemplo_del_curso():
    # 9 % + 2 % + ½(9 % − 3 %) + ½(−1 %) = 13,5 %
    assert regla_taylor(9, 2, 3, -1)["tasa"] == pytest.approx(13.5)


def test_tablero_carga_y_ordena():
    tab = cargar_tablero()
    assert tab.anios() == [2021, 2022, 2023, 2024]
    assert tab.fila(2022)["inflacion"] == pytest.approx(13.12)


def test_rechaza_html_disfrazado(tmp_path):
    falso = tmp_path / "tablero.xlsx"
    falso.write_text("<!DOCTYPE html><html><body>login</body></html>")
    with pytest.raises(ErrorTablero, match="página web"):
        cargar_macro(falso)


def test_csv_con_alias_y_coma_decimal(tmp_path):
    f = tmp_path / "t.csv"
    f.write_text("Año;Tasa de política;Inflación;Brecha del producto;Crecimiento;TRM;EMBI\n"
                 "2022;12,0;13,12;3,0;7,3;4.255,44;371\n", encoding="utf-8")
    fila = cargar_macro(f)[0]
    assert fila["trm_promedio"] == pytest.approx(4255.44)
    assert fila["meta_inflacion"] == 3.0  # valor por defecto


def test_tasas_altas_encarecen_y_reducen_valor():
    fila = cargar_tablero().fila(2022)
    base = evaluar(fila, 10.48, P)
    alta = evaluar(aplicar_choque(fila, Choque(d_tasa=2), P), 10.48, P)
    assert alta["valoracion"]["kd"] > base["valoracion"]["kd"]
    assert alta["valoracion"]["valor_accion"] < base["valoracion"]["valor_accion"]


def test_devaluacion_encarece_opa_en_pesos():
    fila = cargar_tablero().fila(2022)
    base = evaluar(fila, 10.48, P)
    dev = evaluar(aplicar_choque(fila, Choque(d_trm_pct=10), P), 10.48, P)
    assert dev["precio_opa_cop"] == pytest.approx(base["precio_opa_cop"] * 1.10)


def test_taylor_endogeno():
    fila = cargar_tablero().fila(2021)
    n = aplicar_choque(fila, Choque(tasa_por_taylor=True), P)
    assert n["tasa_politica"] == pytest.approx(regla_taylor(5.62, 2, 3, -1)["tasa"])


def test_juego_vender_si_precio_muy_alto():
    sin_friccion = Parametros(asimetria_info=0, beneficio_privado=0)
    r = analizar(valor=100, precio=200, kd=10, p=sin_friccion)
    assert r["secuencial"][1] == 0  # el GEA vende


def test_juego_bloqueo_con_asimetria_alta():
    r = analizar(valor=100, precio=100, kd=15, p=Parametros(asimetria_info=40))
    assert not r["zona"]["existe"]
    assert r["secuencial"][1] == 1  # el GEA retiene


def test_nash_existe_en_pura():
    r = analizar(100, 110, 10, P)
    assert equilibrios_nash([[tuple(c) for c in f] for f in r["matriz"]])


def test_plantilla_y_sensibilidad():
    tab = cargar_tablero()
    pl = plantilla(tab.fila(2022), 10.48, P)
    assert pl["columnas"] == ["ocurrio", "favorable", "adverso"]
    assert len(pl["filas"]) == 11
    s = sensibilidad(tab.filas, 2022, 10.48, P)
    assert len(s) == 5
    assert abs(s[0]["valor_sube"]) >= abs(s[-1]["valor_sube"]) or abs(s[0]["valor_baja"]) >= abs(s[-1]["valor_baja"])

"""Capa 5 (versión Python) · Interfaz interactiva con Streamlit.

Ejecuta desde la raíz del proyecto:
    streamlit run app/app.py
o en VS Code: F5 → «0 · App Python (Streamlit)».

Usa exactamente el mismo modelo que src/nutresa_sim (no hay fórmulas duplicadas).
"""
from __future__ import annotations

import io
import sys
import tempfile
from dataclasses import fields
from pathlib import Path

import pandas as pd
import plotly.graph_objects as go
import streamlit as st

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from nutresa_sim.config import ESCENARIOS_PREDETERMINADOS, Choque, Parametros  # noqa: E402
from nutresa_sim.datos import ErrorTablero, Tablero, agregar_indice, cargar_macro, cargar_tablero  # noqa: E402
from nutresa_sim.escenarios import aplicar_choque, evaluar, precio_opa_referencia, sensibilidad  # noqa: E402
from nutresa_sim.taylor import regla_taylor, serie_taylor  # noqa: E402

# ---------------------------------------------------------------- estilo
AZUL, NARANJA, VERDE, AMARILLO, MORADO, MARINO = "#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#6b3f86", "#232a5c"
st.set_page_config(page_title="Simulador Nutresa–Gilinski", page_icon="📈", layout="wide")
st.markdown(f"""<style>
.block-container {{padding-top: 1.5rem;}}
div[data-testid="stMetric"] {{background: #f0eef6; border-radius: 12px; padding: 10px 14px;}}
.lectura {{background:#efe6f5; border-left:3px solid {MORADO}; padding:10px 12px; border-radius:6px; margin:8px 0;}}
</style>""", unsafe_allow_html=True)


def pct(v, d=1):
    return f"{v:,.{d}f} %".replace(",", "X").replace(".", ",").replace("X", ".")


def cop(v):
    return f"${v:,.0f}".replace(",", ".")


def signo(v, d=1, u=" pp"):
    s = "+" if v > 0 else "−" if v < 0 else "±"
    return f"{s}{abs(v):.{d}f}{u}".replace(".", ",")


def layout(fig, alto=260, **kw):
    fig.update_layout(height=alto, margin=dict(l=10, r=10, t=30, b=10), plot_bgcolor="white",
                      legend=dict(orientation="h", y=1.12, x=0), separators=",.", **kw)
    fig.update_xaxes(showgrid=False)
    fig.update_yaxes(gridcolor="#e7e5ee", zerolinecolor="#9a98a6")
    return fig


# ---------------------------------------------------------------- datos y supuestos (barra lateral)
@st.cache_data
def tablero_base(ruta: str | None) -> Tablero:
    return cargar_tablero(ruta)


st.sidebar.title("Configuración")
subido = st.sidebar.file_uploader("Tablero del curso (xlsx o csv)", type=["xlsx", "csv"],
                                  help="Si no subes nada, se usa datos/macro_colombia.csv")
tab = tablero_base(None)
if subido:
    tmp = Path(tempfile.gettempdir()) / subido.name
    tmp.write_bytes(subido.getvalue())
    try:
        tab = Tablero(filas=cargar_macro(tmp), variables=tab.variables, eventos=tab.eventos, origen=subido.name)
        st.sidebar.success(f"Tablero cargado: {subido.name}")
    except ErrorTablero as e:
        st.sidebar.error(str(e))

if "macro" not in st.session_state or st.session_state.get("origen") != tab.origen:
    st.session_state.macro = pd.DataFrame(tab.filas).drop(columns="indice_precios")
    st.session_state.origen = tab.origen


def filas_macro() -> list[dict]:
    return agregar_indice(st.session_state.macro.to_dict("records"))


FILAS = filas_macro()
ANIOS = [int(f["anio"]) for f in FILAS]
OPAS = [e for e in tab.eventos if e["objetivo"] == "Nutresa" and e["precio_usd"]]

anio = st.sidebar.selectbox("Año del caso", ANIOS, index=ANIOS.index(2022) if 2022 in ANIOS else 0)
ref = precio_opa_referencia(tab.eventos, anio)
nombres_opa = [f"{e['evento']} · USD {e['precio_usd']:.2f}" for e in OPAS]
i_opa = st.sidebar.selectbox("OPA de referencia", range(len(OPAS)), format_func=lambda i: nombres_opa[i],
                             index=OPAS.index(ref), key=f"opa_{anio}")
precio = OPAS[i_opa]["precio_usd"]
taylor_endogeno = st.sidebar.toggle("La tasa de política la fija la Regla de Taylor", value=False)

AYUDA = {
    "peso_inflacion": "Peso de (inflación − meta)", "peso_brecha": "Peso de la brecha",
    "prima_plazo": "Prima de plazo (pp)", "transmision": "Transmisión tasa corta → larga",
    "beta": "Beta de Nutresa", "prima_mercado": "Prima de mercado (pp)", "spread_credito": "Spread de crédito (pp)",
    "tasa_impuesto": "Impuesto de renta (%)", "peso_deuda": "Deuda/(Deuda+Patrimonio) %",
    "fcf_por_accion": "Flujo de caja por acción 2021 (COP) · SUPUESTO", "crecimiento_real_lp": "Crecimiento real LP (%)",
    "persistencia_inflacion": "Persistencia de la inflación", "crecimiento_potencial": "PIB potencial (%)",
    "elasticidad_fcf_pib": "Elasticidad flujo–PIB", "exposicion_cambiaria": "Exposición cambiaria neta",
    "trm_referencia": "TRM de referencia", "prima_control": "Prima de control del oferente (%)",
    "beneficio_privado": "Beneficio privado del GEA (%)", "asimetria_info": "Asimetría de información (%)",
    "costo_defensa": "Costo de defensa GEA (%)", "costo_oferta": "Costo OPA fallida (%)",
    "plazo_financiacion": "Plazo de financiación (años)", "alza_oferta": "Alza en «Subir oferta» (%)",
}
with st.sidebar.expander("Supuestos del modelo"):
    valores = {}
    for f in fields(Parametros):
        valores[f.name] = st.number_input(AYUDA.get(f.name, f.name), value=float(f.default), key=f"p_{f.name}",
                                          format="%.2f")
P = Parametros(**valores)

FILA = next(f for f in FILAS if f["anio"] == anio)


def choque_de(clave: str) -> Choque:
    c = st.session_state.get(f"choque_{clave}", ESCENARIOS_PREDETERMINADOS[clave])
    return Choque(**{**c.a_dict(), "tasa_por_taylor": taylor_endogeno})


def resultados() -> dict:
    return {
        "ocurrio": evaluar(FILA, precio, P),
        "favorable": evaluar(aplicar_choque(FILA, choque_de("favorable"), P), precio, P),
        "adverso": evaluar(aplicar_choque(FILA, choque_de("adverso"), P), precio, P),
    }


NOMBRES = {"ocurrio": "Lo que ocurrió", "favorable": "Escenario favorable", "adverso": "Escenario adverso"}

# ---------------------------------------------------------------- encabezado
st.caption("Unidad 3 · Entorno económico de las finanzas")
st.title("Simulador macro-financiero del caso Nutresa–Gilinski")
st.write(f"Datos: **{tab.origen}** · años {ANIOS[0]}–{ANIOS[-1]} · año analizado **{anio}** · OPA USD **{precio:.2f}**")

t1, t2, t3, t4, t5, t6 = st.tabs(["1–2 · Tablero", "Regla de Taylor", "4 · Escenarios",
                                  "3 · Decisiones y juegos", "5 · Variable crítica", "Supuestos y datos"])

# ================================================================ 1. TABLERO
with t1:
    st.subheader("Pasos 1 y 2 · Elige las variables y describe lo que ocurrió")
    VARS = {"tasa_politica": "Tasa de política (%)", "inflacion": "Inflación (%)", "trm_promedio": "TRM promedio (COP/USD)",
            "crecimiento_pib": "Crecimiento PIB (%)", "embi_pbs": "Riesgo país EMBI (pbs)", "brecha_producto": "Brecha del producto (%)"}
    sel = st.multiselect("Variables que pesaron en las decisiones (elige 3 o 4)", list(VARS), format_func=VARS.get,
                         default=["tasa_politica", "inflacion", "trm_promedio", "crecimiento_pib"])
    if not 3 <= len(sel) <= 4:
        st.info("La guía pide elegir entre tres y cuatro variables.")
    meta = {v["variable"]: v for v in tab.variables}
    cols = st.columns(2)
    for i, k in enumerate(sel):
        vals = [f[k] for f in FILAS]
        with cols[i % 2]:
            fig = go.Figure(go.Scatter(x=ANIOS, y=vals, mode="lines+markers", line=dict(color=AZUL, width=2),
                                       marker=dict(size=9), name=VARS[k]))
            st.markdown(f"**{VARS[k]}**")
            st.plotly_chart(layout(fig, 220, showlegend=False).update_xaxes(dtick=1), width="stretch")
            imax, imin = vals.index(max(vals)), vals.index(min(vals))
            st.caption(f"De {vals[0]:,.2f} ({ANIOS[0]}) a {vals[-1]:,.2f} ({ANIOS[-1]}); máximo {vals[imax]:,.2f} en "
                       f"{ANIOS[imax]}, mínimo {vals[imin]:,.2f} en {ANIOS[imin]}. Fuente: {meta.get(k, {}).get('fuente', '—')} "
                       f"· calidad: **{meta.get(k, {}).get('calidad', '—')}**")
    st.markdown("#### Línea de tiempo del caso")
    trm = {f["anio"]: f["trm_promedio"] for f in FILAS}
    st.dataframe(pd.DataFrame([{
        "Fecha": e["fecha"], "Evento": e["evento"], "Objetivo": e["objetivo"],
        "Precio USD": e["precio_usd"], "Precio COP (TRM prom.)": e["precio_usd"] * trm[e["anio"]] if e["precio_usd"] else None,
        "Nota": e["nota"], "Verificar": "sí" if e["verificar"] else ""} for e in tab.eventos]),
        hide_index=True, width="stretch",
        column_config={"Precio USD": st.column_config.NumberColumn(format="%.2f"),
                       "Precio COP (TRM prom.)": st.column_config.NumberColumn(format="$%,.0f")})

# ================================================================ 2. TAYLOR
with t2:
    st.subheader("Regla de Taylor · versión simplificada")
    st.latex(r"i = \pi + r^* + \tfrac{1}{2}(\pi - \pi^{meta}) + \tfrac{1}{2}\,\text{brecha}")
    def fijar(inf, neu, met, bre):
        st.session_state.update(tay_inf=float(inf), tay_neu=float(neu), tay_meta=float(met), tay_bre=float(bre))
    for k, v in {"tay_inf": 9.0, "tay_neu": 2.0, "tay_meta": 3.0, "tay_bre": -1.0}.items():
        st.session_state.setdefault(k, v)
    bcols = st.columns(len(ANIOS) + 1)
    bcols[0].button("▶ Ver el ejemplo", on_click=fijar, args=(9, 2, 3, -1), type="primary")
    for c, f in zip(bcols[1:], FILAS):
        c.button(str(f["anio"]), on_click=fijar, args=(f["inflacion"], f["tasa_real_neutral"], f["meta_inflacion"], f["brecha_producto"]))
    c1, c2 = st.columns(2)
    with c1:
        inf = st.slider("Inflación (%)", 0.0, 20.0, step=0.01, key="tay_inf")
        neu = st.slider("Tasa real neutral (%)", 0.0, 5.0, step=0.1, key="tay_neu")
        met = st.slider("Meta (%)", 1.0, 6.0, step=0.5, key="tay_meta")
        bre = st.slider("Brecha del producto (%)", -6.0, 6.0, step=0.1, key="tay_bre")
    t = regla_taylor(inf, neu, met, bre, P)
    with c2:
        m1, m2 = st.columns(2)
        m1.metric("Tasa según Taylor", pct(t["tasa"], 2))
        m2.metric("Tasa real implícita", pct(t["tasa"] - inf, 2))
        partes = [("Inflación", inf, AZUL), ("Tasa real neutral", neu, NARANJA),
                  ("½ (inflación − meta)", t["termino_inflacion"], VERDE), ("½ (brecha)", t["termino_brecha"], AMARILLO)]
        fig = go.Figure([go.Bar(y=["Tasa"], x=[v], name=n, orientation="h", marker_color=c,
                                marker_pattern_shape="/" if v < 0 else "", text=f"{v:.1f}".replace(".", ","))
                         for n, v, c in partes])
        st.plotly_chart(layout(fig, 170, barmode="relative"), width="stretch")
        st.markdown(f"<div class='lectura'>{inf:.2f} % + {neu:.1f} % + ½({inf:.2f} % − {met:.1f} %) + ½({bre:.1f} %) = "
                    f"<b>{t['tasa']:.2f} %</b></div>".replace(".", ","), unsafe_allow_html=True)
    st.markdown("#### ¿Qué hizo el Banco de la República frente a lo que sugería la regla?")
    serie = serie_taylor(FILAS, P)
    fig = go.Figure([
        go.Scatter(x=ANIOS, y=[s["tasa_observada"] for s in serie], name="Tasa BanRep", mode="lines+markers", line_color=AZUL),
        go.Scatter(x=ANIOS, y=[s["tasa"] for s in serie], name="Regla de Taylor", mode="lines+markers",
                   line=dict(color=NARANJA, dash="dash"))])
    st.plotly_chart(layout(fig, 300).update_xaxes(dtick=1), width="stretch")
    st.dataframe(pd.DataFrame([{"Año": s["anio"], "Inflación": s["inflacion"], "Taylor": s["tasa"], "BanRep": s["tasa_observada"],
                                "Diferencia (pp)": s["desvio"], "Tasa real ex post": s["tasa_real_ex_post"]} for s in serie])
                 .style.format(precision=2), hide_index=True, width="stretch")
    st.caption("Diferencia negativa = BanRep más laxo que la regla. La regla del curso usa inflación observada; BanRep decide con inflación esperada.")

# ================================================================ 3. ESCENARIOS
CTRL = [("d_tasa", "Δ Tasa de política (pp)", -6.0, 6.0, 0.25), ("d_inflacion", "Δ Inflación (pp)", -6.0, 6.0, 0.1),
        ("d_trm_pct", "Δ Tasa de cambio (%) · + = devaluación", -25.0, 25.0, 1.0),
        ("d_crecimiento", "Δ Crecimiento PIB (pp)", -5.0, 5.0, 0.1), ("d_embi", "Δ Riesgo país (pbs)", -200.0, 300.0, 10.0)]
with t3:
    st.subheader("Paso 4 · Construye dos escenarios alternativos")
    cf, ca = st.columns(2)
    for col, clave, titulo in [(cf, "favorable", "☀ Más favorable (tasas bajas)"), (ca, "adverso", "☁ Más adverso (prima de riesgo mayor)")]:
        with col:
            st.markdown(f"**{titulo}**")
            base = ESCENARIOS_PREDETERMINADOS[clave]
            vals = {c: st.slider(et, mi, ma, float(getattr(base, c)), pa, key=f"{clave}_{c}",
                                 disabled=(c == "d_tasa" and taylor_endogeno)) for c, et, mi, ma, pa in CTRL}
            st.session_state[f"choque_{clave}"] = Choque(nombre=base.nombre, **vals)
    R = resultados()
    filas_tabla = [
        ("Tasa de política", "Dato/Supuesto", lambda r: pct(r["entorno"]["tasa_politica"], 2)),
        ("Inflación", "Dato/Supuesto", lambda r: pct(r["entorno"]["inflacion"], 2)),
        ("Tasa de cambio (TRM)", "Dato/Supuesto", lambda r: cop(r["entorno"]["trm_promedio"])),
        ("Crecimiento PIB", "Dato/Supuesto", lambda r: pct(r["entorno"]["crecimiento_pib"])),
        ("Riesgo país (EMBI)", "Dato/Supuesto", lambda r: f"{r['entorno']['embi_pbs']:.0f} pbs"),
        ("Costo de financiación (Kd)", "Modelo", lambda r: pct(r["valoracion"]["kd"])),
        ("WACC", "Modelo", lambda r: pct(r["valoracion"]["wacc"])),
        ("Valor fundamental por acción", "Modelo", lambda r: cop(r["valoracion"]["valor_accion"])),
        ("Precio OPA en pesos", "Modelo", lambda r: cop(r["precio_opa_cop"])),
        ("Prima OPA vs. valor", "Modelo", lambda r: signo(r["prima_opa"], 0, " %")),
        ("Resultado del juego", "Modelo", lambda r: r["juego"]["resultado"]),
    ]

    def efecto(b, e):
        dv = (e["valoracion"]["valor_accion"] / b["valoracion"]["valor_accion"] - 1) * 100
        dk = e["valoracion"]["kd"] - b["valoracion"]["kd"]
        return (f"Kd {'sube' if dk >= 0 else 'baja'} {abs(dk):.1f} pp; valor {'sube' if dv >= 0 else 'cae'} {abs(dv):.0f} %; "
                f"OPA {'con prima' if e['prima_opa'] >= 0 else 'con descuento'} de {abs(e['prima_opa']):.0f} %; "
                + ("hay zona de acuerdo." if e["juego"]["zona"]["existe"] else "sin zona de acuerdo → bloqueo."))
    df = pd.DataFrame([{"Variable": n, "Tipo": tp, **{NOMBRES[k]: f(R[k]) for k in R}} for n, tp, f in filas_tabla]
                      + [{"Variable": "Efecto en las decisiones", "Tipo": "Tu análisis", NOMBRES["ocurrio"]: "Referencia (dato del tablero)",
                          NOMBRES["favorable"]: efecto(R["ocurrio"], R["favorable"]), NOMBRES["adverso"]: efecto(R["ocurrio"], R["adverso"])}])
    st.markdown(f"#### Plantilla de escenarios · {anio}")
    st.dataframe(df, hide_index=True, width="stretch", height=470)
    d1, d2 = st.columns(2)
    d1.download_button("Descargar CSV", df.to_csv(index=False, sep=";").encode("utf-8-sig"), f"plantilla_{anio}.csv", "text/csv")
    buf = io.BytesIO()
    df.to_excel(buf, index=False, sheet_name=f"Plantilla {anio}")
    d2.download_button("Descargar Excel", buf.getvalue(), f"plantilla_{anio}.xlsx")

# ================================================================ 4. DECISIONES
with t4:
    st.subheader("Paso 3 · Relaciona con las decisiones")
    R = resultados()
    clave = st.radio("Escenario", list(NOMBRES), format_func=NOMBRES.get, horizontal=True)
    r, b = R[clave], R["ocurrio"]
    v, vb = r["valoracion"], b["valoracion"]
    delta = (lambda x, y: None) if clave == "ocurrio" else (lambda x, y: signo(x - y))
    c = st.columns(5)
    c[0].metric("Tasa de política", pct(r["entorno"]["tasa_politica"], 2), delta(r["entorno"]["tasa_politica"], b["entorno"]["tasa_politica"]), delta_color="inverse")
    c[1].metric("Tasa larga (TES)", pct(v["tasa_larga"]), delta(v["tasa_larga"], vb["tasa_larga"]), delta_color="inverse")
    c[2].metric("Kd · costo de financiación", pct(v["kd"]), delta(v["kd"], vb["kd"]), delta_color="inverse")
    c[3].metric("Valor por acción", cop(v["valor_accion"]),
                None if clave == "ocurrio" else signo((v["valor_accion"] / vb["valor_accion"] - 1) * 100, 1, " %"))
    c[4].metric("OPA vs. valor", signo(r["prima_opa"], 0, " %"), f"OPA {cop(r['precio_opa_cop'])}", delta_color="off")

    J = r["juego"]
    cm, cz = st.columns(2)
    with cm:
        st.markdown("**Matriz de pagos** (Gilinski/IHC, GEA) · miles de COP por acción")
        eo, ed = ["Subir oferta", "Mantener oferta"], ["Vender", "Retener"]
        mat = pd.DataFrame([[f"({c[0] / 1000:.1f}, {c[1] / 1000:.1f})" + (" ★Nash" if [i, j] in J["nash"] else "")
                             + (" ◆Secuencial" if J["secuencial"] == [i, j] else "") for j, c in enumerate(fila)]
                            for i, fila in enumerate(J["matriz"])], index=eo, columns=ed)
        st.table(mat)
        st.markdown(f"<div class='lectura'>Resultado: <b>{J['resultado']}</b>. "
                    f"Nash: {', '.join(f'{eo[i]}/{ed[j]}' for i, j in J['nash']) or 'no hay en estrategias puras'}.</div>",
                    unsafe_allow_html=True)
    with cz:
        z = J["zona"]
        st.markdown("**Zona de acuerdo**")
        marcas = [("Valor modelo", v["valor_accion"], AMARILLO), ("OPA", r["precio_opa_cop"], VERDE),
                  ("Máx. oferente", z["maximo_oferente"], AZUL), ("Reserva GEA", z["reserva_gea"], NARANJA)]
        fig = go.Figure()
        fig.add_vrect(x0=min(z["reserva_gea"], z["maximo_oferente"]), x1=max(z["reserva_gea"], z["maximo_oferente"]),
                      fillcolor="rgba(27,175,122,.2)" if z["existe"] else "rgba(227,73,72,.18)", line_width=0)
        for i, (n, x, col) in enumerate(marcas):
            fig.add_trace(go.Scatter(x=[x], y=[0], mode="markers+text", marker=dict(size=14, color=col), name=n,
                                     text=[f"{n}<br>{cop(x)}"], textposition="top center" if i % 2 else "bottom center"))
        xs = [m[1] for m in marcas]
        holg = (max(xs) - min(xs)) * 0.18 or 1000
        fig.update_xaxes(range=[min(xs) - holg, max(xs) + holg])
        fig.update_yaxes(visible=False, range=[-1, 1])
        st.plotly_chart(layout(fig, 230, showlegend=False), width="stretch")
        st.markdown(f"<div class='lectura'>{'Hay zona de acuerdo de ' + cop(z['holgura']) if z['existe'] else 'No hay zona de acuerdo: brecha de ' + cop(-z['holgura'])} por acción.</div>",
                    unsafe_allow_html=True)
    st.markdown("#### Incentivos de cada participante")
    a = st.columns(4)
    a[0].info(f"**Gilinski / IHC**\n\nFinancia a Kd ≈ {pct(v['kd'])}. Paga en USD: una TRM alta hace su oferta más grande en pesos.")
    umbral = J["beneficio_umbral"]
    a[1].warning(f"**GEA (Sura, Argos)**\n\n" + ("Incluso sin beneficio privado, la OPA está por debajo de lo que cree que vale Nutresa."
                 if umbral < 0 else f"Rechaza si su beneficio privado de control supera {pct(umbral, 0)}."))
    a[2].success(f"**Minoritarios y fondos**\n\n{'Aceptan' if J['minoritarios_aceptan'] else 'No aceptan'}: OPA {cop(r['precio_opa_cop'])} vs. valor {cop(v['valor_accion'])}.")
    a[3].info(f"**Banco de la República**\n\nTasa {pct(r['entorno']['tasa_politica'], 2)} vs. Taylor {pct(r['taylor']['tasa'], 2)}.")

# ================================================================ 5. VARIABLE CRÍTICA
with t5:
    st.subheader("Paso 5 · Identifica la variable crítica")
    st.caption("Cada variable se mueve ±1 desviación estándar de lo observado en 2021–2024, dejando lo demás igual.")
    s = sensibilidad(FILAS, anio, precio, P)
    base = evaluar(FILA, precio, P)
    for x in s:
        ch = {"tasa_politica": "d_tasa", "inflacion": "d_inflacion", "trm_promedio": "d_trm_pct",
              "crecimiento_pib": "d_crecimiento", "embi_pbs": "d_embi"}[x["variable"]]
        for sg, k in [(1, "opa_sube"), (-1, "opa_baja")]:
            x[k] = evaluar(aplicar_choque(FILA, Choque(**{ch: sg * x["choque"]}), P), precio, P)["prima_opa"] - base["prima_opa"]

    def tornado(campos, titulo, unidad):
        orden = sorted(s, key=lambda x: max(abs(x[campos[0]]), abs(x[campos[1]])))
        fig = go.Figure([go.Bar(y=[x["etiqueta"] for x in orden], x=[x[c] for x in orden], orientation="h", name=n,
                                marker_color=col, text=[f"{x[c]:+.1f}{unidad}" for x in orden], textposition="outside")
                         for c, n, col in [(campos[0], "Variable sube", AZUL), (campos[1], "Variable baja", NARANJA)]])
        st.markdown(f"**{titulo}**")
        st.plotly_chart(layout(fig, 320, barmode="group"), width="stretch")
    c1, c2 = st.columns(2)
    with c1:
        tornado(("valor_sube", "valor_baja"), "Efecto en el valor por acción (%)", " %")
    with c2:
        tornado(("opa_sube", "opa_baja"), "Efecto en la prima de la OPA (pp)", " pp")
    top = s[0]
    top_opa = max(s, key=lambda x: max(abs(x["opa_sube"]), abs(x["opa_baja"])))
    st.markdown(f"<div class='lectura'>La variable que más mueve la <b>valoración</b> en {anio} es <b>{top['etiqueta'].lower()}</b> "
                f"(±{top['choque']:.1f} {top['unidad']} → entre {top['valor_baja']:+.1f} % y {top['valor_sube']:+.1f} %). "
                f"La que más cambia el <b>atractivo de la OPA</b> es <b>{top_opa['etiqueta'].lower()}</b>.</div>",
                unsafe_allow_html=True)
    st.caption("Es evidencia para tu argumento: en el borrador explica por qué, en tu opinión, esa variable condicionó las decisiones.")

# ================================================================ 6. SUPUESTOS Y DATOS
with t6:
    st.subheader("Tablero de coyuntura (editable)")
    st.caption("Los cambios se aplican a toda la app. Para cambios permanentes edita datos/macro_colombia.csv.")
    editado = st.data_editor(st.session_state.macro, hide_index=True, width="stretch", key="editor_macro")
    if not editado.equals(st.session_state.macro):
        st.session_state.macro = editado
        st.rerun()
    if st.button("Restaurar datos"):
        st.session_state.pop("macro")
        st.rerun()
    st.subheader("Fuentes y calidad del dato")
    st.dataframe(pd.DataFrame(tab.variables), hide_index=True, width="stretch")

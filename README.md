# Simulador macro-financiero · Caso Nutresa–Gilinski (2021–2024)

Proyecto en **Python + HTML** para la Unidad 3 (*Entorno económico de las finanzas*):
simula la **Regla de Taylor**, construye **escenarios favorable/adverso** con el tablero de
coyuntura y relaciona el entorno con las decisiones del caso usando **teoría de juegos**.
Sigue los 5 pasos del *borrador de entorno* y diligencia la *plantilla de escenarios*.

## Arranque rápido en VS Code

1. Descomprime la carpeta y ábrela en VS Code: **Archivo → Abrir carpeta…**
2. Acepta instalar las extensiones recomendadas (Python, Live Server).
3. **Terminal → Ejecutar tarea… → Crear entorno virtual** (o en la terminal):
   ```bash
   # Windows
   py -m venv .venv
   .venv\Scripts\activate
   pip install -r requirements.txt
   # macOS / Linux
   python3 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt
   ```
4. Selecciona el intérprete `.venv` (Ctrl+Shift+P → *Python: Select Interpreter*).
5. Pulsa **F5** y elige **«0 · App Python (Streamlit)»**, o en la terminal:
   ```bash
   streamlit run app/app.py
   ```
   Se abre en el navegador (`http://localhost:8501`). Todo es Python: cambias el
   código, guardas y la app se actualiza sola («Always rerun»).

**Dos interfaces, un mismo modelo:**

| Interfaz | Cómo se abre | Para qué |
|---|---|---|
| `app/app.py` (Streamlit, 100 % Python) | F5 → «0 · App Python» | Trabajar y modificar todo en Python; subir el tablero desde la barra lateral; descargar la plantilla en CSV/Excel |
| `web/index.html` (HTML + JS) | F5 → «2 · Abrir simulador», o doble clic | Compartir sin instalar nada (`salidas/simulador_nutresa.html`) |

## Arquitectura por capas

```
simulador-nutresa/
├── datos/                      CAPA 1 · Datos
│   ├── macro_colombia.csv        tablero 2021-2024 (tasa, inflación, TRM, PIB, EMBI, brecha)
│   ├── variables.csv             fuente y calidad de cada variable (oficial/aproximado/supuesto)
│   ├── eventos_caso.csv          OPA y hitos del caso (precio USD, participación)
│   └── crudos/                   ← pon aquí el tablero del curso (xlsx/csv)
├── src/nutresa_sim/            CAPAS 0-4 · Modelo en Python
│   ├── config.py                 0 · supuestos (Parametros) y escenarios predeterminados
│   ├── datos.py                  1 · carga/valida el tablero (alias de columnas, coma decimal, formato largo)
│   ├── taylor.py                 2a · Regla de Taylor simplificada
│   ├── finanzas.py               2b · tasa larga → Kd, Ke, WACC → valor por acción (Gordon)
│   ├── juegos.py                 2c · juego Gilinski vs. GEA: Nash, solución secuencial, zona de acuerdo
│   ├── escenarios.py             3 · choques, plantilla del curso, variable crítica (sensibilidad)
│   ├── exportar.py               4 · web/data/datos.js, Excel de la plantilla, HTML único
│   └── __main__.py               línea de comandos
├── app/app.py                  CAPA 5 (Python) · app Streamlit: 6 pestañas, usa src/nutresa_sim
├── web/                        CAPAS 5-6 · Interfaz HTML (alternativa)
│   ├── index.html                estructura (6 pestañas + los 5 pasos del curso)
│   ├── css/estilos.css           presentación (modo claro/oscuro)
│   ├── js/modelo.js              espejo del modelo Python para recalcular en vivo
│   ├── js/graficos.js            gráficos SVG sin dependencias (funciona sin internet)
│   ├── js/app.js                 estado, controles y dibujo
│   └── data/datos.js             GENERADO por Python (no editar a mano)
├── scripts/construir.py        atajo: python scripts/construir.py
├── tests/test_modelo.py        pruebas (incluye el ejemplo del curso: 13,5 %)
├── salidas/                    plantilla_escenarios.xlsx y simulador_nutresa.html
└── .vscode/                    F5, tareas, pruebas y extensiones recomendadas
```

**Flujo:** `datos/*.csv` → Python calcula → `web/data/datos.js` → el HTML lo lee y
recalcula en vivo con `modelo.js`. Al cargar, la web vuelve a calcular los casos de
control de Python y muestra **«✓ Modelo web = modelo Python»** si coinciden.

## Usar el tablero real del curso

El archivo `Tablero_Economico_Estilizado.xlsx` que se intentó usar era en realidad la
página de inicio de sesión del aula (HTML). Descárgalo de nuevo ya autenticado y:

```bash
python scripts/construir.py construir --tablero datos/crudos/Tablero_Economico_Estilizado.xlsx
```

El cargador busca la fila de encabezados con «Año», reconoce nombres como
«Tasa de política», «Inflación», «TRM», «Crecimiento», «EMBI», «Brecha del producto»,
acepta coma decimal y tableros en formato largo (variables en filas, años en columnas).
Si una columna tiene otro nombre, agrégalo a `ALIAS` en `src/nutresa_sim/datos.py`.
Si te detecta un HTML disfrazado, te lo dice con un mensaje claro.

## Comandos

```bash
python scripts/construir.py                       # construir todo
python scripts/construir.py servir                # servidor local + navegador
python scripts/construir.py taylor --inflacion 9 --neutral 2 --meta 3 --brecha -1   # → 13,50 %
python scripts/construir.py escenario --anio 2022 --tasa -3 --trm 10 --embi -80
python scripts/construir.py escenario --anio 2022 --taylor        # la tasa la fija la regla
python -m pytest -q
```

## Qué modela (y qué no)

| Bloque | Ecuación |
|---|---|
| Regla de Taylor | `i = π + r* + ½(π − meta) + ½(brecha)` |
| Tasa larga | `TES = (r* + meta) + prima de plazo + θ·(i − (r* + meta))` |
| Costo de deuda | `Kd = TES + spread`; `Kd neto = Kd·(1 − t)` |
| Costo del patrimonio | `Ke = TES + EMBI + β·prima de mercado` |
| Valor por acción | `FCF·(1+g)/(WACC − g)`, con `g` = crecimiento real + inflación esperada; FCF sensible al ciclo y a la TRM |
| OPA en pesos | `precio USD × TRM` |
| Juego | Oferente {Subir, Mantener} × GEA {Vender, Retener}; asimetría de información, beneficio privado de control, prima de control, costo de financiación |
| Variable crítica | choque de ±1 desviación estándar 2021–2024 en cada variable |

Es un modelo **pedagógico**: los niveles absolutos dependen de supuestos (sobre todo
`fcf_por_accion`); lo que importa es la **dirección** y el **tamaño relativo** de los efectos.
Todos los supuestos están en `config.py` y en la pestaña *Supuestos y datos*.

## Datos y fuentes

| Variable | 2021 | 2022 | 2023 | 2024 | Fuente | Calidad |
|---|---|---|---|---|---|---|
| Tasa de política (cierre) | 3,00 | 12,00 | 13,00 | 9,50 | BanRep | oficial |
| Inflación anual (dic.) | 5,62 | 13,12 | 9,28 | 5,20 | DANE | oficial |
| Crecimiento PIB | 10,8 | 7,3 | 0,7 | 1,7 | DANE (revisado) | oficial |
| TRM promedio | 3.743 | 4.255 | 4.325 | 4.071 | BanRep | oficial |
| Brecha del producto | −1,0 | 3,0 | 0,5 | −0,8 | aprox. IPoM BanRep | **aproximado** |
| EMBI Colombia (pbs) | 353 | 371 | 300 | 330 | JP Morgan, aprox. | **aproximado** |

Precios de OPA: 1.ª USD 7,71 (27,69 %), 2.ª USD 10,48, 3.ª USD 12,58, IHC USD 15,00,
cierre del acuerdo USD 12,00 (**verificar**). Reemplaza lo «aproximado» y lo marcado
«verificar» con el tablero y la cronología del curso.

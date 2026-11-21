// Generado por Python (scripts/construir.py). No editar a mano.
window.DATOS = {
 "generado": "2026-11-20T08:09:00",
 "origen": "macro_colombia.csv",
 "macro": [
  {
   "anio": 2021,
   "tasa_politica": 3.0,
   "inflacion": 5.62,
   "meta_inflacion": 3.0,
   "tasa_real_neutral": 2.0,
   "brecha_producto": -1.0,
   "crecimiento_pib": 10.8,
   "trm_promedio": 3743.09,
   "trm_cierre": 3981.16,
   "embi_pbs": 353.0,
   "indice_precios": 1.0
  },
  {
   "anio": 2022,
   "tasa_politica": 12.0,
   "inflacion": 13.12,
   "meta_inflacion": 3.0,
   "tasa_real_neutral": 2.0,
   "brecha_producto": 3.0,
   "crecimiento_pib": 7.3,
   "trm_promedio": 4255.44,
   "trm_cierre": 4810.2,
   "embi_pbs": 371.0,
   "indice_precios": 1.1312
  },
  {
   "anio": 2023,
   "tasa_politica": 13.0,
   "inflacion": 9.28,
   "meta_inflacion": 3.0,
   "tasa_real_neutral": 2.0,
   "brecha_producto": 0.5,
   "crecimiento_pib": 0.7,
   "trm_promedio": 4325.05,
   "trm_cierre": 3822.05,
   "embi_pbs": 300.0,
   "indice_precios": 1.236175
  },
  {
   "anio": 2024,
   "tasa_politica": 9.5,
   "inflacion": 5.2,
   "meta_inflacion": 3.0,
   "tasa_real_neutral": 2.0,
   "brecha_producto": -0.8,
   "crecimiento_pib": 1.7,
   "trm_promedio": 4071.35,
   "trm_cierre": 4409.15,
   "embi_pbs": 330.0,
   "indice_precios": 1.300456
  }
 ],
 "variables": [
  {
   "variable": "tasa_politica",
   "etiqueta": "Tasa de política (cierre)",
   "unidad": "%",
   "fuente": "Banco de la República - decisiones de la Junta Directiva",
   "calidad": "oficial",
   "nota": "Tasa vigente al cierre de diciembre"
  },
  {
   "variable": "inflacion",
   "etiqueta": "Inflación anual (diciembre)",
   "unidad": "%",
   "fuente": "DANE - IPC; comunicados BanRep",
   "calidad": "oficial",
   "nota": "Variación anual del IPC a diciembre"
  },
  {
   "variable": "meta_inflacion",
   "etiqueta": "Meta de inflación",
   "unidad": "%",
   "fuente": "Banco de la República",
   "calidad": "oficial",
   "nota": "Meta puntual 3 % (rango 2-4 %)"
  },
  {
   "variable": "tasa_real_neutral",
   "etiqueta": "Tasa real neutral",
   "unidad": "%",
   "fuente": "Supuesto del curso (Regla de Taylor simplificada)",
   "calidad": "supuesto",
   "nota": "BanRep estima un rango cercano a 1-2 %"
  },
  {
   "variable": "brecha_producto",
   "etiqueta": "Brecha del producto",
   "unidad": "% del PIB potencial",
   "fuente": "Estimación aproximada a partir de los IPoM de BanRep",
   "calidad": "aproximado",
   "nota": "Reemplazar con el dato del tablero del curso"
  },
  {
   "variable": "crecimiento_pib",
   "etiqueta": "Crecimiento del PIB real",
   "unidad": "%",
   "fuente": "DANE - cuentas nacionales (revisadas)",
   "calidad": "oficial",
   "nota": "2023 revisado a 0.7 %; 2024 = 1.7 %"
  },
  {
   "variable": "trm_promedio",
   "etiqueta": "TRM promedio anual",
   "unidad": "COP por USD",
   "fuente": "Banco de la República - serie TRM",
   "calidad": "oficial",
   "nota": "Promedio de los días del año"
  },
  {
   "variable": "trm_cierre",
   "etiqueta": "TRM de cierre",
   "unidad": "COP por USD",
   "fuente": "Banco de la República - serie TRM",
   "calidad": "oficial",
   "nota": "Último dato de diciembre"
  },
  {
   "variable": "embi_pbs",
   "etiqueta": "Riesgo país (EMBI Colombia)",
   "unidad": "puntos básicos",
   "fuente": "JP Morgan EMBI (aprox. cierre de año)",
   "calidad": "aproximado",
   "nota": "Reemplazar con el dato del tablero del curso"
  }
 ],
 "eventos": [
  {
   "fecha": "2021-11-10",
   "anio": 2021,
   "evento": "1.ª OPA por Nutresa (Nugil)",
   "objetivo": "Nutresa",
   "precio_usd": 7.71,
   "participacion_gilinski": 27.69,
   "verificar": false,
   "nota": "Buscaba 50.1-62.6 %; cerró el 12-ene-2022 con 27.69 %"
  },
  {
   "fecha": "2021-11-24",
   "anio": 2021,
   "evento": "1.ª OPA por Grupo Sura",
   "objetivo": "Sura",
   "precio_usd": 8.01,
   "participacion_gilinski": null,
   "verificar": false,
   "nota": "Adjudicado 25.25 % de Sura"
  },
  {
   "fecha": "2022-01-17",
   "anio": 2022,
   "evento": "2.ª OPA por Nutresa",
   "objetivo": "Nutresa",
   "precio_usd": 10.48,
   "participacion_gilinski": 30.8,
   "verificar": false,
   "nota": "Adquirió ~14.24 millones de acciones adicionales (~3.1 %)"
  },
  {
   "fecha": "2022-01-17",
   "anio": 2022,
   "evento": "2.ª OPA por Grupo Sura",
   "objetivo": "Sura",
   "precio_usd": 9.88,
   "participacion_gilinski": null,
   "verificar": false,
   "nota": "Buscaba 5-6.25 % adicional"
  },
  {
   "fecha": "2022-04-18",
   "anio": 2022,
   "evento": "3.ª OPA por Nutresa",
   "objetivo": "Nutresa",
   "precio_usd": 12.58,
   "participacion_gilinski": null,
   "verificar": true,
   "nota": "Buscaba 9.6-12 %; Gilinski la declinó en mayo-2022"
  },
  {
   "fecha": "2022-06-01",
   "anio": 2022,
   "evento": "OPA por Grupo Argos",
   "objetivo": "Argos",
   "precio_usd": null,
   "participacion_gilinski": null,
   "verificar": true,
   "nota": "Solo alcanzó 11.08 %; la BVC la declaró desierta"
  },
  {
   "fecha": "2022-09-20",
   "anio": 2022,
   "evento": "OPA de IHC (Abu Dabi) por Nutresa",
   "objetivo": "Nutresa",
   "precio_usd": 15.0,
   "participacion_gilinski": null,
   "verificar": false,
   "nota": "Hasta 31.25 %; GEA no vendió y la oferta fracasó"
  },
  {
   "fecha": "2023-06-15",
   "anio": 2023,
   "evento": "Acuerdo Marco Gilinski-GEA",
   "objetivo": "Nutresa",
   "precio_usd": null,
   "participacion_gilinski": null,
   "verificar": true,
   "nota": "Intercambio de acciones + escisión en lugar de pago en efectivo"
  },
  {
   "fecha": "2024-01-15",
   "anio": 2024,
   "evento": "OPA final por Nutresa (cierre del acuerdo)",
   "objetivo": "Nutresa",
   "precio_usd": 12.0,
   "participacion_gilinski": null,
   "verificar": true,
   "nota": "Ejecución del Acuerdo Marco; verificar precio y fechas exactas"
  }
 ],
 "parametros": {
  "peso_inflacion": 0.5,
  "peso_brecha": 0.5,
  "prima_plazo": 1.5,
  "transmision": 0.5,
  "beta": 0.8,
  "prima_mercado": 5.5,
  "spread_credito": 2.5,
  "tasa_impuesto": 35.0,
  "peso_deuda": 30.0,
  "fcf_por_accion": 2100.0,
  "crecimiento_real_lp": 2.5,
  "persistencia_inflacion": 0.3,
  "crecimiento_potencial": 3.0,
  "elasticidad_fcf_pib": 0.8,
  "exposicion_cambiaria": 0.2,
  "trm_referencia": 3743.09,
  "prima_control": 25.0,
  "beneficio_privado": 10.0,
  "asimetria_info": 15.0,
  "costo_defensa": 3.0,
  "costo_oferta": 2.0,
  "plazo_financiacion": 0.5,
  "alza_oferta": 20.0
 },
 "escenarios": {
  "favorable": {
   "nombre": "Más favorable",
   "d_tasa": -3.0,
   "d_inflacion": -2.0,
   "d_trm_pct": -8.0,
   "d_crecimiento": 1.0,
   "d_embi": -80,
   "tasa_por_taylor": false,
   "descripcion": "Tasas bajas: inflación contenida, peso más fuerte y menor riesgo país."
  },
  "adverso": {
   "nombre": "Más adverso",
   "d_tasa": 2.0,
   "d_inflacion": 2.0,
   "d_trm_pct": 12.0,
   "d_crecimiento": -1.5,
   "d_embi": 150,
   "tasa_por_taylor": false,
   "descripcion": "Prima de riesgo mayor: más inflación, peso débil y riesgo país alto."
  }
 },
 "taylor": [
  {
   "inflacion": 5.62,
   "tasa_real_neutral": 2.0,
   "termino_inflacion": 1.31,
   "termino_brecha": -0.5,
   "tasa": 8.43,
   "anio": 2021,
   "tasa_observada": 3.0,
   "desvio": -5.43,
   "tasa_real_ex_post": -2.62
  },
  {
   "inflacion": 13.12,
   "tasa_real_neutral": 2.0,
   "termino_inflacion": 5.06,
   "termino_brecha": 1.5,
   "tasa": 21.68,
   "anio": 2022,
   "tasa_observada": 12.0,
   "desvio": -9.68,
   "tasa_real_ex_post": -1.1199999999999992
  },
  {
   "inflacion": 9.28,
   "tasa_real_neutral": 2.0,
   "termino_inflacion": 3.1399999999999997,
   "termino_brecha": 0.25,
   "tasa": 14.669999999999998,
   "anio": 2023,
   "tasa_observada": 13.0,
   "desvio": -1.6699999999999982,
   "tasa_real_ex_post": 3.7200000000000006
  },
  {
   "inflacion": 5.2,
   "tasa_real_neutral": 2.0,
   "termino_inflacion": 1.1,
   "termino_brecha": -0.4,
   "tasa": 7.9,
   "anio": 2024,
   "tasa_observada": 9.5,
   "desvio": 1.5999999999999996,
   "tasa_real_ex_post": 4.3
  }
 ],
 "por_anio": {
  "2021": {
   "opa_referencia": {
    "fecha": "2021-11-10",
    "anio": 2021,
    "evento": "1.ª OPA por Nutresa (Nugil)",
    "objetivo": "Nutresa",
    "precio_usd": 7.71,
    "participacion_gilinski": 27.69,
    "verificar": false,
    "nota": "Buscaba 50.1-62.6 %; cerró el 12-ene-2022 con 27.69 %"
   },
   "plantilla": {
    "columnas": [
     "ocurrio",
     "favorable",
     "adverso"
    ],
    "filas": [
     {
      "clave": "tasa_politica",
      "etiqueta": "Tasa de política",
      "tipo": "dato",
      "valores": [
       "3.00 %",
       "0.00 %",
       "5.00 %"
      ]
     },
     {
      "clave": "inflacion",
      "etiqueta": "Inflación",
      "tipo": "dato",
      "valores": [
       "5.62 %",
       "3.62 %",
       "7.62 %"
      ]
     },
     {
      "clave": "trm_promedio",
      "etiqueta": "Tasa de cambio (TRM)",
      "tipo": "dato",
      "valores": [
       "$3,743",
       "$3,444",
       "$4,192"
      ]
     },
     {
      "clave": "crecimiento_pib",
      "etiqueta": "Crecimiento PIB",
      "tipo": "dato",
      "valores": [
       "10.8 %",
       "11.8 %",
       "9.3 %"
      ]
     },
     {
      "clave": "embi_pbs",
      "etiqueta": "Riesgo país (EMBI)",
      "tipo": "dato",
      "valores": [
       "353 pbs",
       "273 pbs",
       "503 pbs"
      ]
     },
     {
      "clave": "kd",
      "etiqueta": "Costo de financiación (Kd)",
      "tipo": "efecto",
      "valores": [
       "8.0 %",
       "6.5 %",
       "9.0 %"
      ]
     },
     {
      "clave": "wacc",
      "etiqueta": "WACC",
      "tipo": "efecto",
      "valores": [
       "11.0 %",
       "9.1 %",
       "12.9 %"
      ]
     },
     {
      "clave": "valor_accion",
      "etiqueta": "Valor fundamental por acción",
      "tipo": "efecto",
      "valores": [
       "$51,817",
       "$71,045",
       "$40,891"
      ]
     },
     {
      "clave": "precio_opa_cop",
      "etiqueta": "Precio OPA en pesos",
      "tipo": "efecto",
      "valores": [
       "$28,859",
       "$26,550",
       "$32,322"
      ]
     },
     {
      "clave": "juego",
      "etiqueta": "Resultado del juego",
      "tipo": "efecto",
      "valores": [
       "Mantener oferta / GEA retener",
       "Mantener oferta / GEA retener",
       "Mantener oferta / GEA retener"
      ]
     },
     {
      "clave": "analisis",
      "etiqueta": "Efecto en las decisiones",
      "tipo": "analisis",
      "valores": [
       "Escenario de referencia (dato del tablero).",
       "Kd baja 1.5 pp; valor por acción +37 %; OPA con descuento de 63 % vs. valor; sin zona de acuerdo → bloqueo.",
       "Kd sube 1.0 pp; valor por acción −21 %; OPA con descuento de 21 % vs. valor; sin zona de acuerdo → bloqueo."
      ]
     }
    ]
   },
   "resultados": {
    "ocurrio": {
     "entorno": {
      "anio": 2021,
      "tasa_politica": 3.0,
      "inflacion": 5.62,
      "meta_inflacion": 3.0,
      "tasa_real_neutral": 2.0,
      "brecha_producto": -1.0,
      "crecimiento_pib": 10.8,
      "trm_promedio": 3743.09,
      "trm_cierre": 3981.16,
      "embi_pbs": 353.0,
      "indice_precios": 1.0
     },
     "taylor": {
      "inflacion": 5.62,
      "tasa_real_neutral": 2.0,
      "termino_inflacion": 1.31,
      "termino_brecha": -0.5,
      "tasa": 8.43
     },
     "valoracion": {
      "tasa_larga": 5.5,
      "ke": 13.43,
      "kd": 8.0,
      "kd_neto": 5.2,
      "wacc": 10.961,
      "inflacion_esperada": 3.786,
      "g": 6.380649999999988,
      "fcf": 2231.04,
      "valor_accion": 51816.88852947904,
      "valor_empresa_billones": 23.73192560627174
     },
     "precio_opa_usd": 7.71,
     "precio_opa_cop": 28859.2239,
     "prima_opa": -44.305370856874674,
     "juego": {
      "matriz": [
       [
        [
         28754.799234648803,
         -30917.295309790978
        ],
        [
         -692.6213736,
         -1787.6826542670265
        ]
       ],
       [
        [
         34757.5178058488,
         -36689.14008979098
        ],
        [
         -577.184478,
         -1787.6826542670265
        ]
       ]
      ],
      "nash": [
       [
        1,
        1
       ]
      ],
      "secuencial": [
       1,
       1
      ],
      "resultado": "Mantener oferta / GEA retener",
      "zona": {
       "reserva_gea": 63760.68133552395,
       "maximo_oferente": 62279.914097931534,
       "existe": false,
       "holgura": -1480.7672375924158
      },
      "minoritarios_aceptan": false,
      "beneficio_umbral": -48.56988770163013
     }
    },
    "favorable": {
     "entorno": {
      "anio": 2021,
      "tasa_politica": 0.0,
      "inflacion": 3.62,
      "meta_inflacion": 3.0,
      "tasa_real_neutral": 2.0,
      "brecha_producto": 0.0,
      "crecimiento_pib": 11.8,
      "trm_promedio": 3443.6428,
      "trm_cierre": 3662.6672,
      "embi_pbs": 273.0,
      "indice_precios": 1.0
     },
     "taylor": {
      "inflacion": 3.62,
      "tasa_real_neutral": 2.0,
      "termino_inflacion": 0.31000000000000005,
      "termino_brecha": 0.0,
      "tasa": 5.93
     },
     "valoracion": {
      "tasa_larga": 4.0,
      "ke": 11.13,
      "kd": 6.5,
      "kd_neto": 4.2250000000000005,
      "wacc": 9.0585,
      "inflacion_esperada": 3.186,
      "g": 5.76565,
      "fcf": 2211.87456,
      "valor_accion": 71044.94603667462,
      "valor_empresa_billones": 32.53829826321499
     },
     "precio_opa_usd": 7.71,
     "precio_opa_cop": 26550.485988,
     "prima_opa": -62.62860700282018,
     "juego": {
      "matriz": [
       [
        [
         55910.13040671127,
         -58011.2735507934
        ],
        [
         -637.211663712,
         -2451.0506382652743
        ]
       ],
       [
        [
         61392.80576323327,
         -63321.3707483934
        ],
        [
         -531.00971976,
         -2451.0506382652743
        ]
       ]
      ],
      "nash": [
       [
        1,
        1
       ]
      ],
      "secuencial": [
       1,
       1
      ],
      "resultado": "Mantener oferta / GEA retener",
      "zona": {
       "reserva_gea": 87420.80609812812,
       "maximo_oferente": 86010.83055287485,
       "existe": false,
       "holgura": -1409.97554525327
      },
      "minoritarios_aceptan": false,
      "beneficio_umbral": -64.50313652419146
     }
    },
    "adverso": {
     "entorno": {
      "anio": 2021,
      "tasa_politica": 5.0,
      "inflacion": 7.62,
      "meta_inflacion": 3.0,
      "tasa_real_neutral": 2.0,
      "brecha_producto": -2.5,
      "crecimiento_pib": 9.3,
      "trm_promedio": 4192.260800000001,
      "trm_cierre": 4458.8992,
      "embi_pbs": 503.0,
      "indice_precios": 1.0
     },
     "taylor": {
      "inflacion": 7.62,
      "tasa_real_neutral": 2.0,
      "termino_inflacion": 2.31,
      "termino_brecha": -1.25,
      "tasa": 10.680000000000001
     },
     "valoracion": {
      "tasa_larga": 6.5,
      "ke": 15.930000000000001,
      "kd": 9.0,
      "kd_neto": 5.8500000000000005,
      "wacc": 12.906,
      "inflacion_esperada": 4.386,
      "g": 6.995649999999998,
      "fcf": 2258.7801600000003,
      "valor_accion": 40890.920406795514,
      "valor_empresa_billones": 18.727876346993902
     },
     "precio_opa_usd": 7.71,
     "precio_opa_cop": 32322.330768000007,
     "prima_opa": -20.954748764646357,
     "juego": {
      "matriz": [
       [
        [
         10581.447725422388,
         -12940.217392996317
        ],
        [
         -775.7359384320001,
         -1410.736754034445
        ]
       ],
       [
        [
         17336.814855934386,
         -19404.683546596316
        ],
        [
         -646.4466153600001,
         -1410.736754034445
        ]
       ]
      ],
      "nash": [
       [
        1,
        1
       ]
      ],
      "secuencial": [
       1,
       1
      ],
      "resultado": "Mantener oferta / GEA retener",
      "zona": {
       "reserva_gea": 50316.27756056188,
       "maximo_oferente": 48912.58421865493,
       "existe": false,
       "holgura": -1403.6933419069537
      },
      "minoritarios_aceptan": false,
      "beneficio_umbral": -28.264998925779427
     }
    }
   },
   "sensibilidad": [
    {
     "variable": "tasa_politica",
     "etiqueta": "Tasa de política",
     "choque": 3.895109112720721,
     "unidad": "pp",
     "valor_sube": -27.565205512412362,
     "valor_baja": 61.434049524418825,
     "holgura_sube": -10.302833794936305,
     "holgura_baja": 40.592196685640374
    },
    {
     "variable": "inflacion",
     "etiqueta": "Inflación",
     "choque": 3.2009803185899157,
     "unidad": "pp",
     "valor_sube": 28.55027525644602,
     "valor_baja": -18.450064115628262,
     "holgura_sube": -422.7631222399068,
     "holgura_baja": 273.2025047390198
    },
    {
     "variable": "embi_pbs",
     "etiqueta": "Riesgo país (EMBI)",
     "choque": 26.556543449779003,
     "unidad": "pbs",
     "valor_sube": -3.9002563398356838,
     "valor_baja": 4.2302364722322405,
     "holgura_sube": 57.753718062405824,
     "holgura_baja": -62.63995575350418
    },
    {
     "variable": "crecimiento_pib",
     "etiqueta": "Crecimiento",
     "choque": 4.130602256330183,
     "unidad": "pp",
     "valor_sube": 3.110393265308886,
     "valor_baja": -3.110393265308864,
     "holgura_sube": -46.05768443298439,
     "holgura_baja": 46.05768443297711
    },
    {
     "variable": "trm_promedio",
     "etiqueta": "Tasa de cambio",
     "choque": 5.496386477409371,
     "unidad": "%",
     "valor_sube": 1.099277295481893,
     "valor_baja": -1.0992772954818708,
     "holgura_sube": -16.277738041790144,
     "holgura_baja": 16.277738041775592
    }
   ]
  },
  "2022": {
   "opa_referencia": {
    "fecha": "2022-01-17",
    "anio": 2022,
    "evento": "2.ª OPA por Nutresa",
    "objetivo": "Nutresa",
    "precio_usd": 10.48,
    "participacion_gilinski": 30.8,
    "verificar": false,
    "nota": "Adquirió ~14.24 millones de acciones adicionales (~3.1 %)"
   },
   "plantilla": {
    "columnas": [
     "ocurrio",
     "favorable",
     "adverso"
    ],
    "filas": [
     {
      "clave": "tasa_politica",
      "etiqueta": "Tasa de política",
      "tipo": "dato",
      "valores": [
       "12.00 %",
       "9.00 %",
       "14.00 %"
      ]
     },
     {
      "clave": "inflacion",
      "etiqueta": "Inflación",
      "tipo": "dato",
      "valores": [
       "13.12 %",
       "11.12 %",
       "15.12 %"
      ]
     },
     {
      "clave": "trm_promedio",
      "etiqueta": "Tasa de cambio (TRM)",
      "tipo": "dato",
      "valores": [
       "$4,255",
       "$3,915",
       "$4,766"
      ]
     },
     {
      "clave": "crecimiento_pib",
      "etiqueta": "Crecimiento PIB",
      "tipo": "dato",
      "valores": [
       "7.3 %",
       "8.3 %",
       "5.8 %"
      ]
     },
     {
      "clave": "embi_pbs",
      "etiqueta": "Riesgo país (EMBI)",
      "tipo": "dato",
      "valores": [
       "371 pbs",
       "291 pbs",
       "521 pbs"
      ]
     },
     {
      "clave": "kd",
      "etiqueta": "Costo de financiación (Kd)",
      "tipo": "efecto",
      "valores": [
       "12.5 %",
       "11.0 %",
       "13.5 %"
      ]
     },
     {
      "clave": "wacc",
      "etiqueta": "WACC",
      "tipo": "efecto",
      "valores": [
       "15.1 %",
       "13.2 %",
       "17.1 %"
      ]
     },
     {
      "clave": "valor_accion",
      "etiqueta": "Valor fundamental por acción",
      "tipo": "efecto",
      "valores": [
       "$42,688",
       "$52,542",
       "$36,090"
      ]
     },
     {
      "clave": "precio_opa_cop",
      "etiqueta": "Precio OPA en pesos",
      "tipo": "efecto",
      "valores": [
       "$44,597",
       "$41,029",
       "$49,949"
      ]
     },
     {
      "clave": "juego",
      "etiqueta": "Resultado del juego",
      "tipo": "efecto",
      "valores": [
       "Mantener oferta / GEA retener",
       "Mantener oferta / GEA retener",
       "Mantener oferta / GEA vender"
      ]
     },
     {
      "clave": "analisis",
      "etiqueta": "Efecto en las decisiones",
      "tipo": "analisis",
      "valores": [
       "Escenario de referencia (dato del tablero).",
       "Kd baja 1.5 pp; valor por acción +23 %; OPA con descuento de 22 % vs. valor; sin zona de acuerdo → bloqueo.",
       "Kd sube 1.0 pp; valor por acción −15 %; OPA con prima de 38 % vs. valor; sin zona de acuerdo → bloqueo."
      ]
     }
    ]
   },
   "resultados": {
    "ocurrio": {
     "entorno": {
      "anio": 2022,
      "tasa_politica": 12.0,
      "inflacion": 13.12,
      "meta_inflacion": 3.0,
      "tasa_real_neutral": 2.0,
      "brecha_producto": 3.0,
      "crecimiento_pib": 7.3,
      "trm_promedio": 4255.44,
      "trm_cierre": 4810.2,
      "embi_pbs": 371.0,
      "indice_precios": 1.1312
     },
     "taylor": {
      "inflacion": 13.12,
      "tasa_real_neutral": 2.0,
      "termino_inflacion": 5.06,
      "termino_brecha": 1.5,
      "tasa": 21.68
     },
     "valoracion": {
      "tasa_larga": 10.0,
      "ke": 18.11,
      "kd": 12.5,
      "kd_neto": 8.125,
      "wacc": 15.1145,
      "inflacion_esperada": 6.036,
      "g": 8.686899999999987,
      "fcf": 2524.5066863413067,
      "valor_accion": 42687.90929238104,
      "valor_empresa_billones": 19.550889996756972
     },
     "precio_opa_usd": 10.48,
     "precio_opa_cop": 44597.0112,
     "prima_opa": 4.472230988271186,
     "juego": {
      "matriz": [
       [
        [
         -3501.302664523702,
         -483.7918148620229
        ],
        [
         -1070.3282688,
         -1472.7328705871457
        ]
       ],
       [
        [
         5975.562215476293,
         -9403.194054862019
        ],
        [
         -891.9402240000001,
         -1472.7328705871457
        ]
       ]
      ],
      "nash": [
       [
        1,
        1
       ]
      ],
      "secuencial": [
       1,
       1
      ],
      "resultado": "Mantener oferta / GEA retener",
      "zona": {
       "reserva_gea": 52527.47238427487,
       "maximo_oferente": 50221.06975574239,
       "existe": false,
       "holgura": -2306.40262853248
      },
      "minoritarios_aceptan": true,
      "beneficio_umbral": -6.1545817493293935
     }
    },
    "favorable": {
     "entorno": {
      "anio": 2022,
      "tasa_politica": 9.0,
      "inflacion": 11.12,
      "meta_inflacion": 3.0,
      "tasa_real_neutral": 2.0,
      "brecha_producto": 4.0,
      "crecimiento_pib": 8.3,
      "trm_promedio": 3915.0047999999997,
      "trm_cierre": 4425.384,
      "embi_pbs": 291.0,
      "indice_precios": 1.1312
     },
     "taylor": {
      "inflacion": 11.12,
      "tasa_real_neutral": 2.0,
      "termino_inflacion": 4.06,
      "termino_brecha": 2.0,
      "tasa": 19.18
     },
     "valoracion": {
      "tasa_larga": 8.5,
      "ke": 15.81,
      "kd": 11.0,
      "kd_neto": 7.15,
      "wacc": 13.212,
      "inflacion_esperada": 5.436,
      "g": 8.071899999999976,
      "fcf": 2498.988103073937,
      "valor_accion": 52541.85567918814,
      "valor_empresa_billones": 24.063957631971228
     },
     "precio_opa_usd": 10.48,
     "precio_opa_cop": 41029.250304,
     "prima_opa": -21.911303334016598,
     "juego": {
      "matriz": [
       [
        [
         13734.288714121185,
         -17230.347069372998
        ],
        [
         -984.7020072959999,
         -1812.6940209319907
        ]
       ],
       [
        [
         22391.46052826518,
         -25436.197130172994
        ],
        [
         -820.5850060800001,
         -1812.6940209319907
        ]
       ]
      ],
      "nash": [
       [
        1,
        1
       ]
      ],
      "secuencial": [
       1,
       1
      ],
      "resultado": "Mantener oferta / GEA retener",
      "zona": {
       "reserva_gea": 64652.75341324101,
       "maximo_oferente": 62253.383506147096,
       "existe": false,
       "holgura": -2399.369907093911
      },
      "minoritarios_aceptan": false,
      "beneficio_umbral": -29.096785507840515
     }
    },
    "adverso": {
     "entorno": {
      "anio": 2022,
      "tasa_politica": 14.0,
      "inflacion": 15.12,
      "meta_inflacion": 3.0,
      "tasa_real_neutral": 2.0,
      "brecha_producto": 1.5,
      "crecimiento_pib": 5.8,
      "trm_promedio": 4766.0928,
      "trm_cierre": 5387.424,
      "embi_pbs": 521.0,
      "indice_precios": 1.1312
     },
     "taylor": {
      "inflacion": 15.12,
      "tasa_real_neutral": 2.0,
      "termino_inflacion": 6.06,
      "termino_brecha": 0.75,
      "tasa": 23.929999999999996
     },
     "valoracion": {
      "tasa_larga": 11.0,
      "ke": 20.61,
      "kd": 13.5,
      "kd_neto": 8.775,
      "wacc": 17.059499999999996,
      "inflacion_esperada": 6.635999999999999,
      "g": 9.301899999999996,
      "fcf": 2561.488235544121,
      "valor_accion": 36090.48300667989,
      "valor_empresa_billones": 16.52929541150804
     },
     "precio_opa_usd": 10.48,
     "precio_opa_cop": 49948.652544000004,
     "prima_opa": 38.39840418526719,
     "juego": {
      "matriz": [
       [
        [
         -18871.120150514143,
         14283.922049349945
        ],
        [
         -1198.7676610560002,
         -1245.121663730456
        ]
       ],
       [
        [
         -8207.082832370143,
         4294.191540549946
        ],
        [
         -998.9730508800001,
         -1245.121663730456
        ]
       ]
      ],
      "nash": [
       [
        1,
        0
       ]
      ],
      "secuencial": [
       1,
       0
      ],
      "resultado": "Mantener oferta / GEA vender",
      "zona": {
       "reserva_gea": 44409.339339719605,
       "maximo_oferente": 42260.51874318489,
       "existe": false,
       "holgura": -2148.820596534715
      },
      "minoritarios_aceptan": true,
      "beneficio_umbral": 23.34643842197148
     }
    }
   },
   "sensibilidad": [
    {
     "variable": "tasa_politica",
     "etiqueta": "Tasa de política",
     "choque": 3.895109112720721,
     "unidad": "pp",
     "valor_sube": -21.333173142074678,
     "valor_baja": 37.208814996866124,
     "holgura_sube": 133.23407773029612,
     "holgura_baja": -220.80672573574702
    },
    {
     "variable": "inflacion",
     "etiqueta": "Inflación",
     "choque": 3.2009803185899157,
     "unidad": "pp",
     "valor_sube": 19.15220574755052,
     "valor_baja": -14.065375065462081,
     "holgura_sube": -441.72697678343684,
     "holgura_baja": 324.404180222773
    },
    {
     "variable": "crecimiento_pib",
     "etiqueta": "Crecimiento",
     "choque": 4.130602256330183,
     "unidad": "pp",
     "valor_sube": 3.1945879786002607,
     "valor_baja": -3.1945879786003384,
     "holgura_sube": -73.68006110921124,
     "holgura_baja": 73.68006110923307
    },
    {
     "variable": "embi_pbs",
     "etiqueta": "Riesgo país (EMBI)",
     "choque": 26.556543449779003,
     "unidad": "pbs",
     "valor_sube": -2.8108554031567756,
     "valor_baja": 2.978286030792776,
     "holgura_sube": 64.82964290266682,
     "holgura_baja": -68.69126729940035
    },
    {
     "variable": "trm_promedio",
     "etiqueta": "Tasa de cambio",
     "choque": 5.496386477409371,
     "unidad": "%",
     "valor_sube": 1.2164440482752337,
     "valor_baja": -1.2164440482752892,
     "holgura_sube": -28.05609750403528,
     "holgura_baja": 28.05609750404983
    }
   ]
  },
  "2023": {
   "opa_referencia": {
    "fecha": "2022-09-20",
    "anio": 2022,
    "evento": "OPA de IHC (Abu Dabi) por Nutresa",
    "objetivo": "Nutresa",
    "precio_usd": 15.0,
    "participacion_gilinski": null,
    "verificar": false,
    "nota": "Hasta 31.25 %; GEA no vendió y la oferta fracasó"
   },
   "plantilla": {
    "columnas": [
     "ocurrio",
     "favorable",
     "adverso"
    ],
    "filas": [
     {
      "clave": "tasa_politica",
      "etiqueta": "Tasa de política",
      "tipo": "dato",
      "valores": [
       "13.00 %",
       "10.00 %",
       "15.00 %"
      ]
     },
     {
      "clave": "inflacion",
      "etiqueta": "Inflación",
      "tipo": "dato",
      "valores": [
       "9.28 %",
       "7.28 %",
       "11.28 %"
      ]
     },
     {
      "clave": "trm_promedio",
      "etiqueta": "Tasa de cambio (TRM)",
      "tipo": "dato",
      "valores": [
       "$4,325",
       "$3,979",
       "$4,844"
      ]
     },
     {
      "clave": "crecimiento_pib",
      "etiqueta": "Crecimiento PIB",
      "tipo": "dato",
      "valores": [
       "0.7 %",
       "1.7 %",
       "-0.8 %"
      ]
     },
     {
      "clave": "embi_pbs",
      "etiqueta": "Riesgo país (EMBI)",
      "tipo": "dato",
      "valores": [
       "300 pbs",
       "220 pbs",
       "450 pbs"
      ]
     },
     {
      "clave": "kd",
      "etiqueta": "Costo de financiación (Kd)",
      "tipo": "efecto",
      "valores": [
       "13.0 %",
       "11.5 %",
       "14.0 %"
      ]
     },
     {
      "clave": "wacc",
      "etiqueta": "WACC",
      "tipo": "efecto",
      "valores": [
       "15.1 %",
       "13.2 %",
       "17.0 %"
      ]
     },
     {
      "clave": "valor_accion",
      "etiqueta": "Valor fundamental por acción",
      "tipo": "efecto",
      "valores": [
       "$37,369",
       "$44,338",
       "$32,417"
      ]
     },
     {
      "clave": "precio_opa_cop",
      "etiqueta": "Precio OPA en pesos",
      "tipo": "efecto",
      "valores": [
       "$64,876",
       "$59,686",
       "$72,661"
      ]
     },
     {
      "clave": "juego",
      "etiqueta": "Resultado del juego",
      "tipo": "efecto",
      "valores": [
       "Mantener oferta / GEA vender",
       "Mantener oferta / GEA vender",
       "Mantener oferta / GEA vender"
      ]
     },
     {
      "clave": "analisis",
      "etiqueta": "Efecto en las decisiones",
      "tipo": "analisis",
      "valores": [
       "Escenario de referencia (dato del tablero).",
       "Kd baja 1.5 pp; valor por acción +19 %; OPA con prima de 35 % vs. valor; sin zona de acuerdo → bloqueo.",
       "Kd sube 1.0 pp; valor por acción −13 %; OPA con prima de 124 % vs. valor; sin zona de acuerdo → bloqueo."
      ]
     }
    ]
   },
   "resultados": {
    "ocurrio": {
     "entorno": {
      "anio": 2023,
      "tasa_politica": 13.0,
      "inflacion": 9.28,
      "meta_inflacion": 3.0,
      "tasa_real_neutral": 2.0,
      "brecha_producto": 0.5,
      "crecimiento_pib": 0.7,
      "trm_promedio": 4325.05,
      "trm_cierre": 3822.05,
      "embi_pbs": 300.0,
      "indice_precios": 1.236175
     },
     "taylor": {
      "inflacion": 9.28,
      "tasa_real_neutral": 2.0,
      "termino_inflacion": 3.1399999999999997,
      "termino_brecha": 0.25,
      "tasa": 14.669999999999998
     },
     "valoracion": {
      "tasa_larga": 10.5,
      "ke": 17.9,
      "kd": 13.0,
      "kd_neto": 8.450000000000001,
      "wacc": 15.064999999999998,
      "inflacion_esperada": 4.8839999999999995,
      "g": 7.506099999999982,
      "fcf": 2627.4384494629935,
      "valor_accion": 37368.61986424121,
      "valor_empresa_billones": 17.114676928598225
     },
     "precio_opa_usd": 15.0,
     "precio_opa_cop": 64875.75,
     "prima_opa": 73.61023831142587,
     "juego": {
      "matriz": [
       [
        [
         -36200.433669698476,
         30579.595871734862
        ],
        [
         -1557.018,
         -1289.2173853163217
        ]
       ],
       [
        [
         -22381.898919698484,
         17604.445871734868
        ],
        [
         -1297.515,
         -1289.2173853163217
        ]
       ]
      ],
      "nash": [
       [
        1,
        0
       ]
      ],
      "secuencial": [
       1,
       0
      ],
      "resultado": "Mantener oferta / GEA vender",
      "zona": {
       "reserva_gea": 45982.08674294881,
       "maximo_oferente": 43859.882469766686,
       "existe": false,
       "holgura": -2122.2042731821275
      },
      "minoritarios_aceptan": true,
      "beneficio_umbral": 53.96542461863121
     }
    },
    "favorable": {
     "entorno": {
      "anio": 2023,
      "tasa_politica": 10.0,
      "inflacion": 7.279999999999999,
      "meta_inflacion": 3.0,
      "tasa_real_neutral": 2.0,
      "brecha_producto": 1.5,
      "crecimiento_pib": 1.7,
      "trm_promedio": 3979.0460000000003,
      "trm_cierre": 3516.2860000000005,
      "embi_pbs": 220.0,
      "indice_precios": 1.236175
     },
     "taylor": {
      "inflacion": 7.279999999999999,
      "tasa_real_neutral": 2.0,
      "termino_inflacion": 2.1399999999999997,
      "termino_brecha": 0.75,
      "tasa": 12.169999999999998
     },
     "valoracion": {
      "tasa_larga": 9.0,
      "ke": 15.6,
      "kd": 11.5,
      "kd_neto": 7.4750000000000005,
      "wacc": 13.1625,
      "inflacion_esperada": 4.284,
      "g": 6.8910999999999945,
      "fcf": 2601.3578525298526,
      "valor_accion": 44338.10669875203,
      "valor_empresa_billones": 20.30667374207737
     },
     "precio_opa_usd": 15.0,
     "precio_opa_cop": 59685.69,
     "prima_opa": 34.614881969418775,
     "juego": {
      "matriz": [
       [
        [
         -20318.507236559955,
         15535.123026078676
        ],
        [
         -1432.4565599999999,
         -1529.664681106945
        ]
       ],
       [
        [
         -7694.9838015599635,
         3597.9850260786843
        ],
        [
         -1193.7138,
         -1529.664681106945
        ]
       ]
      ],
      "nash": [
       [
        1,
        0
       ]
      ],
      "secuencial": [
       1,
       0
      ],
      "resultado": "Mantener oferta / GEA vender",
      "zona": {
       "reserva_gea": 54558.040292814374,
       "maximo_oferente": 52409.10957299294,
       "existe": false,
       "holgura": -2148.9307198214374
      },
      "minoritarios_aceptan": true,
      "beneficio_umbral": 20.056419103842412
     }
    },
    "adverso": {
     "entorno": {
      "anio": 2023,
      "tasa_politica": 15.0,
      "inflacion": 11.28,
      "meta_inflacion": 3.0,
      "tasa_real_neutral": 2.0,
      "brecha_producto": -1.0,
      "crecimiento_pib": -0.8,
      "trm_promedio": 4844.0560000000005,
      "trm_cierre": 4280.696000000001,
      "embi_pbs": 450.0,
      "indice_precios": 1.236175
     },
     "taylor": {
      "inflacion": 11.28,
      "tasa_real_neutral": 2.0,
      "termino_inflacion": 4.14,
      "termino_brecha": -0.5,
      "tasa": 16.919999999999998
     },
     "valoracion": {
      "tasa_larga": 11.5,
      "ke": 20.4,
      "kd": 14.0,
      "kd_neto": 9.1,
      "wacc": 17.009999999999998,
      "inflacion_esperada": 5.484,
      "g": 8.121099999999991,
      "fcf": 2665.119547574043,
      "valor_accion": 32417.47090362223,
      "valor_empresa_billones": 14.847070707276531
     },
     "precio_opa_usd": 15.0,
     "precio_opa_cop": 72660.84000000001,
     "prima_opa": 124.14098933264133,
     "juego": {
      "matriz": [
       [
        [
         -52774.67993047223,
         46184.90730691789
        ],
        [
         -1743.8601600000004,
         -1118.402746174967
        ]
       ],
       [
        [
         -37225.260170472226,
         31652.739306917887
        ],
        [
         -1453.2168000000001,
         -1118.402746174967
        ]
       ]
      ],
      "nash": [
       [
        1,
        0
       ]
      ],
      "secuencial": [
       1,
       0
      ],
      "resultado": "Mantener oferta / GEA vender",
      "zona": {
       "reserva_gea": 39889.69794690716,
       "maximo_oferente": 37870.877223857744,
       "existe": false,
       "holgura": -2018.8207230494154
      },
      "minoritarios_aceptan": true,
      "beneficio_umbral": 97.90520811534029
     }
    }
   },
   "sensibilidad": [
    {
     "variable": "tasa_politica",
     "etiqueta": "Tasa de política",
     "choque": 3.895109112720721,
     "unidad": "pp",
     "valor_sube": -18.738643029040247,
     "valor_baja": 29.970936716610687,
     "holgura_sube": 74.74208604050364,
     "holgura_baja": -110.01154055749794
    },
    {
     "variable": "inflacion",
     "etiqueta": "Inflación",
     "choque": 3.2009803185899157,
     "unidad": "pp",
     "valor_sube": 16.02392925097891,
     "valor_baja": -12.33154838885958,
     "holgura_sube": -340.0605112959529,
     "holgura_baja": 261.7006468578911
    },
    {
     "variable": "crecimiento_pib",
     "etiqueta": "Crecimiento",
     "choque": 4.130602256330183,
     "unidad": "pp",
     "valor_sube": 3.3664240067890816,
     "valor_baja": -3.3664240067890705,
     "holgura_sube": -71.44239412550814,
     "holgura_baja": 71.44239412550814
    },
    {
     "variable": "embi_pbs",
     "etiqueta": "Riesgo país (EMBI)",
     "choque": 26.556543449779003,
     "unidad": "pbs",
     "valor_sube": -2.4002673388610396,
     "valor_baja": 2.5213033820467023,
     "holgura_sube": 50.938576033106074,
     "holgura_baja": -53.50720811368228
    },
    {
     "variable": "trm_promedio",
     "etiqueta": "Tasa de cambio",
     "choque": 5.496386477409371,
     "unidad": "%",
     "valor_sube": 1.2318827414725453,
     "valor_baja": -1.231882741472512,
     "holgura_sube": -26.14306818012119,
     "holgura_baja": 26.143068180128466
    }
   ]
  },
  "2024": {
   "opa_referencia": {
    "fecha": "2024-01-15",
    "anio": 2024,
    "evento": "OPA final por Nutresa (cierre del acuerdo)",
    "objetivo": "Nutresa",
    "precio_usd": 12.0,
    "participacion_gilinski": null,
    "verificar": true,
    "nota": "Ejecución del Acuerdo Marco; verificar precio y fechas exactas"
   },
   "plantilla": {
    "columnas": [
     "ocurrio",
     "favorable",
     "adverso"
    ],
    "filas": [
     {
      "clave": "tasa_politica",
      "etiqueta": "Tasa de política",
      "tipo": "dato",
      "valores": [
       "9.50 %",
       "6.50 %",
       "11.50 %"
      ]
     },
     {
      "clave": "inflacion",
      "etiqueta": "Inflación",
      "tipo": "dato",
      "valores": [
       "5.20 %",
       "3.20 %",
       "7.20 %"
      ]
     },
     {
      "clave": "trm_promedio",
      "etiqueta": "Tasa de cambio (TRM)",
      "tipo": "dato",
      "valores": [
       "$4,071",
       "$3,746",
       "$4,560"
      ]
     },
     {
      "clave": "crecimiento_pib",
      "etiqueta": "Crecimiento PIB",
      "tipo": "dato",
      "valores": [
       "1.7 %",
       "2.7 %",
       "0.2 %"
      ]
     },
     {
      "clave": "embi_pbs",
      "etiqueta": "Riesgo país (EMBI)",
      "tipo": "dato",
      "valores": [
       "330 pbs",
       "250 pbs",
       "480 pbs"
      ]
     },
     {
      "clave": "kd",
      "etiqueta": "Costo de financiación (Kd)",
      "tipo": "efecto",
      "valores": [
       "11.2 %",
       "9.8 %",
       "12.2 %"
      ]
     },
     {
      "clave": "wacc",
      "etiqueta": "WACC",
      "tipo": "efecto",
      "valores": [
       "13.7 %",
       "11.8 %",
       "15.7 %"
      ]
     },
     {
      "clave": "valor_accion",
      "etiqueta": "Valor fundamental por acción",
      "tipo": "efecto",
      "valores": [
       "$39,182",
       "$46,653",
       "$33,886"
      ]
     },
     {
      "clave": "precio_opa_cop",
      "etiqueta": "Precio OPA en pesos",
      "tipo": "efecto",
      "valores": [
       "$48,856",
       "$44,948",
       "$54,719"
      ]
     },
     {
      "clave": "juego",
      "etiqueta": "Resultado del juego",
      "tipo": "efecto",
      "valores": [
       "Mantener oferta / GEA vender",
       "Mantener oferta / GEA retener",
       "Mantener oferta / GEA vender"
      ]
     },
     {
      "clave": "analisis",
      "etiqueta": "Efecto en las decisiones",
      "tipo": "analisis",
      "valores": [
       "Escenario de referencia (dato del tablero).",
       "Kd baja 1.5 pp; valor por acción +19 %; OPA con descuento de 4 % vs. valor; sin zona de acuerdo → bloqueo.",
       "Kd sube 1.0 pp; valor por acción −14 %; OPA con prima de 61 % vs. valor; sin zona de acuerdo → bloqueo."
      ]
     }
    ]
   },
   "resultados": {
    "ocurrio": {
     "entorno": {
      "anio": 2024,
      "tasa_politica": 9.5,
      "inflacion": 5.2,
      "meta_inflacion": 3.0,
      "tasa_real_neutral": 2.0,
      "brecha_producto": -0.8,
      "crecimiento_pib": 1.7,
      "trm_promedio": 4071.35,
      "trm_cierre": 4409.15,
      "embi_pbs": 330.0,
      "indice_precios": 1.300456
     },
     "taylor": {
      "inflacion": 5.2,
      "tasa_real_neutral": 2.0,
      "termino_inflacion": 1.1,
      "termino_brecha": -0.4,
      "tasa": 7.9
     },
     "valoracion": {
      "tasa_larga": 8.75,
      "ke": 16.450000000000003,
      "kd": 11.25,
      "kd_neto": 7.3125,
      "wacc": 13.70875,
      "inflacion_esperada": 3.66,
      "g": 6.251499999999988,
      "fcf": 2749.9571682917785,
      "valor_accion": 39181.6117290896,
      "valor_empresa_billones": 17.945019878211653
     },
     "precio_opa_usd": 12.0,
     "precio_opa_cop": 48856.2,
     "prima_opa": 24.691654692008736,
     "juego": {
      "matriz": [
       [
        [
         -12948.218838637993,
         9062.701162701647
        ],
        [
         -1172.5488,
         -1351.765604653591
        ]
       ],
       [
        [
         -2627.3465886379954,
         -708.5388372983507
        ],
        [
         -977.1239999999999,
         -1351.765604653591
        ]
       ]
      ],
      "nash": [
       [
        1,
        0
       ]
      ],
      "secuencial": [
       1,
       0
      ],
      "resultado": "Mantener oferta / GEA vender",
      "zona": {
       "reserva_gea": 48212.973232644756,
       "maximo_oferente": 46368.77127702912,
       "existe": false,
       "holgura": -1844.2019556156374
      },
      "minoritarios_aceptan": true,
      "beneficio_umbral": 11.427525819138037
     }
    },
    "favorable": {
     "entorno": {
      "anio": 2024,
      "tasa_politica": 6.5,
      "inflacion": 3.2,
      "meta_inflacion": 3.0,
      "tasa_real_neutral": 2.0,
      "brecha_producto": 0.19999999999999996,
      "crecimiento_pib": 2.7,
      "trm_promedio": 3745.6420000000003,
      "trm_cierre": 4056.4179999999997,
      "embi_pbs": 250.0,
      "indice_precios": 1.300456
     },
     "taylor": {
      "inflacion": 3.2,
      "tasa_real_neutral": 2.0,
      "termino_inflacion": 0.10000000000000009,
      "termino_brecha": 0.09999999999999998,
      "tasa": 5.4
     },
     "valoracion": {
      "tasa_larga": 7.25,
      "ke": 14.15,
      "kd": 9.75,
      "kd_neto": 6.3375,
      "wacc": 11.806249999999999,
      "inflacion_esperada": 3.06,
      "g": 5.636499999999978,
      "fcf": 2724.774795751654,
      "valor_accion": 46652.728669949116,
      "valor_empresa_billones": 21.366761253812868
     },
     "precio_opa_usd": 12.0,
     "precio_opa_cop": 44947.704000000005,
     "prima_opa": -3.654715851695478,
     "juego": {
      "matriz": [
       [
        [
         1749.225353436385,
         -5078.456967485625
        ],
        [
         -1078.7448960000002,
         -1609.5191391132444
        ]
       ],
       [
        [
         11177.006267436387,
         -14067.997767485627
        ],
        [
         -898.9540800000001,
         -1609.5191391132444
        ]
       ]
      ],
      "nash": [
       [
        1,
        1
       ]
      ],
      "secuencial": [
       1,
       1
      ],
      "resultado": "Mantener oferta / GEA retener",
      "zona": {
       "reserva_gea": 57406.182628372386,
       "maximo_oferente": 55605.159320559134,
       "existe": false,
       "holgura": -1801.0233078132514
      },
      "minoritarios_aceptan": false,
      "beneficio_umbral": -13.22149204495258
     }
    },
    "adverso": {
     "entorno": {
      "anio": 2024,
      "tasa_politica": 11.5,
      "inflacion": 7.2,
      "meta_inflacion": 3.0,
      "tasa_real_neutral": 2.0,
      "brecha_producto": -2.3,
      "crecimiento_pib": 0.19999999999999996,
      "trm_promedio": 4559.912,
      "trm_cierre": 4938.2480000000005,
      "embi_pbs": 480.0,
      "indice_precios": 1.300456
     },
     "taylor": {
      "inflacion": 7.2,
      "tasa_real_neutral": 2.0,
      "termino_inflacion": 2.1,
      "termino_brecha": -1.15,
      "tasa": 10.149999999999999
     },
     "valoracion": {
      "tasa_larga": 9.75,
      "ke": 18.950000000000003,
      "kd": 12.25,
      "kd_neto": 7.9625,
      "wacc": 15.65375,
      "inflacion_esperada": 4.26,
      "g": 6.866499999999998,
      "fcf": 2786.3049082122557,
      "valor_accion": 33885.76101436342,
      "valor_empresa_billones": 15.51954164610395
     },
     "precio_opa_usd": 12.0,
     "precio_opa_cop": 54718.944,
     "prima_opa": 61.4806407234173,
     "juego": {
      "matriz": [
       [
        [
         -27327.373916045715,
         22797.245116830272
        ],
        [
         -1313.254656,
         -1169.0587549955378
        ]
       ],
       [
        [
         -15713.27805204572,
         11853.456316830278
        ],
        [
         -1094.37888,
         -1169.0587549955378
        ]
       ]
      ],
      "nash": [
       [
        1,
        0
       ]
      ],
      "secuencial": [
       1,
       0
      ],
      "resultado": "Mantener oferta / GEA vender",
      "zona": {
       "reserva_gea": 41696.42892817419,
       "maximo_oferente": 39912.55714294867,
       "existe": false,
       "holgura": -1783.871785225514
      },
      "minoritarios_aceptan": true,
      "beneficio_umbral": 43.417948455145506
     }
    }
   },
   "sensibilidad": [
    {
     "variable": "tasa_politica",
     "etiqueta": "Tasa de política",
     "choque": 3.895109112720721,
     "unidad": "pp",
     "valor_sube": -18.94567766037025,
     "valor_baja": 30.50409127136686,
     "holgura_sube": 6.068592152136262,
     "holgura_baja": 0.5163949046327616
    },
    {
     "variable": "inflacion",
     "etiqueta": "Inflación",
     "choque": 3.2009803185899157,
     "unidad": "pp",
     "valor_sube": 16.27364299028131,
     "valor_baja": -12.478565638029393,
     "holgura_sube": -300.1188422766718,
     "holgura_baja": 230.12995152931398
    },
    {
     "variable": "crecimiento_pib",
     "etiqueta": "Crecimiento",
     "choque": 4.130602256330183,
     "unidad": "pp",
     "valor_sube": 3.339209584745495,
     "valor_baja": -3.339209584745506,
     "holgura_sube": -61.581768463976914,
     "holgura_baja": 61.58176846398419
    },
    {
     "variable": "embi_pbs",
     "etiqueta": "Riesgo país (EMBI)",
     "choque": 26.556543449779003,
     "unidad": "pbs",
     "valor_sube": -2.432189688800024,
     "valor_baja": 2.5565499787441492,
     "holgura_sube": 44.8544898051332,
     "holgura_baja": -47.14794470428751
    },
    {
     "variable": "trm_promedio",
     "etiqueta": "Tasa de cambio",
     "choque": 5.496386477409371,
     "unidad": "%",
     "valor_sube": 1.1750710909166795,
     "valor_baja": -1.1750710909166573,
     "holgura_sube": -21.670684038559557,
     "holgura_baja": 21.670684038566833
    }
   ]
  }
 },
 "control": [
  {
   "anio": 2021,
   "precio_usd": 10.0,
   "taylor": 8.43,
   "wacc": 10.961,
   "valor_accion": 51816.8885
  },
  {
   "anio": 2022,
   "precio_usd": 10.0,
   "taylor": 21.68,
   "wacc": 15.1145,
   "valor_accion": 42687.9093
  },
  {
   "anio": 2023,
   "precio_usd": 10.0,
   "taylor": 14.67,
   "wacc": 15.065,
   "valor_accion": 37368.6199
  },
  {
   "anio": 2024,
   "precio_usd": 10.0,
   "taylor": 7.9,
   "wacc": 13.70875,
   "valor_accion": 39181.6117
  }
 ]
};

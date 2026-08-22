/* Fuente de datos única del proyecto.
 * Se carga como <script> para que index.html funcione abriéndolo directo (file://)
 * sin necesidad de levantar un servidor. Editable a mano o con scripts/add-snapshot.mjs
 *
 * Precios en CLP. Dimensiones en mm. Maletero en litros. Rendimiento en km/l.
 * Última revisión de datos: 2026-08-21
 */
window.AUTOS_DATA = {
  "meta": {
    "actualizado": "2026-08-21",
    "moneda": "CLP",
    "notaRendimiento": "Ojo: las cifras de ciudad homologadas en Chile (ciclo local) son mucho más optimistas que las WLTP. El 40,1 km/l del Kona y el 43,5 km/l del MG NO son comparables con el 25,6 km/l que declara Toyota. La columna 'mixto' indica su ciclo de origen.",
    "supuestos": {
      "precioBencina93": 1433,
      "depreciacionAnual": 0.12,
      "precioKwhResidencial": 160,
      "precioKwhPublico": 315,
      "cargadorEnCasaDefault": false
    },
    "notaOrigen": "La columna \"Origen marca\" permite filtrar por procedencia. Ojo: el país de la marca no es el de fabricación — el Kia EV5 es coreano de marca pero se fabrica en China, y el Corolla Cross es japonés de marca pero viene de Brasil. La columna \"Origen\" del detalle indica dónde se fabrica.",
    "notaAlcance": "La tabla ya no es solo de SUV: incluye hatchback y sedán híbridos, que suelen ser más baratos y eficientes por el mismo tren motriz. Filtra por Carrocería si quieres volver a ver solo SUV.",
    "score": {
      "descripcion": "Puntaje 0-100 compuesto por seis criterios ponderados. Los pesos no tienen que sumar 100: el puntaje se normaliza por su total. Por defecto: precio 30, marca 30, costo por 100 km 25, espacio 20, equipamiento 15 y facilidad de estacionar 5.",
      "pesos": {
        "precio": 30,
        "marca": 30,
        "costo": 25,
        "espacio": 20,
        "equipamiento": 15,
        "tamano": 5
      },
      "referencia": {
        "nombre": "SUV subcompacto de referencia",
        "largo": 4325,
        "ancho": 1790,
        "alto": 1650,
        "ejes": 2650,
        "nota": "El criterio de tamaño mide cuánto se pasa cada modelo de esta huella: igual o más chico puntúa 100. Cambia estas medidas en meta.score.referencia por las del auto que hoy te resulta cómodo de estacionar.",
        "despeje": 223
      },
      "notaEspacio": "No hay altura libre al techo publicada para casi ningún modelo en Chile, así que este criterio usa dos proxies: altura de cabina (60%) y distancia entre ejes (40%). La altura de cabina es la altura total menos el despeje al piso, que es mejor proxy que la altura pelada: el Yaris Cross mide 1.615 mm pero 210 son despeje, así que por dentro es más bajo que un Corolla Cross de 1.620 con 160 de despeje. Aun así es un proxy, no un dato: sirve para descartar, no para decidir. Antes de comprar siéntate en los finalistas con el asiento abajo y atrás del todo, y ojo con el techo panorámico, que descuenta unos 3 cm.",
      "marcaTier": {
        "Toyota": 100,
        "Lexus": 100,
        "Honda": 88,
        "Subaru": 88,
        "Nissan": 88,
        "Mitsubishi": 88,
        "Suzuki": 88,
        "Mazda": 88,
        "Hyundai": 82,
        "Tesla": 80,
        "Kia": 68,
        "MG": 30,
        "Haval": 30,
        "Chery": 30,
        "BYD": 30
      },
      "notaMarca": "Toyota y Lexus 100 (Lexus es la división premium de Toyota) · resto de japonesas 88 · Hyundai 82 · Tesla 80 · Kia 68 · chinas 30. Es una escala de preferencia subjetiva, no un ranking de fiabilidad: edítala en data/autos.js → meta.score.marcaTier.",
      "factorCiudad": {
        "HEV": 1.15,
        "PHEV": 0.95,
        "MHEV": 0.95
      },
      "factorCiudadEV": 0.9,
      "baseCostoDefault": "mixto",
      "notaCosto": "Costo por 100 km: es el criterio de operación del score. Convierte consumo en plata, que es lo único comparable entre un híbrido y un eléctrico (km/l y kWh/100 km no se comparan entre sí). Puedes elegir la base de cálculo — ciclo mixto o ciclo ciudad — junto a los precios de bencina y kWh. Donde falta la cifra de un ciclo se deriva del otro: ×1,15 de mixto a ciudad en híbridos full (regeneran en cada frenada), ×0,95 en mild hybrid y enchufables. Los valores derivados van marcados \"der.\" en la tabla. Ojo: cuando la base es ciudad, el criterio favorece a las marcas que homologan más agresivo en Chile (Hyundai declara 40,1 km/l urbanos y Toyota 25,6 para autos que en pruebas independientes rinden casi lo mismo). En ciclo mixto esa distorsión es bastante menor.",
      "factorPhevSinCarga": 0.8,
      "equipamientoPuntos": {
        "entrada": 40,
        "medio": 70,
        "tope": 100,
        "unica": 70
      },
      "notaEquipamiento": "Equipamiento puntúa el nivel de la versión DENTRO de su propia gama: entrada 40, intermedia 70, tope 100. Las versiones únicas puntúan 70, porque no hay dónde elegir pero eso tampoco prueba que vengan bien equipadas. Ojo con la limitación: es una posición relativa, no un conteo de equipamiento absoluto. El tope de gama de un auto barato puede traer menos que la versión de entrada de uno caro, y este criterio no lo ve. Se edita en meta.score.equipamientoPuntos y en el campo equipamiento de cada modelo."
    },
    "bencina": {
      "precioDefault": 1433,
      "estacionDefault": "Shell · Carlos Antúnez 2490, Providencia",
      "fechaDefault": "2026-08-22",
      "combustibleId": 1,
      "api": "https://api.bencinaenlinea.cl/api/estaciones/precios_combustibles/1/reporte_comunal",
      "geocoder": "https://nominatim.openstreetmap.org/reverse",
      "nota": "El precio por defecto es el de la Shell de Carlos Antúnez 2490 en Providencia para 93 octanos. Con el botón \"usar mi ubicación\" la página pide tu posición, resuelve la comuna y trae los precios reales de 93 de esa comuna desde bencinaenlinea.cl (CNE), usando la mediana de las estaciones. Nada de eso sale del navegador: no hay servidor propio ni se guarda tu ubicación."
    },
    "notaPrecio": "La columna Precio muestra el precio más barato publicado por la marca — normalmente el que exige financiamiento propio o bonos; va con una \"f\" volada. El tooltip trae el precio de lista cuando la marca publica ambos. Ojo: los precios de Toyota están verificados contra la tienda oficial y un concesionario (agosto 2026); los del resto de las marcas vienen de notas de lanzamiento y pueden estar desactualizados o no incluir bonos vigentes. Cotiza antes de decidir.",
    "notaCarga": "Sin cargador en casa, un eléctrico se carga en red pública, que en Chile cuesta entre $200 y $400 por kWh (Enel X Way $315, Copec Voltex ~$200) contra unos $160 de la tarifa residencial. Por eso el interruptor \"cargo en casa\" no es cosmético: cambia el precio del kWh con que se calcula el costo por 100 km y prácticamente duplica el de los eléctricos. Con el interruptor apagado, además, los enchufables (PHEV) se penalizan un 20% en rendimiento, porque sin cargarlos andan casi siempre a bencina."
  },
  "autos": [
    {
      "id": "toyota-yaris-cross-hev",
      "marca": "Toyota",
      "modelo": "Yaris Cross",
      "version": "1.5 XG Hybrid 4x2 eCVT",
      "anio": 2026,
      "tipo": "HEV",
      "carroceria": "SUV subcompacto",
      "origen": "Indonesia",
      "precioNuevo": 25490000,
      "precioNuevoNota": "Precio al contado de la XG, la versión más equipada. La XI, de entrada, queda en $23.090.000 al contado y $21.490.000 con financiamiento. Toyota no publica precio de lista de la XG.",
      "precioUsado": 22000000,
      "precioUsadoNota": "Estimado: el HEV lleva poco en el mercado y casi no hay stock usado.",
      "precioUsadoEstimado": true,
      "dim": {
        "largo": 4310,
        "ancho": 1770,
        "alto": 1615,
        "ejes": 2620,
        "maletero": 466,
        "despeje": 210
      },
      "potencia": 125,
      "torque": 141,
      "traccion": "4x2",
      "transmision": "e-CVT",
      "rend": {
        "ciudad": 32,
        "carretera": null,
        "mixto": 20.8,
        "ciclo": "WLTP",
        "cicloCiudad": "Chile"
      },
      "ev": null,
      "historial": [
        {
          "fecha": "2026-08-17",
          "precio": 23490000,
          "clase": "nuevo",
          "fuente": "toyota.cl / rutamotor"
        },
        {
          "fecha": "2026-08-22",
          "precio": 24290000,
          "clase": "nuevo",
          "fuente": "concesionarios Toyota — XG financiada"
        }
      ],
      "notas": "La XG suma Toyota Safety Sense completo — pre-colisión, crucero adaptativo, luces altas automáticas y mantención de carril — más el tablero digital LED continuo, nada de lo cual trae la XI. Es el híbrido más chico de la tabla y el de maletero más grande para su largo.",
      "fuentes": [
        {
          "titulo": "Toyota Chile — Yaris Cross Hybrid",
          "url": "https://toyota.cl/modelos/suv/yaris-cross-hybrid/"
        },
        {
          "titulo": "Rutamotor — Llega a Chile el Yaris Cross HEV",
          "url": "https://www.rutamotor.com/llega-a-chile-el-nuevo-toyota-yaris-cross-hev-el-modelo-de-entrada-en-la-categoria-hibrido-convencional/"
        },
        {
          "titulo": "Tienda Toyota Chile — Yaris Cross Híbrido",
          "url": "https://tienda.toyota.cl/index.php?id_product=785&rewrite=yaris-cross&controller=product"
        },
        {
          "titulo": "Salfa Automotriz — Yaris Cross HEV",
          "url": "https://www.salfaautomotriz.cl/web/guest/detalle/-/vehiculo/autos/toyota/yaris-cross-xi-1-5-cvt-hibrido"
        }
      ],
      "paisMarca": "Japonesa",
      "precioFinanciado": 24290000,
      "precioFinanciadoNota": "Precio de la XG con financiamiento de marca.",
      "equipamiento": "tope"
    },
    {
      "id": "toyota-corolla-cross-xei",
      "marca": "Toyota",
      "modelo": "Corolla Cross",
      "version": "1.8 XEI Hybrid 4x2 CVT",
      "anio": 2026,
      "tipo": "HEV",
      "carroceria": "SUV compacto",
      "origen": "Brasil",
      "precioNuevo": 27990000,
      "precioNuevoNota": "Precio de lista en la tienda oficial de Toyota Chile.",
      "precioUsado": 23590000,
      "precioUsadoNota": "Precio real visto en chileautos: 2025 1.8 HEV XEI CVT a $23.590.000. Unidades 2024 desde ~$17.9M según kilometraje.",
      "precioUsadoEstimado": false,
      "dim": {
        "largo": 4460,
        "ancho": 1825,
        "alto": 1620,
        "ejes": 2640,
        "maletero": 473,
        "despeje": 160
      },
      "potencia": 140,
      "torque": 142,
      "traccion": "4x2",
      "transmision": "e-CVT",
      "rend": {
        "ciudad": 25.6,
        "carretera": 21.7,
        "mixto": 23.3,
        "ciclo": "Chile",
        "cicloCiudad": "Chile"
      },
      "ev": null,
      "historial": [
        {
          "fecha": "2025-01-15",
          "precio": 27490000,
          "clase": "nuevo",
          "fuente": "chileautos — precios 2025"
        },
        {
          "fecha": "2026-08-21",
          "precio": 27990000,
          "clase": "nuevo",
          "fuente": "brunofritsch.cl"
        },
        {
          "fecha": "2026-08-21",
          "precio": 23590000,
          "clase": "usado",
          "fuente": "chileautos — unidad 2025 XEI HEV"
        },
        {
          "fecha": "2026-08-22",
          "precio": 25490000,
          "clase": "nuevo",
          "fuente": "tienda.toyota.cl (financiado)"
        }
      ],
      "notas": "El punto dulce del segmento: maletero de 473 L y el rendimiento mixto más honesto de la lista (23,3 km/l medidos en el mismo ciclo que declara la ciudad).",
      "fuentes": [
        {
          "titulo": "Toyota Chile — Corolla Cross Hybrid",
          "url": "https://toyota.cl/modelos/suv/corolla-cross-hybrid/"
        },
        {
          "titulo": "chileautos — precios Corolla Cross 2026",
          "url": "https://www.chileautos.cl/toyota/corolla-cross/precio/2026/"
        },
        {
          "titulo": "Tienda Toyota Chile — Corolla Cross Híbrido",
          "url": "https://tienda.toyota.cl/index.php?id_product=529&rewrite=corolla-cross&controller=product"
        }
      ],
      "paisMarca": "Japonesa",
      "precioFinanciado": 25490000,
      "precioFinanciadoNota": "Bono total de $2.500.000: $1.500.000 de marca más $1.000.000 por financiar con MAF. Al contado queda en $26.490.000.",
      "equipamiento": "entrada"
    },
    {
      "id": "toyota-corolla-cross-seg",
      "marca": "Toyota",
      "modelo": "Corolla Cross",
      "version": "1.8 SEG Hybrid 4x2 CVT",
      "anio": 2026,
      "tipo": "HEV",
      "carroceria": "SUV compacto",
      "origen": "Brasil",
      "precioNuevo": 27990000,
      "precioNuevoNota": "Precio único, sin bono de financiamiento (concesionario Kovacs Toyota, agosto 2026). El valor anterior de $29.990.000 que tenía esta tabla estaba desactualizado.",
      "precioUsado": 24000000,
      "precioUsadoNota": "Estimado a partir del precio usado real de la XEI más el delta de equipamiento.",
      "precioUsadoEstimado": true,
      "dim": {
        "largo": 4460,
        "ancho": 1825,
        "alto": 1620,
        "ejes": 2640,
        "maletero": 473,
        "despeje": 160
      },
      "potencia": 140,
      "torque": 142,
      "traccion": "4x2",
      "transmision": "e-CVT",
      "rend": {
        "ciudad": 25.6,
        "carretera": 21.7,
        "mixto": 23.3,
        "ciclo": "Chile",
        "cicloCiudad": "Chile"
      },
      "ev": null,
      "historial": [
        {
          "fecha": "2025-01-15",
          "precio": 29490000,
          "clase": "nuevo",
          "fuente": "chileautos — precios 2025"
        },
        {
          "fecha": "2026-08-21",
          "precio": 29990000,
          "clase": "nuevo",
          "fuente": "brunofritsch.cl"
        },
        {
          "fecha": "2026-08-22",
          "precio": 27990000,
          "clase": "nuevo",
          "fuente": "kovacstoyota.cl"
        }
      ],
      "notas": "En chileautos todavía aparecen unidades 2024 con el motor 2.0 SEG. Ese motor ya no se vende nuevo acá.",
      "fuentes": [
        {
          "titulo": "chileautos — precios Corolla Cross 2026",
          "url": "https://www.chileautos.cl/toyota/corolla-cross/precio/2026/"
        },
        {
          "titulo": "Kovacs Toyota — Corolla Cross HEV",
          "url": "https://kovacstoyota.cl/suv/corolla-cross-hev.html"
        }
      ],
      "paisMarca": "Japonesa",
      "equipamiento": "tope"
    },
    {
      "id": "hyundai-kona-hev-plus",
      "marca": "Hyundai",
      "modelo": "Kona",
      "version": "SX2 1.6 HEV Plus AT",
      "anio": 2026,
      "tipo": "HEV",
      "carroceria": "SUV compacto",
      "origen": "Corea",
      "precioNuevo": 27590000,
      "precioNuevoNota": "Precio de lista 2026. Hyundai publica $23.990.000 pero solo con financiamiento Amicar — no es comparable con los precios de lista del resto de la tabla.",
      "precioUsado": 23500000,
      "precioUsadoNota": "Estimado. En chileautos las unidades 2025-2026 son mayoritariamente la 2.0 bencinera Design.",
      "precioUsadoEstimado": true,
      "dim": {
        "largo": 4350,
        "ancho": 1825,
        "alto": 1580,
        "ejes": 2660,
        "maletero": 466,
        "maleteroMax": 1241,
        "despeje": 170
      },
      "potencia": 139,
      "torque": 265,
      "traccion": "4x2",
      "transmision": "DCT 6v",
      "rend": {
        "ciudad": 40.1,
        "carretera": 21.4,
        "mixto": 22.7,
        "ciclo": "test independiente",
        "cicloCiudad": "Chile"
      },
      "ev": null,
      "historial": [
        {
          "fecha": "2026-08-21",
          "precio": 27590000,
          "clase": "nuevo",
          "fuente": "hyundai.cl / portillo.cl"
        }
      ],
      "notas": "El famoso 40,1 km/l del hilo de r/chile_autos que leíste: es la homologación chilena de ciudad. Pruebas independientes lo dejan en ~22,7 km/l mixto, o sea a la par del Corolla Cross. Caja DCT en vez de e-CVT.",
      "fuentes": [
        {
          "titulo": "Hyundai Chile — ficha técnica Kona Híbrido",
          "url": "https://www.hyundai.cl/nuestros-modelos/ecologicos/all-new-kona-hibrido/especificaciones-tecnicas/"
        },
        {
          "titulo": "Portillo — Kona híbrido precio 2026",
          "url": "https://www.portillo.cl/noticias/nuevos-modelos/hyundai-kona-2026"
        }
      ],
      "paisMarca": "Coreana",
      "precioFinanciado": 23990000,
      "precioFinanciadoNota": "Precio Hyundai con financiamiento Amicar.",
      "equipamiento": "entrada"
    },
    {
      "id": "hyundai-kona-hev-design",
      "marca": "Hyundai",
      "modelo": "Kona",
      "version": "SX2 1.6 HEV Design AT",
      "anio": 2026,
      "tipo": "HEV",
      "carroceria": "SUV compacto",
      "origen": "Corea",
      "precioNuevo": 26990000,
      "precioNuevoNota": "Precio publicado por Hyundai con financiamiento Amicar; sin financiamiento sube.",
      "precioUsado": 24000000,
      "precioUsadoNota": "Estimado.",
      "precioUsadoEstimado": true,
      "dim": {
        "largo": 4350,
        "ancho": 1825,
        "alto": 1580,
        "ejes": 2660,
        "maletero": 466,
        "maleteroMax": 1241,
        "despeje": 170
      },
      "potencia": 139,
      "torque": 265,
      "traccion": "4x2",
      "transmision": "DCT 6v",
      "rend": {
        "ciudad": 40.1,
        "carretera": 21.4,
        "mixto": 22.7,
        "ciclo": "test independiente",
        "cicloCiudad": "Chile"
      },
      "ev": null,
      "historial": [
        {
          "fecha": "2026-08-21",
          "precio": 26990000,
          "clase": "nuevo",
          "fuente": "hyundai.cl"
        }
      ],
      "notas": "Versión tope del Kona híbrido.",
      "fuentes": [
        {
          "titulo": "Hyundai Chile — precios Kona Híbrido",
          "url": "https://www.hyundai.cl/nuestros-modelos/ecologicos/all-new-kona-hibrido/precios-y-financiamiento/"
        }
      ],
      "paisMarca": "Coreana",
      "precioFinanciado": 26990000,
      "precioFinanciadoNota": "Precio Hyundai con financiamiento Amicar.",
      "equipamiento": "tope"
    },
    {
      "id": "lexus-lbx-urban",
      "marca": "Lexus",
      "modelo": "LBX",
      "version": "1.5 Urban Híbrido 4x2 CVT",
      "anio": 2026,
      "tipo": "HEV",
      "carroceria": "SUV subcompacto premium",
      "origen": "Japón",
      "precioNuevo": 33490000,
      "precioNuevoNota": "Precio de entrada del LBX en Chile.",
      "precioUsado": 30500000,
      "precioUsadoNota": "Estimado. El modelo es muy nuevo en Chile y casi no deprecia todavía.",
      "precioUsadoEstimado": true,
      "dim": {
        "largo": 4190,
        "ancho": 1825,
        "alto": 1560,
        "ejes": 2580,
        "maletero": 332,
        "despeje": 170
      },
      "potencia": 136,
      "torque": 185,
      "traccion": "4x2",
      "transmision": "e-CVT",
      "rend": {
        "ciudad": null,
        "carretera": null,
        "mixto": 21.5,
        "ciclo": "WLTP",
        "cicloCiudad": null
      },
      "ev": null,
      "historial": [
        {
          "fecha": "2026-08-17",
          "precio": 33490000,
          "clase": "nuevo",
          "fuente": "24horas / brunofritsch"
        }
      ],
      "notas": "Es un Yaris Cross premium: misma plataforma GA-B, 12 cm más corto y con la mitad del maletero (332 L vs 466 L). Pagas $10M más por terminaciones y marca.",
      "fuentes": [
        {
          "titulo": "24horas — Lexus LBX llega a Chile",
          "url": "https://www.24horas.cl/motores-24/lexus-lbx-el-suv-hibrido-que-arribo-a-chile"
        },
        {
          "titulo": "Bruno Fritsch — Lexus LBX 2026",
          "url": "https://www.brunofritsch.cl/lexus-lbx"
        }
      ],
      "paisMarca": "Japonesa",
      "equipamiento": "entrada"
    },
    {
      "id": "toyota-bz4x-limited",
      "marca": "Toyota",
      "modelo": "bZ4X",
      "version": "Limited 4x2",
      "anio": 2026,
      "tipo": "EV",
      "carroceria": "SUV mediano",
      "origen": "Japón",
      "precioNuevo": 41990000,
      "precioNuevoNota": "Versión AWD a $46.990.000. Incluye bonos de financiamiento y mantenciones.",
      "precioUsado": null,
      "precioUsadoNota": "Sin mercado usado: se lanzó en Chile en enero 2026.",
      "precioUsadoEstimado": false,
      "dim": {
        "largo": 4690,
        "ancho": 1860,
        "alto": 1650,
        "ejes": 2850,
        "maletero": 452,
        "despeje": 180
      },
      "potencia": 224,
      "torque": 268,
      "traccion": "4x2",
      "transmision": "Directa",
      "rend": {
        "ciudad": null,
        "carretera": null,
        "mixto": null,
        "ciclo": null,
        "cicloCiudad": null
      },
      "ev": {
        "bateriaKwh": 73.1,
        "autonomiaKm": 478,
        "consumoKwh100": 13.9
      },
      "historial": [
        {
          "fecha": "2026-01-29",
          "precio": 41990000,
          "clase": "nuevo",
          "fuente": "Publimetro — lanzamiento Chile"
        }
      ],
      "notas": "El primer eléctrico de Toyota en Chile. Salta de segmento: 23 cm más largo que el Corolla Cross.",
      "fuentes": [
        {
          "titulo": "Toyota Chile — bZ4X",
          "url": "https://toyota.cl/modelos/suv/auto-electrico-toyota-bz4x/"
        },
        {
          "titulo": "Publimetro — bZ4X llega a Chile desde $41.990.000",
          "url": "https://www.publimetro.cl/comercial/2026/01/29/toyota-bz4x-el-primer-suv-100-electrico-de-toyota-llega-a-chile-con-precios-desde-41990000-y-hasta-478-km-de-autonomia/"
        }
      ],
      "paisMarca": "Japonesa",
      "equipamiento": "entrada"
    },
    {
      "id": "tesla-model-y-rwd",
      "marca": "Tesla",
      "modelo": "Model Y",
      "version": "Premium RWD",
      "anio": 2026,
      "tipo": "EV",
      "carroceria": "SUV mediano",
      "origen": "China",
      "precioNuevo": 37000000,
      "precioNuevoNota": "Versión Premium AWD a ~$42.000.000. Los precios Tesla cambian sin aviso.",
      "precioUsado": 33000000,
      "precioUsadoNota": "Estimado. En chileautos hay unidades 2025-2026 con precios desde ~$45M para las Long Range.",
      "precioUsadoEstimado": true,
      "dim": {
        "largo": 4790,
        "ancho": 1982,
        "alto": 1624,
        "ejes": 2890,
        "maletero": 854,
        "maleteroMax": 2158,
        "despeje": 167
      },
      "potencia": 299,
      "torque": 420,
      "traccion": "4x2",
      "transmision": "Directa",
      "rend": {
        "ciudad": null,
        "carretera": null,
        "mixto": null,
        "ciclo": null,
        "cicloCiudad": null
      },
      "ev": {
        "bateriaKwh": 64,
        "autonomiaKm": 466,
        "consumoKwh100": 13.7
      },
      "historial": [
        {
          "fecha": "2026-08-21",
          "precio": 37000000,
          "clase": "nuevo",
          "fuente": "meganoticias / cualauto"
        }
      ],
      "notas": "El maletero más grande de la tabla por lejos (854 L, contando el frunk). También el más ancho: 1.982 mm puede ser un problema en estacionamientos de edificio.",
      "fuentes": [
        {
          "titulo": "CualAuto — Tesla Model Y 2026 Chile",
          "url": "https://www.cualauto.cl/catalogo/tesla-model-y"
        },
        {
          "titulo": "Meganoticias — precios Tesla en Chile 2026",
          "url": "https://www.meganoticias.cl/nacional/523884-cuanto-cuesta-tesla-chile-modelos-mas-vendidos-precios-2026-05-06-2026.html"
        }
      ],
      "paisMarca": "Estadounidense",
      "equipamiento": "entrada"
    },
    {
      "id": "mg-zs-hybrid-plus",
      "marca": "MG",
      "modelo": "ZS",
      "version": "Hybrid+ 1.5",
      "anio": 2026,
      "tipo": "HEV",
      "carroceria": "SUV compacto",
      "origen": "China",
      "precioNuevo": 17990000,
      "precioNuevoNota": "Precio de lanzamiento en Chile (enero 2026). El más barato de la tabla por un margen enorme.",
      "precioUsado": null,
      "precioUsadoNota": "Sin mercado usado relevante todavía.",
      "precioUsadoEstimado": false,
      "dim": {
        "largo": 4430,
        "ancho": 1818,
        "alto": 1635,
        "ejes": 2610,
        "maletero": 443,
        "despeje": 165
      },
      "potencia": 194,
      "torque": 465,
      "traccion": "4x2",
      "transmision": "Híbrida automática",
      "rend": {
        "ciudad": 43.5,
        "carretera": null,
        "mixto": null,
        "ciclo": null,
        "cicloCiudad": "Chile"
      },
      "ev": null,
      "historial": [
        {
          "fecha": "2026-01-23",
          "precio": 17990000,
          "clase": "nuevo",
          "fuente": "rutamotor — lanzamiento"
        }
      ],
      "notas": "El que rompe la tabla en precio: $10M menos que el Corolla Cross con tamaño y maletero casi iguales. El 43,5 km/l urbano declarado es homologación chilena, tómalo con pinzas.",
      "fuentes": [
        {
          "titulo": "Rutamotor — MG ZS híbrido debuta a $17.990.000",
          "url": "https://www.rutamotor.com/lanzamientos-en-chile/el-mg-zs-hibrido-hace-su-debut-oficial-en-chile-con-un-precio-de-17-990-000/"
        },
        {
          "titulo": "MG Motor Chile — All New ZS Hybrid+",
          "url": "https://www.mgmotor.cl/mg-news/cl-mg-motor-presenta-oficialmente-el-all-new-mg-zs-hybrid-junto-a-su-nuevo-ceo-regional"
        }
      ],
      "paisMarca": "China",
      "equipamiento": "unica"
    },
    {
      "id": "haval-jolion-hev",
      "marca": "Haval",
      "modelo": "Jolion",
      "version": "1.5 HEV",
      "anio": 2026,
      "tipo": "HEV",
      "carroceria": "SUV compacto",
      "origen": "China",
      "precioNuevo": 24290000,
      "precioNuevoNota": "Versión Elite a $26.490.000.",
      "precioUsado": 19500000,
      "precioUsadoNota": "Estimado. Los Jolion tienen bastante rotación en el usado.",
      "precioUsadoEstimado": true,
      "dim": {
        "largo": 4472,
        "ancho": 1841,
        "alto": 1619,
        "ejes": 2700,
        "maletero": 430,
        "maleteroMax": 1130,
        "despeje": 165
      },
      "potencia": 188,
      "torque": 375,
      "traccion": "4x2",
      "transmision": "DHT",
      "rend": {
        "ciudad": 30.4,
        "carretera": 14.8,
        "mixto": null,
        "ciclo": null,
        "cicloCiudad": "Chile"
      },
      "ev": null,
      "historial": [
        {
          "fecha": "2026-08-21",
          "precio": 24290000,
          "clase": "nuevo",
          "fuente": "autofact"
        }
      ],
      "notas": "La distancia entre ejes más larga del grupo compacto (2.700 mm) = mejor espacio atrás. Fíjate en la caída del rendimiento en carretera: 14,8 km/l es la peor de la tabla.",
      "fuentes": [
        {
          "titulo": "Autofact — SUV híbridos que se venden en Chile",
          "url": "https://www.autofact.cl/blog/comprar-auto/mercado/suv-hibridos"
        }
      ],
      "paisMarca": "China",
      "equipamiento": "entrada"
    },
    {
      "id": "chery-tiggo-4-hev",
      "marca": "Chery",
      "modelo": "Tiggo 4",
      "version": "Pro Max HEV",
      "anio": 2026,
      "tipo": "HEV",
      "carroceria": "SUV compacto",
      "origen": "China",
      "precioNuevo": 20990000,
      "precioNuevoNota": "Primer híbrido no enchufable de Chery en Chile.",
      "precioUsado": null,
      "precioUsadoNota": "Sin mercado usado todavía.",
      "precioUsadoEstimado": false,
      "dim": {
        "largo": 4380,
        "ancho": 1830,
        "alto": 1662,
        "ejes": 2610,
        "maletero": 380,
        "despeje": 180
      },
      "potencia": 204,
      "torque": 310,
      "traccion": "4x2",
      "transmision": "DHT",
      "rend": {
        "ciudad": null,
        "carretera": null,
        "mixto": 18.5,
        "ciclo": "declarado",
        "cicloCiudad": null
      },
      "ev": null,
      "historial": [
        {
          "fecha": "2026-08-21",
          "precio": 20990000,
          "clase": "nuevo",
          "fuente": "chery.cl / rutamotor"
        }
      ],
      "notas": "Dimensiones tomadas de la ficha regional del Tiggo 4 Pro — confírmalas en el concesionario antes de decidir por espacio.",
      "dimsPorConfirmar": true,
      "fuentes": [
        {
          "titulo": "Chery Chile — Tiggo 4 HEV",
          "url": "https://chery.cl/tiggo-4-hev/"
        },
        {
          "titulo": "Rutamotor — Chery estrena el Tiggo 4 HEV",
          "url": "https://www.rutamotor.com/lanzamientos-en-chile/chery-estrena-el-tiggo-4-hev-su-primer-hibrido-sin-recarga-exterior-en-chile/"
        }
      ],
      "paisMarca": "China",
      "equipamiento": "tope"
    },
    {
      "id": "suzuki-grand-vitara-hybrid",
      "marca": "Suzuki",
      "modelo": "Grand Vitara",
      "version": "1.5 Hybrid AT",
      "anio": 2026,
      "tipo": "MHEV",
      "carroceria": "SUV compacto",
      "origen": "India",
      "precioNuevo": 23400000,
      "precioNuevoNota": "La gama Grand Vitara 2026 va de $20.590.000 a $26.190.000 según versión; este es el punto medio de la Hybrid.",
      "precioUsado": 18500000,
      "precioUsadoNota": "Estimado.",
      "precioUsadoEstimado": true,
      "dim": {
        "largo": 4345,
        "ancho": 1795,
        "alto": 1645,
        "ejes": 2600,
        "maletero": 310,
        "maleteroMax": 1147,
        "despeje": 210
      },
      "potencia": 103,
      "torque": 137,
      "traccion": "4x2",
      "transmision": "AT 6v",
      "rend": {
        "ciudad": null,
        "carretera": null,
        "mixto": 17.5,
        "ciclo": "estimado",
        "cicloCiudad": null
      },
      "ev": null,
      "historial": [
        {
          "fecha": "2026-08-21",
          "precio": 23400000,
          "clase": "nuevo",
          "fuente": "chileautos / autocosmos"
        }
      ],
      "notas": "Es híbrido liviano (MHEV), no híbrido full: no anda en eléctrico puro y por eso rinde bastante menos. Filtra por tipo si no te interesa.",
      "fuentes": [
        {
          "titulo": "chileautos — precios Grand Vitara 2026",
          "url": "https://www.chileautos.cl/suzuki/grand-vitara/precio/2026/"
        },
        {
          "titulo": "Suzuki Chile — ficha técnica Grand Vitara Hybrid",
          "url": "https://www.suzuki.cl/media/ry0demqj/ficha-tecnica_grand-vitara-hybrid.pdf"
        }
      ],
      "paisMarca": "Japonesa",
      "equipamiento": "medio"
    },
    {
      "id": "byd-song-pro-dmi",
      "marca": "BYD",
      "modelo": "Song Pro",
      "version": "DM-i",
      "anio": 2026,
      "tipo": "PHEV",
      "carroceria": "SUV mediano",
      "origen": "China",
      "precioNuevo": 31990000,
      "precioNuevoNota": "Híbrido enchufable: necesitas cargador para aprovecharlo.",
      "precioUsado": null,
      "precioUsadoNota": "Sin mercado usado relevante.",
      "precioUsadoEstimado": false,
      "dim": {
        "largo": 4738,
        "ancho": 1860,
        "alto": 1710,
        "ejes": 2712,
        "maletero": 574,
        "despeje": 165
      },
      "potencia": 235,
      "torque": 325,
      "traccion": "4x2",
      "transmision": "DHT",
      "rend": {
        "ciudad": null,
        "carretera": null,
        "mixto": 22,
        "ciclo": "estimado",
        "cicloCiudad": null
      },
      "ev": {
        "bateriaKwh": 18.3,
        "autonomiaKm": 100,
        "consumoKwh100": null
      },
      "historial": [
        {
          "fecha": "2026-08-21",
          "precio": 31990000,
          "clase": "nuevo",
          "fuente": "byd-auto.cl"
        }
      ],
      "notas": "100 km de autonomía eléctrica (NEDC) más motor bencinero: si cargas en casa haces la ciudad casi sin bencina. Dimensiones y rendimiento por confirmar en ficha local.",
      "dimsPorConfirmar": true,
      "fuentes": [
        {
          "titulo": "BYD Chile",
          "url": "https://byd-auto.cl/modelos/byd-song-plus-dm-i/"
        }
      ],
      "paisMarca": "China",
      "equipamiento": "unica"
    },
    {
      "id": "toyota-corolla-hev",
      "marca": "Toyota",
      "modelo": "Corolla",
      "version": "1.8 Hybrid CVT",
      "anio": 2026,
      "tipo": "HEV",
      "carroceria": "Sedán",
      "origen": "Brasil",
      "precioNuevo": 24964024,
      "precioNuevoNota": "Precio de entrada del Corolla híbrido sedán.",
      "precioUsado": 20500000,
      "precioUsadoNota": "Estimado.",
      "precioUsadoEstimado": true,
      "dim": {
        "largo": 4630,
        "ancho": 1780,
        "alto": 1435,
        "ejes": 2700,
        "maletero": 470,
        "despeje": 130
      },
      "potencia": 122,
      "torque": 142,
      "traccion": "4x2",
      "transmision": "e-CVT",
      "rend": {
        "ciudad": 25,
        "carretera": 21.3,
        "mixto": 23,
        "ciclo": "estimado",
        "cicloCiudad": "Chile"
      },
      "ev": null,
      "historial": [
        {
          "fecha": "2026-08-21",
          "precio": 24964024,
          "clase": "nuevo",
          "fuente": "autofact"
        }
      ],
      "notas": "Mismo tren motriz del Corolla Cross, $3M más barato y 19 cm más bajo. Si no necesitas altura de SUV, es la opción eficiente y barata.",
      "fuentes": [
        {
          "titulo": "Toyota Chile — Corolla Híbrido",
          "url": "https://toyota.cl/modelos/sedan/corolla-hybrid/"
        },
        {
          "titulo": "Autofact — autos híbridos en Chile 2026",
          "url": "https://www.autofact.cl/blog/comprar-auto/elegir-tipo/autos-hibridos"
        }
      ],
      "paisMarca": "Japonesa",
      "equipamiento": "entrada"
    },
    {
      "id": "hyundai-tucson-hev-plus",
      "marca": "Hyundai",
      "modelo": "Tucson",
      "version": "1.6T HEV Plus 4x2",
      "anio": 2026,
      "tipo": "HEV",
      "carroceria": "SUV mediano",
      "origen": "Corea",
      "precioNuevo": 28990000,
      "precioNuevoNota": "Hyundai solo publica precios con financiamiento Amicar: $28.990.000 la Plus, $33.690.000 la Design y $37.490.000 la 4WD Limited. No hay precio de lista publicado.",
      "precioUsado": 25000000,
      "precioUsadoNota": "Estimado.",
      "precioUsadoEstimado": true,
      "dim": {
        "largo": 4640,
        "ancho": 1865,
        "alto": 1665,
        "ejes": 2755,
        "maletero": 539,
        "despeje": 180
      },
      "potencia": 227,
      "torque": 350,
      "traccion": "4x2",
      "transmision": "AT 6v",
      "rend": {
        "ciudad": 30.3,
        "carretera": 14.7,
        "mixto": null,
        "ciclo": null,
        "cicloCiudad": "Chile"
      },
      "ev": null,
      "historial": [
        {
          "fecha": "2026-08-21",
          "precio": 28990000,
          "clase": "nuevo",
          "fuente": "hyundai.cl"
        }
      ],
      "notas": "El híbrido más potente por su precio: 227 HP. Ojo con el desplome en carretera (14,7 km/l), el motor 1.6 turbo carga con 2.210 kg.",
      "fuentes": [
        {
          "titulo": "Hyundai Chile — ficha técnica Tucson Híbrido",
          "url": "https://www.hyundai.cl/nuestros-modelos/ecologicos/the-new-tucson-hibrido/especificaciones-tecnicas/"
        }
      ],
      "paisMarca": "Coreana",
      "equipamiento": "entrada"
    },
    {
      "id": "kia-niro-hev-lx",
      "marca": "Kia",
      "modelo": "Niro",
      "version": "1.6 HEV LX 6DCT",
      "anio": 2026,
      "tipo": "HEV",
      "carroceria": "SUV compacto",
      "origen": "Corea",
      "precioNuevo": 29990000,
      "precioNuevoNota": "Versión EX Full a $34.990.000.",
      "precioUsado": 25500000,
      "precioUsadoNota": "Estimado.",
      "precioUsadoEstimado": true,
      "dim": {
        "largo": 4420,
        "ancho": 1825,
        "alto": 1560,
        "ejes": 2720,
        "maletero": 451,
        "maleteroMax": 1445,
        "despeje": 155
      },
      "potencia": 141,
      "torque": 265,
      "traccion": "4x2",
      "transmision": "DCT 6v",
      "rend": {
        "ciudad": null,
        "carretera": null,
        "mixto": 22.2,
        "ciclo": "WLTP",
        "cicloCiudad": null
      },
      "ev": null,
      "historial": [
        {
          "fecha": "2026-08-21",
          "precio": 29990000,
          "clase": "nuevo",
          "fuente": "chileautos / kia.cl"
        }
      ],
      "notas": "Hermano mecánico del Kona híbrido con 12 cm más de distancia entre ejes y maletero parecido. 22,2 km/l WLTP es de los mejores números reales de la tabla.",
      "fuentes": [
        {
          "titulo": "chileautos — precios Kia Niro 2026",
          "url": "https://www.chileautos.cl/kia/niro/precio/2026/"
        },
        {
          "titulo": "Kia Chile — ficha técnica Niro Híbrido",
          "url": "https://www.kia.cl/content/dam/indumotora/general/fichas-tecnicas/2023/10-octubre/Ficha-Tecnica-NiroHibrido.pdf"
        }
      ],
      "paisMarca": "Coreana",
      "equipamiento": "entrada"
    },
    {
      "id": "kia-sportage-hev-lx",
      "marca": "Kia",
      "modelo": "Sportage",
      "version": "1.6T HEV LX 6AT",
      "anio": 2026,
      "tipo": "HEV",
      "carroceria": "SUV mediano",
      "origen": "Corea",
      "precioNuevo": 33990000,
      "precioNuevoNota": "Kia también publica $31.990.000 como precio promocional para la LX.",
      "precioUsado": 29000000,
      "precioUsadoNota": "Estimado, modelo recién lanzado (dic 2025).",
      "precioUsadoEstimado": true,
      "dim": {
        "largo": 4685,
        "ancho": 1865,
        "alto": 1665,
        "ejes": 2755,
        "maletero": 543,
        "maleteroMax": 1829,
        "despeje": 180
      },
      "potencia": 235,
      "torque": 350,
      "traccion": "4x2",
      "transmision": "AT 6v",
      "rend": {
        "ciudad": null,
        "carretera": null,
        "mixto": 17,
        "ciclo": "estimado",
        "cicloCiudad": null
      },
      "ev": null,
      "historial": [
        {
          "fecha": "2026-08-21",
          "precio": 33990000,
          "clase": "nuevo",
          "fuente": "autocosmos / kia.cl"
        }
      ],
      "notas": "Primo hermano del Tucson Híbrido (misma plataforma y tren motriz), 4,5 cm más largo y con 543 L de maletero.",
      "fuentes": [
        {
          "titulo": "Autocosmos — Kia Sportage HEV 2026 en Chile",
          "url": "https://noticias.autocosmos.cl/2025/12/16/kia-sportage-hev-2026-en-chile-diversificando-la-electrificacion"
        },
        {
          "titulo": "Kia Chile — ficha técnica Sportage",
          "url": "https://www.kia.cl/content/dam/indumotora/general/fichas-tecnicas/2025/Ficha-Tecnica-Nuevo-Sportage.pdf"
        }
      ],
      "paisMarca": "Coreana",
      "precioFinanciado": 31990000,
      "precioFinanciadoNota": "Precio promocional Kia para la LX.",
      "equipamiento": "entrada"
    },
    {
      "id": "kia-sportage-hev-xline",
      "marca": "Kia",
      "modelo": "Sportage",
      "version": "1.6T HEV X-Line AWD",
      "anio": 2026,
      "tipo": "HEV",
      "carroceria": "SUV mediano",
      "origen": "Corea",
      "precioNuevo": 42990000,
      "precioNuevoNota": "Versión tope, tracción integral.",
      "precioUsado": null,
      "precioUsadoNota": "Sin mercado usado todavía.",
      "precioUsadoEstimado": false,
      "dim": {
        "largo": 4685,
        "ancho": 1865,
        "alto": 1665,
        "ejes": 2755,
        "maletero": 543,
        "maleteroMax": 1829,
        "despeje": 180
      },
      "potencia": 235,
      "torque": 350,
      "traccion": "AWD",
      "transmision": "AT 6v",
      "rend": {
        "ciudad": null,
        "carretera": null,
        "mixto": 16,
        "ciclo": "estimado",
        "cicloCiudad": null
      },
      "ev": null,
      "historial": [
        {
          "fecha": "2026-08-21",
          "precio": 42990000,
          "clase": "nuevo",
          "fuente": "autocosmos"
        }
      ],
      "notas": "Nueve millones más que la LX por AWD y equipamiento.",
      "fuentes": [
        {
          "titulo": "Autocosmos — Kia Sportage HEV 2026 en Chile",
          "url": "https://noticias.autocosmos.cl/2025/12/16/kia-sportage-hev-2026-en-chile-diversificando-la-electrificacion"
        }
      ],
      "paisMarca": "Coreana",
      "equipamiento": "tope"
    },
    {
      "id": "kia-sorento-hev-2wd",
      "marca": "Kia",
      "modelo": "Sorento",
      "version": "1.6T HEV 2WD",
      "anio": 2026,
      "tipo": "HEV",
      "carroceria": "SUV grande",
      "origen": "Corea",
      "precioNuevo": 42990000,
      "precioNuevoNota": "AWD a $51.990.000. Tres corridas de asientos.",
      "precioUsado": null,
      "precioUsadoNota": "Sin mercado usado todavía.",
      "precioUsadoEstimado": false,
      "dim": {
        "largo": 4815,
        "ancho": 1900,
        "alto": 1700,
        "ejes": 2815,
        "maletero": 616,
        "despeje": 176
      },
      "potencia": 238,
      "torque": 367,
      "traccion": "4x2",
      "transmision": "AT 6v",
      "rend": {
        "ciudad": null,
        "carretera": null,
        "mixto": 14,
        "ciclo": "declarado",
        "cicloCiudad": null
      },
      "ev": null,
      "dimsPorConfirmar": true,
      "historial": [
        {
          "fecha": "2026-08-21",
          "precio": 42990000,
          "clase": "nuevo",
          "fuente": "La Tercera"
        }
      ],
      "notas": "Otro segmento: 7 asientos y 4,8 m. Lo dejo por completitud de la marca, no porque calce con lo que buscabas.",
      "fuentes": [
        {
          "titulo": "La Tercera — Nuevo Kia Sorento HEV en Chile",
          "url": "https://www.latercera.com/mtonline/noticia/nuevo-kia-sorento-hev-crece-la-ofensiva-hibrida-de-la-marca-en-chile/"
        }
      ],
      "paisMarca": "Coreana",
      "equipamiento": "entrada"
    },
    {
      "id": "kia-ev5-light",
      "marca": "Kia",
      "modelo": "EV5",
      "version": "Light",
      "anio": 2026,
      "tipo": "EV",
      "carroceria": "SUV mediano",
      "origen": "China",
      "precioNuevo": 39990000,
      "precioNuevoNota": "Versión Wave a $49.990.000. Ambos precios incluyen bonos de marca y financiamiento.",
      "precioUsado": null,
      "precioUsadoNota": "Sin mercado usado relevante.",
      "precioUsadoEstimado": false,
      "dim": {
        "largo": 4615,
        "ancho": 1875,
        "alto": 1715,
        "ejes": 2750,
        "maletero": 513,
        "despeje": 175
      },
      "potencia": 215,
      "torque": 310,
      "traccion": "4x2",
      "transmision": "Directa",
      "rend": {
        "ciudad": null,
        "carretera": null,
        "mixto": null,
        "ciclo": null,
        "cicloCiudad": null
      },
      "ev": {
        "bateriaKwh": 64.2,
        "autonomiaKm": 400,
        "consumoKwh100": 16.5
      },
      "dimsPorConfirmar": true,
      "historial": [
        {
          "fecha": "2026-08-21",
          "precio": 39990000,
          "clase": "nuevo",
          "fuente": "kia.cl / chileautos"
        }
      ],
      "notas": "Eléctrico coreano de marca pero fabricado en China. Dimensiones y consumo tomados de ficha regional: confírmalos.",
      "fuentes": [
        {
          "titulo": "chileautos — Kia EV5 llega a Chile",
          "url": "https://www.chileautos.cl/noticias/detalle/kia-ev5-el-nuevo-suv-100-electrico-ya-esta-en-chile--29660/"
        }
      ],
      "paisMarca": "Coreana",
      "precioFinanciado": 39990000,
      "precioFinanciadoNota": "Incluye bonos de marca y financiamiento.",
      "equipamiento": "entrada"
    },
    {
      "id": "toyota-rav4-hev-le",
      "marca": "Toyota",
      "modelo": "RAV4",
      "version": "2.5 Hybrid LE 4x2 eCVT",
      "anio": 2026,
      "tipo": "HEV",
      "carroceria": "SUV mediano",
      "origen": "Japón",
      "precioNuevo": 33490000,
      "precioNuevoNota": "La gama RAV4 2026 completa va de $28.990.000 a $42.990.000 entre bencineras e híbridas.",
      "precioUsado": 28500000,
      "precioUsadoNota": "Estimado. El RAV4 híbrido tiene mucha demanda en el usado y deprecia poco.",
      "precioUsadoEstimado": true,
      "dim": {
        "largo": 4600,
        "ancho": 1855,
        "alto": 1685,
        "ejes": 2690,
        "maletero": 514,
        "despeje": 190
      },
      "potencia": 222,
      "torque": 221,
      "traccion": "4x2",
      "transmision": "e-CVT",
      "rend": {
        "ciudad": 21.3,
        "carretera": 14.5,
        "mixto": 17.5,
        "ciclo": "estimado",
        "cicloCiudad": "Chile"
      },
      "ev": null,
      "historial": [
        {
          "fecha": "2026-08-21",
          "precio": 33490000,
          "clase": "nuevo",
          "fuente": "autofact / brunofritsch"
        }
      ],
      "notas": "El híbrido japonés de referencia. Un escalón sobre el Corolla Cross en tamaño, potencia y precio; también el que mejor mantiene el valor de reventa.",
      "fuentes": [
        {
          "titulo": "Toyota Chile — All New RAV4 Híbrido",
          "url": "https://toyota.cl/modelos/suv/all-new-rav4-hibrido/"
        },
        {
          "titulo": "Autofact — Toyota RAV4 Híbrida precios 2026",
          "url": "https://www.autofact.cl/blog/comprar-auto/modelos/rav4-hibrida"
        }
      ],
      "paisMarca": "Japonesa",
      "equipamiento": "entrada"
    },
    {
      "id": "lexus-ux-300h",
      "marca": "Lexus",
      "modelo": "UX 300h",
      "version": "2.0 Premium Híbrido",
      "anio": 2026,
      "tipo": "HEV",
      "carroceria": "SUV compacto premium",
      "origen": "Japón",
      "precioNuevo": 39990000,
      "precioNuevoNota": "Sucesor híbrido del UX 200.",
      "precioUsado": 34000000,
      "precioUsadoNota": "Estimado. El UX 200 bencinero 2023 se consigue bastante más barato.",
      "precioUsadoEstimado": true,
      "dim": {
        "largo": 4495,
        "ancho": 1840,
        "alto": 1540,
        "ejes": 2640,
        "maletero": 367,
        "despeje": 160
      },
      "potencia": 199,
      "torque": 185,
      "traccion": "4x2",
      "transmision": "e-CVT",
      "rend": {
        "ciudad": null,
        "carretera": null,
        "mixto": 19.6,
        "ciclo": "WLTP",
        "cicloCiudad": null
      },
      "ev": null,
      "historial": [
        {
          "fecha": "2026-08-21",
          "precio": 39990000,
          "clase": "nuevo",
          "fuente": "brunofritsch / autocosmos"
        }
      ],
      "notas": "Es la versión híbrida del UX 200. 199 HP y 3 cm más largo que el LBX, con maletero apenas mayor (367 L).",
      "fuentes": [
        {
          "titulo": "Bruno Fritsch — Lexus UX 2026",
          "url": "https://www.brunofritsch.cl/lexus-ux"
        }
      ],
      "paisMarca": "Japonesa",
      "equipamiento": "medio"
    },
    {
      "id": "nissan-xtrail-epower",
      "marca": "Nissan",
      "modelo": "X-Trail",
      "version": "e-Power Advance AWD",
      "anio": 2026,
      "tipo": "HEV",
      "carroceria": "SUV mediano",
      "origen": "Japón",
      "precioNuevo": 36610000,
      "precioNuevoNota": "Precio de entrada, IVA incluido. Versiones Advance y Exclusive, ambas de 3 corridas.",
      "precioUsado": 31000000,
      "precioUsadoNota": "Estimado.",
      "precioUsadoEstimado": true,
      "dim": {
        "largo": 4680,
        "ancho": 1840,
        "alto": 1725,
        "ejes": 2705,
        "maletero": 575,
        "despeje": 200
      },
      "potencia": 204,
      "torque": 330,
      "traccion": "AWD",
      "transmision": "e-Power (serie)",
      "rend": {
        "ciudad": null,
        "carretera": null,
        "mixto": 17.5,
        "ciclo": "WLTP",
        "cicloCiudad": null
      },
      "ev": null,
      "historial": [
        {
          "fecha": "2026-08-21",
          "precio": 36610000,
          "clase": "nuevo",
          "fuente": "nissan.cl"
        }
      ],
      "notas": "Híbrido en serie: las ruedas siempre las mueve el motor eléctrico y el bencinero solo genera electricidad. Se maneja como eléctrico sin necesitar enchufe.",
      "fuentes": [
        {
          "titulo": "Nissan Chile — X-Trail e-POWER",
          "url": "https://www.nissan.cl/vehiculos/nuevos/nissan-xtrail-epower.html"
        }
      ],
      "paisMarca": "Japonesa",
      "equipamiento": "entrada"
    },
    {
      "id": "subaru-crosstrek-hybrid",
      "marca": "Subaru",
      "modelo": "Crosstrek",
      "version": "2.0i Hybrid AWD Touring ES",
      "anio": 2026,
      "tipo": "MHEV",
      "carroceria": "SUV compacto",
      "origen": "Japón",
      "precioNuevo": 31390000,
      "precioNuevoNota": "La gama Crosstrek arranca en $25.490.000 con la CVT Plus bencinera.",
      "precioUsado": 26500000,
      "precioUsadoNota": "Estimado.",
      "precioUsadoEstimado": true,
      "dim": {
        "largo": 4480,
        "ancho": 1800,
        "alto": 1580,
        "ejes": 2670,
        "maletero": 315,
        "despeje": 220
      },
      "potencia": 150,
      "torque": 196,
      "traccion": "AWD simétrica",
      "transmision": "CVT",
      "rend": {
        "ciudad": null,
        "carretera": null,
        "mixto": 14,
        "ciclo": "estimado",
        "cicloCiudad": null
      },
      "ev": null,
      "historial": [
        {
          "fecha": "2026-08-21",
          "precio": 31390000,
          "clase": "nuevo",
          "fuente": "autocosmos / subaru.cl"
        }
      ],
      "notas": "Híbrido liviano: el e-Boxer casi no ahorra combustible, lo que ofrece es AWD simétrico permanente y 220 mm de despeje. Si el objetivo es gastar menos bencina, no es este.",
      "fuentes": [
        {
          "titulo": "Subaru Chile — Crosstrek Híbrido",
          "url": "https://www.subaru.cl/vehiculos/all-new-crosstrek-hibrido/"
        },
        {
          "titulo": "Autofact — Subaru Crosstrek precios 2026",
          "url": "https://www.autofact.cl/blog/comprar-auto/modelos/subaru-crosstrek"
        }
      ],
      "paisMarca": "Japonesa",
      "equipamiento": "tope"
    },
    {
      "id": "subaru-forester-strong-hybrid",
      "marca": "Subaru",
      "modelo": "Forester",
      "version": "2.5 Strong Hybrid Touring AWD",
      "anio": 2026,
      "tipo": "HEV",
      "carroceria": "SUV mediano",
      "origen": "Japón",
      "precioNuevo": 41990000,
      "precioNuevoNota": "Tope de gama. El Forester parte en $27.990.000 con la XS bencinera.",
      "precioUsado": null,
      "precioUsadoNota": "Generación lanzada en septiembre 2025, sin usado relevante.",
      "precioUsadoEstimado": false,
      "dim": {
        "largo": 4670,
        "ancho": 1830,
        "alto": 1730,
        "ejes": 2670,
        "maletero": 508,
        "maleteroMax": 1779,
        "despeje": 220
      },
      "potencia": 194,
      "torque": 276,
      "traccion": "AWD simétrica",
      "transmision": "e-CVT",
      "rend": {
        "ciudad": null,
        "carretera": null,
        "mixto": 16,
        "ciclo": "estimado",
        "cicloCiudad": null
      },
      "ev": null,
      "historial": [
        {
          "fecha": "2026-08-21",
          "precio": 41990000,
          "clase": "nuevo",
          "fuente": "subaru.cl / pompeyo"
        }
      ],
      "notas": "Este sí es híbrido full (anda en eléctrico puro a baja velocidad), a diferencia del Crosstrek. AWD permanente y 220 mm de despeje: el más capaz fuera del pavimento de toda la tabla.",
      "fuentes": [
        {
          "titulo": "Subaru Chile — Forester Strong Hybrid",
          "url": "https://www.subaru.cl/vehiculos/all-new-forester-hibrido/"
        },
        {
          "titulo": "MercadoLibre — Nuevo Subaru Forester 2026 precios",
          "url": "https://www.mercadolibre.cl/blog/mo-lanzamientos-nuevo-subaru-forester-2026-precio-versiones-y-ficha-tecnica"
        }
      ],
      "paisMarca": "Japonesa",
      "equipamiento": "tope"
    },
    {
      "id": "honda-crv-ehev",
      "marca": "Honda",
      "modelo": "CR-V",
      "version": "2.0 e:HEV",
      "anio": 2026,
      "tipo": "HEV",
      "carroceria": "SUV mediano",
      "origen": "Japón",
      "precioNuevo": 51990000,
      "precioNuevoNota": "Única versión de equipamiento. Es el híbrido japonés más caro de la tabla.",
      "precioUsado": null,
      "precioUsadoNota": "Recién lanzado en Chile.",
      "precioUsadoEstimado": false,
      "dim": {
        "largo": 4710,
        "ancho": 1870,
        "alto": 1670,
        "ejes": 2700,
        "maletero": 587,
        "maleteroMax": 1634,
        "despeje": 198
      },
      "potencia": 184,
      "torque": 335,
      "traccion": "4x2",
      "transmision": "e-CVT",
      "rend": {
        "ciudad": null,
        "carretera": null,
        "mixto": 17,
        "ciclo": "estimado",
        "cicloCiudad": null
      },
      "ev": null,
      "historial": [
        {
          "fecha": "2026-08-21",
          "precio": 51990000,
          "clase": "nuevo",
          "fuente": "La Tercera / rutamotor"
        }
      ],
      "notas": "Honda volvió a los híbridos en Chile con este. Buen maletero (587 L) pero a $52M compite con cosas mucho más grandes.",
      "fuentes": [
        {
          "titulo": "Rutamotor — Honda retorna a los híbridos con el CR-V HEV",
          "url": "https://www.rutamotor.com/honda-retorna-a-los-hibridos-en-chile-y-presenta-el-nuevo-cr-v-hev/"
        }
      ],
      "paisMarca": "Japonesa",
      "equipamiento": "unica"
    },
    {
      "id": "mitsubishi-outlander-phev",
      "marca": "Mitsubishi",
      "modelo": "Outlander",
      "version": "PHEV",
      "anio": 2026,
      "tipo": "PHEV",
      "carroceria": "SUV mediano",
      "origen": "Japón",
      "precioNuevo": 44990000,
      "precioNuevoNota": "Precio de lista.",
      "precioUsado": null,
      "precioUsadoNota": "Poco stock usado.",
      "precioUsadoEstimado": false,
      "dim": {
        "largo": 4720,
        "ancho": 1860,
        "alto": 1750,
        "ejes": 2705,
        "maletero": 495,
        "maleteroMax": 1422,
        "despeje": 200
      },
      "potencia": 306,
      "torque": 450,
      "traccion": "AWD",
      "transmision": "Directa",
      "rend": {
        "ciudad": null,
        "carretera": null,
        "mixto": 20,
        "ciclo": "estimado",
        "cicloCiudad": null
      },
      "ev": {
        "bateriaKwh": 22.7,
        "autonomiaKm": 86,
        "consumoKwh100": null
      },
      "historial": [
        {
          "fecha": "2026-08-21",
          "precio": 44990000,
          "clase": "nuevo",
          "fuente": "difor.cl"
        }
      ],
      "notas": "Enchufable con 86 km eléctricos WLTP: si cargas en casa, la ciudad la haces sin bencina. La ficha chilena menciona batería de 20 kWh, la internacional 22,7 — confirma cuál llega acá.",
      "fuentes": [
        {
          "titulo": "Difor — Mitsubishi Outlander PHEV Chile",
          "url": "https://www.difor.cl/mitsubishi-motors-outlander-phev-chile"
        }
      ],
      "paisMarca": "Japonesa",
      "equipamiento": "unica"
    },
    {
      "id": "hyundai-kona-electrico",
      "marca": "Hyundai",
      "modelo": "Kona",
      "version": "Eléctrico",
      "anio": 2026,
      "tipo": "EV",
      "carroceria": "SUV compacto",
      "origen": "Corea",
      "precioNuevo": 36990000,
      "precioNuevoNota": "Precio de entrada de la versión 100% eléctrica.",
      "precioUsado": 30000000,
      "precioUsadoNota": "Estimado.",
      "precioUsadoEstimado": true,
      "dim": {
        "largo": 4355,
        "ancho": 1825,
        "alto": 1580,
        "ejes": 2660,
        "maletero": 466,
        "maleteroMax": 1300,
        "despeje": 170
      },
      "potencia": 218,
      "torque": 255,
      "traccion": "4x2",
      "transmision": "Directa",
      "rend": {
        "ciudad": null,
        "carretera": null,
        "mixto": null,
        "ciclo": null,
        "cicloCiudad": null
      },
      "ev": {
        "bateriaKwh": 65.4,
        "autonomiaKm": 514,
        "consumoKwh100": 14.7
      },
      "dimsPorConfirmar": true,
      "historial": [
        {
          "fecha": "2026-08-21",
          "precio": 36990000,
          "clase": "nuevo",
          "fuente": "autofact"
        }
      ],
      "notas": "Mismo auto que el Kona híbrido pero 100% eléctrico: $9M más caro y el costo por 100 km cae a menos de un tercio. Batería y autonomía por confirmar según versión.",
      "fuentes": [
        {
          "titulo": "Autofact — autos eléctricos en Chile 2026",
          "url": "https://www.autofact.cl/blog/noticias/autofact/autos-electricos"
        }
      ],
      "paisMarca": "Coreana",
      "equipamiento": "entrada"
    },
    {
      "id": "suzuki-swift-hybrid",
      "marca": "Suzuki",
      "modelo": "Swift",
      "version": "1.2 GLX Hybrid",
      "anio": 2026,
      "tipo": "MHEV",
      "carroceria": "Hatchback",
      "origen": "Japón o India (por confirmar)",
      "paisMarca": "Japonesa",
      "precioNuevo": 15090000,
      "precioNuevoNota": "La gama va de $15.090.000 a $17.790.000 según versión y transmisión. En marzo de 2026 el precio de lista de entrada era $14.390.000.",
      "precioUsado": 12500000,
      "precioUsadoNota": "Estimado. El Swift tiene harto stock usado en chileautos y una reventa bastante estable.",
      "precioUsadoEstimado": true,
      "dim": {
        "largo": 3860,
        "ancho": 1735,
        "alto": 1520,
        "ejes": 2450,
        "maletero": 265,
        "maleteroMax": 580,
        "despeje": 145
      },
      "potencia": 88,
      "torque": 120,
      "traccion": "4x2",
      "transmision": "MT 5v o CVT",
      "rend": {
        "ciudad": 21.3,
        "carretera": 26,
        "mixto": 24,
        "ciclo": "Chile",
        "cicloCiudad": "Chile"
      },
      "ev": null,
      "historial": [
        {
          "fecha": "2026-08-21",
          "precio": 15090000,
          "clase": "nuevo",
          "fuente": "chileautos / autofact"
        }
      ],
      "notas": "El híbrido más barato de la tabla y el único hatchback chico. Ojo con la etiqueta: es mild hybrid SHVS de 12V, apenas un ISG que asiste al motor — el ahorro viene de que pesa 1 tonelada y tiene 88 HP, no de la parte eléctrica. 265 L de maletero es menos de la mitad que cualquier SUV de la lista.",
      "fuentes": [
        {
          "titulo": "Suzuki Chile — Swift Hybrid",
          "url": "https://www.suzuki.cl/vehiculo/swift-hybrid/"
        },
        {
          "titulo": "chileautos — precios Swift Hybrid 2026",
          "url": "https://www.chileautos.cl/suzuki/swift-hybrid/precio/2026/"
        },
        {
          "titulo": "Autofact — Suzuki Swift Híbrido",
          "url": "https://www.autofact.cl/blog/comprar-auto/modelos/suzuki-swift-hibrido"
        }
      ],
      "equipamiento": "tope"
    },
    {
      "id": "suzuki-fronx-hybrid",
      "marca": "Suzuki",
      "modelo": "Fronx",
      "version": "1.5 GLX Hybrid",
      "anio": 2026,
      "tipo": "MHEV",
      "carroceria": "SUV subcompacto",
      "origen": "India",
      "paisMarca": "Japonesa",
      "precioNuevo": 14590000,
      "precioNuevoNota": "Precio de entrada. Cuatro versiones: GL MT, GL AT, GLX MT y GLX AT.",
      "precioUsado": null,
      "precioUsadoNota": "Modelo recién lanzado, sin mercado usado relevante.",
      "precioUsadoEstimado": false,
      "dim": {
        "largo": 3995,
        "ancho": 1765,
        "alto": 1550,
        "ejes": null,
        "maletero": 304,
        "despeje": null
      },
      "potencia": 102,
      "torque": 137,
      "traccion": "4x2",
      "transmision": "MT 5v o AT",
      "rend": {
        "ciudad": null,
        "carretera": null,
        "mixto": 19.2,
        "ciclo": "Chile",
        "cicloCiudad": null
      },
      "ev": null,
      "historial": [
        {
          "fecha": "2026-08-21",
          "precio": 14590000,
          "clase": "nuevo",
          "fuente": "suzuki.cl / rutamotor"
        }
      ],
      "notas": "El SUV híbrido más barato del mercado chileno. También mild hybrid 12V. Mide menos de 4 metros: es un escalón bajo el Yaris Cross en todo, incluido el maletero (304 L).",
      "fuentes": [
        {
          "titulo": "Suzuki Chile — Fronx",
          "url": "https://www.suzuki.cl/vehiculo/fronx/"
        },
        {
          "titulo": "Rutamotor — Suzuki estrena el Fronx, el híbrido más barato",
          "url": "https://www.rutamotor.com/lanzamientos/suzuki-estrena-su-totalmente-nuevo-fronx-que-se-posiciona-como-el-hibrido-mas-barato-del-mercado/"
        }
      ],
      "equipamiento": "tope"
    },
    {
      "id": "suzuki-across-hybrid",
      "marca": "Suzuki",
      "modelo": "Across",
      "version": "1.5 GL Hybrid MT",
      "anio": 2026,
      "tipo": "MHEV",
      "carroceria": "SUV compacto",
      "origen": "India",
      "paisMarca": "Japonesa",
      "precioNuevo": 17490000,
      "precioNuevoNota": "GL MT $17.490.000 · GLX MT $18.790.000 · GL AT $18.990.000 · tope $20.690.000.",
      "precioUsado": null,
      "precioUsadoNota": "Lanzado en abril de 2026, sin usado.",
      "precioUsadoEstimado": false,
      "dim": {
        "largo": 4360,
        "ancho": null,
        "alto": null,
        "ejes": null,
        "maletero": null,
        "maleteroMax": 615,
        "despeje": null
      },
      "potencia": null,
      "torque": null,
      "traccion": "4x2",
      "transmision": "MT 5v o AT 6v",
      "rend": {
        "ciudad": null,
        "carretera": null,
        "mixto": 16.5,
        "ciclo": "Chile",
        "cicloCiudad": null
      },
      "ev": null,
      "dimsPorConfirmar": true,
      "historial": [
        {
          "fecha": "2026-08-21",
          "precio": 17490000,
          "clase": "nuevo",
          "fuente": "suzuki.cl / Emol"
        }
      ],
      "notas": "Ojo: este Across NO es el RAV4 PHEV rebautizado que Suzuki vende en Europa, es un B-SUV propio homologado en Chile en 2026. Ficha técnica incompleta: solo está publicado el largo (4,36 m), el maletero máximo (615 L) y el consumo mixto. Pide la ficha en el concesionario antes de compararlo en serio.",
      "fuentes": [
        {
          "titulo": "Suzuki Chile — presentación del New Across Hybrid",
          "url": "https://www.suzuki.cl/blog/suzuki-presenta-en-chile-el-new-across-hybrid/"
        },
        {
          "titulo": "Emol — Suzuki lanza el Across Hybrid",
          "url": "https://www.emol.com/noticias/Autos/2026/04/09/1196790/suzuki-lanza-el-across-hybrid.html"
        }
      ],
      "equipamiento": "entrada"
    },
    {
      "id": "toyota-yaris-sedan-hev",
      "marca": "Toyota",
      "modelo": "Yaris Sedán",
      "version": "1.5 G Hybrid eCVT",
      "anio": 2026,
      "tipo": "HEV",
      "carroceria": "Sedán",
      "origen": "Brasil (por confirmar)",
      "paisMarca": "Japonesa",
      "precioNuevo": 21990000,
      "precioNuevoNota": "Versión única, equipamiento G. Se empezó a vender en Chile en febrero de 2026.",
      "precioUsado": 18500000,
      "precioUsadoNota": "Estimado, el híbrido lleva pocos meses a la venta.",
      "precioUsadoEstimado": true,
      "dim": {
        "largo": 4425,
        "ancho": 1740,
        "alto": 1495,
        "ejes": 2620,
        "maletero": 460,
        "despeje": 140
      },
      "potencia": 110,
      "torque": 141,
      "traccion": "4x2",
      "transmision": "e-CVT",
      "rend": {
        "ciudad": 31.1,
        "carretera": null,
        "mixto": 23.8,
        "ciclo": "Chile",
        "cicloCiudad": "Chile"
      },
      "ev": null,
      "historial": [
        {
          "fecha": "2026-08-21",
          "precio": 21990000,
          "clase": "nuevo",
          "fuente": "autocosmos / toyota.cl"
        }
      ],
      "notas": "Híbrido full (no mild), $1,5M más barato que el Yaris Cross, con 460 L de maletero y 23,8 km/l mixto homologado. La contra: sedán, 140 mm de despeje.",
      "fuentes": [
        {
          "titulo": "Toyota Chile — New Yaris Sedán Hybrid",
          "url": "https://toyota.cl/modelos/sedan/new-yaris-sedan-hybrid/"
        },
        {
          "titulo": "Autocosmos — Toyota comercializa el Yaris Sedán híbrido en Chile",
          "url": "https://noticias.autocosmos.cl/2026/02/17/toyota-ya-comercializa-en-chile-la-variante-hibrida-de-su-yaris-sedan"
        }
      ],
      "equipamiento": "unica"
    },
    {
      "id": "mg3-hybrid-plus",
      "marca": "MG",
      "modelo": "MG3",
      "version": "Hybrid+ 1.5",
      "anio": 2026,
      "tipo": "HEV",
      "carroceria": "Hatchback",
      "origen": "China",
      "paisMarca": "China",
      "precioNuevo": 16990000,
      "precioNuevoNota": "El rango publicado de la gama MG3 ($12.090.000–$16.990.000) incluye versiones bencineras; el Hybrid+ es el tope.",
      "precioUsado": null,
      "precioUsadoNota": "Sin mercado usado relevante.",
      "precioUsadoEstimado": false,
      "dim": {
        "largo": 4113,
        "ancho": 1797,
        "alto": 1502,
        "ejes": 2570,
        "maletero": 293,
        "despeje": null
      },
      "potencia": 194,
      "torque": 425,
      "traccion": "4x2",
      "transmision": "Híbrida automática",
      "rend": {
        "ciudad": null,
        "carretera": null,
        "mixto": 22.7,
        "ciclo": "WLTP",
        "cicloCiudad": null
      },
      "ev": null,
      "dimsPorConfirmar": true,
      "historial": [
        {
          "fecha": "2026-08-21",
          "precio": 16990000,
          "clase": "nuevo",
          "fuente": "autocosmos / pompeyo"
        }
      ],
      "notas": "Híbrido full de verdad (no mild) por menos de $17M y con 194 HP. Dimensiones tomadas de la ficha europea: confírmalas. Es el contrapunto directo al Swift — misma plata, el doble de potencia y sistema híbrido serio, pero marca china.",
      "fuentes": [
        {
          "titulo": "Autocosmos — MG 3 Hybrid 2026 Chile",
          "url": "https://www.autocosmos.cl/catalogo/2026/mg/3/hybrid/180512"
        },
        {
          "titulo": "km77 — MG3 Hybrid+ ficha técnica",
          "url": "https://www.km77.com/coches/mg/mg3/2024/estandar/hev/mg3-hybrid/datos"
        }
      ],
      "equipamiento": "tope"
    },
    {
      "id": "toyota-yaris-cross-xi",
      "marca": "Toyota",
      "modelo": "Yaris Cross",
      "version": "1.5 XI Hybrid 4x2 eCVT",
      "anio": 2026,
      "tipo": "HEV",
      "carroceria": "SUV subcompacto",
      "origen": "Indonesia",
      "precioNuevo": 23090000,
      "precioNuevoNota": "Precio al contado de la XI, versión de entrada del Yaris Cross híbrido.",
      "precioUsado": 19500000,
      "precioUsadoNota": "Estimado.",
      "precioUsadoEstimado": true,
      "dim": {
        "largo": 4310,
        "ancho": 1770,
        "alto": 1615,
        "ejes": 2620,
        "maletero": 466,
        "despeje": 210
      },
      "potencia": 125,
      "torque": 141,
      "traccion": "4x2",
      "transmision": "e-CVT",
      "rend": {
        "ciudad": 32,
        "carretera": null,
        "mixto": 20.8,
        "ciclo": "WLTP",
        "cicloCiudad": "Chile"
      },
      "ev": null,
      "historial": [
        {
          "fecha": "2026-08-22",
          "precio": 21490000,
          "clase": "nuevo",
          "fuente": "tienda.toyota.cl (financiado)"
        }
      ],
      "notas": "Versión de entrada: no trae Toyota Safety Sense completo ni el tablero digital LED continuo de la XG.",
      "fuentes": [
        {
          "titulo": "Toyota Chile — Yaris Cross Hybrid",
          "url": "https://toyota.cl/modelos/suv/yaris-cross-hybrid/"
        },
        {
          "titulo": "Rutamotor — Llega a Chile el Yaris Cross HEV",
          "url": "https://www.rutamotor.com/llega-a-chile-el-nuevo-toyota-yaris-cross-hev-el-modelo-de-entrada-en-la-categoria-hibrido-convencional/"
        },
        {
          "titulo": "Tienda Toyota Chile — Yaris Cross Híbrido",
          "url": "https://tienda.toyota.cl/index.php?id_product=785&rewrite=yaris-cross&controller=product"
        },
        {
          "titulo": "Salfa Automotriz — Yaris Cross HEV",
          "url": "https://www.salfaautomotriz.cl/web/guest/detalle/-/vehiculo/autos/toyota/yaris-cross-xi-1-5-cvt-hibrido"
        }
      ],
      "paisMarca": "Japonesa",
      "precioFinanciado": 21490000,
      "precioFinanciadoNota": "Con bono total de $3.100.000: $1.000.000 de marca más $2.100.000 del plan Renueve de MAF.",
      "equipamiento": "entrada"
    },
    {
      "id": "hyundai-tucson-hev-design",
      "marca": "Hyundai",
      "modelo": "Tucson",
      "version": "1.6T HEV Design 4x2",
      "anio": 2026,
      "tipo": "HEV",
      "carroceria": "SUV mediano",
      "origen": "Corea",
      "precioNuevo": 33690000,
      "precioNuevoNota": "Precio Hyundai con financiamiento Amicar. Hyundai no publica lista.",
      "precioUsado": 29000000,
      "precioUsadoNota": "Estimado.",
      "precioUsadoEstimado": true,
      "dim": {
        "largo": 4640,
        "ancho": 1865,
        "alto": 1665,
        "ejes": 2755,
        "maletero": 539,
        "despeje": 180
      },
      "potencia": 227,
      "torque": 350,
      "traccion": "4x2",
      "transmision": "AT 6v",
      "rend": {
        "ciudad": 30.3,
        "carretera": 14.7,
        "mixto": null,
        "ciclo": null,
        "cicloCiudad": "Chile"
      },
      "ev": null,
      "historial": [
        {
          "fecha": "2026-08-22",
          "precio": 33690000,
          "clase": "nuevo",
          "fuente": "hyundai.cl"
        }
      ],
      "notas": "Escalón intermedio del Tucson híbrido.",
      "fuentes": [
        {
          "titulo": "Hyundai Chile — ficha técnica Tucson Híbrido",
          "url": "https://www.hyundai.cl/nuestros-modelos/ecologicos/the-new-tucson-hibrido/especificaciones-tecnicas/"
        }
      ],
      "paisMarca": "Coreana",
      "equipamiento": "medio"
    },
    {
      "id": "hyundai-tucson-hev-limited",
      "marca": "Hyundai",
      "modelo": "Tucson",
      "version": "1.6T HEV Limited 4WD",
      "anio": 2026,
      "tipo": "HEV",
      "carroceria": "SUV mediano",
      "origen": "Corea",
      "precioNuevo": 37490000,
      "precioNuevoNota": "Precio Hyundai con financiamiento Amicar. Hyundai no publica lista.",
      "precioUsado": null,
      "precioUsadoNota": "Sin usado relevante.",
      "precioUsadoEstimado": false,
      "dim": {
        "largo": 4640,
        "ancho": 1865,
        "alto": 1665,
        "ejes": 2755,
        "maletero": 539,
        "despeje": 180
      },
      "potencia": 227,
      "torque": 350,
      "traccion": "4WD",
      "transmision": "AT 6v",
      "rend": {
        "ciudad": 30.3,
        "carretera": 14.7,
        "mixto": null,
        "ciclo": null,
        "cicloCiudad": "Chile"
      },
      "ev": null,
      "historial": [
        {
          "fecha": "2026-08-22",
          "precio": 37490000,
          "clase": "nuevo",
          "fuente": "hyundai.cl"
        }
      ],
      "notas": "Tope del Tucson híbrido y el único con tracción integral.",
      "fuentes": [
        {
          "titulo": "Hyundai Chile — ficha técnica Tucson Híbrido",
          "url": "https://www.hyundai.cl/nuestros-modelos/ecologicos/the-new-tucson-hibrido/especificaciones-tecnicas/"
        }
      ],
      "paisMarca": "Coreana",
      "equipamiento": "tope"
    },
    {
      "id": "kia-niro-hev-ex",
      "marca": "Kia",
      "modelo": "Niro",
      "version": "1.6 HEV EX Full 6DCT",
      "anio": 2026,
      "tipo": "HEV",
      "carroceria": "SUV compacto",
      "origen": "Corea",
      "precioNuevo": 34990000,
      "precioNuevoNota": "Versión tope del Niro híbrido.",
      "precioUsado": 29500000,
      "precioUsadoNota": "Estimado.",
      "precioUsadoEstimado": true,
      "dim": {
        "largo": 4420,
        "ancho": 1825,
        "alto": 1560,
        "ejes": 2720,
        "maletero": 451,
        "maleteroMax": 1445,
        "despeje": 155
      },
      "potencia": 141,
      "torque": 265,
      "traccion": "4x2",
      "transmision": "DCT 6v",
      "rend": {
        "ciudad": null,
        "carretera": null,
        "mixto": 22.2,
        "ciclo": "WLTP",
        "cicloCiudad": null
      },
      "ev": null,
      "historial": [
        {
          "fecha": "2026-08-22",
          "precio": 34990000,
          "clase": "nuevo",
          "fuente": "chileautos / kia.cl"
        }
      ],
      "notas": "Tope de gama del Niro.",
      "fuentes": [
        {
          "titulo": "chileautos — precios Kia Niro 2026",
          "url": "https://www.chileautos.cl/kia/niro/precio/2026/"
        },
        {
          "titulo": "Kia Chile — ficha técnica Niro Híbrido",
          "url": "https://www.kia.cl/content/dam/indumotora/general/fichas-tecnicas/2023/10-octubre/Ficha-Tecnica-NiroHibrido.pdf"
        }
      ],
      "paisMarca": "Coreana",
      "equipamiento": "tope"
    },
    {
      "id": "kia-ev5-wave",
      "marca": "Kia",
      "modelo": "EV5",
      "version": "Wave",
      "anio": 2026,
      "tipo": "EV",
      "carroceria": "SUV mediano",
      "origen": "China",
      "precioNuevo": 49990000,
      "precioNuevoNota": "Versión tope. Incluye bonos de marca y financiamiento.",
      "precioUsado": null,
      "precioUsadoNota": "Sin mercado usado relevante.",
      "precioUsadoEstimado": false,
      "dim": {
        "largo": 4615,
        "ancho": 1875,
        "alto": 1715,
        "ejes": 2750,
        "maletero": 513,
        "despeje": 175
      },
      "potencia": 215,
      "torque": 310,
      "traccion": "4x2",
      "transmision": "Directa",
      "rend": {
        "ciudad": null,
        "carretera": null,
        "mixto": null,
        "ciclo": null,
        "cicloCiudad": null
      },
      "ev": {
        "bateriaKwh": 64.2,
        "autonomiaKm": 400,
        "consumoKwh100": 16.5
      },
      "dimsPorConfirmar": true,
      "historial": [
        {
          "fecha": "2026-08-22",
          "precio": 49990000,
          "clase": "nuevo",
          "fuente": "kia.cl"
        }
      ],
      "notas": "Tope de gama del EV5. Dimensiones y consumo de ficha regional: confírmalos.",
      "fuentes": [
        {
          "titulo": "chileautos — Kia EV5 llega a Chile",
          "url": "https://www.chileautos.cl/noticias/detalle/kia-ev5-el-nuevo-suv-100-electrico-ya-esta-en-chile--29660/"
        }
      ],
      "paisMarca": "Coreana",
      "precioFinanciado": 49990000,
      "precioFinanciadoNota": "Incluye bonos de marca y financiamiento.",
      "equipamiento": "tope"
    },
    {
      "id": "kia-sorento-hev-awd",
      "marca": "Kia",
      "modelo": "Sorento",
      "version": "1.6T HEV AWD",
      "anio": 2026,
      "tipo": "HEV",
      "carroceria": "SUV grande",
      "origen": "Corea",
      "precioNuevo": 51990000,
      "precioNuevoNota": "Versión tope, tracción integral.",
      "precioUsado": null,
      "precioUsadoNota": "Sin mercado usado todavía.",
      "precioUsadoEstimado": false,
      "dim": {
        "largo": 4815,
        "ancho": 1900,
        "alto": 1700,
        "ejes": 2815,
        "maletero": 616,
        "despeje": 176
      },
      "potencia": 238,
      "torque": 367,
      "traccion": "AWD",
      "transmision": "AT 6v",
      "rend": {
        "ciudad": null,
        "carretera": null,
        "mixto": 13,
        "ciclo": "estimado",
        "cicloCiudad": null
      },
      "ev": null,
      "dimsPorConfirmar": true,
      "historial": [
        {
          "fecha": "2026-08-22",
          "precio": 51990000,
          "clase": "nuevo",
          "fuente": "La Tercera"
        }
      ],
      "notas": "Tope del Sorento. Siete asientos y 4,8 m: otro segmento.",
      "fuentes": [
        {
          "titulo": "La Tercera — Nuevo Kia Sorento HEV en Chile",
          "url": "https://www.latercera.com/mtonline/noticia/nuevo-kia-sorento-hev-crece-la-ofensiva-hibrida-de-la-marca-en-chile/"
        }
      ],
      "paisMarca": "Coreana",
      "equipamiento": "tope"
    },
    {
      "id": "toyota-bz4x-awd",
      "marca": "Toyota",
      "modelo": "bZ4X",
      "version": "Limited AWD",
      "anio": 2026,
      "tipo": "EV",
      "carroceria": "SUV mediano",
      "origen": "Japón",
      "precioNuevo": 46990000,
      "precioNuevoNota": "Versión tope, tracción integral.",
      "precioUsado": null,
      "precioUsadoNota": "Sin mercado usado: se lanzó en Chile en enero 2026.",
      "precioUsadoEstimado": false,
      "dim": {
        "largo": 4690,
        "ancho": 1860,
        "alto": 1650,
        "ejes": 2850,
        "maletero": 452,
        "despeje": 180
      },
      "potencia": 343,
      "torque": 268,
      "traccion": "AWD",
      "transmision": "Directa",
      "rend": {
        "ciudad": null,
        "carretera": null,
        "mixto": null,
        "ciclo": null,
        "cicloCiudad": null
      },
      "ev": {
        "bateriaKwh": 73.1,
        "autonomiaKm": 453,
        "consumoKwh100": 15.9
      },
      "historial": [
        {
          "fecha": "2026-08-22",
          "precio": 46990000,
          "clase": "nuevo",
          "fuente": "Publimetro — lanzamiento Chile"
        }
      ],
      "notas": "AWD: 25 km menos de autonomía y mayor consumo que la 4x2.",
      "fuentes": [
        {
          "titulo": "Toyota Chile — bZ4X",
          "url": "https://toyota.cl/modelos/suv/auto-electrico-toyota-bz4x/"
        },
        {
          "titulo": "Publimetro — bZ4X llega a Chile desde $41.990.000",
          "url": "https://www.publimetro.cl/comercial/2026/01/29/toyota-bz4x-el-primer-suv-100-electrico-de-toyota-llega-a-chile-con-precios-desde-41990000-y-hasta-478-km-de-autonomia/"
        }
      ],
      "paisMarca": "Japonesa",
      "equipamiento": "tope"
    },
    {
      "id": "tesla-model-y-awd",
      "marca": "Tesla",
      "modelo": "Model Y",
      "version": "Premium AWD",
      "anio": 2026,
      "tipo": "EV",
      "carroceria": "SUV mediano",
      "origen": "China",
      "precioNuevo": 42000000,
      "precioNuevoNota": "Versión tope. Los precios Tesla cambian sin aviso.",
      "precioUsado": null,
      "precioUsadoNota": "Sin dato de usado confiable.",
      "precioUsadoEstimado": false,
      "dim": {
        "largo": 4790,
        "ancho": 1982,
        "alto": 1624,
        "ejes": 2890,
        "maletero": 854,
        "maleteroMax": 2158,
        "despeje": 167
      },
      "potencia": 384,
      "torque": 420,
      "traccion": "AWD",
      "transmision": "Directa",
      "rend": {
        "ciudad": null,
        "carretera": null,
        "mixto": null,
        "ciclo": null,
        "cicloCiudad": null
      },
      "ev": {
        "bateriaKwh": null,
        "autonomiaKm": null,
        "consumoKwh100": 13.7
      },
      "historial": [
        {
          "fecha": "2026-08-22",
          "precio": 42000000,
          "clase": "nuevo",
          "fuente": "meganoticias / cualauto"
        }
      ],
      "notas": "Tracción integral. No tengo autonomía homologada para la versión chilena: aparece como —.",
      "fuentes": [
        {
          "titulo": "CualAuto — Tesla Model Y 2026 Chile",
          "url": "https://www.cualauto.cl/catalogo/tesla-model-y"
        },
        {
          "titulo": "Meganoticias — precios Tesla en Chile 2026",
          "url": "https://www.meganoticias.cl/nacional/523884-cuanto-cuesta-tesla-chile-modelos-mas-vendidos-precios-2026-05-06-2026.html"
        }
      ],
      "paisMarca": "Estadounidense",
      "equipamiento": "tope"
    },
    {
      "id": "haval-jolion-hev-elite",
      "marca": "Haval",
      "modelo": "Jolion",
      "version": "1.5 HEV Elite",
      "anio": 2026,
      "tipo": "HEV",
      "carroceria": "SUV compacto",
      "origen": "China",
      "precioNuevo": 26490000,
      "precioNuevoNota": "Versión tope del Jolion híbrido.",
      "precioUsado": 21000000,
      "precioUsadoNota": "Estimado. Los Jolion tienen bastante rotación en el usado.",
      "precioUsadoEstimado": true,
      "dim": {
        "largo": 4472,
        "ancho": 1841,
        "alto": 1619,
        "ejes": 2700,
        "maletero": 430,
        "maleteroMax": 1130,
        "despeje": 165
      },
      "potencia": 188,
      "torque": 375,
      "traccion": "4x2",
      "transmision": "DHT",
      "rend": {
        "ciudad": 30.4,
        "carretera": 14.8,
        "mixto": null,
        "ciclo": null,
        "cicloCiudad": "Chile"
      },
      "ev": null,
      "historial": [
        {
          "fecha": "2026-08-22",
          "precio": 26490000,
          "clase": "nuevo",
          "fuente": "autofact"
        }
      ],
      "notas": "Tope de gama del Jolion.",
      "fuentes": [
        {
          "titulo": "Autofact — SUV híbridos que se venden en Chile",
          "url": "https://www.autofact.cl/blog/comprar-auto/mercado/suv-hibridos"
        }
      ],
      "paisMarca": "China",
      "equipamiento": "tope"
    },
    {
      "id": "suzuki-across-hybrid-glx",
      "marca": "Suzuki",
      "modelo": "Across",
      "version": "1.5 GLX Hybrid AT",
      "anio": 2026,
      "tipo": "MHEV",
      "carroceria": "SUV compacto",
      "origen": "India",
      "paisMarca": "Japonesa",
      "precioNuevo": 20690000,
      "precioNuevoNota": "Tope de la gama Across.",
      "precioUsado": null,
      "precioUsadoNota": "Lanzado en abril de 2026, sin usado.",
      "precioUsadoEstimado": false,
      "dim": {
        "largo": 4360,
        "ancho": null,
        "alto": null,
        "ejes": null,
        "maletero": null,
        "maleteroMax": 615,
        "despeje": null
      },
      "potencia": null,
      "torque": null,
      "traccion": "4x2",
      "transmision": "MT 5v o AT 6v",
      "rend": {
        "ciudad": null,
        "carretera": null,
        "mixto": 16.5,
        "ciclo": "Chile",
        "cicloCiudad": null
      },
      "ev": null,
      "dimsPorConfirmar": true,
      "historial": [
        {
          "fecha": "2026-08-22",
          "precio": 20690000,
          "clase": "nuevo",
          "fuente": "suzuki.cl / Emol"
        }
      ],
      "notas": "Tope del Across. Ficha técnica incompleta igual que la GL: Suzuki solo publica largo, maletero máximo y consumo.",
      "fuentes": [
        {
          "titulo": "Suzuki Chile — presentación del New Across Hybrid",
          "url": "https://www.suzuki.cl/blog/suzuki-presenta-en-chile-el-new-across-hybrid/"
        },
        {
          "titulo": "Emol — Suzuki lanza el Across Hybrid",
          "url": "https://www.emol.com/noticias/Autos/2026/04/09/1196790/suzuki-lanza-el-across-hybrid.html"
        }
      ],
      "equipamiento": "tope"
    }
  ]
};

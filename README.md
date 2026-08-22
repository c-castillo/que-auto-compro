# Qué auto compro

Tabla comparativa de SUV híbridos y eléctricos disponibles en Chile, filtrable y ordenable
por marca, dimensiones, rendimiento y precio (con historial).

Datos recopilados en agosto de 2026 desde sitios oficiales de marca en Chile, chileautos.cl y
prensa especializada. Cada modelo lleva sus fuentes enlazadas en el panel de detalle. El precio de
la bencina se puede traer en vivo desde bencinaenlinea.cl según tu ubicación.

**33 modelos**, con prioridad en marcas japonesas y coreanas:

| Origen | Modelos | Marcas |
|---|---|---|
| Japonesa | 18 | Toyota (7), Suzuki (4), Lexus (2), Subaru (2), Nissan, Honda, Mitsubishi |
| Coreana | 9 | Hyundai (4), Kia (5) |
| China | 5 | MG (2), Haval, Chery, BYD |
| Estadounidense | 1 | Tesla |

No es solo SUV: incluye hatchback (Suzuki Swift, MG3) y sedán (Toyota Yaris Sedán, Corolla),
que con el mismo tren motriz salen más baratos y rinden más. Filtra por *Carrocería* para
volver a ver solo SUV.

Mazda quedó fuera: en Chile no vende ningún HEV, PHEV ni EV en este rango — su único
electrificado es el CX-90 mild hybrid a $55.490.000, otro segmento.

## Correr

No hay build ni dependencias. Abre `index.html` en el navegador:

```sh
open index.html
```

O, si prefieres servirlo:

```sh
python3 -m http.server 8777   # → http://localhost:8777
```

## Archivos

| Archivo | Qué hace |
|---|---|
| `index.html` | Estructura de la página |
| `styles.css` | Estilos (se adapta a modo claro/oscuro del sistema) |
| `app.js` | Filtros, orden, panel de detalle y gráficos |
| `data/autos.js` | **Fuente de datos única.** Editable a mano |
| `scripts/add-snapshot.mjs` | Agrega un punto al historial de precios |

## Cómo usarla

- **Ordenar**: click en cualquier encabezado. Segundo click invierte. Los "—" quedan siempre al final.
- **Filtrar**: chips de origen de marca/marca/tipo/carrocería (se acumulan), sliders de precio,
  km/l, largo y maletero. Para ver solo japoneses y coreanos, marca esos dos chips en *Origen marca*.
- **Detalle**: click en una fila abre specs completas, notas, fuentes y el gráfico de precios.
  La URL queda con `#id-del-modelo`, así que puedes compartir el link a un auto puntual.
- **Costo $/100 km**: columna calculada con la base elegida (mixto o ciudad). Los precios de
  bencina y kWh son editables arriba.
- **Responsive**: bajo 900px se ocultan las columnas secundarias y bajo 640px queda lo esencial
  (score, modelo, tipo, precio y costo). Cada columna declara su `prioridad` en `COLS`.
- **Carrocería** se muestra como silueta — sedán, hatchback o SUV — con la letra del tamaño
  (XS/C/M/G) y `+` si es premium. El nombre completo está en el tooltip.

## El score (0-100)

Cinco criterios, ponderados. Los pesos se ajustan con sliders en la página (default 20 c/u)
y el desglose de cada auto aparece en su panel de detalle.

| Criterio | Cómo se calcula |
|---|---|
| **Espacio interior** | Proxy: altura del vehículo (55%) + distancia entre ejes (45%), normalizados contra el rango de la tabla |
| **Costo por 100 km** | Costo de energía por 100 km — comparable entre híbrido y eléctrico. El más barato puntúa 100. Base seleccionable: ciclo mixto (default) o ciudad |
| **Precio** | El precio más barato publicado de esa versión. El más barato del set puntúa 100 |
| **Tamaño / estacionar** | Cuánto se pasa de la huella de un **auto de referencia** (4.325 × 1.790 mm, un SUV subcompacto). Igual o más chico = 100 |
| **Marca** | Toyota y Lexus 100 · resto japonesas 88 · Hyundai 82 · Tesla 80 · Kia 68 · chinas 30 |

Todo es editable en `data/autos.js` → `meta.score`: los pesos por defecto, los niveles de marca
y las medidas del auto de referencia (ponlas del auto que hoy te resulte cómodo de estacionar). Si un criterio no tiene dato (p. ej. el ancho del Suzuki Across), ese
criterio cuenta como 50 neutro y el score aparece con un `*`.

### El criterio de costo, en detalle

No puntúa km/l ni kWh sino **plata**, que es lo único que compara un híbrido con un eléctrico en
la misma escala. Se calcula así:

- **Eléctricos**: `consumo kWh/100 km × precio del kWh` (×0,9 si la base es ciudad).
- **Con motor a combustión**: `100 / km-l × precio bencina`.
- Donde **falta la cifra del ciclo elegido**, se deriva del otro: **×1,15** de mixto a ciudad en
  híbridos full (regeneran en cada frenada) y **×0,95** en mild hybrid y enchufables. Los valores
  derivados van con `~` en la columna *Costo* y con `der.` en *km/l ciudad*.

La **base de cálculo** se elige arriba, junto a los precios de bencina y kWh:

- **Ciclo mixto** (default): menos distorsionado, porque varias marcas publican WLTP o pruebas
  independientes.
- **Ciclo ciudad**: más representativo si manejas casi solo en ciudad, pero premia a quien
  homologa más agresivo en Chile (ver advertencia 1).

Los factores están en `data/autos.js` → `meta.score.factorCiudad`.

### Las tres advertencias importantes

1. **En base ciudad, el costo premia a quien homologa más agresivo.** Hyundai declara 40,1 km/l
   urbanos y Toyota 25,6 para autos que en pruebas independientes rinden casi lo mismo. Con base
   ciudad el Kona sube al podio por una diferencia de homologación, no de mecánica; con base mixto
   cae al puesto 10, porque ahí su cifra (22,7) viene de un test independiente. Por eso el default
   es mixto. El caso extremo es el MG ZS: su costo mixto se deriva de unos 43,5 km/l urbanos
   declarados, así que tómalo con pinzas (va marcado con `~`).

2. **Espacio y tamaño se contradicen por definición.** Uno premia autos altos y con buena
   distancia entre ejes; el otro premia autos chicos. Con pesos iguales se cancelan en parte.
   Si lo que más importa es ir cómodo, sube *Espacio* a 40 y baja *Tamaño* a 10 — el ranking
   cambia bastante.
3. **El criterio de espacio es un proxy, no un dato.** No hay altura libre al techo publicada
   para casi ningún modelo en Chile. Sirve para descartar, no para decidir — sobre todo si eres
   alto. Antes de comprar, siéntate en los finalistas con el asiento abajo y atrás del todo, y ojo
   con el techo panorámico: descuenta ~3 cm.

## Precio de la bencina

Por defecto la tabla usa **$1.433/L** de 93 octanos, que es el precio de la Shell de
Carlos Antúnez 2490 en Providencia.

El botón **Usar mi ubicación** pide permiso de geolocalización, resuelve tu comuna con
Nominatim (OpenStreetMap) y trae los precios reales de 93 de esa comuna desde
[bencinaenlinea.cl](https://www.bencinaenlinea.cl) (API pública de la CNE). Usa la **mediana**
de las estaciones de la comuna, no la más barata, y muestra el rango.

Todo ocurre en el navegador: no hay servidor propio, la ubicación no se guarda ni se envía a
ningún otro lado, y si cualquier paso falla se conserva el precio por defecto. El campo sigue
siendo editable a mano.

## Agregar precios al historial

El historial es lo único que no se puede reconstruir hacia atrás: hay que ir tomando muestras.
Cada vez que veas un precio nuevo (lista o una publicación de chileautos que te sirva de referencia):

```sh
node scripts/add-snapshot.mjs --list                      # ver los ids
node scripts/add-snapshot.mjs toyota-corolla-cross-xei 28490000
node scripts/add-snapshot.mjs hyundai-kona-hev-plus 25900000 \
     --clase usado --fuente "chileautos, 2025 Plus, 12.000 km"
```

El script actualiza el precio vigente del modelo y `meta.actualizado`. Si ya había un punto
de la misma fecha y clase, lo reemplaza.

Correrlo una vez al mes es suficiente para que en medio año tengas curvas reales.

## Advertencias sobre los datos

1. **Las cifras de km/l no son todas comparables.** Los 40,1 km/l urbanos del Kona y los 43,5 del
   MG son homologación chilena, muy optimista. Los 25,6 del Corolla Cross también son ciclo chileno,
   pero Toyota declara cifras bastante más conservadoras. La columna *km/l mixto* trae una etiqueta
   con el ciclo de origen (`Chile`, `WLTP`, `declarado`, `estimado`, `test independiente`) —
   compara solo dentro de la misma etiqueta.
2. **Precio usado**: los que llevan `~` son estimaciones, no precios observados. Los que no lo llevan
   salieron de publicaciones reales de chileautos.
3. **La columna Precio muestra el más barato publicado**, que normalmente exige financiamiento
   de la marca o bonos; va con una `f` volada. El precio de lista está en el tooltip cuando la
   marca publica ambos. Caso típico: el Kona HEV Plus aparece a $23.990.000 con Amicar, y su
   lista de $27.590.000 sale al pasar el mouse. Hyundai no publica lista para el Tucson.
4. **Dimensiones marcadas con `?`** (Chery Tiggo 4, BYD Song Pro, Kia Sorento, Kia EV5,
   Hyundai Kona Eléctrico, MG3, Suzuki Across) vienen de fichas regionales, no de la ficha chilena.
   Confírmalas antes de decidir por espacio. Del **Suzuki Across** solo hay largo, maletero máximo
   y consumo publicados: el resto aparece como `—` a propósito.
5. **MHEV no es lo mismo que HEV.** Suzuki (Swift, Fronx, Across, Grand Vitara) y el Subaru
   Crosstrek son *mild hybrid*: un ISG de 12V que asiste al motor pero nunca mueve el auto solo.
   Su buen rendimiento viene del poco peso, no del sistema híbrido. Filtra por *Tipo* para separarlos.
6. **El país de la marca no es el de fabricación.** El Kia EV5 es coreano de marca pero se fabrica
   en China; el Corolla Cross es japonés de marca pero viene de Brasil; el Yaris Cross, de Indonesia.
   El filtro *Origen marca* usa la marca; la fila *Origen* del panel de detalle indica la planta.
7. Precios revisados el **2026-08-21**. Los de Tesla cambian sin aviso.

/* Qué auto compro — tabla filtrable/ordenable de híbridos y eléctricos en Chile.
   Vanilla JS, sin dependencias. Los datos vienen de data/autos.js (window.AUTOS_DATA). */

(() => {
  'use strict';

  const DATA = window.AUTOS_DATA;
  const AUTOS = DATA.autos;
  const S = DATA.meta.score;

  /* ---------- estado ---------- */
  const state = {
    q: '',
    origenes: new Set(),
    marcas: new Set(),
    marcasVetadas: new Set(),
    tipos: new Set(),
    carrocerias: new Set(),
    precioMax: null,
    kmlMin: 0,
    largoMax: null,
    maleteroMin: 0,
    verDims: true,
    pesos: { ...S.pesos },
    sortKey: 'score',
    sortDir: -1,         // 1 asc, -1 desc
    seleccion: null,
    bencina: DATA.meta.supuestos.precioBencina93,
    cargadorCasa: DATA.meta.supuestos.cargadorEnCasaDefault,
    kwh: DATA.meta.supuestos.cargadorEnCasaDefault
      ? DATA.meta.supuestos.precioKwhResidencial
      : DATA.meta.supuestos.precioKwhPublico,
    baseCosto: S.baseCostoDefault
  };

  /* ---------- helpers ---------- */
  const clp = n => n == null ? null : '$' + n.toLocaleString('es-CL');
  const num = (n, d = 1) => n == null ? null : n.toLocaleString('es-CL', { minimumFractionDigits: d, maximumFractionDigits: d });
  const nd = '<span class="nd">—</span>';
  // Precio abreviado en millones: la tabla tiene que caber en un celular.
  const clpM = n => n == null ? null : '$' + (n / 1e6).toLocaleString('es-CL', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + 'M';

  /* Carrocería como glifo + tooltip: el nombre completo ocupaba media pantalla.
     La silueta distingue sedán / hatchback / SUV y la letra indica el tamaño. */
  const CARROCERIAS = {
    'Hatchback':                { forma: 'hatch', tam: '',   nombre: 'Hatchback' },
    'Sedán':                    { forma: 'sedan', tam: '',   nombre: 'Sedán' },
    'SUV subcompacto':          { forma: 'suv',   tam: 'XS', nombre: 'SUV subcompacto' },
    'SUV subcompacto premium':  { forma: 'suv',   tam: 'XS', nombre: 'SUV subcompacto premium', premium: true },
    'SUV compacto':             { forma: 'suv',   tam: 'C',  nombre: 'SUV compacto' },
    'SUV compacto premium':     { forma: 'suv',   tam: 'C',  nombre: 'SUV compacto premium', premium: true },
    'SUV mediano':              { forma: 'suv',   tam: 'M',  nombre: 'SUV mediano' },
    'SUV grande':               { forma: 'suv',   tam: 'G',  nombre: 'SUV grande' }
  };
  const SILUETAS = {
    sedan: 'M2 9.3h16V7.9c0-.6-.4-1-1-1.1l-2.5-.4-1.9-1.9c-.3-.3-.7-.5-1.2-.5H7.9c-.5 0-.9.2-1.2.5L5 6.4l-2 .4c-.6.1-1 .5-1 1.1v1.4z',
    hatch: 'M3 9.3h14V7.7c0-.6-.4-1.1-1-1.2l-1.3-.2-2.6-2.4c-.3-.2-.6-.4-1-.4H8c-.5 0-.9.2-1.2.5L4.9 6.3l-1 .2c-.6.1-.9.6-.9 1.2v1.6z',
    suv:   'M2.5 9.3h15V7.2c0-.6-.4-1.1-1-1.2l-1.4-.2-1.8-2.2c-.3-.3-.7-.5-1.2-.5H7.9c-.5 0-.9.2-1.2.5L4.9 5.8l-1.4.2c-.6.1-1 .6-1 1.2v2.1z'
  };
  function iconoCarroceria(nombre) {
    const c = CARROCERIAS[nombre];
    if (!c) return esc(nombre);
    return `<span class="carr" title="${esc(c.nombre)}" aria-label="${esc(c.nombre)}">`
      + `<svg viewBox="0 0 20 12" width="22" height="13" aria-hidden="true">`
      + `<path d="${SILUETAS[c.forma]}" fill="currentColor"/>`
      + `<circle cx="6.2" cy="9.4" r="1.5" fill="currentColor"/><circle cx="13.8" cy="9.4" r="1.5" fill="currentColor"/>`
      + `</svg>`
      + (c.tam ? `<b>${c.tam}</b>` : '')
      + (c.premium ? '<i class="prem" aria-hidden="true">+</i>' : '')
      + '</span>';
  }
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* Costo de energía por 100 km — el criterio de operación del score y también una
     columna de la tabla. Convierte consumo en plata, que es lo único comparable entre
     un híbrido y un eléctrico.

     `base` es 'mixto' o 'ciudad'. Cuando falta la cifra del ciclo pedido se deriva del
     otro con un factor por tecnología: un híbrido full rinde MÁS en ciudad que en mixto
     (regenera en cada frenada), un mild hybrid o un enchufable sin cargar rinden menos. */

  function kmlPara(car, base) {
    const r = car.rend;
    const f = S.factorCiudad[car.tipo] ?? 1;
    if (base === 'ciudad') {
      if (r.ciudad != null) return { valor: r.ciudad, derivado: false, base: r.cicloCiudad || 'homologado' };
      if (r.mixto != null) return { valor: r.mixto * f, derivado: true, base: `derivado del mixto ×${f}` };
    } else {
      if (r.mixto != null) return { valor: r.mixto, derivado: false, base: r.ciclo || 'homologado' };
      if (r.ciudad != null) return { valor: r.ciudad / f, derivado: true, base: `derivado de ciudad ÷${f}` };
    }
    return null;
  }

  function costo100(car, base = state.baseCosto) {
    if (car.tipo === 'EV') {
      if (!car.ev || car.ev.consumoKwh100 == null) return null;
      const f = base === 'ciudad' ? S.factorCiudadEV : 1;
      return car.ev.consumoKwh100 * f * state.kwh;
    }
    const k = kmlPara(car, base);
    if (!k) return null;
    // Un PHEV que no se carga anda casi siempre a bencina: rinde menos que su cifra publicada.
    const penal = (car.tipo === 'PHEV' && !state.cargadorCasa) ? S.factorPhevSinCarga : 1;
    return 100 / (k.valor * penal) * state.bencina;
  }

  /* El precio que se muestra y con el que se puntúa es el más barato publicado por la
     marca (normalmente exige financiamiento propio o bonos). El de lista queda en el tooltip. */
  const precioEfectivo = c => c.precioFinanciado ?? c.precioNuevo;
  const tieneDescuento = c => c.precioFinanciado != null && c.precioFinanciado < c.precioNuevo;

  // Caída porcentual del precio nuevo al usado de referencia.
  function deltaUsado(car) {
    if (car.precioUsado == null || !car.precioNuevo) return null;
    return (car.precioUsado - car.precioNuevo) / car.precioNuevo * 100;
  }

  const serie = (car, clase) => car.historial.filter(h => h.clase === clase).sort((a, b) => a.fecha.localeCompare(b.fecha));

  /* ---------- score ----------
     Cuatro subpuntajes de 0 a 100, ponderados por pesos ajustables. Los rangos se
     calculan sobre TODOS los modelos, no sobre los filtrados, para que el puntaje de
     un auto no cambie según lo que esté viendo en pantalla. */

  const rango = f => {
    const vs = AUTOS.map(f).filter(v => v != null);
    return [Math.min(...vs), Math.max(...vs)];
  };
  const R = { alto: rango(c => c.dim.alto), ejes: rango(c => c.dim.ejes), precio: rango(c => precioEfectivo(c)) };
  const norm = (v, [min, max]) => max === min ? 50 : (v - min) / (max - min) * 100;

  // El rango depende de los precios de bencina/kWh y de la base elegida, todos
  // editables: se recalcula cuando cambian y se memoriza mientras no cambien.
  let memoCosto = null;
  function rangoCosto() {
    const clave = `${state.bencina}/${state.kwh}/${state.baseCosto}`;
    if (!memoCosto || memoCosto.clave !== clave) {
      const vs = AUTOS.map(c => costo100(c)).filter(v => v != null);
      memoCosto = { clave, r: [Math.min(...vs), Math.max(...vs)] };
    }
    return memoCosto.r;
  }

  const subCosto = c => {
    const v = costo100(c);
    return v == null ? null : 100 - norm(v, rangoCosto());
  };

  /* Espacio interior. Sin altura libre al techo publicada, el proxy es la altura de
     CABINA (alto menos despeje al piso) más la distancia entre ejes. Usar el alto pelado
     premia el despeje, que no te sirve de nada para ir sentado: el Yaris Cross mide 1.615
     con 210 de despeje y por dentro es más bajo que un Corolla Cross de 1.620 con 160. */
  const despejeTipico = (() => {
    const v = AUTOS.map(c => c.dim.despeje).filter(x => x != null).sort((a, b) => a - b);
    return v[Math.floor(v.length / 2)];
  })();
  function alturaCabina(c) {
    if (c.dim.alto == null) return null;
    return { valor: c.dim.alto - (c.dim.despeje ?? despejeTipico), derivado: c.dim.despeje == null };
  }
  const R2 = { cabina: (() => {
    const v = AUTOS.map(c => alturaCabina(c)).filter(x => x).map(x => x.valor);
    return [Math.min(...v), Math.max(...v)];
  })() };

  function subEspacio(c) {
    const cab = alturaCabina(c);
    const a = cab == null ? null : norm(cab.valor, R2.cabina);
    const e = c.dim.ejes == null ? null : norm(c.dim.ejes, R.ejes);
    if (a == null && e == null) return null;
    if (a == null) return e;
    if (e == null) return a;
    return 0.60 * a + 0.40 * e;
  }

  // Precio de la versión full equipo: el más barato puntúa 100.
  const subPrecio = c => 100 - norm(precioEfectivo(c), R.precio);

  // Tamaño: cuánto se pasa de la huella del auto de referencia.
  // Igual o más chico = 100. El factor 3 hace que un 10% más grande en largo y ancho
  // a la vez (≈ un Model Y) caiga a ~35 puntos.
  function subTamano(c) {
    const r = S.referencia;
    if (c.dim.largo == null || c.dim.ancho == null) return null;
    const exceso = Math.max(0, (c.dim.largo - r.largo) / r.largo)
                 + Math.max(0, (c.dim.ancho - r.ancho) / r.ancho);
    return Math.max(0, 100 * (1 - exceso * 3));
  }

  const subMarca = c => S.marcaTier[c.marca] ?? 50;

  // Nivel de la versión dentro de su propia gama. Ver meta.score.notaEquipamiento.
  const EQUIP_NOMBRE = { entrada: 'versión de entrada', medio: 'versión intermedia', tope: 'tope de gama', unica: 'versión única' };
  const subEquipamiento = c => S.equipamientoPuntos[c.equipamiento] ?? null;

  // Comparación contra el auto de referencia, para que cada subpuntaje sea interpretable.
  const delta = (v, ref, u = ' mm') => v == null ? '' : (v - ref >= 0 ? '+' : '−') + Math.abs(v - ref) + u;

  const CRITERIOS = [
    {
      key: 'costo', label: 'Costo por 100 km', fn: subCosto,
      pista: c => {
        const v = costo100(c);
        if (v == null) return 'sin dato de consumo';
        const txt = `$${Math.round(v).toLocaleString('es-CL')} / 100 km · ciclo ${state.baseCosto}`;
        if (c.tipo === 'EV') return txt + ` · ${c.ev.consumoKwh100} kWh/100 km a $${state.kwh}/kWh`
          + (state.cargadorCasa ? ' (residencial)' : ' (carga pública)');
        const k = kmlPara(c, state.baseCosto);
        return txt + ` · ${num(k.valor)} km/l ${k.derivado ? '(derivado)' : k.base}`;
      }
    },

    {
      key: 'precio', label: 'Precio', fn: subPrecio,
      pista: c => tieneDescuento(c)
        ? `${clp(precioEfectivo(c))} con financiamiento (lista ${clp(c.precioNuevo)})`
        : `${clp(precioEfectivo(c))}`
    },

    { key: 'marca', label: 'Marca', fn: subMarca, pista: c => `nivel de marca: ${c.marca}` },
    {
      key: 'equipamiento', label: 'Equipamiento', fn: subEquipamiento,
      pista: c => EQUIP_NOMBRE[c.equipamiento] || c.equipamiento
    },

    {
      key: 'espacio', label: 'Espacio interior', fn: subEspacio,
      pista: c => {
        const cab = alturaCabina(c);
        const ref = S.referencia.alto - S.referencia.despeje;
        return (cab ? `cabina ${cab.valor} mm (${delta(cab.valor, ref)}${cab.derivado ? ', despeje estimado' : ''})` : 'sin datos')
          + ` · entre ejes ${delta(c.dim.ejes, S.referencia.ejes)} vs referencia`;
      }
    },

    {
      key: 'tamano', label: 'Tamaño / estacionar', fn: subTamano,
      pista: c => `largo ${delta(c.dim.largo, S.referencia.largo)} · ancho ${delta(c.dim.ancho, S.referencia.ancho)} vs referencia`
    }
  ];

  function desglose(c) {
    return CRITERIOS.map(cr => ({ ...cr, valor: cr.fn(c), peso: state.pesos[cr.key] }));
  }

  function score(c) {
    let suma = 0, pesos = 0;
    for (const d of desglose(c)) {
      if (!d.peso) continue;
      suma += d.peso * (d.valor == null ? 50 : d.valor);  // sin dato = neutral
      pesos += d.peso;
    }
    return pesos ? suma / pesos : null;
  }

  const scoreIncompleto = c => desglose(c).some(d => d.peso && d.valor == null);

  /* ---------- columnas ----------
     `prioridad` controla el responsive: 1 se ve siempre, 2 se oculta bajo 900px y
     3 bajo 640px, para que en el celular quede lo esencial sin scroll horizontal. */
  const COLS = [
    {
      key: 'score', label: 'Score', group: 'base', prioridad: 1,
      val: c => score(c),
      html: c => {
        const v = score(c);
        if (v == null) return nd;
        return `<span class="score-cell${scoreIncompleto(c) ? ' inc' : ''}" style="--w:${Math.round(v)}%"`
          + ` title="${Math.round(v)} de 100${scoreIncompleto(c) ? ' · falta algún dato, ese criterio contó 50' : ''}">`
          + `${Math.round(v)}</span>`;
      }
    },
    {
      key: 'modelo', label: 'Modelo', group: 'base', tipo: 'texto', prioridad: 1,
      val: c => `${c.marca} ${c.modelo}`,
      html: c => `<span class="m-nombre">${esc(c.marca)} ${esc(c.modelo)}</span>`
        + `<span class="m-version">${esc(c.version)}</span>`
    },
    { key: 'marca', label: 'Marca', group: 'base', tipo: 'texto', prioridad: 3, val: c => c.marca, html: c => esc(c.marca) },
    {
      key: 'paisMarca', label: 'Origen', group: 'base', tipo: 'texto', prioridad: 3,
      val: c => c.paisMarca, html: c => esc(c.paisMarca)
    },
    { key: 'tipo', label: 'Tipo', group: 'base', tipo: 'texto', prioridad: 1, html: c => `<span class="tag">${esc(c.tipo)}</span>`, val: c => c.tipo },
    {
      key: 'equipamiento', label: 'Equip.', group: 'base', prioridad: 2,
      val: c => subEquipamiento(c),
      html: c => `<span class="equip equip-${esc(c.equipamiento)}" title="${esc(EQUIP_NOMBRE[c.equipamiento] || '')}">`
        + { entrada: '○○●', medio: '○●●', tope: '●●●', unica: '—●—' }[c.equipamiento] + '</span>'
    },
    {
      key: 'carroceria', label: 'Carr.', group: 'base', tipo: 'texto', prioridad: 2,
      val: c => c.carroceria, html: c => iconoCarroceria(c.carroceria)
    },
    {
      key: 'precioNuevo', label: 'Precio', unidad: 'nuevo', group: 'base', prioridad: 1,
      val: c => precioEfectivo(c),
      html: c => {
        const tip = tieneDescuento(c)
          ? `${clp(precioEfectivo(c))} con financiamiento · lista ${clp(c.precioNuevo)}`
          : `${clp(precioEfectivo(c))} · sin otro precio publicado`;
        return `<span title="${tip}">${clpM(precioEfectivo(c))}`
          + (tieneDescuento(c) ? '<i class="fin" aria-hidden="true">f</i>' : '') + '</span>';
      }
    },
    {
      key: 'precioUsado', label: 'Usado', unidad: 'ref.', group: 'base', prioridad: 2,
      val: c => c.precioUsado,
      html: c => c.precioUsado == null ? nd
        : `<span title="${clp(c.precioUsado)}${c.precioUsadoEstimado ? ' (estimado)' : ''}">`
          + (c.precioUsadoEstimado ? '<span class="est">~</span>' : '') + clpM(c.precioUsado) + '</span>'
    },
    {
      key: 'delta', label: 'Δ', unidad: '%', group: 'base', prioridad: 3,
      val: c => deltaUsado(c),
      html: c => { const d = deltaUsado(c); return d == null ? nd : num(d, 0) + '%'; }
    },
    {
      key: 'kmlCiudad', label: 'km/l', unidad: 'ciudad', group: 'base', prioridad: 3,
      val: c => { const k = c.tipo === 'EV' ? null : kmlPara(c, 'ciudad'); return k ? k.valor : null; },
      html: c => {
        const k = c.tipo === 'EV' ? null : kmlPara(c, 'ciudad');
        if (!k) return nd;
        if (k.derivado) return `<span class="est" title="${esc(k.base)}">${num(k.valor)}</span>`;
        return `<span title="${esc(k.base)}">${num(k.valor)}</span>`
          + (k.valor > 30 ? '<span class="warn-mark" title="Homologación chilena, muy optimista frente a WLTP">*</span>' : '');
      }
    },
    {
      key: 'kmlMixto', label: 'km/l', unidad: 'mixto', group: 'base', prioridad: 2,
      val: c => c.rend.mixto,
      html: c => c.rend.mixto == null ? nd
        : `<span title="ciclo ${esc(c.rend.ciclo || '?')}">${num(c.rend.mixto)}</span>`
    },
    {
      key: 'costo100', label: 'Costo', unidad: () => `$/100km`, group: 'base', prioridad: 1,
      val: c => costo100(c),
      html: c => {
        const v = costo100(c);
        if (v == null) return nd;
        const k = c.tipo === 'EV' ? null : kmlPara(c, state.baseCosto);
        const tarifa = c.tipo === 'EV'
          ? ` · kWh a $${state.kwh} (${state.cargadorCasa ? 'residencial' : 'carga pública'})`
          : (c.tipo === 'PHEV' && !state.cargadorCasa ? ' · penalizado por no cargarlo en casa' : '');
        return `<span title="ciclo ${state.baseCosto}${tarifa}">`
          + (k && k.derivado ? '<span class="est">~</span>' : '')
          + '$' + Math.round(v).toLocaleString('es-CL') + '</span>';
      }
    },
    {
      key: 'autonomia', label: 'Auton.', unidad: 'km', group: 'base', prioridad: 3,
      val: c => c.ev ? c.ev.autonomiaKm : null,
      html: c => c.ev ? num(c.ev.autonomiaKm, 0) : nd
    },
    {
      key: 'maletero', label: 'Malet.', unidad: 'L', group: 'base', prioridad: 2, val: c => c.dim.maletero,
      html: c => c.dim.maletero == null ? nd : num(c.dim.maletero, 0)
    },
    { key: 'potencia', label: 'HP', group: 'base', prioridad: 3, val: c => c.potencia, html: c => num(c.potencia, 0) },
    {
      key: 'largo', label: 'Largo', unidad: 'mm', group: 'dim', prioridad: 2, val: c => c.dim.largo,
      html: c => c.dim.largo == null ? nd
        : num(c.dim.largo, 0) + (c.dimsPorConfirmar ? '<span class="warn-mark" title="Dimensiones por confirmar en ficha local">?</span>' : '')
    },
    { key: 'ancho', label: 'Ancho', unidad: 'mm', group: 'dim', prioridad: 2, val: c => c.dim.ancho, html: c => num(c.dim.ancho, 0) },
    { key: 'alto', label: 'Alto', unidad: 'mm', group: 'dim', prioridad: 3, val: c => c.dim.alto, html: c => num(c.dim.alto, 0) },
    { key: 'ejes', label: 'Ejes', unidad: 'mm', group: 'dim', prioridad: 3, val: c => c.dim.ejes, html: c => num(c.dim.ejes, 0) },
    {
      key: 'despeje', label: 'Desp.', unidad: 'mm', group: 'dim', prioridad: 3, val: c => c.dim.despeje,
      html: c => c.dim.despeje == null ? nd : num(c.dim.despeje, 0)
    },
    {
      key: 'historial', label: 'Hist.', group: 'base', tipo: 'nosort', prioridad: 3,
      val: c => serie(c, 'nuevo').length,
      html: c => sparkline(c)
    }
  ];

  const colsVisibles = () => COLS.filter(c => c.group !== 'dim' || state.verDims);

  /* ---------- sparkline ---------- */
  function sparkline(car) {
    const pts = serie(car, 'nuevo');
    if (pts.length < 2) return '<span class="nd" title="Un solo dato de precio hasta ahora">·</span>';
    const w = 54, h = 16, pad = 2;
    const vals = pts.map(p => p.precio);
    const min = Math.min(...vals), max = Math.max(...vals);
    const span = max - min || 1;
    const d = pts.map((p, i) => {
      const x = pad + i * (w - pad * 2) / (pts.length - 1);
      const y = h - pad - (p.precio - min) / span * (h - pad * 2);
      return `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(' ');
    const subio = vals[vals.length - 1] >= vals[0];
    return `<svg class="spark" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" aria-hidden="true">
      <path d="${d}" fill="none" stroke="${subio ? 'var(--warn)' : 'var(--accent)'}" stroke-width="1.5"/>
    </svg>`;
  }

  /* ---------- filtrado + orden ---------- */
  /* Filtrado con exclusión de una faceta.
     En búsqueda por facetas los contadores de un grupo se calculan aplicando TODOS
     los filtros menos el de ese propio grupo. Si no, al elegir "Toyota" el resto de
     las marcas marcaría 0 y no podrías cambiar de opinión sin limpiar. */
  function pasa(c, excepto) {
    if (state.marcasVetadas.has(c.marca)) return false;
    if (excepto !== 'origen' && state.origenes.size && !state.origenes.has(c.paisMarca)) return false;
    if (excepto !== 'marca' && state.marcas.size && !state.marcas.has(c.marca)) return false;
    if (excepto !== 'tipo' && state.tipos.size && !state.tipos.has(c.tipo)) return false;
    if (excepto !== 'carroceria' && state.carrocerias.size && !state.carrocerias.has(c.carroceria)) return false;
    if (state.precioMax != null && precioEfectivo(c) > state.precioMax) return false;
    if (state.largoMax != null && c.dim.largo > state.largoMax) return false;
    if (state.maleteroMin > 0 && (c.dim.maletero ?? 0) < state.maleteroMin) return false;
    if (state.kmlMin > 0 && (c.rend.mixto ?? -1) < state.kmlMin) return false;
    const q = state.q.trim().toLowerCase();
    if (q) {
      const heno = `${c.marca} ${c.modelo} ${c.version} ${c.tipo} ${c.carroceria} ${c.notas || ''}`.toLowerCase();
      if (!heno.includes(q)) return false;
    }
    return true;
  }

  // Cuántos autos quedarían si además se marcara este valor del grupo.
  function contarFaceta(grupo, campo, valor) {
    return AUTOS.filter(c => c[campo] === valor && pasa(c, grupo)).length;
  }

  const filtrar = () => AUTOS.filter(c => pasa(c, null));

  function ordenar(lista) {
    const col = COLS.find(c => c.key === state.sortKey) || COLS[0];
    return lista.slice().sort((a, b) => {
      const va = col.val(a), vb = col.val(b);
      // los sin dato siempre al final, en cualquier dirección
      if (va == null && vb == null) return 0;
      if (va == null) return 1;
      if (vb == null) return -1;
      const cmp = (col.tipo === 'texto') ? String(va).localeCompare(String(vb), 'es') : va - vb;
      return cmp * state.sortDir;
    });
  }

  /* ---------- render tabla ---------- */
  function renderHead() {
    document.getElementById('thead-row').innerHTML = colsVisibles().map(c => {
      const activa = state.sortKey === c.key;
      const dir = activa ? `<span class="dir">${state.sortDir === 1 ? '▲' : '▼'}</span>` : '';
      const sortable = c.tipo !== 'nosort';
      const unidad = typeof c.unidad === 'function' ? c.unidad() : c.unidad;
      const interior = `${esc(c.label)}${dir}${unidad ? `<span class="u">${esc(unidad)}</span>` : ''}`;
      // los ordenables van dentro de un <button> para poder usarlos con teclado
      const contenido = sortable
        ? `<button type="button" class="th-btn" data-key="${c.key}"
             aria-label="Ordenar por ${esc(c.label)}${activa ? (state.sortDir === 1 ? ', ascendente' : ', descendente') : ''}">${interior}</button>`
        : interior;
      return `<th data-key="${c.key}" class="p${c.prioridad || 1}" ${sortable ? '' : 'data-nosort="1"'}
        scope="col" ${activa ? `aria-sort="${state.sortDir === 1 ? 'ascending' : 'descending'}"` : ''}>${contenido}</th>`;
    }).join('');
  }

  function renderBody() {
    const lista = ordenar(filtrar());
    const cols = colsVisibles();
    document.getElementById('tbody').innerHTML = lista.map(c =>
      `<tr data-id="${c.id}" class="${state.seleccion === c.id ? 'sel' : ''}">`
      + cols.map(col => `<td class="p${col.prioridad || 1}">${col.html(c) ?? nd}</td>`).join('')
      + '</tr>'
    ).join('');
    document.getElementById('vacio').hidden = lista.length > 0;
    document.getElementById('meta-count').textContent =
      `${lista.length} de ${AUTOS.length} modelos`;
    pintarFacetas();
    pintarResumen(lista.length);
  }

  /* ---------- gráfico de precios ---------- */
  function chartPrecios(car) {
    const nuevos = serie(car, 'nuevo'), usados = serie(car, 'usado');
    const todos = [...nuevos, ...usados];
    if (todos.length < 2) {
      return `<p class="sin-hist">Solo hay ${todos.length} dato${todos.length === 1 ? '' : 's'} de precio registrado${todos.length === 1 ? '' : 's'}
        (${todos.map(p => p.fecha).join(', ') || 'ninguno'}). Corre <code>node scripts/add-snapshot.mjs</code> cada tanto y esta serie va a crecer sola.</p>`;
    }
    const W = 420, H = 150, m = { t: 12, r: 12, b: 22, l: 62 };
    const fechas = todos.map(p => +new Date(p.fecha));
    const precios = todos.map(p => p.precio);
    const x0 = Math.min(...fechas), x1 = Math.max(...fechas);
    const y0 = Math.min(...precios) * 0.97, y1 = Math.max(...precios) * 1.03;
    const px = t => m.l + (x1 === x0 ? 0 : (t - x0) / (x1 - x0)) * (W - m.l - m.r);
    const py = v => H - m.b - (v - y0) / (y1 - y0 || 1) * (H - m.t - m.b);

    const linea = (pts, color) => {
      if (!pts.length) return '';
      const d = pts.map((p, i) => `${i ? 'L' : 'M'}${px(+new Date(p.fecha)).toFixed(1)} ${py(p.precio).toFixed(1)}`).join(' ');
      const dots = pts.map(p =>
        `<circle cx="${px(+new Date(p.fecha)).toFixed(1)}" cy="${py(p.precio).toFixed(1)}" r="3" fill="${color}">
           <title>${p.fecha} · ${clp(p.precio)} · ${esc(p.fuente)}</title></circle>`).join('');
      return `<path d="${d}" fill="none" stroke="${color}" stroke-width="2"/>${dots}`;
    };

    const fmtCorto = v => '$' + (v / 1e6).toFixed(1) + 'M';
    return `<svg viewBox="0 0 ${W} ${H}" width="100%" style="max-width:${W}px" role="img" aria-label="Historial de precios">
      <line x1="${m.l}" y1="${H - m.b}" x2="${W - m.r}" y2="${H - m.b}" stroke="var(--border-strong)"/>
      <line x1="${m.l}" y1="${m.t}" x2="${m.l}" y2="${H - m.b}" stroke="var(--border-strong)"/>
      <text x="${m.l - 6}" y="${py(y1) + 4}" text-anchor="end" font-size="10" fill="var(--text-dim)">${fmtCorto(y1)}</text>
      <text x="${m.l - 6}" y="${py(y0) + 4}" text-anchor="end" font-size="10" fill="var(--text-dim)">${fmtCorto(y0)}</text>
      <text x="${m.l}" y="${H - 6}" font-size="10" fill="var(--text-dim)">${todos[0].fecha}</text>
      <text x="${W - m.r}" y="${H - 6}" font-size="10" fill="var(--text-dim)" text-anchor="end">${new Date(x1).toISOString().slice(0, 10)}</text>
      ${linea(nuevos, 'var(--nuevo)')}
      ${linea(usados, 'var(--usado)')}
    </svg>
    <div class="chart-leyenda">
      <span><i style="background:var(--nuevo)"></i>precio lista</span>
      <span><i style="background:var(--usado)"></i>usado observado</span>
    </div>`;
  }

  /* ---------- panel de detalle ---------- */
  function renderDetalle() {
    const el = document.getElementById('detalle');
    if (!state.seleccion) { el.hidden = true; el.innerHTML = ''; return; }
    const c = AUTOS.find(a => a.id === state.seleccion);
    const d = c.dim;
    // Varias fichas chilenas están incompletas (p. ej. el Suzuki Across): todo campo
    // ausente se muestra como "—" en vez de propagar un null a la vista.
    const mm = v => v == null ? '—' : v + ' mm';
    const dimsTexto = [d.largo, d.ancho, d.alto].every(v => v != null)
      ? `${d.largo} × ${d.ancho} × ${d.alto} mm`
      : [d.largo, d.ancho, d.alto].map(v => v == null ? '?' : v).join(' × ') + ' mm';

    const specs = [
      ['Precio nuevo', clp(precioEfectivo(c)) + (tieneDescuento(c) ? ' (con financiamiento)' : '')],
      ['Precio de lista', tieneDescuento(c) ? clp(c.precioNuevo) : '—'],
      ['Precio usado ref.', c.precioUsado == null ? '—' : (c.precioUsadoEstimado ? '~' : '') + clp(c.precioUsado)],
      ['Largo × ancho × alto', dimsTexto],
      ['Distancia entre ejes', mm(d.ejes)],
      ['Maletero', d.maletero ? d.maletero + ' L' + (d.maleteroMax ? ` (${d.maleteroMax} L abatido)` : '')
        : (d.maleteroMax ? `hasta ${d.maleteroMax} L` : '—')],
      ['Despeje al piso', mm(d.despeje)],
      ['Altura de cabina', (() => { const k = alturaCabina(c); return k ? mm(k.valor) + (k.derivado ? ' (despeje estimado)' : '') : '—'; })()],
      ['Potencia / torque', c.potencia == null ? '—' : `${c.potencia} HP · ${c.torque ?? '?'} Nm`],
      ['Transmisión / tracción', `${c.transmision} · ${c.traccion}`],
      ['Rendimiento ciudad', (() => {
        if (c.tipo === 'EV') return '—';
        const k = kmlPara(c, 'ciudad');
        return k ? `${num(k.valor)} km/l (${k.base})` : '—';
      })()],
      ['Rendimiento carretera', c.rend.carretera ? num(c.rend.carretera) + ' km/l' : '—'],
      ['Rendimiento mixto', c.rend.mixto ? num(c.rend.mixto) + ' km/l (' + (c.rend.ciclo || '?') + ')' : '—'],
      [`Costo por 100 km (${state.baseCosto})`, costo100(c) ? '$' + Math.round(costo100(c)).toLocaleString('es-CL') : '—'],
      ['Batería / autonomía', c.ev ? `${c.ev.bateriaKwh} kWh · ${c.ev.autonomiaKm} km` : '—'],
      ['Equipamiento', EQUIP_NOMBRE[c.equipamiento] || '—'],
      ['Origen', c.origen]
    ];

    el.hidden = false;
    el.innerHTML = `
      <button class="d-cerrar" type="button" id="d-cerrar">Cerrar</button>
      <h2>${esc(c.marca)} ${esc(c.modelo)} <span style="font-weight:400;color:var(--text-dim)">${esc(c.version)}</span></h2>
      <p class="d-sub">${esc(c.tipo)} · ${esc(c.carroceria)} · ${c.anio}</p>
      <div class="d-grid">
        <div>
          ${c.notas ? `<p class="d-nota">${esc(c.notas)}</p>` : ''}
          ${c.precioNuevoNota ? `<p class="d-nota" style="color:var(--text-dim)"><strong>Precio nuevo:</strong> ${esc(c.precioNuevoNota)}</p>` : ''}
          ${c.precioUsadoNota ? `<p class="d-nota" style="color:var(--text-dim)"><strong>Precio usado:</strong> ${esc(c.precioUsadoNota)}</p>` : ''}
          <ul class="d-fuentes">${c.fuentes.map(f => `<li>→ <a href="${esc(f.url)}" target="_blank" rel="noopener">${esc(f.titulo)}</a></li>`).join('')}</ul>
        </div>
        <div>
          <ul class="d-specs">${specs.map(([k, v]) => `<li><span>${esc(k)}</span><span>${v}</span></li>`).join('')}</ul>
        </div>
        <div>
          <h3 class="d-h3">Score ${Math.round(score(c))}/100</h3>
          <ul class="d-desglose">
            ${desglose(c).map(d => `
              <li class="${d.peso ? '' : 'apagado'}">
                <span class="dg-label">${esc(d.label)}<em>${esc(d.pista ? d.pista(c) : '')}</em></span>
                <span class="dg-bar"><i style="width:${d.valor == null ? 50 : Math.round(d.valor)}%"></i></span>
                <span class="dg-val">${d.valor == null ? '<span class="warn-mark" title="Sin dato: se cuenta como 50 neutro">50*</span>' : Math.round(d.valor)}</span>
                <span class="dg-peso">×${d.peso}</span>
              </li>`).join('')}
          </ul>
          <h3 class="d-h3">Historial de precios</h3>
          ${chartPrecios(c)}
        </div>
      </div>`;
    document.getElementById('d-cerrar').onclick = () => seleccionar(null);
  }

  // Selecciona un modelo y mantiene el hash de la URL en sincronía.
  function seleccionar(id, desdeHash = false) {
    state.seleccion = (id && AUTOS.some(a => a.id === id)) ? id : null;
    if (!desdeHash) {
      const nuevo = state.seleccion ? '#' + state.seleccion : ' ';
      history.replaceState(null, '', location.pathname + location.search + (state.seleccion ? nuevo : ''));
    }
    renderBody();
    renderDetalle();
  }

  /* ---------- precio de bencina por ubicación ----------
     Pide la posición al navegador, resuelve la comuna con Nominatim y trae los precios
     reales de 93 octanos de esa comuna desde bencinaenlinea.cl (CNE). Todo ocurre en el
     navegador: no hay servidor propio y la ubicación no se guarda ni se envía a otra parte.
     Si algo falla se queda el default (Shell Carlos Antúnez 2490, Providencia). */
  const B = DATA.meta.bencina;

  const normalizar = t => (t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

  function estadoGeo(txt, error = false) {
    const el = document.getElementById('geo-estado');
    el.textContent = txt;
    el.classList.toggle('error', error);
  }

  const posicion = () => new Promise((ok, no) => {
    if (!navigator.geolocation) return no(new Error('Tu navegador no expone geolocalización'));
    navigator.geolocation.getCurrentPosition(
      p => ok(p.coords),
      e => no(new Error(e.code === 1 ? 'Permiso de ubicación denegado' : 'No se pudo obtener la ubicación')),
      { timeout: 15000, maximumAge: 600000 }
    );
  });

  async function comunaDe(lat, lon) {
    const u = `${B.geocoder}?format=jsonv2&zoom=10&lat=${lat}&lon=${lon}`;
    const r = await fetch(u, { headers: { Accept: 'application/json' } });
    if (!r.ok) throw new Error('No se pudo resolver la comuna');
    const a = (await r.json()).address || {};
    return a.city_district || a.town || a.municipality || a.city || a.county;
  }

  async function preciosDeComuna(comuna) {
    const r = await fetch(B.api);
    if (!r.ok) throw new Error('bencinaenlinea.cl no respondió');
    const todos = (await r.json()).data || [];
    const objetivo = normalizar(comuna);
    return todos.filter(e => normalizar(e.comuna_nombre) === objetivo && !e.en_mantencion)
                .map(e => ({ precio: Math.round(parseFloat(e.combustible_precio)), marca: e.marca_nombre, dir: e.estacion_direccion }))
                .filter(e => Number.isFinite(e.precio))
                .sort((a, b) => a.precio - b.precio);
  }

  async function actualizarBencina() {
    const btn = document.getElementById('btn-geo');
    btn.disabled = true;
    try {
      estadoGeo('pidiendo ubicación…');
      const { latitude, longitude } = await posicion();
      estadoGeo('buscando tu comuna…');
      const comuna = await comunaDe(latitude, longitude);
      if (!comuna) throw new Error('No pude identificar la comuna');
      estadoGeo(`consultando precios en ${comuna}…`);
      const est = await preciosDeComuna(comuna);
      if (!est.length) throw new Error(`Sin estaciones con 93 en ${comuna}`);
      // la mediana representa mejor lo que pagas que la más barata de la comuna
      const mediana = est[Math.floor(est.length / 2)].precio;
      state.bencina = mediana;
      const inp = document.getElementById('s-bencina');
      inp.value = mediana;
      estadoGeo(`${comuna}: mediana $${mediana}/L · ${est.length} estaciones, de $${est[0].precio} a $${est[est.length - 1].precio}`);
      renderHead(); renderBody(); renderDetalle();
    } catch (e) {
      estadoGeo(`${e.message}. Queda el default: $${B.precioDefault}/L (${B.estacionDefault}).`, true);
    } finally {
      btn.disabled = false;
    }
  }

  /* ---------- pesos del score ---------- */
  function renderPesos() {
    document.getElementById('pesos').innerHTML = CRITERIOS.map(cr => `
      <label class="peso">
        <span>${esc(cr.label)}</span>
        <input type="range" min="0" max="50" step="5" value="${state.pesos[cr.key]}" data-k="${cr.key}"
               aria-valuetext="peso ${state.pesos[cr.key]} de 50">
        <output>${state.pesos[cr.key]}</output>
      </label>`).join('');
  }

  function initPesos() {
    renderPesos();
    document.getElementById('pesos').addEventListener('input', e => {
      const inp = e.target.closest('input[type=range]');
      if (!inp) return;
      state.pesos[inp.dataset.k] = +inp.value;
      inp.nextElementSibling.textContent = inp.value;
      inp.setAttribute('aria-valuetext', `peso ${inp.value} de 50`);
      renderBody();
      renderDetalle();
    });
    document.getElementById('reset-pesos').addEventListener('click', () => {
      state.pesos = { ...S.pesos };
      renderPesos(); renderBody(); renderDetalle();
    });
  }

  /* ---------- filtros aplicados ----------
     Barra con cada filtro activo como ficha removible, igual que en Amazon o
     MercadoLibre: siempre se ve qué está acotando el resultado y se quita de a uno. */
  function filtrosActivos() {
    const f = [];
    if (state.q.trim()) f.push({ t: `“${state.q.trim()}”`, quitar: () => { state.q = ''; document.getElementById('q').value = ''; } });
    for (const [set, etq] of [[state.origenes, 'Origen'], [state.marcas, 'Marca'], [state.tipos, 'Tipo'], [state.carrocerias, 'Carrocería']])
      for (const v of set) f.push({ t: `${etq}: ${v}`, quitar: () => set.delete(v) });
    for (const v of state.marcasVetadas) f.push({ t: `Sin ${v}`, veto: true, quitar: () => state.marcasVetadas.delete(v) });
    const rango = (id, key, activo, texto) => {
      const inp = document.getElementById(id);
      if (activo) f.push({ t: texto, quitar: () => { inp.value = inp.dataset.reset; inp.dispatchEvent(new Event('input')); } });
    };
    rango('r-precio', 'precioMax', state.precioMax < +document.getElementById('r-precio').max, `Hasta ${clpM(state.precioMax)}`);
    rango('r-kml', 'kmlMin', state.kmlMin > 0, `Desde ${num(state.kmlMin)} km/l`);
    rango('r-largo', 'largoMax', state.largoMax < +document.getElementById('r-largo').max, `Largo ≤ ${state.largoMax} mm`);
    rango('r-maletero', 'maleteroMin', state.maleteroMin > 0, `Maletero ≥ ${state.maleteroMin} L`);
    return f;
  }

  let ACTIVOS = [];
  function pintarResumen(n) {
    ACTIVOS = filtrosActivos();
    const cont = document.getElementById('aplicados');
    cont.innerHTML = ACTIVOS.length
      ? `<span class="ap-label">Filtros aplicados</span>`
        + ACTIVOS.map((f, i) => `<button type="button" class="ap-chip${f.veto ? ' ap-veto' : ''}" data-i="${i}"`
            + ` aria-label="Quitar filtro ${esc(f.t)}">${esc(f.t)}<span aria-hidden="true">×</span></button>`).join('')
        + `<button type="button" class="ap-limpiar" id="ap-limpiar">Limpiar todo</button>`
      : '';
    cont.hidden = ACTIVOS.length === 0;
    document.querySelectorAll('.conteo-resultados').forEach(e => {
      e.textContent = n === AUTOS.length ? `${n} autos` : `${n} de ${AUTOS.length} autos`;
    });
    const badge = document.getElementById('badge-filtros');
    if (badge) { badge.textContent = ACTIVOS.length || ''; badge.hidden = ACTIVOS.length === 0; }
  }

  /* ---------- chips ---------- */
  let GRUPOS = [];
  const pintarFacetas = () => GRUPOS.forEach(([id, vals, set, vetadas, grupo, campo]) =>
    pintarChips(id, vals, set, vetadas, grupo, campo));
  function pintarChips(contId, valores, set, vetadas, grupo, campo) {
    document.getElementById(contId).innerHTML = valores.map(v => {
      const veto = vetadas && vetadas.has(v);
      const on = set.has(v);
      const n = contarFaceta(grupo, campo, v);
      const vacio = n === 0 && !on && !veto;
      const titulo = veto ? 'Descartada: no aparece en la tabla'
        : vacio ? 'Ninguna opción con los filtros actuales'
        : (vetadas ? 'Clic para filtrar · otro clic para descartarla' : `${n} con los filtros actuales`);
      const etiqueta = veto ? `${v}, descartada`
        : `${v}, ${n} ${n === 1 ? 'resultado' : 'resultados'}${on ? ', filtrando' : ''}`;
      return `<button type="button" class="chip${veto ? ' chip-veto' : ''}${vacio ? ' chip-vacio' : ''}"`
        + ` data-v="${esc(v)}" aria-pressed="${on}" aria-label="${esc(etiqueta)}"`
        + `${vacio ? ' disabled' : ''} title="${esc(titulo)}">`
        + `${esc(v)}<span class="cuenta">${n}</span></button>`;
    }).join('');
  }

  function initChips() {
    const uniq = f => [...new Set(AUTOS.map(f))].sort((a, b) => a.localeCompare(b, 'es'));
    /* El grupo de marcas es de tres estados: neutro -> filtrar -> descartar.
       Un peso alto no alcanza para expresar "esta marca no la compro ni gratis";
       el veto la saca de la tabla sin importar cuánto puntúe. */
    GRUPOS = [
      ['chips-origen', uniq(c => c.paisMarca), state.origenes, null, 'origen', 'paisMarca'],
      ['chips-marca', uniq(c => c.marca), state.marcas, state.marcasVetadas, 'marca', 'marca'],
      ['chips-tipo', uniq(c => c.tipo), state.tipos, null, 'tipo', 'tipo'],
      ['chips-carroceria', uniq(c => c.carroceria), state.carrocerias, null, 'carroceria', 'carroceria']
    ];
    GRUPOS.forEach(g => {
      const [id, vals, set, vetadas] = g;
      document.getElementById(id).addEventListener('click', e => {
        const b = e.target.closest('.chip');
        if (!b || b.disabled) return;
        const v = b.dataset.v;
        if (vetadas) {
          if (vetadas.has(v)) vetadas.delete(v);                   // descartada -> neutro
          else if (set.has(v)) { set.delete(v); vetadas.add(v); }  // filtrada -> descartada
          else set.add(v);                                         // neutro -> filtrada
        } else {
          set.has(v) ? set.delete(v) : set.add(v);
        }
        renderBody();   // repinta las cuatro facetas: los contadores dependen entre sí
      });
    });
    pintarFacetas();
  }

  /* ---------- rangos ---------- */
  function initRangos() {
    const precios = AUTOS.map(precioEfectivo);
    const largos = AUTOS.map(c => c.dim.largo);
    const maleteros = AUTOS.map(c => c.dim.maletero || 0);

    const rp = document.getElementById('r-precio');
    rp.min = Math.floor(Math.min(...precios) / 1e6) * 1e6;
    rp.max = Math.ceil(Math.max(...precios) / 1e6) * 1e6;
    rp.value = rp.max;
    state.precioMax = +rp.max;

    // El tope se redondea hacia arriba al paso del slider; si no, el valor máximo
    // real (p. ej. 4.815 mm) no es alcanzable y el auto más grande queda filtrado.
    const rl = document.getElementById('r-largo');
    rl.min = Math.floor(Math.min(...largos) / 10) * 10;
    rl.max = Math.ceil(Math.max(...largos) / 10) * 10;
    rl.value = rl.max;
    state.largoMax = +rl.max;

    document.getElementById('r-maletero').max = Math.ceil(Math.max(...maleteros) / 10) * 10;
    document.getElementById('r-kml').max = Math.ceil(Math.max(...AUTOS.map(c => c.rend.mixto || 0)));

    const bind = (id, outId, key, fmt) => {
      const inp = document.getElementById(id), out = document.getElementById(outId);
      const upd = () => {
        state[key] = +inp.value;
        const texto = fmt(+inp.value, inp);
        out.textContent = texto;
        // sin esto un lector de pantalla lee "15000000" en vez de "hasta $15.000.000"
        inp.setAttribute('aria-valuetext', texto);
        renderBody();
      };
      inp.dataset.reset = inp.value;
      inp.addEventListener('input', upd);
      upd();
    };
    bind('r-precio', 'o-precio', 'precioMax', v => v >= +document.getElementById('r-precio').max ? 'sin tope' : 'hasta ' + clp(v));
    bind('r-kml', 'o-kml', 'kmlMin', v => v === 0 ? 'sin mínimo' : 'desde ' + num(v) + ' km/l');
    bind('r-largo', 'o-largo', 'largoMax', v => v >= +document.getElementById('r-largo').max ? 'sin tope' : 'hasta ' + v + ' mm');
    bind('r-maletero', 'o-maletero', 'maleteroMin', v => v === 0 ? 'sin mínimo' : 'desde ' + v + ' L');
  }

  /* ---------- eventos ---------- */
  function initEventos() {
    document.getElementById('q').addEventListener('input', e => { state.q = e.target.value; renderBody(); });

    document.getElementById('aplicados').addEventListener('click', e => {
      const b = e.target.closest('.ap-chip');
      if (b) { ACTIVOS[+b.dataset.i].quitar(); renderBody(); return; }
      if (e.target.closest('#ap-limpiar')) document.getElementById('reset').click();
    });

    /* Panel de filtros en móvil: <dialog> nativo, que ya trae foco atrapado,
       cierre con Esc y fondo inerte. La sección de filtros se mueve dentro y
       vuelve a su lugar al pasar a escritorio. */
    const dlg = document.getElementById('dlg-filtros');
    const filtros = document.querySelector('.filtros');
    const ancla = document.getElementById('ancla-filtros');
    const mq = matchMedia('(max-width: 640px)');
    const acomodar = () => {
      if (mq.matches) document.getElementById('slot-filtros').appendChild(filtros);
      else { ancla.after(filtros); if (dlg.open) dlg.close(); }
    };
    mq.addEventListener('change', acomodar);
    acomodar();

    document.getElementById('btn-filtros').addEventListener('click', () => dlg.showModal());
    document.getElementById('cerrar-filtros').addEventListener('click', () => dlg.close());
    document.getElementById('aplicar-filtros').addEventListener('click', () => dlg.close());
    document.getElementById('limpiar-movil').addEventListener('click', () => document.getElementById('reset').click());

    document.getElementById('thead-row').addEventListener('click', e => {
      const th = e.target.closest('th');
      if (!th || th.dataset.nosort) return;
      const k = th.dataset.key;
      if (state.sortKey === k) state.sortDir *= -1;
      else { state.sortKey = k; state.sortDir = (COLS.find(c => c.key === k).tipo === 'texto') ? 1 : 1; }
      renderHead(); renderBody();
    });

    document.getElementById('tbody').addEventListener('click', e => {
      const tr = e.target.closest('tr');
      if (!tr) return;
      seleccionar(state.seleccion === tr.dataset.id ? null : tr.dataset.id);
      if (state.seleccion) document.getElementById('detalle').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });

    // #id en la URL abre ese modelo directo — sirve para compartir un link a un auto.
    window.addEventListener('hashchange', () => seleccionar(location.hash.slice(1) || null, true));

    document.getElementById('t-dims').addEventListener('change', e => {
      state.verDims = e.target.checked; renderHead(); renderBody();
    });

    const sb = document.getElementById('s-bencina'), sk = document.getElementById('s-kwh');
    sb.value = state.bencina; sk.value = state.kwh;
    sb.addEventListener('input', () => { state.bencina = +sb.value || 0; renderBody(); renderDetalle(); });
    sk.addEventListener('input', () => { state.kwh = +sk.value || 0; renderBody(); renderDetalle(); });

    document.getElementById('btn-geo').addEventListener('click', actualizarBencina);

    /* Sin cargador en casa el kWh sale a tarifa de red pública (~2x la residencial),
       que es lo que de verdad castiga a los eléctricos. */
    const scasa = document.getElementById('t-casa');
    scasa.checked = state.cargadorCasa;
    const pintarKwh = () => {
      document.getElementById('lbl-kwh').textContent = state.cargadorCasa ? 'residencial' : 'carga pública';
    };
    scasa.addEventListener('change', () => {
      state.cargadorCasa = scasa.checked;
      state.kwh = state.cargadorCasa
        ? DATA.meta.supuestos.precioKwhResidencial
        : DATA.meta.supuestos.precioKwhPublico;
      sk.value = state.kwh;
      pintarKwh();
      renderHead(); renderBody(); renderDetalle();
    });
    pintarKwh();

    const sbase = document.getElementById('s-base');
    sbase.value = state.baseCosto;
    sbase.addEventListener('change', () => {
      state.baseCosto = sbase.value;
      renderHead(); renderBody(); renderDetalle();   // el encabezado muestra la base
    });

    document.getElementById('reset').addEventListener('click', () => {
      state.q = ''; document.getElementById('q').value = '';
      state.origenes.clear(); state.marcas.clear(); state.marcasVetadas.clear();
      state.tipos.clear(); state.carrocerias.clear();
      ['r-precio', 'r-largo'].forEach(id => { const i = document.getElementById(id); i.value = i.max; i.dispatchEvent(new Event('input')); });
      ['r-kml', 'r-maletero'].forEach(id => { const i = document.getElementById(id); i.value = i.min; i.dispatchEvent(new Event('input')); });
      renderBody();
    });
  }

  /* ---------- tema ----------
     Por defecto sigue al sistema operativo. La elección se guarda en el navegador. */
  function initTema() {
    const sel = document.getElementById('s-tema');
    const guardado = localStorage.getItem('tema') || 'sistema';
    const aplicar = v => {
      if (v === 'sistema') delete document.documentElement.dataset.theme;
      else document.documentElement.dataset.theme = v;
    };
    sel.value = guardado;
    aplicar(guardado);
    sel.addEventListener('change', () => {
      localStorage.setItem('tema', sel.value);
      aplicar(sel.value);
    });
  }

  document.getElementById('meta-fecha').textContent = 'datos al ' + DATA.meta.actualizado;
  document.getElementById('meta-fecha').textContent = 'datos al ' + DATA.meta.actualizado;
  document.getElementById('nota-rendimiento').textContent = DATA.meta.notaRendimiento;
  document.getElementById('nota-origen').textContent = DATA.meta.notaOrigen;
  document.getElementById('nota-alcance').textContent = DATA.meta.notaAlcance;
  document.getElementById('nota-score').textContent =
    `Score: ${S.descripcion} La referencia de tamaño es un ${S.referencia.nombre} (${S.referencia.largo} × ${S.referencia.ancho} mm). ${S.referencia.nota}`;
  document.getElementById('nota-costo').textContent = S.notaCosto;
  document.getElementById('nota-bencina').textContent = B.nota;
  document.getElementById('nota-carga').textContent = DATA.meta.notaCarga;
  document.getElementById('nota-precio').textContent = DATA.meta.notaPrecio;
  estadoGeo(`por defecto: ${B.estacionDefault}`);
  document.getElementById('nota-espacio').textContent = S.notaEspacio;
  document.getElementById('nota-marca').textContent = S.notaMarca;
  document.getElementById('nota-equipamiento').textContent = S.notaEquipamiento;
  initTema();
  initChips();
  initRangos();
  initPesos();
  renderHead();
  renderBody();
  initEventos();
  if (location.hash) seleccionar(location.hash.slice(1), true);
})();

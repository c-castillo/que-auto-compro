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
    tipos: new Set(),
    carrocerias: new Set(),
    precioMax: null,
    kmlMin: 0,
    largoMax: null,
    maleteroMin: 0,
    soloPreseleccion: false,
    verDims: true,
    pesos: { ...S.pesos },
    sortKey: 'score',
    sortDir: -1,         // 1 asc, -1 desc
    seleccion: null,
    bencina: DATA.meta.supuestos.precioBencina93,
    kwh: DATA.meta.supuestos.precioKwh,
    baseCosto: S.baseCostoDefault
  };

  /* ---------- helpers ---------- */
  const clp = n => n == null ? null : '$' + n.toLocaleString('es-CL');
  const num = (n, d = 1) => n == null ? null : n.toLocaleString('es-CL', { minimumFractionDigits: d, maximumFractionDigits: d });
  const nd = '<span class="nd">—</span>';
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
    return k ? 100 / k.valor * state.bencina : null;
  }

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
  const R = { alto: rango(c => c.dim.alto), ejes: rango(c => c.dim.ejes), precio: rango(c => c.precioFull) };
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

  // Espacio interior: sin dato público de altura libre al techo, se usa la altura
  // del vehículo y la distancia entre ejes como proxies. Ver meta.score.notaEspacio.
  function subEspacio(c) {
    const a = c.dim.alto == null ? null : norm(c.dim.alto, R.alto);
    const e = c.dim.ejes == null ? null : norm(c.dim.ejes, R.ejes);
    if (a == null && e == null) return null;
    if (a == null) return e;
    if (e == null) return a;
    return 0.55 * a + 0.45 * e;
  }

  // Precio de la versión full equipo: el más barato puntúa 100.
  const subPrecio = c => c.precioFull == null ? null : 100 - norm(c.precioFull, R.precio);

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

  // Comparación contra el auto de referencia, para que cada subpuntaje sea interpretable.
  const delta = (v, ref, u = ' mm') => v == null ? '' : (v - ref >= 0 ? '+' : '−') + Math.abs(v - ref) + u;

  const CRITERIOS = [
    {
      key: 'espacio', label: 'Espacio interior', fn: subEspacio,
      pista: c => `alto ${delta(c.dim.alto, S.referencia.alto)} · entre ejes ${delta(c.dim.ejes, S.referencia.ejes)} vs referencia`
    },
    {
      key: 'costo', label: 'Costo por 100 km', fn: subCosto,
      pista: c => {
        const v = costo100(c);
        if (v == null) return 'sin dato de consumo';
        const txt = `$${Math.round(v).toLocaleString('es-CL')} / 100 km · ciclo ${state.baseCosto}`;
        if (c.tipo === 'EV') return txt + ` · ${c.ev.consumoKwh100} kWh/100 km`;
        const k = kmlPara(c, state.baseCosto);
        return txt + ` · ${num(k.valor)} km/l ${k.derivado ? '(derivado)' : k.base}`;
      }
    },
    {
      key: 'precio', label: 'Precio full equipo', fn: subPrecio,
      pista: c => c.precioFull == null ? '' : (c.precioFullEstimado ? 'precio tope estimado' : 'precio tope publicado')
    },
    {
      key: 'tamano', label: 'Tamaño / estacionar', fn: subTamano,
      pista: c => `largo ${delta(c.dim.largo, S.referencia.largo)} · ancho ${delta(c.dim.ancho, S.referencia.ancho)} vs referencia`
    },
    { key: 'marca', label: 'Marca', fn: subMarca, pista: c => `nivel de marca: ${c.marca}` }
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

  /* ---------- columnas ---------- */
  const COLS = [
    {
      key: 'score', label: 'Score', unidad: '0-100', group: 'base',
      val: c => score(c),
      html: c => {
        const v = score(c);
        if (v == null) return nd;
        // ancho en px: el contenedor es flex, así que un % no daría una escala comparable
        return `<div class="score-cell"><span>${Math.round(v)}</span>`
          + `<i style="width:${Math.max(1, Math.round(v * 0.42))}px"></i>`
          + (scoreIncompleto(c) ? '<em class="warn-mark" title="Falta algún dato: ese criterio se contó como 50 neutro">*</em>' : '')
          + '</div>';
      }
    },
    {
      key: 'modelo', label: 'Modelo', group: 'base', tipo: 'texto',
      val: c => `${c.marca} ${c.modelo}`,
      html: c => `<span class="m-nombre">${esc(c.marca)} ${esc(c.modelo)}</span>`
        + (c.preseleccionado ? ' <span class="tag tag-hist">preselección</span>' : '')
        + `<span class="m-version">${esc(c.version)}</span>`
    },
    { key: 'marca', label: 'Marca', group: 'base', tipo: 'texto', val: c => c.marca, html: c => esc(c.marca) },
    {
      key: 'paisMarca', label: 'Origen', unidad: 'marca', group: 'base', tipo: 'texto',
      val: c => c.paisMarca, html: c => esc(c.paisMarca)
    },
    { key: 'tipo', label: 'Tipo', group: 'base', tipo: 'texto', val: c => c.tipo, html: c => `<span class="tag">${esc(c.tipo)}</span>` },
    { key: 'carroceria', label: 'Carrocería', group: 'base', tipo: 'texto', val: c => c.carroceria, html: c => esc(c.carroceria) },
    {
      key: 'precioNuevo', label: 'Precio nuevo', unidad: 'CLP', group: 'base',
      val: c => c.precioNuevo, html: c => clp(c.precioNuevo) ?? nd
    },
    {
      key: 'precioFull', label: 'Precio full', unidad: 'CLP tope gama', group: 'base',
      val: c => c.precioFull,
      html: c => c.precioFull == null ? nd
        : (c.precioFullEstimado ? '<span class="est">~</span>' : '') + clp(c.precioFull)
    },
    {
      key: 'precioUsado', label: 'Precio usado', unidad: 'CLP ref.', group: 'base',
      val: c => c.precioUsado,
      html: c => c.precioUsado == null ? nd
        : (c.precioUsadoEstimado ? `<span class="est">~</span>` : '') + clp(c.precioUsado)
    },
    {
      key: 'delta', label: 'Δ usado', unidad: '%', group: 'base',
      val: c => deltaUsado(c),
      html: c => { const d = deltaUsado(c); return d == null ? nd : num(d, 0) + '%'; }
    },
    {
      key: 'kmlCiudad', label: 'km/l ciudad', unidad: 'homolog. o der.', group: 'base',
      val: c => { const k = c.tipo === 'EV' ? null : kmlPara(c, 'ciudad'); return k ? k.valor : null; },
      html: c => {
        const k = c.tipo === 'EV' ? null : kmlPara(c, 'ciudad');
        if (!k) return nd;
        if (k.derivado) return `<span class="est">${num(k.valor)}</span> <span class="tag" title="${esc(k.base)}">der.</span>`;
        return num(k.valor) + (k.valor > 30 ? ' <span class="warn-mark" title="Homologación chilena, muy optimista frente a WLTP">*</span>' : '');
      }
    },
    {
      key: 'kmlMixto', label: 'km/l mixto', unidad: 'ciclo', group: 'base',
      val: c => c.rend.mixto,
      html: c => c.rend.mixto == null ? nd
        : num(c.rend.mixto) + ` <span class="tag">${esc(c.rend.ciclo || '?')}</span>`
    },
    {
      key: 'costo100', label: 'Costo', unidad: () => `$/100 km · ${state.baseCosto}`, group: 'base',
      val: c => costo100(c),
      html: c => {
        const v = costo100(c);
        if (v == null) return nd;
        const k = c.tipo === 'EV' ? null : kmlPara(c, state.baseCosto);
        return (k && k.derivado ? '<span class="est">~</span>' : '') + '$' + Math.round(v).toLocaleString('es-CL');
      }
    },
    {
      key: 'autonomia', label: 'Autonomía', unidad: 'km eléctricos', group: 'base',
      val: c => c.ev ? c.ev.autonomiaKm : null,
      html: c => c.ev ? num(c.ev.autonomiaKm, 0) : nd
    },
    {
      key: 'maletero', label: 'Maletero', unidad: 'L', group: 'base', val: c => c.dim.maletero,
      html: c => c.dim.maletero == null ? nd : num(c.dim.maletero, 0)
    },
    { key: 'potencia', label: 'Potencia', unidad: 'HP', group: 'base', val: c => c.potencia, html: c => num(c.potencia, 0) },
    {
      key: 'largo', label: 'Largo', unidad: 'mm', group: 'dim', val: c => c.dim.largo,
      html: c => c.dim.largo == null ? nd
        : num(c.dim.largo, 0) + (c.dimsPorConfirmar ? ' <span class="warn-mark" title="Dimensiones por confirmar en ficha local">?</span>' : '')
    },
    { key: 'ancho', label: 'Ancho', unidad: 'mm', group: 'dim', val: c => c.dim.ancho, html: c => num(c.dim.ancho, 0) },
    { key: 'alto', label: 'Alto', unidad: 'mm', group: 'dim', val: c => c.dim.alto, html: c => num(c.dim.alto, 0) },
    { key: 'ejes', label: 'Entre ejes', unidad: 'mm', group: 'dim', val: c => c.dim.ejes, html: c => num(c.dim.ejes, 0) },
    {
      key: 'despeje', label: 'Despeje', unidad: 'mm', group: 'dim', val: c => c.dim.despeje,
      html: c => c.dim.despeje == null ? nd : num(c.dim.despeje, 0)
    },
    {
      key: 'historial', label: 'Historial', unidad: 'precio lista', group: 'base', tipo: 'nosort',
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
  function filtrar() {
    const q = state.q.trim().toLowerCase();
    return AUTOS.filter(c => {
      if (state.soloPreseleccion && !c.preseleccionado) return false;
      if (state.origenes.size && !state.origenes.has(c.paisMarca)) return false;
      if (state.marcas.size && !state.marcas.has(c.marca)) return false;
      if (state.tipos.size && !state.tipos.has(c.tipo)) return false;
      if (state.carrocerias.size && !state.carrocerias.has(c.carroceria)) return false;
      if (state.precioMax != null && c.precioNuevo > state.precioMax) return false;
      if (state.largoMax != null && c.dim.largo > state.largoMax) return false;
      if (state.maleteroMin > 0 && (c.dim.maletero ?? 0) < state.maleteroMin) return false;
      if (state.kmlMin > 0 && (c.rend.mixto ?? -1) < state.kmlMin) return false;
      if (q) {
        const heno = `${c.marca} ${c.modelo} ${c.version} ${c.tipo} ${c.carroceria} ${c.notas || ''}`.toLowerCase();
        if (!heno.includes(q)) return false;
      }
      return true;
    });
  }

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
      return `<th data-key="${c.key}" ${sortable ? '' : 'data-nosort="1" style="cursor:default"'}
        ${activa ? `aria-sort="${state.sortDir === 1 ? 'ascending' : 'descending'}"` : ''}
        title="${sortable ? 'Ordenar por ' + esc(c.label) : ''}">${esc(c.label)}${dir}${unidad ? `<span class="u">${esc(unidad)}</span>` : ''}</th>`;
    }).join('');
  }

  function renderBody() {
    const lista = ordenar(filtrar());
    const cols = colsVisibles();
    document.getElementById('tbody').innerHTML = lista.map(c =>
      `<tr data-id="${c.id}" class="${state.seleccion === c.id ? 'sel' : ''}">`
      + cols.map(col => `<td>${col.html(c) ?? nd}</td>`).join('')
      + '</tr>'
    ).join('');
    document.getElementById('vacio').hidden = lista.length > 0;
    document.getElementById('meta-count').textContent =
      `${lista.length} de ${AUTOS.length} modelos`;
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
      ['Precio nuevo', clp(c.precioNuevo)],
      ['Precio full equipo', c.precioFull == null ? '—' : (c.precioFullEstimado ? '~' : '') + clp(c.precioFull)],
      ['Precio usado ref.', c.precioUsado == null ? '—' : (c.precioUsadoEstimado ? '~' : '') + clp(c.precioUsado)],
      ['Largo × ancho × alto', dimsTexto],
      ['Distancia entre ejes', mm(d.ejes)],
      ['Maletero', d.maletero ? d.maletero + ' L' + (d.maleteroMax ? ` (${d.maleteroMax} L abatido)` : '')
        : (d.maleteroMax ? `hasta ${d.maleteroMax} L` : '—')],
      ['Despeje al piso', mm(d.despeje)],
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
      ['Origen', c.origen]
    ];

    el.hidden = false;
    el.innerHTML = `
      <button class="d-cerrar" type="button" id="d-cerrar">Cerrar</button>
      <h2>${esc(c.marca)} ${esc(c.modelo)} <span style="font-weight:400;color:var(--text-dim)">${esc(c.version)}</span></h2>
      <p class="d-sub">${esc(c.tipo)} · ${esc(c.carroceria)} · ${c.anio}${c.preseleccionado ? ' · en la preselección' : ''}</p>
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
          <p class="d-nota" style="color:var(--text-dim);font-size:.78rem">
            ${esc(c.precioFullNota || '')}
          </p>

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

  /* ---------- pesos del score ---------- */
  function renderPesos() {
    document.getElementById('pesos').innerHTML = CRITERIOS.map(cr => `
      <label class="peso">
        <span>${esc(cr.label)}</span>
        <input type="range" min="0" max="50" step="5" value="${state.pesos[cr.key]}" data-k="${cr.key}">
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
      renderBody();
      renderDetalle();
    });
    document.getElementById('reset-pesos').addEventListener('click', () => {
      state.pesos = { ...S.pesos };
      renderPesos(); renderBody(); renderDetalle();
    });
  }

  /* ---------- chips ---------- */
  function pintarChips(contId, valores, set) {
    document.getElementById(contId).innerHTML = valores.map(v =>
      `<button type="button" class="chip" data-v="${esc(v)}" aria-pressed="${set.has(v)}">${esc(v)}</button>`
    ).join('');
  }

  function initChips() {
    const uniq = f => [...new Set(AUTOS.map(f))].sort((a, b) => a.localeCompare(b, 'es'));
    const grupos = [
      ['chips-origen', uniq(c => c.paisMarca), state.origenes],
      ['chips-marca', uniq(c => c.marca), state.marcas],
      ['chips-tipo', uniq(c => c.tipo), state.tipos],
      ['chips-carroceria', uniq(c => c.carroceria), state.carrocerias]
    ];
    grupos.forEach(([id, vals, set]) => {
      pintarChips(id, vals, set);
      document.getElementById(id).addEventListener('click', e => {
        const b = e.target.closest('.chip');
        if (!b) return;
        const v = b.dataset.v;
        set.has(v) ? set.delete(v) : set.add(v);
        pintarChips(id, vals, set);
        renderBody();
      });
    });
  }

  /* ---------- rangos ---------- */
  function initRangos() {
    const precios = AUTOS.map(c => c.precioNuevo);
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
        out.textContent = fmt(+inp.value, inp);
        renderBody();
      };
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

    document.getElementById('t-preseleccion').addEventListener('change', e => {
      state.soloPreseleccion = e.target.checked; renderBody();
    });
    document.getElementById('t-dims').addEventListener('change', e => {
      state.verDims = e.target.checked; renderHead(); renderBody();
    });

    const sb = document.getElementById('s-bencina'), sk = document.getElementById('s-kwh');
    sb.value = state.bencina; sk.value = state.kwh;
    sb.addEventListener('input', () => { state.bencina = +sb.value || 0; renderBody(); renderDetalle(); });
    sk.addEventListener('input', () => { state.kwh = +sk.value || 0; renderBody(); renderDetalle(); });

    const sbase = document.getElementById('s-base');
    sbase.value = state.baseCosto;
    sbase.addEventListener('change', () => {
      state.baseCosto = sbase.value;
      renderHead(); renderBody(); renderDetalle();   // el encabezado muestra la base
    });

    document.getElementById('reset').addEventListener('click', () => {
      state.q = ''; document.getElementById('q').value = '';
      state.origenes.clear(); state.marcas.clear(); state.tipos.clear(); state.carrocerias.clear();
      state.soloPreseleccion = false; document.getElementById('t-preseleccion').checked = false;
      ['r-precio', 'r-largo'].forEach(id => { const i = document.getElementById(id); i.value = i.max; i.dispatchEvent(new Event('input')); });
      ['r-kml', 'r-maletero'].forEach(id => { const i = document.getElementById(id); i.value = i.min; i.dispatchEvent(new Event('input')); });
      initChips();
      renderBody();
    });
  }

  /* ---------- arranque ---------- */
  document.getElementById('meta-fecha').textContent = 'datos al ' + DATA.meta.actualizado;
  document.getElementById('nota-rendimiento').textContent = DATA.meta.notaRendimiento;
  document.getElementById('nota-origen').textContent = DATA.meta.notaOrigen;
  document.getElementById('nota-alcance').textContent = DATA.meta.notaAlcance;
  document.getElementById('nota-score').textContent =
    `Score: ${S.descripcion} La referencia de tamaño es un ${S.referencia.nombre} (${S.referencia.largo} × ${S.referencia.ancho} mm). ${S.referencia.nota}`;
  document.getElementById('nota-costo').textContent = S.notaCosto;
  document.getElementById('nota-espacio').textContent = S.notaEspacio;
  document.getElementById('nota-marca').textContent = S.notaMarca;
  initChips();
  initRangos();
  initPesos();
  renderHead();
  renderBody();
  initEventos();
  if (location.hash) seleccionar(location.hash.slice(1), true);
})();

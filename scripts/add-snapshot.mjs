#!/usr/bin/env node
/* Agrega un punto al historial de precios de un modelo.
 *
 *   node scripts/add-snapshot.mjs --list
 *   node scripts/add-snapshot.mjs toyota-corolla-cross-xei 28490000
 *   node scripts/add-snapshot.mjs hyundai-kona-hev-plus 25900000 --clase usado --fuente "chileautos 2025 Plus 12.000 km"
 *   node scripts/add-snapshot.mjs toyota-yaris-cross-hev 23990000 --fecha 2026-09-01
 *
 * Escribe directamente en data/autos.js manteniendo el formato del archivo.
 */

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const ARCHIVO = join(RAIZ, 'data', 'autos.js');
const PREFIJO = 'window.AUTOS_DATA = ';

async function cargar() {
  const texto = await readFile(ARCHIVO, 'utf8');
  const i = texto.indexOf(PREFIJO);
  if (i === -1) throw new Error(`No encontré "${PREFIJO}" en ${ARCHIVO}`);
  const cabecera = texto.slice(0, i);
  const cuerpo = texto.slice(i + PREFIJO.length).trim().replace(/;\s*$/, '');
  return { cabecera, datos: JSON.parse(cuerpo) };
}

async function guardar(cabecera, datos) {
  await writeFile(ARCHIVO, cabecera + PREFIJO + JSON.stringify(datos, null, 2) + ';\n', 'utf8');
}

function parseArgs(argv) {
  const pos = [];
  const flags = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) flags[argv[i].slice(2)] = argv[++i];
    else pos.push(argv[i]);
  }
  return { pos, flags };
}

const { pos, flags } = parseArgs(process.argv.slice(2));
const { cabecera, datos } = await cargar();

if ('list' in flags || pos.length === 0) {
  console.log('\nModelos disponibles:\n');
  for (const a of datos.autos) {
    const n = a.historial.length;
    console.log(`  ${a.id.padEnd(30)} ${a.marca} ${a.modelo} ${a.version}  (${n} punto${n === 1 ? '' : 's'})`);
  }
  console.log('\nUso: node scripts/add-snapshot.mjs <id> <precio> [--clase nuevo|usado] [--fecha YYYY-MM-DD] [--fuente "..."]\n');
  process.exit(0);
}

const [id, precioRaw] = pos;
const auto = datos.autos.find(a => a.id === id);
if (!auto) {
  console.error(`No existe el id "${id}". Corre --list para ver los válidos.`);
  process.exit(1);
}

const precio = Number(String(precioRaw).replace(/[^\d]/g, ''));
if (!precio) {
  console.error(`Precio inválido: "${precioRaw}"`);
  process.exit(1);
}

const clase = flags.clase || 'nuevo';
if (!['nuevo', 'usado'].includes(clase)) {
  console.error('--clase debe ser "nuevo" o "usado"');
  process.exit(1);
}

const fecha = flags.fecha || new Date().toISOString().slice(0, 10);
if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
  console.error('--fecha debe ser YYYY-MM-DD');
  process.exit(1);
}

const dup = auto.historial.find(h => h.fecha === fecha && h.clase === clase);
if (dup) {
  console.log(`Ya había un punto ${clase} del ${fecha} ($${dup.precio.toLocaleString('es-CL')}). Lo reemplazo.`);
  dup.precio = precio;
  dup.fuente = flags.fuente || dup.fuente;
} else {
  auto.historial.push({ fecha, precio, clase, fuente: flags.fuente || 'manual' });
  auto.historial.sort((a, b) => a.fecha.localeCompare(b.fecha) || a.clase.localeCompare(b.clase));
}

// El precio vigente del modelo sigue al último punto registrado de cada clase.
const ultimo = c => auto.historial.filter(h => h.clase === c).at(-1);
const ultNuevo = ultimo('nuevo');
const ultUsado = ultimo('usado');
if (ultNuevo) auto.precioNuevo = ultNuevo.precio;
if (ultUsado) { auto.precioUsado = ultUsado.precio; auto.precioUsadoEstimado = false; }

datos.meta.actualizado = fecha;
await guardar(cabecera, datos);

console.log(`✓ ${auto.marca} ${auto.modelo} ${auto.version}`);
console.log(`  ${clase} · ${fecha} · $${precio.toLocaleString('es-CL')}`);
console.log(`  serie ${clase}: ${auto.historial.filter(h => h.clase === clase).map(h => h.fecha).join(' → ')}`);

// Erzeugt die Aufgabendateien für «Excel-Datei prüfen» (upload/index.html):
//   app/files/upload/<id>.xlsx für die Übungen in UPLOAD_IDS (Daten aus app/exercises.json).
// Aufbau jeder Datei: ein Blatt «Aufgabe» mit der data-Matrix ab A1 (Zahlen als Zahlen, Kopfzeile fett),
// die Zielzelle gelb markiert und leer, darunter der Aufgabentext und der Hinweis zum Hochladen.
// Die Übungs-ID steht zusätzlich in den Dokumenteigenschaften (Stichwörter «excel-drills:<id>»), damit
// app/upload.js eine hochgeladene Datei der richtigen Übung zuordnen kann.
// Alles ist deterministisch: feste Datumswerte im Workbook und in der ZIP-Datei, gleiche Bytes bei jedem Lauf.
//
// Aufruf:  node scripts/upload/generate-upload-files.mjs           Dateien schreiben
//          node scripts/upload/generate-upload-files.mjs --check   nur prüfen, ob die Dateien aktuell sind
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import ExcelJS from 'exceljs';
import JSZip from 'jszip'; // kommt mit exceljs

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const OUT_DIR = join(root, 'app', 'files', 'upload');
const CHECK_ONLY = process.argv.includes('--check');
export const UPLOAD_IDS = ['sverweis-1', 'summewenn-1', 'absolut-1', 'wenn-1', 'zaehlenwenn-1'];
export const SHEET_NAME = 'Aufgabe';
const FIXED_DATE = new Date(Date.UTC(2026, 0, 1));

const { exercises } = JSON.parse(readFileSync(join(root, 'app', 'exercises.json'), 'utf8'));

// «E2» → { row: 2, col: 5 } (1-basiert wie in exceljs)
function a1(ref) {
  const m = /^([A-Z]+)(\d+)$/.exec(ref);
  if (!m) throw new Error('Ungültige Zielzelle ' + ref);
  let col = 0;
  for (const ch of m[1]) col = col * 26 + (ch.charCodeAt(0) - 64);
  return { row: Number(m[2]), col };
}

async function buildBook(ex) {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Excel-Drills';
  wb.lastModifiedBy = 'Excel-Drills';
  wb.created = FIXED_DATE;
  wb.modified = FIXED_DATE;
  wb.title = ex.title;
  wb.subject = 'Excel-Drills Übung ' + ex.id;
  wb.keywords = 'excel-drills:' + ex.id;
  wb.calcProperties = { fullCalcOnLoad: true };

  const ws = wb.addWorksheet(SHEET_NAME);
  const t = a1(ex.target);
  const width = Math.max(t.col, ...ex.data.map((r) => r.length));

  ex.data.forEach((row, r) => {
    row.forEach((v, c) => {
      if (v === null || v === undefined || v === '') return;
      const cell = ws.getCell(r + 1, c + 1);
      cell.value = v; // Zahlen bleiben Zahlen, Texte bleiben Texte
      if (r === 0) cell.font = { bold: true };
    });
  });

  // Zielzelle: gelb, leer, mit Rahmen
  const target = ws.getCell(t.row, t.col);
  target.value = null;
  target.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF2CC' } };
  const edge = { style: 'medium', color: { argb: 'FFC99A00' } };
  target.border = { top: edge, left: edge, bottom: edge, right: edge };

  // Aufgabentext unter der Tabelle (mindestens zwei Zeilen Abstand zur Zielzelle)
  const textRow = Math.max(ex.data.length, t.row) + 2;
  const lastCol = Math.max(width, 6);
  const taskCell = ws.getCell(textRow, 1);
  taskCell.value = 'Aufgabe: ' + ex.task;
  taskCell.font = { bold: true };
  taskCell.alignment = { wrapText: true, vertical: 'top' };
  ws.mergeCells(textRow, 1, textRow, lastCol);
  ws.getRow(textRow).height = 48;

  const hintCell = ws.getCell(textRow + 1, 1);
  hintCell.value = 'Formel in ' + ex.target + ' eingeben, speichern, hochladen auf excel-drills.ch/upload/';
  hintCell.font = { italic: true, color: { argb: 'FF565B58' } };
  ws.mergeCells(textRow + 1, 1, textRow + 1, lastCol);

  for (let c = 1; c <= lastCol; c++) ws.getColumn(c).width = 14;
  ws.views = [{ state: 'normal', activeCell: ex.target, selection: [{ activeCell: ex.target, sqref: ex.target }] }];

  // Neu packen mit festem Datum pro ZIP-Eintrag, damit jeder Lauf dieselben Bytes liefert
  const src = await JSZip.loadAsync(await wb.xlsx.writeBuffer());
  const out = new JSZip();
  for (const name of Object.keys(src.files).sort()) {
    const f = src.files[name];
    if (f.dir) continue;
    out.file(name, await f.async('uint8array'), { date: FIXED_DATE, createFolders: false });
  }
  return out.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE', compressionOptions: { level: 9 } });
}

mkdirSync(OUT_DIR, { recursive: true });
let bad = 0;
for (const id of UPLOAD_IDS) {
  const ex = exercises.find((e) => e.id === id);
  if (!ex) { console.log(`FEHLER ${id} fehlt in exercises.json`); bad++; continue; }
  const buf = await buildBook(ex);
  const file = join(OUT_DIR, id + '.xlsx');
  if (CHECK_ONLY) {
    const same = existsSync(file) && Buffer.compare(readFileSync(file), buf) === 0;
    console.log(`${same ? 'ok    ' : 'FEHLER'} files/upload/${id}.xlsx${same ? '' : ' ist veraltet (Skript ohne --check ausführen)'}`);
    if (!same) bad++;
  } else {
    writeFileSync(file, buf);
    console.log(`files/upload/${id}.xlsx  (${Math.round(buf.length / 1024 * 10) / 10} KB, Zielzelle ${ex.target})`);
  }
}
if (CHECK_ONLY) console.log(bad ? `${bad} Abweichungen` : 'OK: Aufgabendateien sind aktuell.');
process.exit(bad ? 1 : 0);

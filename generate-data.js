#!/usr/bin/env node

/**
 * Script para generar data.json desde Google Sheets
 * Ejecutar: node generate-data.js
 * El archivo se guarda en pie-de-imprenta/data.json
 */

const fs = require('fs');
const https = require('https');

const SHEET_ID = '1dULxv59otAv5TmRyz2jf2xOM4sfhkkNOP_ePloePWJ4';
const SHEET_NAME = 'Respuestas de formulario 1';
const URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(SHEET_NAME)}`;

console.log('📡 Descargando datos del Google Sheets...');

https.get(URL, (res) => {
  let data = '';
  
  res.on('data', chunk => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      // Parse del JSON (mismo que en el HTML frontend)
      const json = JSON.parse(data.slice(47, -2));
      
      const cols = json.table.cols.map(c => c.label);
      const records = json.table.rows
        .map(row => {
          const obj = {};
          cols.forEach((col, i) => {
            obj[col] = row.c[i]?.v ?? '';
          });
          return obj;
        })
        .filter(r => {
          // Filtra registros sin título
          const titulo = Object.keys(r).find(k => k.toLowerCase().trim() === 'título');
          return titulo && r[titulo];
        });
      
      // Estructura de salida (mismo formato que trae Google Sheets)
      const output = {
        table: {
          cols: json.table.cols,
          rows: json.table.rows
        }
      };
      
      // Guardar en data.json
      const outputPath = './pie-de-imprenta/data.json';
      fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
      
      console.log(`✅ data.json generado exitosamente`);
      console.log(`📊 ${records.length} registros guardados`);
      console.log(`📁 ${outputPath}`);
    } catch (e) {
      console.error('❌ Error procesando JSON:', e.message);
      process.exit(1);
    }
  });
}).on('error', (e) => {
  console.error('❌ Error descargando datos:', e.message);
  process.exit(1);
});

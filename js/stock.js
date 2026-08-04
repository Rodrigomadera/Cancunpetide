// ============================================================
// PEPTINATOR MX — Existencia por producto (base de datos de stock)
// ============================================================
// Ajusta estos números a tu existencia real. El sitio:
//   - Muestra "EN EXISTENCIA: N" o "AGOTADO" en la ficha del producto
//   - Bloquea agregar al pedido cuando stock = 0
//   - Limita la cantidad del carrito al stock disponible (anti-sobreventa)
// NOTA: al ser sitio estático, este archivo se edita y se sube con git push.
//
// Última actualización: 2026-07-26 — según cotización de proveedor
// (cajas × 10 viales por caja).

const STOCK = {
  "retatrutida":  30,   // 3 cajas × 10
  "ghk-cu":       20,   // 2 cajas × 10 (50 mg)
  "tesamorelin":  10,   // 1 caja × 10
  "ipamorelin":   40,   // 4 cajas × 10 (5 mg)
  "bpc-157":      30,   // 3 cajas × 10
  "tb-500":       30,   // 3 cajas × 10
  "kpv":          10,   // 1 caja × 10
  "epithalon":    10,   // 1 caja × 10
  "selank":       10,   // 1 caja × 10
  "mots-c":       10,   // 1 caja × 10
  "nad":          10,   // 1 caja × 10
  "semax":        10,   // 1 caja × 10
  "ipa-cjc":      20,   // 2 cajas × 10
  "bpc-tb":       20,   // 2 cajas × 10
  "glow":         10,   // 1 caja × 10
  "klow":         10,   // 1 caja × 10
  "melanotan-1":  10,   // 1 caja × 10
  "melanotan-2":  20,   // 2 cajas × 10
  "5amino1mq":    10,   // 1 caja × 10
  "agua-bac":     30,   // 3 cajas × 10 (3 mL)
  "tirzepatida":  20,   // 2 cajas × 10
  "semaglutida-5":  20, // 2 cajas × 10
  "semaglutida-10": 20, // 2 cajas × 10
  "ghk-cu-100":   20,   // 2 cajas × 10
  "ipamorelin-10": 10,  // 1 caja × 10
  "bpc-tb-20":    10,   // 1 caja × 10
  "oxitocina-5":  10,   // 1 caja × 10
  "oxitocina-10": 10    // 1 caja × 10
};

// Devuelve la existencia de un producto (0 si no está listado)
function stockDe(productoId) {
  return STOCK[productoId] || 0;
}

// ============================================================
// Stock en vivo desde Google Sheets
// ============================================================
// La hoja debe tener dos columnas: id | cantidad, y estar compartida
// como "cualquiera con el enlace puede ver".
// URL formato: https://docs.google.com/spreadsheets/d/<ID>/gviz/tq?tqx=out:csv
// Si la carga falla, la página usa los valores locales de arriba (respaldo).
const STOCK_SHEET_CSV = "https://docs.google.com/spreadsheets/d/1EFK3XeOig1J8VEntEz6QEFVpFKdPpZA19ZwUvT5Iuxk/gviz/tq?tqx=out:csv";

(function cargarStockRemoto() {
  if (!STOCK_SHEET_CSV) return;
  fetch(STOCK_SHEET_CSV)
    .then(r => r.text())
    .then(txt => {
      txt.trim().split(/\r?\n/).forEach(linea => {
        // tolera CSV por comas o todo en una celda separado por tabulador
        const partes = linea.split(/[\t,;]/)
          .map(s => s.replace(/"/g, "").trim())
          .filter(Boolean);
        if (partes.length >= 2 && partes[0] !== "id" && /^\d+$/.test(partes[partes.length - 1])) {
          STOCK[partes[0]] = parseInt(partes[partes.length - 1], 10);
        }
      });
      document.dispatchEvent(new CustomEvent("stock:updated"));
    })
    .catch(() => { /* sin internet o hoja privada: se usan los valores locales */ });
})();

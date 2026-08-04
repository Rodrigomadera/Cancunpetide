// ============================================================
// PEPTINATOR MX — Configuración de pagos
// ============================================================
// Funciona con Payment Links de Stripe (buy.stripe.com/...) o
// Links de pago de MercadoPago (mpago.la/...). No requiere backend:
// el botón "Solicitar pedido" abre el link del producto.
//
// MercadoPago: app/panel → Cobrar → Link de pago → crea un link por
// producto y pégalo en paymentLinks con el id del catálogo.
//
// Mientras los links estén vacíos, el botón lleva a la sección de contacto.

const STRIPE_CONFIG = {
  // Moneda de los links de pago: "mxn"
  currency: "mxn",

  // Link genérico de respaldo (opcional) — se usa si el producto no tiene link propio
  paymentLinkGenerico: "",

  // Link de pago por producto (id del catálogo → URL del link)
  paymentLinks: {
    // "bpc-157": "https://mpago.la/XXXX",
    // "retatrutida": "https://mpago.la/XXXX",
  }
};

// Devuelve el link de pago para un producto, o null si no hay ninguno configurado
function stripeLinkPara(productoId) {
  return STRIPE_CONFIG.paymentLinks[productoId] || STRIPE_CONFIG.paymentLinkGenerico || null;
}

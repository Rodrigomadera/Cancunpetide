// ============================================================
// PEPTINATOR MX — Tabulador de envíos DHL desde Cancún, Q. Roo
// ============================================================
// ⚠ PRECIOS ESTIMADOS EDITABLES: ajusta cada zona a tu tarifa real
// con DHL (cuenta de negocios). El selector de estado en el carrito
// suma este costo al total del pedido.

const SHIPPING = {
  carrier: "DHL Express",
  origin: "Cancún, Quintana Roo",
  zones: [
    {
      name: "Local (Quintana Roo)",
      price: 99,
      states: ["Quintana Roo"]
    },
    {
      name: "Sureste",
      price: 160,
      states: ["Yucatán", "Campeche", "Tabasco", "Chiapas"]
    },
    {
      name: "Centro",
      price: 199,
      states: ["Ciudad de México", "México", "Puebla", "Morelos", "Tlaxcala",
               "Hidalgo", "Querétaro", "Veracruz", "Oaxaca", "Guerrero"]
    },
    {
      name: "Occidente",
      price: 229,
      states: ["Jalisco", "Michoacán", "Guanajuato", "Aguascalientes",
               "Colima", "Nayarit"]
    },
    {
      name: "Norte",
      price: 259,
      states: ["Nuevo León", "Tamaulipas", "Coahuila", "San Luis Potosí",
               "Durango", "Zacatecas", "Sinaloa"]
    },
    {
      name: "Norte extremo",
      price: 299,
      states: ["Chihuahua", "Sonora", "Baja California", "Baja California Sur"]
    }
  ]
};

// Precio de envío para un estado (null si no se encuentra)
function shippingPriceFor(estado) {
  for (const z of SHIPPING.zones) {
    if (z.states.includes(estado)) return z.price;
  }
  return null;
}

// Lista de las 32 entidades ordenadas para el selector
const ESTADOS_MX = SHIPPING.zones
  .flatMap(z => z.states)
  .sort((a, b) => a.localeCompare(b, "es"));

// CancunPeptide — cart (localStorage) + WhatsApp checkout + hotel delivery
// ============================================================
// Checkout & contact data (fill in when ready):
const CHECKOUT_CONFIG = {
  whatsapp: "529516383849", // +52 951 638 3849
};

// Hotel delivery: flat fee
const DELIVERY = { usd: 10, mxn: 185 };

(function () {
  const KEY = "cancunpeptide_cart";
  const fmtMXN = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 });
  const fmtUSD = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

  let cart = [];
  try { cart = JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { cart = []; }

  const drawer = document.getElementById("cart-drawer");
  const overlay = document.getElementById("cart-overlay");
  const itemsEl = document.getElementById("cart-items");
  const totalEl = document.getElementById("cart-total");
  const shipEl = document.getElementById("cart-shipping");
  const grandEl = document.getElementById("cart-grand");
  const countEls = document.querySelectorAll(".cart-count");

  function save() { localStorage.setItem(KEY, JSON.stringify(cart)); }

  function producto(id) { return PRODUCTS.find(p => p.id === id); }

  function totalItems() { return cart.reduce((a, i) => a + i.qty, 0); }

  function subtotal() {
    return cart.reduce((a, i) => {
      const p = producto(i.id);
      return a + (p ? p.price * i.qty : 0);
    }, 0);
  }

  function subtotalUSD() {
    return cart.reduce((a, i) => {
      const p = producto(i.id);
      return a + (p ? p.usd * i.qty : 0);
    }, 0);
  }

  function dual(mxn, usd) { return `${fmtUSD.format(usd)} / ${fmtMXN.format(mxn)}`; }

  function renderBadge() {
    const n = totalItems();
    countEls.forEach(el => {
      el.textContent = n;
      el.style.display = n > 0 ? "inline-flex" : "none";
    });
  }

  function render() {
    renderBadge();
    if (!itemsEl) return;
    if (cart.length === 0) {
      itemsEl.innerHTML = '<p class="mono cart-empty">// EMPTY ORDER — add products from the catalog</p>';
      totalEl.textContent = "—";
      if (shipEl) shipEl.textContent = "—";
      if (grandEl) grandEl.textContent = "—";
      return;
    }
    itemsEl.innerHTML = cart.map(i => {
      const p = producto(i.id);
      if (!p) return "";
      const max = typeof stockDe === "function" ? stockDe(p.id) : 99;
      return `
        <div class="cart-item" data-id="${p.id}">
          <div class="cart-item-info">
            <span class="cart-item-name">${p.name}</span>
            <span class="mono cart-item-spec">${p.spec} · ${fmtUSD.format(p.usd)} · max ${max}</span>
          </div>
          <div class="qty-ctrl mono">
            <button type="button" data-cart="menos" aria-label="Remove one">−</button>
            <span>${i.qty}</span>
            <button type="button" data-cart="mas" aria-label="Add one">+</button>
          </div>
          <span class="cart-item-price">${fmtUSD.format(p.usd * i.qty)}</span>
          <button class="cart-item-del mono" type="button" data-cart="del" aria-label="Remove">✕</button>
        </div>`;
    }).join("");
    const st = subtotal(), stU = subtotalUSD();
    totalEl.textContent = dual(st, stU);
    if (shipEl) shipEl.textContent = dual(DELIVERY.mxn, DELIVERY.usd);
    if (grandEl) grandEl.textContent = dual(st + DELIVERY.mxn, stU + DELIVERY.usd);
  }

  function add(id, qty) {
    const max = typeof stockDe === "function" ? stockDe(id) : 99;
    if (max <= 0) return;
    const item = cart.find(i => i.id === id);
    if (item) item.qty = Math.min(item.qty + qty, max);
    else cart.push({ id, qty: Math.min(qty, max) });
    save();
    render();
  }

  function open() { drawer.classList.add("open"); overlay.classList.add("open"); }
  function close() { drawer.classList.remove("open"); overlay.classList.remove("open"); }

  function checkoutWhatsApp() {
    if (!CHECKOUT_CONFIG.whatsapp) {
      alert("WhatsApp number is not configured yet.");
      return;
    }
    const lineas = cart.map(i => {
      const p = producto(i.id);
      if (!p) return "";
      return `• ${p.name} ${p.spec} x${i.qty} — ${fmtUSD.format(p.usd * i.qty)}`;
    }).filter(Boolean);
    const st = subtotal(), stU = subtotalUSD();
    const msg = ["ORDER — CANCUNPEPTIDE", "", ...lineas,
                 `• Hotel delivery (2 hrs) — ${dual(DELIVERY.mxn, DELIVERY.usd)}`, "",
                 `TOTAL: ${dual(st + DELIVERY.mxn, stU + DELIVERY.usd)}`, "",
                 "My hotel & room / Airbnb address:", "",
                 "Name:"].join("\n");
    window.open(`https://wa.me/${CHECKOUT_CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`, "_blank", "noopener");
  }

  /* ---------- Events ---------- */
  document.querySelectorAll(".cart-open").forEach(b => b.addEventListener("click", open));
  if (overlay) overlay.addEventListener("click", close);
  const closeBtn = document.getElementById("cart-close");
  if (closeBtn) closeBtn.addEventListener("click", close);

  const waBtn = document.getElementById("cart-whatsapp");
  if (waBtn) waBtn.addEventListener("click", checkoutWhatsApp);

  if (itemsEl) itemsEl.addEventListener("click", e => {
    const btn = e.target.closest("[data-cart]");
    if (!btn) return;
    const id = btn.closest(".cart-item").dataset.id;
    const item = cart.find(i => i.id === id);
    if (!item) return;
    const max = typeof stockDe === "function" ? stockDe(id) : 99;
    if (btn.dataset.cart === "mas") item.qty = Math.min(item.qty + 1, max);
    if (btn.dataset.cart === "menos") item.qty = Math.max(item.qty - 1, 1);
    if (btn.dataset.cart === "del") cart = cart.filter(i => i.id !== id);
    save();
    render();
  });

  document.addEventListener("stock:updated", () => {
    cart = cart.filter(i => (typeof stockDe === "function" ? stockDe(i.id) : 99) > 0);
    cart.forEach(i => {
      const max = typeof stockDe === "function" ? stockDe(i.id) : 99;
      if (i.qty > max) i.qty = max;
    });
    save();
    render();
  });

  // Public API for main.js
  window.PeptinatorCart = { add, open, render };

  render();
})();

// CancunPeptide — catalog render, filters and product sheet (modal), dual currency
(function () {
  const grid = document.getElementById("product-grid");
  const filtersEl = document.getElementById("filters");
  const countEl = document.getElementById("product-count");
  const modal = document.getElementById("product-modal");
  const modalBody = document.getElementById("modal-body");

  const fmtMXN = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 });
  const fmtUSD = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

  let currentProduct = null;
  let qty = 1;

  function priceHTML(p, cls) {
    return `<span class="${cls}">${fmtUSD.format(p.usd)} <em class="mxn">/ ${fmtMXN.format(p.price)}</em></span>`;
  }

  /* ---------- Catalog cards ---------- */
  function cardHTML(p) {
    const note = p.note ? `<p class="card-note">${p.note}</p>` : "";
    return `
      <article class="card" data-cat="${p.cat}" data-id="${p.id}" tabindex="0"
               role="button" aria-label="View ${p.name} details">
        <div class="card-img">
          <span class="card-tag">${CATEGORIES[p.cat] || p.cat}</span>
          <img src="${p.img}" alt="${p.name} ${p.spec} vial" loading="lazy">
        </div>
        <div class="card-body">
          <h3 class="card-name">${p.name}</h3>
          <p class="card-spec">${p.spec}</p>
          ${note}
          <div class="card-meta">
            <span class="card-purity">≥99% HPLC · COA</span>
            ${priceHTML(p, "card-price")}
          </div>
        </div>
      </article>`;
  }

  let catActual = "todos";

  function render(cat) {
    catActual = cat;
    const list = cat === "todos" ? PRODUCTS : PRODUCTS.filter(p => p.cat === cat);
    grid.innerHTML = list.map(cardHTML).join("");
    countEl.textContent = list.length;
  }

  document.addEventListener("stock:updated", () => render(catActual));

  function renderFilters() {
    const cats = ["todos", ...new Set(PRODUCTS.map(p => p.cat))];
    filtersEl.innerHTML = cats.map((c, i) =>
      `<button class="filter-btn${i === 0 ? " active" : ""}" role="tab" data-cat="${c}">${CATEGORIES[c] || c}</button>`
    ).join("");

    filtersEl.addEventListener("click", e => {
      const btn = e.target.closest(".filter-btn");
      if (!btn) return;
      filtersEl.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      render(btn.dataset.cat);
    });
  }

  /* ---------- Product sheet (modal) ---------- */
  function totalHTML() {
    if (!currentProduct) return "";
    return `<span class="modal-total">${fmtUSD.format(currentProduct.usd * qty)} <em class="mxn">/ ${fmtMXN.format(currentProduct.price * qty)}</em></span>`;
  }

  function refreshQty() {
    const q = document.getElementById("qty-value");
    const t = document.getElementById("modal-total-wrap");
    if (q) q.textContent = qty;
    if (t) t.innerHTML = totalHTML();
  }

  function modalHTML(p) {
    const specs = SPECS_COMUNES.map(s => `<li>${s}</li>`).join("");
    const stock = typeof stockDe === "function" ? stockDe(p.id) : 0;
    const stockLinea = stock > 0
      ? `<p class="mono stock-linea">▣ IN STOCK: ${stock} pc${stock === 1 ? "" : "s"}</p>`
      : '<p class="mono stock-linea agotado">▣ OUT OF STOCK — RESTOCK IN PROGRESS</p>';
    const buyBlock = stock <= 0
      ? `<div class="modal-buy">
           ${stockLinea}
           <p class="mono buy-note">// Out of stock right now — message us on WhatsApp to reserve from the next lot.</p>
         </div>`
      : `<div class="modal-buy">
           ${stockLinea}
           <div class="qty-row">
             <span class="mono qty-label">QTY</span>
             <div class="qty-ctrl mono">
               <button type="button" data-action="menos" aria-label="Remove one">−</button>
               <span id="qty-value">${qty}</span>
               <button type="button" data-action="mas" aria-label="Add one">+</button>
             </div>
             <div class="total-wrap mono" id="modal-total-wrap">${totalHTML()}</div>
           </div>
           <div class="buy-actions">
             <button class="btn btn-primary" data-action="agregar">▸ Add to order</button>
             <button class="btn btn-ghost" data-action="coa">Request lot COA</button>
           </div>
           <p class="mono buy-note">// Payment on delivery at your hotel: cash or card. $10 USD flat — 2-hour delivery.</p>
         </div>`;
    return `
      <div class="modal-grid">
        <div class="modal-img">
          <img src="${p.img}" alt="${p.name} ${p.spec} vial">
          <span class="card-tag">${CATEGORIES[p.cat] || p.cat}</span>
        </div>
        <div class="modal-info">
          <h3 class="modal-name">${p.name}</h3>
          <p class="mono modal-spec">CONTENT: ${p.spec} · LYOPHILIZED</p>
          <p class="modal-desc">${p.desc}</p>
          <h4 class="mono modal-sub">// SPECS</h4>
          <ul class="modal-specs">${specs}</ul>
          ${buyBlock}
        </div>
      </div>`;
  }

  function openModal(p) {
    currentProduct = p;
    qty = 1;
    modalBody.innerHTML = modalHTML(p);
    modal.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    modal.classList.remove("open");
    document.body.style.overflow = "";
    currentProduct = null;
  }

  /* ---------- Events ---------- */
  grid.addEventListener("click", e => {
    const card = e.target.closest(".card");
    if (!card) return;
    const p = PRODUCTS.find(x => x.id === card.dataset.id);
    if (p) openModal(p);
  });

  grid.addEventListener("keydown", e => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const card = e.target.closest(".card");
    if (!card) return;
    e.preventDefault();
    const p = PRODUCTS.find(x => x.id === card.dataset.id);
    if (p) openModal(p);
  });

  modal.addEventListener("click", e => {
    if (e.target.closest(".modal-close") || e.target === modal) {
      closeModal();
      return;
    }
    const btn = e.target.closest("[data-action]");
    if (!btn) return;
    const action = btn.dataset.action;
    if (action === "mas") {
      const max = currentProduct && typeof stockDe === "function" ? stockDe(currentProduct.id) : 99;
      qty = Math.min(qty + 1, max);
      refreshQty();
    }
    if (action === "menos") { qty = Math.max(qty - 1, 1); refreshQty(); }
    if (action === "agregar") {
      if (window.PeptinatorCart && currentProduct) {
        window.PeptinatorCart.add(currentProduct.id, qty);
        closeModal();
        window.PeptinatorCart.open();
      }
    }
    if (action === "coa") {
      closeModal();
      document.getElementById("contacto").scrollIntoView({ behavior: "smooth" });
    }
  });

  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && modal.classList.contains("open")) closeModal();
  });

  renderFilters();
  render("todos");
})();

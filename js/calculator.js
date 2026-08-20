// Calculadora de reconstitución de péptidos — PEPTINATOR MX / PEPTIVA
// Matemática estándar de laboratorio: concentración, volumen a extraer, dosis por vial.
(function () {
  const $ = id => document.getElementById(id);
  const selProducto = $("calc-producto");
  const inpMg = $("calc-mg");
  const inpAgua = $("calc-agua");
  const inpDosis = $("calc-dosis");
  const selUnidad = $("calc-unidad-dosis");
  const selJeringa = $("calc-jeringa");
  const outUnidades = $("res-unidades");
  const outMl = $("res-ml");
  const outConc = $("res-conc");
  const outDosisVial = $("res-dosis-vial");
  const fill = $("syr-fill");
  const marker = $("syr-marker");
  const ticks = $("syr-ticks");
  const listaGuardados = $("saved-list");

  const KEY = "peptide_calc_saved";

  // --- catálogo: precargar mg según producto ---
  // Presentaciones disponibles para la calculadora (se combinan con PRODUCTS,
  // sin duplicar nombre+mg). Incluye gramajes que no se venden como producto.
  const CALC_OPCIONES = [
    { name: "Retatrutide", mg: 5 }, { name: "Retatrutide", mg: 10 }, { name: "Retatrutide", mg: 20 },
    { name: "Retatrutide", mg: 30 }, { name: "Retatrutide", mg: 40 },
    { name: "Tirzepatide", mg: 10 }, { name: "Tirzepatide", mg: 15 }, { name: "Tirzepatide", mg: 20 },
    { name: "Tirzepatide", mg: 30 }, { name: "Tirzepatide", mg: 40 }, { name: "Tirzepatide", mg: 60 },
    { name: "Semaglutide", mg: 2 }, { name: "Semaglutide", mg: 5 }, { name: "Semaglutide", mg: 10 },
    { name: "Semaglutide", mg: 15 }, { name: "Semaglutide", mg: 20 },
    { name: "Cagrilintide", mg: 5 }, { name: "Cagrilintide", mg: 10 },
    { name: "CagriSema", mg: 10 },
    { name: "AOD-9604", mg: 2 }, { name: "AOD-9604", mg: 5 }, { name: "AOD-9604", mg: 10 },
    { name: "PT-141", mg: 10 },
    { name: "BPC-157", mg: 5 }, { name: "BPC-157", mg: 10 },
    { name: "TB-500", mg: 5 }, { name: "TB-500", mg: 10 },
    { name: "GHK-Cu", mg: 50 }, { name: "GHK-Cu", mg: 100 },
    { name: "Ipamorelin", mg: 5 }, { name: "Ipamorelin", mg: 10 },
    { name: "CJC-1295 No-DAC", mg: 2 }, { name: "CJC-1295 No-DAC", mg: 5 }, { name: "CJC-1295 No-DAC", mg: 10 },
    { name: "Sermorelin", mg: 5 }, { name: "Sermorelin", mg: 10 }, { name: "Sermorelin", mg: 15 },
    { name: "Tesamorelin", mg: 5 }, { name: "Tesamorelin", mg: 10 },
    { name: "MOTS-c", mg: 10 }, { name: "MOTS-c", mg: 40 },
    { name: "5-Amino-1MQ", mg: 5 }, { name: "5-Amino-1MQ", mg: 10 },
    { name: "KPV", mg: 5 }, { name: "KPV", mg: 10 },
    { name: "Epithalon", mg: 10 }, { name: "Epithalon", mg: 20 }, { name: "Epithalon", mg: 50 },
    { name: "NAD+", mg: 500 }, { name: "NAD+", mg: 1000 },
    { name: "Selank", mg: 5 }, { name: "Selank", mg: 10 },
    { name: "Semax", mg: 5 }, { name: "Semax", mg: 10 },
    { name: "Oxytocin", mg: 5 }, { name: "Oxytocin", mg: 10 },
    { name: "Melanotan 1", mg: 10 },
    { name: "Melanotan 2", mg: 10 },
    { name: "Thymosin Alpha-1", mg: 5 }, { name: "Thymosin Alpha-1", mg: 10 },
    { name: "DSIP", mg: 5 }, { name: "DSIP", mg: 10 },
    { name: "Kisspeptin-10", mg: 5 }, { name: "Kisspeptin-10", mg: 10 },
    { name: "BPC-157 + TB-500", mg: 10 }, { name: "BPC-157 + TB-500", mg: 20 },
    { name: "GLOW", mg: 70 },
    { name: "KLOW", mg: 80 }
  ];

  function cargarProductos() {
    const norm = s => s.toLowerCase().replace(/\s*\(.*?\)\s*/g, "").trim();
    const vistos = new Set();
    const lista = [];
    const agregar = (name, mg) => {
      const key = norm(name) + "|" + mg;
      if (vistos.has(key)) return;
      vistos.add(key);
      lista.push({ name, mg });
    };
    if (typeof PRODUCTS !== "undefined") {
      PRODUCTS.forEach(p => {
        const m = p.spec.match(/([\d.]+)\s*mg/i);
        if (!m) return; // accesorios en mL no aplican
        agregar(p.name, parseFloat(m[1]));
      });
    }
    CALC_OPCIONES.forEach(o => agregar(o.name, o.mg));
    lista.sort((a, b) => a.name.localeCompare(b.name, "es") || a.mg - b.mg);
    lista.forEach(o => {
      const opt = document.createElement("option");
      opt.value = o.mg;
      opt.textContent = `${o.name} ${o.mg} mg`;
      opt.dataset.name = `${o.name} ${o.mg} mg`;
      selProducto.appendChild(opt);
    });
  }

  function num(el) {
    const v = parseFloat(el.value);
    return isNaN(v) || v <= 0 ? null : v;
  }

  function calcular() {
    const mg = num(inpMg);
    const agua = num(inpAgua);
    let dosis = num(inpDosis);
    if (dosis && selUnidad.value === "mg") dosis *= 1000; // a mcg
    if (!mg || !agua || !dosis) {
      outUnidades.textContent = "—";
      outMl.textContent = "—";
      outConc.textContent = "—";
      outDosisVial.textContent = "—";
      fill.style.width = "0%";
      marker.style.left = "0%";
      return null;
    }
    const concMgMl = mg / agua;                    // mg/mL
    const concMcgUl = (mg * 1000) / (agua * 1000); // mcg/µL
    const mlExtraer = dosis / 1000 / concMgMl;
    const unidades = mlExtraer * 100;              // jeringa insulina: 1 mL = 100 UI
    const dosisPorVial = Math.floor((mg * 1000) / dosis);
    const maxU = parseFloat(selJeringa.value) * 100;

    outUnidades.textContent = `${unidades.toFixed(1)} UI`;
    outMl.textContent = `${mlExtraer.toFixed(3)} mL`;
    outConc.textContent = `${concMgMl.toFixed(2)} mg/mL`;
    outDosisVial.textContent = `${dosisPorVial} dosis`;

    const pct = Math.min((unidades / maxU) * 100, 100);
    fill.style.width = pct + "%";
    marker.style.left = pct + "%";
    fill.classList.toggle("over", unidades > maxU);

    // regla de la jeringa
    ticks.innerHTML = "";
    for (let u = 0; u <= maxU; u += maxU / 10) {
      const t = document.createElement("span");
      t.className = "syr-tick";
      t.style.left = (u / maxU) * 100 + "%";
      t.textContent = u % (maxU / 5) === 0 ? String(Math.round(u)) : "";
      ticks.appendChild(t);
    }
    return { mg, agua, dosis, unidades, mlExtraer, concMgMl, dosisPorVial, maxU };
  }

  // --- guardados (localStorage) ---
  function cargarGuardados() {
    let arr = [];
    try { arr = JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) {}
    listaGuardados.innerHTML = arr.length === 0
      ? '<p class="calc-saved-empty">Sin cálculos guardados.</p>'
      : arr.map((s, i) => `
        <div class="calc-saved-item">
          <span><strong>${s.nombre}</strong> — ${s.mg} mg en ${s.agua} mL · dosis ${s.dosis} mcg → <strong>${s.unidades} UI</strong></span>
          <button type="button" data-del="${i}" aria-label="Eliminar">✕</button>
        </div>`).join("");
    listaGuardados.querySelectorAll("[data-del]").forEach(b =>
      b.addEventListener("click", () => {
        arr.splice(parseInt(b.dataset.del, 10), 1);
        localStorage.setItem(KEY, JSON.stringify(arr));
        cargarGuardados();
      }));
  }

  $("calc-guardar").addEventListener("click", () => {
    const r = calcular();
    if (!r) return;
    const opt = selProducto.options[selProducto.selectedIndex];
    const nombre = opt && opt.dataset.name ? opt.dataset.name : `${r.mg} mg`;
    let arr = [];
    try { arr = JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) {}
    arr.unshift({ nombre, mg: r.mg, agua: r.agua, dosis: r.dosis, unidades: r.unidades.toFixed(1) });
    arr = arr.slice(0, 10);
    localStorage.setItem(KEY, JSON.stringify(arr));
    cargarGuardados();
  });

  selProducto.addEventListener("change", () => {
    if (selProducto.value) inpMg.value = selProducto.value;
    calcular();
  });
  [inpMg, inpAgua, inpDosis, selUnidad, selJeringa].forEach(el =>
    el.addEventListener("input", calcular));

  cargarProductos();
  if (!inpAgua.value) inpAgua.value = 2;
  calcular();
  cargarGuardados();
})();

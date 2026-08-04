// Contador de visitas vía Google Apps Script + Sheet propio (JSONP)
// La URL se configura abajo; mientras esté vacía no hace nada.
(function () {
  const APPS_SCRIPT_URL = ""; // <-- pegar la URL de la aplicación web de Apps Script
  if (!APPS_SCRIPT_URL) return;

  const marca = location.hostname.replace("www.", "") || "local";

  window.__visitaCallback = function (data) {
    const el = document.getElementById("visitas");
    if (el && data && typeof data.visitas === "number") {
      el.textContent = " · VISITAS: " + data.visitas;
    }
  };

  const s = document.createElement("script");
  s.src = APPS_SCRIPT_URL + "?m=" + encodeURIComponent(marca) + "&cb=__visitaCallback";
  s.async = true;
  document.body.appendChild(s);
})();

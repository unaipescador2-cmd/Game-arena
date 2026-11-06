/* =========================================================
   GameArena · api.js
   Capa de acceso a la API REST (fetch). Si falla la red, usa demo.js.
   ========================================================= */

"use strict";

/* ---------------------------------------------------------
   Capa de acceso a la API
   --------------------------------------------------------- */
async function api(metodo, ruta, cuerpo) {
  if (!modoDemo) {
    try {
      const opciones = { method: metodo, headers: { "Content-Type": "application/json" } };
      if (cuerpo) opciones.body = JSON.stringify(cuerpo);
      const resp = await fetch(API_URL + ruta, opciones);
      if (!resp.ok) {
        const error = new Error(resp.status === 404 ? "No encontrado" : `Error ${resp.status}`);
        error.estado = resp.status;
        throw error;
      }
      return resp.status === 204 ? null : await resp.json();
    } catch (e) {
      if (e.estado) throw e;           // error HTTP real: se lo pasamos al que llama
      activarModoDemo();               // error de red: no hay API
    }
  }
  await new Promise((r) => setTimeout(r, 250)); // pequeña espera para que se vean los esqueletos
  return demo(metodo, ruta, cuerpo);
}

function activarModoDemo() {
  if (modoDemo) return;
  modoDemo = true;
  const b = $("estadoConexion");
  b.className = "badge rounded-pill text-bg-warning";
  b.innerHTML = '<i class="bi bi-cpu"></i> Modo demo';
  b.title = "No se ha podido conectar con " + API_URL + ". Se usan datos de ejemplo guardados en el navegador.";
  aviso("No hay conexión con la API: se usan datos de ejemplo.", "warning");
}

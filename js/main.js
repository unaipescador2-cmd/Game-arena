/* =========================================================
   GameArena · main.js
   Arranque: tema claro/oscuro y conexión de todos los eventos.
   ========================================================= */

"use strict";

function aplicarTema(tema) {
  document.documentElement.setAttribute("data-bs-theme", tema);
  $("btnTema").innerHTML = `<i class="bi bi-${tema === "dark" ? "sun" : "moon-stars"}"></i>`;
}

/* =========================================================
   Arranque: eventos
   ========================================================= */
document.addEventListener("DOMContentLoaded", async () => {
  aplicarTema("dark");
  $("btnTema").addEventListener("click", () =>
    aplicarTema(document.documentElement.getAttribute("data-bs-theme") === "dark" ? "light" : "dark"));

  // Jugadores
  $("btnNuevoJugador").addEventListener("click", () => abrirFormJugador());
  $("btnCancelarJugador").addEventListener("click", () => { $("panelFormJugador").hidden = true; });
  $("formJugador").addEventListener("submit", guardarJugador);
  $("formBuscarJugador").addEventListener("submit", buscarJugador);
  $("formFiltrarJugadores").addEventListener("submit", (e) => { e.preventDefault(); cargarJugadores($("filtroJugadores").value.trim()); });
  $("btnLimpiarJugadores").addEventListener("click", () => { $("filtroJugadores").value = ""; cargarJugadores(); });
  $("btnCerrarPartJugador").addEventListener("click", () => { $("panelParticipacionesJugador").hidden = true; });
  $("cuerpoJugadores").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-accion]"); if (!b) return;
    const id = Number(b.dataset.id);
    if (b.dataset.accion === "editar") abrirFormJugador(datos.jugadores.find((j) => j.id === id));
    if (b.dataset.accion === "eliminar") eliminarJugador(id);
    if (b.dataset.accion === "part") verParticipacionesJugador(id);
  });

  // Torneos
  $("btnNuevoTorneo").addEventListener("click", () => abrirFormTorneo());
  $("btnCancelarTorneo").addEventListener("click", () => { $("panelFormTorneo").hidden = true; });
  $("formTorneo").addEventListener("submit", guardarTorneo);
  $("formBuscarTorneo").addEventListener("submit", buscarTorneo);
  $("formFiltrarTorneos").addEventListener("submit", (e) => { e.preventDefault(); cargarTorneos($("filtroEstadoTorneo").value); });
  $("btnCerrarPartTorneo").addEventListener("click", () => { $("panelParticipacionesTorneo").hidden = true; });
  $("cuerpoTorneos").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-accion]"); if (!b) return;
    const id = Number(b.dataset.id);
    if (b.dataset.accion === "editar") abrirFormTorneo(datos.torneos.find((t) => t.id === id));
    if (b.dataset.accion === "eliminar") eliminarTorneo(id);
    if (b.dataset.accion === "part") verParticipacionesTorneo(id);
  });

  // Videojuegos
  $("btnNuevoJuego").addEventListener("click", () => {
    $("formJuego").reset(); $("formJuego").classList.remove("was-validated");
    $("panelFormJuego").hidden = false; $("tituloJuego").focus();
  });
  $("btnCancelarJuego").addEventListener("click", () => { $("panelFormJuego").hidden = true; });
  $("formJuego").addEventListener("submit", guardarJuego);
  $("formBuscarJuego").addEventListener("submit", buscarJuego);
  $("formFiltrarJuegos").addEventListener("submit", (e) => { e.preventDefault(); cargarJuegos($("filtroGeneroJuego").value.trim()); });
  $("btnLimpiarJuegos").addEventListener("click", () => { $("filtroGeneroJuego").value = ""; cargarJuegos(); });

  // Cada lista se rellena sola al abrir su pestaña (sin botón «Ver»)
  $("tabJugadores").addEventListener("shown.bs.tab", () => cargarJugadores());
  $("tabTorneos").addEventListener("shown.bs.tab", () => cargarTorneos());
  $("tabVideojuegos").addEventListener("shown.bs.tab", () => cargarJuegos());

  // Carga inicial: la pestaña activa y los datos para las estadísticas
  await cargarSelectorJuegos();
  if (!modoDemo) {
    const b = $("estadoConexion");
    b.className = "badge rounded-pill text-bg-success";
    b.innerHTML = '<i class="bi bi-wifi"></i> API conectada';
  }
  await cargarJugadores();
  try { datos.torneos = await api("GET", "/torneos"); actualizarEstadisticas(); } catch { /* se verá al abrir la pestaña */ }
});

/* =========================================================
   GameArena · utils.js
   Funciones de ayuda: escapar texto, avisos, modales, estadísticas.
   ========================================================= */

"use strict";

/* ---------------------------------------------------------
   Utilidades
   --------------------------------------------------------- */
const $ = (id) => document.getElementById(id);

function escapar(texto) {
  return String(texto ?? "")
    .replaceAll("&", "&amp;").replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function formatearFecha(iso) {
  if (!iso) return "—";
  const [a, m, d] = iso.split("-");
  return `${d}/${m}/${a}`;
}

function aviso(mensaje, tipo = "success") {
  const iconos = { success: "check-circle", danger: "x-octagon", warning: "exclamation-triangle", info: "info-circle" };
  const div = document.createElement("div");
  div.className = `toast align-items-center text-bg-${tipo} border-0`;
  div.setAttribute("role", "status");
  div.innerHTML = `
    <div class="d-flex">
      <div class="toast-body"><i class="bi bi-${iconos[tipo]}"></i> ${escapar(mensaje)}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Cerrar"></button>
    </div>`;
  $("contenedorAvisos").appendChild(div);
  const t = new bootstrap.Toast(div, { delay: 3000 });
  t.show();
  div.addEventListener("hidden.bs.toast", () => div.remove());
}

function filaCargando(tbody, columnas) {
  tbody.innerHTML = Array.from({ length: 3 }, () =>
    `<tr>${"<td><div class='esqueleto'></div></td>".repeat(columnas)}</tr>`).join("");
}

function filaVacia(tbody, columnas, texto, icono = "inbox") {
  tbody.innerHTML = `<tr><td colspan="${columnas}"><div class="vacio"><i class="bi bi-${icono}"></i>${escapar(texto)}</div></td></tr>`;
}

// Modal de confirmación que devuelve una promesa (true / false)
function confirmar(texto) {
  return new Promise((resolver) => {
    $("textoConfirmar").textContent = texto;
    const modalEl = $("modalConfirmar");
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    let aceptado = false;
    const si = () => { aceptado = true; modal.hide(); };
    $("btnConfirmarSi").addEventListener("click", si, { once: true });
    modalEl.addEventListener("hidden.bs.modal", () => {
      $("btnConfirmarSi").removeEventListener("click", si);
      resolver(aceptado);
    }, { once: true });
    modal.show();
  });
}

function mostrarDetalle(titulo, filas) {
  $("tituloDetalle").textContent = titulo;
  $("cuerpoDetalle").innerHTML = `<dl class="row mb-0">${
    filas.map(([k, v]) => `<dt class="col-4">${escapar(k)}</dt><dd class="col-8">${v}</dd>`).join("")
  }</dl>`;
  bootstrap.Modal.getOrCreateInstance($("modalDetalle")).show();
}

/* ---------------------------------------------------------
   Estadísticas (con los datos ya cargados)
   --------------------------------------------------------- */
function animarNumero(el, valor) {
  const inicio = Number(el.textContent) || 0;
  const pasos = 15; let n = 0;
  clearInterval(el._t);
  el._t = setInterval(() => {
    n++;
    el.textContent = Math.round(inicio + (valor - inicio) * (n / pasos));
    if (n >= pasos) clearInterval(el._t);
  }, 20);
}
function actualizarEstadisticas() {
  animarNumero($("datoJugadores"), datos.jugadores.length);
  animarNumero($("datoTorneos"), datos.torneos.length);
  animarNumero($("datoEnCurso"), datos.torneos.filter((t) => t.estado === "EN_CURSO").length);
  animarNumero($("datoJuegos"), datos.videojuegos.length);
}

function nombreJuego(idJuego) {
  return datos.videojuegos.find((v) => v.id === Number(idJuego))?.titulo ?? `#${idJuego}`;
}
function medalla(pos) {
  if (!pos) return '<span class="text-body-secondary">En juego</span>';
  const icono = pos <= 3 ? `<i class="bi bi-trophy-fill medalla-${pos}"></i> ` : "";
  return `<span class="medalla">${icono}${pos}.º</span>`;
}

/* =========================================================
   GameArena · videojuegos.js
   Pestaña Videojuegos: solo listar, buscar, filtrar y crear.
   ========================================================= */

"use strict";

function pintarJuegos(lista, resaltarId) {
  const tbody = $("cuerpoJuegos");
  if (!lista.length) return filaVacia(tbody, 4, "No hay videojuegos que mostrar.", "joystick");
  tbody.innerHTML = lista.map((v, i) => `
    <tr style="animation-delay:${i * 30}ms" class="${v.id === resaltarId ? "resaltada" : ""}">
      <td class="id-celda">${v.id}</td>
      <td class="fw-semibold">${escapar(v.titulo)}</td>
      <td><span class="badge text-bg-secondary">${escapar(v.genero)}</span></td>
      <td>${escapar(v.plataforma)}</td>
    </tr>`).join("");
}

// GET /videojuegos  y  GET /videojuegos?genero=
async function cargarJuegos(genero = "", resaltarId) {
  filaCargando($("cuerpoJuegos"), 4);
  try {
    const ruta = genero ? `/videojuegos?genero=${encodeURIComponent(genero)}` : "/videojuegos";
    const lista = await api("GET", ruta);
    if (!genero) datos.videojuegos = lista;
    pintarJuegos(lista, resaltarId);
    actualizarEstadisticas();
  } catch (e) {
    filaVacia($("cuerpoJuegos"), 4, "Error al cargar los videojuegos: " + e.message, "wifi-off");
  }
}

// POST /videojuegos
async function guardarJuego(ev) {
  ev.preventDefault();
  const f = ev.target;
  if (!f.checkValidity()) { f.classList.add("was-validated"); return; }
  const juego = {
    titulo: $("tituloJuego").value.trim(),
    genero: $("generoJuego").value.trim(),
    plataforma: $("plataformaJuego").value.trim(),
  };
  try {
    const res = await api("POST", "/videojuegos", juego);
    aviso("Videojuego creado.");
    $("panelFormJuego").hidden = true;
    $("filtroGeneroJuego").value = "";
    cargarJuegos("", res?.id);
  } catch (e) { aviso("No se pudo guardar: " + e.message, "danger"); }
}

// GET /videojuegos/{id}
async function buscarJuego(ev) {
  ev.preventDefault();
  const id = $("buscarIdJuego").value;
  if (!id) return;
  try {
    const v = await api("GET", `/videojuegos/${id}`);
    mostrarDetalle(`Videojuego #${v.id}`, [
      ["Título", escapar(v.titulo)],
      ["Género", escapar(v.genero)],
      ["Plataforma", escapar(v.plataforma)],
    ]);
  } catch (e) {
    aviso(e.estado === 404 ? `No existe ningún videojuego con ID ${id}.` : e.message, "warning");
  }
}

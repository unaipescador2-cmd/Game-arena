/* =========================================================
   GameArena · jugadores.js
   Pestaña Jugadores: GET, POST, PUT, DELETE y participaciones.
   ========================================================= */

"use strict";

function pintarJugadores(lista, resaltarId) {
  const tbody = $("cuerpoJugadores");
  if (!lista.length) return filaVacia(tbody, 5, "No hay jugadores que mostrar.", "people");
  tbody.innerHTML = lista.map((j, i) => `
    <tr style="animation-delay:${i * 30}ms" class="${j.id === resaltarId ? "resaltada" : ""}">
      <td class="id-celda">${j.id}</td>
      <td>${escapar(j.nombre)}</td>
      <td class="nick">@${escapar(j.nick)}</td>
      <td>${escapar(j.email)}</td>
      <td class="text-end text-nowrap">
        <button class="btn btn-sm btn-outline-info" data-accion="part" data-id="${j.id}" title="Ver participaciones"><i class="bi bi-trophy"></i></button>
        <button class="btn btn-sm btn-outline-light" data-accion="editar" data-id="${j.id}" title="Editar"><i class="bi bi-pencil"></i></button>
        <button class="btn btn-sm btn-outline-danger" data-accion="eliminar" data-id="${j.id}" title="Eliminar"><i class="bi bi-trash"></i></button>
      </td>
    </tr>`).join("");
}

// GET /jugadores  y  GET /jugadores?nombre=
async function cargarJugadores(filtro = "", resaltarId) {
  filaCargando($("cuerpoJugadores"), 5);
  try {
    const ruta = filtro ? `/jugadores?nombre=${encodeURIComponent(filtro)}` : "/jugadores";
    const lista = await api("GET", ruta);
    if (!filtro) datos.jugadores = lista;
    pintarJugadores(lista, resaltarId);
    actualizarEstadisticas();
  } catch (e) {
    filaVacia($("cuerpoJugadores"), 5, "Error al cargar los jugadores: " + e.message, "wifi-off");
  }
}

function abrirFormJugador(jugador) {
  const f = $("formJugador");
  f.reset(); f.classList.remove("was-validated");
  $("idJugador").value = jugador?.id ?? "";
  $("nombreJugador").value = jugador?.nombre ?? "";
  $("nickJugador").value = jugador?.nick ?? "";
  $("emailJugador").value = jugador?.email ?? "";
  $("tituloFormJugador").textContent = jugador ? `Editar jugador #${jugador.id}` : "Nuevo jugador";
  $("panelFormJugador").hidden = false;
  $("nombreJugador").focus();
}

// POST /jugadores  y  PUT /jugadores/{id}
async function guardarJugador(ev) {
  ev.preventDefault();
  const f = ev.target;
  if (!f.checkValidity()) { f.classList.add("was-validated"); return; }
  const id = $("idJugador").value;
  const jugador = {
    nombre: $("nombreJugador").value.trim(),
    nick: $("nickJugador").value.trim(),
    email: $("emailJugador").value.trim(),
  };
  try {
    const res = id ? await api("PUT", `/jugadores/${id}`, jugador) : await api("POST", "/jugadores", jugador);
    aviso(id ? "Jugador modificado." : "Jugador creado.");
    $("panelFormJugador").hidden = true;
    cargarJugadores("", res?.id ?? Number(id));
  } catch (e) { aviso("No se pudo guardar: " + e.message, "danger"); }
}

// DELETE /jugadores/{id}
async function eliminarJugador(id) {
  const j = datos.jugadores.find((x) => x.id === id);
  if (!(await confirmar(`¿Eliminar al jugador «${j?.nick ?? id}»? Esta acción no se puede deshacer.`))) return;
  try {
    await api("DELETE", `/jugadores/${id}`);
    aviso("Jugador eliminado.");
    cargarJugadores();
  } catch (e) { aviso("No se pudo eliminar: " + e.message, "danger"); }
}

// GET /jugadores/{id}
async function buscarJugador(ev) {
  ev.preventDefault();
  const id = $("buscarIdJugador").value;
  if (!id) return;
  try {
    const j = await api("GET", `/jugadores/${id}`);
    mostrarDetalle(`Jugador #${j.id}`, [
      ["Nombre", escapar(j.nombre)],
      ["Nick", `<span class="nick">@${escapar(j.nick)}</span>`],
      ["Email", escapar(j.email)],
    ]);
  } catch (e) {
    aviso(e.estado === 404 ? `No existe ningún jugador con ID ${id}.` : e.message, "warning");
  }
}

// GET /jugadores/{id}/participaciones
async function verParticipacionesJugador(id) {
  const tbody = $("cuerpoParticipacionesJugador");
  const j = datos.jugadores.find((x) => x.id === id);
  $("tituloParticipacionesJugador").textContent = `Participaciones de @${j?.nick ?? id}`;
  $("panelParticipacionesJugador").hidden = false;
  filaCargando(tbody, 3);
  try {
    const lista = await api("GET", `/jugadores/${id}/participaciones`);
    if (!lista.length) return filaVacia(tbody, 3, "Este jugador aún no ha participado en ningún torneo.", "controller");
    tbody.innerHTML = lista.map((p) => {
      const t = datos.torneos.find((x) => x.id === p.torneoId);
      return `<tr>
        <td>${escapar(t?.nombre ?? `Torneo #${p.torneoId}`)}</td>
        <td>${escapar(t ? nombreJuego(t.videojuegoId) : "—")}</td>
        <td>${medalla(p.posicion)}</td></tr>`;
    }).join("");
    $("panelParticipacionesJugador").scrollIntoView({ behavior: "smooth", block: "nearest" });
  } catch (e) { filaVacia(tbody, 3, "Error: " + e.message, "wifi-off"); }
}

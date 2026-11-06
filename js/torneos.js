/* =========================================================
   GameArena · torneos.js
   Pestaña Torneos: GET, POST, PUT, DELETE, participaciones y selector de videojuegos.
   ========================================================= */

"use strict";

function pintarTorneos(lista, resaltarId) {
  const tbody = $("cuerpoTorneos");
  if (!lista.length) return filaVacia(tbody, 6, "No hay torneos que mostrar.", "trophy");
  tbody.innerHTML = lista.map((t, i) => `
    <tr style="animation-delay:${i * 30}ms" class="${t.id === resaltarId ? "resaltada" : ""}">
      <td class="id-celda">${t.id}</td>
      <td class="fw-semibold">${escapar(t.nombre)}</td>
      <td>${formatearFecha(t.fecha)}</td>
      <td><span class="estado estado-${escapar(t.estado)}">${escapar(t.estado.replace("_", " "))}</span></td>
      <td>${escapar(nombreJuego(t.videojuegoId))}</td>
      <td class="text-end text-nowrap">
        <button class="btn btn-sm btn-outline-info" data-accion="part" data-id="${t.id}" title="Ver participantes"><i class="bi bi-people"></i></button>
        <button class="btn btn-sm btn-outline-light" data-accion="editar" data-id="${t.id}" title="Editar"><i class="bi bi-pencil"></i></button>
        <button class="btn btn-sm btn-outline-danger" data-accion="eliminar" data-id="${t.id}" title="Eliminar"><i class="bi bi-trash"></i></button>
      </td>
    </tr>`).join("");
}

// GET /torneos  y  GET /torneos?estado=
async function cargarTorneos(estado = "", resaltarId) {
  filaCargando($("cuerpoTorneos"), 6);
  try {
    if (!datos.videojuegos.length) await cargarSelectorJuegos();
    const ruta = estado ? `/torneos?estado=${encodeURIComponent(estado)}` : "/torneos";
    const lista = await api("GET", ruta);
    if (!estado) datos.torneos = lista;
    pintarTorneos(lista, resaltarId);
    actualizarEstadisticas();
  } catch (e) {
    filaVacia($("cuerpoTorneos"), 6, "Error al cargar los torneos: " + e.message, "wifi-off");
  }
}

// GET /videojuegos (para el selector del formulario de torneo)
async function cargarSelectorJuegos() {
  try {
    datos.videojuegos = await api("GET", "/videojuegos");
    const sel = $("juegoTorneo");
    const actual = sel.value;
    sel.innerHTML = '<option value=""></option>' + datos.videojuegos
      .map((v) => `<option value="${v.id}">${escapar(v.titulo)}</option>`).join("");
    sel.value = actual;
  } catch (e) { aviso("No se pudieron cargar los videojuegos: " + e.message, "danger"); }
}

async function abrirFormTorneo(torneo) {
  await cargarSelectorJuegos();
  const f = $("formTorneo");
  f.reset(); f.classList.remove("was-validated");
  $("idTorneo").value = torneo?.id ?? "";
  $("nombreTorneo").value = torneo?.nombre ?? "";
  $("fechaTorneo").value = torneo?.fecha ?? "";
  $("estadoTorneo").value = torneo?.estado ?? "ABIERTO";
  $("juegoTorneo").value = torneo?.videojuegoId ?? "";
  $("tituloFormTorneo").textContent = torneo ? `Editar torneo #${torneo.id}` : "Nuevo torneo";
  $("panelFormTorneo").hidden = false;
  $("nombreTorneo").focus();
}

// POST /torneos  y  PUT /torneos/{id}
async function guardarTorneo(ev) {
  ev.preventDefault();
  const f = ev.target;
  if (!f.checkValidity()) { f.classList.add("was-validated"); return; }
  const id = $("idTorneo").value;
  const torneo = {
    nombre: $("nombreTorneo").value.trim(),
    fecha: $("fechaTorneo").value,
    estado: $("estadoTorneo").value,
    videojuegoId: Number($("juegoTorneo").value),
  };
  try {
    const res = id ? await api("PUT", `/torneos/${id}`, torneo) : await api("POST", "/torneos", torneo);
    aviso(id ? "Torneo modificado." : "Torneo creado.");
    $("panelFormTorneo").hidden = true;
    $("filtroEstadoTorneo").value = "";
    cargarTorneos("", res?.id ?? Number(id));
  } catch (e) { aviso("No se pudo guardar: " + e.message, "danger"); }
}

// DELETE /torneos/{id}
async function eliminarTorneo(id) {
  const t = datos.torneos.find((x) => x.id === id);
  if (!(await confirmar(`¿Eliminar el torneo «${t?.nombre ?? id}»?`))) return;
  try {
    await api("DELETE", `/torneos/${id}`);
    aviso("Torneo eliminado.");
    cargarTorneos($("filtroEstadoTorneo").value);
  } catch (e) { aviso("No se pudo eliminar: " + e.message, "danger"); }
}

// GET /torneos/{id}
async function buscarTorneo(ev) {
  ev.preventDefault();
  const id = $("buscarIdTorneo").value;
  if (!id) return;
  try {
    if (!datos.videojuegos.length) await cargarSelectorJuegos();
    const t = await api("GET", `/torneos/${id}`);
    mostrarDetalle(`Torneo #${t.id}`, [
      ["Nombre", escapar(t.nombre)],
      ["Fecha", formatearFecha(t.fecha)],
      ["Estado", `<span class="estado estado-${escapar(t.estado)}">${escapar(t.estado.replace("_", " "))}</span>`],
      ["Videojuego", escapar(nombreJuego(t.videojuegoId))],
    ]);
  } catch (e) {
    aviso(e.estado === 404 ? `No existe ningún torneo con ID ${id}.` : e.message, "warning");
  }
}

// GET /torneos/{id}/participaciones
async function verParticipacionesTorneo(id) {
  const tbody = $("cuerpoParticipacionesTorneo");
  const t = datos.torneos.find((x) => x.id === id);
  $("tituloParticipacionesTorneo").textContent = `Participantes de «${t?.nombre ?? id}»`;
  $("panelParticipacionesTorneo").hidden = false;
  filaCargando(tbody, 3);
  try {
    if (!datos.jugadores.length) datos.jugadores = await api("GET", "/jugadores");
    const lista = await api("GET", `/torneos/${id}/participaciones`);
    if (!lista.length) return filaVacia(tbody, 3, "Todavía no hay jugadores inscritos.", "person-plus");
    lista.sort((a, b) => (a.posicion ?? 99) - (b.posicion ?? 99));
    tbody.innerHTML = lista.map((p) => {
      const j = datos.jugadores.find((x) => x.id === p.jugadorId);
      return `<tr>
        <td>${escapar(j?.nombre ?? `Jugador #${p.jugadorId}`)}</td>
        <td class="nick">${j ? "@" + escapar(j.nick) : "—"}</td>
        <td>${medalla(p.posicion)}</td></tr>`;
    }).join("");
    $("panelParticipacionesTorneo").scrollIntoView({ behavior: "smooth", block: "nearest" });
  } catch (e) { filaVacia(tbody, 3, "Error: " + e.message, "wifi-off"); }
}

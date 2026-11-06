/* =========================================================
   GameArena · demo.js
   Modo demo: simula la API en memoria cuando el backend no responde.
   ========================================================= */

"use strict";

/* ---------------------------------------------------------
   Modo demo: simula la API en memoria
   --------------------------------------------------------- */
function datosIniciales() {
  return {
    videojuegos: [
      { id: 1, titulo: "Valorant", genero: "Shooter", plataforma: "PC" },
      { id: 2, titulo: "League of Legends", genero: "MOBA", plataforma: "PC" },
      { id: 3, titulo: "EA Sports FC 26", genero: "Deportes", plataforma: "PS5" },
      { id: 4, titulo: "Street Fighter 6", genero: "Lucha", plataforma: "PS5" },
      { id: 5, titulo: "Fortnite", genero: "Battle Royale", plataforma: "Multiplataforma" },
    ],
    jugadores: [
      { id: 1, nombre: "Lucía Martín", nick: "LuMa", email: "lucia@arena.es" },
      { id: 2, nombre: "Hugo Sánchez", nick: "HugoX", email: "hugo@arena.es" },
      { id: 3, nombre: "Sara Gómez", nick: "Sarix", email: "sara@arena.es" },
      { id: 4, nombre: "Pablo Ruiz", nick: "P4blo", email: "pablo@arena.es" },
      { id: 5, nombre: "Marta López", nick: "MartaGG", email: "marta@arena.es" },
    ],
    torneos: [
      { id: 1, nombre: "Copa Valdemora", fecha: "2026-11-20", estado: "ABIERTO", videojuegoId: 1 },
      { id: 2, nombre: "Liga MOBA Otoño", fecha: "2026-10-15", estado: "EN_CURSO", videojuegoId: 2 },
      { id: 3, nombre: "Gran Final FC", fecha: "2026-06-10", estado: "FINALIZADO", videojuegoId: 3 },
      { id: 4, nombre: "Combo Masters", fecha: "2026-05-02", estado: "FINALIZADO", videojuegoId: 4 },
    ],
    participaciones: [
      { jugadorId: 1, torneoId: 2, posicion: null },
      { jugadorId: 2, torneoId: 2, posicion: null },
      { jugadorId: 1, torneoId: 3, posicion: 2 },
      { jugadorId: 3, torneoId: 3, posicion: 1 },
      { jugadorId: 4, torneoId: 3, posicion: 3 },
      { jugadorId: 5, torneoId: 4, posicion: 1 },
      { jugadorId: 2, torneoId: 4, posicion: 2 },
    ],
  };
}

let bdDemo = null; // datos de ejemplo en memoria (se reinician al recargar)
function leerDemo() {
  if (!bdDemo) bdDemo = datosIniciales();
  return bdDemo;
}
function guardarDemo(bd) { bdDemo = bd; }

function demo(metodo, rutaCompleta, cuerpo) {
  const bd = leerDemo();
  const [ruta, consulta = ""] = rutaCompleta.split("?");
  const params = new URLSearchParams(consulta);
  const [, coleccion, idTexto, sub] = ruta.split("/");
  const id = idTexto ? Number(idTexto) : null;
  const lista = bd[coleccion];
  const noEncontrado = () => { const e = new Error("No encontrado"); e.estado = 404; throw e; };
  if (!lista) noEncontrado();

  // Participaciones
  if (sub === "participaciones") {
    if (!lista.some((x) => x.id === id)) noEncontrado();
    const campo = coleccion === "jugadores" ? "jugadorId" : "torneoId";
    return bd.participaciones.filter((p) => p[campo] === id);
  }

  switch (metodo) {
    case "GET": {
      if (id) return lista.find((x) => x.id === id) || noEncontrado();
      let res = [...lista];
      const nombre = params.get("nombre")?.toLowerCase();
      if (nombre) res = res.filter((j) => j.nombre.toLowerCase().includes(nombre) || j.nick.toLowerCase().includes(nombre));
      const estado = params.get("estado");
      if (estado) res = res.filter((t) => t.estado === estado);
      const genero = params.get("genero")?.toLowerCase();
      if (genero) res = res.filter((v) => v.genero.toLowerCase().includes(genero));
      return res;
    }
    case "POST": {
      const nuevo = { ...cuerpo, id: Math.max(0, ...lista.map((x) => x.id)) + 1 };
      lista.push(nuevo); guardarDemo(bd); return nuevo;
    }
    case "PUT": {
      const i = lista.findIndex((x) => x.id === id);
      if (i < 0) noEncontrado();
      lista[i] = { ...cuerpo, id }; guardarDemo(bd); return lista[i];
    }
    case "DELETE": {
      const i = lista.findIndex((x) => x.id === id);
      if (i < 0) noEncontrado();
      lista.splice(i, 1);
      const campo = coleccion === "jugadores" ? "jugadorId" : "torneoId";
      bd.participaciones = bd.participaciones.filter((p) => p[campo] !== id);
      guardarDemo(bd); return null;
    }
  }
}

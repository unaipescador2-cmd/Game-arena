/* =========================================================
   GameArena · config.js
   Configuración y estado compartido. Cambia aquí la URL del backend.
   ========================================================= */

"use strict";

// Cambia esta URL por la de tu API real
const API_URL = "http://localhost:8080/api";

let modoDemo = false;

// Cache de datos para pintar nombres y estadísticas
const datos = { jugadores: [], torneos: [], videojuegos: [] };

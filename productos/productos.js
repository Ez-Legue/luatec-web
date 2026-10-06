/* =========================================================
   LUATEC · LISTA DE PRODUCTOS
   ---------------------------------------------------------
   Este es el ÚNICO archivo que tenés que tocar para agregar,
   cambiar o sacar productos. La página los muestra sola.

   Cada producto va entre { } y separado del siguiente con una coma.
   Copiá un bloque, pegalo abajo del último y cambiá los datos.

   Campos:
     nombre       → Título del producto
     categoria    → Accesorios, Hogar, Organización, Técnico (o una nueva)
     descripcion  → Una o dos frases
     material     → Ej: "PLA · 2 colores"
     precio       → Solo el número, sin $ ni puntos (ej: 3500).
                    Si es a cotizar, poné null
     desde        → true = muestra "Desde $..."; false = precio exacto
     imagen       → Nombre del archivo dentro de productos/imagenes/
     nuevo        → true = muestra la etiqueta "NUEVO"
     visible      → false = lo oculta sin borrarlo
   ========================================================= */

window.LUATEC_PRODUCTOS = [
  {
    nombre: "Llaveros personalizados",
    categoria: "Accesorios",
    descripcion: "Nombres, logos o formas a medida. Ideales para regalos, eventos y merchandising.",
    material: "PLA · 2 colores",
    precio: 3500,
    desde: true,
    imagen: "llavero.svg",
    nuevo: false,
    visible: true
  },
  {
    nombre: "Objetos de decoración",
    categoria: "Hogar",
    descripcion: "Floreros, portamacetas y piezas decorativas con geometrías imposibles de moldear a mano.",
    material: "PETG · resistente",
    precio: 9800,
    desde: true,
    imagen: "decoracion.svg",
    nuevo: false,
    visible: true
  },
  {
    nombre: "Organizadores a medida",
    categoria: "Organización",
    descripcion: "Cajas modulares y separadores diseñados para el espacio exacto que tenés disponible.",
    material: "PLA+ · modular",
    precio: 7200,
    desde: true,
    imagen: "organizador.svg",
    nuevo: false,
    visible: true
  },
  {
    nombre: "Piezas y prototipos",
    categoria: "Técnico",
    descripcion: "Repuestos, soportes y prototipos funcionales para proyectos personales o de empresa.",
    material: "ABS · alta resistencia",
    precio: null,
    desde: false,
    imagen: "tecnico.svg",
    nuevo: false,
    visible: true
  },
  {
    nombre: "Lámpara luna",
    categoria: "Hogar",
    descripcion: "EJEMPLO de producto nuevo: cambiá estos datos por tu próximo lanzamiento.",
    material: "PLA blanco · LED cálido",
    precio: 18500,
    desde: false,
    imagen: "lampara.svg",
    nuevo: true,
    visible: true
  }
];

/* =========================================================
   LUATEC · LISTA DE PRODUCTOS
   ---------------------------------------------------------
   Este es el ÚNICO archivo que tenés que tocar para agregar,
   cambiar o sacar productos. La tienda se arma sola.

   Cada producto va entre { } y separado del siguiente con una coma.
   Copiá un bloque, pegalo abajo del último y cambiá los datos.

   Campos:
     nombre        → Título del producto
     categoria     → Ej: Accesorios, Hogar, Organización, Técnico (o una nueva)
     descripcion   → Una o dos frases
     material      → Ej: "PLA · 2 colores"
     medidas       → Opcional. Ej: "5 x 3 cm"
     precio        → Solo el número, sin $ ni puntos (ej: 3500).
                     Si es a cotizar, poné null
     desde         → true = muestra "Desde $..."; false = precio exacto
     fotos         → Lista de fotos dentro de productos/imagenes/
                     La primera es la principal. Ej: ["mate-1.jpg", "mate-2.jpg"]
     colores       → Colores disponibles, con los nombres de la lista
                     LUATEC_COLORES de abajo. Ej: ["Negro", "Blanco", "Azul"]
                     Dejalo vacío [] si el producto no se elige por color.
     personalizable→ true = el cliente puede escribir un nombre o texto
     nuevo         → true = etiqueta "NUEVO"
     destacado     → true = aparece primero y en la portada
     visible       → false = lo oculta sin borrarlo
   ========================================================= */

window.LUATEC_PRODUCTOS = [
  {
    nombre: "Llaveros personalizados",
    categoria: "Accesorios",
    descripcion: "Nombres, logos o formas a medida. Ideales para regalos, eventos y merchandising.",
    material: "PLA · 2 colores",
    medidas: "Aprox. 5 cm",
    precio: 3500,
    desde: true,
    fotos: ["llavero.svg"],
    colores: ["Negro", "Blanco", "Azul", "Rojo", "Rosa", "Verde"],
    personalizable: true,
    nuevo: false,
    destacado: true,
    visible: true
  },
  {
    nombre: "Lámpara luna",
    categoria: "Hogar",
    descripcion: "EJEMPLO de producto nuevo: cambiá estos datos por tu próximo lanzamiento.",
    material: "PLA blanco · LED cálido",
    medidas: "",
    precio: 18500,
    desde: false,
    fotos: ["lampara.svg"],
    colores: ["Blanco"],
    personalizable: false,
    nuevo: true,
    destacado: true,
    visible: true
  },
  {
    nombre: "Objetos de decoración",
    categoria: "Hogar",
    descripcion: "Floreros, portamacetas y piezas decorativas con geometrías imposibles de moldear a mano.",
    material: "PETG · resistente",
    medidas: "",
    precio: 9800,
    desde: true,
    fotos: ["decoracion.svg"],
    colores: ["Blanco", "Negro", "Gris", "Madera"],
    personalizable: false,
    nuevo: false,
    destacado: false,
    visible: true
  },
  {
    nombre: "Organizadores a medida",
    categoria: "Organización",
    descripcion: "Cajas modulares y separadores diseñados para el espacio exacto que tenés disponible.",
    material: "PLA+ · modular",
    medidas: "A medida",
    precio: 7200,
    desde: true,
    fotos: ["organizador.svg"],
    colores: ["Negro", "Blanco", "Gris"],
    personalizable: false,
    nuevo: false,
    destacado: false,
    visible: true
  },
  {
    nombre: "Piezas y prototipos",
    categoria: "Técnico",
    descripcion: "Repuestos, soportes y prototipos funcionales para proyectos personales o de empresa.",
    material: "ABS · alta resistencia",
    medidas: "A medida",
    precio: null,
    desde: false,
    fotos: ["tecnico.svg"],
    colores: [],
    personalizable: false,
    nuevo: false,
    destacado: false,
    visible: true
  }
];

/* ---------------------------------------------------------
   Colores: nombre → color que se ve en la muestra (círculo).
   Si usás un color nuevo, agregalo acá con su código.
   --------------------------------------------------------- */
window.LUATEC_COLORES = {
  "Negro":        "#16181d",
  "Blanco":       "#f7f7f5",
  "Gris":         "#8b919c",
  "Rojo":         "#d62828",
  "Azul":         "#1b4f91",
  "Celeste":      "#7cc4ff",
  "Verde":        "#2a9d55",
  "Amarillo":     "#f4c430",
  "Naranja":      "#f77f00",
  "Rosa":         "#f4a6c4",
  "Violeta":      "#7b4fbf",
  "Dorado":       "#c9a227",
  "Plateado":     "#c0c4cc",
  "Madera":       "#a0703c",
  "Transparente": "linear-gradient(135deg, #ffffff 0 45%, #d7e6f7 45% 55%, #ffffff 55%)",
  "Multicolor":   "conic-gradient(#d62828, #f4c430, #2a9d55, #1b4f91, #7b4fbf, #d62828)"
};

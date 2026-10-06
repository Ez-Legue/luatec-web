# LUATEC Web 3D · Cómo está armada y cómo agregar productos

## 1. Cómo usar esta carpeta

1. Descomprimí `luatec-web-3d.zip` donde quieras (por ejemplo en el Escritorio).
2. Entrá a la carpeta `luatec-web-3d` y abrí `index.html` con doble clic. Ya funciona sola, no necesita nada más.
3. Tu carpeta vieja `luatec` queda intacta, por si querés comparar o volver atrás.

## 2. Estructura de carpetas

```
luatec-web-3d/
├── index.html                  ← La página (inicio, nosotros, proceso, catálogo, contacto)
├── LEEME.md                    ← Este instructivo
├── assets/
│   ├── img/
│   │   ├── logo.png            ← Tu logo azul (arriba)
│   │   └── logo-blanco.png     ← Tu logo en blanco (pie de página)
│   ├── css/
│   │   ├── estilos.css         ← Colores, botones, secciones y pie
│   │   └── luatec-3d.css       ← Tipografía, efectos 3D y tarjetas de productos
│   └── js/
│       ├── main.js             ← Menú del celular y animaciones al bajar
│       ├── luatec-3d.js        ← La burbuja de vidrio 3D del inicio
│       ├── catalogo.js         ← Arma el catálogo solo
│       └── vendor/three.min.js ← Motor 3D (no tocar)
├── musica/
│   ├── canciones.js            ← La lista de temas del reproductor
│   ├── luatec-lofi.mp3         ← "Tarde tranquila" (lo-fi)
│   ├── luatec-jazz.mp3         ← "Café del taller" (jazz)
│   ├── luatec-pop.mp3          ← "Brillo" (pop)
│   ├── luatec-techno.mp3       ← "Capa por capa" (techno)
│   └── luatec-ambiente.mp3     ← "Capa cero" (ambiente)
└── productos/                  ← ★ ACÁ TRABAJÁS VOS
    ├── productos.js            ← La lista de productos con precios
    └── imagenes/               ← Las fotos de cada producto
```

**Para el día a día solo vas a tocar la carpeta `productos/`.**

## 3. Agregar un producto nuevo (paso a paso)

**Paso 1: la foto.**
Sacale una foto al producto (ideal: cuadrada, fondo liso, 800×800 px o más). Guardala dentro de `productos/imagenes/` con un nombre simple, **sin espacios ni tildes**, por ejemplo `porta-celular.jpg`.

**Paso 2: abrí la lista.**
Hacé clic derecho en `productos/productos.js` → *Abrir con* → **Bloc de notas** (o VS Code si lo tenés).

**Paso 3: copiá un producto.**
Buscá el último bloque, que empieza con `{` y termina con `}`. Copialo entero.

**Paso 4: pegalo y cambiá los datos.**
Poné una **coma** después del `}` del último producto y pegá el bloque nuevo abajo. Queda así:

```js
  {
    nombre: "Lámpara luna",
    ...
    visible: true
  },                                   ← esta coma es importante
  {
    nombre: "Porta celular articulado",
    categoria: "Accesorios",
    descripcion: "Soporte regulable para escritorio, entra cualquier celular.",
    material: "PETG · negro mate",
    precio: 6500,
    desde: false,
    imagen: "porta-celular.jpg",
    nuevo: true,
    visible: true
  }
];
```

**Paso 5: guardá** (Ctrl + S) y recargá la página en el navegador (F5). El producto aparece solo, con su foto, precio y botón de consulta por WhatsApp.

### Qué significa cada dato

| Dato | Qué poner | Ejemplo |
|---|---|---|
| `nombre` | Nombre del producto, entre comillas | `"Llavero con nombre"` |
| `categoria` | Accesorios, Hogar, Organización, Técnico, o una nueva (se crea el filtro solo) | `"Hogar"` |
| `descripcion` | Una o dos frases, entre comillas | `"Ideal para regalar."` |
| `material` | Material y detalle | `"PLA · 2 colores"` |
| `precio` | Solo el número, **sin $ ni puntos** | `12500` |
| | Si es a cotizar | `null` |
| `desde` | `true` muestra "Desde $…", `false` muestra el precio exacto | `true` |
| `imagen` | Nombre exacto del archivo en `productos/imagenes/` | `"llavero.jpg"` |
| `nuevo` | `true` le pone la etiqueta brillante **NUEVO** | `true` |
| `visible` | `false` lo oculta sin borrarlo (por ejemplo, sin stock) | `false` |

## 4. Otras tareas comunes

- **Cambiar un precio:** buscá el producto en `productos.js`, cambiá el número de `precio`, guardá y recargá.
- **Ocultar un producto:** cambiá `visible: true` por `visible: false`.
- **Borrar un producto:** borrá su bloque `{ ... }` entero y fijate que no quede una coma de más antes del `];`.
- **Cambiar el número de WhatsApp de los botones:** en `assets/js/catalogo.js`, línea `var WHATSAPP = '5491100000000';` (sin +, sin espacios).
- **Música:** el reproductor de abajo a la derecha tiene un botón para reproducir o pausar, uno (☰) para elegir el tema de una lista y otro (⏭) para pasar al siguiente. Nunca arranca solo. Los cinco temas que vienen (lo-fi, jazz, pop, techno y ambiente) son originales, hechos para LUATEC, así que no tienen derechos de autor de terceros.
- **Agregar una canción:** copiá el MP3 en la carpeta `musica/` (nombre sin espacios ni tildes) y sumá una línea en `musica/canciones.js`, por ejemplo: `{ titulo: "Mi tema", estilo: "Rock", archivo: "mi-tema.mp3" },`
- **Cambiar el logo:** reemplazá `assets/img/logo.png` (y `logo-blanco.png` para el pie) por los nuevos, con el mismo nombre.
- **Cambiar la palabra detrás de la burbuja 3D:** en `assets/js/luatec-3d.js`, línea `var TEXTO_FONDO = 'LUATEC';`.

## 5. Si algo no aparece

| Problema | Solución |
|---|---|
| No aparece ningún producto | Casi siempre es una coma o comilla faltante en `productos.js`. Revisá el último producto que agregaste. |
| Aparece el producto pero sin foto | El nombre en `imagen` tiene que ser **idéntico** al del archivo, incluida la extensión (`.jpg`, `.png`, `.webp`). |
| El precio sale raro | En `precio` va solo el número: `9800`, no `"$9.800"`. |
| No se ve la burbuja 3D | El navegador no soporta 3D (muy raro); en ese caso se muestra una versión animada más simple automáticamente. |

**Tip:** si te trabás, mandame la foto, el nombre y el precio del producto nuevo y te paso el bloque listo para pegar.

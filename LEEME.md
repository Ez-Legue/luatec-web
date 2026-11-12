# LUATEC Web 3D · Cómo está armada y cómo agregar productos

## 1. Cómo usar esta carpeta

1. Descomprimí `luatec-web-3d.zip` donde quieras (por ejemplo en el Escritorio).
2. Entrá a la carpeta `luatec-web-3d` y abrí `index.html` con doble clic. Ya funciona sola, no necesita nada más.
3. Tu carpeta vieja `luatec` queda intacta, por si querés comparar o volver atrás.

## 2. Estructura de carpetas

```
luatec-web-3d/
├── index.html                  ← La página (portada, tienda, cómo comprar, a medida, preguntas)
├── LEEME.md                    ← Este instructivo
├── assets/
│   ├── img/
│   │   ├── logo.png            ← Tu logo azul (arriba)
│   │   └── logo-blanco.png     ← Tu logo en blanco (pie de página)
│   ├── css/
│   │   ├── estilos.css         ← Colores, botones, secciones y pie
│   │   ├── luatec-3d.css       ← Tipografía y burbuja 3D
│   │   └── tienda.css          ← Tienda, ficha de producto y carrito
│   └── js/
│       ├── main.js             ← Menú del celular y animaciones al bajar
│       ├── luatec-3d.js        ← La burbuja de vidrio 3D del inicio
│       ├── config.js           ← ★ Tu WhatsApp y tu dirección
│       ├── tienda.js           ← Arma la tienda y el carrito solos (no hace falta tocarlo)
│       ├── presupuesto.js      ← Formulario "A medida"
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
    material: "PETG",
    medidas: "12 x 8 cm",
    precio: 6500,
    desde: false,
    fotos: ["porta-celular.jpg", "porta-celular-2.jpg"],
    colores: ["Negro", "Blanco", "Rojo"],
    personalizable: false,
    nuevo: true,
    destacado: false,
    visible: true
  }
];
```

**Paso 5: guardá** (Ctrl + S) y recargá la página en el navegador (F5). El producto aparece solo, con su foto, precio colores y botón para agregar al carrito.

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
| `medidas` | Opcional | `"5 x 3 cm"` |
| `fotos` | Archivos en `productos/imagenes/`, la primera es la principal | `["llavero.jpg", "llavero-2.jpg"]` |
| `colores` | Colores disponibles (nombres de la lista `LUATEC_COLORES`, al final del archivo). `[]` si no se elige color | `["Negro", "Azul"]` |
| `personalizable` | `true` deja que el cliente escriba un nombre o texto | `true` |
| `destacado` | `true` lo muestra primero con la etiqueta "Más pedido" | `true` |
| `nuevo` | `true` le pone la etiqueta brillante **NUEVO** | `true` |
| `visible` | `false` lo oculta sin borrarlo (por ejemplo, sin stock) | `false` |

## 4. Otras tareas comunes

- **Cambiar un precio:** buscá el producto en `productos.js`, cambiá el número de `precio`, guardá y recargá.
- **Ocultar un producto:** cambiá `visible: true` por `visible: false`.
- **Borrar un producto:** borrá su bloque `{ ... }` entero y fijate que no quede una coma de más antes del `];`.
- **Cambiar el número de WhatsApp:** en `assets/js/config.js`, campo `whatsapp` (con 549, sin +, sin espacios). Cambia el carrito y todos los botones.
- **Un color nuevo:** sumalo a `LUATEC_COLORES` al final de `productos.js` con su código, por ejemplo `"Turquesa": "#30c5c0",`.
- **Compartir un producto:** en la ficha está el botón "Copiar link de este producto". Ese link abre la web directo en ese producto (sirve para Instagram o el catálogo de WhatsApp).
- **Música:** el reproductor de abajo a la izquierda tiene un botón para reproducir o pausar, uno (☰) para elegir el tema de una lista y otro (⏭) para pasar al siguiente. Nunca arranca solo. Los cinco temas que vienen (lo-fi, jazz, pop, techno y ambiente) son originales, hechos para LUATEC, así que no tienen derechos de autor de terceros.
- **Agregar una canción:** copiá el MP3 en la carpeta `musica/` (nombre sin espacios ni tildes) y sumá una línea en `musica/canciones.js`, por ejemplo: `{ titulo: "Mi tema", estilo: "Rock", archivo: "mi-tema.mp3" },`
- **Cambiar el logo:** reemplazá `assets/img/logo.png` (y `logo-blanco.png` para el pie) por los nuevos, con el mismo nombre.
- **Cambiar la palabra detrás de la burbuja 3D:** en `assets/js/luatec-3d.js`, línea `var TEXTO_FONDO = 'LUATEC';`.

## 5. Si algo no aparece

| Problema | Solución |
|---|---|
| No aparece ningún producto | Casi siempre es una coma o comilla faltante en `productos.js`. Revisá el último producto que agregaste. |
| Aparece el producto pero sin foto | El nombre en `fotos` tiene que ser **idéntico** al del archivo, incluida la extensión (`.jpg`, `.png`, `.webp`). |
| El precio sale raro | En `precio` va solo el número: `9800`, no `"$9.800"`. |
| No se ve la burbuja 3D | El navegador no soporta 3D (muy raro); en ese caso se muestra una versión animada más simple automáticamente. |

**Tip:** si te trabás, mandame la foto, el nombre y el precio del producto nuevo y te paso el bloque listo para pegar.


## Cómo funciona el carrito (pedido por WhatsApp)

La web **no cobra**. El cliente:
1. Elige productos, color, cantidad y (si es personalizable) el texto.
2. Pone su nombre y si retira en Ciudad Evita o quiere envío (con su localidad).
3. Toca **Enviar pedido por WhatsApp**: se abre WhatsApp con el pedido escrito y dirigido a tu número. Solo tiene que tocar enviar.

Te llega algo así:

```
¡Hola LUATEC! Quiero hacer este pedido (LT-4SN1K):

• 2 x Llaveros personalizados (color Azul, texto "Sofi") — desde $7.000
• 1 x Lámpara luna (color Blanco) — $18.500

Total estimado: $18.500
Entrega: envío a Morón

Soy Juan Pérez. ¡Gracias!
```

Después vos le confirmás stock, colores, envío y forma de pago. Los productos con `precio: null` se pueden sumar al pedido como "a cotizar" y no suman al total.

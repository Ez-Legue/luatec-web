/* =========================================================
   LUATEC · Catálogo automático
   ---------------------------------------------------------
   Lee la lista de productos/productos.js y arma las tarjetas.
   No hace falta tocar este archivo para agregar productos.
   ========================================================= */
(function () {
  'use strict';

  var WHATSAPP = '5491100000000'; // tu número, sin + ni espacios
  var CARPETA_IMAGENES = (document.body.getAttribute('data-raiz') || '') + 'productos/imagenes/';

  var grilla = document.getElementById('catalogo');
  var filtros = document.getElementById('catalogoFiltros');
  if (!grilla) return;

  var productos = (window.LUATEC_PRODUCTOS || []).filter(function (p) {
    return p && p.visible !== false;
  });

  if (!productos.length) {
    grilla.innerHTML = '<p class="catalogo__vacio">Pronto vas a ver nuestros productos acá.</p>';
    return;
  }

  // ---------- Filtros por categoría ----------
  var categorias = ['Todos'];
  productos.forEach(function (p) {
    if (p.categoria && categorias.indexOf(p.categoria) === -1) categorias.push(p.categoria);
  });

  if (filtros) {
    filtros.innerHTML = categorias.map(function (c, i) {
      return '<button type="button" class="chip' + (i === 0 ? ' is-active' : '') + '" data-cat="' + esc(c) + '">' + esc(c) + '</button>';
    }).join('');
    filtros.addEventListener('click', function (e) {
      var b = e.target.closest('.chip');
      if (!b) return;
      filtros.querySelectorAll('.chip').forEach(function (x) { x.classList.remove('is-active'); });
      b.classList.add('is-active');
      pintar(b.getAttribute('data-cat'));
    });
  }

  pintar('Todos');

  function pintar(cat) {
    var lista = cat === 'Todos' ? productos : productos.filter(function (p) { return p.categoria === cat; });
    grilla.innerHTML = lista.map(tarjeta).join('');
    activarTilt();
  }

  function tarjeta(p, i) {
    var precio = (p.precio === null || p.precio === undefined || p.precio === '')
      ? 'A cotizar'
      : (p.desde ? 'Desde ' : '') + '$' + Number(p.precio).toLocaleString('es-AR');
    var msg = encodeURIComponent('Hola LUATEC! Me interesa: ' + p.nombre);
    return '' +
      '<article class="prod3d" style="--i:' + i + '">' +
        '<div class="prod3d__media">' +
          (p.nuevo ? '<span class="prod3d__badge">Nuevo</span>' : '') +
          '<img src="' + CARPETA_IMAGENES + esc(p.imagen || '') + '" alt="' + esc(p.nombre) + '" loading="lazy" ' +
            'onerror="this.onerror=null;this.src=\'' + CARPETA_IMAGENES + 'sin-imagen.svg\'">' +
        '</div>' +
        '<div class="prod3d__body">' +
          '<p class="prod3d__cat">' + esc(p.categoria || '') + '</p>' +
          '<h3 class="prod3d__title">' + esc(p.nombre) + '</h3>' +
          '<p class="prod3d__desc">' + esc(p.descripcion || '') + '</p>' +
          '<div class="prod3d__meta">' +
            '<span>' + esc(p.material || '') + '</span>' +
            '<strong class="prod3d__price">' + precio + '</strong>' +
          '</div>' +
          '<a class="prod3d__cta" href="https://wa.me/' + WHATSAPP + '?text=' + msg + '" target="_blank" rel="noopener noreferrer">Consultar</a>' +
        '</div>' +
      '</article>';
  }

  // Inclinación 3D de la tarjeta al pasar el mouse
  function activarTilt() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    grilla.querySelectorAll('.prod3d').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        card.style.setProperty('--rx', (-y * 12).toFixed(2) + 'deg');
        card.style.setProperty('--ry', (x * 14).toFixed(2) + 'deg');
        card.style.setProperty('--mx', ((x + 0.5) * 100).toFixed(0) + '%');
        card.style.setProperty('--my', ((y + 0.5) * 100).toFixed(0) + '%');
      });
      card.addEventListener('pointerleave', function () {
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
      });
    });
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
})();

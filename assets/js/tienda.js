/* =========================================================
   LUATEC · Tienda (catálogo, ficha de producto y carrito)
   ---------------------------------------------------------
   Lee productos/productos.js, arma la tienda y el carrito.
   Al confirmar, abre WhatsApp con el pedido ya escrito y
   dirigido a tu número (assets/js/config.js).
   La web no cobra nada: el pago lo coordinás por WhatsApp.
   No hace falta tocar este archivo para agregar productos.
   ========================================================= */
(function () {
  'use strict';

  var CFG = window.LUATEC_CONFIG || {};
  var COLORES = window.LUATEC_COLORES || {};
  var IMG = 'productos/imagenes/';
  var SIN_IMAGEN = IMG + 'sin-imagen.svg';
  var CLAVE = 'luatec-carrito-v2';

  // ---------- Productos ----------
  var productos = (window.LUATEC_PRODUCTOS || [])
    .filter(function (p) { return p && p.nombre && p.visible !== false; })
    .map(function (p, i) {
      var fotos = (p.fotos && p.fotos.length ? p.fotos : (p.imagen ? [p.imagen] : [])).filter(Boolean);
      return {
        id: slug(p.nombre),
        orden: i,
        nombre: p.nombre,
        categoria: p.categoria || 'Otros',
        descripcion: p.descripcion || '',
        material: p.material || '',
        medidas: p.medidas || '',
        precio: tienePrecio(p.precio) ? Number(p.precio) : null,
        desde: !!p.desde,
        fotos: fotos.length ? fotos : ['sin-imagen.svg'],
        colores: Array.isArray(p.colores) ? p.colores.filter(Boolean) : [],
        personalizable: !!p.personalizable,
        nuevo: !!p.nuevo,
        destacado: !!p.destacado
      };
    });
  var porId = {};
  productos.forEach(function (p) { porId[p.id] = p; });

  var items = leer();
  var estado = { cat: 'Todos', busqueda: '', orden: 'destacados' };

  // ---------- Elementos ----------
  var grilla = document.getElementById('catalogo');
  var filtros = document.getElementById('catalogoFiltros');
  var buscador = document.getElementById('catalogoBuscar');
  var ordenSel = document.getElementById('catalogoOrden');
  var contador = document.getElementById('catalogoCuenta');
  var destacadoHero = document.getElementById('heroDestacado');

  // ---------- Catálogo ----------
  if (grilla) {
    if (!productos.length) {
      grilla.innerHTML = '<p class="tienda__vacio">Pronto vas a ver nuestros productos acá.</p>';
    } else {
      armarFiltros();
      pintar();
      grilla.addEventListener('click', function (e) {
        var b = e.target.closest('[data-agregar]');
        if (b) {
          e.stopPropagation();
          var p = porId[b.getAttribute('data-agregar')];
          // Si hay que elegir color o personalizar, abre la ficha
          if (p.colores.length > 1 || p.personalizable) abrirFicha(p.id);
          else agregar(p, p.colores[0] || '', '', 1);
          return;
        }
        var card = e.target.closest('[data-ficha]');
        if (card) abrirFicha(card.getAttribute('data-ficha'));
      });
      grilla.addEventListener('keydown', function (e) {
        if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[data-ficha]')) {
          e.preventDefault();
          abrirFicha(e.target.getAttribute('data-ficha'));
        }
      });
    }
  }
  if (buscador) buscador.addEventListener('input', function () { estado.busqueda = buscador.value; pintar(); });
  if (ordenSel) ordenSel.addEventListener('change', function () { estado.orden = ordenSel.value; pintar(); });

  function armarFiltros() {
    if (!filtros) return;
    var cats = ['Todos'];
    productos.forEach(function (p) { if (cats.indexOf(p.categoria) === -1) cats.push(p.categoria); });
    var pie = document.getElementById('footerCategorias');
    if (pie) pie.innerHTML = cats.slice(1).map(function (c) {
      return '<li><a class="site-footer__link" href="#tienda" data-ir-categoria="' + esc(c) + '">' + esc(c) + '</a></li>';
    }).join('');
    filtros.innerHTML = cats.map(function (c) {
      var n = c === 'Todos' ? productos.length : productos.filter(function (p) { return p.categoria === c; }).length;
      return '<button type="button" class="chip' + (c === estado.cat ? ' is-active' : '') + '" data-cat="' + esc(c) + '" aria-pressed="' + (c === estado.cat) + '">' +
        esc(c) + ' <span>' + n + '</span></button>';
    }).join('');
    filtros.addEventListener('click', function (e) {
      var b = e.target.closest('.chip');
      if (!b) return;
      estado.cat = b.getAttribute('data-cat');
      filtros.querySelectorAll('.chip').forEach(function (x) {
        x.classList.toggle('is-active', x === b);
        x.setAttribute('aria-pressed', String(x === b));
      });
      pintar();
    });
    // Links del pie / portada que filtran por categoría: <a data-ir-categoria="Hogar">
    document.addEventListener('click', function (e) {
      var a = e.target.closest('[data-ir-categoria]');
      if (!a) return;
      var cat = a.getAttribute('data-ir-categoria');
      var b = filtros.querySelector('.chip[data-cat="' + cssEsc(cat) + '"]');
      if (b) b.click();
    });
  }

  function pintar() {
    var q = normal(estado.busqueda);
    var lista = productos.filter(function (p) {
      if (estado.cat !== 'Todos' && p.categoria !== estado.cat) return false;
      if (!q) return true;
      return normal(p.nombre + ' ' + p.categoria + ' ' + p.descripcion + ' ' + p.material + ' ' + p.colores.join(' ')).indexOf(q) !== -1;
    });
    lista.sort(function (a, b) {
      if (estado.orden === 'menor') return precioOrden(a, 1) - precioOrden(b, 1);
      if (estado.orden === 'mayor') return precioOrden(b, -1) - precioOrden(a, -1);
      if (estado.orden === 'nuevos') return (b.nuevo - a.nuevo) || (a.orden - b.orden);
      return (b.destacado - a.destacado) || (b.nuevo - a.nuevo) || (a.orden - b.orden);
    });
    if (contador) contador.textContent = lista.length === 1 ? '1 producto' : lista.length + ' productos';
    grilla.innerHTML = lista.length
      ? lista.map(tarjeta).join('')
      : '<div class="tienda__vacio"><p>No encontramos productos con esa búsqueda.</p>' +
        '<a class="btn btn--outline btn--sm" href="#a-medida">Pedilo a medida</a></div>';
  }

  function tarjeta(p, i) {
    var accion = p.precio === null ? 'Consultar' : (p.colores.length > 1 || p.personalizable ? 'Elegir' : 'Agregar');
    return '' +
      '<article class="prod" style="--i:' + i + '" data-ficha="' + p.id + '" tabindex="0" aria-label="' + esc(p.nombre) + ', ' + esc(textoPrecio(p)) + '. Ver ficha">' +
        '<div class="prod__media">' +
          etiquetas(p) +
          '<img src="' + IMG + esc(p.fotos[0]) + '" alt="" loading="lazy" onerror="this.onerror=null;this.src=\'' + SIN_IMAGEN + '\'">' +
          (p.fotos[1] ? '<img class="prod__alt" src="' + IMG + esc(p.fotos[1]) + '" alt="" loading="lazy" onerror="this.remove()">' : '') +
        '</div>' +
        '<div class="prod__body">' +
          '<p class="prod__cat">' + esc(p.categoria) + '</p>' +
          '<h3 class="prod__title">' + esc(p.nombre) + '</h3>' +
          muestras(p.colores, 5) +
          '<div class="prod__pie">' +
            '<p class="prod__precio">' + precioHtml(p) + '</p>' +
            '<button type="button" class="prod__add" data-agregar="' + p.id + '" aria-label="' + esc(accion) + ': ' + esc(p.nombre) + '">' +
              iconoMas() + '<span>' + esc(accion) + '</span></button>' +
          '</div>' +
        '</div>' +
      '</article>';
  }

  // ---------- Destacado de la portada ----------
  if (destacadoHero) {
    var dest = productos.filter(function (p) { return p.nuevo; })[0] ||
               productos.filter(function (p) { return p.destacado; })[0] || productos[0];
    if (dest) {
      destacadoHero.innerHTML =
        '<img src="' + IMG + esc(dest.fotos[0]) + '" alt="" onerror="this.onerror=null;this.src=\'' + SIN_IMAGEN + '\'">' +
        '<div><span class="hero-dest__tag">' + (dest.nuevo ? 'Nuevo' : 'Destacado') + '</span>' +
        '<strong>' + esc(dest.nombre) + '</strong>' +
        '<span class="hero-dest__precio">' + esc(textoPrecio(dest)) + '</span></div>' +
        '<span class="hero-dest__ver" aria-hidden="true">Ver</span>';
      destacadoHero.setAttribute('aria-label', 'Ver ' + dest.nombre);
      destacadoHero.hidden = false;
      destacadoHero.addEventListener('click', function () { abrirFicha(dest.id); });
    }
  }

  // =========================================================
  // Ficha de producto (ventana)
  // =========================================================
  var ficha = document.createElement('div');
  ficha.className = 'ficha';
  ficha.setAttribute('aria-hidden', 'true');
  ficha.innerHTML =
    '<div class="ficha__fondo" data-cerrar-ficha></div>' +
    '<div class="ficha__caja" role="dialog" aria-modal="true" aria-labelledby="fichaTitulo">' +
      '<button type="button" class="ficha__x" data-cerrar-ficha aria-label="Cerrar">&times;</button>' +
      '<div class="ficha__cont" id="fichaCont"></div>' +
    '</div>';
  document.body.appendChild(ficha);
  var fichaCont = ficha.querySelector('#fichaCont');
  var ultimoFoco = null;

  ficha.addEventListener('click', function (e) {
    if (e.target.closest('[data-cerrar-ficha]')) cerrarFicha();
  });

  function abrirFicha(id) {
    var p = porId[id];
    if (!p) return;
    ultimoFoco = document.activeElement;
    var sel = { color: p.colores.length === 1 ? p.colores[0] : '', cant: 1 };

    fichaCont.innerHTML =
      '<div class="ficha__galeria">' +
        '<div class="ficha__foto">' + etiquetas(p) +
          '<img id="fichaFoto" src="' + IMG + esc(p.fotos[0]) + '" alt="' + esc(p.nombre) + '" onerror="this.onerror=null;this.src=\'' + SIN_IMAGEN + '\'">' +
        '</div>' +
        (p.fotos.length > 1 ? '<div class="ficha__miniaturas">' + p.fotos.map(function (f, i) {
          return '<button type="button" data-foto="' + esc(f) + '"' + (i === 0 ? ' class="is-active"' : '') + ' aria-label="Foto ' + (i + 1) + '">' +
            '<img src="' + IMG + esc(f) + '" alt="" onerror="this.onerror=null;this.src=\'' + SIN_IMAGEN + '\'"></button>';
        }).join('') + '</div>' : '') +
      '</div>' +
      '<div class="ficha__info">' +
        '<p class="prod__cat">' + esc(p.categoria) + '</p>' +
        '<h2 id="fichaTitulo" class="ficha__titulo">' + esc(p.nombre) + '</h2>' +
        '<p class="ficha__precio">' + precioHtml(p) + '</p>' +
        (p.descripcion ? '<p class="ficha__desc">' + esc(p.descripcion) + '</p>' : '') +
        ((p.material || p.medidas) ? '<dl class="ficha__datos">' +
          (p.material ? '<div><dt>Material</dt><dd>' + esc(p.material) + '</dd></div>' : '') +
          (p.medidas ? '<div><dt>Medidas</dt><dd>' + esc(p.medidas) + '</dd></div>' : '') +
        '</dl>' : '') +
        (p.colores.length ? '<fieldset class="ficha__colores"><legend>Color: <strong id="fichaColorNombre">' + esc(sel.color || 'elegí uno') + '</strong></legend>' +
          '<div class="ficha__swatches">' + p.colores.map(function (c) {
            return '<label class="swatch-op" title="' + esc(c) + '"><input type="radio" name="fichaColor" value="' + esc(c) + '"' + (c === sel.color ? ' checked' : '') + '>' +
              '<span class="swatch swatch--lg" style="background:' + colorCss(c) + '"></span><span class="sr-only">' + esc(c) + '</span></label>';
          }).join('') + '</div></fieldset>' : '') +
        (p.personalizable ? '<label class="ficha__campo"><span>Nombre o texto a personalizar <em>(opcional)</em></span>' +
          '<input type="text" id="fichaTexto" maxlength="60" placeholder="Ej: Sofi, Club Atlético, tu logo…"></label>' : '') +
        '<div class="ficha__comprar">' +
          '<div class="cant" role="group" aria-label="Cantidad">' +
            '<button type="button" data-cant="-1" aria-label="Uno menos">−</button>' +
            '<output id="fichaCant" aria-live="polite">1</output>' +
            '<button type="button" data-cant="1" aria-label="Uno más">+</button>' +
          '</div>' +
          '<button type="button" class="btn btn--primary ficha__add" id="fichaAgregar">' + iconoCarrito() +
            '<span>' + (p.precio === null ? 'Sumar al pedido para cotizar' : 'Agregar al carrito') + '</span></button>' +
        '</div>' +
        '<p class="ficha__error" id="fichaError" role="alert" hidden></p>' +
        '<ul class="ficha__garantias">' +
          '<li>' + iconoCheck() + 'No pagás en la web: confirmás todo por WhatsApp</li>' +
          '<li>' + iconoCheck() + 'Retiro en ' + esc(CFG.direccion || 'el taller') + ' o envío</li>' +
        '</ul>' +
        '<button type="button" class="ficha__compartir" id="fichaCompartir">' + iconoLink() + 'Copiar link de este producto</button>' +
      '</div>';

    var foto = fichaCont.querySelector('#fichaFoto');
    var cantOut = fichaCont.querySelector('#fichaCant');
    var error = fichaCont.querySelector('#fichaError');
    var colorNombre = fichaCont.querySelector('#fichaColorNombre');

    fichaCont.onclick = function (e) {
      var mini = e.target.closest('[data-foto]');
      if (mini) {
        foto.src = IMG + mini.getAttribute('data-foto');
        fichaCont.querySelectorAll('[data-foto]').forEach(function (b) { b.classList.toggle('is-active', b === mini); });
      }
      var c = e.target.closest('[data-cant]');
      if (c) {
        sel.cant = Math.max(1, Math.min(99, sel.cant + Number(c.getAttribute('data-cant'))));
        cantOut.textContent = sel.cant;
      }
    };
    fichaCont.onchange = function (e) {
      if (e.target.name === 'fichaColor') {
        sel.color = e.target.value;
        colorNombre.textContent = sel.color;
        error.hidden = true;
      }
    };
    fichaCont.querySelector('#fichaAgregar').addEventListener('click', function () {
      if (p.colores.length > 1 && !sel.color) {
        error.textContent = 'Elegí un color para seguir.';
        error.hidden = false;
        return;
      }
      var texto = p.personalizable ? fichaCont.querySelector('#fichaTexto').value.trim() : '';
      cerrarFicha(true);
      agregar(p, sel.color, texto, sel.cant);
    });
    fichaCont.querySelector('#fichaCompartir').addEventListener('click', function () {
      var btn = this;
      var url = location.href.split('#')[0] + '#producto-' + p.id;
      copiar(url).then(function () {
        btn.lastChild.textContent = '¡Link copiado! Pegalo donde quieras';
      });
    });

    ficha.classList.add('is-open');
    ficha.setAttribute('aria-hidden', 'false');
    bloquearScroll(true);
    if (location.hash !== '#producto-' + p.id) history.replaceState(null, '', '#producto-' + p.id);
    ficha.querySelector('.ficha__x').focus();
  }

  function cerrarFicha(sinFoco) {
    if (!ficha.classList.contains('is-open')) return;
    ficha.classList.remove('is-open');
    ficha.setAttribute('aria-hidden', 'true');
    if (!panel.classList.contains('is-open')) bloquearScroll(false);
    if (/^#producto-/.test(location.hash)) history.replaceState(null, '', location.pathname + location.search + '#tienda');
    if (!sinFoco && ultimoFoco && ultimoFoco.focus) ultimoFoco.focus();
  }

  // Link directo a un producto: .../#producto-llaveros-personalizados
  function abrirDesdeHash() {
    var m = location.hash.match(/^#producto-(.+)$/);
    if (m && porId[m[1]]) abrirFicha(m[1]);
  }
  window.addEventListener('hashchange', abrirDesdeHash);

  // =========================================================
  // Carrito (panel lateral)
  // =========================================================
  var panel = document.createElement('aside');
  panel.className = 'carrito';
  panel.id = 'carrito';
  panel.setAttribute('aria-hidden', 'true');
  panel.innerHTML =
    '<div class="carrito__fondo" data-cerrar></div>' +
    '<div class="carrito__caja" role="dialog" aria-modal="true" aria-labelledby="carritoTitulo">' +
      '<header class="carrito__head">' +
        '<h2 id="carritoTitulo">Tu pedido</h2>' +
        '<button type="button" class="carrito__x" data-cerrar aria-label="Cerrar carrito">&times;</button>' +
      '</header>' +
      '<ol class="carrito__pasos" aria-label="Pasos">' +
        '<li data-paso="1">Carrito</li><li data-paso="2">Tus datos</li><li data-paso="3">WhatsApp</li>' +
      '</ol>' +
      '<div class="carrito__cuerpo" id="carritoCuerpo"></div>' +
    '</div>';
  document.body.appendChild(panel);
  var cuerpo = panel.querySelector('#carritoCuerpo');

  panel.addEventListener('click', function (e) {
    if (e.target.closest('[data-cerrar]')) cerrar();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (ficha.classList.contains('is-open')) cerrarFicha();
    else if (panel.classList.contains('is-open')) cerrar();
  });
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-abrir-carrito]');
    if (b) { e.preventDefault(); abrir(); }
  });

  // Barra fija del celular
  var barra = document.createElement('div');
  barra.className = 'barra-carrito';
  barra.hidden = true;
  barra.innerHTML =
    '<button type="button" data-abrir-carrito>' +
      '<span class="barra-carrito__icono">' + iconoCarrito() + '<span data-carrito-cant>0</span></span>' +
      '<span class="barra-carrito__texto">Ver pedido</span>' +
      '<strong data-carrito-total>$0</strong>' +
    '</button>';
  document.body.appendChild(barra);

  // Aviso "se agregó"
  var toast = document.createElement('div');
  toast.className = 'toast';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  document.body.appendChild(toast);
  var toastTimer;

  actualizarContador();

  // API pública por si otra parte de la web quiere sumar al carrito
  window.LUATEC_CARRITO = {
    agregar: function (p) { var x = porId[slug(p.nombre)]; if (x) agregar(x, x.colores[0] || '', '', 1); },
    abrir: abrir
  };

  function agregar(p, color, texto, cant) {
    var clave = p.id + '|' + color + '|' + texto;
    var it = items.filter(function (i) { return i.clave === clave; })[0];
    if (it) it.cant += cant;
    else items.push({
      clave: clave, id: p.id, nombre: p.nombre, precio: p.precio, desde: p.desde,
      imagen: p.fotos[0], color: color, texto: texto, cant: cant
    });
    guardar();
    mostrarToast(p, color, cant);
  }

  function mostrarToast(p, color, cant) {
    toast.innerHTML =
      '<img src="' + IMG + esc(p.fotos[0]) + '" alt="" onerror="this.onerror=null;this.src=\'' + SIN_IMAGEN + '\'">' +
      '<div><strong>Agregado al carrito</strong><span>' + cant + ' × ' + esc(p.nombre) + (color ? ' · ' + esc(color) : '') + '</span></div>' +
      '<button type="button" data-abrir-carrito>Ver pedido</button>';
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('is-visible'); }, 3800);
    var btn = document.querySelector('.carrito-btn');
    if (btn) { btn.classList.remove('is-bump'); void btn.offsetWidth; btn.classList.add('is-bump'); }
  }

  function paso(n) {
    panel.querySelectorAll('[data-paso]').forEach(function (li) {
      var k = Number(li.getAttribute('data-paso'));
      li.classList.toggle('is-actual', k === n);
      li.classList.toggle('is-hecho', k < n);
    });
  }

  function vistaLista() {
    paso(1);
    if (!items.length) {
      cuerpo.innerHTML =
        '<div class="carrito__vacio">' + iconoCarrito() +
          '<p><strong>Tu carrito está vacío</strong><br>Sumá productos de la tienda y te llega el pedido armado por WhatsApp.</p>' +
          '<a href="#tienda" class="btn btn--primary btn--block" data-cerrar>Ir a la tienda</a>' +
        '</div>';
      return;
    }
    var hayDesde = items.some(function (i) { return i.desde; });
    var hayCotizar = items.some(function (i) { return i.precio === null; });
    cuerpo.innerHTML =
      '<ul class="carrito__lista">' + items.map(function (it, n) {
        return '<li class="carrito__item">' +
          '<img src="' + IMG + esc(it.imagen) + '" alt="" onerror="this.onerror=null;this.src=\'' + SIN_IMAGEN + '\'">' +
          '<div class="carrito__info">' +
            '<strong>' + esc(it.nombre) + '</strong>' +
            (it.color ? '<span class="carrito__color"><i class="swatch" style="background:' + colorCss(it.color) + '"></i>' + esc(it.color) + '</span>' : '') +
            (it.texto ? '<span class="carrito__texto">“' + esc(it.texto) + '”</span>' : '') +
            '<span class="carrito__unit">' + (it.precio === null ? 'A cotizar' : (it.desde ? 'Desde ' : '') + plata(it.precio) + ' c/u') + '</span>' +
            '<div class="carrito__fila">' +
              '<div class="cant cant--sm" role="group" aria-label="Cantidad de ' + esc(it.nombre) + '">' +
                '<button type="button" data-menos="' + n + '" aria-label="Uno menos">−</button>' +
                '<output aria-live="polite">' + it.cant + '</output>' +
                '<button type="button" data-mas="' + n + '" aria-label="Uno más">+</button>' +
              '</div>' +
              '<strong class="carrito__sub">' + (it.precio === null ? '—' : plata(it.precio * it.cant)) + '</strong>' +
            '</div>' +
          '</div>' +
          '<button type="button" class="carrito__quitar" data-quitar="' + n + '" aria-label="Quitar ' + esc(it.nombre) + '">' + iconoTacho() + '</button>' +
        '</li>';
      }).join('') + '</ul>' +
      '<div class="carrito__resumen">' +
        '<div class="carrito__total"><span>Total' + (hayDesde || hayCotizar ? ' estimado' : '') + '</span><strong>' + plata(total()) + '</strong></div>' +
        (hayDesde ? '<p class="carrito__nota">Los productos con precio "desde" pueden variar según la personalización: te confirmamos el valor final.</p>' : '') +
        (hayCotizar ? '<p class="carrito__nota">Los productos "a cotizar" no suman al total: te pasamos el precio por WhatsApp.</p>' : '') +
        '<button type="button" class="btn btn--primary btn--block" id="carritoSeguir">Continuar</button>' +
        '<button type="button" class="carrito__volver" data-cerrar>Seguir comprando</button>' +
      '</div>';

    cuerpo.querySelector('#carritoSeguir').addEventListener('click', vistaDatos);
    cuerpo.querySelector('.carrito__lista').addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      if (b.hasAttribute('data-mas')) items[+b.getAttribute('data-mas')].cant++;
      if (b.hasAttribute('data-menos')) {
        var i = +b.getAttribute('data-menos');
        if (--items[i].cant < 1) items.splice(i, 1);
      }
      if (b.hasAttribute('data-quitar')) items.splice(+b.getAttribute('data-quitar'), 1);
      guardar();
      vistaLista();
    });
  }

  function vistaDatos() {
    paso(2);
    var previo = leerDatos();
    cuerpo.innerHTML =
      '<form class="carrito__form" id="carritoForm" novalidate>' +
        campo('nombre', 'Tu nombre', 'text', 'name', true, previo.nombre) +
        '<fieldset><legend>¿Cómo lo recibís?</legend>' +
          radio('entrega', 'Retiro', 'Retiro en ' + (CFG.direccion || 'el taller'), previo.entrega !== 'Envío') +
          radio('entrega', 'Envío', 'Envío a domicilio', previo.entrega === 'Envío') +
        '</fieldset>' +
        '<div class="carrito__envio"' + (previo.entrega === 'Envío' ? '' : ' hidden') + '>' +
          campo('zona', 'Localidad o barrio', 'text', 'address-level2', true, previo.zona) +
          '<p class="carrito__nota">' + esc(CFG.textoEnvio || '') + '</p>' +
        '</div>' +
        '<label class="carrito__campo"><span>Comentarios <em>(opcional)</em></span>' +
          '<textarea name="comentarios" rows="3" placeholder="Ej: lo necesito para el viernes, es para regalo…"></textarea></label>' +
        '<div class="carrito__total"><span>Total' + (items.some(function (i) { return i.desde || i.precio === null; }) ? ' estimado' : '') + '</span><strong>' + plata(total()) + '</strong></div>' +
        '<p class="carrito__pagonota">' + iconoInfo() + esc(CFG.textoPago || 'No pagás nada ahora: coordinamos el pago por WhatsApp.') + '</p>' +
        '<p class="carrito__error" id="carritoError" role="alert" hidden></p>' +
        '<button type="submit" class="btn btn--wa btn--block">' + iconoWa() + '<span>Enviar pedido por WhatsApp</span></button>' +
        '<button type="button" class="carrito__volver" id="carritoVolver">← Volver al carrito</button>' +
      '</form>';

    var form = cuerpo.querySelector('#carritoForm');
    var envio = form.querySelector('.carrito__envio');
    form.addEventListener('change', function () { envio.hidden = form.entrega.value !== 'Envío'; });
    form.querySelector('#carritoVolver').addEventListener('click', vistaLista);
    form.addEventListener('submit', function (e) { e.preventDefault(); enviar(form); });
    if (!previo.nombre) form.nombre.focus();
  }

  function enviar(form) {
    var d = {
      nombre: form.nombre.value.trim(),
      entrega: form.entrega.value,
      zona: form.zona.value.trim(),
      comentarios: form.comentarios.value.trim()
    };
    var error = form.querySelector('#carritoError');
    var falta = !d.nombre ? 'tu nombre' : (d.entrega === 'Envío' && !d.zona) ? 'tu localidad o barrio' : '';
    if (falta) { error.textContent = 'Falta completar ' + falta + '.'; error.hidden = false; return; }
    guardarDatos(d);

    var numero = 'LT-' + Date.now().toString(36).toUpperCase().slice(-5);
    var url = 'https://wa.me/' + String(CFG.whatsapp || '').replace(/\D/g, '') + '?text=' + encodeURIComponent(mensaje(numero, d));
    var abierto = window.open(url, '_blank');
    if (!abierto) location.href = url;
    vistaListo(numero, d, url);
  }

  function mensaje(numero, d) {
    var hayEstimado = items.some(function (i) { return i.desde || i.precio === null; });
    var lineas = items.map(function (i) {
      var extra = [];
      if (i.color) extra.push('color ' + i.color);
      if (i.texto) extra.push('texto "' + i.texto + '"');
      return '• ' + i.cant + ' x ' + i.nombre + (extra.length ? ' (' + extra.join(', ') + ')' : '') +
        ' — ' + (i.precio === null ? 'a cotizar' : (i.desde ? 'desde ' : '') + plata(i.precio * i.cant));
    });
    return '¡Hola LUATEC! Quiero hacer este pedido (' + numero + '):\n\n' +
      lineas.join('\n') +
      '\n\nTotal' + (hayEstimado ? ' estimado' : '') + ': ' + plata(total()) +
      '\nEntrega: ' + (d.entrega === 'Envío' ? 'envío a ' + d.zona : 'retiro en ' + (CFG.direccion || 'el taller')) +
      (d.comentarios ? '\nComentarios: ' + d.comentarios : '') +
      '\n\nSoy ' + d.nombre + '. ¡Gracias!';
  }

  function vistaListo(numero, d, url) {
    paso(3);
    items = [];
    guardar();
    cuerpo.innerHTML =
      '<div class="carrito__listo">' +
        '<div class="carrito__okicono">' + iconoWa() + '</div>' +
        '<p class="carrito__ok">¡Listo, ' + esc(d.nombre.split(' ')[0]) + '!</p>' +
        '<p>Se abrió WhatsApp con tu pedido <strong>' + numero + '</strong> ya escrito. <strong>Tocá enviar</strong> en WhatsApp y te respondemos para confirmar colores, pago y entrega.</p>' +
        '<a class="btn btn--wa btn--block" target="_blank" rel="noopener noreferrer" href="' + esc(url) + '">' + iconoWa() + '<span>¿No se abrió? Tocá acá</span></a>' +
        '<button type="button" class="carrito__volver" data-cerrar>Volver a la tienda</button>' +
      '</div>';
  }

  // ---------- Utilidades del carrito ----------
  abrirDesdeHash();

  function abrir() {
    cerrarFicha(true);
    vistaLista();
    panel.classList.add('is-open');
    panel.setAttribute('aria-hidden', 'false');
    bloquearScroll(true);
    toast.classList.remove('is-visible');
    var x = panel.querySelector('.carrito__x');
    if (x) x.focus();
  }
  function cerrar() {
    panel.classList.remove('is-open');
    panel.setAttribute('aria-hidden', 'true');
    bloquearScroll(false);
  }
  function total() {
    return items.reduce(function (s, i) { return s + (i.precio === null ? 0 : i.precio * i.cant); }, 0);
  }
  function actualizarContador() {
    var n = items.reduce(function (s, i) { return s + i.cant; }, 0);
    document.querySelectorAll('[data-carrito-cant]').forEach(function (el) {
      el.textContent = n;
      if (el.closest('.carrito-btn')) el.hidden = n === 0;
    });
    document.querySelectorAll('[data-carrito-total]').forEach(function (el) { el.textContent = plata(total()); });
    barra.hidden = n === 0;
    document.documentElement.classList.toggle('hay-carrito', n > 0);
  }
  function guardar() {
    try { localStorage.setItem(CLAVE, JSON.stringify(items)); } catch (e) {}
    actualizarContador();
  }
  function leer() {
    try {
      var v = JSON.parse(localStorage.getItem(CLAVE) || '[]');
      // Si un producto cambió de precio o se sacó, se actualiza solo
      return Array.isArray(v) ? v.filter(function (i) { return porId[i.id]; }).map(function (i) {
        var p = porId[i.id];
        i.precio = p.precio; i.desde = p.desde; i.nombre = p.nombre; i.imagen = p.fotos[0];
        return i;
      }) : [];
    } catch (e) { return []; }
  }
  function guardarDatos(d) {
    try { localStorage.setItem('luatec-cliente', JSON.stringify({ nombre: d.nombre, entrega: d.entrega, zona: d.zona })); } catch (e) {}
  }
  function leerDatos() {
    try { return JSON.parse(localStorage.getItem('luatec-cliente') || '{}') || {}; } catch (e) { return {}; }
  }
  function bloquearScroll(si) {
    document.documentElement.classList.toggle('modal-abierto', si);
  }

  // ---------- Utilidades generales ----------
  function tienePrecio(v) { return v !== null && v !== undefined && v !== '' && !isNaN(Number(v)); }
  function precioOrden(p, dir) { return p.precio === null ? dir * Infinity : p.precio; }
  function textoPrecio(p) { return p.precio === null ? 'A cotizar' : (p.desde ? 'Desde ' : '') + plata(p.precio); }
  function precioHtml(p) {
    return p.precio === null ? '<span class="precio__cotizar">A cotizar</span>'
      : (p.desde ? '<small>desde</small> ' : '') + plata(p.precio);
  }
  function etiquetas(p) {
    return '<div class="prod__badges">' +
      (p.nuevo ? '<span class="badge badge--nuevo">Nuevo</span>' : '') +
      (p.destacado && !p.nuevo ? '<span class="badge">Más pedido</span>' : '') +
      (p.personalizable ? '<span class="badge badge--perso">Personalizable</span>' : '') +
    '</div>';
  }
  function muestras(colores, max) {
    if (!colores.length) return '<p class="prod__colores prod__colores--vacio">Hecho a pedido</p>';
    var vis = colores.slice(0, max);
    return '<p class="prod__colores" aria-label="Colores: ' + esc(colores.join(', ')) + '">' +
      vis.map(function (c) { return '<i class="swatch" style="background:' + colorCss(c) + '" title="' + esc(c) + '"></i>'; }).join('') +
      (colores.length > max ? '<span>+' + (colores.length - max) + '</span>' : '') +
      (colores.length === 1 ? '<span>' + esc(colores[0]) + '</span>' : '') +
    '</p>';
  }
  function colorCss(nombre) {
    var v = COLORES[nombre];
    if (!v) {
      // Busca sin importar mayúsculas/acentos
      var n = normal(nombre);
      Object.keys(COLORES).forEach(function (k) { if (normal(k) === n) v = COLORES[k]; });
    }
    return esc(v || '#c9d3e3');
  }
  function plata(n) { return '$' + Number(n || 0).toLocaleString('es-AR'); }
  function campo(name, label, type, auto, req, valor) {
    return '<label class="carrito__campo"><span>' + label + (req ? '' : ' <em>(opcional)</em>') + '</span>' +
      '<input name="' + name + '" type="' + type + '" autocomplete="' + auto + '"' + (req ? ' required' : '') +
      (valor ? ' value="' + esc(valor) + '"' : '') + '></label>';
  }
  function radio(name, value, label, checked) {
    return '<label class="carrito__radio"><input type="radio" name="' + name + '" value="' + value + '"' +
      (checked ? ' checked' : '') + '> <span>' + esc(label) + '</span></label>';
  }
  function copiar(t) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(t);
    var ta = document.createElement('textarea');
    ta.value = t; document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    ta.remove();
    return Promise.resolve();
  }
  function slug(s) {
    return normal(s).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }
  function normal(s) {
    return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  }
  function cssEsc(s) { return String(s).replace(/["\\]/g, '\\$&'); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // ---------- Íconos ----------
  function svg(d, extra) { return '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"' + (extra || '') + '>' + d + '</svg>'; }
  function iconoMas() { return svg('<path d="M12 5v14M5 12h14"/>'); }
  function iconoCheck() { return svg('<path d="M20 6 9 17l-5-5"/>'); }
  function iconoTacho() { return svg('<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/>'); }
  function iconoInfo() { return svg('<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>'); }
  function iconoLink() { return svg('<path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/>'); }
  function iconoCarrito() { return svg('<path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6.2"/><circle cx="10" cy="20.5" r="1.2"/><circle cx="17" cy="20.5" r="1.2"/>'); }
  function iconoWa() {
    return '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2c0 1.3.9 2.5 1.1 2.7.1.2 1.8 2.8 4.4 3.9 1.6.7 2.3.8 3.1.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3z"/></svg>';
  }
})();

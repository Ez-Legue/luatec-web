/* =========================================================
   LUATEC · Carrito y pedidos
   ---------------------------------------------------------
   Guarda el carrito en el navegador del cliente, pide sus datos
   y te manda el pedido por mail (FormSubmit) y por WhatsApp.
   Tus datos (WhatsApp, mail, alias) se cambian en assets/js/config.js
   No hace falta tocar este archivo.
   ========================================================= */
(function () {
  'use strict';

  var CFG = window.LUATEC_CONFIG || {};
  var CLAVE = 'luatec-carrito';
  var items = leer();

  // ---------- Panel del carrito ----------
  var panel = document.createElement('aside');
  panel.className = 'carrito';
  panel.id = 'carrito';
  panel.setAttribute('aria-label', 'Carrito de compras');
  panel.setAttribute('aria-hidden', 'true');
  panel.innerHTML =
    '<div class="carrito__fondo" data-cerrar></div>' +
    '<div class="carrito__caja" role="dialog" aria-modal="true" aria-labelledby="carritoTitulo">' +
      '<header class="carrito__head">' +
        '<h2 id="carritoTitulo">Tu pedido</h2>' +
        '<button type="button" class="carrito__x" data-cerrar aria-label="Cerrar carrito">&times;</button>' +
      '</header>' +
      '<div class="carrito__cuerpo" id="carritoCuerpo"></div>' +
    '</div>';
  document.body.appendChild(panel);
  var cuerpo = panel.querySelector('#carritoCuerpo');

  panel.addEventListener('click', function (e) {
    if (e.target.closest('[data-cerrar]')) cerrar();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && panel.classList.contains('is-open')) cerrar();
  });
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-abrir-carrito]');
    if (b) { e.preventDefault(); abrir(); }
  });

  actualizarContador();

  // ---------- API para el catálogo ----------
  window.LUATEC_CARRITO = {
    agregar: function (p) {
      var it = buscar(p.nombre);
      if (it) it.cant++;
      else items.push({ nombre: p.nombre, precio: Number(p.precio), desde: !!p.desde, imagen: p.imagen || '', cant: 1 });
      guardar();
      aviso(p.nombre + ' se agregó al carrito');
      abrir();
    }
  };

  // ---------- Vistas ----------
  function vistaLista() {
    if (!items.length) {
      cuerpo.innerHTML =
        '<p class="carrito__vacio">Tu carrito está vacío.</p>' +
        '<a href="#productos" class="btn btn--primary btn--block" data-cerrar>Ver productos</a>';
      return;
    }
    var hayDesde = items.some(function (i) { return i.desde; });
    cuerpo.innerHTML =
      '<ul class="carrito__lista">' + items.map(function (it, n) {
        return '<li class="carrito__item">' +
          '<img src="productos/imagenes/' + esc(it.imagen) + '" alt="" onerror="this.onerror=null;this.src=\'productos/imagenes/sin-imagen.svg\'">' +
          '<div class="carrito__info">' +
            '<strong>' + esc(it.nombre) + '</strong>' +
            '<span>' + (it.desde ? 'Desde ' : '') + plata(it.precio) + ' c/u</span>' +
            '<div class="carrito__cant" role="group" aria-label="Cantidad de ' + esc(it.nombre) + '">' +
              '<button type="button" data-menos="' + n + '" aria-label="Uno menos">−</button>' +
              '<output aria-live="polite">' + it.cant + '</output>' +
              '<button type="button" data-mas="' + n + '" aria-label="Uno más">+</button>' +
            '</div>' +
          '</div>' +
          '<button type="button" class="carrito__quitar" data-quitar="' + n + '" aria-label="Quitar ' + esc(it.nombre) + '">Quitar</button>' +
        '</li>';
      }).join('') + '</ul>' +
      '<div class="carrito__total"><span>Total' + (hayDesde ? ' estimado' : '') + '</span><strong>' + plata(total()) + '</strong></div>' +
      (hayDesde ? '<p class="carrito__nota">Algunos productos tienen precio "desde": te confirmamos el valor final según la personalización.</p>' : '') +
      '<button type="button" class="btn btn--primary btn--block" id="carritoSeguir">Continuar con la compra</button>';

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
    cuerpo.innerHTML =
      '<form class="carrito__form" id="carritoForm" novalidate>' +
        campo('nombre', 'Nombre y apellido', 'text', 'name', true) +
        campo('telefono', 'WhatsApp', 'tel', 'tel', true) +
        campo('email', 'Mail', 'email', 'email', false) +
        '<fieldset><legend>Entrega</legend>' +
          radio('entrega', 'Retiro', 'Retiro en ' + (CFG.direccion || 'el taller'), true) +
          radio('entrega', 'Envío', 'Envío a domicilio', false) +
        '</fieldset>' +
        '<div class="carrito__envio" hidden>' +
          campo('direccion', 'Dirección, localidad y código postal', 'text', 'street-address', true) +
          '<p class="carrito__nota">' + esc(CFG.textoEnvio || '') + '</p>' +
        '</div>' +
        '<fieldset><legend>Forma de pago</legend>' +
          radio('pago', 'Mercado Pago', 'Mercado Pago (transferencia, tarjeta o dinero en cuenta)', true) +
          radio('pago', 'Efectivo', 'Efectivo al retirar', false) +
        '</fieldset>' +
        '<label class="carrito__campo"><span>Comentarios (colores, nombres, medidas)</span><textarea name="comentarios" rows="3"></textarea></label>' +
        '<div class="carrito__total"><span>Total</span><strong>' + plata(total()) + '</strong></div>' +
        '<p class="carrito__error" id="carritoError" role="alert" hidden></p>' +
        '<button type="submit" class="btn btn--primary btn--block">Confirmar pedido</button>' +
        '<button type="button" class="carrito__volver" id="carritoVolver">← Volver al carrito</button>' +
      '</form>';

    var form = cuerpo.querySelector('#carritoForm');
    var envio = form.querySelector('.carrito__envio');
    form.addEventListener('change', function () {
      var esEnvio = form.entrega.value === 'Envío';
      envio.hidden = !esEnvio;
      // Con envío no se puede pagar en efectivo al retirar
      var efectivo = form.querySelector('input[name="pago"][value="Efectivo"]');
      efectivo.disabled = esEnvio;
      if (esEnvio && efectivo.checked) form.querySelector('input[name="pago"][value="Mercado Pago"]').checked = true;
    });
    form.querySelector('#carritoVolver').addEventListener('click', vistaLista);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      enviar(form);
    });
    form.nombre.focus();
  }

  function enviar(form) {
    var d = {
      nombre: form.nombre.value.trim(),
      telefono: form.telefono.value.trim(),
      email: form.email.value.trim(),
      entrega: form.entrega.value,
      direccion: form.direccion.value.trim(),
      pago: form.pago.value,
      comentarios: form.comentarios.value.trim()
    };
    var error = form.querySelector('#carritoError');
    var falta = !d.nombre ? 'tu nombre' : !d.telefono ? 'tu WhatsApp' : (d.entrega === 'Envío' && !d.direccion) ? 'la dirección de envío' : '';
    if (falta) { error.textContent = 'Falta completar ' + falta + '.'; error.hidden = false; return; }

    var pedido = {
      numero: 'LT-' + Date.now().toString(36).toUpperCase().slice(-6),
      items: items.slice(),
      total: total(),
      datos: d
    };
    var boton = form.querySelector('button[type="submit"]');
    boton.disabled = true;
    boton.textContent = 'Enviando…';

    mandarMail(pedido).then(function (ok) {
      items = [];
      guardar();
      vistaListo(pedido, ok);
    });
  }

  function mandarMail(pedido) {
    if (!CFG.emailPedidos || !window.fetch) return Promise.resolve(false);
    var d = pedido.datos;
    return fetch('https://formsubmit.co/ajax/' + encodeURIComponent(CFG.emailPedidos), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        _subject: 'Nuevo pedido ' + pedido.numero + ' · ' + plata(pedido.total),
        _template: 'table',
        _captcha: 'false',
        _replyto: d.email || undefined,
        Pedido: pedido.numero,
        Productos: detalle(pedido.items, '\n'),
        Total: plata(pedido.total),
        Cliente: d.nombre,
        WhatsApp: d.telefono,
        Mail: d.email || '-',
        Entrega: d.entrega === 'Envío' ? 'Envío a ' + d.direccion : 'Retiro en ' + (CFG.direccion || 'el taller'),
        Pago: d.pago,
        Comentarios: d.comentarios || '-'
      })
    }).then(function (r) { return r.ok; }).catch(function () { return false; });
  }

  function vistaListo(pedido, mailOk) {
    var d = pedido.datos;
    var pagoHtml = '';
    if (d.pago === 'Mercado Pago') {
      pagoHtml = CFG.mercadoPagoAlias
        ? '<div class="carrito__pago">' +
            '<p>Para confirmar, transferí <strong>' + plata(pedido.total) + '</strong> por Mercado Pago a este alias:</p>' +
            '<div class="carrito__alias"><code>' + esc(CFG.mercadoPagoAlias) + '</code>' +
              '<button type="button" id="carritoCopiar">Copiar</button></div>' +
            (CFG.mercadoPagoTitular ? '<p class="carrito__nota">Titular: ' + esc(CFG.mercadoPagoTitular) + '</p>' : '') +
            '<p class="carrito__nota">Después mandanos el comprobante por WhatsApp. Si preferís pagar con tarjeta, pedinos el link de pago.</p>' +
          '</div>'
        : '<div class="carrito__pago"><p>Te mandamos por WhatsApp el link de Mercado Pago para que pagues con tarjeta, transferencia o dinero en cuenta.</p></div>';
    } else {
      pagoHtml = '<div class="carrito__pago"><p>Pagás en efectivo cuando retirás en ' + esc(CFG.direccion || 'el taller') + '.</p></div>';
    }

    var msg = 'Hola LUATEC! Hice el pedido ' + pedido.numero + ':\n' + detalle(pedido.items, '\n') +
      '\nTotal: ' + plata(pedido.total) +
      '\nEntrega: ' + (d.entrega === 'Envío' ? 'envío a ' + d.direccion : 'retiro') +
      '\nPago: ' + d.pago +
      (d.comentarios ? '\nComentarios: ' + d.comentarios : '') +
      '\nNombre: ' + d.nombre;

    cuerpo.innerHTML =
      '<div class="carrito__listo">' +
        '<p class="carrito__ok">¡Gracias, ' + esc(d.nombre.split(' ')[0]) + '!</p>' +
        '<p>Tu pedido <strong>' + pedido.numero + '</strong> quedó registrado.' +
          (mailOk ? '' : ' Para que nos llegue, <strong>mandalo por WhatsApp</strong> con el botón de abajo.') + '</p>' +
        pagoHtml +
        '<a class="btn btn--primary btn--block carrito__wa" target="_blank" rel="noopener noreferrer" href="https://wa.me/' +
          esc(CFG.whatsapp || '') + '?text=' + encodeURIComponent(msg) + '">Enviar pedido por WhatsApp</a>' +
        '<button type="button" class="carrito__volver" data-cerrar>Seguir mirando</button>' +
      '</div>';

    var copiar = cuerpo.querySelector('#carritoCopiar');
    if (copiar) copiar.addEventListener('click', function () {
      if (navigator.clipboard) navigator.clipboard.writeText(CFG.mercadoPagoAlias).then(function () { copiar.textContent = '¡Copiado!'; });
    });
  }

  // ---------- Utilidades ----------
  function abrir() {
    vistaLista();
    panel.classList.add('is-open');
    panel.setAttribute('aria-hidden', 'false');
    document.documentElement.classList.add('carrito-abierto');
    var x = panel.querySelector('.carrito__x');
    if (x) x.focus();
  }
  function cerrar() {
    panel.classList.remove('is-open');
    panel.setAttribute('aria-hidden', 'true');
    document.documentElement.classList.remove('carrito-abierto');
  }
  function buscar(nombre) {
    for (var i = 0; i < items.length; i++) if (items[i].nombre === nombre) return items[i];
    return null;
  }
  function total() {
    return items.reduce(function (s, i) { return s + i.precio * i.cant; }, 0);
  }
  function detalle(lista, sep) {
    return lista.map(function (i) { return i.cant + ' x ' + i.nombre + ' (' + plata(i.precio * i.cant) + ')'; }).join(sep);
  }
  function actualizarContador() {
    var n = items.reduce(function (s, i) { return s + i.cant; }, 0);
    document.querySelectorAll('[data-carrito-cant]').forEach(function (el) {
      el.textContent = n;
      el.hidden = n === 0;
    });
  }
  function guardar() {
    try { localStorage.setItem(CLAVE, JSON.stringify(items)); } catch (e) {}
    actualizarContador();
  }
  function leer() {
    try {
      var v = JSON.parse(localStorage.getItem(CLAVE) || '[]');
      return Array.isArray(v) ? v : [];
    } catch (e) { return []; }
  }
  function aviso(texto) {
    var a = document.getElementById('carritoAviso');
    if (a) a.textContent = texto;
  }
  function plata(n) { return '$' + Number(n || 0).toLocaleString('es-AR'); }
  function campo(name, label, type, auto, req) {
    return '<label class="carrito__campo"><span>' + label + (req ? '' : ' <em>(opcional)</em>') + '</span>' +
      '<input name="' + name + '" type="' + type + '" autocomplete="' + auto + '"' + (req ? ' required' : '') + '></label>';
  }
  function radio(name, value, label, checked) {
    return '<label class="carrito__radio"><input type="radio" name="' + name + '" value="' + value + '"' +
      (checked ? ' checked' : '') + '> <span>' + esc(label) + '</span></label>';
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
})();

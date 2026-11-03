/* =========================================================
   LUATEC · Formulario de presupuesto
   ---------------------------------------------------------
   Arma el mensaje y abre WhatsApp con la consulta lista.
   Si en assets/js/config.js completaste emailPedidos, también
   te llega una copia por mail.
   ========================================================= */
(function () {
  'use strict';
  var CFG = window.LUATEC_CONFIG || {};
  var form = document.getElementById('presuForm');
  if (!form) return;
  var error = document.getElementById('presuError');
  var nota = document.getElementById('presuNota');

  function val(id) { var el = document.getElementById(id); return el ? el.value.trim() : ''; }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var d = {
      Nombre: val('presuNombre'),
      Contacto: val('presuContacto'),
      Tipo: val('presuTipo'),
      Idea: val('presuIdea'),
      Cantidad: val('presuCant') || '1',
      Medidas: val('presuMedidas') || 'A definir',
      Material: val('presuMaterial'),
      'Archivo 3D': val('presuArchivo')
    };
    var faltan = [];
    if (!d.Nombre) faltan.push('tu nombre');
    if (!d.Contacto) faltan.push('tu WhatsApp o mail');
    if (!d.Idea) faltan.push('qué querés imprimir');
    if (faltan.length) {
      var lista = faltan.length > 1 ? faltan.slice(0, -1).join(', ') + ' y ' + faltan[faltan.length - 1] : faltan[0];
      error.textContent = 'Completá ' + lista + ' para que podamos cotizarte.';
      error.hidden = false;
      var primero = !d.Nombre ? 'presuNombre' : !d.Contacto ? 'presuContacto' : 'presuIdea';
      document.getElementById(primero).focus();
      return;
    }
    error.hidden = true;

    var msg = '¡Hola LUATEC! Quiero pedir un presupuesto.\n\n' +
      Object.keys(d).map(function (k) { return '• ' + k + ': ' + d[k]; }).join('\n');

    // WhatsApp: se abre en una pestaña nueva (en el celular, en la app)
    var url = 'https://wa.me/' + (CFG.whatsapp || '') + '?text=' + encodeURIComponent(msg);
    window.open(url, '_blank', 'noopener');
    nota.textContent = '¡Listo! Si WhatsApp no se abrió, escribinos al número que figura abajo.';

    // Copia por mail (opcional)
    if (CFG.emailPedidos && window.fetch) {
      var datos = Object.assign({ _subject: 'Nuevo pedido de presupuesto - ' + d.Nombre, _template: 'table' }, d);
      fetch('https://formsubmit.co/ajax/' + encodeURIComponent(CFG.emailPedidos), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(datos)
      }).catch(function () {});
    }
  });
})();

/* =========================================================
   LUATEC · Funciones generales
   Menú del celular, aparición al hacer scroll y año del pie.
   ========================================================= */
(function () {
  'use strict';
  document.documentElement.classList.add('js');

  // Datos de contacto desde assets/js/config.js
  var CFG = window.LUATEC_CONFIG || {};
  if (CFG.whatsapp) {
    document.querySelectorAll('a[href^="https://wa.me/"]').forEach(function (a) {
      a.href = a.href.replace(/wa\.me\/\d+/, 'wa.me/' + CFG.whatsapp);
    });
  }
  if (CFG.direccion) {
    document.querySelectorAll('[data-direccion]').forEach(function (el) { el.textContent = CFG.direccion; });
  }

  // Menú del celular
  var boton = document.querySelector('.nav-toggle');
  var menu = document.getElementById('navMobile');
  if (boton && menu) {
    boton.addEventListener('click', function () {
      var abierto = boton.getAttribute('aria-expanded') === 'true';
      boton.setAttribute('aria-expanded', String(!abierto));
      menu.classList.toggle('is-open', !abierto);
    });
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        boton.setAttribute('aria-expanded', 'false');
        menu.classList.remove('is-open');
      }
    });
  }

  // Los bloques con clase "reveal" aparecen suavemente al llegar a ellos
  var bloques = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-visible'); obs.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -60px 0px' });
    bloques.forEach(function (b) { obs.observe(b); });
  } else {
    bloques.forEach(function (b) { b.classList.add('is-visible'); });
  }

  // Música: solo suena cuando la persona toca el botón (nunca sola).
  // Las canciones se definen en musica/canciones.js
  var audio = document.getElementById('musica');
  var musicaBtn = document.getElementById('musicaBtn');
  var musicaSig = document.getElementById('musicaSig');
  var canciones = (window.LUATEC_MUSICA || []).filter(function (c) { return c && c.archivo; });
  if (audio && musicaBtn && canciones.length) {
    var actual = 0;
    var etiqueta = musicaBtn.querySelector('.music-btn__label');
    audio.volume = 0.5;

    var cargar = function (i) {
      actual = (i + canciones.length) % canciones.length;
      audio.src = 'musica/' + canciones[actual].archivo;
    };
    var reproducir = function () {
      var p = audio.play();
      if (p && p.catch) p.catch(function () { marcar(false); });
    };
    var marcar = function (sonando) {
      musicaBtn.classList.toggle('is-playing', sonando);
      musicaBtn.setAttribute('aria-pressed', String(sonando));
      musicaBtn.setAttribute('aria-label', sonando ? 'Pausar música' : 'Reproducir música');
      etiqueta.textContent = sonando ? canciones[actual].titulo : 'Música';
      if (lista) {
        lista.querySelectorAll('button').forEach(function (b, i) {
          b.classList.toggle('is-current', i === actual && sonando);
        });
      }
    };

    // Lista para elegir canción
    var lista = document.getElementById('musicaLista');
    var menu = document.getElementById('musicaMenu');
    if (lista && menu) {
      lista.innerHTML = canciones.map(function (c, i) {
        return '<li><button type="button" data-i="' + i + '"><strong>' + c.titulo + '</strong>' +
          (c.estilo ? '<span>' + c.estilo + '</span>' : '') + '</button></li>';
      }).join('');
      var abrir = function (si) { lista.hidden = !si; menu.setAttribute('aria-expanded', String(si)); };
      menu.addEventListener('click', function () { abrir(lista.hidden); });
      lista.addEventListener('click', function (e) {
        var b = e.target.closest('button');
        if (!b) return;
        cargar(Number(b.getAttribute('data-i')));
        reproducir();
        abrir(false);
      });
      document.addEventListener('click', function (e) {
        if (!lista.hidden && !e.target.closest('#musicaPlayer')) abrir(false);
      });
    }

    cargar(0);
    musicaBtn.addEventListener('click', function () {
      if (audio.paused) reproducir(); else audio.pause();
    });
    if (musicaSig) {
      if (canciones.length < 2) musicaSig.hidden = true;
      musicaSig.addEventListener('click', function () {
        cargar(actual + 1);
        reproducir();
      });
    }
    // Al terminar una canción pasa a la siguiente
    audio.addEventListener('ended', function () { cargar(actual + 1); reproducir(); });
    audio.addEventListener('play', function () { marcar(true); });
    audio.addEventListener('pause', function () { marcar(false); });
  } else if (musicaBtn) {
    musicaBtn.parentNode.hidden = true;
  }

  // Año actual en el pie
  var anio = document.getElementById('currentYear');
  if (anio) anio.textContent = new Date().getFullYear();
})();

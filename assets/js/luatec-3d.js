/* =========================================================
   LUATEC · Efecto 3D "vidrio líquido"
   ---------------------------------------------------------
   Dibuja una burbuja de vidrio que se deforma, gira y sigue
   el mouse, con la palabra LUATEC detrás (se ve refractada
   a través del vidrio). Usa Three.js (cargado desde CDN).

   Para cambiar el texto de fondo: editá TEXTO_FONDO.
   Para cambiar el color del brillo: editá COLOR_BRILLO.
   ========================================================= */
(function () {
  'use strict';

  var TEXTO_FONDO = 'LUATEC';
  var COLOR_BRILLO = '#4FA3FF';

  var contenedor = document.getElementById('glass3d');
  if (!contenedor) return;

  var reducirMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Si no hay Three.js o WebGL, se queda el blob hecho en CSS (fallback).
  if (!window.THREE || !soportaWebGL()) {
    contenedor.classList.add('glass3d--fallback');
    return;
  }

  var THREE = window.THREE;
  var ancho = contenedor.clientWidth;
  var alto = contenedor.clientHeight;
  var dpr = Math.min(window.devicePixelRatio || 1, 2);

  // ---------- Escena, cámara y render ----------
  var escena = new THREE.Scene();
  var camara = new THREE.PerspectiveCamera(35, ancho / alto, 0.1, 100);
  camara.position.set(0, 0, 7);

  var render = new THREE.WebGLRenderer({ antialias: true });
  render.setPixelRatio(dpr);
  render.setSize(ancho, alto);
  contenedor.appendChild(render.domElement);

  // Lo que está "detrás" del vidrio se dibuja primero en esta textura,
  // y la burbuja la lee deformada: así se ve la refracción.
  var detras = new THREE.WebGLRenderTarget(ancho * dpr, alto * dpr);

  // ---------- Fondo con la palabra LUATEC ----------
  var lienzoFondo = document.createElement('canvas');
  var texturaFondo = new THREE.CanvasTexture(lienzoFondo);
  var fondo = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.MeshBasicMaterial({ map: texturaFondo })
  );
  fondo.position.z = -1.6;
  escena.add(fondo);
  ajustarFondo();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(ajustarFondo);

  // ---------- La burbuja de vidrio ----------
  var geometria = new THREE.IcosahedronGeometry(1.05, 40);
  var posiciones = geometria.attributes.position;
  var original = Float32Array.from(posiciones.array);
  var colorBrillo = new THREE.Color(COLOR_BRILLO);

  var vidrio = new THREE.ShaderMaterial({
    uniforms: {
      tDetras: { value: detras.texture },
      uBrillo: { value: new THREE.Vector3(colorBrillo.r, colorBrillo.g, colorBrillo.b) }
    },
    vertexShader: [
      'varying vec3 vN; varying vec3 vP; varying vec4 vC;',
      'void main(){',
      '  vec4 mv = modelViewMatrix * vec4(position,1.0);',
      '  vN = normalize(normalMatrix * normal); vP = mv.xyz;',
      '  gl_Position = projectionMatrix * mv; vC = gl_Position;',
      '}'
    ].join('\n'),
    fragmentShader: [
      'uniform sampler2D tDetras; uniform vec3 uBrillo;',
      'varying vec3 vN; varying vec3 vP; varying vec4 vC;',
      'void main(){',
      '  vec3 n = normalize(vN); vec3 v = normalize(-vP);',
      '  vec2 uv = vC.xy / vC.w * 0.5 + 0.5;',
      '  float fres = pow(1.0 - max(dot(n, v), 0.0), 2.6);',
      '  vec2 off = n.xy * (0.05 + 0.16 * fres);',
      // refracción con un toque de arcoíris en los bordes
      '  vec3 col;',
      '  col.r = texture2D(tDetras, uv - off * 1.00).r;',
      '  col.g = texture2D(tDetras, uv - off * 1.06).g;',
      '  col.b = texture2D(tDetras, uv - off * 1.12).b;',
      '  col *= 0.94;',
      '  vec3 L1 = normalize(vec3(0.6, 0.7, 0.8)); vec3 L2 = normalize(vec3(-0.7, -0.5, 0.6));',
      '  float s1 = pow(max(dot(n, normalize(L1 + v)), 0.0), 140.0);',
      '  float s2 = pow(max(dot(n, normalize(L2 + v)), 0.0), 60.0);',
      '  col += vec3(1.0) * s1 * 1.3 + uBrillo * s2 * 0.8;',
      '  col += mix(vec3(0.85), uBrillo, 0.35) * fres * 0.75;',
      '  gl_FragColor = vec4(col, 1.0);',
      '}'
    ].join('\n')
  });

  var burbuja = new THREE.Mesh(geometria, vidrio);
  escena.add(burbuja);

  // ---------- Interacción con el mouse ----------
  var mouse = { x: 0, y: 0 };
  var objetivo = { x: 0, y: 0 };
  window.addEventListener('pointermove', function (e) {
    var r = contenedor.getBoundingClientRect();
    objetivo.x = Math.max(-1.5, Math.min(1.5, ((e.clientX - r.left) / r.width - 0.5) * 2));
    objetivo.y = Math.max(-1.5, Math.min(1.5, ((e.clientY - r.top) / r.height - 0.5) * 2));
  });

  // ---------- Animación ----------
  var reloj = new THREE.Clock();
  var visible = true;
  var v = new THREE.Vector3();

  function deformar(t) {
    for (var i = 0; i < posiciones.count; i++) {
      v.set(original[i * 3], original[i * 3 + 1], original[i * 3 + 2]).normalize();
      // Suma de ondas: da la forma "líquida" que se va moviendo
      var onda =
        0.22 * Math.sin(v.x * 2.1 + t * 0.9) * Math.cos(v.y * 1.7 + t * 0.7) +
        0.14 * Math.sin(v.z * 3.0 + t * 1.3) +
        0.08 * Math.sin((v.x + v.y) * 4.0 - t * 1.1);
      v.multiplyScalar(1.05 * (1 + onda));
      posiciones.setXYZ(i, v.x, v.y, v.z);
    }
    posiciones.needsUpdate = true;
    geometria.computeVertexNormals();
  }

  function dibujar() {
    burbuja.visible = false;
    render.setRenderTarget(detras);
    render.render(escena, camara);
    render.setRenderTarget(null);
    burbuja.visible = true;
    render.render(escena, camara);
  }

  function animar() {
    requestAnimationFrame(animar);
    if (!visible) return;
    var t = reducirMovimiento ? 0 : reloj.getElapsedTime();

    mouse.x += (objetivo.x - mouse.x) * 0.05;
    mouse.y += (objetivo.y - mouse.y) * 0.05;

    if (!reducirMovimiento) deformar(t);

    burbuja.rotation.y = t * 0.25 + mouse.x * 0.6;
    burbuja.rotation.x = Math.sin(t * 0.3) * 0.3 + mouse.y * 0.4;
    burbuja.position.x = mouse.x * 0.6 + Math.sin(t * 0.5) * 0.3;
    burbuja.position.y = -mouse.y * 0.4 + Math.cos(t * 0.6) * 0.2;

    dibujar();
  }

  deformar(0);
  animar();

  // No gastar batería cuando el hero no está en pantalla
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entradas) {
      visible = entradas[0].isIntersecting;
    }).observe(contenedor);
  }

  window.addEventListener('resize', function () {
    ancho = contenedor.clientWidth;
    alto = contenedor.clientHeight;
    camara.aspect = ancho / alto;
    camara.updateProjectionMatrix();
    render.setSize(ancho, alto);
    detras.setSize(ancho * dpr, alto * dpr);
    ajustarFondo();
  });

  // Dibuja el degradé + el texto y estira el plano para que llene el panel
  function ajustarFondo() {
    var distancia = camara.position.z - fondo.position.z;
    var h = 2 * distancia * Math.tan(THREE.MathUtils.degToRad(camara.fov / 2));
    var w = h * camara.aspect;
    fondo.scale.set(w, h, 1);

    var c = lienzoFondo;
    c.width = 1024; c.height = Math.round(1024 / camara.aspect);
    var ctx = c.getContext('2d');
    var g = ctx.createRadialGradient(c.width * 0.3, c.height * 0.2, 0, c.width * 0.3, c.height * 0.2, c.width * 1.1);
    g.addColorStop(0, '#16246e');
    g.addColorStop(0.55, '#050a33');
    g.addColorStop(1, '#000000');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, c.width, c.height);

    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    var tam = 260;
    ctx.font = '800 ' + tam + 'px Unbounded, "Space Grotesk", sans-serif';
    var medida = ctx.measureText(TEXTO_FONDO).width;
    tam = tam * Math.min(1, (c.width * 0.86) / medida);
    ctx.font = '800 ' + tam + 'px Unbounded, "Space Grotesk", sans-serif';
    ctx.fillText(TEXTO_FONDO, c.width / 2, c.height / 2);
    texturaFondo.needsUpdate = true;
  }

  // ---------- Ayudantes ----------
  function soportaWebGL() {
    try {
      var c = document.createElement('canvas');
      return !!(c.getContext('webgl') || c.getContext('experimental-webgl'));
    } catch (e) { return false; }
  }

})();

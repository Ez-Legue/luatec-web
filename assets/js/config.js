/* =========================================================
   LUATEC · TUS DATOS
   ---------------------------------------------------------
   Cambiá acá tus datos y toda la página se actualiza sola:
   el carrito, los botones de WhatsApp y el pie de página.
   La web NO cobra: el cliente arma el carrito y te manda el
   pedido escrito por WhatsApp. El pago lo coordinás vos.
   ========================================================= */

window.LUATEC_CONFIG = {
  // Tu WhatsApp con código de país, sin + ni espacios ni guiones.
  // Ej: +54 9 11 1234-5678  →  "5491112345678"
  whatsapp: "5491100000000",

  // Cómo se ve tu número escrito en el pie de página
  whatsappVisible: "+54 9 11 0000-0000",

  // Dónde se retiran los pedidos
  direccion: "Ciudad Evita, Buenos Aires",

  // Texto que ve el cliente cuando elige "Envío a domicilio"
  textoEnvio: "El costo del envío depende de tu zona: te lo pasamos por WhatsApp.",

  // Texto que ve el cliente sobre el pago (la web no cobra)
  textoPago: "No pagás nada ahora. Te respondemos por WhatsApp para confirmar stock, colores y la forma de pago (transferencia, Mercado Pago o efectivo al retirar).",

  // Opcional: si ponés un mail, el formulario "A medida" también te manda copia ahí.
  // Dejalo vacío ("") para recibir todo solo por WhatsApp.
  emailPedidos: ""
};

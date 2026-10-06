/* =========================================================
   LUATEC · DATOS DE CONTACTO Y COBRO
   ---------------------------------------------------------
   Cambiá acá tus datos y toda la página se actualiza sola
   (botones de WhatsApp, carrito, mail de pedidos y pago).
   ========================================================= */

window.LUATEC_CONFIG = {
  // Tu WhatsApp con código de país, sin + ni espacios ni guiones.
  // Ej: 54 9 11 1234-5678  →  "5491112345678"
  whatsapp: "5491100000000",

  // Mail donde te llegan los pedidos. Dejalo vacío ("") hasta tenerlo:
  // mientras tanto los pedidos te llegan solo por WhatsApp.
  // La PRIMERA vez que alguien compre, te va a llegar un mail de
  // FormSubmit para activarlo: tocás "Activate" y listo.
  emailPedidos: "",

  // Mercado Pago: tu alias (lo ves en la app → Tu perfil → Tu CVU/alias)
  mercadoPagoAlias: "",

  // Titular de la cuenta, para que el cliente confirme a quién le paga
  mercadoPagoTitular: "",

  // Dónde se retiran los pedidos
  direccion: "Ciudad Evita, Buenos Aires",

  // Texto sobre el envío que ve el cliente al elegir "Envío a domicilio"
  textoEnvio: "El costo del envío se calcula según tu zona y te lo confirmamos por WhatsApp."
};

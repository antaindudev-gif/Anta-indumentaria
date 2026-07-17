// lib/emailTemplates.ts — Templates HTML para emails transaccionales de Anta Indumentaria

const BASE = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
  background: #000000;
  color: #ffffff;
  margin: 0;
  padding: 0;
`;

function wrapper(content: string) {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Anta Indumentaria</title>
</head>
<body style="${BASE}">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#000; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%;">

          <!-- HEADER -->
          <tr>
            <td style="background:#000; border-bottom: 1px solid #222; padding: 32px 40px; text-align:center;">
              <p style="font-family:Georgia,serif; font-size:28px; font-weight:bold; letter-spacing:0.3em; color:#ffffff; margin:0; text-transform:uppercase;">
                ANTA
              </p>
              <p style="font-family:Arial,sans-serif; font-size:9px; letter-spacing:0.4em; color:#e7ff00; margin:4px 0 0; text-transform:uppercase;">
                INDUMENTARIA
              </p>
            </td>
          </tr>

          <!-- CONTENT -->
          <tr>
            <td style="background:#0a0a0a; padding: 48px 40px;">
              ${content}
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background:#000; border-top: 1px solid #222; padding: 32px 40px; text-align:center;">
              <p style="font-size:10px; color:#555; letter-spacing:0.2em; text-transform:uppercase; margin:0 0 8px;">
                ¿Dudas? Escribenos a
              </p>
              <a href="mailto:contacto@antaindumentaria.cl" style="font-size:11px; color:#e7ff00; text-decoration:none; letter-spacing:0.15em;">
                contacto@antaindumentaria.cl
              </a>
              <p style="font-size:9px; color:#333; letter-spacing:0.15em; text-transform:uppercase; margin:24px 0 0;">
                © ${new Date().getFullYear()} ANTA Indumentaria · Chile
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

// ─── EMAIL: ORDEN RECIBIDA (Transferencia pendiente) ───────────────────────
export function emailOrdenRecibida(opts: {
  name: string;
  orderId: string;
  total: number;
  subtotal: number;
  discountAmount: number;
  couponCode: string | null;
  isPreOrder?: boolean;
  depositAmount?: number;
  items: { name: string; size: string; quantity: number; price: number }[];
}) {
  const itemRows = opts.items.map(i => `
    <tr>
      <td style="padding:12px 0; border-bottom:1px solid #1a1a1a; font-size:13px; color:#ccc; letter-spacing:0.05em;">
        ${i.name} <span style="color:#555;">(Talla ${i.size})</span>
      </td>
      <td style="padding:12px 0; border-bottom:1px solid #1a1a1a; font-size:13px; color:#ccc; text-align:right;">
        x${i.quantity}
      </td>
      <td style="padding:12px 0; border-bottom:1px solid #1a1a1a; font-size:13px; color:#e7ff00; text-align:right; font-weight:bold;">
        $${(i.price * i.quantity).toLocaleString('es-CL')}
      </td>
    </tr>
  `).join('');

  const discountRow = opts.discountAmount > 0 ? `
    <tr>
      <td colspan="2" style="padding:8px 0; font-size:11px; color:#555; letter-spacing:0.15em; text-transform:uppercase;">
        Descuento${opts.couponCode ? ` (${opts.couponCode})` : ''}
      </td>
      <td style="padding:8px 0; text-align:right; font-size:13px; color:#22c55e; font-weight:bold;">
        -$${opts.discountAmount.toLocaleString('es-CL')}
      </td>
    </tr>
  ` : '';

  const preOrderBlock = opts.isPreOrder && opts.depositAmount ? `
    <div style="background:#1a1200; border-left:3px solid #e7ff00; padding:16px 20px; margin:16px 0;">
      <p style="font-size:10px; letter-spacing:0.2em; text-transform:uppercase; color:#e7ff00; margin:0 0 8px; font-weight:bold;">🔖 Pre-Order — Abono del 50%</p>
      <p style="font-size:13px; color:#ccc; margin:0 0 4px;">Abono inicial (50%): <strong style="color:#e7ff00;">$${opts.depositAmount.toLocaleString('es-CL')}</strong></p>
      <p style="font-size:13px; color:#ccc; margin:0;">Saldo al recibir el producto: <strong style="color:#fff;">$${(opts.total - opts.depositAmount).toLocaleString('es-CL')}</strong></p>
      <p style="font-size:11px; color:#888; margin:8px 0 0; text-transform:uppercase; letter-spacing:0.1em;">Te avisaremos cuando llegue el producto para coordinar el pago del saldo.</p>
    </div>
  ` : '';

  return wrapper(`
    <p style="font-size:10px; letter-spacing:0.35em; color:#e7ff00; text-transform:uppercase; margin:0 0 20px;">
      ${opts.isPreOrder ? 'Pre-Order Recibida' : 'Orden Recibida'}
    </p>
    <h1 style="font-size:26px; font-weight:bold; letter-spacing:0.1em; text-transform:uppercase; color:#fff; margin:0 0 12px;">
      ¡Hola, ${opts.name}!
    </h1>
    <p style="font-size:14px; color:#888; line-height:1.8; letter-spacing:0.05em; text-transform:uppercase; margin:0 0 32px;">
      ${opts.isPreOrder
        ? 'Recibimos tu pre-order. Estamos verificando tu comprobante de transferencia y te avisaremos en cuanto el abono sea aprobado.'
        : 'Recibimos tu orden. Estamos verificando tu comprobante de transferencia y te avisaremos por correo en cuanto sea aprobado.'}
    </p>

    ${preOrderBlock}

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      ${itemRows}
      ${discountRow}
      <tr>
        <td colspan="2" style="padding:16px 0 4px; font-size:10px; color:#555; letter-spacing:0.2em; text-transform:uppercase;">Total</td>
        <td style="padding:16px 0 4px; text-align:right; font-size:20px; font-weight:bold; color:#e7ff00;">
          $${opts.total.toLocaleString('es-CL')}
        </td>
      </tr>
    </table>

    <div style="background:#111; border-left:3px solid #e7ff00; padding:16px 20px; margin-top:32px;">
      <p style="font-size:10px; letter-spacing:0.2em; text-transform:uppercase; color:#888; margin:0 0 4px;">ID de Orden</p>
      <p style="font-size:12px; color:#fff; font-family:monospace; margin:0;">#${opts.orderId}</p>
    </div>
  `);
}

// ─── EMAIL: PAGO APROBADO ───────────────────────────────────────────────────
export function emailPagoAprobado(opts: {
  name: string;
  orderId: string;
  total: number;
}) {
  return wrapper(`
    <p style="font-size:10px; letter-spacing:0.35em; color:#e7ff00; text-transform:uppercase; margin:0 0 20px;">
      ✅ Pago Aprobado
    </p>
    <h1 style="font-size:26px; font-weight:bold; letter-spacing:0.1em; text-transform:uppercase; color:#fff; margin:0 0 12px;">
      ¡Tu pago fue verificado!
    </h1>
    <p style="font-size:14px; color:#888; line-height:1.8; letter-spacing:0.05em; text-transform:uppercase; margin:0 0 32px;">
      Hola <strong style="color:#fff;">${opts.name}</strong>, tu comprobante de transferencia fue revisado y <strong style="color:#e7ff00;">aprobado exitosamente</strong>. Ya estamos preparando tu pedido.
    </p>

    <div style="background:#111; border:1px solid #222; padding:24px; margin-bottom:32px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="font-size:10px; color:#555; letter-spacing:0.2em; text-transform:uppercase;">ID de Orden</td>
          <td style="font-size:10px; color:#555; letter-spacing:0.2em; text-transform:uppercase; text-align:right;">Total</td>
        </tr>
        <tr>
          <td style="font-size:13px; color:#fff; font-family:monospace; padding-top:6px;">#${opts.orderId}</td>
          <td style="font-size:18px; color:#e7ff00; font-weight:bold; text-align:right; padding-top:6px;">$${opts.total.toLocaleString('es-CL')}</td>
        </tr>
      </table>
    </div>

    <p style="font-size:12px; color:#555; line-height:1.8; letter-spacing:0.08em; text-transform:uppercase;">
      Te notificaremos cuando tu pedido sea despachado con el número de seguimiento. Gracias por confiar en <strong style="color:#fff;">ANTA Indumentaria</strong>.
    </p>
  `);
}

// ─── EMAIL: PAGO RECHAZADO ──────────────────────────────────────────────────
export function emailPagoRechazado(opts: {
  name: string;
  orderId: string;
}) {
  return wrapper(`
    <p style="font-size:10px; letter-spacing:0.35em; color:#ef4444; text-transform:uppercase; margin:0 0 20px;">
      ❌ Problema con tu Pago
    </p>
    <h1 style="font-size:26px; font-weight:bold; letter-spacing:0.1em; text-transform:uppercase; color:#fff; margin:0 0 12px;">
      No pudimos verificar tu transferencia
    </h1>
    <p style="font-size:14px; color:#888; line-height:1.8; letter-spacing:0.05em; text-transform:uppercase; margin:0 0 32px;">
      Hola <strong style="color:#fff;">${opts.name}</strong>, revisamos tu comprobante para la orden <strong style="color:#fff;">#${opts.orderId}</strong> pero no pudimos verificar el pago. Tu pedido ha sido pausado temporalmente.
    </p>

    <div style="background:#1a0a0a; border-left:3px solid #ef4444; padding:16px 20px; margin-bottom:32px;">
      <p style="font-size:12px; color:#ef4444; letter-spacing:0.1em; text-transform:uppercase; margin:0 0 8px; font-weight:bold;">Posibles causas</p>
      <ul style="font-size:12px; color:#888; letter-spacing:0.05em; text-transform:uppercase; line-height:2; margin:0; padding-left:16px;">
        <li>El comprobante era ilegible o estaba cortado</li>
        <li>El monto transferido no coincidía con el total</li>
        <li>La transferencia fue a una cuenta incorrecta</li>
      </ul>
    </div>

    <p style="font-size:12px; color:#555; line-height:1.8; letter-spacing:0.08em; text-transform:uppercase;">
      Si crees que esto es un error, por favor escríbenos a
      <a href="mailto:contacto@antaindumentaria.cl" style="color:#e7ff00; text-decoration:none;">contacto@antaindumentaria.cl</a>
      indicando tu número de orden.
    </p>
  `);
}

// ─── EMAIL: PEDIDO ENVIADO ──────────────────────────────────────────────────
export function emailPedidoEnviado(opts: {
  name: string;
  orderId: string;
  trackingUrl: string | null;
}) {
  const trackingBlock = opts.trackingUrl
    ? `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
      <tr>
        <td align="center">
          <a href="${opts.trackingUrl}" style="display:inline-block; background:#e7ff00; color:#000; font-size:11px; font-weight:bold; letter-spacing:0.3em; text-transform:uppercase; padding:16px 32px; text-decoration:none;">
            Rastrear mi Pedido →
          </a>
        </td>
      </tr>
    </table>
    <p style="font-size:11px; color:#555; letter-spacing:0.08em; text-transform:uppercase; text-align:center;">
      Si el link no funciona, copia esta URL: <br/>
      <span style="color:#888;">${opts.trackingUrl}</span>
    </p>`
    : `<p style="font-size:12px; color:#555; letter-spacing:0.08em; text-transform:uppercase;">
        En breve recibirás el número de seguimiento por este mismo correo.
      </p>`;

  return wrapper(`
    <p style="font-size:10px; letter-spacing:0.35em; color:#e7ff00; text-transform:uppercase; margin:0 0 20px;">
      📦 Tu Pedido Está en Camino
    </p>
    <h1 style="font-size:26px; font-weight:bold; letter-spacing:0.1em; text-transform:uppercase; color:#fff; margin:0 0 12px;">
      ¡Tu pedido fue despachado!
    </h1>
    <p style="font-size:14px; color:#888; line-height:1.8; letter-spacing:0.05em; text-transform:uppercase; margin:0 0 32px;">
      Hola <strong style="color:#fff;">${opts.name}</strong>, tu orden <strong style="color:#fff;">#${opts.orderId}</strong> ya está en camino hacia ti.
    </p>
    ${trackingBlock}
  `);
}

// ─── EMAIL: BOLETA EMITIDA ──────────────────────────────────────────────────
export function emailBoleta(opts: {
  name: string;
  orderId: string;
  total: number;
  boletaUrl: string;
}) {
  return wrapper(`
    <p style="font-size:10px; letter-spacing:0.35em; color:#e7ff00; text-transform:uppercase; margin:0 0 20px;">
      🧾 Boleta / Comprobante
    </p>
    <h1 style="font-size:26px; font-weight:bold; letter-spacing:0.1em; text-transform:uppercase; color:#fff; margin:0 0 12px;">
      Aquí está tu boleta
    </h1>
    <p style="font-size:14px; color:#888; line-height:1.8; letter-spacing:0.05em; text-transform:uppercase; margin:0 0 32px;">
      Hola <strong style="color:#fff;">${opts.name}</strong>, te enviamos la boleta correspondiente a tu compra en ANTA Indumentaria.
    </p>

    <div style="background:#111; border:1px solid #222; padding:24px; margin-bottom:32px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="font-size:10px; color:#555; letter-spacing:0.2em; text-transform:uppercase;">ID de Orden</td>
          <td style="font-size:10px; color:#555; letter-spacing:0.2em; text-transform:uppercase; text-align:right;">Total</td>
        </tr>
        <tr>
          <td style="font-size:13px; color:#fff; font-family:monospace; padding-top:6px;">#${opts.orderId}</td>
          <td style="font-size:18px; color:#e7ff00; font-weight:bold; text-align:right; padding-top:6px;">$${opts.total.toLocaleString('es-CL')}</td>
        </tr>
      </table>
    </div>

    <p style="font-size:12px; color:#888; letter-spacing:0.08em; text-transform:uppercase; margin:0 0 16px;">
      La boleta va adjunta a este correo. También puedes descargarla desde el siguiente enlace:
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td align="center">
          <a href="${opts.boletaUrl}" style="display:inline-block; background:#e7ff00; color:#000; font-size:11px; font-weight:bold; letter-spacing:0.3em; text-transform:uppercase; padding:16px 32px; text-decoration:none;">
            Descargar Boleta →
          </a>
        </td>
      </tr>
    </table>

    <p style="font-size:11px; color:#555; letter-spacing:0.08em; text-transform:uppercase; text-align:center;">
      Gracias por tu compra en <strong style="color:#fff;">ANTA Indumentaria</strong>.
    </p>
  `);
}

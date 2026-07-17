import { MercadoPagoConfig, Preference, Payment } from "mercadopago";

/**
 * Returns an authenticated MercadoPago client.
 * Uses MERCADOPAGO_ACCESS_TOKEN from env — never exposed to the client.
 */
export function getMercadoPagoClient(): MercadoPagoConfig {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) {
    throw new Error(
      "MERCADOPAGO_ACCESS_TOKEN no está configurado en las variables de entorno."
    );
  }
  return new MercadoPagoConfig({ accessToken: token });
}

export { Preference, Payment };

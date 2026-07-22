import { NextRequest, NextResponse } from "next/server";

/**
 * Test endpoint to simulate MercadoPago webhook notifications.
 * GET /api/mercadopago/test-webhook?orderId=xxx&paymentId=123&status=approved
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("orderId");
  const paymentId = searchParams.get("paymentId") || "test-payment-123";
  const status = searchParams.get("status") || "approved";

  if (!orderId) {
    return NextResponse.json({ error: "Missing orderId parameter" }, { status: 400 });
  }

  // Simulate MP webhook payload
  const webhookPayload = {
    action: "payment.updated",
    api_version: "v1",
    data: { id: paymentId },
    date_created: new Date().toISOString(),
    id: Math.floor(Math.random() * 1000000),
    live_mode: false,
    type: "payment",
    user_id: "123456789",
  };

  // Call our own webhook
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const webhookUrl = `${baseUrl}/api/mercadopago/webhook`;

  console.log("🧪 Calling webhook:", webhookUrl);
  console.log("📦 Payload:", webhookPayload);

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(webhookPayload),
  });

  const result = await response.json();

  return NextResponse.json({
    message: "Test webhook sent",
    webhookUrl,
    payload: webhookPayload,
    webhookResponse: result,
    note: `This simulated a ${status} payment for order ${orderId}`,
  });
}

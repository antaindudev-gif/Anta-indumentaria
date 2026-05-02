import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders, orderItems } from "@/lib/schema";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, customer, shippingAddress, notes, paymentMethod, subtotal, shippingCost, total } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items" }, { status: 400 });
    }

    // Create the order
    const [order] = await db.insert(orders).values({
      guestEmail: customer.email,
      status: paymentMethod === 'transfer' ? 'pending' : 'pending',
      paymentMethod: paymentMethod === 'mercadopago' ? 'mercadopago' : 'transfer',
      subtotal: String(subtotal),
      shippingCost: String(shippingCost),
      total: String(total),
      shippingAddress: {
        name: customer.name,
        phone: customer.phone,
        rut: customer.rut,
        region: shippingAddress.region,
        city: shippingAddress.city,
        address: shippingAddress.address,
      },
      notes,
    }).returning();

    // Create order items
    for (const item of items) {
      await db.insert(orderItems).values({
        orderId: order.id,
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        unitPrice: String(item.unitPrice),
        total: String(item.unitPrice * item.quantity),
        productSnapshot: {
          name: item.name,
          size: item.size,
          image: item.image,
        },
      });
    }

    // TODO: When MercadoPago tokens are ready, create payment preference here
    // and return the paymentUrl
    // For now, return the orderId for confirmation page
    
    return NextResponse.json({ 
      orderId: order.id,
      paymentUrl: null, // Will be MercadoPago URL when configured
    });

  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}

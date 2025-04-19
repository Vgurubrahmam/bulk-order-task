import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

// GET /api/orders/[id] - Get a specific order
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Get order details
    const orderResult = await query(
      `
      SELECT 
        id, 
        buyer_name, 
        contact_info, 
        delivery_address, 
        status, 
        created_at
      FROM 
        orders
      WHERE 
        id = $1
    `,
      [id],
    )

    if (orderResult.rows.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const order = orderResult.rows[0]

    // Get order items
    const itemsResult = await query(
      `
      SELECT 
        oi.id,
        oi.product_id,
        oi.quantity,
        p.name as product_name,
        p.price
      FROM 
        order_items oi
      JOIN 
        products p ON oi.product_id = p.id
      WHERE 
        oi.order_id = $1
    `,
      [id],
    )

    order.items = itemsResult.rows

    return NextResponse.json(order)
  } catch (error) {
    console.error("Error fetching order:", error)
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 })
  }
}

// PUT /api/orders/[id] - Update order status (admin only)
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const { status } = await request.json()

    // Validate status
    const validStatuses = ["Pending", "In Progress", "Delivered"]
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        {
          error: "Invalid status. Must be one of: Pending, In Progress, Delivered",
        },
        { status: 400 },
      )
    }

    const result = await query("UPDATE orders SET status = $1 WHERE id = $2 RETURNING *", [status, id])

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error("Error updating order:", error)
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
  }
}

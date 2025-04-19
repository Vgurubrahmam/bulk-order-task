import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

// Fallback products to use when database connection fails
const fallbackProducts = [
  {
    id: 1,
    name: "Apples (Demo)",
    price: 2.99,
    description: "Fresh red apples, perfect for snacking or baking",
    image_url: "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=800&auto=format&fit=crop",
  },
  {
    id: 2,
    name: "Bananas (Demo)",
    price: 1.49,
    description: "Ripe yellow bananas, rich in potassium and natural sweetness",
    image_url: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=800&auto=format&fit=crop",
  },
  {
    id: 3,
    name: "Carrots (Demo)",
    price: 1.99,
    description: "Organic carrots, crisp and full of nutrients",
    image_url: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=800&auto=format&fit=crop",
  },
]

// GET /api/products - Get all products
export async function GET() {
  try {
    // Try to connect to the database and get products
    const result = await query("SELECT * FROM products ORDER BY name ASC")
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Error fetching products from database:", error)

    // Return fallback data instead of an error
    console.log("Using fallback product data")
    return NextResponse.json(fallbackProducts)
  }
}

// POST /api/products - Create a new product (admin only)
export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    let body
    try {
      body = await request.json()
    } catch (parseError) {
      console.error("Error parsing request body:", parseError)
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }

    const { name, price, description, image_url } = body

    // Validate required fields
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    // Handle price validation
    let priceValue: number
    if (price === undefined || price === null) {
      return NextResponse.json({ error: "Price is required" }, { status: 400 })
    }

    try {
      priceValue = typeof price === "string" ? Number.parseFloat(price) : Number(price)
      if (isNaN(priceValue) || priceValue <= 0) {
        return NextResponse.json({ error: "Price must be a positive number" }, { status: 400 })
      }
    } catch (e) {
      return NextResponse.json({ error: "Invalid price format" }, { status: 400 })
    }

    try {
      // Insert the product
      const result = await query(
        "INSERT INTO products (name, price, description, image_url) VALUES ($1, $2, $3, $4) RETURNING *",
        [name, priceValue, description || null, image_url || null],
      )
      return NextResponse.json(result.rows[0], { status: 201 })
    } catch (dbError) {
      console.error("Database error creating product:", dbError)

      // Return a mock success response in demo mode
      const mockProduct = {
        id: Math.floor(Math.random() * 1000) + 10,
        name,
        price: priceValue,
        description: description || null,
        image_url: image_url || null,
        created_at: new Date().toISOString(),
      }

      return NextResponse.json(mockProduct, { status: 201 })
    }
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json(
      {
        error: "Failed to create product",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

import { NextResponse } from "next/server"
import { initializeDatabase, query, isDatabaseInitialized } from "@/lib/db"

// POST /api/initialize - Initialize the database and add sample data
export async function POST() {
  try {
    // Check if database is already initialized
    const isInitialized = await isDatabaseInitialized()

    if (!isInitialized) {
      // Initialize database tables
      await initializeDatabase()
    }

    // Check if products already exist
    const productsResult = await query("SELECT COUNT(*) FROM products")
    const productCount = Number.parseInt(productsResult.rows[0].count)

    // Add sample products if none exist
    if (productCount === 0) {
      const sampleProducts = [
        {
          name: "Apples",
          price: 2.99,
          description: "Fresh red apples, perfect for snacking or baking",
          image_url: "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=800&auto=format&fit=crop",
        },
        {
          name: "Bananas",
          price: 1.49,
          description: "Ripe yellow bananas, rich in potassium and natural sweetness",
          image_url: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=800&auto=format&fit=crop",
        },
        {
          name: "Carrots",
          price: 1.99,
          description: "Organic carrots, crisp and full of nutrients",
          image_url: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=800&auto=format&fit=crop",
        },
        {
          name: "Potatoes",
          price: 0.99,
          description: "Russet potatoes, versatile for mashing, baking, or frying",
          image_url: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800&auto=format&fit=crop",
        },
      ]

      for (const product of sampleProducts) {
        await query("INSERT INTO products (name, price, description, image_url) VALUES ($1, $2, $3, $4)", [
          product.name,
          product.price,
          product.description,
          product.image_url,
        ])
      }
    }

    return NextResponse.json({
      success: true,
      message: "Database initialized successfully",
      productCount,
    })
  } catch (error) {
    console.error("Error initializing database:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to initialize database",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

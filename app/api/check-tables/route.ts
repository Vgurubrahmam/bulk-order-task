import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET() {
  try {
    // Check if required tables exist
    const tablesResult = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('products', 'orders', 'order_items')
    `)

    const existingTables = tablesResult.rows.map((row) => row.table_name)
    const requiredTables = ["products", "orders", "order_items"]
    const missingTables = requiredTables.filter((table) => !existingTables.includes(table))

    return NextResponse.json({
      success: missingTables.length === 0,
      existingTables,
      missingTables,
      initialized: missingTables.length === 0,
    })
  } catch (error) {
    console.error("Error checking tables:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to check database tables",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET() {
  try {
    // Simple query to test the database connection
    const result = await query("SELECT NOW() as time")

    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      time: result.rows[0].time,
    })
  } catch (error) {
    console.error("Database connection test failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Database connection failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

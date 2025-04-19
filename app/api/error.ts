import { NextResponse } from "next/server"

export default function handleApiError(error: unknown) {
  console.error("API error:", error)

  const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
  const errorStack = error instanceof Error ? error.stack : undefined

  return NextResponse.json(
    {
      error: "An error occurred while processing your request",
      message: errorMessage,
      stack: process.env.NODE_ENV === "development" ? errorStack : undefined,
    },
    { status: 500 },
  )
}

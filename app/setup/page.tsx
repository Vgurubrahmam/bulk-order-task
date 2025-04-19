"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Check, AlertCircle, Info } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

export default function SetupPage() {
  const [initializing, setInitializing] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [demoMode, setDemoMode] = useState(false)

  async function initializeDatabase() {
    setInitializing(true)
    setError(null)

    try {
      const response = await fetch("/api/initialize", {
        method: "POST",
      })

      // Try to parse as JSON, but don't throw if it fails
      let data
      try {
        data = await response.json()
      } catch (jsonError) {
        console.error("Error parsing JSON:", jsonError)
        // If we can't parse JSON, try to get the text
        const text = await response.text().catch(() => "Unknown error")
        throw new Error(`Failed to initialize database: ${text.substring(0, 100)}...`)
      }

      if (!response.ok) {
        throw new Error(data.error || "Failed to initialize database")
      }

      setInitialized(true)
      toast.success("Database initialized successfully!")
    } catch (err) {
      console.error("Error initializing database:", err)
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
      toast.error("Failed to initialize database")

      // Enable demo mode
      setDemoMode(true)
    } finally {
      setInitializing(false)
    }
  }

  function enableDemoMode() {
    setDemoMode(true)
    setInitialized(true)
    toast.success("Demo mode enabled!")
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="mx-auto max-w-md">
        <CardHeader>
          <CardTitle>Setup Your Application</CardTitle>
          <CardDescription>Initialize your database with sample data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="text-center">
              {initialized ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="rounded-full bg-green-100 p-3 dark:bg-green-900">
                    <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="font-medium">
                    {demoMode ? "Demo mode enabled successfully!" : "Database initialized successfully!"}
                  </p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="rounded-full bg-red-100 p-3 dark:bg-red-900">
                    <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <p className="font-medium text-red-600 dark:text-red-400">Initialization failed</p>
                  <p className="text-sm text-muted-foreground">{error}</p>

                  <div className="mt-4 rounded-md bg-yellow-50 p-4 dark:bg-yellow-900/20">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <Info className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                          Try Demo Mode Instead
                        </h3>
                        <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                          <p>
                            You can continue using the application in demo mode without a database connection. Some
                            features will be limited.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  Click the button below to initialize your database with sample products.
                </p>
              )}
            </div>

            <div className="flex flex-col gap-4">
              {!initialized && !demoMode && (
                <Button onClick={initializeDatabase} disabled={initializing} className="w-full">
                  {initializing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Initializing...
                    </>
                  ) : (
                    "Initialize Database"
                  )}
                </Button>
              )}

              {error && !demoMode && (
                <Button onClick={enableDemoMode} variant="outline" className="w-full">
                  Enable Demo Mode
                </Button>
              )}

              {(initialized || demoMode) && (
                <Button asChild variant="outline">
                  <Link href="/">Go to Homepage</Link>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AlertCircle } from "lucide-react"

export default function Home() {
  const [demoMode, setDemoMode] = useState(false)

  useEffect(() => {
    // Check if we're in demo mode by trying to connect to the database
    async function checkDatabaseConnection() {
      try {
        const response = await fetch("/api/test-connection")
        const data = await response.json().catch(() => ({ success: false }))
        setDemoMode(!data.success)
      } catch (error) {
        console.error("Error checking database connection:", error)
        setDemoMode(true)
      }
    }

    checkDatabaseConnection()
  }, [])

  return (
    <div className="container mx-auto px-4 py-12">
      {demoMode && (
        <div className="mb-8 rounded-md bg-yellow-50 p-4 dark:bg-yellow-900/20">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-yellow-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Demo Mode Active</h3>
              <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                <p>
                  The application is running in demo mode due to database connection issues. You can still explore the
                  application, but some features may be limited.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <section className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight">Fresh Produce Bulk Orders</h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
          Quality vegetables and fruits for your business. Place bulk orders with ease and track your deliveries.
        </p>
        <div className="flex justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/products">Browse Products</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/orders/track">Track Order</Link>
          </Button>
          <Button asChild variant="ghost" size="lg">
            <Link href="/setup">Setup Database</Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-8 md:grid-cols-3">
        <div className="rounded-lg border p-6 text-center">
          <h2 className="mb-3 text-xl font-semibold">Browse Products</h2>
          <p className="mb-4 text-muted-foreground">
            Explore our wide range of fresh vegetables and fruits available for bulk orders.
          </p>
          <Button asChild variant="secondary">
            <Link href="/products">View Catalog</Link>
          </Button>
        </div>
        <div className="rounded-lg border p-6 text-center">
          <h2 className="mb-3 text-xl font-semibold">Place Orders</h2>
          <p className="mb-4 text-muted-foreground">
            Easily place bulk orders by specifying products, quantities, and delivery details.
          </p>
          <Button asChild variant="secondary">
            <Link href="/orders/new">Order Now</Link>
          </Button>
        </div>
        <div className="rounded-lg border p-6 text-center">
          <h2 className="mb-3 text-xl font-semibold">Track Orders</h2>
          <p className="mb-4 text-muted-foreground">Check the status of your placed orders from pending to delivery.</p>
          <Button asChild variant="secondary">
            <Link href="/orders/track">Track Order</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}

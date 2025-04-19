"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, AlertCircle } from "lucide-react"
import { toast } from "sonner"

interface Product {
  id: number
  name: string
  price: number
  description: string
  image_url: string
}

// Fallback products to use when API fails
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

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [demoMode, setDemoMode] = useState(false)

  async function fetchProducts() {
    try {
      setLoading(true)
      const response = await fetch("/api/products")

      // Check if response is OK before trying to parse JSON
      if (!response.ok) {
        console.error("API returned error status:", response.status, response.statusText)
        throw new Error(`API error: ${response.status} ${response.statusText}`)
      }

      // Try to parse the response as JSON
      let data
      try {
        data = await response.json()
        console.log("API Response:", data) // Debug: Log raw API data
      } catch (jsonError) {
        console.error("Failed to parse response as JSON:", jsonError)
        throw new Error("Invalid response format from server")
      }

      // Parse price to ensure it's a number
      data = data.map((product: Product) => ({
        ...product,
        price: typeof product.price === "string" ? parseFloat(product.price) : product.price,
      }))

      setProducts(data)
      console.log("Products State (API):", data) // Debug: Log processed products
    } catch (err) {
      console.error("Error fetching products:", err)

      // Use fallback data
      setProducts(fallbackProducts)
      console.log("Products State (Fallback):", fallbackProducts) // Debug: Log fallback products
      setDemoMode(true)
      setError("Unable to connect to the database. Using demo data instead.")

      toast.error("Using demo mode due to connection issues")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Product Catalog</h1>
        <Button asChild>
          <Link href="/orders/new">Place Bulk Order</Link>
        </Button>
      </div>

      {demoMode && (
        <div className="mb-6 rounded-md bg-yellow-50 p-4 dark:bg-yellow-900/20">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-yellow-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Demo Mode Active</h3>
              <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                <p>{error || "The application is running in demo mode with sample data."}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {products.length === 0 ? (
        <div className="rounded-lg border p-8 text-center">
          <h2 className="mb-2 text-xl font-semibold">No Products Available</h2>
          <p className="text-muted-foreground">Check back later for our fresh produce selection.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <div className="aspect-square w-full bg-muted">
                {product.image_url ? (
                  <img
                    src={product.image_url || "/placeholder.svg"}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-muted text-muted-foreground">No Image</div>
                )}
              </div>
              <CardHeader>
                <CardTitle>{product.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">${product.price.toFixed(2)}/kg</p>
                {product.description && <p className="mt-2 text-sm text-muted-foreground">{product.description}</p>}
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href={`/orders/new?product=${product.id}`}>Add to Order</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
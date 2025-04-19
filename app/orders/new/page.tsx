"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Minus, Plus, ShoppingCart, Trash2, AlertCircle } from "lucide-react"
import { toast } from "sonner"

interface Product {
  id: number
  name: string
  price: number
}

interface OrderItem {
  product_id: number
  product_name: string
  price: number
  quantity: number
}

// Fallback products to use when API fails
const fallbackProducts = [
  {
    id: 1,
    name: "Apples (Demo)",
    price: 2.99,
  },
  {
    id: 2,
    name: "Bananas (Demo)",
    price: 1.49,
  },
  {
    id: 3,
    name: "Carrots (Demo)",
    price: 1.99,
  },
]

export default function NewOrderPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedProductId = searchParams.get("product")

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [buyerName, setBuyerName] = useState("")
  const [contactInfo, setContactInfo] = useState("")
  const [deliveryAddress, setDeliveryAddress] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [demoMode, setDemoMode] = useState(false)

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true)
        setError(null)

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
        } catch (jsonError) {
          console.error("Failed to parse response as JSON:", jsonError)
          throw new Error("Invalid response format from server")
        }

        setProducts(data)

        // If a product was preselected, add it to the order
        if (preselectedProductId) {
          const selectedProduct = data.find((p: Product) => p.id.toString() === preselectedProductId)
          if (selectedProduct) {
            addProductToOrder(selectedProduct)
          }
        }
      } catch (err) {
        console.error("Error fetching products:", err)
        setError("Failed to load products from database. Using demo data.")

        // Use fallback data
        setProducts(fallbackProducts)
        setDemoMode(true)

        // If a product was preselected, try to add it from fallback data
        if (preselectedProductId) {
          const selectedProduct = fallbackProducts.find((p) => p.id.toString() === preselectedProductId)
          if (selectedProduct) {
            addProductToOrder(selectedProduct)
          }
        }

        toast.error("Using demo mode due to connection issues")
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [preselectedProductId])

  const addProductToOrder = (product: Product) => {
    // Check if product is already in the order
    const existingItemIndex = orderItems.findIndex((item) => item.product_id === product.id)

    if (existingItemIndex >= 0) {
      // Update quantity if product already exists
      const updatedItems = [...orderItems]
      updatedItems[existingItemIndex].quantity += 1
      setOrderItems(updatedItems)
    } else {
      // Add new product to order
      setOrderItems([
        ...orderItems,
        {
          product_id: product.id,
          product_name: product.name,
          price: product.price,
          quantity: 1,
        },
      ])
    }

    toast.success(`Added ${product.name} to your order`)
  }

  const updateItemQuantity = (index: number, newQuantity: number) => {
    if (newQuantity < 1) return

    const updatedItems = [...orderItems]
    updatedItems[index].quantity = newQuantity
    setOrderItems(updatedItems)
  }

  const removeItem = (index: number) => {
    const itemName = orderItems[index].product_name
    setOrderItems(orderItems.filter((_, i) => i !== index))
    toast.info(`Removed ${itemName} from your order`)
  }

  const calculateTotal = () => {
    return orderItems.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const handleSubmitOrder = async () => {
    // Validate form
    if (!buyerName.trim()) {
      toast.error("Please enter your name")
      return
    }
    if (!contactInfo.trim()) {
      toast.error("Please enter your contact information")
      return
    }
    if (!deliveryAddress.trim()) {
      toast.error("Please enter your delivery address")
      return
    }
    if (orderItems.length === 0) {
      toast.error("Please add at least one product to your order")
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          buyer_name: buyerName,
          contact_info: contactInfo,
          delivery_address: deliveryAddress,
          items: orderItems,
        }),
      })

      // Check if response is OK before trying to parse JSON
      if (!response.ok) {
        console.error("API returned error status:", response.status, response.statusText)

        // Try to get error details if available
        let errorData
        try {
          errorData = await response.json()
          throw new Error(errorData.error || `Failed to create order: ${response.status}`)
        } catch (jsonError) {
          throw new Error(`Failed to create order: ${response.status}`)
        }
      }

      // Try to parse the response as JSON
      let data
      try {
        data = await response.json()
      } catch (jsonError) {
        console.error("Failed to parse response as JSON:", jsonError)
        throw new Error("Invalid response format from server")
      }

      toast.success("Order placed successfully!")
      router.push(`/orders/track?id=${data.order_id}`)
    } catch (error) {
      console.error("Error submitting order:", error)

      if (demoMode) {
        // In demo mode, simulate a successful order
        const mockOrderId = Math.floor(Math.random() * 1000) + 10
        toast.success("Demo order placed successfully!")
        router.push(`/orders/track?id=${mockOrderId}`)
      } else {
        toast.error(error instanceof Error ? error.message : "Failed to place order. Please try again.")
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold">Place Bulk Order</h1>

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

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Your Information</CardTitle>
              <CardDescription>Please provide your details for delivery</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contact">Contact Information</Label>
                <Input
                  id="contact"
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                  placeholder="Phone number or email"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">Delivery Address</Label>
                <Textarea
                  id="address"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Enter your complete delivery address"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <div className="mt-8">
            <h2 className="mb-4 text-xl font-semibold">Select Products</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <Card key={product.id} className="flex flex-col">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="font-bold">${product.price.toFixed(2)}/kg</p>
                  </CardContent>
                  <div className="mt-auto p-4 pt-0">
                    <Button onClick={() => addProductToOrder(product)} className="w-full" variant="secondary">
                      Add to Order
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <div>
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShoppingCart className="mr-2 h-5 w-5" />
                Your Order
              </CardTitle>
              <CardDescription>
                {orderItems.length === 0
                  ? "No items added yet"
                  : `${orderItems.reduce((sum, item) => sum + item.quantity, 0)} items in your order`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {orderItems.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <p>Your order is empty</p>
                  <p className="text-sm">Add some products to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orderItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-medium">{item.product_name}</p>
                        <p className="text-sm text-muted-foreground">
                          ${item.price.toFixed(2)} × {item.quantity}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateItemQuantity(index, item.quantity - 1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateItemQuantity(index, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => removeItem(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  <div className="mt-6 border-t pt-4">
                    <div className="flex justify-between font-bold">
                      <span>Total:</span>
                      <span>${calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}

              <Button
                className="mt-6 w-full"
                size="lg"
                disabled={orderItems.length === 0 || submitting}
                onClick={handleSubmitOrder}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                  </>
                ) : (
                  "Place Order"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

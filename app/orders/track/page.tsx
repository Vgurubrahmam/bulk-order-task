
"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

interface OrderItem {
  id: number
  product_id: number
  product_name: string
  price: number
  quantity: number
}

interface Order {
  id: number
  buyer_name: string
  contact_info: string
  delivery_address: string
  status: "Pending" | "In Progress" | "Delivered"
  created_at: string
  items: OrderItem[]
}

export default function TrackOrderPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialOrderId = searchParams.get("id")

  const [orderId, setOrderId] = useState(initialOrderId || "")
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (initialOrderId) {
      fetchOrder(initialOrderId)
    }
  }, [initialOrderId])

  const fetchOrder = async (id: string) => {
    if (!id.trim()) {
      toast.error("Please enter an order ID")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/orders/${id}`)
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Order not found. Please check the order ID and try again.")
        }
        throw new Error("Failed to fetch order details")
      }

      const data = await response.json()
      console.log("API Response:", data) // Debug: Log raw API data

      // Parse price in items to ensure it's a number
      data.items = data.items.map((item: OrderItem) => ({
        ...item,
        price: typeof item.price === "string" ? parseFloat(item.price) : item.price,
      }))

      // Validate prices to avoid NaN
      const invalidItems = data.items.filter((item: OrderItem) => isNaN(item.price))
      if (invalidItems.length > 0) {
        console.error("Invalid prices found in items:", invalidItems)
        throw new Error("Some order items have invalid prices")
      }

      setOrder(data)
      console.log("Order State:", data) // Debug: Log processed order

      // Update URL with order ID for sharing
      if (id !== initialOrderId) {
        router.push(`/orders/track?id=${id}`, { scroll: false })
      }
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
      setOrder(null)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-500"
      case "In Progress":
        return "bg-blue-500"
      case "Delivered":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const calculateTotal = (items: OrderItem[]) => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold">Track Your Order</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Enter Order ID</CardTitle>
          <CardDescription>Enter your order ID to check the current status of your order</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="order-id" className="sr-only">
                Order ID
              </Label>
              <Input
                id="order-id"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="Enter your order ID"
              />
            </div>
            <Button onClick={() => fetchOrder(orderId)} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
              Track
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {error && !loading && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      )}

      {order && !loading && !error && (
        <Card>
          <CardHeader>
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <CardTitle>Order #{order.id}</CardTitle>
                <CardDescription>Placed on {formatDate(order.created_at)}</CardDescription>
              </div>
              <Badge className={`${getStatusColor(order.status)} px-3 py-1 text-white`}>{order.status}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="mb-2 font-semibold">Delivery Information</h3>
                <div className="rounded-lg border p-4">
                  <p className="font-medium">{order.buyer_name}</p>
                  <p className="text-sm text-muted-foreground">{order.contact_info}</p>
                  <p className="mt-2 text-sm">{order.delivery_address}</p>
                </div>
              </div>

              <div>
                <h3 className="mb-2 font-semibold">Order Status</h3>
                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={`h-3 w-3 rounded-full ${
                        ["Pending", "In Progress", "Delivered"].includes(order.status) ? "bg-green-500" : "bg-gray-300"
                      }`}
                    ></div>
                    <div className="flex-1">
                      <p className="font-medium">Order Received</p>
                      <p className="text-sm text-muted-foreground">Your order has been received</p>
                    </div>
                  </div>
                  <div className="my-2 ml-1.5 h-6 w-0.5 bg-gray-200"></div>
                  <div className="flex items-center gap-4">
                    <div
                      className={`h-3 w-3 rounded-full ${
                        ["In Progress", "Delivered"].includes(order.status) ? "bg-green-500" : "bg-gray-300"
                      }`}
                    ></div>
                    <div className="flex-1">
                      <p className="font-medium">Processing</p>
                      <p className="text-sm text-muted-foreground">Your order is being prepared for delivery</p>
                    </div>
                  </div>
                  <div className="my-2 ml-1.5 h-6 w-0.5 bg-gray-200"></div>
                  <div className="flex items-center gap-4">
                    <div
                      className={`h-3 w-3 rounded-full ${
                        order.status === "Delivered" ? "bg-green-500" : "bg-gray-300"
                      }`}
                    ></div>
                    <div className="flex-1">
                      <p className="font-medium">Delivered</p>
                      <p className="text-sm text-muted-foreground">Your order has been delivered</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            <h3 className="mb-4 font-semibold">Order Items</h3>
            <div className="rounded-lg border">
              <div className="grid grid-cols-12 gap-4 p-4 font-medium text-muted-foreground">
                <div className="col-span-6">Product</div>
                <div className="col-span-2 text-right">Price</div>
                <div className="col-span-2 text-right">Quantity</div>
                <div className="col-span-2 text-right">Total</div>
              </div>
              <Separator />
              {order.items.map((item) => (
                <div key={item.id} className="grid grid-cols-12 gap-4 p-4">
                  <div className="col-span-6">
                    <p className="font-medium">{item.product_name}</p>
                  </div>
                  <div className="col-span-2 text-right">${item.price.toFixed(2)}</div>
                  <div className="col-span-2 text-right">{item.quantity}</div>
                  <div className="col-span-2 text-right font-medium">${(item.price * item.quantity).toFixed(2)}</div>
                </div>
              ))}
              <Separator />
              <div className="grid grid-cols-12 gap-4 p-4">
                <div className="col-span-10 text-right font-bold">Order Total:</div>
                <div className="col-span-2 text-right font-bold">${calculateTotal(order.items).toFixed(2)}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Loader2, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface OrderItem {
  id: number
  product_id: number
  product_name: string
  price: number | string
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

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap params using React.use()
  const { id } = use(params)
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchOrder()
  }, [id]) // Add id as dependency

  const fetchOrder = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/orders/${id}`)
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Order not found")
        }
        throw new Error("Failed to fetch order details")
      }

      const data = await response.json()
      setOrder(data)
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (newStatus: string) => {
    if (!order) return

    setUpdating(true)
    try {
      const response = await fetch(`/api/orders/${order.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error("Failed to update order status")
      }

      const updatedOrder = await response.json()
      setOrder({ ...order, status: updatedOrder.status })
      toast.success(`Order status updated to ${updatedOrder.status}`)
    } catch (error) {
      console.error("Error updating order status:", error)
      toast.error("Failed to update order status")
    } finally {
      setUpdating(false)
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
    return items.reduce((total, item) => total + (typeof item.price === "string" ? parseFloat(item.price) : item.price) * item.quantity, 0)
  }

  if (loading) {
    return (
      <div className="container mx-auto flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Button variant="ghost" className="mb-6" onClick={() => router.push("/admin")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <Button className="mt-4" onClick={() => router.push("/admin")}>
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!order) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <Button variant="ghost" className="mb-6" onClick={() => router.push("/admin")}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>

      <Card>
        <CardHeader>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <CardTitle>Order #{order.id}</CardTitle>
              <CardDescription>Placed on {formatDate(order.created_at)}</CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <Badge className={`${getStatusColor(order.status)} px-3 py-1 text-white`}>{order.status}</Badge>
              <Select defaultValue={order.status} onValueChange={updateOrderStatus} disabled={updating}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Update status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="mb-2 font-semibold">Customer Information</h3>
              <div className="rounded-lg border p-4">
                <p className="font-medium">{order.buyer_name}</p>
                <p className="text-sm text-muted-foreground">{order.contact_info}</p>
              </div>
            </div>

            <div>
              <h3 className="mb-2 font-semibold">Delivery Address</h3>
              <div className="rounded-lg border p-4">
                <p>{order.delivery_address}</p>
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
            {order.items.map((item) => {
              const price= typeof item.price==="string"? parseFloat(item.price):item.price
              return (
              <div key={item.id} className="grid grid-cols-12 gap-4 p-4">
                <div className="col-span-6">
                  <p className="font-medium">{item.product_name}</p>
                </div>
                <div className="col-span-2 text-right">${price.toFixed(2)}</div>
                <div className="col-span-2 text-right">{item.quantity}</div>
                <div className="col-span-2 text-right font-medium">${(price * item.quantity).toFixed(2)}</div>
              </div>
              )
})}
            <Separator />
            <div className="grid grid-cols-12 gap-4 p-4">
              <div className="col-span-10 text-right font-bold">Order Total:</div>
              <div className="col-span-2 text-right font-bold">${calculateTotal(order.items).toFixed(2)}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
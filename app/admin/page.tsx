"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Loader2, Package, ShoppingCart, AlertCircle } from "lucide-react"
import { fallbackProducts, fallbackOrders } from "@/lib/fallback-data"

interface Order {
  id: number
  buyer_name: string
  contact_info: string
  status: string
  created_at: string
}

interface Product {
  id: number
  name: string
  price: number
}

export default function AdminPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("orders")
  const [demoMode, setDemoMode] = useState(false)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError(null)

      try {
        // Fetch orders
        try {
          const ordersResponse = await fetch("/api/orders")
          const ordersData = await ordersResponse.json()
          setOrders(ordersData)
        } catch (orderError) {
          console.error("Error fetching orders:", orderError)
          setOrders(fallbackOrders)
          setDemoMode(true)
        }

        // Fetch products
        try {
          const productsResponse = await fetch("/api/products")
          const productsData = await productsResponse.json()
          setProducts(productsData)
        } catch (productError) {
          console.error("Error fetching products:", productError)
          setProducts(fallbackProducts)
          setDemoMode(true)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        setError("Failed to load data. Using demo mode.")
        setDemoMode(true)

        // Use fallback data
        setOrders(fallbackOrders)
        setProducts(fallbackProducts)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

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
      month: "short",
      day: "numeric",
    })
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage orders and inventory</p>
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
                <p>
                  The application is running in demo mode due to database connection issues. Some features may be
                  limited.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <Tabs defaultValue="orders" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-8">
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Orders
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Products
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Order Management</h2>
          </div>

          {orders.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="mb-4 text-lg font-medium">No orders found</p>
                <p className="text-muted-foreground">Orders will appear here once customers place them</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {orders.map((order) => (
                <Card key={order.id}>
                  <CardHeader className="pb-2">
                    <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                      <div>
                        <CardTitle>Order #{order.id}</CardTitle>
                        <CardDescription>Placed on {formatDate(order.created_at)}</CardDescription>
                      </div>
                      <Badge className={`${getStatusColor(order.status)} px-3 py-1 text-white`}>{order.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <p className="font-medium">{order.buyer_name}</p>
                      <p className="text-sm text-muted-foreground">{order.contact_info}</p>
                    </div>
                    <Button asChild>
                      <Link href={`/admin/orders/${order.id}`}>Manage Order</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="products">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Product Management</h2>
            <Button asChild>
              <Link href="/admin/products/new">Add New Product</Link>
            </Button>
          </div>

          {products.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="mb-4 text-lg font-medium">No products found</p>
                <p className="mb-6 text-muted-foreground">Add products to your catalog to start accepting orders</p>
                <Button asChild>
                  <Link href="/admin/products/new">Add First Product</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="rounded-lg border">
              <div className="grid grid-cols-12 gap-4 p-4 font-medium text-muted-foreground">
                <div className="col-span-1">ID</div>
                <div className="col-span-5">Name</div>
                <div className="col-span-2 text-right">Price</div>
                <div className="col-span-4 text-right">Actions</div>
              </div>
              {products.map((product) => (
                <div key={product.id} className="grid grid-cols-12 gap-4 border-t p-4 items-center">
                  <div className="col-span-1">{product.id}</div>
                  <div className="col-span-5 font-medium">{product.name}</div>
                  <div className="col-span-2 text-right">${product.price}</div>
                  <div className="col-span-4 flex justify-end gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/products/${product.id}`}>Edit</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

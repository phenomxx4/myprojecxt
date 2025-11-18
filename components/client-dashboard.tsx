"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Package, FileText, Loader2, Truck, MapPin, DollarSign, Download } from "lucide-react"
import type { Order } from "@/lib/types"

interface ClientDashboardProps {
  userId: string
  userEmail: string
}

export function ClientDashboard({ userId, userEmail }: ClientDashboardProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchOrders()
  }, [userId])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/users/${userId}/orders`)
      const data = await response.json()
      setOrders(data.orders || [])
    } catch (err) {
      setError("Failed to fetch orders")
    } finally {
      setLoading(false)
    }
  }

  const downloadLabel = async (orderId: string, filename: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/download-label`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename || "shipping-label.pdf"
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error("[v0] Failed to download label:", err)
    }
  }

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: "default" | "secondary" | "outline"; label: string }> = {
      pending: { variant: "secondary", label: "Pending" },
      paid: { variant: "default", label: "Paid" },
      label_ready: { variant: "default", label: "Label Ready" },
      shipped: { variant: "outline", label: "Shipped" },
      delivered: { variant: "default", label: "Delivered" },
    }

    const { variant, label } = config[status] || { variant: "secondary", label: status }

    return (
      <Badge variant={variant} className="capitalize">
        {label}
      </Badge>
    )
  }

  const getStatusProgress = (status: string) => {
    const steps = ["pending", "paid", "label_ready", "shipped", "delivered"]
    const currentIndex = steps.indexOf(status)
    return ((currentIndex + 1) / steps.length) * 100
  }

  const activeOrders = orders.filter((o) => o.status !== "delivered")
  const completedOrders = orders.filter((o) => o.status === "delivered")
  const totalSpent = orders.reduce((sum, o) => sum + Number(o.shipping_price), 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Orders</p>
                  <p className="text-2xl font-bold">{activeOrders.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Truck className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">{completedOrders.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                  <p className="text-2xl font-bold">${totalSpent.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="active" className="space-y-4">
          <TabsList>
            <TabsTrigger value="active">
              <Package className="h-4 w-4 mr-2" />
              Active Orders ({activeOrders.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              <FileText className="h-4 w-4 mr-2" />
              Completed ({completedOrders.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-accent" />
              </div>
            ) : activeOrders.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No active orders</p>
                </CardContent>
              </Card>
            ) : (
              activeOrders.map((order) => (
                <Card key={order.id} className="shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg font-mono">{order.order_number}</CardTitle>
                        <CardDescription>Ordered on {new Date(order.created_at).toLocaleDateString()}</CardDescription>
                      </div>
                      {getStatusBadge(order.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Order Progress</span>
                        <span className="capitalize">{order.status}</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="bg-accent h-2 rounded-full transition-all"
                          style={{ width: `${getStatusProgress(order.status)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Pending</span>
                        <span>Paid</span>
                        <span>Shipped</span>
                        <span>Delivered</span>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div className="text-sm">
                            <p className="font-medium">Route</p>
                            <p className="text-muted-foreground">
                              {order.from_country} ({order.from_zip}) → {order.to_country} ({order.to_zip})
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <Truck className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div className="text-sm">
                            <p className="font-medium">Courier</p>
                            <p className="text-muted-foreground">{order.courier_name}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <Package className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div className="text-sm">
                            <p className="font-medium">Package</p>
                            <p className="text-muted-foreground">
                              {order.weight}kg • {order.length}×{order.width}×{order.height}cm
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div className="text-sm">
                            <p className="font-medium">Price</p>
                            <p className="text-accent font-semibold text-lg">${order.shipping_price}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {(order as any).shipping_label_data && (
                      <div className="pt-4 border-t">
                        <Alert className="bg-green-50 border-green-200">
                          <FileText className="h-4 w-4 text-green-600" />
                          <AlertDescription className="flex items-center justify-between">
                            <span className="text-green-800 font-medium">Your shipping label is ready!</span>
                            <Button
                              size="sm"
                              onClick={() => downloadLabel(order.id, (order as any).shipping_label_filename)}
                              className="ml-4"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download Label
                            </Button>
                          </AlertDescription>
                        </Alert>
                      </div>
                    )}

                    {order.tracking_number && (
                      <div className="pt-4 border-t">
                        <div className="bg-accent/10 p-3 rounded-lg">
                          <p className="text-sm font-medium text-foreground mb-1">Tracking Number</p>
                          <p className="font-mono text-sm text-accent">{order.tracking_number}</p>
                        </div>
                      </div>
                    )}

                    {order.shipping_label_url && (
                      <div className="pt-2">
                        <a
                          href={order.shipping_label_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                        >
                          <FileText className="h-4 w-4" />
                          View Shipping Label
                        </a>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-accent" />
              </div>
            ) : completedOrders.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No completed orders yet</p>
                </CardContent>
              </Card>
            ) : (
              completedOrders.map((order) => (
                <Card key={order.id} className="shadow-md">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg font-mono">{order.order_number}</CardTitle>
                        <CardDescription>
                          Delivered on {order.delivered_at ? new Date(order.delivered_at).toLocaleDateString() : "N/A"}
                        </CardDescription>
                      </div>
                      {getStatusBadge(order.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Route</p>
                        <p className="font-medium">
                          {order.from_country} → {order.to_country}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Courier</p>
                        <p className="font-medium">{order.courier_name}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Price</p>
                        <p className="font-semibold text-accent">${order.shipping_price}</p>
                      </div>
                    </div>

                    {order.tracking_number && (
                      <div className="pt-3 border-t">
                        <p className="text-sm text-muted-foreground">Tracking: {order.tracking_number}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

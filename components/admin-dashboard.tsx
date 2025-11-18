"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Settings, Package, Truck, AlertCircle, CheckCircle, Loader2, FileText, Users, Upload } from "lucide-react"
import type { Order } from "@/lib/types"

interface User {
  id: string
  email: string
  full_name: string
  created_at: string
  order_count: number
}

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("orders")
  const [orders, setOrders] = useState<Order[]>([])
  const [couriers, setCouriers] = useState<any[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [userOrders, setUserOrders] = useState<Order[]>([])
  const [abandonedCheckouts, setAbandonedCheckouts] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [trackingNumber, setTrackingNumber] = useState("")
  const [shippingLabelUrl, setShippingLabelUrl] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [labelFile, setLabelFile] = useState<File | null>(null)
  const [isUploadingLabel, setIsUploadingLabel] = useState(false)

  useEffect(() => {
    fetchOrders()
    fetchCouriers()
    fetchUsers()
    fetchAbandonedCheckouts()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/orders")
      const data = await response.json()
      setOrders(data.orders || [])
    } catch (err) {
      setError("Failed to fetch orders")
    } finally {
      setLoading(false)
    }
  }

  const fetchCouriers = async () => {
    try {
      const response = await fetch("/api/admin/couriers")
      const data = await response.json()
      setCouriers(data.couriers || [])
    } catch (err) {
      setError("Failed to fetch couriers")
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users")
      const data = await response.json()
      setUsers(data.users || [])
    } catch (err) {
      setError("Failed to fetch users")
    }
  }

  const fetchAbandonedCheckouts = async () => {
    try {
      const response = await fetch("/api/admin/abandoned-checkouts")
      const data = await response.json()
      setAbandonedCheckouts(data.abandonedOrders || [])
    } catch (err) {
      console.error("[v0] Failed to fetch abandoned checkouts:", err)
    }
  }

  const fetchUserOrders = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/orders`)
      const data = await response.json()
      setUserOrders(data.orders || [])
    } catch (err) {
      setError("Failed to fetch user orders")
    }
  }

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      setIsUpdating(true)
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          tracking_number: trackingNumber || undefined,
          shipping_label_url: shippingLabelUrl || undefined,
        }),
      })

      if (response.ok) {
        await fetchOrders()
        setSelectedOrder(null)
        setTrackingNumber("")
        setShippingLabelUrl("")
      }
    } catch (err) {
      setError("Failed to update order")
    } finally {
      setIsUpdating(false)
    }
  }

  const updatePriceAdjustment = async (courierId: string, percentage: number) => {
    try {
      const response = await fetch(`/api/admin/shipping-settings/${courierId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price_adjustment_percentage: percentage }),
      })

      if (response.ok) {
        await fetchCouriers()
      }
    } catch (err) {
      setError("Failed to update price adjustment")
    }
  }

  const uploadLabel = async (orderId: string) => {
    if (!labelFile) return

    try {
      setIsUploadingLabel(true)
      const formData = new FormData()
      formData.append("label", labelFile)

      const response = await fetch(`/api/orders/${orderId}/upload-label`, {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        await fetchOrders()
        setSelectedOrder(null)
        setLabelFile(null)
        setError("")
      } else {
        setError("Failed to upload label")
      }
    } catch (err) {
      setError("Failed to upload label")
    } finally {
      setIsUploadingLabel(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "secondary",
      paid: "default",
      shipped: "outline",
      delivered: "default",
    }

    return (
      <Badge variant={variants[status] || "secondary"} className="capitalize">
        {status}
      </Badge>
    )
  }

  const getPaymentStatusBadge = (status: string) => {
    return status === "completed" ? (
      <Badge variant="default" className="bg-green-600">
        <CheckCircle className="h-3 w-3 mr-1" />
        Paid
      </Badge>
    ) : (
      <Badge variant="secondary">Pending</Badge>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage orders, couriers, and shipping settings</p>
          </div>
          <Settings className="h-8 w-8 text-accent" />
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="orders">
              <Package className="h-4 w-4 mr-2" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="abandoned">
              <AlertCircle className="h-4 w-4 mr-2" />
              Abandoned ({abandonedCheckouts.length})
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="couriers">
              <Truck className="h-4 w-4 mr-2" />
              Couriers
            </TabsTrigger>
            <TabsTrigger value="pricing">
              <Settings className="h-4 w-4 mr-2" />
              Pricing
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Order Management</CardTitle>
                <CardDescription>View and manage all shipping orders</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-accent" />
                  </div>
                ) : orders.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No orders found</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order #</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Route</TableHead>
                          <TableHead>Courier</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Payment</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-mono text-sm">{order.order_number}</TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div className="font-medium">{order.customer_name}</div>
                                <div className="text-muted-foreground">{order.customer_email}</div>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm">
                              {order.from_country} → {order.to_country}
                            </TableCell>
                            <TableCell className="text-sm">{order.courier_name}</TableCell>
                            <TableCell className="font-semibold">${order.shipping_price}</TableCell>
                            <TableCell>{getPaymentStatusBadge(order.payment_status)}</TableCell>
                            <TableCell>{getStatusBadge(order.status)}</TableCell>
                            <TableCell>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedOrder(order)
                                      setTrackingNumber(order.tracking_number || "")
                                      setShippingLabelUrl(order.shipping_label_url || "")
                                      setLabelFile(null)
                                    }}
                                  >
                                    <FileText className="h-4 w-4 mr-1" />
                                    Manage
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>Manage Order</DialogTitle>
                                    <DialogDescription>Update order status and upload shipping label</DialogDescription>
                                  </DialogHeader>
                                  {selectedOrder && (
                                    <div className="space-y-4">
                                      <div className="space-y-2">
                                        <Label>Order Number</Label>
                                        <Input value={selectedOrder.order_number} disabled />
                                      </div>

                                      <div className="space-y-2 p-4 border rounded-lg bg-secondary/20">
                                        <Label className="text-base font-semibold">Upload Shipping Label</Label>
                                        <p className="text-sm text-muted-foreground">
                                          Upload the shipping label PDF. Customer will receive it via email and can view
                                          it in their dashboard.
                                        </p>
                                        <Input
                                          type="file"
                                          accept=".pdf,.png,.jpg,.jpeg"
                                          onChange={(e) => setLabelFile(e.target.files?.[0] || null)}
                                        />
                                        {labelFile && (
                                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <FileText className="h-4 w-4" />
                                            {labelFile.name}
                                          </div>
                                        )}
                                        <Button
                                          onClick={() => uploadLabel(selectedOrder.id)}
                                          disabled={!labelFile || isUploadingLabel}
                                          className="w-full"
                                        >
                                          {isUploadingLabel ? (
                                            <>
                                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                              Uploading...
                                            </>
                                          ) : (
                                            <>
                                              <Upload className="h-4 w-4 mr-2" />
                                              Upload Label & Notify Customer
                                            </>
                                          )}
                                        </Button>
                                      </div>

                                      <div className="space-y-2">
                                        <Label>Tracking Number</Label>
                                        <Input
                                          placeholder="Enter tracking number"
                                          value={trackingNumber}
                                          onChange={(e) => setTrackingNumber(e.target.value)}
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label>Shipping Label URL (Optional)</Label>
                                        <Input
                                          placeholder="Enter shipping label URL"
                                          value={shippingLabelUrl}
                                          onChange={(e) => setShippingLabelUrl(e.target.value)}
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label>Update Status</Label>
                                        <div className="flex gap-2">
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => updateOrderStatus(selectedOrder.id, "shipped")}
                                            disabled={isUpdating || selectedOrder.status === "shipped"}
                                          >
                                            Mark as Shipped
                                          </Button>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => updateOrderStatus(selectedOrder.id, "delivered")}
                                            disabled={isUpdating || selectedOrder.status === "delivered"}
                                          >
                                            Mark as Delivered
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </DialogContent>
                              </Dialog>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="abandoned" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Abandoned Checkouts</CardTitle>
                <CardDescription>
                  Users who started checkout but didn't complete payment (older than 24 hours)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-accent" />
                  </div>
                ) : abandonedCheckouts.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="h-12 w-12 mx-auto text-green-600 mb-4" />
                    <p className="text-muted-foreground">No abandoned checkouts</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order #</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Route</TableHead>
                          <TableHead>Courier</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Started</TableHead>
                          <TableHead>Time Elapsed</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {abandonedCheckouts.map((order) => {
                          const hoursElapsed = Math.floor(
                            (Date.now() - new Date(order.created_at).getTime()) / (1000 * 60 * 60),
                          )
                          return (
                            <TableRow key={order.id}>
                              <TableCell className="font-mono text-sm">{order.order_number}</TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  <div className="font-medium">{order.customer_name}</div>
                                  <div className="text-muted-foreground">{order.customer_email}</div>
                                </div>
                              </TableCell>
                              <TableCell className="text-sm">
                                {order.from_country} → {order.to_country}
                              </TableCell>
                              <TableCell className="text-sm">{order.courier_name}</TableCell>
                              <TableCell className="font-semibold">${order.shipping_price}</TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {new Date(order.created_at).toLocaleString()}
                              </TableCell>
                              <TableCell>
                                <Badge variant="destructive">{hoursElapsed}h ago</Badge>
                              </TableCell>
                              <TableCell>
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)}>
                                      <FileText className="h-4 w-4 mr-1" />
                                      View Details
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-2xl">
                                    <DialogHeader>
                                      <DialogTitle>Abandoned Checkout Details</DialogTitle>
                                      <DialogDescription>Order information for recovery</DialogDescription>
                                    </DialogHeader>
                                    {selectedOrder && (
                                      <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                          <div className="space-y-2">
                                            <Label className="text-muted-foreground">Order Number</Label>
                                            <p className="font-mono font-semibold">{selectedOrder.order_number}</p>
                                          </div>
                                          <div className="space-y-2">
                                            <Label className="text-muted-foreground">Created</Label>
                                            <p>{new Date(selectedOrder.created_at).toLocaleString()}</p>
                                          </div>
                                        </div>

                                        <div className="space-y-2">
                                          <Label className="text-muted-foreground">Customer</Label>
                                          <div className="bg-secondary/30 p-3 rounded-lg">
                                            <p className="font-medium">{selectedOrder.customer_name}</p>
                                            <p className="text-sm text-muted-foreground">
                                              {selectedOrder.customer_email}
                                            </p>
                                            {selectedOrder.customer_phone && (
                                              <p className="text-sm text-muted-foreground">
                                                {selectedOrder.customer_phone}
                                              </p>
                                            )}
                                          </div>
                                        </div>

                                        <div className="space-y-2">
                                          <Label className="text-muted-foreground">Shipping Details</Label>
                                          <div className="bg-secondary/30 p-3 rounded-lg space-y-2">
                                            <div className="flex justify-between text-sm">
                                              <span>Route:</span>
                                              <span className="font-medium">
                                                {selectedOrder.from_country} ({selectedOrder.from_zip}) →{" "}
                                                {selectedOrder.to_country} ({selectedOrder.to_zip})
                                              </span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                              <span>Courier:</span>
                                              <span className="font-medium">{selectedOrder.courier_name}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                              <span>Package:</span>
                                              <span className="font-medium">
                                                {selectedOrder.weight}kg • {selectedOrder.length}×{selectedOrder.width}×
                                                {selectedOrder.height}cm
                                              </span>
                                            </div>
                                            <div className="flex justify-between text-sm pt-2 border-t">
                                              <span className="font-semibold">Price:</span>
                                              <span className="font-bold text-accent text-lg">
                                                ${selectedOrder.shipping_price}
                                              </span>
                                            </div>
                                          </div>
                                        </div>

                                        <Alert>
                                          <AlertCircle className="h-4 w-4" />
                                          <AlertDescription>
                                            Consider sending a reminder email to {selectedOrder.customer_email} to
                                            complete their order.
                                          </AlertDescription>
                                        </Alert>
                                      </div>
                                    )}
                                  </DialogContent>
                                </Dialog>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>View registered users and their orders</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-accent" />
                  </div>
                ) : users.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No users found</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Email</TableHead>
                          <TableHead>Full Name</TableHead>
                          <TableHead>Registered</TableHead>
                          <TableHead>Orders</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.email}</TableCell>
                            <TableCell>{user.full_name}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {new Date(user.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{user.order_count} orders</Badge>
                            </TableCell>
                            <TableCell>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedUser(user)
                                      fetchUserOrders(user.id)
                                    }}
                                  >
                                    View Orders
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle>User Orders</DialogTitle>
                                    <DialogDescription>Orders for {selectedUser?.email}</DialogDescription>
                                  </DialogHeader>
                                  {userOrders.length === 0 ? (
                                    <p className="text-center text-muted-foreground py-8">No orders found</p>
                                  ) : (
                                    <div className="space-y-3">
                                      {userOrders.map((order) => (
                                        <Card key={order.id} className="bg-secondary/30">
                                          <CardContent className="p-4">
                                            <div className="space-y-2">
                                              <div className="flex justify-between items-start">
                                                <div>
                                                  <div className="font-mono text-sm font-semibold">
                                                    {order.order_number}
                                                  </div>
                                                  <div className="text-sm text-muted-foreground">
                                                    {order.from_country} → {order.to_country}
                                                  </div>
                                                </div>
                                                <div className="text-right">
                                                  <div className="font-bold text-accent">${order.shipping_price}</div>
                                                  {getStatusBadge(order.status)}
                                                </div>
                                              </div>
                                              <div className="text-sm">
                                                <span className="text-muted-foreground">Courier:</span>{" "}
                                                {order.courier_name}
                                              </div>
                                              {order.tracking_number && (
                                                <div className="text-sm">
                                                  <span className="text-muted-foreground">Tracking:</span>{" "}
                                                  {order.tracking_number}
                                                </div>
                                              )}
                                            </div>
                                          </CardContent>
                                        </Card>
                                      ))}
                                    </div>
                                  )}
                                </DialogContent>
                              </Dialog>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="couriers" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Global Courier Filter</CardTitle>
                    <CardDescription>Control which couriers appear to customers based on keywords</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <GlobalCourierFilterForm />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pricing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Global Price Adjustment</CardTitle>
                <CardDescription>Apply a percentage adjustment to all shipping quotes shown to users</CardDescription>
              </CardHeader>
              <CardContent>
                <GlobalPriceAdjustmentForm />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function AddCourierForm({ onSuccess }: { onSuccess: () => void }) {
  const [name, setName] = useState("")
  const [code, setCode] = useState("")
  const [logoUrl, setLogoUrl] = useState("")
  const [domesticUSA, setDomesticUSA] = useState(false)
  const [domesticEU, setDomesticEU] = useState(false)
  const [international, setInternational] = useState(false)
  const [basePriceUSA, setBasePriceUSA] = useState("")
  const [basePriceEU, setBasePriceEU] = useState("")
  const [basePriceIntl, setBasePriceIntl] = useState("")
  const [pricePerKg, setPricePerKg] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/admin/couriers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          code,
          logo_url: logoUrl,
          available_for_domestic_usa: domesticUSA,
          available_for_domestic_eu: domesticEU,
          available_for_international: international,
          base_price_domestic_usa: Number.parseFloat(basePriceUSA) || 0,
          base_price_domestic_eu: Number.parseFloat(basePriceEU) || 0,
          base_price_international: Number.parseFloat(basePriceIntl) || 0,
          price_per_kg: Number.parseFloat(pricePerKg) || 0,
        }),
      })

      if (response.ok) {
        onSuccess()
      }
    } catch (err) {
      console.error("[v0] Failed to add courier:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Courier Name</Label>
        <Input placeholder="e.g., DHL Express" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label>Courier Code</Label>
        <Input placeholder="e.g., DHL_EXPRESS" value={code} onChange={(e) => setCode(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label>Logo URL (Optional)</Label>
        <Input placeholder="https://..." value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} />
      </div>
      <div className="space-y-3">
        <Label>Availability</Label>
        <div className="flex items-center gap-2">
          <Switch checked={domesticUSA} onCheckedChange={setDomesticUSA} />
          <span className="text-sm">USA Domestic</span>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={domesticEU} onCheckedChange={setDomesticEU} />
          <span className="text-sm">EU Domestic</span>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={international} onCheckedChange={setInternational} />
          <span className="text-sm">International</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Base Price USA ($)</Label>
          <Input
            type="number"
            step="0.01"
            placeholder="0.00"
            value={basePriceUSA}
            onChange={(e) => setBasePriceUSA(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Base Price EU ($)</Label>
          <Input
            type="number"
            step="0.01"
            placeholder="0.00"
            value={basePriceEU}
            onChange={(e) => setBasePriceEU(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Base Price Intl ($)</Label>
          <Input
            type="number"
            step="0.01"
            placeholder="0.00"
            value={basePriceIntl}
            onChange={(e) => setBasePriceIntl(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Price per KG ($)</Label>
          <Input
            type="number"
            step="0.01"
            placeholder="0.00"
            value={pricePerKg}
            onChange={(e) => setPricePerKg(e.target.value)}
          />
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add Courier"}
      </Button>
    </form>
  )
}

function GlobalCourierFilterForm() {
  const [positiveKeywords, setPositiveKeywords] = useState("fedex, Connect")
  const [negativeKeywords, setNegativeKeywords] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    fetchFilters()
  }, [])

  const fetchFilters = async () => {
    try {
      const response = await fetch("/api/admin/courier-filters")
      const data = await response.json()

      if (data.positiveKeywords) {
        setPositiveKeywords(
          Array.isArray(data.positiveKeywords) ? data.positiveKeywords.join(", ") : data.positiveKeywords,
        )
      }
      if (data.negativeKeywords) {
        setNegativeKeywords(
          Array.isArray(data.negativeKeywords) ? data.negativeKeywords.join(", ") : data.negativeKeywords,
        )
      }
    } catch (err) {
      console.error("[v0] Failed to fetch filters:", err)
    }
  }

  const handleUpdate = async () => {
    setIsUpdating(true)
    setMessage("")

    try {
      const response = await fetch("/api/admin/courier-filters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          positiveKeywords,
          negativeKeywords,
        }),
      })

      if (response.ok) {
        setMessage("Filters updated successfully!")
        setTimeout(() => setMessage(""), 3000)
      } else {
        setMessage("Failed to update filters")
      }
    } catch (err) {
      console.error("[v0] Failed to update filters:", err)
      setMessage("Failed to update filters")
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="space-y-4">
      <Alert>
        <AlertDescription>
          These filters apply to ALL shipping quotes shown to customers, including both Easyship results and fallback
          quotes.
        </AlertDescription>
      </Alert>

      <div className="space-y-2">
        <Label className="text-sm font-medium">
          Positive Keywords
          <span className="text-xs text-muted-foreground ml-2">(Show only if matches - leave empty to show all)</span>
        </Label>
        <Input
          placeholder="e.g., fedex, Connect, express"
          value={positiveKeywords}
          onChange={(e) => setPositiveKeywords(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Comma-separated. Only show quotes where courier name or service contains these words. Leave empty to show all
          couriers.
        </p>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">
          Negative Keywords
          <span className="text-xs text-muted-foreground ml-2">(Hide if matches)</span>
        </Label>
        <Input
          placeholder="e.g., international, economy, slow"
          value={negativeKeywords}
          onChange={(e) => setNegativeKeywords(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Comma-separated. Hide quotes where courier name or service contains these words.
        </p>
      </div>

      <Button onClick={handleUpdate} disabled={isUpdating} className="w-full">
        {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
        Update Global Filters
      </Button>

      {message && (
        <Alert variant={message.includes("success") ? "default" : "destructive"}>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      {positiveKeywords && (
        <Alert>
          <AlertDescription>
            <strong>Active:</strong> Only showing quotes matching: {positiveKeywords}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

function GlobalPriceAdjustmentForm() {
  const [priceAdjustment, setPriceAdjustment] = useState(0)
  const [adjustmentThreshold, setAdjustmentThreshold] = useState(0)
  const [minimumPrice, setMinimumPrice] = useState(0)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState("")

  useEffect(() => {
    const savedAdjustment = localStorage.getItem("adminPriceAdjustment")
    const savedThreshold = localStorage.getItem("adminAdjustmentThreshold")
    const savedMinPrice = localStorage.getItem("adminMinimumPrice")
    if (savedAdjustment) setPriceAdjustment(Number.parseFloat(savedAdjustment))
    if (savedThreshold) setAdjustmentThreshold(Number.parseFloat(savedThreshold))
    if (savedMinPrice) setMinimumPrice(Number.parseFloat(savedMinPrice))
  }, [])

  const handleSave = () => {
    setIsSaving(true)
    localStorage.setItem("adminPriceAdjustment", priceAdjustment.toString())
    localStorage.setItem("adminAdjustmentThreshold", adjustmentThreshold.toString())
    localStorage.setItem("adminMinimumPrice", minimumPrice.toString())
    setSaveMessage("Settings saved successfully!")
    setTimeout(() => {
      setIsSaving(false)
      setSaveMessage("")
    }, 2000)
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="global-price-adjustment">
          Price Adjustment (%)
          <span className="text-xs text-muted-foreground ml-2">Positive to increase, negative to decrease</span>
        </Label>
        <Input
          id="global-price-adjustment"
          type="number"
          step="0.1"
          placeholder="0"
          value={priceAdjustment}
          onChange={(e) => setPriceAdjustment(Number.parseFloat(e.target.value) || 0)}
        />
        <p className="text-xs text-muted-foreground">Example: Enter 10 for +10% increase, -15 for -15% decrease</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="global-adjustment-threshold">
          Apply Only to Shipments Below (USD)
          <span className="text-xs text-muted-foreground ml-2">0 = apply to all</span>
        </Label>
        <Input
          id="global-adjustment-threshold"
          type="number"
          step="1"
          min="0"
          placeholder="0"
          value={adjustmentThreshold}
          onChange={(e) => setAdjustmentThreshold(Number.parseFloat(e.target.value) || 0)}
        />
        <p className="text-xs text-muted-foreground">Example: Enter 20 to only adjust shipments under $20</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="minimum-price">
          Minimum Price Filter (USD)
          <span className="text-xs text-muted-foreground ml-2">Hide shipping options below this price</span>
        </Label>
        <Input
          id="minimum-price"
          type="number"
          step="1"
          min="0"
          placeholder="0"
          value={minimumPrice}
          onChange={(e) => setMinimumPrice(Number.parseFloat(e.target.value) || 0)}
        />
        <p className="text-xs text-muted-foreground">
          Example: Enter 20 to hide all shipping options under $20 from customers
        </p>
      </div>

      <Button onClick={handleSave} disabled={isSaving} className="w-full">
        {isSaving ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Saving...
          </>
        ) : (
          "Save Global Settings"
        )}
      </Button>

      {saveMessage && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{saveMessage}</AlertDescription>
        </Alert>
      )}

      {priceAdjustment !== 0 && (
        <Alert>
          <AlertDescription>
            Active: {priceAdjustment > 0 ? "+" : ""}
            {priceAdjustment}% adjustment
            {adjustmentThreshold > 0 && ` for shipments below $${adjustmentThreshold}`}
          </AlertDescription>
        </Alert>
      )}

      {minimumPrice > 0 && (
        <Alert>
          <AlertDescription>Active: Hiding shipping options below ${minimumPrice}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}

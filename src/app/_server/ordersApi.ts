import { Order, Status } from "@/models/types"

export async function getOrders() {
    const response = await fetch("/api/orders/")
    return (await response.json()) as Order[]
}

export async function getOrder(id: string) {
    const response = await fetch(`/api/orders/${id}`)
    return (await response.json()) as Order
}

export async function getOrdersByCourierId(id: string) {
    const response = await fetch(`/api/orders/courier/${id}`)
    return (await response.json()) as Order[]
}

export async function createOrder(order: Order) {
    const response = await fetch("/api/orders/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(order),
    })
    return response
}

export async function updateOrder(order: Order) {
    const response = await fetch(`/api/orders/${order.id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(order),
    })
    return response
}

export async function deleteOrder(id: string) {
    const response = await fetch(`/api/orders/${id}`, {
        method: "DELETE",
    })
    return response
}

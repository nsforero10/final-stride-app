import { Item } from "@/models/types"

export async function getItems() {
    const response = await fetch(`/api/items`, {
        method: "GET",
    })
    return (await response.json()) as Item[]
}

export async function getItem(id: string) {
    const response = await fetch(`/api/items/${id}`, {
        method: "GET",
    })
    return (await response.json()) as Item
}

export async function createItem(item: Item) {
    const response = await fetch(`/api/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
    })
    return response
}

export async function updateItem(item: Item) {
    const response = await fetch(`/api/items/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
    })
    return response
}

export async function deleteItem(id: string) {
    const response = await fetch(`/api/items/${id}`, {
        method: "DELETE",
    })
    return response
}

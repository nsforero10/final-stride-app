export enum Roles {
    Admin = "ADMIN",
    Manager = "MANAGER",
    Courer = "COURIER",
}
export enum Status {
    Created = "CRD",
    PickedUp = "PKU",
    OnTheWay = "OTW",
    Arriving = "ARG",
    Arrived = "AVD",
    Delivered = "DLD",
}

export type User = {
    id: string
    name: string
    email: string
    roles: Roles[]
    photoURL: string
}

export type Item = {
    id: string
    name: string
    quantity: number
}

export type Order = {
    id: string
    orderNumber: number
    courerId: string
    clientName: string
    location: { address: string; lat: number; lng: number }
    currentStatus: Status
    items: {
        itemId: string
        itemName: string
        amount: number
    }[]
    statusHistory: {
        status: Status
        date: Date
    }[]
}

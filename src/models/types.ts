export enum Roles {
    Admin = "ADMIN",
    Manager = "MANAGER",
    Courier = "COURIER",
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
    id?: string
    uid: string
    name: string
    email: string
    roles: Roles[]
    photoURL: string
    location: { lat: number; lng: number }
}

export type Item = {
    id?: string
    name: string
    quantity: number
}

export type Order = {
    id?: string
    orderNumber: number
    courierId?: string
    clientName: string
    location: { address: string; lat: number; lng: number }
    currentStatus: Status
    items: {
        id: string
        name: string
        quantity: number
    }[]
    statusHistory: {
        status: Status
        date: Date
    }[]
}

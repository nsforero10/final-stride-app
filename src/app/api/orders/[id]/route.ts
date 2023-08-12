import { collection, doc, setDoc, deleteDoc } from "firebase/firestore"
import { db } from "@/firebase/clientConfig"
import { NextRequest } from "next/server"
import { Order } from "@/models/types"
const ordersRef = collection(db, "orders")

export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const order = (await req.json()) as Order

        const orderRef = doc(ordersRef, params.id)
        await setDoc(orderRef, order)
    } catch (error: any) {
        return new Response(error)
    }
    return new Response(JSON.stringify(params.id))
}

export async function DELETE(
    _: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const orderRef = doc(ordersRef, params.id)
        await deleteDoc(orderRef)
    } catch (error: any) {
        return new Response(error)
    }
    return new Response(JSON.stringify(params.id))
}

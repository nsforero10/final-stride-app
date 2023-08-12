import { addDoc, collection, query, getDocs } from "firebase/firestore"
import { db } from "@/firebase/clientConfig"
import { NextRequest } from "next/server"
import { Order } from "@/models/types"

const ordersRef = collection(db, "orders")

export async function GET() {
    const response: Order[] = []
    try {
        const q = query(ordersRef)
        const querySnapshot = await getDocs(q)
        querySnapshot.forEach((doc) => {
            const order = doc.data() as Order
            order.id = doc.id
            response.push(order)
        })
    } catch (error: any) {
        return new Response(error)
    }
    return new Response(JSON.stringify(response))
}

export async function POST(req: NextRequest) {
    const newOrderRes = {} as Order
    try {
        const newOrder = (await req.json()) as Order
        const newOrderRes = await addDoc(ordersRef, newOrder)
    } catch (error: any) {
        return new Response(error)
    }
    return new Response(newOrderRes.id)
}

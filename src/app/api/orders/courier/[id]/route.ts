import { collection, query, getDocs, where } from "firebase/firestore"
import { db } from "@/firebase/clientConfig"
import { NextRequest } from "next/server"
import { Order } from "@/models/types"

const ordersRef = collection(db, "orders")

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const response: Order[] = []
    try {
        const q = query(ordersRef, where("userId", "==", params.id))
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

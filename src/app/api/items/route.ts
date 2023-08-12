import { addDoc, collection, query, getDocs } from "firebase/firestore"
import { db } from "@/firebase/clientConfig"
import { NextRequest } from "next/server"
import { Item } from "@/models/types"

const itemsRef = collection(db, "items")

export async function GET() {
    const response: Item[] = []
    try {
        const q = query(itemsRef)
        const querySnapshot = await getDocs(q)
        querySnapshot.forEach((doc) => {
            const item = doc.data() as Item
            item.id = doc.id
            response.push(item)
        })
    } catch (error: any) {
        return new Response(error)
    }
    return new Response(JSON.stringify(response))
}

export async function POST(req: NextRequest) {
    const newItemRes = {} as Item
    try {
        const newItem = (await req.json()) as Item
        const newItemRes = await addDoc(itemsRef, newItem)
    } catch (error: any) {
        return new Response(error)
    }
    return new Response(newItemRes.id)
}

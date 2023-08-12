import {
    collection,
    doc,
    setDoc,
    deleteDoc,
    query,
    where,
    getDocs,
} from "firebase/firestore"
import { db } from "@/firebase/clientConfig"
import { NextRequest } from "next/server"
import { Item } from "@/models/types"
const itemsRef = collection(db, "items")

export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const item = (await req.json()) as Item

        const itemRef = doc(itemsRef, params.id)
        await setDoc(itemRef, item)
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
        const itemRef = doc(itemsRef, params.id)
        await deleteDoc(itemRef)
    } catch (error: any) {
        return new Response(error)
    }
    return new Response(JSON.stringify(params.id))
}

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const response: Item[] = []
    try {
        const q = query(itemsRef, where("Id", "==", params.id))
        const querySnapshot = await getDocs(q)
        querySnapshot.forEach((doc) => {
            const habit = doc.data() as Item
            habit.id = doc.id
            response.push(habit)
        })
    } catch (error: any) {
        return new Response(error)
    }
    return new Response(JSON.stringify(response))
}

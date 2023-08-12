import {
    collection,
    doc,
    setDoc,
    deleteDoc,
    getDocs,
    where,
    query,
} from "firebase/firestore"
import { db } from "@/firebase/clientConfig"
import { NextRequest } from "next/server"
import { User } from "@/models/types"

const usersRef = collection(db, "users")

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    let user = null
    try {
        const q = query(usersRef, where("id", "==", params.id))
        const querySnapshot = await getDocs(q)
        user = querySnapshot.docs[0].data()
    } catch (error: any) {
        return new Response(error)
    }
    return new Response(JSON.stringify(user))
}

export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = (await req.json()) as User

        const userRef = doc(usersRef, params.id)
        await setDoc(userRef, user)
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
        const userRef = doc(usersRef, params.id)
        await deleteDoc(userRef)
    } catch (error: any) {
        return new Response(error)
    }
    return new Response(JSON.stringify(params.id))
}

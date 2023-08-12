import { addDoc, collection } from "firebase/firestore"
import { db } from "@/firebase/clientConfig"
import { NextRequest } from "next/server"
import { User } from "@/models/types"

const usersRef = collection(db, "users")

export async function POST(req: NextRequest) {
    let newUserRes = null
    try {
        const newUser = (await req.json()) as User
        newUserRes = await addDoc(usersRef, newUser)
    } catch (error: any) {
        return new Response(error)
    }
    return new Response(
        JSON.stringify({ message: "New user created", id: newUserRes.id })
    )
}

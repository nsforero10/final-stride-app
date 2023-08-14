import { addDoc, collection, query, where, getDocs } from "firebase/firestore"
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

export async function GET(req: NextRequest) {
    const role = req.nextUrl.searchParams.get("role")
    const response: User[] = []
    try {
        const q = query(usersRef, where("roles", "array-contains", role))
        const querySnapshot = await getDocs(q)
        querySnapshot.forEach((doc) => {
            const user = doc.data() as User
            user.id = doc.id
            response.push(user)
        })
    } catch (error: any) {
        return new Response(error)
    }
    return new Response(JSON.stringify(response))
}
